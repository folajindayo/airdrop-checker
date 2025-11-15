/**
 * @fileoverview Tests for browser utilities
 */

import {
  getBrowserInfo,
  isBrowserSupported,
  isFeatureSupported,
  copyToClipboard,
  getCookie,
  setCookie,
  deleteCookie,
  getViewportSize,
  getScrollPosition,
  scrollToTop,
  isInViewport,
  getElementOffset,
  isFullscreen,
  vibrate,
  isOnline,
  prefersReducedMotion,
  prefersDarkMode,
  getDevicePixelRatio,
  goBack,
  goForward,
} from '@/lib/utils/browser';

describe('Browser Utilities', () => {
  describe('getBrowserInfo', () => {
    it('should return browser information', () => {
      const info = getBrowserInfo();

      expect(info).toHaveProperty('name');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('os');
      expect(info).toHaveProperty('isMobile');
      expect(info).toHaveProperty('isTablet');
      expect(info).toHaveProperty('isDesktop');
    });

    it('should detect device type', () => {
      const info = getBrowserInfo();

      const count = [info.isMobile, info.isTablet, info.isDesktop].filter(Boolean).length;
      expect(count).toBe(1);
    });
  });

  describe('isBrowserSupported', () => {
    it('should check browser support', () => {
      const supported = isBrowserSupported();

      expect(typeof supported).toBe('boolean');
    });
  });

  describe('isFeatureSupported', () => {
    it('should check localStorage support', () => {
      const supported = isFeatureSupported('localStorage');

      expect(typeof supported).toBe('boolean');
    });

    it('should check fetch support', () => {
      const supported = isFeatureSupported('fetch');

      expect(supported).toBe(true);
    });

    it('should return false for unknown feature', () => {
      const supported = isFeatureSupported('unknown-feature');

      expect(supported).toBe(false);
    });

    it('should check multiple features', () => {
      const features = [
        'localStorage',
        'sessionStorage',
        'fetch',
        'promises',
      ];

      features.forEach((feature) => {
        expect(typeof isFeatureSupported(feature)).toBe('boolean');
      });
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      const result = await copyToClipboard('test text');

      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('should handle clipboard errors', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockRejectedValue(new Error('Failed')),
        },
      });

      const result = await copyToClipboard('test');

      expect(result).toBe(false);
    });
  });

  describe('Cookie Management', () => {
    beforeEach(() => {
      // Clear all cookies
      document.cookie.split(';').forEach((cookie) => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });
    });

    it('should set and get cookie', () => {
      setCookie('test', 'value');

      expect(getCookie('test')).toBe('value');
    });

    it('should set cookie with options', () => {
      setCookie('test', 'value', {
        path: '/',
        secure: true,
        sameSite: 'strict',
      });

      expect(getCookie('test')).toBe('value');
    });

    it('should delete cookie', () => {
      setCookie('test', 'value');
      deleteCookie('test');

      expect(getCookie('test')).toBeNull();
    });

    it('should return null for non-existent cookie', () => {
      expect(getCookie('non-existent')).toBeNull();
    });

    it('should encode cookie values', () => {
      setCookie('test', 'value with spaces');

      expect(getCookie('test')).toBe('value with spaces');
    });
  });

  describe('Viewport and Scroll', () => {
    it('should get viewport size', () => {
      const size = getViewportSize();

      expect(size).toHaveProperty('width');
      expect(size).toHaveProperty('height');
      expect(size.width).toBeGreaterThan(0);
      expect(size.height).toBeGreaterThan(0);
    });

    it('should get scroll position', () => {
      const position = getScrollPosition();

      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(typeof position.x).toBe('number');
      expect(typeof position.y).toBe('number');
    });

    it('should scroll to top', () => {
      const scrollToSpy = jest.spyOn(window, 'scrollTo');

      scrollToTop(true);

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });

      scrollToSpy.mockRestore();
    });

    it('should scroll to top without smooth', () => {
      const scrollToSpy = jest.spyOn(window, 'scrollTo');

      scrollToTop(false);

      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'auto',
      });

      scrollToSpy.mockRestore();
    });
  });

  describe('Element Utilities', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.removeChild(element);
    });

    it('should check if element is in viewport', () => {
      const inViewport = isInViewport(element);

      expect(typeof inViewport).toBe('boolean');
    });

    it('should get element offset', () => {
      const offset = getElementOffset(element);

      expect(offset).toHaveProperty('top');
      expect(offset).toHaveProperty('left');
      expect(typeof offset.top).toBe('number');
      expect(typeof offset.left).toBe('number');
    });
  });

  describe('Fullscreen', () => {
    it('should check fullscreen state', () => {
      const fullscreen = isFullscreen();

      expect(typeof fullscreen).toBe('boolean');
    });
  });

  describe('Device Features', () => {
    it('should check vibrate support', () => {
      Object.assign(navigator, {
        vibrate: jest.fn().mockReturnValue(true),
      });

      const result = vibrate(200);

      expect(typeof result).toBe('boolean');
    });

    it('should check online status', () => {
      const online = isOnline();

      expect(typeof online).toBe('boolean');
    });

    it('should check reduced motion preference', () => {
      const reducedMotion = prefersReducedMotion();

      expect(typeof reducedMotion).toBe('boolean');
    });

    it('should check dark mode preference', () => {
      const darkMode = prefersDarkMode();

      expect(typeof darkMode).toBe('boolean');
    });

    it('should get device pixel ratio', () => {
      const ratio = getDevicePixelRatio();

      expect(typeof ratio).toBe('number');
      expect(ratio).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('should go back', () => {
      const backSpy = jest.spyOn(window.history, 'back');

      goBack();

      expect(backSpy).toHaveBeenCalled();
      backSpy.mockRestore();
    });

    it('should go forward', () => {
      const forwardSpy = jest.spyOn(window.history, 'forward');

      goForward();

      expect(forwardSpy).toHaveBeenCalled();
      forwardSpy.mockRestore();
    });
  });

  describe('Feature Detection Coverage', () => {
    const features = [
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'serviceWorker',
      'webWorker',
      'geolocation',
      'notifications',
      'clipboard',
      'webSocket',
      'crypto',
      'intersectionObserver',
      'resizeObserver',
      'mutationObserver',
      'fetch',
      'promises',
      'touchEvents',
      'pointerEvents',
    ];

    features.forEach((feature) => {
      it(`should check ${feature} support`, () => {
        const supported = isFeatureSupported(feature);
        expect(typeof supported).toBe('boolean');
      });
    });
  });
});

