import {
  ErrorAuth,
  EventCheckin,
  EventConnection,
  MessageFromServer,
  MessageFromClient,
} from '../shared/constants';
import {
  parseRawMessageFromServer,
  parseMessageFromClient,
} from '../shared/parser';

export interface AuthService {
  initialToken: string;
  getNewToken: () => Promise<string>;
}

export interface WSConnection {
  connectToServer(onOpen?: (event: Event) => void): void;
  onReceive: (cb: (data: MessageFromServer<any>) => void) => void;
  send: (data: MessageFromServer<any>) => void;
}

// Basic Connection
export class WSConnectionBasic implements WSConnection {
  private readonly _url: string;

  protected _client: WebSocket | null = null;
  protected readonly _reconnectTimeOut: number;
  protected _onMessage:
    | ((this: WebSocket, ev: MessageEvent) => any)
    | null = null;
  protected _pendingMessages: any[] = [];

  constructor(url: string, reconnectTimeout = 5000) {
    this._reconnectTimeOut = reconnectTimeout;
    this._url = url;
  }

  public connectToServer(onOpen?: (event: Event) => void): void {
    this._client = new WebSocket(this._url, null);

    this._client.onopen = (event: Event) => {
      if (onOpen) {
        onOpen(event);
      }
      this._onOpen(event);
    };
    this._client.onerror = this._onError;
    this._setOnMessage();

    this._client.onclose = () => this._onClose();
  }

  protected _sendPendingMessages() {
    // TODO: If it fails??
    if (this._pendingMessages.length > 0) {
      console.log(
        'it will redeliver all pending messages',
        this._pendingMessages.length
      );
      this._pendingMessages.forEach((msg) => this._send(msg));
      this._pendingMessages = [];
    }
  }

  protected _onOpen(event: Event) {
    this._sendPendingMessages();
  }

  protected _onClose() {
    this._client = null;
    setTimeout(() => {
      this.connectToServer();
    }, this._reconnectTimeOut);
  }

  protected _onError(event: Event) {
    // TODO: something
    console.log('error', JSON.stringify(event));
  }

  protected _setOnMessage() {
    if (this._client && this._onMessage) {
      this._client.onmessage = this._onMessage;
    }
  }

  public onReceive(cb: (data: MessageFromServer<any>) => void): void {
    this._onMessage = (event: MessageEvent) => {
      cb && cb(parseRawMessageFromServer(event.data));
    };
    this._setOnMessage();
  }

  protected _send(message: MessageFromClient<any>): void {
    if (this._client && this._client.readyState === WebSocket.OPEN) {
      this._client.send(parseMessageFromClient(message));
    } else if (this._client?.readyState === WebSocket.CONNECTING) {
      console.log('message not delivered: ', message);
      this._pendingMessages.push(message);
    } else {
      // TODO: THROW ERROR?
    }
  }

  public send(data: any): void {
    this._send(data);
  }
}

// Connection with Auth Logic
export class WSConnectionAuth extends WSConnectionBasic {
  private _authService: AuthService;
  private _token: string;

  constructor(
    url: string,
    authService: AuthService,
    reconnectTimeout?: number
  ) {
    super(url, reconnectTimeout);
    this._authService = authService;
    this._token = authService.initialToken;
  }

  protected _onOpen(event: Event) {
    this._send({
      token: this._token,
      type: EventCheckin,
    });
  }

  public onReceive(cb: (data: MessageFromServer<any>) => void): void {
    this._onMessage = async (event: MessageEvent) => {
      const body: any = parseRawMessageFromServer(event.data);
      switch (body.type) {
        case ErrorAuth:
          this._token = await this._authService.getNewToken();
          break;
        case EventCheckin:
          if (this._pendingMessages.length > 0) {
            this._pendingMessages = this._pendingMessages.map((msg) => ({
              ...msg,
              token: this._token,
            }));
            this._sendPendingMessages();
          }
          break;
        case EventConnection:
          break;
        default:
          cb && cb(body);
      }
    };
    this._setOnMessage();
  }

  public send(data: any): void {
    this._send({
      ...data,
      token: this._token,
    });
  }
}
