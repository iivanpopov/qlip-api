import type { ContentfulStatusCode } from 'hono/utils/http-status'

export class Exception {
  constructor(
    public status: ContentfulStatusCode,
    public name: string,
    public message?: string,
  ) {}

  toResponse() {
    return new Response(
      JSON.stringify({
        error: { name: this.name, message: this.message },
      }),
      {
        status: this.status,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  static BadRequest(message?: string) {
    return new Exception(400, 'Bad Request', message)
  }

  static TooManyRequests(message?: string) {
    return new Exception(429, 'Too Many Requests', message)
  }

  static InternalServerError(message?: string) {
    return new Exception(500, 'Internal Server Error', message)
  }
}
