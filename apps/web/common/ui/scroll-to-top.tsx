'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
  showAfter?: number;
  className?: string;
}

export function ScrollToTop({ showAfter = 300, className }: ScrollToTopProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > showAfter) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!show) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        'fixed bottom-8 right-8 z-50 rounded-full shadow-lg transition-all duration-300 hover:scale-110',
        'animate-in fade-in slide-in-from-bottom-5',
        className
      )}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}

// Minimal version with just icon
export function ScrollToTopMinimal({ showAfter = 300 }: { showAfter?: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > showAfter);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 animate-in fade-in"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

// Progress indicator version
export function ScrollToTopProgress({ showAfter = 300 }: { showAfter?: number }) {
  const [show, setShow] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const totalScroll = documentHeight - windowHeight;
      const progress = (scrollTop / totalScroll) * 100;

      setScrollProgress(progress);
      setShow(scrollTop > showAfter);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-all duration-300 animate-in fade-in"
      style={{
        background: `conic-gradient(hsl(var(--primary)) ${scrollProgress}%, hsl(var(--muted)) ${scrollProgress}%)`,
      }}
      aria-label="Scroll to top"
    >
      <div className="w-full h-full flex items-center justify-center rounded-full bg-background m-1">
        <ArrowUp className="h-5 w-5 text-primary" />
      </div>
    </button>
  );
}

// With text label
export function ScrollToTopWithLabel({ showAfter = 300 }: { showAfter?: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > showAfter);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  if (!show) return null;

  return (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      aria-label="Scroll to top"
    >
      <ArrowUp className="mr-2 h-4 w-4" />
      Back to Top
    </Button>
  );
}

// Keyboard accessible version with more options
export function AccessibleScrollToTop({
  showAfter = 300,
  position = 'bottom-right',
}: {
  showAfter?: number;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > showAfter);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Home' && e.ctrlKey) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showAfter]);

  if (!show) return null;

  const positionClasses = {
    'bottom-right': 'bottom-8 right-8',
    'bottom-left': 'bottom-8 left-8',
    'bottom-center': 'bottom-8 left-1/2 -translate-x-1/2',
  };

  return (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      size="icon"
      className={cn(
        'fixed z-50 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-in fade-in',
        positionClasses[position]
      )}
      aria-label="Scroll to top (Ctrl+Home)"
      title="Scroll to top (Ctrl+Home)"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}

