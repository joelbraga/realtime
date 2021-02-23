import {
  Server,
  MessageFromServer,
  MessageFromClient,
} from '@joelbraga/realtime';
import * as WebSocket from 'ws';

const PORT = process.env.PORT || '8080';
const server = new Server({
  port: parseInt(PORT),
  checkToken: extractUserId,
  onReceiveMessage,
  setBatch,
});
server.start();

let modelsListByUserId = new Map<string, string[]>();
let inMemoryData = new Map<string, any>();

function onReceiveMessage(
  message: MessageFromClient<any>,
  clientId: string
): MessageFromServer<any> {
  const fields = modelsListByUserId.get(clientId);
  if (!fields || !fields.includes(message.type)) {
    modelsListByUserId.set(
      clientId,
      fields?.concat(message.type) ?? [message.type]
    );
  }

  // JUST FOR DEMO
  if (!inMemoryData.get(`${clientId}-user`)) {
    inMemoryData.set(`${clientId}-user`, {
      name: 'Ironman',
      friends: ['Captain America', 'SpiderMan'],
    });
  }
  // END

  if (message.data?.method === 'update') {
    const key = `${clientId}-${message.type}`;
    const data = inMemoryData.get(key);
    const field = message.data?.field;
    if (data[field]) {
      data[field] = message.data?.value;
    }
    inMemoryData.set(key, data);
  }

  return buildModelsMessage(clientId);
}

function buildModelsMessage(clientId: string): MessageFromServer<any> {
  const res: MessageFromServer<any> = {
    type: 'models',
    data: {},
  };
  modelsListByUserId?.get(clientId)?.forEach((value) => {
    const key = `${clientId}-${value}`;
    const data = inMemoryData.get(key);
    if (data) {
      res.data[value] = data;
    }
  });
  return res;
}

function setBatch(clientMap: Map<string, WebSocket>) {
  setInterval(() => {
    clientMap.forEach(function each(ws, clientId) {
      // TODO: Check if there is any data to send
      server.sendMessage(ws, buildModelsMessage(clientId));
    });
  }, 10000);
}

// On real work it should be a jwt token or something else
// Retorn userId
function extractUserId(data: any) {
  if (data.token === 'dummy_token') {
    return 'dummy_token';
  }
  return null;
}
