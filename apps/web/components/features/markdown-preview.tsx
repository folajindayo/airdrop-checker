'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Eye, Code, Copy, Check } from 'lucide-react';

export interface MarkdownPreviewProps {
  markdown: string;
  className?: string;
}

/**
 * Simple markdown parser for basic formatting
 * In production, consider using a library like react-markdown or marked
 */
function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-muted p-4 rounded-lg my-3 overflow-x-auto"><code class="text-sm font-mono">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
  html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-1 my-2">$&</ul>');

  // Numbered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>');

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 italic my-3 text-muted-foreground">$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gim, '<hr class="my-6 border-t border-border" />');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="my-2">');
  html = `<p class="my-2">${html}</p>`;

  return html;
}

export function MarkdownPreview({ markdown, className }: MarkdownPreviewProps) {
  const html = React.useMemo(() => parseMarkdown(markdown), [markdown]);

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-headings:scroll-m-20 prose-headings:tracking-tight',
        'prose-p:leading-7',
        'prose-a:font-medium prose-a:underline prose-a:underline-offset-4',
        'prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic',
        'prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:font-mono prose-code:text-sm',
        'prose-pre:overflow-x-auto',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Markdown editor with live preview
export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your markdown here...',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [activeTab, setActiveTab] = React.useState<'write' | 'preview'>('write');

  return (
    <Card className={cn('overflow-hidden', className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="border-b px-4 py-2">
          <TabsList>
            <TabsTrigger value="write" className="gap-2">
              <Code className="h-4 w-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="m-0">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-[400px] p-4 bg-background resize-none focus:outline-none font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div className="h-[400px] p-4 overflow-y-auto">
            {value ? (
              <MarkdownPreview markdown={value} />
            ) : (
              <p className="text-muted-foreground">Nothing to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

// Split view markdown editor
export function MarkdownSplitEditor({
  value,
  onChange,
  placeholder = 'Write your markdown here...',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="grid md:grid-cols-2 divide-x">
        <div>
          <div className="border-b px-4 py-2 bg-muted">
            <span className="text-sm font-medium flex items-center gap-2">
              <Code className="h-4 w-4" />
              Markdown
            </span>
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-[500px] p-4 bg-background resize-none focus:outline-none font-mono text-sm"
          />
        </div>
        <div>
          <div className="border-b px-4 py-2 bg-muted">
            <span className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </span>
          </div>
          <div className="h-[500px] p-4 overflow-y-auto">
            {value ? (
              <MarkdownPreview markdown={value} />
            ) : (
              <p className="text-muted-foreground">Preview will appear here</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Airdrop notes with markdown
export function AirdropNotesEditor({
  airdropName,
  notes,
  onSave,
  className,
}: {
  airdropName: string;
  notes: string;
  onSave: (notes: string) => void;
  className?: string;
}) {
  const [value, setValue] = React.useState(notes);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    onSave(value);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold">Notes for {airdropName}</h3>
        <Button onClick={handleSave} size="sm">
          {isSaved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            'Save Notes'
          )}
        </Button>
      </div>
      <MarkdownEditor
        value={value}
        onChange={setValue}
        placeholder="Add your notes about this airdrop..."
      />
    </Card>
  );
}

// Markdown documentation viewer
export function MarkdownDocViewer({
  title,
  content,
  className,
}: {
  title: string;
  content: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="border-b px-6 py-4 flex items-center justify-between bg-muted">
        <h2 className="text-xl font-bold">{title}</h2>
        <Button variant="ghost" size="sm" onClick={copyToClipboard}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="p-6 max-h-[600px] overflow-y-auto">
        <MarkdownPreview markdown={content} />
      </div>
    </Card>
  );
}

// Example markdown templates
export const MARKDOWN_TEMPLATES = {
  airdropChecklist: `# Airdrop Checklist

## Research Phase
- [ ] Read official documentation
- [ ] Join Discord/Telegram
- [ ] Follow on Twitter
- [ ] Check tokenomics

## Participation
- [ ] Connect wallet
- [ ] Complete required tasks
- [ ] Verify eligibility
- [ ] Track progress

## Claim Phase
- [ ] Monitor snapshot date
- [ ] Check eligibility
- [ ] Claim tokens
- [ ] Add to portfolio tracker
`,

  eligibilityReport: `# Eligibility Report

## Wallet Analysis
**Address:** 0x...
**Score:** 85/100

## Eligible Airdrops
### 🟢 High Probability (3)
- **Project A** - 95% match
- **Project B** - 87% match
- **Project C** - 82% match

### 🟡 Medium Probability (2)
- **Project D** - 65% match
- **Project E** - 58% match

## Next Steps
1. Verify eligibility on official sites
2. Prepare for snapshot dates
3. Monitor announcements
`,

  protocolGuide: `# Protocol Interaction Guide

## Getting Started
Follow these steps to increase your airdrop eligibility:

### Step 1: Bridge Assets
\`\`\`
- Use official bridge
- Minimum: $100
- Wait: 24-48 hours
\`\`\`

### Step 2: Swap Tokens
- Visit DEX
- Make at least 5 swaps
- Use different token pairs

### Step 3: Provide Liquidity
> Important: Only use protocols you trust

**Recommended Pools:**
- ETH/USDC
- ETH/DAI
- wBTC/ETH

### Step 4: Track Progress
Monitor your activity using tools like:
- [Dune Analytics](https://dune.com)
- [DeBank](https://debank.com)
`,
};

