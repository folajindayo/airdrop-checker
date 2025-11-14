/**
 * @fileoverview Tests for Accordion component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

describe('Accordion', () => {
  const renderAccordion = (props = {}) => {
    return render(
      <Accordion {...props}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Item 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Item 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Item 3</AccordionTrigger>
          <AccordionContent>Content 3</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  };

  describe('Rendering', () => {
    it('should render accordion', () => {
      renderAccordion();

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should render with default closed state', () => {
      renderAccordion();

      const content1 = screen.getByText('Content 1');
      expect(content1).toHaveAttribute('hidden');
    });

    it('should render with default open item', () => {
      renderAccordion({ defaultValue: 'item-1' });

      const content1 = screen.getByText('Content 1');
      expect(content1).not.toHaveAttribute('hidden');
    });
  });

  describe('Single Mode', () => {
    it('should open item on click', () => {
      renderAccordion({ type: 'single' });

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);

      const content = screen.getByText('Content 1');
      expect(content).not.toHaveAttribute('hidden');
    });

    it('should close previous item when opening new one', () => {
      renderAccordion({ type: 'single', defaultValue: 'item-1' });

      const trigger2 = screen.getByText('Item 2');
      fireEvent.click(trigger2);

      const content1 = screen.getByText('Content 1');
      const content2 = screen.getByText('Content 2');

      expect(content1).toHaveAttribute('hidden');
      expect(content2).not.toHaveAttribute('hidden');
    });

    it('should keep item open if collapsible is false', () => {
      renderAccordion({
        type: 'single',
        defaultValue: 'item-1',
        collapsible: false,
      });

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);

      const content = screen.getByText('Content 1');
      expect(content).not.toHaveAttribute('hidden');
    });

    it('should close item if collapsible is true', () => {
      renderAccordion({
        type: 'single',
        defaultValue: 'item-1',
        collapsible: true,
      });

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);

      const content = screen.getByText('Content 1');
      expect(content).toHaveAttribute('hidden');
    });

    it('should call onValueChange with string', () => {
      const onValueChange = jest.fn();
      renderAccordion({ type: 'single', onValueChange });

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);

      expect(onValueChange).toHaveBeenCalledWith('item-1');
    });
  });

  describe('Multiple Mode', () => {
    it('should allow multiple items open', () => {
      renderAccordion({ type: 'multiple' });

      const trigger1 = screen.getByText('Item 1');
      const trigger2 = screen.getByText('Item 2');

      fireEvent.click(trigger1);
      fireEvent.click(trigger2);

      const content1 = screen.getByText('Content 1');
      const content2 = screen.getByText('Content 2');

      expect(content1).not.toHaveAttribute('hidden');
      expect(content2).not.toHaveAttribute('hidden');
    });

    it('should close individual items', () => {
      renderAccordion({
        type: 'multiple',
        defaultValue: ['item-1', 'item-2'],
      });

      const trigger1 = screen.getByText('Item 1');
      fireEvent.click(trigger1);

      const content1 = screen.getByText('Content 1');
      const content2 = screen.getByText('Content 2');

      expect(content1).toHaveAttribute('hidden');
      expect(content2).not.toHaveAttribute('hidden');
    });

    it('should call onValueChange with array', () => {
      const onValueChange = jest.fn();
      renderAccordion({ type: 'multiple', onValueChange });

      const trigger1 = screen.getByText('Item 1');
      const trigger2 = screen.getByText('Item 2');

      fireEvent.click(trigger1);
      fireEvent.click(trigger2);

      expect(onValueChange).toHaveBeenLastCalledWith(['item-1', 'item-2']);
    });
  });

  describe('Controlled Mode', () => {
    it('should work in controlled mode (single)', () => {
      const { rerender } = render(
        <Accordion type="single" value="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).not.toHaveAttribute('hidden');

      rerender(
        <Accordion type="single" value="item-2">
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 2')).not.toHaveAttribute('hidden');
    });

    it('should work in controlled mode (multiple)', () => {
      const { rerender } = render(
        <Accordion type="multiple" value={['item-1']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).not.toHaveAttribute('hidden');

      rerender(
        <Accordion type="multiple" value={['item-1', 'item-2']}>
          <AccordionItem value="item-1">
            <AccordionTrigger>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Item 2</AccordionTrigger>
            <AccordionContent>Content 2</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Content 1')).not.toHaveAttribute('hidden');
      expect(screen.getByText('Content 2')).not.toHaveAttribute('hidden');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderAccordion({ defaultValue: 'item-1' });

      const trigger = screen.getByText('Item 1');
      const content = screen.getByText('Content 1');

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-controls');
      expect(content).toHaveAttribute('role', 'region');
      expect(content).toHaveAttribute('aria-labelledby');
    });

    it('should update aria-expanded on toggle', () => {
      renderAccordion({ type: 'single', collapsible: true });

      const trigger = screen.getByText('Item 1');

      expect(trigger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should connect trigger and content', () => {
      renderAccordion({ defaultValue: 'item-1' });

      const trigger = screen.getByText('Item 1');
      const content = screen.getByText('Content 1');

      const controlsId = trigger.getAttribute('aria-controls');
      const labelledById = content.getAttribute('aria-labelledby');

      expect(content.id).toBe(controlsId);
      expect(trigger.id).toBe(labelledById);
    });

    it('should wrap trigger in heading', () => {
      renderAccordion();

      const trigger = screen.getByText('Item 1');
      const heading = trigger.closest('h3');

      expect(heading).toBeInTheDocument();
    });

    it('should have button type', () => {
      renderAccordion();

      const trigger = screen.getByText('Item 1');

      expect(trigger.tagName).toBe('BUTTON');
      expect(trigger).toHaveAttribute('type', 'button');
    });
  });

  describe('Disabled State', () => {
    it('should disable entire accordion', () => {
      renderAccordion({ disabled: true });

      const trigger1 = screen.getByText('Item 1');
      const trigger2 = screen.getByText('Item 2');

      expect(trigger1).toBeDisabled();
      expect(trigger2).toBeDisabled();
    });

    it('should not toggle when accordion is disabled', () => {
      renderAccordion({ disabled: true });

      const trigger = screen.getByText('Item 1');
      fireEvent.click(trigger);

      const content = screen.getByText('Content 1');
      expect(content).toHaveAttribute('hidden');
    });

    it('should disable individual item', () => {
      render(
        <Accordion>
          <AccordionItem value="item-1" disabled>
            <AccordionTrigger disabled>Item 1</AccordionTrigger>
            <AccordionContent>Content 1</AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      const trigger = screen.getByText('Item 1');
      expect(trigger).toBeDisabled();
    });
  });

  describe('Data Attributes', () => {
    it('should set data-state on item', () => {
      renderAccordion({ defaultValue: 'item-1' });

      const trigger1 = screen.getByText('Item 1').closest('button');
      const trigger2 = screen.getByText('Item 2').closest('button');

      expect(trigger1).toHaveAttribute('data-state', 'open');
      expect(trigger2).toHaveAttribute('data-state', 'closed');
    });

    it('should set data-state on content', () => {
      renderAccordion({ defaultValue: 'item-1' });

      const content1 = screen.getByText('Content 1').closest('[role="region"]');
      const content2 = screen.getByText('Content 2').closest('[role="region"]');

      expect(content1).toHaveAttribute('data-state', 'open');
      expect(content2).toHaveAttribute('data-state', 'closed');
    });
  });

  describe('Custom Styling', () => {
    it('should accept className', () => {
      render(
        <Accordion className="custom-accordion">
          <AccordionItem value="item-1" className="custom-item">
            <AccordionTrigger className="custom-trigger">
              Item 1
            </AccordionTrigger>
            <AccordionContent className="custom-content">
              Content 1
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );

      expect(screen.getByText('Item 1').closest('.custom-accordion')).toBeInTheDocument();
      expect(screen.getByText('Item 1').closest('.custom-item')).toBeInTheDocument();
      expect(screen.getByText('Item 1').closest('button')).toHaveClass('custom-trigger');
      expect(screen.getByText('Content 1').closest('[role="region"]')).toHaveClass('custom-content');
    });
  });

  describe('Animation', () => {
    it('should have transition classes', () => {
      renderAccordion();

      const content = screen.getByText('Content 1').closest('[role="region"]');

      expect(content?.className).toContain('transition');
    });

    it('should have chevron icon', () => {
      renderAccordion();

      const trigger = screen.getByText('Item 1').closest('button');
      const svg = trigger?.querySelector('svg');

      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Error Handling', () => {
    it('should throw error if AccordionItem used outside Accordion', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(
          <AccordionItem value="test">
            <div>Test</div>
          </AccordionItem>
        );
      }).toThrow();

      consoleSpy.mockRestore();
    });

    it('should throw error if AccordionTrigger used outside AccordionItem', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(
          <Accordion>
            <AccordionTrigger>Test</AccordionTrigger>
          </Accordion>
        );
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });
});

