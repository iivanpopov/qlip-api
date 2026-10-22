import { sValidator } from '@hono/standard-validator'
import { honoLogger } from '@logtape/hono'
import { Hono } from 'hono'
import z from 'zod'

import { Room } from './room'
import './logger'

export { Room }

interface Env {
  Bindings: {
    ROOM: DurableObjectNamespace<Room>
  }
}

const app = new Hono<Env>()

app.use(honoLogger({ context: true }))

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

export default app
