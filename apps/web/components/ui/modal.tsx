/**
 * Modal Component
 * Dialog/modal overlay for content
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const modalVariants = cva(
  'relative bg-white rounded-lg shadow-xl transform transition-all',
  {
    variants: {
      size: {
        sm: 'max-w-sm w-full',
        md: 'max-w-md w-full',
        lg: 'max-w-lg w-full',
        xl: 'max-w-xl w-full',
        '2xl': 'max-w-2xl w-full',
        full: 'max-w-full w-full mx-4',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ModalProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof modalVariants> {
  /**
   * Whether modal is open
   */
  open: boolean;
  
  /**
   * Handler called when modal should close
   */
  onClose: () => void;
  
  /**
   * Modal title
   */
  title?: React.ReactNode;
  
  /**
   * Modal description
   */
  description?: string;
  
  /**
   * Modal footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;
  
  /**
   * Whether clicking overlay closes modal
   */
  closeOnOverlayClick?: boolean;
  
  /**
   * Whether pressing ESC closes modal
   */
  closeOnEscape?: boolean;
}

/**
 * Modal dialog component
 * 
 * @example
 * ```tsx
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
 *   <p>Are you sure?</p>
 * </Modal>
 * ```
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      size,
      open,
      onClose,
      title,
      description,
      footer,
      showCloseButton = true,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      children,
      ...props
    },
    ref
  ) => {
    const modalRef = React.useRef<HTMLDivElement>(null);

    // Handle ESC key
    React.useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, closeOnEscape, onClose]);

    // Prevent body scroll when modal is open
    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [open]);

    // Focus management
    React.useEffect(() => {
      if (open && modalRef.current) {
        modalRef.current.focus();
      }
    }, [open]);

    if (!open) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className={modalVariants({ size, className })}
          tabIndex={-1}
          {...props}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between border-b border-gray-200 p-4">
              <div className="flex-1">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="modal-description"
                    className="mt-1 text-sm text-gray-500"
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-4 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close modal"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

/**
 * Confirmation modal
 */
export interface ConfirmModalProps extends Omit<ModalProps, 'footer'> {
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
  onClose,
  ...props
}) => {
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-blue-600 hover:bg-blue-700 text-white';

  const footer = (
    <div className="flex gap-2 justify-end">
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className={`px-4 py-2 text-sm font-medium rounded-md disabled:opacity-50 ${confirmButtonClass}`}
      >
        {loading ? 'Loading...' : confirmText}
      </button>
    </div>
  );

  return <Modal {...props} onClose={onClose} footer={footer} />;
};

/**
 * Alert modal
 */
export interface AlertModalProps extends Omit<ModalProps, 'footer'> {
  buttonText?: string;
  onConfirm?: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  buttonText = 'OK',
  onConfirm,
  onClose,
  ...props
}) => {
  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const footer = (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleConfirm}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        {buttonText}
      </button>
    </div>
  );

  return <Modal {...props} onClose={onClose} footer={footer} />;
};

/**
 * Full-screen modal
 */
export const FullScreenModal: React.FC<ModalProps> = (props) => {
  return (
    <div className="fixed inset-0 z-50 bg-white overflow-auto">
      <div className="min-h-screen">
        <Modal {...props} size="full" closeOnOverlayClick={false} />
      </div>
    </div>
  );
};

/**
 * Drawer modal (slides from side)
 */
export interface DrawerProps extends Omit<ModalProps, 'size'> {
  position?: 'left' | 'right';
}

export const Drawer: React.FC<DrawerProps> = ({
  position = 'right',
  open,
  onClose,
  title,
  showCloseButton = true,
  children,
  footer,
  ...props
}) => {
  if (!open) return null;

  const slideClass = position === 'left' ? 'left-0' : 'right-0';

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'drawer-title' : undefined}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed ${slideClass} top-0 h-full w-80 bg-white shadow-xl transform transition-transform ${
          open ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
        }`}
        {...props}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 id="drawer-title" className="text-lg font-semibold">
              {title}
            </h2>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500"
                aria-label="Close drawer"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-auto p-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">{footer}</div>
        )}
      </div>
    </div>
  );
};

