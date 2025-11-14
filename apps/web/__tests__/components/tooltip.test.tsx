/**
 * @fileoverview Tests for Tooltip component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tooltip, SimpleTooltip } from '@/components/ui/tooltip';

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('Tooltip', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const renderTooltip = (props = {}) => {
    return render(
      <Tooltip content="Tooltip content" {...props}>
        <button>Trigger</button>
      </Tooltip>
    );
  };

  describe('Rendering', () => {
    it('should render trigger element', () => {
      renderTooltip();

      expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument();
    });

    it('should not show tooltip by default', () => {
      renderTooltip();

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should show tooltip on hover', async () => {
      renderTooltip({ showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Tooltip content')).toBeVisible();
      });
    });

    it('should hide tooltip on mouse leave', async () => {
      renderTooltip({ showDelay: 0, hideDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Delays', () => {
    it('should respect show delay', async () => {
      renderTooltip({ showDelay: 200 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should respect hide delay', async () => {
      renderTooltip({ showDelay: 0, hideDelay: 200 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.mouseLeave(trigger);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });

    it('should cancel show on quick mouse leave', async () => {
      renderTooltip({ showDelay: 200 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      fireEvent.mouseLeave(trigger);

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Support', () => {
    it('should show tooltip on focus', async () => {
      renderTooltip({ showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.focus(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should hide tooltip on blur', async () => {
      renderTooltip({ showDelay: 0, hideDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.focus(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      fireEvent.blur(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      renderTooltip({ showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
      });
    });

    it('should have role tooltip', async () => {
      renderTooltip({ showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should not have aria-describedby when hidden', () => {
      renderTooltip();

      const trigger = screen.getByRole('button');
      expect(trigger).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Placement', () => {
    it('should support top placement', async () => {
      renderTooltip({ placement: 'top', showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should support bottom placement', async () => {
      renderTooltip({ placement: 'bottom', showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should support left placement', async () => {
      renderTooltip({ placement: 'left', showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should support right placement', async () => {
      renderTooltip({ placement: 'right', showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });

    it('should support placement variants', async () => {
      const placements = [
        'top-start',
        'top-end',
        'bottom-start',
        'bottom-end',
        'left-start',
        'left-end',
        'right-start',
        'right-end',
      ] as const;

      for (const placement of placements) {
        const { unmount } = renderTooltip({ placement, showDelay: 0 });

        const trigger = screen.getByRole('button');
        fireEvent.mouseEnter(trigger);

        act(() => {
          jest.advanceTimersByTime(0);
        });

        await waitFor(() => {
          expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('Arrow', () => {
    it('should show arrow by default', async () => {
      renderTooltip({ showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const arrow = tooltip.querySelector('.rotate-45');
        expect(arrow).toBeInTheDocument();
      });
    });

    it('should hide arrow when showArrow is false', async () => {
      renderTooltip({ showArrow: false, showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const arrow = tooltip.querySelector('.rotate-45');
        expect(arrow).not.toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('should not show tooltip when disabled', async () => {
      renderTooltip({ disabled: true, showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Custom Content', () => {
    it('should render custom React content', async () => {
      renderTooltip({
        content: (
          <div>
            <strong>Bold</strong> text
          </div>
        ),
        showDelay: 0,
      });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByText('Bold')).toBeInTheDocument();
        expect(screen.getByText('text')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Styling', () => {
    it('should accept className', async () => {
      renderTooltip({ className: 'custom-tooltip', showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveClass('custom-tooltip');
      });
    });

    it('should accept arrowClassName', async () => {
      renderTooltip({ arrowClassName: 'custom-arrow', showDelay: 0 });

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        const arrow = tooltip.querySelector('.custom-arrow');
        expect(arrow).toBeInTheDocument();
      });
    });
  });

  describe('Event Preservation', () => {
    it('should preserve existing onMouseEnter', async () => {
      const onMouseEnter = jest.fn();

      render(
        <Tooltip content="Test" showDelay={0}>
          <button onMouseEnter={onMouseEnter}>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.mouseEnter(trigger);

      expect(onMouseEnter).toHaveBeenCalled();
    });

    it('should preserve existing onFocus', async () => {
      const onFocus = jest.fn();

      render(
        <Tooltip content="Test" showDelay={0}>
          <button onFocus={onFocus}>Trigger</button>
        </Tooltip>
      );

      const trigger = screen.getByRole('button');
      fireEvent.focus(trigger);

      expect(onFocus).toHaveBeenCalled();
    });
  });
});

describe('SimpleTooltip', () => {
  const renderSimpleTooltip = (props = {}) => {
    return render(
      <SimpleTooltip text="Simple tooltip" {...props}>
        <button>Trigger</button>
      </SimpleTooltip>
    );
  };

  it('should render trigger element', () => {
    renderSimpleTooltip();

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show tooltip on hover', () => {
    renderSimpleTooltip();

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Simple tooltip')).toBeVisible();
  });

  it('should hide tooltip on mouse leave', () => {
    renderSimpleTooltip();

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('should have aria-label', () => {
    renderSimpleTooltip();

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-label', 'Simple tooltip');
  });

  it('should have title attribute', () => {
    renderSimpleTooltip();

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('title', 'Simple tooltip');
  });

  it('should accept custom className', () => {
    renderSimpleTooltip({ className: 'custom-simple' });

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveClass('custom-simple');
  });
});

