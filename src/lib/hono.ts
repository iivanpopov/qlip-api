import { createFactory } from 'hono/factory'

import type { Room } from '#/objects/room'

interface Env {
  Bindings: __BaseEnv_CloudflareBindings
}

export const hono = createFactory<Env>()
