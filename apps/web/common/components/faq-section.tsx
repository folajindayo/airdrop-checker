'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, MessageSquare, Book, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'technical' | 'eligibility' | 'security';
}

const faqs: FAQItem[] = [
  {
    question: 'What is Airdrop Finder?',
    answer:
      'Airdrop Finder is a read-only blockchain dashboard that analyzes your wallet activity across multiple chains to determine your eligibility for ongoing and upcoming airdrops. We scan your transactions, NFT holdings, and protocol interactions to calculate your chances of receiving airdrop rewards.',
    category: 'general',
  },
  {
    question: 'How does the eligibility scoring work?',
    answer:
      'Your eligibility score is calculated based on how well your on-chain activity matches the criteria for each airdrop. Each project has specific requirements (like number of transactions, NFT mints, bridge usage, etc.). We check which criteria you meet and calculate a percentage score. The overall score is an average across all tracked airdrops.',
    category: 'eligibility',
  },
  {
    question: 'Is my wallet safe? Do you need my private keys?',
    answer:
      'Absolutely safe! Airdrop Finder is completely read-only. We never ask for your private keys, seed phrases, or signing permissions. We only read publicly available blockchain data using your wallet address. WalletConnect is used solely for address verification, not for transactions.',
    category: 'security',
  },
  {
    question: 'Which blockchains are supported?',
    answer:
      'Currently, we support Ethereum, Base, Arbitrum, Optimism, zkSync Era, and Polygon. We analyze your activity across all these chains simultaneously to give you a comprehensive eligibility report.',
    category: 'technical',
  },
  {
    question: 'How often is the data updated?',
    answer:
      'Blockchain data is fetched in real-time when you connect your wallet or manually refresh. We also cache results for 1 hour to improve performance. You can force a refresh anytime, but rate limits apply (1 refresh per 5 minutes per address).',
    category: 'technical',
  },
  {
    question: 'What does "Confirmed", "Rumored", and "Speculative" mean?',
    answer:
      'Confirmed: Official announcements from projects about their airdrop. Rumored: Strong community speculation with some evidence. Speculative: Possible airdrops based on project patterns. Expired: Airdrop snapshot or claim period has ended.',
    category: 'eligibility',
  },
  {
    question: 'Can I improve my eligibility score?',
    answer:
      'Yes! Check the "Recommendations" section for personalized suggestions on which actions to take. Each unmet criterion shows you what you need to do (like bridging to a specific chain, minting NFTs, or using certain protocols) to increase your score.',
    category: 'eligibility',
  },
  {
    question: 'Do you guarantee I will receive an airdrop?',
    answer:
      'No. Airdrop Finder is a tool for estimating eligibility based on publicly available criteria. Final airdrop distributions are determined solely by the project teams. Meeting criteria does not guarantee rewards, and criteria can change without notice.',
    category: 'general',
  },
  {
    question: 'How can I compare multiple wallets?',
    answer:
      'Use the Wallet Comparison feature (available in the Compare section) to analyze up to 5 wallet addresses side-by-side. This helps you identify which wallet has better airdrop opportunities.',
    category: 'general',
  },
  {
    question: 'Can I export my eligibility report?',
    answer:
      'Yes! Click the "Export Report" button on your dashboard to download your eligibility data in JSON, CSV, or TXT format. You can also share your results on social media or copy a shareable link.',
    category: 'general',
  },
  {
    question: 'What is the Score History feature?',
    answer:
      'Score History tracks your eligibility score over time, showing trends and changes. This helps you see if your on-chain activity is improving your airdrop chances. History is stored locally in your browser for up to 30 days.',
    category: 'technical',
  },
  {
    question: 'Why is my score different from other tools?',
    answer:
      'Different tools use different criteria and scoring algorithms. We focus on transparency by showing exactly which criteria you meet or miss for each project. Our scoring is based on the latest publicly available information.',
    category: 'eligibility',
  },
  {
    question: 'How do I enable notifications?',
    answer:
      'Go to Settings and enable notifications. You\'ll receive alerts about new airdrops, score changes, upcoming snapshots, and claimable rewards. Notifications are stored locally in your browser.',
    category: 'technical',
  },
  {
    question: 'What should I do if I find a bug?',
    answer:
      'Please report bugs through our GitHub issues page or contact us via the support section. Include details about your browser, wallet, and the specific error you encountered.',
    category: 'general',
  },
  {
    question: 'Is Airdrop Finder free to use?',
    answer:
      'Yes! Airdrop Finder is completely free. We don\'t charge any fees for checking your eligibility, comparing wallets, or accessing any features on the platform.',
    category: 'general',
  },
];

export function FAQSection() {
  const categoryIcons = {
    general: Book,
    technical: HelpCircle,
    eligibility: MessageSquare,
    security: '🔒',
  };

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about Airdrop Finder, eligibility
          scoring, and how to maximize your airdrop opportunities.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          return (
            <Badge key={category} variant="outline" className="capitalize">
              {typeof Icon === 'string' ? (
                <span className="mr-1">{Icon}</span>
              ) : (
                <Icon className="mr-1 h-3 w-3" />
              )}
              {category}
            </Badge>
          );
        })}
      </div>

      {/* FAQ Accordion */}
      <Card>
        <CardHeader>
          <CardTitle>Common Questions</CardTitle>
          <CardDescription>
            Click on any question to expand the answer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-start gap-2">
                    <Badge
                      variant="outline"
                      className="capitalize text-xs mt-0.5"
                    >
                      {faq.category}
                    </Badge>
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-16 pr-4 text-muted-foreground">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Additional Help */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Read our complete guide on using Airdrop Finder
              </p>
              <Link
                href="https://github.com/yourusername/airdrop-finder"
                target="_blank"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View Docs
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Community</h3>
              <p className="text-sm text-muted-foreground">
                Join our community for discussions and support
              </p>
              <Link
                href="https://discord.gg/airdropfinder"
                target="_blank"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Join Discord
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100">
                <HelpCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Support</h3>
              <p className="text-sm text-muted-foreground">
                Need help? Contact our support team
              </p>
              <Link
                href="mailto:support@airdropfinder.xyz"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Email Support
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

