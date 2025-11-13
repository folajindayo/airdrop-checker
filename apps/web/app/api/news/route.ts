import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

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

// Mock news data - in production, this would come from a news API or database
const MOCK_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Zora Network Announces Airdrop Snapshot Date',
    content: 'Zora Network has officially announced that the snapshot for their upcoming airdrop will take place on March 15, 2024. Users who have minted NFTs or interacted with the protocol before this date will be eligible.',
    source: 'Zora Official',
    url: 'https://zora.co',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'confirmed',
    projectId: 'zora',
    projectName: 'Zora',
    priority: 'high',
  },
  {
    id: 'news-2',
    title: 'LayerZero Airdrop Rumors Intensify',
    content: 'Multiple sources suggest that LayerZero may be preparing for an airdrop announcement. Users are advised to interact with Stargate and other LayerZero protocols.',
    source: 'Crypto Twitter',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'rumor',
    projectId: 'layerzero',
    projectName: 'LayerZero',
    priority: 'medium',
  },
  {
    id: 'news-3',
    title: 'Starknet Airdrop Claim Window Opens',
    content: 'The Starknet airdrop claim window is now open. Eligible users can claim their tokens through the official portal.',
    source: 'Starknet Foundation',
    url: 'https://starknet.io',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'announcement',
    projectId: 'starknet',
    projectName: 'Starknet',
    priority: 'high',
  },
  {
    id: 'news-4',
    title: 'Base Network Airdrop Eligibility Criteria Updated',
    content: 'Base Network has updated their airdrop eligibility criteria to include more on-chain activity types. Check your eligibility now.',
    source: 'Base Official',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'update',
    projectId: 'base',
    projectName: 'Base',
    priority: 'medium',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '20');

    const cacheKey = `news:${category || 'all'}:${projectId || 'all'}:${limit}`;
    const cachedResult = cache.get<NewsData>(cacheKey);

    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
      });
    }

    let items = [...MOCK_NEWS];

    // Filter by category
    if (category) {
      items = items.filter((item) => item.category === category);
    }

    // Filter by project
    if (projectId) {
      items = items.filter((item) => item.projectId === projectId);
    }

    // Sort by date (newest first)
    items.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Limit results
    items = items.slice(0, limit);

    const categories = {
      announcement: items.filter((i) => i.category === 'announcement').length,
      rumor: items.filter((i) => i.category === 'rumor').length,
      confirmed: items.filter((i) => i.category === 'confirmed').length,
      update: items.filter((i) => i.category === 'update').length,
    };

    const result: NewsData = {
      items,
      categories,
      timestamp: Date.now(),
    };

    cache.set(cacheKey, result, 10 * 60 * 1000); // Cache for 10 minutes

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}



