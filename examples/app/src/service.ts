import {
  AuthService,
  WSConnectionAuth,
  MessageFromServer,
  MessageFromClient,
} from '@joelbraga/realtime';
import {WSConnection} from '../../../lib';

const URL = `ws://localhost:8080`;

export function NewService(onMessage: (message: any) => void) {
  const user = new User();
  const client = new ClientConnection(
    URL,
    (message) => {
      console.log('Message received on the app: ', message);
      const data = {
        user: user.struct(),
      };
      onMessage(data);
    },
    [user]
  );
  client.connect();
  // Demo: It will queue user.get() because connection will fail due to token
  user.get();

  setTimeout(() => {
    console.log('It will update name');
    user.saveName('Tony Stark');
  }, 10000);
}

// For demo purposes. It should implement something like JWT
export function NewSimpleAuthService(): AuthService {
  return {
    // We are forcing the first call to fail
    initialToken: '',
    getNewToken: () => {
      return new Promise((resolve) => {
        resolve('dummy_token');
      });
    },
  };
}

interface Model {
  setClient(client: WSConnection): void;

  readProperties(message: MessageFromServer<any>): void;
}

class ClientConnection {
  private readonly _connection: WSConnection;

  constructor(
    url: string,
    onMessage: (message: MessageFromServer<any>) => void,
    objectList: Model[]
  ) {
    this._connection = new WSConnectionAuth(url, NewSimpleAuthService());
    objectList.forEach((value) => value.setClient(this._connection));
    this._connection.onReceive((data) => {
      objectList.forEach((value) => value.readProperties(data));
      onMessage(data);
    });
  }

  connect(onConnect?: (event: any) => void) {
    this._connection.connectToServer(onConnect);
  }

  send(message: MessageFromClient<any>) {
    this._connection.send(message);
  }
}

class User implements Model {
  private _client: WSConnection | null = null;
  private _myType = 'user';
  public name: string = '';
  public friends: string[] = [];

  setClient(client: WSConnection) {
    this._client = client;
  }

  readProperties(message: MessageFromServer<any>) {
    // Direct Message
    if (message.type === this._myType) {
      this.name = message.data['name'];
      this.friends = message.data['friends'];
      // Models Message
    } else if (message.type === 'models') {
      this.name = message.data[this._myType]?.name;
      this.friends = message.data[this._myType]?.friends;
    }
  }

  get() {
    this._client?.send({
      type: this._myType,
      data: {
        method: 'get',
      },
    });
  }

  saveName(name: string) {
    this._client?.send({
      type: this._myType,
      data: {
        method: 'update',
        field: 'name',
        value: name,
      },
    });
  }

  struct(): any {
    return {
      name: this.name,
      friends: this.friends,
    };
  }
}
