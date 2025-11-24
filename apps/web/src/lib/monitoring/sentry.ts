/**
 * Error monitoring and reporting
 */

interface ErrorContext {
  user?: {
    id?: string;
    email?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

class ErrorMonitor {
  private enabled: boolean = process.env.NODE_ENV === "production";

  captureException(error: Error, context?: ErrorContext): void {
    if (!this.enabled) {
      console.error("[Error Monitor]", error, context);
      return;
    }

    // In production, send to error monitoring service
    // Implementation depends on your monitoring provider (Sentry, etc.)
    this.logError(error, context);
  }

  captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
    if (!this.enabled) {
      console.log(`[Error Monitor] [${level}]`, message);
      return;
    }

    // Send to monitoring service
    this.logMessage(message, level);
  }

  setUser(user: { id: string; email?: string }): void {
    if (!this.enabled) return;

    // Set user context in monitoring service
    console.log("[Error Monitor] User set:", user.id);
  }

  clearUser(): void {
    if (!this.enabled) return;

    // Clear user context
    console.log("[Error Monitor] User cleared");
  }

  private logError(error: Error, context?: ErrorContext): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context,
    };

    console.error("[Error Monitor] Error captured:", errorData);
  }

  private logMessage(message: string, level: string): void {
    console.log(`[Error Monitor] [${level}]`, message);
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }
}

export const errorMonitor = new ErrorMonitor();

// Global error handler
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    errorMonitor.captureException(event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    errorMonitor.captureException(
      new Error(`Unhandled Promise Rejection: ${event.reason}`)
    );
  });
}

