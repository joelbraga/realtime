import {
  Server,
  MessageFromServer,
  MessageFromClient,
} from '@joelbraga/realtime';

const server = new Server({
  port: 8080,
  checkToken: extractUserId,
  onReceiveMessage,
});
server.start();

function onReceiveMessage(
  message: MessageFromClient<any>
): MessageFromServer<any> {
  switch (message.type) {
    case 'state':
      return {
        type: 'state',
        data: {
          me: 'Jon Doe',
          friends: ['Ironman', 'SpiderMan'],
        },
      };
  }
}

// On real work it should be a jwt token or something else
// Return userId
function extractUserId(data: any) {
  if (data.token === 'dummy_token') {
    return 'dummy_token';
  }
  return null;
}
