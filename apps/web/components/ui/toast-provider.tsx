'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme as 'light' | 'dark' | 'system'}
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        className: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
      }}
      richColors
      closeButton
      duration={4000}
    />
  );
}

// Custom toast utilities
export const customToast = {
  success: (message: string, description?: string) => {
    const { toast } = require('sonner');
    toast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    const { toast } = require('sonner');
    toast.error(message, { description });
  },
  info: (message: string, description?: string) => {
    const { toast } = require('sonner');
    toast.info(message, { description });
  },
  warning: (message: string, description?: string) => {
    const { toast } = require('sonner');
    toast.warning(message, { description });
  },
  loading: (message: string) => {
    const { toast } = require('sonner');
    return toast.loading(message);
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    const { toast } = require('sonner');
    return toast.promise(promise, messages);
  },
  custom: (component: React.ReactNode) => {
    const { toast } = require('sonner');
    toast.custom(component);
  },
};

// Preset toasts for common actions
export const toasts = {
  walletConnected: (address: string) => {
    customToast.success('Wallet Connected', `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`);
  },
  walletDisconnected: () => {
    customToast.info('Wallet Disconnected', 'Your wallet has been disconnected');
  },
  transactionSubmitted: (hash: string) => {
    customToast.info('Transaction Submitted', `Hash: ${hash.slice(0, 10)}...`);
  },
  transactionConfirmed: () => {
    customToast.success('Transaction Confirmed', 'Your transaction has been confirmed');
  },
  transactionFailed: (error?: string) => {
    customToast.error('Transaction Failed', error || 'Please try again');
  },
  dataCopied: () => {
    customToast.success('Copied!', 'Copied to clipboard');
  },
  dataExported: (format: string) => {
    customToast.success('Exported!', `Data exported as ${format.toUpperCase()}`);
  },
  cacheClear: () => {
    customToast.success('Cache Cleared', 'All cached data has been cleared');
  },
  settingsSaved: () => {
    customToast.success('Settings Saved', 'Your preferences have been updated');
  },
  networkError: () => {
    customToast.error('Network Error', 'Please check your connection and try again');
  },
  invalidAddress: () => {
    customToast.error('Invalid Address', 'Please enter a valid wallet address');
  },
  eligibilityChecked: (score: number) => {
    const message = score >= 70 ? '🎉 High Eligibility!' : score >= 40 ? '✓ Moderate Eligibility' : 'Low Eligibility';
    customToast.success(message, `Your score: ${score}/100`);
  },
  newAirdropAdded: (projectName: string) => {
    customToast.info('New Airdrop!', `${projectName} has been added to the tracker`);
  },
  snapshotReminder: (projectName: string, date: string) => {
    customToast.warning('Snapshot Reminder', `${projectName} snapshot on ${date}`);
  },
};

