import fs from 'fs'

import { ANSI_COLORS } from '../utils/colors.js'
import { ANSI_DECORATORS } from '../utils/decorators.js'

/**
 * Main class of library
 */
export class Logmark {
  // PRIVATE VARS //

  #TAB_SYMBOL = '.'
  #COLORS = ANSI_COLORS
  #DECORS = ANSI_DECORATORS

  // markers
  #MARKERS = {
    debug: 'DEBUG',
    info: 'INFO',
    warn: 'WARN',
    error: 'ERROR',
    fatal: '! FATAL !'
  }

  // files
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

  // PRIVATE METHODS //
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

  #createConsoleMessage = (level, msg, options) => {
    try {
      let { rss, heapTotal, heapUsed } = process.memoryUsage()
      rss = (rss / 1024).toFixed(2).toString().concat(' Kb')
      heapTotal = (heapTotal / 1024).toFixed(2).toString().concat(' Kb')
      heapUsed = (heapUsed / 1024).toFixed(2).toString().concat(' Kb')

      if (options && options.tag) {
        return `${this.#DECORS.bold}${this.#COLORS[level]}${this.#MARKERS[level]}${this.#DECORS.reset} | ${new Date().toLocaleString()} | pid: ${process.pid} | rss: ${rss} | heapTotal: ${heapTotal} | heapUsed: ${heapUsed} |\n\n${this.#TAB_SYMBOL.repeat(3)}  message   ${this.#TAB_SYMBOL.repeat(3)}\n\n${this.#COLORS[level]} #${options.tag}: ${msg.toString()}${this.#DECORS.reset}\n`
      }

      return `${this.#DECORS.bold}${this.#COLORS[level]}${this.#MARKERS[level]}${this.#DECORS.reset} | ${new Date().toLocaleString()} | pid: ${process.pid} | rss: ${rss} | heapTotal: ${heapTotal} | heapUsed: ${heapUsed} |\n\n${this.#TAB_SYMBOL.repeat(3)}  message   ${this.#TAB_SYMBOL.repeat(3)}\n\n${this.#COLORS[level]}${msg.toString()}${this.#DECORS.reset}\n`
    } catch (error) {
      console.error(error)
    }
  }

  #createFileMessage = async (level, msg, options) => {
    try {
      let { rss, heapTotal, heapUsed } = process.memoryUsage()
      rss = (rss / 1024).toFixed(2).toString().concat(' Kb')
      heapTotal = (heapTotal / 1024).toFixed(2).toString().concat(' Kb')
      heapUsed = (heapUsed / 1024).toFixed(2).toString().concat(' Kb')

      if (options && options.tag) {
        if (options.data) {
          return `${this.#MARKERS[level]} | ${new Date().toLocaleString()} | pid: ${process.pid} | rss: ${rss} | heapTotal: ${heapTotal} | heapUsed: ${heapUsed} |\n\n${this.#TAB_SYMBOL.repeat(3)}  message   ${this.#TAB_SYMBOL.repeat(3)}\n\n #${options.tag}: ${msg.toString()}\n\n${this.#TAB_SYMBOL.repeat(3)} attachment ${this.#TAB_SYMBOL.repeat(3)}\n\n${JSON.stringify(options.data)}\n\n`
        }

        if (options.error) {
          return `${this.#MARKERS[level]} | ${new Date().toLocaleString()} | pid: ${process.pid} | rss: ${rss} | heapTotal: ${heapTotal} | heapUsed: ${heapUsed} |\n\n${this.#TAB_SYMBOL.repeat(3)}  message   ${this.#TAB_SYMBOL.repeat(3)}\n\n #${options.tag}: ${msg.toString()}\n\n${this.#TAB_SYMBOL.repeat(3)} attachment ${this.#TAB_SYMBOL.repeat(3)}\n\n${options.error.stack.toString()}\n\n`
        }

        return `${this.#MARKERS[level]} | ${new Date().toLocaleString()} | pid: ${process.pid} | rss: ${rss} | heapTotal: ${heapTotal} | heapUsed: ${heapUsed} |\n\n${this.#TAB_SYMBOL.repeat(3)}  message   ${this.#TAB_SYMBOL.repeat(3)}\n\n #${options.tag}: ${msg.toString()}\n\n`
      }

      if (options && options.data) {
        return `${this.#MARKERS[level]} | ${new Date().toLocaleString()} | pid: ${process.pid} | rss: ${rss} | heapTotal: ${heapTotal} | heapUsed: ${heapUsed} |\n\n${this.#TAB_SYMBOL.repeat(3)}  message   ${this.#TAB_SYMBOL.repeat(3)}\n\n${msg.toString()}\n\n${this.#TAB_SYMBOL.repeat(3)} attachment ${this.#TAB_SYMBOL.repeat(3)}\n\n${JSON.stringify(options.data)}\n\n`
      }

      if (options && options.error) {
        return `${this.#MARKERS[level]} | ${new Date().toLocaleString()} | pid: ${process.pid} | rss: ${rss} | heapTotal: ${heapTotal} | heapUsed: ${heapUsed} |\n\n${this.#TAB_SYMBOL.repeat(3)}  message   ${this.#TAB_SYMBOL.repeat(3)}\n\n${msg.toString()}\n\n${this.#TAB_SYMBOL.repeat(3)} attachment ${this.#TAB_SYMBOL.repeat(3)}\n\n${options.error.stack.toString()}\n\n`
      }

      return `${this.#MARKERS[level]} | ${new Date().toLocaleString()} | pid: ${process.pid} | rss: ${rss} | heapTotal: ${heapTotal} | heapUsed: ${heapUsed} |\n\n${this.#TAB_SYMBOL.repeat(3)}  message   ${this.#TAB_SYMBOL.repeat(3)}\n\n${msg.toString()}\n\n`
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
        console[level](`\n${this.#TAB_SYMBOL.repeat(3)} attachment ${this.#TAB_SYMBOL.repeat(3)}\n`)
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
        console.error(`\n${this.#TAB_SYMBOL.repeat(3)} attachment ${this.#TAB_SYMBOL.repeat(3)}\n`)
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

  /**
   * @param {string} message
   * @param {object} [options]
   * @param {string} [options.tag]
   * @param {*} [options.data]
   */
  debug (message, options) {
    this.#log('debug', message, options)
  }

  /**
   * @param {string} message
   * @param {object} [options]
   * @param {string} [options.tag]
   * @param {*} [options.data]
   */
  info (message, options) {
    this.#log('info', message, options)
  }

  /**
   * @param {string} message
   * @param {object} [options]
   * @param {string} [options.tag]
   * @param {*} [options.data]
   */
  warn (message, options) {
    this.#log('warn', message, options)
  }

  /**
   * @param {string} message
   * @param {object} [options]
   * @param {string} [options.tag]
   * @param {*} [options.data]
   */
  error (message, options) {
    this.#logError('error', message, options)
  }

  /**
   * @param {string} message
   * @param {object} [options]
   * @param {string} [options.tag]
   * @param {*} [options.data]
   */
  fatal (message, options) {
    this.#logError('fatal', message, options)
  }
}
