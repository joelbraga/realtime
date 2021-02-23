import WebSocket = require('ws');
import {MessageFromServer, MessageFromClient} from './constants';

// TODO: Here we can do better parsers. For now let's send exchange strings

// server -> received
export function parseRawMessageFromClient<T>(
  message: string | Buffer | ArrayBuffer | Buffer[]
): MessageFromClient<T> {
  return JSON.parse(<string>message);
}

// server -> sent
export function parseMessageFromServer<T>(
  message: MessageFromServer<T>
): string | Buffer | ArrayBuffer | Buffer[] {
  return JSON.stringify(message);
}

// client -> received
export function parseRawMessageFromServer<T>(
  message: string | Buffer | ArrayBuffer | Buffer[]
): MessageFromServer<T> {
  return JSON.parse(<string>message);
}

// client -> sent
export function parseMessageFromClient<T>(
  message: MessageFromClient<T>
): string | ArrayBufferLike | Blob | ArrayBufferView {
  return JSON.stringify(message);
}
