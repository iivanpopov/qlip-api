import { AsyncLocalStorage } from 'node:async_hooks'

import {
  configure,
  getAnsiColorFormatter,
  getConsoleSink,
  getLogfmtFormatter,
  getLogger,
} from '@logtape/logtape'

const formatter =
  process.env.NODE_ENV === 'development'
    ? getAnsiColorFormatter({
        timestamp: 'time',
        timeZone: null,
        level: (level) => level.toUpperCase().padEnd(7),
        category: ':',
        categoryColor: 'cyan',
        value: 'bare',
        format: ({ timestamp, level, category, message }) =>
          `${timestamp} ${level} ${category} › ${message}`,
      })
    : getLogfmtFormatter()

await configure({
  contextLocalStorage: new AsyncLocalStorage(),
  sinks: {
    console: getConsoleSink({
      formatter,
    }),
  },
  loggers: [
    { category: ['hono'], sinks: ['console'], lowestLevel: 'debug' },
    {
      category: ['logtape', 'meta'],
      sinks: [],
    },
  ],
})

export const logger = getLogger(['hono'])
