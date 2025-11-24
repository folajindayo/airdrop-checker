import { FAQSection } from '@/components/help/faq-section';

export const metadata = {
  title: 'Help & FAQ - Airdrop Finder',
  description: 'Find answers to common questions about Airdrop Finder, eligibility scoring, and how to maximize your airdrop opportunities.',
};

export default function HelpPage() {
  return (
    <div className="container py-8">
      <FAQSection />
    </div>
  );
}

