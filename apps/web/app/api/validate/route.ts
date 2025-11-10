import { NextRequest, NextResponse } from 'next/server';
import { isValidAddress } from '@airdrop-finder/shared';

export const dynamic = 'force-dynamic';

/**
 * POST /api/validate
 * Validate and sanitize input data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, value } = body;

    if (!type || !value) {
      return NextResponse.json(
        { error: 'type and value are required' },
        { status: 400 }
      );
    }

    const validation: Record<string, any> = {
      valid: false,
      sanitized: null,
      errors: [],
      warnings: [],
    };

    switch (type) {
      case 'address':
        validation.valid = isValidAddress(value);
        if (validation.valid) {
          validation.sanitized = value.toLowerCase();
        } else {
          validation.errors.push('Invalid Ethereum address format');
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        validation.valid = emailRegex.test(value);
        if (validation.valid) {
          validation.sanitized = value.toLowerCase().trim();
        } else {
          validation.errors.push('Invalid email format');
        }
        break;

      case 'url':
        try {
          const url = new URL(value);
          validation.valid = url.protocol === 'http:' || url.protocol === 'https:';
          if (validation.valid) {
            validation.sanitized = url.toString();
          } else {
            validation.errors.push('URL must use http or https protocol');
          }
        } catch {
          validation.errors.push('Invalid URL format');
        }
        break;

      case 'ip':
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        validation.valid = ipRegex.test(value);
        if (validation.valid) {
          validation.sanitized = value.trim();
        } else {
          validation.errors.push('Invalid IP address format');
        }
        break;

      case 'number':
        const num = parseFloat(value);
        validation.valid = !isNaN(num) && isFinite(num);
        if (validation.valid) {
          validation.sanitized = num;
        } else {
          validation.errors.push('Invalid number format');
        }
        break;

      case 'string':
        validation.valid = typeof value === 'string';
        if (validation.valid) {
          // Sanitize string (remove dangerous characters)
          validation.sanitized = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/[<>]/g, '')
            .trim();
          if (validation.sanitized.length > 1000) {
            validation.warnings.push('String truncated to 1000 characters');
            validation.sanitized = validation.sanitized.slice(0, 1000);
          }
        } else {
          validation.errors.push('Value must be a string');
        }
        break;

      default:
        return NextResponse.json(
          { error: `Unknown validation type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      validation,
    });
  } catch (error) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

