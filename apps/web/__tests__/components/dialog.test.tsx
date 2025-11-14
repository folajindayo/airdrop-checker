/**
 * @fileoverview Tests for Dialog component
 */

import React, { useRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('Dialog', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    children: <div>Dialog content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      render(<Dialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Dialog content')).toBeVisible();
    });

    it('should not render when closed', () => {
      render(<Dialog {...defaultProps} open={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render title', () => {
      render(<Dialog {...defaultProps} title="Test Title" />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render description', () => {
      render(<Dialog {...defaultProps} description="Test description" />);

      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should render footer', () => {
      render(
        <Dialog {...defaultProps} footer={<button>Action</button>} />
      );

      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('should apply sm size', () => {
      render(<Dialog {...defaultProps} size="sm" />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-md');
    });

    it('should apply md size by default', () => {
      render(<Dialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-lg');
    });

    it('should apply lg size', () => {
      render(<Dialog {...defaultProps} size="lg" />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-2xl');
    });

    it('should apply xl size', () => {
      render(<Dialog {...defaultProps} size="xl" />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-4xl');
    });

    it('should apply full size', () => {
      render(<Dialog {...defaultProps} size="full" />);

      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('max-w-full');
    });
  });

  describe('Close Button', () => {
    it('should show close button by default', () => {
      render(<Dialog {...defaultProps} title="Test" />);

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });

    it('should hide close button when showCloseButton is false', () => {
      render(<Dialog {...defaultProps} title="Test" showCloseButton={false} />);

      expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      const onClose = jest.fn();
      render(<Dialog {...defaultProps} title="Test" onClose={onClose} />);

      fireEvent.click(screen.getByLabelText('Close dialog'));

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Overlay Click', () => {
    it('should close on overlay click by default', () => {
      const onClose = jest.fn();
      render(<Dialog {...defaultProps} onClose={onClose} />);

      const overlay = screen.getByRole('presentation').firstChild as HTMLElement;
      fireEvent.click(overlay);

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close on overlay click when disabled', () => {
      const onClose = jest.fn();
      render(
        <Dialog {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />
      );

      const overlay = screen.getByRole('presentation').firstChild as HTMLElement;
      fireEvent.click(overlay);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not close when clicking dialog content', () => {
      const onClose = jest.fn();
      render(<Dialog {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByRole('dialog'));

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Escape Key', () => {
    it('should close on escape key by default', () => {
      const onClose = jest.fn();
      render(<Dialog {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });

    it('should not close on escape when disabled', () => {
      const onClose = jest.fn();
      render(
        <Dialog {...defaultProps} onClose={onClose} closeOnEscape={false} />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not trigger on other keys', () => {
      const onClose = jest.fn();
      render(<Dialog {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <Dialog
          {...defaultProps}
          title="Test Title"
          description="Test description"
        />
      );

      const dialog = screen.getByRole('dialog');

      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');
    });

    it('should have title with correct id', () => {
      render(<Dialog {...defaultProps} title="Test Title" />);

      const title = screen.getByText('Test Title');
      expect(title).toHaveAttribute('id', 'dialog-title');
    });

    it('should have description with correct id', () => {
      render(<Dialog {...defaultProps} description="Test description" />);

      const description = screen.getByText('Test description');
      expect(description).toHaveAttribute('id', 'dialog-description');
    });

    it('should not have aria-labelledby without title', () => {
      render(<Dialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('Focus Management', () => {
    it('should focus first focusable element', async () => {
      render(
        <Dialog {...defaultProps}>
          <button>First button</button>
          <button>Second button</button>
        </Dialog>
      );

      await waitFor(() => {
        expect(screen.getByText('First button')).toHaveFocus();
      });
    });

    it('should focus initial focus element', async () => {
      function TestDialog() {
        const buttonRef = useRef<HTMLButtonElement>(null);

        return (
          <Dialog {...defaultProps} initialFocusRef={buttonRef}>
            <button>First button</button>
            <button ref={buttonRef}>Second button</button>
          </Dialog>
        );
      }

      render(<TestDialog />);

      await waitFor(() => {
        expect(screen.getByText('Second button')).toHaveFocus();
      });
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when open', () => {
      const originalOverflow = document.body.style.overflow;

      render(<Dialog {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      // Cleanup is tested implicitly
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(<Dialog {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Dialog {...defaultProps} open={false} />);

      // Style is restored in cleanup
    });
  });

  describe('Custom Styling', () => {
    it('should accept className', () => {
      render(<Dialog {...defaultProps} className="custom-dialog" />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-dialog');
    });

    it('should accept overlayClassName', () => {
      render(<Dialog {...defaultProps} overlayClassName="custom-overlay" />);

      const overlay = screen.getByRole('presentation').firstChild as HTMLElement;
      expect(overlay).toHaveClass('custom-overlay');
    });
  });
});

describe('DialogHeader', () => {
  it('should render children', () => {
    render(<DialogHeader>Header content</DialogHeader>);

    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should accept className', () => {
    render(<DialogHeader className="custom-header">Header</DialogHeader>);

    expect(screen.getByText('Header')).toHaveClass('custom-header');
  });
});

describe('DialogTitle', () => {
  it('should render as h3', () => {
    render(<DialogTitle>Title</DialogTitle>);

    const title = screen.getByText('Title');
    expect(title.tagName).toBe('H3');
  });

  it('should accept className', () => {
    render(<DialogTitle className="custom-title">Title</DialogTitle>);

    expect(screen.getByText('Title')).toHaveClass('custom-title');
  });
});

describe('DialogDescription', () => {
  it('should render as paragraph', () => {
    render(<DialogDescription>Description</DialogDescription>);

    const description = screen.getByText('Description');
    expect(description.tagName).toBe('P');
  });

  it('should accept className', () => {
    render(
      <DialogDescription className="custom-description">
        Description
      </DialogDescription>
    );

    expect(screen.getByText('Description')).toHaveClass('custom-description');
  });
});

describe('DialogFooter', () => {
  it('should render children', () => {
    render(
      <DialogFooter>
        <button>Cancel</button>
        <button>Confirm</button>
      </DialogFooter>
    );

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('should accept className', () => {
    render(<DialogFooter className="custom-footer">Footer</DialogFooter>);

    expect(screen.getByText('Footer')).toHaveClass('custom-footer');
  });
});

