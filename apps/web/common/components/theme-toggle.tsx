'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <span className="mr-2">💻</span>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Inline Theme Toggle (for settings pages)
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Theme Preference</label>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setTheme('light')}
          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
            theme === 'light'
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Sun className="h-6 w-6" />
          <span className="text-sm font-medium">Light</span>
        </button>

        <button
          onClick={() => setTheme('dark')}
          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
            theme === 'dark'
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Moon className="h-6 w-6" />
          <span className="text-sm font-medium">Dark</span>
        </button>

        <button
          onClick={() => setTheme('system')}
          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
            theme === 'system'
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <span className="text-2xl">💻</span>
          <span className="text-sm font-medium">System</span>
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Choose your preferred color scheme or sync with system settings
      </p>
    </div>
  );
}

