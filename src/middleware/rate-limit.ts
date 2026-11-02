import { Exception } from '#/lib/exception'
import { hono } from '#/lib/hono'

export const rateLimit = hono.createMiddleware(async (c, next) => {
  const ip = c.req.header('CF-Connecting-IP') ?? 'unknown'

  const { success } = await c.env.RATE_LIMITER.limit({ key: ip })
  if (success) return next()
  return Exception.TooManyRequests().toResponse()
})
