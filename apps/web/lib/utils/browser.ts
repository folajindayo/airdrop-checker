/**
 * @fileoverview Browser utility functions
 * 
 * Provides utilities for browser detection, feature detection,
 * and browser-specific operations
 */

/**
 * Browser information
 */
export interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Detect browser information
 */
export function getBrowserInfo(): BrowserInfo {
  const ua = navigator.userAgent;
  
  // Detect browser name and version
  let name = 'Unknown';
  let version = 'Unknown';

  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    name = 'Chrome';
    version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    name = 'Safari';
    version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Firefox')) {
    name = 'Firefox';
    version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Edg')) {
    name = 'Edge';
    version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('MSIE') || ua.includes('Trident')) {
    name = 'Internet Explorer';
    version = ua.match(/(?:MSIE |rv:)(\d+\.\d+)/)?.[1] || 'Unknown';
  }

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  }

  // Detect device type
  const isMobile = /Mobile|Android|iPhone/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  const isDesktop = !isMobile && !isTablet;

  return {
    name,
    version,
    os,
    isMobile,
    isTablet,
    isDesktop,
  };
}

/**
 * Check if browser is supported
 */
export function isBrowserSupported(): boolean {
  const info = getBrowserInfo();
  
  const minVersions: Record<string, number> = {
    Chrome: 90,
    Safari: 14,
    Firefox: 88,
    Edge: 90,
  };

  const minVersion = minVersions[info.name];
  if (!minVersion) return false;

  const version = parseInt(info.version, 10);
  return !isNaN(version) && version >= minVersion;
}

/**
 * Check if feature is supported
 */
export function isFeatureSupported(feature: string): boolean {
  const features: Record<string, () => boolean> = {
    webgl: () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        );
      } catch {
        return false;
      }
    },
    webgl2: () => {
      try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
      } catch {
        return false;
      }
    },
    localStorage: () => {
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    },
    sessionStorage: () => {
      try {
        const test = '__test__';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    },
    indexedDB: () => {
      return typeof indexedDB !== 'undefined';
    },
    serviceWorker: () => {
      return 'serviceWorker' in navigator;
    },
    webWorker: () => {
      return typeof Worker !== 'undefined';
    },
    geolocation: () => {
      return 'geolocation' in navigator;
    },
    notifications: () => {
      return 'Notification' in window;
    },
    clipboard: () => {
      return 'clipboard' in navigator;
    },
    webRTC: () => {
      return !!(
        (window as any).RTCPeerConnection ||
        (window as any).webkitRTCPeerConnection ||
        (window as any).mozRTCPeerConnection
      );
    },
    webSocket: () => {
      return 'WebSocket' in window;
    },
    mediaDevices: () => {
      return 'mediaDevices' in navigator;
    },
    getUserMedia: () => {
      return !!(
        navigator.mediaDevices?.getUserMedia ||
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia
      );
    },
    crypto: () => {
      return 'crypto' in window && 'subtle' in crypto;
    },
    intersectionObserver: () => {
      return 'IntersectionObserver' in window;
    },
    resizeObserver: () => {
      return 'ResizeObserver' in window;
    },
    mutationObserver: () => {
      return 'MutationObserver' in window;
    },
    fetch: () => {
      return 'fetch' in window;
    },
    promises: () => {
      return 'Promise' in window;
    },
    asyncAwait: () => {
      try {
        eval('(async () => {})');
        return true;
      } catch {
        return false;
      }
    },
    modules: () => {
      return 'noModule' in document.createElement('script');
    },
    touchEvents: () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    pointerEvents: () => {
      return 'PointerEvent' in window;
    },
    webAssembly: () => {
      return 'WebAssembly' in window;
    },
  };

  return features[feature]?.() ?? false;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Read text from clipboard
 */
export async function readFromClipboard(): Promise<string | null> {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get cookie value
 */
export function getCookie(name: string): string | null {
  const matches = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1')}=([^;]*)`)
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

/**
 * Set cookie
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  } = {}
): void {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    if (typeof options.expires === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    } else {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += '; secure';
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Delete cookie
 */
export function deleteCookie(name: string, path?: string, domain?: string): void {
  setCookie(name, '', {
    expires: new Date(0),
    path,
    domain,
  });
}

/**
 * Get viewport dimensions
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/**
 * Get scroll position
 */
export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop,
  };
}

/**
 * Scroll to element
 */
export function scrollToElement(
  element: HTMLElement | string,
  options?: ScrollIntoViewOptions
): void {
  const el =
    typeof element === 'string'
      ? document.querySelector<HTMLElement>(element)
      : element;

  if (el) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options,
    });
  }
}

/**
 * Smooth scroll to top
 */
export function scrollToTop(smooth = true): void {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Get element offset
 */
export function getElementOffset(element: HTMLElement): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  const scroll = getScrollPosition();

  return {
    top: rect.top + scroll.y,
    left: rect.left + scroll.x,
  };
}

/**
 * Request fullscreen
 */
export async function requestFullscreen(element?: HTMLElement): Promise<boolean> {
  try {
    const el = element || document.documentElement;

    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else if ((el as any).webkitRequestFullscreen) {
      await (el as any).webkitRequestFullscreen();
    } else if ((el as any).mozRequestFullScreen) {
      await (el as any).mozRequestFullScreen();
    } else if ((el as any).msRequestFullscreen) {
      await (el as any).msRequestFullscreen();
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Exit fullscreen
 */
export async function exitFullscreen(): Promise<boolean> {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen();
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Check if in fullscreen
 */
export function isFullscreen(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}

/**
 * Vibrate device
 */
export function vibrate(pattern: number | number[]): boolean {
  if ('vibrate' in navigator) {
    return navigator.vibrate(pattern);
  }
  return false;
}

/**
 * Share content
 */
export async function share(data: ShareData): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Get connection info
 */
export function getConnectionInfo() {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData,
  };
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if dark mode is preferred
 */
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get device pixel ratio
 */
export function getDevicePixelRatio(): number {
  return window.devicePixelRatio || 1;
}

/**
 * Print page
 */
export function print(): void {
  window.print();
}

/**
 * Reload page
 */
export function reload(forceReload = false): void {
  window.location.reload();
}

/**
 * Go back in history
 */
export function goBack(): void {
  window.history.back();
}

/**
 * Go forward in history
 */
export function goForward(): void {
  window.history.forward();
}

