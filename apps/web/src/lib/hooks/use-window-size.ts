/**
 * useWindowSize Hook
 * Tracks window dimensions
 */

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Get window size
 * 
 * @returns Window dimensions
 * 
 * @example
 * ```tsx
 * const { width, height } = useWindowSize();
 * 
 * return (
 *   <div>
 *     Window size: {width} x {height}
 *   </div>
 * );
 * ```
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * useWindowWidth Hook
 * Get window width only
 */
export function useWindowWidth(): number {
  const { width } = useWindowSize();
  return width;
}

/**
 * useWindowHeight Hook
 * Get window height only
 */
export function useWindowHeight(): number {
  const { height } = useWindowSize();
  return height;
}

