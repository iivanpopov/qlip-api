import { AsyncLocalStorage } from 'node:async_hooks'

import { configure, getConsoleSink, getLogfmtFormatter, getLogger } from '@logtape/logtape'

await configure({
  contextLocalStorage: new AsyncLocalStorage(),
  sinks: {
    console: getConsoleSink({
      formatter: getLogfmtFormatter(),
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
