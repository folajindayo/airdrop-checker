'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  BarChart3,
  Settings,
  HelpCircle,
  GitCompare,
  Calendar,
  Wallet,
  Search,
} from 'lucide-react';

interface CommandMenuItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle command menu with Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router]
  );

  const commands: CommandMenuItem[] = [
    {
      id: 'home',
      title: 'Home',
      description: 'Go to homepage',
      icon: <Home className="h-4 w-4" />,
      action: () => navigate('/'),
      keywords: ['home', 'start'],
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'View your airdrop eligibility',
      icon: <Wallet className="h-4 w-4" />,
      action: () => navigate('/dashboard'),
      keywords: ['dashboard', 'eligibility', 'airdrops'],
    },
    {
      id: 'stats',
      title: 'Statistics',
      description: 'View global airdrop statistics',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigate('/stats'),
      keywords: ['stats', 'statistics', 'analytics'],
    },
    {
      id: 'compare',
      title: 'Compare Wallets',
      description: 'Compare multiple wallet addresses',
      icon: <GitCompare className="h-4 w-4" />,
      action: () => navigate('/compare'),
      keywords: ['compare', 'wallets', 'comparison'],
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'View upcoming airdrop events',
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigate('/calendar'),
      keywords: ['calendar', 'events', 'snapshots', 'claims'],
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your preferences',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigate('/settings'),
      keywords: ['settings', 'preferences', 'config'],
    },
    {
      id: 'help',
      title: 'Help & FAQ',
      description: 'Get help and answers',
      icon: <HelpCircle className="h-4 w-4" />,
      action: () => navigate('/help'),
      keywords: ['help', 'faq', 'support', 'questions'],
    },
  ];

  const quickActions: CommandMenuItem[] = [
    {
      id: 'search',
      title: 'Search Airdrops',
      description: 'Search for specific airdrops',
      icon: <Search className="h-4 w-4" />,
      action: () => {
        setOpen(false);
        // Focus search input if on dashboard
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        searchInput?.focus();
      },
      keywords: ['search', 'find', 'lookup'],
    },
  ];

  return (
    <>
      {/* Trigger hint */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-xs font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Navigation */}
          <CommandGroup heading="Navigation">
            {commands.map((command) => (
              <CommandItem
                key={command.id}
                onSelect={command.action}
                className="flex items-center gap-3"
              >
                {command.icon}
                <div className="flex-1">
                  <div className="font-medium">{command.title}</div>
                  {command.description && (
                    <div className="text-xs text-muted-foreground">
                      {command.description}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.id}
                onSelect={action.action}
                className="flex items-center gap-3"
              >
                {action.icon}
                <div className="flex-1">
                  <div className="font-medium">{action.title}</div>
                  {action.description && (
                    <div className="text-xs text-muted-foreground">
                      {action.description}
                    </div>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

// Hook to trigger command menu from anywhere
export function useCommandMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}

