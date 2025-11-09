'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPreferences } from '@/components/settings/user-preferences';
import { ThemeSelector } from '@/components/theme/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, Bell, Database, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function SettingsPage() {
  const handleClearCache = () => {
    try {
      // Clear localStorage items related to cache
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(
        (key) =>
          key.startsWith('airdrop-cache-') ||
          key.includes('eligibility-cache')
      );

      cacheKeys.forEach((key) => localStorage.removeItem(key));

      toast.success(`Cleared ${cacheKeys.length} cached items`);
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const handleClearHistory = () => {
    try {
      const keys = Object.keys(localStorage);
      const historyKeys = keys.filter((key) =>
        key.includes('history') || key.includes('score-history')
      );

      historyKeys.forEach((key) => localStorage.removeItem(key));

      toast.success('Search history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const handleExportData = () => {
    try {
      const data = {
        preferences: localStorage.getItem('airdrop-finder-preferences'),
        watchlist: localStorage.getItem('airdrop-watchlist'),
        notifications: localStorage.getItem('airdrop-finder-notifications'),
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `airdrop-finder-data-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const getStorageUsage = () => {
    try {
      let totalSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }
      // Convert to KB
      return (totalSize / 1024).toFixed(2);
    } catch (error) {
      return '0';
    }
  };

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and application settings
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">About</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <UserPreferences />
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Customize the appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ThemeSelector />

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Color Scheme</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  The application uses a modern indigo-purple gradient theme.
                  Future updates will include custom color scheme options.
                </p>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive updates and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Browser Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications in your browser
                    </p>
                  </div>
                  <Badge variant="outline">Available</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">New Airdrop Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new airdrops are added
                    </p>
                  </div>
                  <Badge variant="outline">In-App</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Score Changes</p>
                    <p className="text-sm text-muted-foreground">
                      Alerts when your eligibility score changes
                    </p>
                  </div>
                  <Badge variant="outline">In-App</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Snapshot Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Reminders before airdrop snapshots
                    </p>
                  </div>
                  <Badge variant="outline">In-App</Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  All notifications are stored locally in your browser. No data is sent to external servers.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Privacy Settings */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your stored data and cache
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Storage Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Used</span>
                  <Badge variant="secondary">{getStorageUsage()} KB</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Data stored locally in your browser
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Clear Cache</p>
                    <p className="text-xs text-muted-foreground">
                      Remove cached eligibility data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleClearCache}>
                    Clear
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Clear History</p>
                    <p className="text-xs text-muted-foreground">
                      Remove score history and search data
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearHistory}
                  >
                    Clear
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Export Data</p>
                    <p className="text-xs text-muted-foreground">
                      Download all your stored data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData}>
                    Export
                  </Button>
                </div>
              </div>

              {/* Privacy Info */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium">Your Privacy</p>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 pl-6">
                  <li>• All data is stored locally in your browser</li>
                  <li>• We never store your private keys or seed phrases</li>
                  <li>• Wallet connections are read-only</li>
                  <li>• No personal information is collected</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Airdrop Finder</CardTitle>
              <CardDescription>
                Application information and resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Version</p>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Description</p>
                  <p className="text-sm text-muted-foreground">
                    A read-only blockchain dashboard for checking airdrop eligibility
                    across multiple chains.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Supported Chains</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Ethereum', 'Base', 'Arbitrum', 'Optimism', 'zkSync Era', 'Polygon'].map(
                      (chain) => (
                        <Badge key={chain} variant="secondary">
                          {chain}
                        </Badge>
                      )
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium">Resources</p>
                  <div className="space-y-2">
                    <a
                      href="https://github.com/yourusername/airdrop-finder"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block"
                    >
                      GitHub Repository →
                    </a>
                    <a
                      href="/help"
                      className="text-sm text-primary hover:underline block"
                    >
                      Help & FAQ →
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

