/**
 * @fileoverview Tests for Tabs component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';

describe('Tabs', () => {
  const renderTabs = (props = {}) => {
    return render(
      <Tabs defaultValue="tab1" {...props}>
        <TabsList aria-label="Test tabs">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );
  };

  describe('Rendering', () => {
    it('should render tabs', () => {
      renderTabs();

      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getAllByRole('tab')).toHaveLength(3);
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('should render with default selected tab', () => {
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 1')).toBeVisible();
    });

    it('should render horizontal orientation by default', () => {
      renderTabs();

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should render vertical orientation', () => {
      renderTabs({ orientation: 'vertical' });

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  describe('Tab Selection', () => {
    it('should select tab on click', () => {
      renderTabs();

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      fireEvent.click(tab2);

      expect(tab2).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Content 2')).toBeVisible();
    });

    it('should hide previous content', () => {
      renderTabs();

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      fireEvent.click(tab2);

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('should call onValueChange', () => {
      const onValueChange = jest.fn();
      renderTabs({ onValueChange });

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      fireEvent.click(tab2);

      expect(onValueChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('Controlled Mode', () => {
    it('should work in controlled mode', () => {
      const { rerender } = render(
        <Tabs value="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeVisible();

      rerender(
        <Tabs value="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 2')).toBeVisible();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with ArrowRight', () => {
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      fireEvent.keyDown(tab1, { key: 'ArrowRight' });

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });

    it('should navigate with ArrowLeft', () => {
      renderTabs();

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      fireEvent.click(tab2);
      tab2.focus();

      fireEvent.keyDown(tab2, { key: 'ArrowLeft' });

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('aria-selected', 'true');
    });

    it('should wrap around with ArrowRight', () => {
      renderTabs();

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      fireEvent.click(tab3);
      tab3.focus();

      fireEvent.keyDown(tab3, { key: 'ArrowRight' });

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('aria-selected', 'true');
    });

    it('should wrap around with ArrowLeft', () => {
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      fireEvent.keyDown(tab1, { key: 'ArrowLeft' });

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      expect(tab3).toHaveAttribute('aria-selected', 'true');
    });

    it('should navigate with Home key', () => {
      renderTabs();

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      fireEvent.click(tab3);
      tab3.focus();

      fireEvent.keyDown(tab3, { key: 'Home' });

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('aria-selected', 'true');
    });

    it('should navigate with End key', () => {
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      fireEvent.keyDown(tab1, { key: 'End' });

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' });
      expect(tab3).toHaveAttribute('aria-selected', 'true');
    });

    it('should navigate with ArrowDown in vertical orientation', () => {
      renderTabs({ orientation: 'vertical' });

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      fireEvent.keyDown(tab1, { key: 'ArrowDown' });

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2).toHaveAttribute('aria-selected', 'true');
    });

    it('should navigate with ArrowUp in vertical orientation', () => {
      renderTabs({ orientation: 'vertical' });

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      fireEvent.click(tab2);
      tab2.focus();

      fireEvent.keyDown(tab2, { key: 'ArrowUp' });

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderTabs();

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Test tabs');

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      expect(tab1).toHaveAttribute('aria-selected');
      expect(tab1).toHaveAttribute('aria-controls', 'panel-tab1');
      expect(tab1).toHaveAttribute('id', 'tab-tab1');
    });

    it('should have proper tabindex', () => {
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

      expect(tab1).toHaveAttribute('tabindex', '0');
      expect(tab2).toHaveAttribute('tabindex', '-1');
    });

    it('should connect tabs with panels', () => {
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      const panel = screen.getByRole('tabpanel');

      expect(tab1).toHaveAttribute('aria-controls', panel.id);
      expect(panel).toHaveAttribute('aria-labelledby', tab1.id);
    });

    it('should be focusable', () => {
      renderTabs();

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
      tab1.focus();

      expect(document.activeElement).toBe(tab1);
    });
  });

  describe('Disabled State', () => {
    it('should render disabled tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      expect(tab2).toBeDisabled();
    });

    it('should not select disabled tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" disabled>
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
      fireEvent.click(tab2);

      expect(tab2).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Force Mount', () => {
    it('should render content with forceMount', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2" forceMount>
            Content 2
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.getByText('Content 2')).toHaveAttribute('hidden');
    });
  });

  describe('Custom Styling', () => {
    it('should accept className', () => {
      render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <TabsList className="custom-list">
            <TabsTrigger value="tab1" className="custom-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="custom-content">
            Content
          </TabsContent>
        </Tabs>
      );

      expect(screen.getByRole('tablist').parentElement).toHaveClass('custom-tabs');
      expect(screen.getByRole('tablist')).toHaveClass('custom-list');
      expect(screen.getByRole('tab')).toHaveClass('custom-trigger');
      expect(screen.getByRole('tabpanel')).toHaveClass('custom-content');
    });
  });

  describe('Error Handling', () => {
    it('should throw error if used outside Tabs', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TabsList>Test</TabsList>);
      }).toThrow('Tabs components must be used within a Tabs component');

      consoleSpy.mockRestore();
    });
  });
});

