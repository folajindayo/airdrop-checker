'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Link as LinkIcon, Check, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ShareResultsProps {
  address: string;
  overallScore: number;
  eligibleAirdrops: number;
  highScoreCount: number;
}

export function ShareResults({
  address,
  overallScore,
  eligibleAirdrops,
  highScoreCount,
}: ShareResultsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/dashboard?address=${address}`
    : '';

  const shareText = `🪂 My Airdrop Score: ${overallScore}/100\n✅ Eligible for ${eligibleAirdrops} airdrops (${highScoreCount} high scores)\n\nCheck your eligibility at Airdrop Finder! 🚀`;

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    toast.success('Opening Twitter...');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Results copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy text');
    }
  };

  const handleDownloadImage = () => {
    // Trigger OG image generation
    const ogImageUrl = `/api/og?score=${overallScore}&address=${address.slice(
      0,
      8
    )}...${address.slice(-6)}`;
    
    // Open in new tab for download
    window.open(ogImageUrl, '_blank');
    toast.success('Opening shareable image...');
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Airdrop Eligibility Results',
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      toast.error('Web Share not supported');
    }
  };

  const hasWebShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share Results
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Twitter/X */}
        <DropdownMenuItem onClick={handleTwitterShare}>
          <Twitter className="mr-2 h-4 w-4" />
          Share on Twitter
        </DropdownMenuItem>

        {/* Web Share API (mobile) */}
        {hasWebShare && (
          <>
            <DropdownMenuItem onClick={handleWebShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share via...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              Link Copied!
            </>
          ) : (
            <>
              <LinkIcon className="mr-2 h-4 w-4" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>

        {/* Copy Results Text */}
        <DropdownMenuItem onClick={handleCopyText}>
          <LinkIcon className="mr-2 h-4 w-4" />
          Copy Results Text
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Download Image */}
        <DropdownMenuItem onClick={handleDownloadImage}>
          <Download className="mr-2 h-4 w-4" />
          Download Image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Social Preview Card Component
export function SharePreviewCard({
  score,
  address,
  className,
}: {
  score: number;
  address: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 ${className}`}
    >
      <div className="bg-background rounded-md p-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
            <span className="text-3xl">🪂</span>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">Airdrop Readiness</h3>
            <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {score}/100
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground font-mono">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            Check your eligibility at airdropfinder.xyz
          </div>
        </div>
      </div>
    </div>
  );
}

