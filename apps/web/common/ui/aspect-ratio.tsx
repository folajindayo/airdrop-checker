'use client';

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };

// Preset aspect ratios
export function Square({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AspectRatio ratio={1} className={className}>
      {children}
    </AspectRatio>
  );
}

export function VideoRatio({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AspectRatio ratio={16 / 9} className={className}>
      {children}
    </AspectRatio>
  );
}

export function PortraitRatio({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AspectRatio ratio={3 / 4} className={className}>
      {children}
    </AspectRatio>
  );
}

export function WideRatio({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AspectRatio ratio={21 / 9} className={className}>
      {children}
    </AspectRatio>
  );
}

// Image with aspect ratio
export function AspectImage({
  src,
  alt,
  ratio = 16 / 9,
  className,
  objectFit = 'cover',
}: {
  src: string;
  alt: string;
  ratio?: number;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}) {
  return (
    <AspectRatio ratio={ratio} className={className}>
      <img
        src={src}
        alt={alt}
        className={`h-full w-full rounded-md object-${objectFit}`}
      />
    </AspectRatio>
  );
}

// Video with aspect ratio
export function AspectVideo({
  src,
  ratio = 16 / 9,
  className,
  controls = true,
  autoPlay = false,
  loop = false,
}: {
  src: string;
  ratio?: number;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
}) {
  return (
    <AspectRatio ratio={ratio} className={className}>
      <video
        src={src}
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        className="h-full w-full rounded-md object-cover"
      />
    </AspectRatio>
  );
}

// Embed with aspect ratio (for iframes)
export function AspectEmbed({
  src,
  title,
  ratio = 16 / 9,
  className,
  allow,
}: {
  src: string;
  title: string;
  ratio?: number;
  className?: string;
  allow?: string;
}) {
  return (
    <AspectRatio ratio={ratio} className={className}>
      <iframe
        src={src}
        title={title}
        allow={allow}
        className="h-full w-full rounded-md border-0"
      />
    </AspectRatio>
  );
}

// Placeholder with aspect ratio
export function AspectPlaceholder({
  ratio = 16 / 9,
  className,
  children,
}: {
  ratio?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <AspectRatio ratio={ratio} className={className}>
      <div className="h-full w-full rounded-md bg-muted flex items-center justify-center">
        {children || (
          <span className="text-sm text-muted-foreground">No content</span>
        )}
      </div>
    </AspectRatio>
  );
}

