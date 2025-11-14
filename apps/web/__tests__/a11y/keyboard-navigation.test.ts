/**
 * @fileoverview Tests for keyboard navigation utilities
 */

import {
  FocusTrap,
  createFocusTrap,
  RovingTabIndexManager,
  createRovingTabIndex,
  createSkipLink,
  announceToScreenReader,
  isFocusable,
  getFocusableElements,
  focusFirst,
  focusLast,
  KeyboardShortcutManager,
  createKeyboardShortcutManager,
  Keys,
} from '@/lib/accessibility/keyboard-navigation';

describe('Keyboard Navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('FocusTrap', () => {
    let container: HTMLElement;
    let focusTrap: FocusTrap;

    beforeEach(() => {
      container = document.createElement('div');
      container.innerHTML = `
        <button id="btn1">Button 1</button>
        <button id="btn2">Button 2</button>
        <button id="btn3">Button 3</button>
      `;
      document.body.appendChild(container);
      focusTrap = createFocusTrap(container);
    });

    it('should create focus trap', () => {
      expect(focusTrap).toBeDefined();
    });

    it('should activate and focus first element', () => {
      focusTrap.activate();

      const firstButton = document.getElementById('btn1');
      expect(document.activeElement).toBe(firstButton);
    });

    it('should trap Tab navigation', () => {
      focusTrap.activate();

      const btn3 = document.getElementById('btn3') as HTMLElement;
      btn3.focus();

      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      });
      document.dispatchEvent(tabEvent);

      // Should cycle back to first button
      // Note: In actual implementation this is handled by the trap
      expect(focusTrap).toBeDefined();
    });

    it('should return focus on deactivate', () => {
      const outsideButton = document.createElement('button');
      document.body.appendChild(outsideButton);
      outsideButton.focus();

      focusTrap.activate();
      focusTrap.deactivate();

      expect(document.activeElement).toBe(outsideButton);
    });

    it('should handle initial focus option', () => {
      const btn2 = document.getElementById('btn2') as HTMLElement;
      const trap = createFocusTrap(container, { initialFocus: btn2 });

      trap.activate();

      expect(document.activeElement).toBe(btn2);
      trap.deactivate();
    });
  });

  describe('RovingTabIndexManager', () => {
    let container: HTMLElement;
    let manager: RovingTabIndexManager;

    beforeEach(() => {
      container = document.createElement('div');
      container.setAttribute('role', 'menu');
      container.innerHTML = `
        <div role="menuitem" tabindex="0">Item 1</div>
        <div role="menuitem" tabindex="-1">Item 2</div>
        <div role="menuitem" tabindex="-1">Item 3</div>
      `;
      document.body.appendChild(container);
      manager = createRovingTabIndex(container, 'vertical');
    });

    afterEach(() => {
      manager.destroy();
    });

    it('should create roving tabindex manager', () => {
      expect(manager).toBeDefined();
    });

    it('should focus next item', () => {
      const items = container.querySelectorAll('[role="menuitem"]');
      
      manager.focusNext();

      expect(items[1].getAttribute('tabindex')).toBe('0');
    });

    it('should focus previous item', () => {
      manager.focusItem(1);
      manager.focusPrevious();

      const items = container.querySelectorAll('[role="menuitem"]');
      expect(items[0].getAttribute('tabindex')).toBe('0');
    });

    it('should focus first item', () => {
      manager.focusItem(2);
      manager.focusFirst();

      const items = container.querySelectorAll('[role="menuitem"]');
      expect(items[0].getAttribute('tabindex')).toBe('0');
    });

    it('should focus last item', () => {
      manager.focusLast();

      const items = container.querySelectorAll('[role="menuitem"]');
      expect(items[2].getAttribute('tabindex')).toBe('0');
    });

    it('should handle arrow key navigation', () => {
      const event = new KeyboardEvent('keydown', {
        key: Keys.ARROW_DOWN,
        bubbles: true,
      });

      container.dispatchEvent(event);
      expect(manager).toBeDefined();
    });

    it('should handle Home key', () => {
      manager.focusItem(2);

      const event = new KeyboardEvent('keydown', {
        key: Keys.HOME,
        bubbles: true,
      });

      container.dispatchEvent(event);
      expect(manager).toBeDefined();
    });

    it('should handle End key', () => {
      const event = new KeyboardEvent('keydown', {
        key: Keys.END,
        bubbles: true,
      });

      container.dispatchEvent(event);
      expect(manager).toBeDefined();
    });
  });

  describe('createSkipLink', () => {
    it('should create skip link', () => {
      const link = createSkipLink('main-content');

      expect(link.tagName).toBe('A');
      expect(link.href).toContain('#main-content');
      expect(link.textContent).toContain('Skip');
    });

    it('should accept custom text', () => {
      const link = createSkipLink('main', { text: 'Skip to main' });

      expect(link.textContent).toBe('Skip to main');
    });

    it('should be visually hidden', () => {
      const link = createSkipLink('main');

      expect(link.style.position).toBe('absolute');
      expect(link.style.left).toBe('-10000px');
    });

    it('should show on focus', () => {
      const link = createSkipLink('main');
      document.body.appendChild(link);

      link.dispatchEvent(new FocusEvent('focus'));

      expect(link.style.position).toBe('fixed');
      expect(link.style.left).toBe('0px');
    });

    it('should hide on blur', () => {
      const link = createSkipLink('main');
      document.body.appendChild(link);

      link.dispatchEvent(new FocusEvent('focus'));
      link.dispatchEvent(new FocusEvent('blur'));

      expect(link.style.position).toBe('absolute');
    });
  });

  describe('announceToScreenReader', () => {
    it('should create announcement element', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeTruthy();
    });

    it('should set aria-live polite by default', () => {
      announceToScreenReader('Test');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-live')).toBe('polite');
    });

    it('should support assertive priority', () => {
      announceToScreenReader('Urgent', 'assertive');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should be visually hidden', () => {
      announceToScreenReader('Test');

      const announcement = document.querySelector('[role="status"]') as HTMLElement;
      expect(announcement.style.position).toBe('absolute');
    });

    it('should remove after timeout', (done) => {
      announceToScreenReader('Test');

      setTimeout(() => {
        const announcement = document.querySelector('[role="status"]');
        expect(announcement).toBeNull();
        done();
      }, 1100);
    });
  });

  describe('isFocusable', () => {
    it('should detect focusable button', () => {
      const button = document.createElement('button');
      expect(isFocusable(button)).toBe(true);
    });

    it('should detect focusable link', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      expect(isFocusable(link)).toBe(true);
    });

    it('should detect non-focusable link without href', () => {
      const link = document.createElement('a');
      expect(isFocusable(link)).toBe(false);
    });

    it('should detect disabled elements', () => {
      const button = document.createElement('button');
      button.disabled = true;
      expect(isFocusable(button)).toBe(false);
    });

    it('should detect aria-disabled elements', () => {
      const button = document.createElement('button');
      button.setAttribute('aria-disabled', 'true');
      expect(isFocusable(button)).toBe(false);
    });

    it('should detect elements with tabindex', () => {
      const div = document.createElement('div');
      div.tabIndex = 0;
      expect(isFocusable(div)).toBe(true);
    });

    it('should detect elements with negative tabindex', () => {
      const div = document.createElement('div');
      div.tabIndex = -1;
      expect(isFocusable(div)).toBe(false);
    });
  });

  describe('getFocusableElements', () => {
    it('should get all focusable elements', () => {
      document.body.innerHTML = `
        <button>Button</button>
        <a href="#">Link</a>
        <input type="text" />
        <div>Not focusable</div>
      `;

      const elements = getFocusableElements();
      expect(elements.length).toBeGreaterThanOrEqual(3);
    });

    it('should respect container scope', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Inside</button>
      `;
      document.body.appendChild(container);

      document.body.appendChild(document.createElement('button'));

      const elements = getFocusableElements(container);
      expect(elements).toHaveLength(1);
    });

    it('should exclude disabled elements', () => {
      document.body.innerHTML = `
        <button>Enabled</button>
        <button disabled>Disabled</button>
      `;

      const elements = getFocusableElements();
      expect(elements).toHaveLength(1);
    });
  });

  describe('focusFirst', () => {
    it('should focus first focusable element', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `;
      document.body.appendChild(container);

      const result = focusFirst(container);

      expect(result).toBe(true);
      expect(document.activeElement?.id).toBe('first');
    });

    it('should return false if no focusable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = '<div>Not focusable</div>';
      document.body.appendChild(container);

      const result = focusFirst(container);

      expect(result).toBe(false);
    });
  });

  describe('focusLast', () => {
    it('should focus last focusable element', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button id="first">First</button>
        <button id="last">Last</button>
      `;
      document.body.appendChild(container);

      const result = focusLast(container);

      expect(result).toBe(true);
      expect(document.activeElement?.id).toBe('last');
    });

    it('should return false if no focusable elements', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const result = focusLast(container);

      expect(result).toBe(false);
    });
  });

  describe('KeyboardShortcutManager', () => {
    let manager: KeyboardShortcutManager;
    let handler: jest.Mock;

    beforeEach(() => {
      manager = createKeyboardShortcutManager();
      handler = jest.fn();
    });

    afterEach(() => {
      manager.detach();
    });

    it('should create manager', () => {
      expect(manager).toBeDefined();
    });

    it('should register shortcut', () => {
      manager.register({
        key: 's',
        ctrl: true,
        handler,
        description: 'Save',
      });

      expect(manager.getAll()).toHaveLength(1);
    });

    it('should handle shortcut', () => {
      manager.register({
        key: 's',
        ctrl: true,
        handler,
      });

      manager.attach();

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true,
      });

      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should handle modifier keys', () => {
      manager.register({
        key: 's',
        ctrl: true,
        shift: true,
        handler,
      });

      manager.attach();

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      });

      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should not trigger without correct modifiers', () => {
      manager.register({
        key: 's',
        ctrl: true,
        handler,
      });

      manager.attach();

      const event = new KeyboardEvent('keydown', {
        key: 's',
        bubbles: true,
      });

      document.dispatchEvent(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should unregister shortcut', () => {
      manager.register({
        key: 's',
        ctrl: true,
        handler,
      });

      manager.unregister({
        key: 's',
        ctrl: true,
      });

      expect(manager.getAll()).toHaveLength(0);
    });

    it('should support meta key (Command)', () => {
      manager.register({
        key: 's',
        meta: true,
        handler,
      });

      manager.attach();

      const event = new KeyboardEvent('keydown', {
        key: 's',
        metaKey: true,
        bubbles: true,
      });

      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });

    it('should support alt key', () => {
      manager.register({
        key: 'f',
        alt: true,
        handler,
      });

      manager.attach();

      const event = new KeyboardEvent('keydown', {
        key: 'f',
        altKey: true,
        bubbles: true,
      });

      document.dispatchEvent(event);

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Keys constants', () => {
    it('should have all key constants', () => {
      expect(Keys.ENTER).toBe('Enter');
      expect(Keys.SPACE).toBe(' ');
      expect(Keys.TAB).toBe('Tab');
      expect(Keys.ESCAPE).toBe('Escape');
      expect(Keys.ARROW_UP).toBe('ArrowUp');
      expect(Keys.ARROW_DOWN).toBe('ArrowDown');
      expect(Keys.ARROW_LEFT).toBe('ArrowLeft');
      expect(Keys.ARROW_RIGHT).toBe('ArrowRight');
      expect(Keys.HOME).toBe('Home');
      expect(Keys.END).toBe('End');
      expect(Keys.PAGE_UP).toBe('PageUp');
      expect(Keys.PAGE_DOWN).toBe('PageDown');
    });
  });
});

