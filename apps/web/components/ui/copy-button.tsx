'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SimpleTooltip } from '@/components/ui/tooltip';

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  successMessage?: string;
  showToast?: boolean;
}

export function CopyButton({
  value,
  className,
  size = 'icon',
  variant = 'ghost',
  successMessage = 'Copied to clipboard',
  showToast = true,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      
      if (showToast) {
        toast.success(successMessage);
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <SimpleTooltip content={copied ? 'Copied!' : 'Copy'}>
      <Button
        variant={variant}
        size={size}
        onClick={handleCopy}
        className={className}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </SimpleTooltip>
  );
}

// Copy button with text label
export function CopyButtonWithLabel({
  value,
  label = 'Copy',
  copiedLabel = 'Copied!',
  className,
  showToast = true,
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  showToast?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      
      if (showToast) {
        toast.success('Copied to clipboard');
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={className}
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-600" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}

// Inline copy button for text
export function CopyText({
  text,
  truncate = false,
  maxLength = 20,
  className,
}: {
  text: string;
  truncate?: boolean;
  maxLength?: number;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const displayText = truncate && text.length > maxLength
    ? `${text.slice(0, maxLength)}...`
    : text;

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors group',
        className
      )}
    >
      <span className="font-mono text-sm">{displayText}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

// Code block with copy button
export function CopyCodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className={cn('relative group', className)}>
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-3 w-3 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
        <code className={language ? `language-${language}` : undefined}>
          {code}
        </code>
      </pre>
    </div>
  );
}

// Address copy component (for wallet addresses)
export function CopyAddress({
  address,
  showFull = false,
  className,
}: {
  address: string;
  showFull?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const displayAddress = showFull
    ? address
    : `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-accent transition-colors group font-mono text-sm',
        className
      )}
      title={address}
    >
      <span>{displayAddress}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

// Share button with copy link functionality
export function ShareCopyButton({
  url,
  title = 'Share',
  className,
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ url, title });
        return;
      } catch (error) {
        // User cancelled or share failed, fallback to copy
      }
    }

    // Fallback to copy
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={className}
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="mr-2 h-4 w-4" />
          {title}
        </>
      )}
    </Button>
  );
}

