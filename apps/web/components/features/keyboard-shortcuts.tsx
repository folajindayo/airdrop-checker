'use client';

import * as React from 'react';
import { Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export interface KeyboardShortcut {
  key: string | string[];
  description: string;
  action: () => void;
  category?: string;
  enabled?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const keys = Array.isArray(shortcut.key) ? shortcut.key : [shortcut.key];

        const matches = keys.some((keyCombo) => {
          const parts = keyCombo.toLowerCase().split('+');
          const key = parts[parts.length - 1];
          const modifiers = parts.slice(0, -1);

          const keyMatch =
            event.key.toLowerCase() === key ||
            event.code.toLowerCase() === key.toLowerCase();

          const ctrlMatch = modifiers.includes('ctrl')
            ? event.ctrlKey || event.metaKey
            : !event.ctrlKey && !event.metaKey;
          const altMatch = modifiers.includes('alt')
            ? event.altKey
            : !event.altKey;
          const shiftMatch = modifiers.includes('shift')
            ? event.shiftKey
            : !event.shiftKey;

          return keyMatch && ctrlMatch && altMatch && shiftMatch;
        });

        if (matches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Keyboard shortcut display component
export function KeyboardShortcutDisplay({
  shortcut,
  variant = 'default',
  size = 'default',
  className,
}: {
  shortcut: string;
  variant?: 'default' | 'outline' | 'minimal';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const keys = shortcut.split('+');

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const variantClasses = {
    default: 'bg-muted border border-border',
    outline: 'border-2 border-border',
    minimal: 'bg-transparent',
  };

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <kbd
            className={cn(
              'font-mono font-semibold rounded uppercase',
              sizeClasses[size],
              variantClasses[variant]
            )}
          >
            {key === 'ctrl' && (navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')}
            {key === 'alt' && (navigator.platform.includes('Mac') ? '⌥' : 'Alt')}
            {key === 'shift' && (navigator.platform.includes('Mac') ? '⇧' : 'Shift')}
            {key !== 'ctrl' && key !== 'alt' && key !== 'shift' && key}
          </kbd>
          {index < keys.length - 1 && <span className="text-muted-foreground">+</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// Keyboard shortcuts help dialog
export function KeyboardShortcutsDialog({
  shortcuts,
  open,
  onOpenChange,
}: {
  shortcuts: KeyboardShortcut[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Command className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="font-semibold mb-3">{category}</h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => {
                  const keys = Array.isArray(shortcut.key)
                    ? shortcut.key[0]
                    : shortcut.key;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <KeyboardShortcutDisplay shortcut={keys} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Common airdrop checker shortcuts
export function useAirdropShortcuts({
  onSearch,
  onRefresh,
  onExport,
  onHelp,
  onSettings,
}: {
  onSearch?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'ctrl+k',
      description: 'Search airdrops',
      action: () => onSearch?.(),
      category: 'Navigation',
    },
    {
      key: 'ctrl+r',
      description: 'Refresh data',
      action: () => onRefresh?.(),
      category: 'Actions',
    },
    {
      key: 'ctrl+e',
      description: 'Export data',
      action: () => onExport?.(),
      category: 'Actions',
    },
    {
      key: 'ctrl+/',
      description: 'Show help',
      action: () => onHelp?.(),
      category: 'Help',
    },
    {
      key: 'ctrl+,',
      description: 'Open settings',
      action: () => onSettings?.(),
      category: 'Settings',
    },
  ];

  useKeyboardShortcuts({ shortcuts });

  return shortcuts;
}

// Shortcut hint tooltip
export function ShortcutHint({
  shortcut,
  children,
  className,
}: {
  shortcut: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('group relative inline-block', className)}>
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-popover border rounded-lg shadow-lg px-3 py-2 whitespace-nowrap">
          <KeyboardShortcutDisplay shortcut={shortcut} size="sm" />
        </div>
      </div>
    </div>
  );
}

// Shortcut list component
export function ShortcutList({
  shortcuts,
  className,
}: {
  shortcuts: Array<{ key: string; description: string }>;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {shortcuts.map((shortcut, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
        >
          <span className="text-sm text-muted-foreground">
            {shortcut.description}
          </span>
          <KeyboardShortcutDisplay shortcut={shortcut.key} size="sm" />
        </div>
      ))}
    </div>
  );
}

// Shortcut badge for buttons
export function ButtonWithShortcut({
  children,
  shortcut,
  onClick,
  className,
}: {
  children: React.ReactNode;
  shortcut: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-between gap-4 px-4 py-2 rounded-lg hover:bg-accent transition-colors',
        className
      )}
    >
      <span>{children}</span>
      <KeyboardShortcutDisplay shortcut={shortcut} size="sm" variant="outline" />
    </button>
  );
}

// Quick action shortcuts bar
export function QuickActionsBar({
  actions,
  className,
}: {
  actions: Array<{
    label: string;
    shortcut: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }>;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2 p-2 bg-muted rounded-lg', className)}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent transition-colors text-sm"
          title={`${action.label} (${action.shortcut})`}
        >
          {action.icon}
          <span className="hidden md:inline">{action.label}</span>
          <KeyboardShortcutDisplay
            shortcut={action.shortcut}
            size="sm"
            variant="minimal"
          />
        </button>
      ))}
    </div>
  );
}

// Keyboard navigation indicator
export function KeyboardNavigationIndicator({
  enabled = true,
  className,
}: {
  enabled?: boolean;
  className?: string;
}) {
  if (!enabled) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-popover border rounded-lg shadow-lg text-xs',
        className
      )}
    >
      <Command className="h-3 w-3" />
      <span>Press</span>
      <KeyboardShortcutDisplay shortcut="ctrl+/" size="sm" />
      <span>for shortcuts</span>
    </div>
  );
}

// Shortcut recorder for custom shortcuts
export function ShortcutRecorder({
  value,
  onChange,
  placeholder = 'Press keys...',
  className,
}: {
  value: string;
  onChange: (shortcut: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [recording, setRecording] = React.useState(false);
  const [currentKeys, setCurrentKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();

      const keys: string[] = [];
      if (event.ctrlKey || event.metaKey) keys.push('Ctrl');
      if (event.altKey) keys.push('Alt');
      if (event.shiftKey) keys.push('Shift');

      const key = event.key.toLowerCase();
      if (key !== 'control' && key !== 'alt' && key !== 'shift' && key !== 'meta') {
        keys.push(key);
      }

      if (keys.length > 1) {
        setCurrentKeys(keys);
      }
    };

    const handleKeyUp = () => {
      if (currentKeys.length > 1) {
        onChange(currentKeys.join('+'));
        setRecording(false);
        setCurrentKeys([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [recording, currentKeys, onChange]);

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 border rounded-lg cursor-pointer',
        recording && 'ring-2 ring-primary',
        className
      )}
      onClick={() => setRecording(true)}
    >
      {value ? (
        <KeyboardShortcutDisplay shortcut={value} />
      ) : (
        <span className="text-muted-foreground text-sm">
          {recording ? 'Recording...' : placeholder}
        </span>
      )}
    </div>
  );
}

