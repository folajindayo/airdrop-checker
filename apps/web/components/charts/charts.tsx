'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Simple bar chart
export function BarChart({
  data,
  maxValue,
  className,
}: {
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue?: number;
  className?: string;
}) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', item.color || 'bg-primary')}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Donut/Pie chart
export function DonutChart({
  data,
  size = 200,
  innerRadius = 0.6,
  className,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
  innerRadius?: number;
  className?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = size / 2 - 10;
  const innerR = radius * innerRadius;

  let currentAngle = -90;

  const paths = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    currentAngle = endAngle;

    const start = {
      x: center + radius * Math.cos((startAngle * Math.PI) / 180),
      y: center + radius * Math.sin((startAngle * Math.PI) / 180),
    };
    const end = {
      x: center + radius * Math.cos((endAngle * Math.PI) / 180),
      y: center + radius * Math.sin((endAngle * Math.PI) / 180),
    };

    const largeArc = angle > 180 ? 1 : 0;

    const outerPath = `M ${center},${center} L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArc},1 ${end.x},${end.y} Z`;

    return (
      <path key={index} d={outerPath} fill={item.color} />
    );
  });

  return (
    <div className={cn('space-y-4', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths}
        {/* Inner circle for donut effect */}
        <circle cx={center} cy={center} r={innerR} fill="hsl(var(--background))" />
        {/* Center text */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-2xl font-bold fill-foreground"
        >
          {total}
        </text>
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">
              {item.label} ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Line chart (simplified)
export function LineChart({
  data,
  width = 400,
  height = 200,
  className,
}: {
  data: Array<{ label: string; value: number }>;
  width?: number;
  height?: number;
  className?: string;
}) {
  const padding = 20;
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue;

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((item.value - minValue) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
    .join(' ');

  return (
    <div className={cn('space-y-2', className)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + ratio * (height - padding * 2);
          return (
            <line
              key={ratio}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray="4"
            />
          );
        })}
        {/* Line path */}
        <path d={pathData} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="hsl(var(--primary))"
          />
        ))}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between px-5 text-xs text-muted-foreground">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

// Area chart
export function AreaChart({
  data,
  width = 400,
  height = 200,
  color = 'hsl(var(--primary))',
  className,
}: {
  data: Array<{ label: string; value: number }>;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}) {
  const padding = 20;
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((item.value - minValue) / range) * (height - padding * 2);
    return { x, y };
  });

  const linePathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
    .join(' ');

  const areaPathData = `${linePathData} L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className={cn('space-y-2', className)}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Area fill */}
        <path d={areaPathData} fill={color} fillOpacity="0.2" />
        {/* Line */}
        <path d={linePathData} fill="none" stroke={color} strokeWidth="2" />
        {/* Points */}
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="3" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between px-5 text-xs text-muted-foreground">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

// Stat card with trend
export function StatCard({
  title,
  value,
  change,
  trend,
  chartData,
  className,
}: {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  chartData?: Array<{ value: number }>;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold">{value}</p>
            {change !== undefined && (
              <Badge
                variant={trend === 'up' ? 'default' : 'destructive'}
                className="gap-1"
              >
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(change)}%
              </Badge>
            )}
          </div>
          {chartData && chartData.length > 0 && (
            <div className="h-12 pt-2">
              <MiniSparkline data={chartData} color={trend === 'up' ? '#22c55e' : '#ef4444'} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mini sparkline
function MiniSparkline({
  data,
  color = 'hsl(var(--primary))',
  width = 200,
  height = 40,
}: {
  data: Array<{ value: number }>;
  color?: string;
  width?: number;
  height?: number;
}) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((item.value - minValue) / range) * height;
    return { x, y };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <path d={pathData} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// Heatmap
export function Heatmap({
  data,
  className,
}: {
  data: Array<Array<{ value: number; label?: string }>>;
  className?: string;
}) {
  const allValues = data.flat().map((cell) => cell.value);
  const maxValue = Math.max(...allValues);

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    return `rgba(var(--primary-rgb), ${intensity})`;
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${data[0].length}, 1fr)` }}>
        {data.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="h-8 w-8 rounded flex items-center justify-center text-xs font-medium"
              style={{ backgroundColor: getColor(cell.value) }}
              title={cell.label || cell.value.toString()}
            >
              {cell.value}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Progress ring
export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

