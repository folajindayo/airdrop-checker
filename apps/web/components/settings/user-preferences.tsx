'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface UserPreferences {
  defaultSortBy: 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc';
  showExpiredAirdrops: boolean;
  minScoreThreshold: number;
  autoRefreshInterval: number; // in minutes, 0 = disabled
  enableNotifications: boolean;
  preferredChains: string[];
  compactView: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultSortBy: 'score-desc',
  showExpiredAirdrops: false,
  minScoreThreshold: 0,
  autoRefreshInterval: 0,
  enableNotifications: false,
  preferredChains: [],
  compactView: false,
};

const STORAGE_KEY = 'airdrop-finder-preferences';

export function UserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      setHasChanges(false);
      toast.success('Preferences saved successfully!');
      
      // Emit custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('preferences-updated', { detail: preferences }));
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setHasChanges(true);
    toast.info('Preferences reset to defaults');
  };

  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <div>
            <CardTitle>User Preferences</CardTitle>
            <CardDescription>
              Customize your airdrop finder experience
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Display</h3>

          <div className="space-y-2">
            <Label htmlFor="sort-preference">Default Sort By</Label>
            <select
              id="sort-preference"
              value={preferences.defaultSortBy}
              onChange={(e) =>
                updatePreference('defaultSortBy', e.target.value as any)
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="score-desc">Highest Score First</option>
              <option value="score-asc">Lowest Score First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="show-expired">Show Expired Airdrops</Label>
              <p className="text-xs text-muted-foreground">
                Display airdrops that have ended
              </p>
            </div>
            <input
              type="checkbox"
              id="show-expired"
              checked={preferences.showExpiredAirdrops}
              onChange={(e) =>
                updatePreference('showExpiredAirdrops', e.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="compact-view">Compact View</Label>
              <p className="text-xs text-muted-foreground">
                Show more airdrops in less space
              </p>
            </div>
            <input
              type="checkbox"
              id="compact-view"
              checked={preferences.compactView}
              onChange={(e) => updatePreference('compactView', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
        </div>

        {/* Filter Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-semibold">Filters</h3>

          <div className="space-y-2">
            <Label htmlFor="min-score">
              Minimum Score Threshold: {preferences.minScoreThreshold}%
            </Label>
            <input
              type="range"
              id="min-score"
              min="0"
              max="100"
              step="5"
              value={preferences.minScoreThreshold}
              onChange={(e) =>
                updatePreference('minScoreThreshold', Number(e.target.value))
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Only show airdrops with score ≥ {preferences.minScoreThreshold}%
            </p>
          </div>
        </div>

        {/* Auto Refresh Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-sm font-semibold">Automation</h3>

          <div className="space-y-2">
            <Label htmlFor="auto-refresh">Auto-Refresh Interval (minutes)</Label>
            <select
              id="auto-refresh"
              value={preferences.autoRefreshInterval}
              onChange={(e) =>
                updatePreference('autoRefreshInterval', Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="0">Disabled</option>
              <option value="5">Every 5 minutes</option>
              <option value="10">Every 10 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Automatically refresh eligibility data
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Get notified about new airdrops
              </p>
            </div>
            <input
              type="checkbox"
              id="notifications"
              checked={preferences.enableNotifications}
              onChange={(e) =>
                updatePreference('enableNotifications', e.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {hasChanges && (
          <p className="text-xs text-muted-foreground text-center">
            You have unsaved changes
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Hook to use preferences in other components
export function useUserPreferences(): UserPreferences {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };

    loadPreferences();

    // Listen for preference updates
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<UserPreferences>;
      setPreferences(customEvent.detail);
    };

    window.addEventListener('preferences-updated', handleUpdate);
    return () => window.removeEventListener('preferences-updated', handleUpdate);
  }, []);

  return preferences;
}

