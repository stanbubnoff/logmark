// src/core/Logmark.js
import fs from 'fs'

// src/utils/colors.js
const ANSI_COLORS = {
  debug: '\x1B[38;5;8m',
  info: '\x1B[38;5;2m',
  warn: '\x1B[38;5;202m',
  error: '\x1B[38;5;160m',
  fatal: '\x1B[38;5;1m'
}

// src/utils/decorators.js
const ANSI_DECORATORS = {
  reset: '\x1B[0m',
  bold: '\x1B[1m'
}

// src/core/Logmark.js
const Logmark = class {
  #TAB_SYMBOL = '.'
  #COLORS = ANSI_COLORS
  #DECORS = ANSI_DECORATORS
  #MARKERS = {
    debug: 'DEBUG',
    info: 'INFO',
    warn: 'WARN',
    error: 'ERROR',
    fatal: '! FATAL !'
  }

  #FILES_ENABLED = true
  #FILES_PATH = 'logs'
  #FILES_FILENAME = 'logs'
  #FILENAMES = {
    debug: null,
    info: null,
    warn: null,
    error: null,
    fatal: null
  }

  #setFilenames = (config) => {
    return {
      trace: config.files.filenames.trace ?? this.#FILES_FILENAME,
      debug: config.files.filenames.debug ?? this.#FILES_FILENAME,
      info: config.files.filenames.info ?? this.#FILES_FILENAME,
      warning: config.files.filenames.warning ?? this.#FILES_FILENAME,
      error: config.files.filenames.error ?? this.#FILES_FILENAME,
      fatal: config.files.filenames.fatal ?? this.#FILES_FILENAME
    }
  }

  #getMessageHead = () => {
    let { rss, heapTotal, heapUsed } = process.memoryUsage()
    rss = (rss / 1024).toFixed(2).toString().concat(' Kb')
    heapTotal = (heapTotal / 1024).toFixed(2).toString().concat(' Kb')
    heapUsed = (heapUsed / 1024).toFixed(2).toString().concat(' Kb')
    return `${new Date().toLocaleString()} | pid: ${process.pid} | rss: ${rss} | heapTotal: ${heapTotal} | heapUsed: ${heapUsed} |

${this.#TAB_SYMBOL.repeat(3)}`
  }

  #createConsoleMessage = (level, msg, options) => {
    try {
      const extraTag = options && options.tag ? ` #${options.tag}: ` : ''
      return `${this.#DECORS.bold}${this.#COLORS[level]}${this.#MARKERS[level]}${this.#DECORS.reset} | ${this.#getMessageHead()}  message   ${this.#TAB_SYMBOL.repeat(3)}

${this.#COLORS[level]}${extraTag}${msg.toString()}${this.#DECORS.reset}
`
    } catch (error) {
      console.error(error)
    }
  }

  #createFileMessage = async (level, msg, options) => {
    try {
      const extraTag = (options && options.tag) ? ` #${options.tag}: ` : ''
      const extraData = (options && options.data) ? `${this.#TAB_SYMBOL.repeat(3)} attachment ${this.#TAB_SYMBOL.repeat(3)}\n\n${JSON.stringify(options.data)}\n\n` : ''
      const extraError = (options && options.error) ? `${this.#TAB_SYMBOL.repeat(3)} attachment ${this.#TAB_SYMBOL.repeat(3)}\n\n${(options.error.stack || options.error.message || options.error).toString()}\n\n` : ''

      return `${this.#MARKERS[level]} | ${this.#getMessageHead()}  message   ${this.#TAB_SYMBOL.repeat(3)}\n\n${extraTag}${msg.toString()}\n\n${extraData || extraError}`
    } catch (error) {
      console.error(error)
    }
  }

  #writeToFile = async (level, message) => {
    try {
      const path = this.#FILENAMES[level] ? `${this.#FILES_PATH}/${this.#FILENAMES[level]}.log` : `${this.#FILES_PATH}/${this.#FILES_FILENAME}.log`
      fs.appendFile(path, message, (error) => {
        if (error !== null) {
          throw new Error(error)
        }
      })
    } catch (error) {
      console.error(error)
    }
  }

  #log = (level, message, options) => {
    try {
      const msg = this.#createConsoleMessage(level, message, options ?? {})
      console[level](msg)
      if (options && options.data) {
        console[level](`
${this.#TAB_SYMBOL.repeat(3)} attachment ${this.#TAB_SYMBOL.repeat(3)}
`)
        console[level](options.data)
        console[level]('\n')
      }
      if (this.#FILES_ENABLED) {
        (async () => {
          const fileMessage = await this.#createFileMessage(level, message, options)
          await this.#writeToFile(level, fileMessage)
        })()
      }
    } catch (error) {
      console.error(error)
    }
  }

  #logError = (level, message, options) => {
    try {
      const msg = this.#createConsoleMessage(level, message, options ?? {})
      console.error(msg)
      if (options && options.error) {
        console.error(`
${this.#TAB_SYMBOL.repeat(3)} attachment ${this.#TAB_SYMBOL.repeat(3)}
`)
        console.error(options.error)
        console.error('\n')
      }
      if (this.#FILES_ENABLED) {
        (async () => {
          const fileMessage = await this.#createFileMessage(level, message, options)
          await this.#writeToFile(level, fileMessage)
        })()
      }
    } catch (error) {
      console.error(error)
    }
  }

  /**
 * @param {object} [config]
 * @param {object} [config.files]
 * @param {boolean} [config.files.enabled]
 * @param {string} [config.files.pathname]
 * @param {string} [config.files.filename]
 * @param {object} [config.files.filenames]
 * @param {string} [config.files.filenames.debug]
 * @param {string} [config.files.filenames.info]
 * @param {string} [config.files.filenames.warn]
 * @param {string} [config.files.filenames.error]
 * @param {string} [config.files.filenames.fatal]
 */
  constructor (config) {
    try {
      if (config && config.files) {
        this.#FILES_ENABLED = config.files.enabled ?? this.#FILES_ENABLED
        this.#FILES_PATH = config.files.pathname ?? this.#FILES_PATH
        this.#FILES_FILENAME = config.files.filename ?? this.#FILES_FILENAME
        if (config.files.filenames) {
          this.#FILENAMES = this.#setFilenames(config)
        }
      }
      if (this.#FILES_ENABLED) {
        fs.mkdir(this.#FILES_PATH, { recursive: true }, (error) => {
          if (error !== null) {
            console.error(error)
          }
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  debug (message, options) {
    this.#log('debug', message, options)
  }

  info (message, options) {
    this.#log('info', message, options)
  }

  warn (message, options) {
    this.#log('warn', message, options)
  }

  error (message, options) {
    this.#logError('error', message, options)
  }

  fatal (message, options) {
    this.#logError('fatal', message, options)
  }
}
export {
  Logmark
}
