'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';

interface PriceAlert {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice: number;
  createdAt: number;
  triggered: boolean;
  notificationSent: boolean;
}

interface TokenPriceAlertsProps {
  className?: string;
}

/**
 * TokenPriceAlerts - Set price alerts for tokens
 * Get notified when tokens reach your target price
 */
export function TokenPriceAlerts({ className = '' }: TokenPriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isAddingAlert, setIsAddingAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    tokenSymbol: '',
    tokenName: '',
    targetPrice: '',
    condition: 'above' as 'above' | 'below',
    currentPrice: 0,
  });

  // Load alerts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('priceAlerts');
    if (stored) {
      try {
        setAlerts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load alerts:', e);
      }
    }
  }, []);

  // Save alerts to localStorage
  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem('priceAlerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  // Simulate price updates and check alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts((prev) =>
        prev.map((alert) => {
          // Simulate price fluctuation
          const priceChange = (Math.random() - 0.5) * 0.05;
          const newPrice = alert.currentPrice * (1 + priceChange);

          // Check if alert should be triggered
          const shouldTrigger =
            !alert.triggered &&
            ((alert.condition === 'above' && newPrice >= alert.targetPrice) ||
              (alert.condition === 'below' && newPrice <= alert.targetPrice));

          if (shouldTrigger && !alert.notificationSent) {
            // Send browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Price Alert Triggered! 🔔', {
                body: `${alert.tokenSymbol} is now ${alert.condition} $${alert.targetPrice}`,
                icon: '/icon.png',
              });
            }
          }

          return {
            ...alert,
            currentPrice: newPrice,
            triggered: shouldTrigger || alert.triggered,
            notificationSent: shouldTrigger || alert.notificationSent,
          };
        })
      );
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const addAlert = () => {
    if (!newAlert.tokenSymbol || !newAlert.targetPrice) return;

    const alert: PriceAlert = {
      id: Date.now().toString(),
      tokenSymbol: newAlert.tokenSymbol.toUpperCase(),
      tokenName: newAlert.tokenName || newAlert.tokenSymbol,
      targetPrice: parseFloat(newAlert.targetPrice),
      condition: newAlert.condition,
      currentPrice: newAlert.currentPrice || 100, // Mock current price
      createdAt: Date.now(),
      triggered: false,
      notificationSent: false,
    };

    setAlerts((prev) => [...prev, alert]);
    setNewAlert({
      tokenSymbol: '',
      tokenName: '',
      targetPrice: '',
      condition: 'above',
      currentPrice: 0,
    });
    setIsAddingAlert(false);
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const activeAlerts = alerts.filter((a) => !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);

  const getPriceDifference = (alert: PriceAlert): number => {
    return ((alert.currentPrice - alert.targetPrice) / alert.targetPrice) * 100;
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Price Alerts
            </h3>
            <p className="text-sm text-muted-foreground">
              Get notified when tokens reach your target price
            </p>
          </div>
          <Button onClick={() => setIsAddingAlert(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Alert
          </Button>
        </div>

        {/* Notification Permission */}
        {typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'default' && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Enable Notifications
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Allow browser notifications to receive price alerts
                  </p>
                  <Button
                    onClick={requestNotificationPermission}
                    size="sm"
                    variant="outline"
                    className="mt-2"
                  >
                    Enable Notifications
                  </Button>
                </div>
              </div>
            </div>
          )}

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Active Alerts ({activeAlerts.length})
            </h4>
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{alert.tokenSymbol}</span>
                        {alert.tokenName && (
                          <span className="text-sm text-muted-foreground">
                            ({alert.tokenName})
                          </span>
                        )}
                        <Badge
                          variant="secondary"
                          className={
                            alert.condition === 'above'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          }
                        >
                          {alert.condition === 'above' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {alert.condition} ${alert.targetPrice.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Current: </span>
                          <span className="font-medium">
                            ${alert.currentPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Distance: </span>
                          <span
                            className={`font-medium ${
                              getPriceDifference(alert) > 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {getPriceDifference(alert) > 0 ? '+' : ''}
                            {getPriceDifference(alert).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Triggered Alerts ({triggeredAlerts.length})
            </h4>
            <div className="space-y-2">
              {triggeredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-950"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-semibold">{alert.tokenSymbol}</span>
                        <Badge variant="secondary">
                          Target Reached: ${alert.targetPrice.toFixed(2)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current: ${alert.currentPrice.toFixed(2)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {alerts.length === 0 && (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h4 className="font-medium mb-1">No Price Alerts Set</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first alert to get notified of price changes
            </p>
            <Button onClick={() => setIsAddingAlert(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </div>
        )}

        {/* Add Alert Dialog */}
        {isAddingAlert && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Create Price Alert</h3>
              <div className="space-y-4">
                <div>
                  <Label>Token Symbol</Label>
                  <Input
                    placeholder="ETH, BTC, etc."
                    value={newAlert.tokenSymbol}
                    onChange={(e) =>
                      setNewAlert({ ...newAlert, tokenSymbol: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Token Name (optional)</Label>
                  <Input
                    placeholder="Ethereum"
                    value={newAlert.tokenName}
                    onChange={(e) =>
                      setNewAlert({ ...newAlert, tokenName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Condition</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={newAlert.condition}
                    onChange={(e) =>
                      setNewAlert({
                        ...newAlert,
                        condition: e.target.value as 'above' | 'below',
                      })
                    }
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </select>
                </div>
                <div>
                  <Label>Target Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="100.00"
                    value={newAlert.targetPrice}
                    onChange={(e) =>
                      setNewAlert({ ...newAlert, targetPrice: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addAlert} className="flex-1">
                    Create Alert
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingAlert(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
}

