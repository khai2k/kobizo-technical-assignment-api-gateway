interface LogLevel {
  ERROR: "error";
  WARN: "warn";
  INFO: "info";
  DEBUG: "debug";
}

const LOG_LEVELS: LogLevel = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
  }

  private log(level: string, message: string, meta?: any): void {
    const formattedMessage = this.formatMessage(level, message, meta);

    // Don't log during tests
    if (process.env.NODE_ENV === "test") {
      return;
    }

    if (this.isDevelopment) {
      console.log(formattedMessage);
    } else {
      // In production, you might want to use a proper logging service
      console.log(formattedMessage);
    }
  }

  error(message: string, meta?: any): void {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message: string, meta?: any): void {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      this.log(LOG_LEVELS.DEBUG, message, meta);
    }
  }
}

export const logger = new Logger();
