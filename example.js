import { Logmark } from 'pkg/index.js'

const mark = new Logmark()

mark.info('some debug message', {
  tag: 'server',
  data: { important: 'object' }
})

mark.warn('some debug message', {
  tag: 'server',
  data: 'important string'
})

mark.debug('some debug message', {
  tag: 'server',
  data: 10000
})

mark.error('some debug message', {
  tag: 'server',
  error: new Error('error object')
})

mark.fatal('some debug message', {
  tag: 'server',
  error: new Error('fatal error object')
})
