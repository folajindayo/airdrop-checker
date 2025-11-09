'use client';

import * as React from 'react';
import { Activity, Zap, Clock, Database, Server, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  fps?: number;
  memory?: {
    used: number;
    total: number;
  };
  responseTime?: number;
  pageLoadTime?: number;
  apiCalls?: number;
  cacheHitRate?: number;
}

export function PerformanceMonitor({ className }: { className?: string }) {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({});
  const [isMonitoring, setIsMonitoring] = React.useState(false);

  React.useEffect(() => {
    if (!isMonitoring) return;

    const updateMetrics = () => {
      // FPS tracking
      let lastTime = performance.now();
      let frames = 0;

      const countFrame = () => {
        frames++;
        const currentTime = performance.now();
        if (currentTime >= lastTime + 1000) {
          setMetrics((prev) => ({
            ...prev,
            fps: Math.round((frames * 1000) / (currentTime - lastTime)),
          }));
          frames = 0;
          lastTime = currentTime;
        }
        if (isMonitoring) {
          requestAnimationFrame(countFrame);
        }
      };

      requestAnimationFrame(countFrame);

      // Memory tracking
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memory: {
            used: memory.usedJSHeapSize,
            total: memory.jsHeapSizeLimit,
          },
        }));
      }

      // Page load time
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        setMetrics((prev) => ({
          ...prev,
          pageLoadTime: loadTime,
        }));
      }
    };

    updateMetrics();
  }, [isMonitoring]);

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.warning) return 'warning';
    return 'poor';
  };

  const getFpsStatus = (fps?: number) => {
    if (!fps) return 'unknown';
    return getStatus(fps, { good: 50, warning: 30 });
  };

  const getMemoryStatus = (memory?: { used: number; total: number }) => {
    if (!memory) return 'unknown';
    const percentage = (memory.used / memory.total) * 100;
    if (percentage < 70) return 'good';
    if (percentage < 85) return 'warning';
    return 'poor';
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Performance Monitor</h3>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={cn(
            'px-3 py-1 rounded-md text-sm font-medium transition-colors',
            isMonitoring
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* FPS Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="font-medium">FPS</span>
                </div>
                <Badge
                  variant={
                    getFpsStatus(metrics.fps) === 'good'
                      ? 'default'
                      : getFpsStatus(metrics.fps) === 'warning'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {getFpsStatus(metrics.fps)}
                </Badge>
              </div>
              <div className="text-3xl font-bold">
                {metrics.fps || '--'} <span className="text-sm text-muted-foreground">fps</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.fps && metrics.fps >= 50 ? 'Smooth' : metrics.fps && metrics.fps >= 30 ? 'Acceptable' : 'Needs improvement'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Memory Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span className="font-medium">Memory</span>
                </div>
                <Badge
                  variant={
                    getMemoryStatus(metrics.memory) === 'good'
                      ? 'default'
                      : getMemoryStatus(metrics.memory) === 'warning'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {getMemoryStatus(metrics.memory)}
                </Badge>
              </div>
              {metrics.memory ? (
                <>
                  <div className="text-xl font-bold">
                    {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
                  </div>
                  <Progress
                    value={(metrics.memory.used / metrics.memory.total) * 100}
                    className="h-2"
                  />
                </>
              ) : (
                <div className="text-xl font-bold">--</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Page Load Time Card */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">Load Time</span>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {metrics.pageLoadTime
                  ? `${(metrics.pageLoadTime / 1000).toFixed(2)}s`
                  : '--'}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.pageLoadTime && metrics.pageLoadTime < 3000
                  ? 'Fast'
                  : metrics.pageLoadTime && metrics.pageLoadTime < 5000
                  ? 'Good'
                  : 'Slow'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Real-time performance stats
export function RealtimeStats({ className }: { className?: string }) {
  const [stats, setStats] = React.useState({
    cpu: 0,
    memory: 0,
    network: 0,
    renderTime: 0,
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time stats (replace with actual metrics)
      setStats({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        renderTime: Math.random() * 100,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getColorClass = (value: number) => {
    if (value < 50) return 'text-green-500';
    if (value < 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Real-time Performance
        </CardTitle>
        <CardDescription>Live system metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">CPU Usage</span>
            <span className={cn('text-sm font-bold', getColorClass(stats.cpu))}>
              {stats.cpu.toFixed(1)}%
            </span>
          </div>
          <Progress value={stats.cpu} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Memory Usage</span>
            <span className={cn('text-sm font-bold', getColorClass(stats.memory))}>
              {stats.memory.toFixed(1)}%
            </span>
          </div>
          <Progress value={stats.memory} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network</span>
            <span className={cn('text-sm font-bold', getColorClass(stats.network))}>
              {stats.network.toFixed(1)}%
            </span>
          </div>
          <Progress value={stats.network} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Render Time</span>
            <span className={cn('text-sm font-bold', getColorClass(stats.renderTime))}>
              {stats.renderTime.toFixed(1)}ms
            </span>
          </div>
          <Progress value={stats.renderTime} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

// Performance alerts
export function PerformanceAlerts({
  alerts,
  className,
}: {
  alerts: Array<{
    id: string;
    type: 'warning' | 'error';
    message: string;
    timestamp: Date;
  }>;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Performance Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No performance issues detected
          </p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3 rounded-lg border',
                  alert.type === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-950' : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950'
                )}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={cn(
                      'h-4 w-4 mt-0.5',
                      alert.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Performance score
export function PerformanceScore({
  score,
  metrics,
  className,
}: {
  score: number;
  metrics: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  className?: string;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className={cn('text-6xl font-bold', getScoreColor(score))}>
            {score}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {score >= 90 ? 'Excellent' : score >= 50 ? 'Needs Improvement' : 'Poor'}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>LCP (Largest Contentful Paint)</span>
              <span className="font-medium">{metrics.lcp.toFixed(2)}s</span>
            </div>
            <Progress value={(1 - Math.min(metrics.lcp / 4, 1)) * 100} />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>FID (First Input Delay)</span>
              <span className="font-medium">{metrics.fid.toFixed(0)}ms</span>
            </div>
            <Progress value={(1 - Math.min(metrics.fid / 300, 1)) * 100} />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>CLS (Cumulative Layout Shift)</span>
              <span className="font-medium">{metrics.cls.toFixed(3)}</span>
            </div>
            <Progress value={(1 - Math.min(metrics.cls / 0.25, 1)) * 100} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

