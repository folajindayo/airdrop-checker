'use client';

import * as React from 'react';
import { Download, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
  className?: string;
}

export function QRCode({
  value,
  size = 256,
  level = 'M',
  bgColor = '#ffffff',
  fgColor = '#000000',
  includeMargin = true,
  className,
}: QRCodeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!canvasRef.current || !value) return;

    // This is a placeholder - you would use a library like qrcode.react or qrcode
    // For demonstration, we'll create a simple grid pattern
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Simple grid pattern (placeholder for actual QR code)
    ctx.fillStyle = fgColor;
    const moduleSize = size / 25;
    const margin = includeMargin ? moduleSize : 0;

    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(
            margin + col * moduleSize,
            margin + row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }, [value, size, level, bgColor, fgColor, includeMargin]);

  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = url;
    link.click();
  };

  return (
    <div className={cn('inline-block', className)}>
      <canvas ref={canvasRef} className="rounded-lg border" />
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={downloadQRCode}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}

// QR Code Generator with customization
export function QRCodeGenerator({
  defaultValue = '',
  className,
}: {
  defaultValue?: string;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const [size, setSize] = React.useState(256);
  const [fgColor, setFgColor] = React.useState('#000000');
  const [bgColor, setBgColor] = React.useState('#ffffff');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
        <CardDescription>
          Create a QR code for any text or URL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="qr-value">Content</Label>
          <Input
            id="qr-value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter text or URL..."
          />
        </div>

        <div className="space-y-2">
          <Label>Size: {size}px</Label>
          <Slider
            value={[size]}
            onValueChange={([value]) => setSize(value)}
            min={128}
            max={512}
            step={32}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fg-color">Foreground Color</Label>
            <div className="flex gap-2">
              <Input
                id="fg-color"
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-10 w-20"
              />
              <Input
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bg-color">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-20"
              />
              <Input
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>

        {value && (
          <div className="flex justify-center">
            <QRCode
              value={value}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Wallet Address QR Code
export function WalletQRCode({
  address,
  name,
  showAddress = true,
  size = 200,
  className,
}: {
  address: string;
  name?: string;
  showAddress?: boolean;
  size?: number;
  className?: string;
}) {
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  const shareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: name || 'Wallet Address',
          text: address,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">
          {name || 'Wallet Address'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <QRCode value={address} size={size} />
        </div>
        {showAddress && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center break-all">
              {address}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copyAddress}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              {navigator.share && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={shareAddress}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// QR Code Scanner (placeholder - would need camera API)
export function QRCodeScanner({
  onScan,
  className,
}: {
  onScan: (data: string) => void;
  className?: string;
}) {
  const [isScanning, setIsScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const startScanning = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      // This is a placeholder - actual implementation would use camera API
      // and a QR code scanning library like jsQR or html5-qrcode
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onScan('scanned-data-placeholder');
      setIsScanning(false);
    } catch (err) {
      setError('Failed to access camera');
      setIsScanning(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Scan QR Code</CardTitle>
        <CardDescription>
          Point your camera at a QR code to scan it
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          {isScanning ? (
            <div className="text-center">
              <div className="animate-pulse text-muted-foreground">
                Scanning...
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Click start to begin scanning
              </p>
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        <Button
          onClick={startScanning}
          disabled={isScanning}
          className="w-full"
        >
          {isScanning ? 'Scanning...' : 'Start Scanning'}
        </Button>
      </CardContent>
    </Card>
  );
}

// Share via QR Code
export function ShareQRCode({
  url,
  title,
  description,
  className,
}: {
  url: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
        {description && (
          <CardDescription className="text-center">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <QRCode value={url} size={256} />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Scan this QR code to visit the link
        </p>
      </CardContent>
    </Card>
  );
}

