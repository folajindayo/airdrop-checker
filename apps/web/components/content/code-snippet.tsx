'use client';

import * as React from 'react';
import { Check, Copy, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: string;
  className?: string;
}

export function CodeSnippet({
  code,
  language = 'typescript',
  title,
  showLineNumbers = true,
  highlightLines = [],
  maxHeight = '400px',
  className,
}: CodeSnippetProps) {
  const [copied, setCopied] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const lines = code.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `snippet.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      {title && (
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {language}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0"
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-7 w-7 p-0"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 w-7 p-0"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div
          className="overflow-auto font-mono text-sm bg-muted/30"
          style={{ maxHeight: isExpanded ? 'none' : maxHeight }}
        >
          <pre className="p-4">
            {lines.map((line, index) => (
              <div
                key={index}
                className={cn(
                  'flex',
                  highlightLines.includes(index + 1) &&
                    'bg-primary/10 border-l-2 border-primary'
                )}
              >
                {showLineNumbers && (
                  <span className="select-none text-muted-foreground mr-4 w-8 text-right">
                    {index + 1}
                  </span>
                )}
                <code className="flex-1">{line || '\n'}</code>
              </div>
            ))}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

// Multi-language code tabs
export function CodeTabs({
  snippets,
  className,
}: {
  snippets: Array<{
    language: string;
    code: string;
    label?: string;
  }>;
  className?: string;
}) {
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-0">
        <div className="flex border-b bg-muted/50">
          {snippets.map((snippet, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2',
                activeTab === index
                  ? 'border-primary bg-background'
                  : 'border-transparent hover:bg-muted/80'
              )}
            >
              {snippet.label || snippet.language}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <CodeSnippet
          code={snippets[activeTab].code}
          language={snippets[activeTab].language}
          showLineNumbers
        />
      </CardContent>
    </Card>
  );
}

// Inline code
export function InlineCode({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
        className
      )}
    >
      {children}
    </code>
  );
}

// Code comparison (diff view)
export function CodeDiff({
  oldCode,
  newCode,
  language = 'typescript',
  title,
  className,
}: {
  oldCode: string;
  newCode: string;
  language?: string;
  title?: string;
  className?: string;
}) {
  const oldLines = oldCode.split('\n');
  const newLines = newCode.split('\n');
  const maxLength = Math.max(oldLines.length, newLines.length);

  return (
    <Card className={cn('overflow-hidden', className)}>
      {title && (
        <CardHeader className="py-3 px-4 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {language}
            </Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-0 font-mono text-sm">
          {/* Old code */}
          <div className="border-r bg-red-50 dark:bg-red-950/20">
            <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 border-b text-xs font-medium">
              Before
            </div>
            <pre className="p-4 overflow-auto max-h-96">
              {Array.from({ length: maxLength }).map((_, index) => (
                <div key={index} className="flex">
                  <span className="select-none text-muted-foreground mr-4 w-8 text-right">
                    {oldLines[index] !== undefined ? index + 1 : ''}
                  </span>
                  <code className={cn(oldLines[index] !== newLines[index] && 'bg-red-200/50 dark:bg-red-900/50')}>
                    {oldLines[index] || '\n'}
                  </code>
                </div>
              ))}
            </pre>
          </div>

          {/* New code */}
          <div className="bg-green-50 dark:bg-green-950/20">
            <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 border-b text-xs font-medium">
              After
            </div>
            <pre className="p-4 overflow-auto max-h-96">
              {Array.from({ length: maxLength }).map((_, index) => (
                <div key={index} className="flex">
                  <span className="select-none text-muted-foreground mr-4 w-8 text-right">
                    {newLines[index] !== undefined ? index + 1 : ''}
                  </span>
                  <code className={cn(oldLines[index] !== newLines[index] && 'bg-green-200/50 dark:bg-green-900/50')}>
                    {newLines[index] || '\n'}
                  </code>
                </div>
              ))}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Interactive code playground
export function CodePlayground({
  initialCode,
  language = 'typescript',
  onRun,
  className,
}: {
  initialCode: string;
  language?: string;
  onRun?: (code: string) => void;
  className?: string;
}) {
  const [code, setCode] = React.useState(initialCode);
  const [output, setOutput] = React.useState('');

  const handleRun = () => {
    try {
      // This is a placeholder - actual execution would depend on the language
      const result = eval(code);
      setOutput(String(result));
      onRun?.(code);
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">Code Playground</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {language}
          </Badge>
        </div>
        <Button onClick={handleRun} size="sm">
          Run Code
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Editor */}
          <div className="border-b lg:border-b-0 lg:border-r">
            <div className="px-4 py-2 bg-muted/50 border-b text-xs font-medium">
              Editor
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm bg-background resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div>
            <div className="px-4 py-2 bg-muted/50 border-b text-xs font-medium">
              Output
            </div>
            <pre className="w-full h-64 p-4 font-mono text-sm bg-muted/20 overflow-auto">
              {output || 'Run code to see output...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Code snippet with language selector
export function CodeSnippetWithSelector({
  snippets,
  className,
}: {
  snippets: Array<{ language: string; code: string }>;
  className?: string;
}) {
  const [selectedLanguage, setSelectedLanguage] = React.useState(snippets[0]?.language || '');

  const currentSnippet = snippets.find((s) => s.language === selectedLanguage);

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-muted/50">
        <CardTitle className="text-sm font-medium">Code Example</CardTitle>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-32 h-7">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {snippets.map((snippet) => (
              <SelectItem key={snippet.language} value={snippet.language}>
                {snippet.language}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        {currentSnippet && (
          <CodeSnippet code={currentSnippet.code} language={currentSnippet.language} />
        )}
      </CardContent>
    </Card>
  );
}

