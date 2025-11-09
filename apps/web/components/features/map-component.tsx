'use client';

import * as React from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}

export interface MapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  height?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

// Simple map placeholder (in production, use actual map library like Leaflet or Mapbox)
export function MapComponent({
  center = { lat: 40.7128, lng: -74.0060 },
  zoom = 12,
  markers = [],
  height = 400,
  onMarkerClick,
  className,
}: MapComponentProps) {
  const [currentZoom, setCurrentZoom] = React.useState(zoom);
  const [selectedMarker, setSelectedMarker] = React.useState<MapMarker | null>(null);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onMarkerClick?.(marker);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="relative" style={{ height }}>
        {/* Map placeholder - in production, render actual map */}
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Map Component Placeholder
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {markers.length} markers • Zoom: {currentZoom}
            </p>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setCurrentZoom((z) => Math.min(z + 1, 20))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setCurrentZoom((z) => Math.max(z - 1, 1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon">
            <Layers className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Markers List (overlay) */}
        {markers.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-card border rounded-lg p-3 shadow-lg max-h-32 overflow-y-auto">
              <div className="space-y-2">
                {markers.map((marker) => (
                  <button
                    key={marker.id}
                    onClick={() => handleMarkerClick(marker)}
                    className={cn(
                      'w-full text-left p-2 rounded hover:bg-accent transition-colors',
                      selectedMarker?.id === marker.id && 'bg-accent'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {marker.icon || <MapPin className="h-4 w-4 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{marker.title}</p>
                        {marker.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {marker.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Location picker with search
export function LocationPicker({
  onLocationSelect,
  className,
}: {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState<string | null>(null);

  const handleSelect = () => {
    if (selectedLocation) {
      // In production, geocode the address
      onLocationSelect({
        lat: 40.7128,
        lng: -74.0060,
        address: selectedLocation,
      });
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location..."
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <Button onClick={handleSelect}>
          <Navigation className="mr-2 h-4 w-4" />
          Select
        </Button>
      </div>

      <MapComponent
        markers={
          selectedLocation
            ? [
                {
                  id: '1',
                  lat: 40.7128,
                  lng: -74.0060,
                  title: selectedLocation,
                },
              ]
            : []
        }
        height={300}
      />
    </div>
  );
}

// Distance calculator
export function DistanceCalculator({
  fromLocation,
  toLocation,
  className,
}: {
  fromLocation: { lat: number; lng: number; name: string };
  toLocation: { lat: number; lng: number; name: string };
  className?: string;
}) {
  // Haversine formula for distance calculation
  const calculateDistance = () => {
    const R = 6371; // Earth's radius in km
    const dLat = ((toLocation.lat - fromLocation.lat) * Math.PI) / 180;
    const dLng = ((toLocation.lng - fromLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((fromLocation.lat * Math.PI) / 180) *
        Math.cos((toLocation.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = calculateDistance();

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">From</p>
            <p className="font-medium">{fromLocation.name}</p>
          </div>
          <Navigation className="h-5 w-5 text-primary" />
          <div className="text-right">
            <p className="text-sm text-muted-foreground">To</p>
            <p className="font-medium">{toLocation.name}</p>
          </div>
        </div>

        <div className="text-center p-4 bg-muted rounded-lg">
          <p className="text-3xl font-bold">{distance.toFixed(1)} km</p>
          <p className="text-sm text-muted-foreground mt-1">
            {(distance * 0.621371).toFixed(1)} miles
          </p>
        </div>

        <MapComponent
          markers={[
            {
              id: '1',
              lat: fromLocation.lat,
              lng: fromLocation.lng,
              title: fromLocation.name,
              color: 'blue',
            },
            {
              id: '2',
              lat: toLocation.lat,
              lng: toLocation.lng,
              title: toLocation.name,
              color: 'red',
            },
          ]}
          height={200}
        />
      </div>
    </Card>
  );
}

// Geolocation tracker
export function GeolocationTracker({
  onLocationUpdate,
  className,
}: {
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  className?: string;
}) {
  const [location, setLocation] = React.useState<{ lat: number; lng: number } | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isTracking, setIsTracking] = React.useState(false);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        onLocationUpdate?.(newLocation);
      },
      (error) => {
        setError(error.message);
        setIsTracking(false);
      }
    );
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Your Location</h4>
          <Badge variant={isTracking ? 'default' : 'secondary'}>
            {isTracking ? 'Tracking' : 'Inactive'}
          </Badge>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
            {error}
          </div>
        )}

        {location ? (
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Coordinates</p>
              <p className="font-mono text-sm">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
            </div>

            <MapComponent
              center={location}
              markers={[
                {
                  id: 'current',
                  lat: location.lat,
                  lng: location.lng,
                  title: 'Your Location',
                },
              ]}
              height={200}
            />
          </div>
        ) : (
          <Button onClick={startTracking} className="w-full">
            <Navigation className="mr-2 h-4 w-4" />
            Get My Location
          </Button>
        )}
      </div>
    </Card>
  );
}

// Heatmap visualization
export function HeatmapVisualization({
  data,
  title,
  className,
}: {
  data: Array<{ lat: number; lng: number; intensity: number }>;
  title?: string;
  className?: string;
}) {
  return (
    <Card className={cn('p-4', className)}>
      {title && <h4 className="font-semibold mb-4">{title}</h4>}

      <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
        {/* Heatmap placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Layers className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Heatmap Visualization
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.length} data points
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card border rounded-lg p-2">
          <div className="flex items-center gap-2 text-xs">
            <span>Low</span>
            <div className="w-20 h-3 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded" />
            <span>High</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Blockchain node map (for crypto applications)
export function BlockchainNodeMap({
  nodes,
  className,
}: {
  nodes: Array<{
    id: string;
    location: string;
    lat: number;
    lng: number;
    active: boolean;
    peers: number;
  }>;
  className?: string;
}) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-1">Network Nodes</h4>
          <p className="text-sm text-muted-foreground">
            {nodes.filter((n) => n.active).length} active nodes
          </p>
        </div>

        <MapComponent
          markers={nodes.map((node) => ({
            id: node.id,
            lat: node.lat,
            lng: node.lng,
            title: node.location,
            description: `${node.peers} peers`,
            color: node.active ? 'green' : 'gray',
          }))}
          height={300}
        />

        <div className="space-y-2">
          {nodes.slice(0, 5).map((node) => (
            <div
              key={node.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full',
                    node.active ? 'bg-green-500' : 'bg-gray-500'
                  )}
                />
                <span className="text-sm font-medium">{node.location}</span>
              </div>
              <Badge variant="secondary">{node.peers} peers</Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Route planner
export function RoutePlanner({
  waypoints,
  className,
}: {
  waypoints: Array<{ name: string; lat: number; lng: number }>;
  className?: string;
}) {
  const totalDistance = React.useMemo(() => {
    let total = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const R = 6371;
      const dLat = ((waypoints[i + 1].lat - waypoints[i].lat) * Math.PI) / 180;
      const dLng = ((waypoints[i + 1].lng - waypoints[i].lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((waypoints[i].lat * Math.PI) / 180) *
          Math.cos((waypoints[i + 1].lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    return total;
  }, [waypoints]);

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Route</h4>
          <Badge>{totalDistance.toFixed(1)} km</Badge>
        </div>

        <MapComponent
          markers={waypoints.map((point, index) => ({
            id: `waypoint-${index}`,
            lat: point.lat,
            lng: point.lng,
            title: point.name,
            description: `Stop ${index + 1}`,
          }))}
          height={250}
        />

        <div className="space-y-2">
          {waypoints.map((point, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <span className="text-sm font-medium">{point.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

