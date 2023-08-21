import winston from 'winston'

const isDevelopment = process.env['NODE_ENV'] === 'development'

class Logger {
  private static instance: Logger
  private readonly baseLogger: winston.Logger
  private contextLogger?: winston.Logger

  private constructor() {
    this.baseLogger = winston.createLogger({
      level: isDevelopment ? 'debug' : 'info',
      format: winston.format.combine(winston.format.splat(), winston.format.json()),
      defaultMeta: { service: 'pet-shop-api' },
      transports: [new winston.transports.Console({ format: winston.format.simple() })],
    })
    this.baseLogger.exceptions.handle(new winston.transports.Console({ format: winston.format.simple() }))
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error' | 'critical') {
    this.baseLogger.level = level
  }

  setContext(correlationId: string) {
    this.contextLogger = this.baseLogger.child({ correlationId })
  }

  private get activeLogger(): winston.Logger {
    return this.contextLogger || this.baseLogger
  }

  info(message: string, ...meta: unknown[]) {
    this.activeLogger.info(message, ...meta)
  }

  debug(message: string, ...meta: unknown[]) {
    this.activeLogger.debug(message, ...meta)
  }

  warn(message: string, ...meta: unknown[]) {
    this.activeLogger.warn(message, ...meta)
  }

  error(message: string, ...meta: unknown[]) {
    this.activeLogger.error(message, ...meta)
  }
}

export const log = Logger.getInstance()
