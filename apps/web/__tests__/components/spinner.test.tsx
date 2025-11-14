/**
 * Tests for Spinner Components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Spinner,
  SpinnerWithText,
  InlineSpinner,
  FullscreenSpinner,
  DotsSpinner,
  ProgressSpinner,
  PulseLoader,
  BarLoader,
} from '@/components/ui/spinner';

describe('Spinner Components', () => {
  describe('Spinner', () => {
    it('should render with default props', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<Spinner label="Custom loading message" />);
      expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    });

    it('should apply size variants', () => {
      const { rerender } = render(<Spinner size="sm" />);
      expect(screen.getByRole('status').firstChild).toHaveClass('h-4');

      rerender(<Spinner size="lg" />);
      expect(screen.getByRole('status').firstChild).toHaveClass('h-8');
    });

    it('should apply color variants', () => {
      render(<Spinner variant="primary" />);
      expect(screen.getByRole('status').firstChild).toHaveClass('text-blue-600');
    });

    it('should have aria role status', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have visually hidden label for screen readers', () => {
      render(<Spinner label="Loading data" />);
      const label = screen.getByText('Loading data');
      expect(label).toHaveClass('sr-only');
    });
  });

  describe('SpinnerWithText', () => {
    it('should render spinner with visible text', () => {
      render(<SpinnerWithText text="Please wait..." />);
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
      expect(screen.getByText('Please wait...')).not.toHaveClass('sr-only');
    });

    it('should use default text', () => {
      render(<SpinnerWithText />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('InlineSpinner', () => {
    it('should render small spinner', () => {
      render(<InlineSpinner />);
      const spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass('h-4'); // sm size
    });
  });

  describe('FullscreenSpinner', () => {
    it('should render with overlay by default', () => {
      const { container } = render(<FullscreenSpinner />);
      const overlay = container.firstChild;
      
      expect(overlay).toHaveClass('fixed');
      expect(overlay).toHaveClass('inset-0');
      expect(overlay).toHaveClass('bg-white/80');
    });

    it('should render without overlay when disabled', () => {
      const { container } = render(<FullscreenSpinner overlay={false} />);
      const overlay = container.firstChild;
      
      expect(overlay).toHaveClass('fixed');
      expect(overlay).not.toHaveClass('bg-white/80');
    });

    it('should display optional text', () => {
      render(<FullscreenSpinner text="Loading application..." />);
      expect(screen.getByText('Loading application...')).toBeInTheDocument();
    });

    it('should use xl size by default', () => {
      render(<FullscreenSpinner />);
      const spinner = screen.getByRole('status').firstChild;
      expect(spinner).toHaveClass('h-12'); // xl size
    });
  });

  describe('DotsSpinner', () => {
    it('should render three dots', () => {
      const { container } = render(<DotsSpinner />);
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots).toHaveLength(3);
    });

    it('should apply size variants', () => {
      const { container, rerender } = render(<DotsSpinner size="sm" />);
      let dots = container.querySelectorAll('.rounded-full');
      dots.forEach((dot) => {
        expect(dot).toHaveClass('h-1');
      });

      rerender(<DotsSpinner size="lg" />);
      dots = container.querySelectorAll('.rounded-full');
      dots.forEach((dot) => {
        expect(dot).toHaveClass('h-3');
      });
    });

    it('should apply color variants', () => {
      const { container } = render(<DotsSpinner variant="primary" />);
      const dots = container.querySelectorAll('.rounded-full');
      dots.forEach((dot) => {
        expect(dot).toHaveClass('bg-blue-600');
      });
    });

    it('should have status role', () => {
      render(<DotsSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('ProgressSpinner', () => {
    it('should display progress percentage', () => {
      render(<ProgressSpinner progress={75} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should hide percentage when disabled', () => {
      render(<ProgressSpinner progress={50} showPercentage={false} />);
      expect(screen.queryByText('50%')).not.toBeInTheDocument();
    });

    it('should render SVG circles', () => {
      const { container } = render(<ProgressSpinner progress={60} />);
      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2); // background and progress
    });

    it('should round progress display', () => {
      render(<ProgressSpinner progress={66.7} />);
      expect(screen.getByText('67%')).toBeInTheDocument();
    });

    it('should handle 0 progress', () => {
      render(<ProgressSpinner progress={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle 100 progress', () => {
      render(<ProgressSpinner progress={100} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('PulseLoader', () => {
    it('should render default count of dots', () => {
      const { container } = render(<PulseLoader />);
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots).toHaveLength(3);
    });

    it('should render custom count', () => {
      const { container } = render(<PulseLoader count={5} />);
      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots).toHaveLength(5);
    });

    it('should apply size variants', () => {
      const { container } = render(<PulseLoader size="lg" />);
      const dots = container.querySelectorAll('.animate-bounce');
      dots.forEach((dot) => {
        expect(dot).toHaveClass('h-4');
      });
    });

    it('should have staggered animation delays', () => {
      const { container } = render(<PulseLoader count={3} />);
      const dots = container.querySelectorAll('.animate-bounce');
      
      expect(dots[0]).toHaveStyle({ animationDelay: '0s' });
      expect(dots[1]).toHaveStyle({ animationDelay: '0.1s' });
      expect(dots[2]).toHaveStyle({ animationDelay: '0.2s' });
    });

    it('should have status role', () => {
      render(<PulseLoader />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('BarLoader', () => {
    it('should render with default dimensions', () => {
      const { container } = render(<BarLoader />);
      const bar = container.firstChild as HTMLElement;
      
      expect(bar).toHaveStyle({ width: '100%', height: '4px' });
    });

    it('should apply custom dimensions', () => {
      const { container } = render(<BarLoader width="200px" height="8px" />);
      const bar = container.firstChild as HTMLElement;
      
      expect(bar).toHaveStyle({ width: '200px', height: '8px' });
    });

    it('should apply color variants', () => {
      const { container } = render(<BarLoader variant="primary" />);
      const animatedBar = container.querySelector('.bg-blue-600');
      expect(animatedBar).toBeInTheDocument();
    });

    it('should have status role', () => {
      render(<BarLoader />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have animation styles', () => {
      const { container } = render(<BarLoader />);
      const animatedBar = container.querySelector('[class*="animate"]');
      expect(animatedBar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('all spinners should have role="status"', () => {
      const { rerender } = render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<DotsSpinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<PulseLoader />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      rerender(<BarLoader />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('all spinners should have screen reader text', () => {
      const { rerender } = render(<Spinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      rerender(<DotsSpinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      rerender(<PulseLoader />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      rerender(<BarLoader />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});

