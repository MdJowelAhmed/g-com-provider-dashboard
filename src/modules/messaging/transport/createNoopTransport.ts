import type { MessagingTransport } from './MessagingTransport'

/** Default transport until backend sockets are wired */
export function createNoopTransport(): MessagingTransport {
  return {
    connect() {},
    disconnect() {},
  }
}
