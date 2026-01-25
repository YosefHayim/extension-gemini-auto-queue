import { addBreadcrumb, captureError, isSentryEnabled } from "@/backend/utils/sentry";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  module: string;
  action: string;
  message: string;
  data?: unknown;
  duration?: number;
}

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  persistLogs: boolean;
  maxStoredLogs: number;
  consoleOutput: boolean;
}

const DEFAULT_CONFIG: LoggerConfig = {
  enabled: import.meta.env.DEV,
  minLevel: LogLevel.DEBUG,
  persistLogs: true,
  maxStoredLogs: 500,
  consoleOutput: true,
};

const STORAGE_KEY = "NANOFLOW_DEV_LOGS";
const LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.NONE]: "NONE",
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "#8B8B8B",
  [LogLevel.INFO]: "#4CAF50",
  [LogLevel.WARN]: "#FF9800",
  [LogLevel.ERROR]: "#F44336",
  [LogLevel.NONE]: "#000000",
};

class DevLogger {
  private config: LoggerConfig;
  private actionTimers = new Map<string, number>();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && level >= this.config.minLevel;
  }

  private async persistLog(entry: LogEntry): Promise<void> {
    if (!this.config.persistLogs) return;

    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const logs: LogEntry[] = result[STORAGE_KEY] || [];

      logs.push(entry);

      while (logs.length > this.config.maxStoredLogs) {
        logs.shift();
      }

      await chrome.storage.local.set({ [STORAGE_KEY]: logs });
    } catch {
      // intentionally empty
    }
  }

  private log(
    level: LogLevel,
    module: string,
    action: string,
    message: string,
    data?: unknown,
    duration?: number
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      levelName: LEVEL_NAMES[level],
      module,
      action,
      message,
      data,
      duration,
    };

    if (this.config.consoleOutput) {
      const prefix = `[NanoFlow ${entry.levelName}]`;
      const moduleAction = `[${module}/${action}]`;
      const durationStr = duration !== undefined ? ` (${duration}ms)` : "";
      const color = LEVEL_COLORS[level];

      let logFn: typeof console.log;
      switch (level) {
        case LogLevel.ERROR:
          logFn = console.error;
          break;
        case LogLevel.WARN:
          logFn = console.warn;
          break;
        case LogLevel.DEBUG:
          logFn = console.debug;
          break;
        default:
          logFn = console.log;
      }

      if (data !== undefined) {
        logFn(`%c${prefix} ${moduleAction}${durationStr} ${message}`, `color: ${color}`, data);
      } else {
        logFn(`%c${prefix} ${moduleAction}${durationStr} ${message}`, `color: ${color}`);
      }
    }

    this.persistLog(entry);
    this.reportToSentry(level, module, action, message, data);
  }

  private reportToSentry(
    level: LogLevel,
    module: string,
    action: string,
    message: string,
    data?: unknown
  ): void {
    if (!isSentryEnabled()) return;

    let sentryLevel: "error" | "warning" | "info" | "debug";
    switch (level) {
      case LogLevel.ERROR:
        sentryLevel = "error";
        break;
      case LogLevel.WARN:
        sentryLevel = "warning";
        break;
      case LogLevel.INFO:
        sentryLevel = "info";
        break;
      default:
        sentryLevel = "debug";
    }

    if (level === LogLevel.ERROR) {
      captureError(new Error(`[${module}/${action}] ${message}`), {
        module,
        action,
        data,
      });
    } else {
      addBreadcrumb({
        category: module,
        message: `[${action}] ${message}`,
        level: sentryLevel,
        data: data as Record<string, unknown> | undefined,
      });
    }
  }

  module(moduleName: string): ModuleLogger {
    return new ModuleLogger(this, moduleName);
  }

  debug(module: string, action: string, message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, module, action, message, data);
  }

  info(module: string, action: string, message: string, data?: unknown): void {
    this.log(LogLevel.INFO, module, action, message, data);
  }

  warn(module: string, action: string, message: string, data?: unknown): void {
    this.log(LogLevel.WARN, module, action, message, data);
  }

  error(module: string, action: string, message: string, data?: unknown): void {
    this.log(LogLevel.ERROR, module, action, message, data);
  }

  startAction(module: string, action: string): string {
    const key = `${module}:${action}:${Date.now()}`;
    this.actionTimers.set(key, performance.now());
    this.debug(module, action, "Started");
    return key;
  }

  endAction(
    key: string,
    module: string,
    action: string,
    message: string,
    success: boolean,
    data?: unknown
  ): void {
    const startTime = this.actionTimers.get(key);
    const duration = startTime ? Math.round(performance.now() - startTime) : undefined;
    this.actionTimers.delete(key);

    if (success) {
      this.info(module, action, message, { ...((data as object) || {}), duration });
    } else {
      this.error(module, action, message, { ...((data as object) || {}), duration });
    }
  }

  async getLogs(): Promise<LogEntry[]> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      return result[STORAGE_KEY] || [];
    } catch {
      return [];
    }
  }

  async clearLogs(): Promise<void> {
    try {
      await chrome.storage.local.remove(STORAGE_KEY);
    } catch {
      // intentionally empty
    }
  }

  async exportLogs(): Promise<string> {
    const logs = await this.getLogs();
    return JSON.stringify(logs, null, 2);
  }

  async downloadLogs(): Promise<void> {
    const logsJson = await this.exportLogs();
    const blob = new Blob([logsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const a = document.createElement("a");
    a.href = url;
    a.download = `nanoflow-logs-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

class ModuleLogger {
  constructor(
    private logger: DevLogger,
    private moduleName: string
  ) {}

  debug(action: string, message: string, data?: unknown): void {
    this.logger.debug(this.moduleName, action, message, data);
  }

  info(action: string, message: string, data?: unknown): void {
    this.logger.info(this.moduleName, action, message, data);
  }

  warn(action: string, message: string, data?: unknown): void {
    this.logger.warn(this.moduleName, action, message, data);
  }

  error(action: string, message: string, data?: unknown): void {
    this.logger.error(this.moduleName, action, message, data);
  }

  startAction(action: string): string {
    return this.logger.startAction(this.moduleName, action);
  }

  endAction(key: string, action: string, message: string, success: boolean, data?: unknown): void {
    this.logger.endAction(key, this.moduleName, action, message, success, data);
  }
}

export const logger = new DevLogger();

export type { ModuleLogger };
