export declare class Logmark {
  constructor(config: Constructor): void
  debug(options: Options): void
  info(options: Options): void
  warn(options: Options): void
  error(options: Options): void
  fatal(options: Options): void
}

interface Constructor {
  files?: {
    enabled?: boolean
    pathname?: string
    filename?: string
    filenames?: {
      debug?: string
      info?: string
      warn?: string
      error?: string
      fatal?: string
    }
  }
}

interface Options {
  message: string
  options?: {
    tag?: string
    data?: any
    error?: any
  }
}