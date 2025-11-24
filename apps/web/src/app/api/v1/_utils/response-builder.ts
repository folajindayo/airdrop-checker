import { NextResponse } from 'next/server';
import { formatSuccessResponse, formatErrorResponse } from '../_formatters';

/**
 * Response builder utility for consistent API responses
 */
export class ResponseBuilder {
  private data: any;
  private statusCode: number = 200;
  private headers: Record<string, string> = {};
  private version: string = '1.0.0';

  static success<T>(data: T): ResponseBuilder {
    const builder = new ResponseBuilder();
    builder.data = data;
    return builder;
  }

  static error(code: string, message: string, statusCode: number = 500): ResponseBuilder {
    const builder = new ResponseBuilder();
    builder.data = { code, message };
    builder.statusCode = statusCode;
    return builder;
  }

  withStatus(statusCode: number): this {
    this.statusCode = statusCode;
    return this;
  }

  withHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  withHeaders(headers: Record<string, string>): this {
    this.headers = { ...this.headers, ...headers };
    return this;
  }

  withVersion(version: string): this {
    this.version = version;
    return this;
  }

  withCache(maxAge: number): this {
    this.headers['Cache-Control'] = `public, max-age=${maxAge}`;
    return this;
  }

  build(): NextResponse {
    const response = this.statusCode >= 400
      ? formatErrorResponse(this.data.code, this.data.message, this.statusCode)
      : formatSuccessResponse(this.data, { version: this.version });

    Object.entries(this.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }
}

