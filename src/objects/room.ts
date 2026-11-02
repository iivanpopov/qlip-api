import { DurableObject } from 'cloudflare:workers'

import { Exception } from '#/lib/exception'
import { logger } from '#/lib/logger'

export class Room extends DurableObject {
  async fetch(request: Request) {
    const clientId = new URL(request.url).searchParams.get('clientId')

    logger.info('connection {clientId}', { clientId })

    const websockets = this.ctx.getWebSockets()
    const opened = websockets.filter((socket) => socket.readyState === socket.OPEN)

    const previous = opened.find((socket) => socket.deserializeAttachment().clientId === clientId)

    if (opened.length === 2 && !previous) return Exception.BadRequest('ROOM_FULL').toResponse()

    if (previous) {
      previous.close()
      logger.info('closed previous {clientId}', { clientId })
    }

    const other = opened.find((socket) => socket.deserializeAttachment().clientId !== clientId)
    if (other) {
      other.send(JSON.stringify({ type: 'ready' }))
      logger.info('sent ready to {clientId}', { clientId: other.deserializeAttachment().clientId })
    }

    const { 0: server, 1: client } = new WebSocketPair()

    this.ctx.acceptWebSocket(server)

    server.serializeAttachment({ clientId })

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, message: string) {
    const sender = ws.deserializeAttachment()

    const other = this.ctx
      .getWebSockets()
      .find(
        (socket) =>
          socket.readyState === socket.OPEN &&
          socket.deserializeAttachment().clientId !== sender.clientId,
      )
    if (!other) return

    other.send(message)
  }
}
