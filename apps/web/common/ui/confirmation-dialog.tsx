'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Info, AlertCircle, Trash2 } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'default' | 'destructive' | 'warning';
  icon?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default',
  icon,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const variantIcons = {
    default: <Info className="h-5 w-5 text-blue-600" />,
    destructive: <AlertCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {icon || variantIcons[variant]}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {isLoading ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Preset confirmation dialogs
export function DeleteConfirmation({
  open,
  onOpenChange,
  itemName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Confirmation"
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={onConfirm}
      variant="destructive"
      icon={<Trash2 className="h-5 w-5 text-red-600" />}
    />
  );
}

export function ClearDataConfirmation({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Clear All Data"
      description="This will permanently delete all your cached data, watchlist, and preferences. This action cannot be undone."
      confirmText="Clear All Data"
      cancelText="Cancel"
      onConfirm={onConfirm}
      variant="destructive"
    />
  );
}

export function DisconnectWalletConfirmation({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Disconnect Wallet"
      description="Are you sure you want to disconnect your wallet? You'll need to reconnect to check your airdrop eligibility again."
      confirmText="Disconnect"
      cancelText="Cancel"
      onConfirm={onConfirm}
      variant="warning"
    />
  );
}

// Hook to use confirmation dialog
export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'default' | 'destructive' | 'warning';
  } | null>(null);

  const confirm = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>,
    variant?: 'default' | 'destructive' | 'warning'
  ) => {
    setConfig({ title, description, onConfirm, variant });
    setIsOpen(true);
  };

  const ConfirmationComponent = config ? (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={config.title}
      description={config.description}
      onConfirm={config.onConfirm}
      variant={config.variant}
    />
  ) : null;

  return {
    confirm,
    ConfirmationDialog: ConfirmationComponent,
  };
}

