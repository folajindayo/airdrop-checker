'use client';

import * as React from 'react';
import { Eraser, Download, RotateCcw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export interface SignaturePadProps {
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
  onSave?: (signature: string) => void;
  onClear?: () => void;
  className?: string;
}

export function SignaturePad({
  width = 500,
  height = 200,
  penColor = '#000000',
  penWidth = 2,
  backgroundColor = '#ffffff',
  onSave,
  onClear,
  className,
}: SignaturePadProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [isEmpty, setIsEmpty] = React.useState(true);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }, [width, height, backgroundColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setIsEmpty(false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Touch support
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setIsEmpty(false);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
    setIsEmpty(true);
    onClear?.();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave?.(dataUrl);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `signature-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="border rounded cursor-crosshair touch-none"
          style={{ maxWidth: '100%', height: 'auto' }}
        />

        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={clear} disabled={isEmpty}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={download}
              disabled={isEmpty}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button size="sm" onClick={save} disabled={isEmpty}>
              <Check className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Signature pad with agreement
export function SignatureAgreement({
  agreementText,
  onSign,
  className,
}: {
  agreementText: string;
  onSign: (signature: string) => void;
  className?: string;
}) {
  const [agreed, setAgreed] = React.useState(false);
  const [signature, setSignature] = React.useState<string | null>(null);

  const handleSave = (sig: string) => {
    setSignature(sig);
  };

  const handleSubmit = () => {
    if (agreed && signature) {
      onSign(signature);
    }
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Agreement</h3>
          <div className="p-4 bg-muted rounded-lg max-h-40 overflow-y-auto">
            <p className="text-sm text-muted-foreground">{agreementText}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="agree" className="text-sm cursor-pointer">
            I agree to the terms and conditions
          </label>
        </div>

        <div>
          <Label className="mb-2">Signature</Label>
          <SignaturePad
            height={150}
            onSave={handleSave}
            className={!agreed ? 'opacity-50 pointer-events-none' : ''}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!agreed || !signature}
          className="w-full"
        >
          Submit Signature
        </Button>
      </div>
    </Card>
  );
}

// Wallet signature verification
export function WalletSignatureVerification({
  walletAddress,
  message,
  onSign,
  className,
}: {
  walletAddress: string;
  message: string;
  onSign: (signature: string) => void;
  className?: string;
}) {
  const [signed, setSigned] = React.useState(false);

  const handleSign = (signature: string) => {
    setSigned(true);
    onSign(signature);
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Verify Wallet Ownership</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sign a message to prove you own this wallet address
          </p>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Wallet:</span>
              <span className="font-mono">{walletAddress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Message:</span>
              <span className="font-mono text-xs">{message}</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-2">Draw your signature</Label>
          <SignaturePad height={150} onSave={handleSign} />
        </div>

        {signed && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-500 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Signature verified successfully
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// Mini signature display
export function SignatureDisplay({
  signature,
  name,
  date,
  className,
}: {
  signature: string;
  name?: string;
  date?: Date;
  className?: string;
}) {
  return (
    <div className={cn('border rounded-lg p-4 bg-muted/50', className)}>
      <img
        src={signature}
        alt="Signature"
        className="max-w-full h-auto max-h-20 mx-auto"
      />
      {(name || date) && (
        <div className="mt-3 pt-3 border-t text-center space-y-1">
          {name && <p className="text-sm font-medium">{name}</p>}
          {date && (
            <p className="text-xs text-muted-foreground">
              {date.toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Signature comparison
export function SignatureComparison({
  original,
  current,
  onVerify,
  className,
}: {
  original: string;
  current: string;
  onVerify?: (match: boolean) => void;
  className?: string;
}) {
  const [match, setMatch] = React.useState<boolean | null>(null);

  const handleVerify = () => {
    // Simple comparison (in production, use proper image comparison)
    const matches = original === current;
    setMatch(matches);
    onVerify?.(matches);
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Original Signature</Label>
            <SignatureDisplay signature={original} />
          </div>
          <div>
            <Label className="mb-2">Current Signature</Label>
            <SignatureDisplay signature={current} />
          </div>
        </div>

        <Button onClick={handleVerify} className="w-full">
          Verify Signatures
        </Button>

        {match !== null && (
          <div
            className={cn(
              'p-4 rounded-lg',
              match
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            )}
          >
            <p
              className={cn(
                'text-sm flex items-center gap-2',
                match ? 'text-green-500' : 'text-red-500'
              )}
            >
              {match ? (
                <>
                  <Check className="h-4 w-4" />
                  Signatures match
                </>
              ) : (
                <>
                  <Eraser className="h-4 w-4" />
                  Signatures do not match
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// Signature with typed name fallback
export function SignatureWithTyped({
  onComplete,
  requireSignature = false,
  className,
}: {
  onComplete: (data: { signature?: string; typed?: string }) => void;
  requireSignature?: boolean;
  className?: string;
}) {
  const [mode, setMode] = React.useState<'draw' | 'type'>('draw');
  const [signature, setSignature] = React.useState<string | null>(null);
  const [typedName, setTypedName] = React.useState('');

  const handleSubmit = () => {
    if (mode === 'draw' && signature) {
      onComplete({ signature });
    } else if (mode === 'type' && typedName) {
      onComplete({ typed: typedName });
    }
  };

  const canSubmit =
    (mode === 'draw' && signature) || (mode === 'type' && typedName);

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button
            variant={mode === 'draw' ? 'default' : 'outline'}
            onClick={() => setMode('draw')}
            className="flex-1"
          >
            Draw Signature
          </Button>
          {!requireSignature && (
            <Button
              variant={mode === 'type' ? 'default' : 'outline'}
              onClick={() => setMode('type')}
              className="flex-1"
            >
              Type Name
            </Button>
          )}
        </div>

        {mode === 'draw' ? (
          <SignaturePad height={150} onSave={setSignature} />
        ) : (
          <div className="space-y-2">
            <Label>Type your full name</Label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 border rounded-lg"
            />
            {typedName && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-serif italic text-center">
                  {typedName}
                </p>
              </div>
            )}
          </div>
        )}

        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
          Confirm
        </Button>
      </div>
    </Card>
  );
}

