'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/common/skeleton';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Bell,
  BellOff,
  Mail,
  Twitter,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Filter,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: 'new_airdrop' | 'snapshot' | 'claim_live' | 'eligibility_change' | 'price_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId?: string;
  projectName?: string;
  actionUrl?: string;
}

interface AlertPreferences {
  email: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  twitterEnabled: boolean;
  discordEnabled: boolean;
  alertTypes: {
    newAirdrops: boolean;
    snapshots: boolean;
    claimLive: boolean;
    eligibilityChanges: boolean;
    priceAlerts: boolean;
  };
  minPriority: 'low' | 'medium' | 'high' | 'urgent';
}

interface AirdropAlertsProps {
  address: string;
}

const PRIORITY_COLORS = {
  low: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  urgent: 'text-red-600 bg-red-100 dark:bg-red-900/20',
};

const ALERT_ICONS = {
  new_airdrop: Sparkles,
  snapshot: Clock,
  claim_live: CheckCircle,
  eligibility_change: AlertCircle,
  price_alert: Bell,
};

export function AirdropAlerts({ address }: AirdropAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [preferences, setPreferences] = useState<AlertPreferences>({
    email: '',
    emailEnabled: false,
    pushEnabled: true,
    twitterEnabled: false,
    discordEnabled: false,
    alertTypes: {
      newAirdrops: true,
      snapshots: true,
      claimLive: true,
      eligibilityChanges: true,
      priceAlerts: false,
    },
    minPriority: 'medium',
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (address) {
      fetchAlerts();
      fetchPreferences();
    }
  }, [address]);

  async function fetchAlerts() {
    setLoading(true);
    try {
      const response = await fetch(`/api/alerts/${address}`);
      const data = await response.json();
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPreferences() {
    try {
      const response = await fetch(`/api/alerts/preferences/${address}`);
      const data = await response.json();
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }

  async function savePreferences() {
    try {
      const response = await fetch(`/api/alerts/preferences/${address}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      toast.success('Alert preferences saved');
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  }

  async function markAsRead(alertId: string) {
    try {
      await fetch(`/api/alerts/${address}/${alertId}/read`, { method: 'POST' });
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }

  async function markAllAsRead() {
    try {
      await fetch(`/api/alerts/${address}/read-all`, { method: 'POST' });
      setAlerts(alerts.map((a) => ({ ...a, read: true })));
      toast.success('All alerts marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark alerts as read');
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'unread') return !alert.read;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Airdrop Alerts</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Stay updated on new airdrops and eligibility changes
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Alert Preferences</h3>
          <div className="space-y-6">
            {/* Notification Channels */}
            <div>
              <h4 className="font-medium mb-3">Notification Channels</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label>Push Notifications</Label>
                  </div>
                  <Switch
                    checked={preferences.pushEnabled}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, pushEnabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label>Email Notifications</Label>
                  </div>
                  <Switch
                    checked={preferences.emailEnabled}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, emailEnabled: checked })
                    }
                  />
                </div>
                {preferences.emailEnabled && (
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={preferences.email}
                    onChange={(e) =>
                      setPreferences({ ...preferences, email: e.target.value })
                    }
                    className="ml-6"
                  />
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <Label>Twitter DMs</Label>
                  </div>
                  <Switch
                    checked={preferences.twitterEnabled}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, twitterEnabled: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label>Discord Notifications</Label>
                  </div>
                  <Switch
                    checked={preferences.discordEnabled}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, discordEnabled: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Alert Types */}
            <div>
              <h4 className="font-medium mb-3">Alert Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>New Airdrops</Label>
                  <Switch
                    checked={preferences.alertTypes.newAirdrops}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        alertTypes: { ...preferences.alertTypes, newAirdrops: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Snapshot Announcements</Label>
                  <Switch
                    checked={preferences.alertTypes.snapshots}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        alertTypes: { ...preferences.alertTypes, snapshots: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Claim Live Notifications</Label>
                  <Switch
                    checked={preferences.alertTypes.claimLive}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        alertTypes: { ...preferences.alertTypes, claimLive: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Eligibility Changes</Label>
                  <Switch
                    checked={preferences.alertTypes.eligibilityChanges}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        alertTypes: { ...preferences.alertTypes, eligibilityChanges: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Price Alerts</Label>
                  <Switch
                    checked={preferences.alertTypes.priceAlerts}
                    onCheckedChange={(checked) =>
                      setPreferences({
                        ...preferences,
                        alertTypes: { ...preferences.alertTypes, priceAlerts: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <Button onClick={savePreferences} className="w-full">
              Save Preferences
            </Button>
          </div>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({alerts.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No alerts to display</p>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = ALERT_ICONS[alert.type];
            return (
              <Card
                key={alert.id}
                className={`p-4 cursor-pointer transition-colors ${
                  !alert.read ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => !alert.read && markAsRead(alert.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${PRIORITY_COLORS[alert.priority]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{alert.title}</h4>
                        {!alert.read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <Badge variant="outline" className={PRIORITY_COLORS[alert.priority]}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                      {alert.actionUrl && (
                        <Button variant="link" size="sm" asChild className="h-auto p-0">
                          <a href={alert.actionUrl} target="_blank" rel="noopener noreferrer">
                            View Details →
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

