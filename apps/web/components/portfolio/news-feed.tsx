'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, ExternalLink, AlertCircle, CheckCircle2, MessageSquare, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsFeedProps {
  className?: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  url?: string;
  publishedAt: string;
  category: 'announcement' | 'rumor' | 'confirmed' | 'update';
  projectId?: string;
  projectName?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NewsData {
  items: NewsItem[];
  categories: {
    announcement: number;
    rumor: number;
    confirmed: number;
    update: number;
  };
  timestamp: number;
}

export function NewsFeed({ className = '' }: NewsFeedProps) {
  const [data, setData] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError(null);
      
      try {
        const url = selectedCategory !== 'all'
          ? `/api/news?category=${selectedCategory}&limit=20`
          : '/api/news?limit=20';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const newsData = await response.json();
        setData(newsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [selectedCategory]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>News Feed</CardTitle>
          <CardDescription>Error loading news</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'announcement':
        return <Bell className="h-4 w-4 text-blue-600" />;
      case 'rumor':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'update':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Newspaper className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'announcement':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'rumor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'update':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return dateObj.toLocaleDateString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Airdrop News Feed
        </CardTitle>
        <CardDescription>Latest airdrop news and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({data.categories.confirmed})
            </TabsTrigger>
            <TabsTrigger value="announcement">
              Announcements ({data.categories.announcement})
            </TabsTrigger>
            <TabsTrigger value="rumor">
              Rumors ({data.categories.rumor})
            </TabsTrigger>
            <TabsTrigger value="update">
              Updates ({data.categories.update})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4 mt-4">
            {data.items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No news items found
              </p>
            ) : (
              data.items.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      {getCategoryIcon(item.category)}
                      <span className="font-semibold">{item.title}</span>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      {item.priority === 'high' && (
                        <Badge className={getPriorityColor(item.priority)}>
                          HIGH PRIORITY
                        </Badge>
                      )}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{item.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {item.projectName && (
                      <span className="font-medium">{item.projectName}</span>
                    )}
                    <span>{item.source}</span>
                    <span>{formatDate(item.publishedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

