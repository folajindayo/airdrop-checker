/**
 * Error Handler Helper
 */

export class ErrorHandler {
  static handle(error: unknown): { message: string; code?: string } {
    if (error instanceof Error) {
      return {
        message: error.message,
        code: (error as any).code,
      };
    }
    
    if (typeof error === 'string') {
      return { message: error };
    }
    
    return { message: 'An unknown error occurred' };
  }

  static isNetworkError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return message.toLowerCase().includes('network') ||
           message.toLowerCase().includes('timeout');
  }

  static getUserFriendlyMessage(error: unknown): string {
    const { message } = ErrorHandler.handle(error);
    
    if (message.includes('insufficient funds')) {
      return 'You do not have enough funds for this transaction';
    }
    
    if (message.includes('user rejected')) {
      return 'Transaction was cancelled';
    }
    
    return message;
  }
}

