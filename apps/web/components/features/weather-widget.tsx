'use client';

import * as React from 'react';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  CloudFog,
  CloudDrizzle,
  CloudLightning,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  sunrise?: string;
  sunset?: string;
  forecast?: Array<{
    day: string;
    high: number;
    low: number;
    condition: string;
  }>;
}

export interface WeatherWidgetProps {
  data: WeatherData;
  unit?: 'celsius' | 'fahrenheit';
  variant?: 'compact' | 'detailed' | 'minimal';
  className?: string;
}

const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();
  
  if (lower.includes('rain')) return CloudRain;
  if (lower.includes('snow')) return CloudSnow;
  if (lower.includes('drizzle')) return CloudDrizzle;
  if (lower.includes('thunder') || lower.includes('storm')) return CloudLightning;
  if (lower.includes('fog') || lower.includes('mist')) return CloudFog;
  if (lower.includes('cloud')) return Cloud;
  if (lower.includes('clear') || lower.includes('sunny')) return Sun;
  
  return Cloud;
};

export function WeatherWidget({
  data,
  unit = 'celsius',
  variant = 'detailed',
  className,
}: WeatherWidgetProps) {
  const Icon = getWeatherIcon(data.condition);
  const tempSymbol = unit === 'celsius' ? '°C' : '°F';

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Icon className="h-5 w-5" />
        <span className="text-lg font-semibold">
          {Math.round(data.temperature)}{tempSymbol}
        </span>
        <span className="text-sm text-muted-foreground">{data.location}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{data.location}</p>
            <p className="text-3xl font-bold">
              {Math.round(data.temperature)}{tempSymbol}
            </p>
            <p className="text-sm text-muted-foreground">{data.condition}</p>
          </div>
          <Icon className="h-16 w-16 text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold">{data.location}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Current Weather */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-6xl font-bold">
              {Math.round(data.temperature)}{tempSymbol}
            </div>
            <p className="text-lg text-muted-foreground mt-1">
              {data.condition}
            </p>
            <p className="text-sm text-muted-foreground">
              Feels like {Math.round(data.feelsLike)}{tempSymbol}
            </p>
          </div>
          <Icon className="h-24 w-24 text-primary" />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Humidity</span>
              <p className="font-semibold">{data.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Wind</span>
              <p className="font-semibold">{data.windSpeed} km/h</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Visibility</span>
              <p className="font-semibold">{data.visibility} km</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm">
              <span className="text-muted-foreground">Pressure</span>
              <p className="font-semibold">{data.pressure} hPa</p>
            </div>
          </div>
        </div>

        {/* Sun Times */}
        {(data.sunrise || data.sunset) && (
          <div className="flex items-center justify-around pt-4 border-t">
            {data.sunrise && (
              <div className="flex items-center gap-2">
                <Sunrise className="h-5 w-5 text-orange-500" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Sunrise</p>
                  <p className="font-semibold">{data.sunrise}</p>
                </div>
              </div>
            )}
            {data.sunset && (
              <div className="flex items-center gap-2">
                <Sunset className="h-5 w-5 text-orange-500" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Sunset</p>
                  <p className="font-semibold">{data.sunset}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Forecast */}
        {data.forecast && data.forecast.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-3">7-Day Forecast</h4>
            <div className="space-y-2">
              {data.forecast.map((day, index) => {
                const DayIcon = getWeatherIcon(day.condition);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                  >
                    <span className="text-sm w-20">{day.day}</span>
                    <DayIcon className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground flex-1 text-center">
                      {day.condition}
                    </span>
                    <div className="flex gap-2 text-sm">
                      <span className="font-semibold">{day.high}°</span>
                      <span className="text-muted-foreground">{day.low}°</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Weather alert banner
export function WeatherAlert({
  type,
  message,
  severity,
  onDismiss,
  className,
}: {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  onDismiss?: () => void;
  className?: string;
}) {
  const severityColors = {
    low: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    medium: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    high: 'bg-red-500/10 border-red-500/20 text-red-500',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        severityColors[severity],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CloudLightning className="h-5 w-5" />
            <span className="font-semibold">{type}</span>
          </div>
          <p className="text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

// Temperature gauge
export function TemperatureGauge({
  temperature,
  min = -20,
  max = 50,
  unit = 'celsius',
  className,
}: {
  temperature: number;
  min?: number;
  max?: number;
  unit?: 'celsius' | 'fahrenheit';
  className?: string;
}) {
  const percentage = ((temperature - min) / (max - min)) * 100;
  const tempSymbol = unit === 'celsius' ? '°C' : '°F';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Temperature</span>
        <span className="font-bold text-lg">
          {Math.round(temperature)}{tempSymbol}
        </span>
      </div>
      <div className="relative h-3 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded-full overflow-hidden">
        <div
          className="absolute top-0 h-full w-1 bg-white border-2 border-foreground"
          style={{ left: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{min}{tempSymbol}</span>
        <span>{max}{tempSymbol}</span>
      </div>
    </div>
  );
}

// Weather condition badge
export function WeatherBadge({
  condition,
  className,
}: {
  condition: string;
  className?: string;
}) {
  const Icon = getWeatherIcon(condition);

  return (
    <Badge variant="secondary" className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {condition}
    </Badge>
  );
}

// Hourly forecast
export function HourlyForecast({
  forecast,
  unit = 'celsius',
  className,
}: {
  forecast: Array<{
    hour: string;
    temperature: number;
    condition: string;
  }>;
  unit?: 'celsius' | 'fahrenheit';
  className?: string;
}) {
  const tempSymbol = unit === 'celsius' ? '°C' : '°F';

  return (
    <Card className={cn('p-4', className)}>
      <h4 className="font-semibold mb-3">Hourly Forecast</h4>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {forecast.map((hour, index) => {
          const Icon = getWeatherIcon(hour.condition);
          return (
            <div
              key={index}
              className="flex flex-col items-center gap-2 min-w-[60px]"
            >
              <span className="text-sm text-muted-foreground">{hour.hour}</span>
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">
                {Math.round(hour.temperature)}{tempSymbol}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Weather comparison
export function WeatherComparison({
  locations,
  unit = 'celsius',
  className,
}: {
  locations: Array<{
    name: string;
    temperature: number;
    condition: string;
  }>;
  unit?: 'celsius' | 'fahrenheit';
  className?: string;
}) {
  const tempSymbol = unit === 'celsius' ? '°C' : '°F';

  return (
    <Card className={cn('p-4', className)}>
      <h4 className="font-semibold mb-3">Weather Comparison</h4>
      <div className="space-y-2">
        {locations.map((location, index) => {
          const Icon = getWeatherIcon(location.condition);
          return (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{location.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {location.condition}
                </span>
                <span className="text-lg font-bold">
                  {Math.round(location.temperature)}{tempSymbol}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Simple weather display for dashboard
export function DashboardWeather({
  location,
  temperature,
  condition,
  unit = 'celsius',
  className,
}: {
  location: string;
  temperature: number;
  condition: string;
  unit?: 'celsius' | 'fahrenheit';
  className?: string;
}) {
  const Icon = getWeatherIcon(condition);
  const tempSymbol = unit === 'celsius' ? '°C' : '°F';

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg bg-muted', className)}>
      <Icon className="h-8 w-8 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground truncate">{location}</p>
        <p className="text-xl font-bold">
          {Math.round(temperature)}{tempSymbol}
        </p>
      </div>
      <WeatherBadge condition={condition} />
    </div>
  );
}

