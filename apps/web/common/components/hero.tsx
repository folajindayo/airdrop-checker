'use client';

import { ConnectButton } from '@/components/wallet/connect-button';
import { useWallet } from '@/hooks/use-wallet';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export function Hero() {
  const { isConnected, address } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address) {
      router.push('/dashboard');
    }
  }, [isConnected, address, router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
          <div
            className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] opacity-20"
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>
      </div>

      <div className="text-center max-w-3xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Discover Your Airdrop Eligibility
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Check if you're eligible for the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
            next big airdrop
          </span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect your wallet to instantly discover which airdrops you qualify for based on your
          onchain activity. No transactions needed, completely read-only.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <ConnectButton />
        </div>

        <div className="pt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="space-y-2">
            <div className="text-2xl font-bold">100+</div>
            <div className="text-sm text-muted-foreground">Chains Supported</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">10+</div>
            <div className="text-sm text-muted-foreground">Active Airdrops</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold">Read-Only</div>
            <div className="text-sm text-muted-foreground">Safe & Secure</div>
          </div>
        </div>
      </div>
    </div>
  );
}

