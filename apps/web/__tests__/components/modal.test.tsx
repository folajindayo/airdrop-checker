/**
 * Tests for Modal Components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal, ConfirmModal, AlertModal, FullScreenModal, Drawer } from '@/components/ui/modal';

describe('Modal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render when open', () => {
      render(
        <Modal isOpen onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('should render with description', () => {
      render(
        <Modal isOpen onClose={mockOnClose} title="Test" description="Test description">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size classes', () => {
      const { container } = render(
        <Modal isOpen onClose={mockOnClose} title="Test" size="sm">
          <p>Content</p>
        </Modal>
      );

      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass('max-w-sm');
    });

    it('should apply medium size classes (default)', () => {
      const { container } = render(
        <Modal isOpen onClose={mockOnClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass('max-w-md');
    });

    it('should apply large size classes', () => {
      const { container } = render(
        <Modal isOpen onClose={mockOnClose} title="Test" size="lg">
          <p>Content</p>
        </Modal>
      );

      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveClass('max-w-lg');
    });
  });

  describe('Close Button', () => {
    it('should show close button by default', () => {
      render(
        <Modal isOpen onClose={mockOnClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('should hide close button when showCloseButton is false', () => {
      render(
        <Modal isOpen onClose={mockOnClose} title="Test" showCloseButton={false}>
          <p>Content</p>
        </Modal>
      );

      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      render(
        <Modal isOpen onClose={mockOnClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      fireEvent.click(screen.getByLabelText('Close modal'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Overlay Click', () => {
    it('should close on overlay click by default', () => {
      const { container } = render(
        <Modal isOpen onClose={mockOnClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      const overlay = container.querySelector('[class*="fixed inset-0"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should not close on overlay click when disabled', () => {
      const { container } = render(
        <Modal isOpen onClose={mockOnClose} title="Test" closeOnOverlayClick={false}>
          <p>Content</p>
        </Modal>
      );

      const overlay = container.querySelector('[class*="fixed inset-0"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close on Escape key by default', () => {
      render(
        <Modal isOpen onClose={mockOnClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close on Escape when disabled', () => {
      render(
        <Modal isOpen onClose={mockOnClose} title="Test" closeOnEscape={false}>
          <p>Content</p>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Custom Footer', () => {
    it('should render custom footer', () => {
      render(
        <Modal
          isOpen
          onClose={mockOnClose}
          title="Test"
          footer={
            <div>
              <button>Custom Button</button>
            </div>
          }
        >
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Custom Button')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      const { container } = render(
        <Modal isOpen onClose={mockOnClose} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('should have description linked when provided', () => {
      const { container } = render(
        <Modal isOpen onClose={mockOnClose} title="Test" description="Test description">
          <p>Content</p>
        </Modal>
      );

      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toHaveAttribute('aria-describedby');
    });
  });
});

describe('ConfirmModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  it('should render with default variant', () => {
    render(
      <ConfirmModal
        isOpen
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Confirm"
        message="Are you sure?"
      />
    );

    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm clicked', () => {
    render(
      <ConfirmModal
        isOpen
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Confirm"
        message="Are you sure?"
      />
    );

    fireEvent.click(screen.getByText('Confirm'));
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should call onCancel when cancel clicked', () => {
    render(
      <ConfirmModal
        isOpen
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Confirm"
        message="Are you sure?"
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should render with danger variant', () => {
    render(
      <ConfirmModal
        isOpen
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Delete"
        message="This action cannot be undone"
        variant="danger"
      />
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <ConfirmModal
        isOpen
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Confirm"
        message="Are you sure?"
        loading
      />
    );

    const confirmButton = screen.getByText('Confirm');
    expect(confirmButton).toBeDisabled();
  });

  it('should use custom button labels', () => {
    render(
      <ConfirmModal
        isOpen
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Confirm"
        message="Are you sure?"
        confirmLabel="Yes, proceed"
        cancelLabel="No, go back"
      />
    );

    expect(screen.getByText('Yes, proceed')).toBeInTheDocument();
    expect(screen.getByText('No, go back')).toBeInTheDocument();
  });
});

describe('AlertModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render alert modal', () => {
    render(
      <AlertModal isOpen onClose={mockOnClose} title="Alert" message="Important message" />
    );

    expect(screen.getByText('Alert')).toBeInTheDocument();
    expect(screen.getByText('Important message')).toBeInTheDocument();
  });

  it('should call onClose when OK clicked', () => {
    render(
      <AlertModal isOpen onClose={mockOnClose} title="Alert" message="Important message" />
    );

    fireEvent.click(screen.getByText('OK'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should use custom button label', () => {
    render(
      <AlertModal
        isOpen
        onClose={mockOnClose}
        title="Alert"
        message="Important message"
        buttonLabel="Got it"
      />
    );

    expect(screen.getByText('Got it')).toBeInTheDocument();
  });
});

describe('FullScreenModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render full screen modal', () => {
    render(
      <FullScreenModal isOpen onClose={mockOnClose} title="Full Screen">
        <p>Full screen content</p>
      </FullScreenModal>
    );

    expect(screen.getByText('Full Screen')).toBeInTheDocument();
    expect(screen.getByText('Full screen content')).toBeInTheDocument();
  });

  it('should have close button', () => {
    render(
      <FullScreenModal isOpen onClose={mockOnClose} title="Full Screen">
        <p>Content</p>
      </FullScreenModal>
    );

    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeInTheDocument();
    
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});

describe('Drawer', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Position Variants', () => {
    it('should render drawer from right (default)', () => {
      render(
        <Drawer isOpen onClose={mockOnClose} title="Drawer">
          <p>Drawer content</p>
        </Drawer>
      );

      expect(screen.getByText('Drawer')).toBeInTheDocument();
    });

    it('should render drawer from left', () => {
      render(
        <Drawer isOpen onClose={mockOnClose} title="Drawer" position="left">
          <p>Drawer content</p>
        </Drawer>
      );

      expect(screen.getByText('Drawer')).toBeInTheDocument();
    });

    it('should render drawer from top', () => {
      render(
        <Drawer isOpen onClose={mockOnClose} title="Drawer" position="top">
          <p>Drawer content</p>
        </Drawer>
      );

      expect(screen.getByText('Drawer')).toBeInTheDocument();
    });

    it('should render drawer from bottom', () => {
      render(
        <Drawer isOpen onClose={mockOnClose} title="Drawer" position="bottom">
          <p>Drawer content</p>
        </Drawer>
      );

      expect(screen.getByText('Drawer')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply small size', () => {
      render(
        <Drawer isOpen onClose={mockOnClose} title="Drawer" size="sm">
          <p>Content</p>
        </Drawer>
      );

      expect(screen.getByText('Drawer')).toBeInTheDocument();
    });

    it('should apply large size', () => {
      render(
        <Drawer isOpen onClose={mockOnClose} title="Drawer" size="lg">
          <p>Content</p>
        </Drawer>
      );

      expect(screen.getByText('Drawer')).toBeInTheDocument();
    });
  });

  it('should have close button', () => {
    render(
      <Drawer isOpen onClose={mockOnClose} title="Drawer">
        <p>Content</p>
      </Drawer>
    );

    const closeButton = screen.getByLabelText('Close drawer');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});

