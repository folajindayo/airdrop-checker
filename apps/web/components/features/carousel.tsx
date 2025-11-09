'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CarouselProps {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  loop?: boolean;
  className?: string;
}

export function Carousel({
  children,
  autoPlay = false,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  loop = true,
  className,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide
      ? loop
        ? children.length - 1
        : 0
      : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === children.length - 1;
    const newIndex = isLastSlide ? (loop ? 0 : currentIndex) : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  React.useEffect(() => {
    if (!autoPlay || isHovered) return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, currentIndex, isHovered]);

  return (
    <div
      className={cn('relative group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {children.map((child, index) => (
            <div key={index} className="min-w-full">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {showControls && children.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity',
              currentIndex === 0 && !loop && 'invisible'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity',
              currentIndex === children.length - 1 && !loop && 'invisible'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && children.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                currentIndex === index
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-primary/50 hover:bg-primary/75'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Card carousel
export function CardCarousel({
  items,
  itemsPerView = 3,
  gap = 16,
  className,
}: {
  items: React.ReactNode[];
  itemsPerView?: number;
  gap?: number;
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const maxIndex = Math.max(0, items.length - itemsPerView);

  const goToPrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
  };

  return (
    <div className={cn('relative group', className)}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            gap: `${gap}px`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                minWidth: `calc(${100 / itemsPerView}% - ${gap * (itemsPerView - 1) / itemsPerView}px)`,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {currentIndex > 0 && (
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      {currentIndex < maxIndex && (
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-10 w-10 rounded-full shadow-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

// Testimonial carousel
export function TestimonialCarousel({
  testimonials,
  className,
}: {
  testimonials: Array<{
    quote: string;
    author: string;
    role?: string;
    avatar?: string;
  }>;
  className?: string;
}) {
  return (
    <Carousel autoPlay interval={8000} className={className}>
      {testimonials.map((testimonial, index) => (
        <div key={index} className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <blockquote className="text-lg md:text-xl font-medium mb-6 max-w-2xl">
            "{testimonial.quote}"
          </blockquote>
          <div className="flex items-center gap-3">
            {testimonial.avatar && (
              <img
                src={testimonial.avatar}
                alt={testimonial.author}
                className="h-12 w-12 rounded-full"
              />
            )}
            <div className="text-left">
              <p className="font-semibold">{testimonial.author}</p>
              {testimonial.role && (
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </Carousel>
  );
}

// Image gallery carousel
export function ImageGallery({
  images,
  className,
}: {
  images: Array<{ src: string; alt: string; caption?: string }>;
  className?: string;
}) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main image */}
      <Carousel
        showControls
        showIndicators={false}
        className="rounded-lg overflow-hidden"
      >
        {images.map((image, index) => (
          <div key={index} className="relative aspect-video bg-muted">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                <p className="text-sm">{image.caption}</p>
              </div>
            )}
          </div>
        ))}
      </Carousel>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all',
              selectedIndex === index
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-transparent hover:border-primary/50'
            )}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// Infinite scroll carousel
export function InfiniteCarousel({
  items,
  speed = 30,
  className,
}: {
  items: React.ReactNode[];
  speed?: number;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        className="flex gap-4 animate-scroll"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {/* Duplicate items for seamless loop */}
        {[...items, ...items].map((item, index) => (
          <div key={index} className="flex-shrink-0">
            {item}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll linear infinite;
        }
      `}</style>
    </div>
  );
}

// Vertical carousel
export function VerticalCarousel({
  children,
  height = '400px',
  className,
}: {
  children: React.ReactNode[];
  height?: string;
  className?: string;
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToPrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex(Math.min(children.length - 1, currentIndex + 1));
  };

  return (
    <div className={cn('relative', className)} style={{ height }}>
      {/* Slides */}
      <div className="overflow-hidden h-full">
        <div
          className="flex flex-col transition-transform duration-500 ease-out"
          style={{ transform: `translateY(-${currentIndex * 100}%)` }}
        >
          {children.map((child, index) => (
            <div key={index} style={{ height }}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {currentIndex > 0 && (
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="absolute top-2 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full"
        >
          <ChevronLeft className="h-4 w-4 rotate-90" />
        </Button>
      )}
      {currentIndex < children.length - 1 && (
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full"
        >
          <ChevronRight className="h-4 w-4 rotate-90" />
        </Button>
      )}
    </div>
  );
}

