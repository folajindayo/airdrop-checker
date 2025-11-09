'use client';

import * as React from 'react';
import { Check, Palette, Pipette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  showInput?: boolean;
  className?: string;
}

export function ColorPicker({
  value,
  onChange,
  presetColors = [
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#eab308',
    '#84cc16',
    '#22c55e',
    '#10b981',
    '#14b8a6',
    '#06b6d4',
    '#0ea5e9',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#d946ef',
    '#ec4899',
  ],
  showInput = true,
  className,
}: ColorPickerProps) {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newColor: string) => {
    setLocalValue(newColor);
    onChange(newColor);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start', className)}
        >
          <div
            className="w-6 h-6 rounded border mr-2"
            style={{ backgroundColor: value }}
          />
          <span className="flex-1 text-left">{value}</span>
          <Palette className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Tabs defaultValue="preset">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preset">Preset</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="preset" className="space-y-4">
            <div className="grid grid-cols-8 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleChange(color)}
                  className={cn(
                    'w-8 h-8 rounded border-2 transition-transform hover:scale-110',
                    value === color
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                >
                  {value === color && (
                    <Check className="h-4 w-4 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-2">
              <Label>Hex Color</Label>
              <Input
                type="text"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="#000000"
              />
            </div>

            <div className="space-y-2">
              <Label>Color Picker</Label>
              <input
                type="color"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full h-12 rounded border cursor-pointer"
              />
            </div>
          </TabsContent>
        </Tabs>

        {showInput && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded border"
                style={{ backgroundColor: value }}
              />
              <Input
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Simple color swatch selector
export function ColorSwatchPicker({
  value,
  onChange,
  colors,
  size = 'default',
  className,
}: {
  value: string;
  onChange: (color: string) => void;
  colors: string[];
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    default: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={cn(
            'rounded border-2 transition-all hover:scale-110',
            sizeClasses[size],
            value === color
              ? 'border-primary ring-2 ring-primary'
              : 'border-transparent hover:border-primary/50'
          )}
          style={{ backgroundColor: color }}
        >
          {value === color && <Check className="h-4 w-4 text-white mx-auto" />}
        </button>
      ))}
    </div>
  );
}

// Gradient picker
export function GradientPicker({
  value,
  onChange,
  className,
}: {
  value: { from: string; to: string };
  onChange: (gradient: { from: string; to: string }) => void;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label>From Color</Label>
        <ColorPicker
          value={value.from}
          onChange={(color) => onChange({ ...value, from: color })}
        />
      </div>

      <div className="space-y-2">
        <Label>To Color</Label>
        <ColorPicker
          value={value.to}
          onChange={(color) => onChange({ ...value, to: color })}
        />
      </div>

      <div className="space-y-2">
        <Label>Preview</Label>
        <div
          className="w-full h-20 rounded border"
          style={{
            background: `linear-gradient(to right, ${value.from}, ${value.to})`,
          }}
        />
      </div>
    </div>
  );
}

// Theme color picker for airdrop categories
export function AirdropCategoryColorPicker({
  category,
  color,
  onChange,
  className,
}: {
  category: string;
  color: string;
  onChange: (color: string) => void;
  className?: string;
}) {
  const categoryColors = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];

  return (
    <div className={cn('flex items-center justify-between p-3 rounded-lg border', className)}>
      <span className="font-medium">{category}</span>
      <ColorSwatchPicker
        value={color}
        onChange={onChange}
        colors={categoryColors}
        size="sm"
      />
    </div>
  );
}

// RGB/HSL color input
export function RGBColorPicker({
  value,
  onChange,
  className,
}: {
  value: { r: number; g: number; b: number };
  onChange: (rgb: { r: number; g: number; b: number }) => void;
  className?: string;
}) {
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Red</Label>
          <span className="text-sm text-muted-foreground">{value.r}</span>
        </div>
        <input
          type="range"
          min="0"
          max="255"
          value={value.r}
          onChange={(e) => onChange({ ...value, r: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Green</Label>
          <span className="text-sm text-muted-foreground">{value.g}</span>
        </div>
        <input
          type="range"
          min="0"
          max="255"
          value={value.g}
          onChange={(e) => onChange({ ...value, g: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Blue</Label>
          <span className="text-sm text-muted-foreground">{value.b}</span>
        </div>
        <input
          type="range"
          min="0"
          max="255"
          value={value.b}
          onChange={(e) => onChange({ ...value, b: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="flex items-center gap-3">
          <div
            className="w-20 h-20 rounded border"
            style={{ backgroundColor: rgbToHex(value.r, value.g, value.b) }}
          />
          <div className="space-y-1">
            <p className="text-sm font-mono">{rgbToHex(value.r, value.g, value.b)}</p>
            <p className="text-xs text-muted-foreground">
              rgb({value.r}, {value.g}, {value.b})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Color palette generator
export function ColorPaletteGenerator({
  baseColor,
  onChange,
  className,
}: {
  baseColor: string;
  onChange: (colors: string[]) => void;
  className?: string;
}) {
  const generatePalette = (base: string): string[] => {
    // Simple palette generation (in production, use a proper color library)
    return [
      base,
      adjustBrightness(base, 20),
      adjustBrightness(base, -20),
      adjustBrightness(base, 40),
      adjustBrightness(base, -40),
    ];
  };

  const adjustBrightness = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const palette = generatePalette(baseColor);

  return (
    <div className={cn('space-y-4', className)}>
      <ColorPicker value={baseColor} onChange={(color) => onChange(generatePalette(color))} />

      <div className="space-y-2">
        <Label>Generated Palette</Label>
        <div className="grid grid-cols-5 gap-2">
          {palette.map((color, index) => (
            <div key={index} className="space-y-1">
              <div
                className="w-full h-16 rounded border"
                style={{ backgroundColor: color }}
              />
              <p className="text-xs font-mono text-center">{color}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Color picker with recent colors
export function ColorPickerWithHistory({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}) {
  const [recentColors, setRecentColors] = React.useState<string[]>([]);

  const handleChange = (color: string) => {
    onChange(color);
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, 8);
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <ColorPicker value={value} onChange={handleChange} />

      {recentColors.length > 0 && (
        <div className="space-y-2">
          <Label>Recent Colors</Label>
          <ColorSwatchPicker
            value={value}
            onChange={handleChange}
            colors={recentColors}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}

// Eyedropper tool (browser API)
export function EyedropperButton({
  onColorPicked,
  className,
}: {
  onColorPicked: (color: string) => void;
  className?: string;
}) {
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    setSupported('EyeDropper' in window);
  }, []);

  const pickColor = async () => {
    if (!('EyeDropper' in window)) {
      alert('EyeDropper API is not supported in your browser');
      return;
    }

    try {
      // @ts-ignore - EyeDropper is not in TypeScript types yet
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      onColorPicked(result.sRGBHex);
    } catch (error) {
      console.error('Color picking cancelled or failed:', error);
    }
  };

  if (!supported) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={pickColor}
      className={className}
    >
      <Pipette className="h-4 w-4" />
    </Button>
  );
}

