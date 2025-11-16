/**
 * UI State Hooks
 * Hooks for managing UI state (modals, toasts, etc.)
 */

import { useState, useCallback } from 'react';

export function useModal(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: string }>>([]);

  const show = useCallback((message: string, type: string = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, show };
}

export function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false);
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen(prev => !prev),
  };
}

