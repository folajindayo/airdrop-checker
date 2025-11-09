'use client';

import * as React from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  Check,
  X,
  Move,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export interface ImageCropperProps {
  src: string;
  aspectRatio?: number;
  onCrop?: (croppedImage: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function ImageCropper({
  src,
  aspectRatio = 1,
  onCrop,
  onCancel,
  className,
}: ImageCropperProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const [crop, setCrop] = React.useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImage(img);
      // Center crop
      const width = Math.min(img.width, 200);
      const height = aspectRatio ? width / aspectRatio : width;
      setCrop({
        x: (img.width - width) / 2,
        y: (img.height - height) / 2,
        width,
        height,
      });
    };
  }, [src, aspectRatio]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setCrop((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(image.width - prev.width, prev.x + deltaX)),
      y: Math.max(0, Math.min(image.height - prev.height, prev.y + deltaY)),
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.save();
    ctx.translate(crop.width / 2, crop.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-crop.width / 2, -crop.height / 2);

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    ctx.restore();

    const croppedImage = canvas.toDataURL('image/png');
    onCrop?.(croppedImage);
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        <div className="relative bg-muted rounded-lg overflow-hidden">
          {image && (
            <div
              className="relative"
              style={{
                width: '100%',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={src}
                alt="Crop"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.2s',
                }}
              />
              <div
                className="absolute border-2 border-primary bg-primary/10 cursor-move"
                style={{
                  left: `${(crop.x / (image?.width || 1)) * 100}%`,
                  top: `${(crop.y / (image?.height || 1)) * 100}%`,
                  width: `${(crop.width / (image?.width || 1)) * 100}%`,
                  height: `${(crop.height / (image?.height || 1)) * 100}%`,
                }}
              >
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-primary/30" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ZoomIn className="h-4 w-4" />
              Zoom
            </Label>
            <Slider
              value={[zoom]}
              min={0.5}
              max={3}
              step={0.1}
              onValueChange={(value) => setZoom(value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <RotateCw className="h-4 w-4" />
              Rotation
            </Label>
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={1}
              onValueChange={(value) => setRotation(value[0])}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleCrop}>
            <Check className="mr-2 h-4 w-4" />
            Crop Image
          </Button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Card>
  );
}

// Avatar cropper with circular preview
export function AvatarCropper({
  src,
  onCrop,
  onCancel,
  className,
}: {
  src: string;
  onCrop: (croppedImage: string) => void;
  onCancel?: () => void;
  className?: string;
}) {
  const [croppedImage, setCroppedImage] = React.useState<string | null>(null);

  return (
    <div className={cn('space-y-4', className)}>
      <ImageCropper
        src={src}
        aspectRatio={1}
        onCrop={setCroppedImage}
        onCancel={onCancel}
      />

      {croppedImage && (
        <div className="text-center">
          <Label className="mb-2">Preview</Label>
          <img
            src={croppedImage}
            alt="Avatar preview"
            className="w-32 h-32 rounded-full mx-auto border-4 border-primary"
          />
          <Button onClick={() => onCrop(croppedImage)} className="mt-4">
            Use This Avatar
          </Button>
        </div>
      )}
    </div>
  );
}

// Banner/Cover image cropper
export function BannerCropper({
  src,
  onCrop,
  className,
}: {
  src: string;
  onCrop: (croppedImage: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <ImageCropper src={src} aspectRatio={16 / 9} onCrop={onCrop} />
    </div>
  );
}

// Multi-image cropper
export function MultiImageCropper({
  images,
  onCropAll,
  className,
}: {
  images: string[];
  onCropAll: (croppedImages: string[]) => void;
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [croppedImages, setCroppedImages] = React.useState<string[]>([]);

  const handleCrop = (croppedImage: string) => {
    const newCroppedImages = [...croppedImages, croppedImage];
    setCroppedImages(newCroppedImages);

    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onCropAll(newCroppedImages);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          Image {currentIndex + 1} of {images.length}
        </h3>
        <div className="flex gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full',
                index < croppedImages.length
                  ? 'bg-primary'
                  : index === currentIndex
                  ? 'bg-primary/50'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      <ImageCropper src={images[currentIndex]} onCrop={handleCrop} />
    </div>
  );
}

// Crop preset selector
export function CropPresetSelector({
  src,
  onCrop,
  className,
}: {
  src: string;
  onCrop: (croppedImage: string, preset: string) => void;
  className?: string;
}) {
  const [selectedPreset, setSelectedPreset] = React.useState<string>('square');

  const presets = [
    { name: 'Square', ratio: 1, icon: '□' },
    { name: 'Portrait', ratio: 4 / 5, icon: '▭' },
    { name: 'Landscape', ratio: 16 / 9, icon: '▬' },
    { name: 'Story', ratio: 9 / 16, icon: '▯' },
  ];

  const handleCrop = (croppedImage: string) => {
    onCrop(croppedImage, selectedPreset);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <Label className="mb-2">Select Crop Preset</Label>
        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant={selectedPreset === preset.name.toLowerCase() ? 'default' : 'outline'}
              onClick={() => setSelectedPreset(preset.name.toLowerCase())}
              className="flex flex-col h-auto py-3"
            >
              <span className="text-2xl mb-1">{preset.icon}</span>
              <span className="text-xs">{preset.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <ImageCropper
        src={src}
        aspectRatio={presets.find((p) => p.name.toLowerCase() === selectedPreset)?.ratio}
        onCrop={handleCrop}
      />
    </div>
  );
}

// Crop area selector with size display
export function ImageCropperWithInfo({
  src,
  onCrop,
  className,
}: {
  src: string;
  onCrop: (croppedImage: string, dimensions: { width: number; height: number }) => void;
  className?: string;
}) {
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  const handleCrop = (croppedImage: string) => {
    onCrop(croppedImage, dimensions);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card className="p-4 bg-muted">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Width:</span>
            <span className="ml-2 font-medium">{dimensions.width}px</span>
          </div>
          <div>
            <span className="text-muted-foreground">Height:</span>
            <span className="ml-2 font-medium">{dimensions.height}px</span>
          </div>
        </div>
      </Card>

      <ImageCropper src={src} onCrop={handleCrop} />
    </div>
  );
}

// Batch crop with preview grid
export function BatchImageCropper({
  images,
  onCropComplete,
  className,
}: {
  images: Array<{ id: string; src: string; name: string }>;
  onCropComplete: (results: Array<{ id: string; croppedImage: string }>) => void;
  className?: string;
}) {
  const [results, setResults] = React.useState<Array<{ id: string; croppedImage: string }>>([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleCrop = (croppedImage: string) => {
    const newResults = [
      ...results,
      { id: images[currentIndex].id, croppedImage },
    ];
    setResults(newResults);

    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onCropComplete(newResults);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="font-semibold mb-4">
          Processing: {images[currentIndex]?.name}
        </h3>
        <div className="flex gap-2 mb-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className={cn(
                'w-12 h-12 rounded border-2',
                index < results.length
                  ? 'border-green-500'
                  : index === currentIndex
                  ? 'border-primary'
                  : 'border-muted'
              )}
            >
              <img
                src={img.src}
                alt={img.name}
                className="w-full h-full object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {currentIndex < images.length && (
        <ImageCropper
          src={images[currentIndex].src}
          onCrop={handleCrop}
        />
      )}

      {results.length > 0 && (
        <div>
          <Label className="mb-2">Cropped Images ({results.length})</Label>
          <div className="grid grid-cols-4 gap-2">
            {results.map((result) => (
              <img
                key={result.id}
                src={result.croppedImage}
                alt="Cropped"
                className="w-full aspect-square object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

