import { Logmark } from './pkg/index.js'

const mark = new Logmark({
  files: {
    enabled: true,
    pathname: 'logs',
    filename: 'logs'
    // filenames: {
    //   trace: 'trace',
    //   debug: 'debug',
    //   info: 'info',
    //   warn: 'warn',
    //   error: 'error',
    //   fatal: 'fatal'
    // }
  }
})

mark.debug('debug')
mark.debug('debug tag', {
  tag: 'test'
})
mark.debug('debug data', {
  tag: 'test',
  data: { debug: 'data' }
})

mark.warn('warn')
mark.warn('warn tag', {
  tag: 'test'
})
mark.warn('warn data', {
  tag: 'test',
  data: { warn: 'data' }
})

mark.info('info')
mark.info('info tag', {
  tag: 'test'
})
mark.info('info data', {
  tag: 'test',
  data: 'string attachment'
})

mark.error('error')
mark.error('error tag', {
  tag: 'test'
})
mark.error('error data', {
  tag: 'test',
  error: Error('err')
})

mark.fatal('fatal')
mark.fatal('fatal tag', {
  tag: 'test'
})
mark.fatal('fatal data', {
  tag: 'test',
  error: Error('fatal err')
})
