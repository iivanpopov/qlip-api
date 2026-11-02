import { sValidator } from '@hono/standard-validator'
import { honoLogger } from '@logtape/hono'
import { cors } from 'hono/cors'
import { ofetch } from 'ofetch'
import z from 'zod'

import { CREDENTIALS_URL } from '#/constants'
import { Exception } from '#/lib/exception'
import { hono } from '#/lib/hono'
import { logger } from '#/lib/logger'
import { Room } from '#/objects/room'

import { rateLimit } from './middleware/rate-limit'

const app = hono.createApp()

app.use(cors())
app.use(honoLogger({ context: true }))

app.onError((error) => {
  if (error instanceof Exception) return error.toResponse()
  logger.error(error)
  return Exception.InternalServerError().toResponse()
})

app.get('/ice', rateLimit, async (c) => {
  const { iceServers } = await ofetch(CREDENTIALS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.env.TURN_TOKEN}`,
    },
    body: { ttl: 3600 },
  })

  return c.json(iceServers)
})

const JoinRoomParamSchema = z.object({ code: z.string().length(5) })
type JoinRoomParamSchema = z.infer<typeof JoinRoomParamSchema>

const JoinRoomSearchSchema = z.object({ clientId: z.string() })
type JoinRoomSearchSchema = z.infer<typeof JoinRoomSearchSchema>

app.get(
  '/:code',
  sValidator('param', JoinRoomParamSchema),
  sValidator('query', JoinRoomSearchSchema),
  async (c) => {
    if (c.req.header('Upgrade') !== 'websocket') return c.body(null, 426)

    const param = c.req.valid('param')

    const room = c.env.ROOM.getByName(param.code)

    return room.fetch(c.req.raw)
  },
)

export { Room }
export default app
