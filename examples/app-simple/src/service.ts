import {AuthService, WSConnectionAuth} from '@joelbraga/realtime';

const URL = `ws://localhost:8080`;
export function NewService(onMessage: (message: any) => void) {
  const client = new WSConnectionAuth(URL, NewSimpleAuthService());
  client.onReceive((message) => {
    onMessage(message.data);
  });
  client.connectToServer(() => {
    // Send after connect
    client.send({
      type: 'state',
    });
  });
}

// For demo purposes. It should implement something like JWT
export function NewSimpleAuthService(): AuthService {
  return {
    initialToken: 'dummy_token',
    getNewToken: () => {
      return new Promise((resolve) => {
        resolve('dummy_token');
      });
    },
  };
}
