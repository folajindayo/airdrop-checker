'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

// Slider with label and value display
export function SliderWithLabel({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  showValue = true,
  disabled,
  className,
}: {
  label: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {showValue && (
          <span className="text-sm text-muted-foreground">
            {value[0]}
            {unit}
          </span>
        )}
      </div>
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
      {!showValue && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {min}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      )}
    </div>
  );
}

// Range slider (two thumbs)
export function RangeSlider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  disabled,
  className,
}: {
  label?: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <span className="text-sm text-muted-foreground">
            {value[0]}
            {unit} - {value[1]}
            {unit}
          </span>
        </div>
      )}
      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  );
}

// Stepped slider with markers
export function SteppedSlider({
  label,
  value,
  onValueChange,
  steps,
  disabled,
  className,
}: {
  label?: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  steps: Array<{ value: number; label: string }>;
  disabled?: boolean;
  className?: string;
}) {
  const min = Math.min(...steps.map((s) => s.value));
  const max = Math.max(...steps.map((s) => s.value));

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <span className="text-sm text-muted-foreground">
            {steps.find((s) => s.value === value[0])?.label || value[0]}
          </span>
        </div>
      )}
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={1}
        disabled={disabled}
      />
      <div className="flex justify-between">
        {steps.map((step) => (
          <button
            key={step.value}
            type="button"
            onClick={() => onValueChange([step.value])}
            className={cn(
              'text-xs transition-colors',
              value[0] === step.value
                ? 'font-medium text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {step.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Volume/level style slider
export function VolumeSlider({
  value,
  onValueChange,
  max = 100,
  muted,
  onMutedChange,
  className,
}: {
  value: number[];
  onValueChange: (value: number[]) => void;
  max?: number;
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {onMutedChange && (
        <button
          type="button"
          onClick={() => onMutedChange(!muted)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {muted || value[0] === 0 ? '🔇' : value[0] < 50 ? '🔉' : '🔊'}
        </button>
      )}
      <Slider
        value={muted ? [0] : value}
        onValueChange={onValueChange}
        max={max}
        step={1}
        className="flex-1"
      />
      <span className="text-xs text-muted-foreground w-8 text-right">
        {muted ? 0 : value[0]}
      </span>
    </div>
  );
}

// Colored slider (for score/rating)
export function ColoredSlider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  getColor,
  disabled,
  className,
}: {
  label?: string;
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  getColor?: (value: number) => string;
  disabled?: boolean;
  className?: string;
}) {
  const defaultGetColor = (val: number) => {
    if (val < 33) return 'bg-red-500';
    if (val < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const colorFn = getColor || defaultGetColor;
  const rangeColor = colorFn(value[0]);

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{label}</label>
          <span className="text-sm font-semibold">{value[0]}</span>
        </div>
      )}
      <SliderPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={1}
        disabled={disabled}
        className="relative flex w-full touch-none select-none items-center"
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className={cn('absolute h-full', rangeColor)} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-background bg-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    </div>
  );
}

