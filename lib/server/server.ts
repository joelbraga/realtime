import * as WebSocket from 'ws';
import {
  ErrorAuth,
  EventCheckin,
  EventConnection,
  MessageFromServer,
  MessageFromClient,
} from '../shared/constants';
import {
  parseMessageFromServer,
  parseRawMessageFromClient,
} from '../shared/parser';

export class Server {
  private _server;
  private _clientMap = new Map<string, WebSocket>();
  private readonly _onReceiveMessage: (
    msg: MessageFromClient<any>,
    clientId: string
  ) => MessageFromServer<any>;
  private readonly _checkToken: (data: any) => string;
  private readonly _pingTimeout: number;

  constructor({
    port,
    onReceiveMessage,
    checkToken,
    pingTimeout = 5000,
    setBatch,
  }: {
    port: number;
    onReceiveMessage: (
      msg: MessageFromClient<any>,
      clientId: string
    ) => MessageFromServer<any>;
    checkToken?: (data: any) => string;
    pingTimeout?: number;
    setBatch?: (clientMap: Map<string, WebSocket>) => void;
  }) {
    this._server = new WebSocket.Server({port});
    this._onReceiveMessage = onReceiveMessage;
    this._checkToken = checkToken;
    this._pingTimeout = pingTimeout;

    if (setBatch) {
      setBatch(this._clientMap);
    }
  }

  private setPing() {
    setInterval(() => {
      this._clientMap.forEach(function each(ws, clientId) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping(() => {});
      });
    }, this._pingTimeout);
  }

  public start() {
    this._server.on('connection', (ws: WebSocket) => {
      ws.isAlive = true;

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', (data: WebSocket.Data) => {
        const message: MessageFromClient<any> = parseRawMessageFromClient(data);
        const userId = this._checkToken && this._checkToken(message);
        // console.log(`Received message ${message} from user ${userId}`);
        if (!userId) {
          ws.send(
            JSON.stringify({
              type: ErrorAuth,
              message: 'It Will close connection. token not valid.',
            })
          );
          ws.terminate();
        } else {
          switch (message.type) {
            case EventCheckin:
              ws.userId = userId;
              this._clientMap.set(userId, ws);
              ws.send(
                parseMessageFromServer({
                  type: EventCheckin,
                  message: 'Ok',
                })
              );
              break;
            default:
              ws.userId = userId;
              this._clientMap.set(userId, ws);
              const msgToSend = this._onReceiveMessage(message, userId);
              ws.send(parseMessageFromServer(msgToSend));
              break;
          }
        }
      });

      ws.on('close', () => {
        console.log('closed: ', ws.userId);
        if (ws.userId) {
          this._clientMap.delete(ws.userId);
        }
      });

      //send feedback
      ws.send(
        parseMessageFromServer({
          type: EventConnection,
          message: 'Connected to WebSocket server',
        })
      );
    });

    this.setPing();
  }

  public sendMessage(ws: WebSocket, message: MessageFromServer<any>) {
    if (message) {
      ws.send(parseMessageFromServer(message));
    } else {
      // TODO: Error
      console.log('no message to send');
    }
  }
}
