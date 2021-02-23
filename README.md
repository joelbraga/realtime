# Realtime

This project aims to showcase a possible implementation of communication using WebSockets

This lib includes:
- Server
  - Authentication (you can add your custom logic)
  - Checking alive connection
  - Adding custom logic when receiving message
  - Set batch processes with the ability to send messages to clients when needed.
- App
  - Simple Connection
  - Connection with Authentication (you can add your custom logic)
  - Auto reconnect to the server
  - Cache and send pending messages

---

## Simple examples
This examples try to show the simplest version of using this lib.

Includes:
1. Auth
1. Reconnect automatically
1. Send/Receive Message

* [Server Simple](./examples/server-simple)
* [App Simple](./examples/app-simple)

## More Complex examples

Includes:
1. Auth
1. Reconnect automatically
1. Redeliver pending messages
1. Send/Receive Message

* [Server](./examples/server)
* [App](./examples/app)


### TODO
### Client
- [ ] Have react provider inside lib?
- [ ] Model class inside lib
- [ ] Improve Model functionality (use @Decorators for common functionality?)
- [ ] Store pending messages

### Server
- [ ] Implement rate limit
- [ ] Restrict payload size
- [ ] Better error handling

### Overall
- [ ] Add transaction queue (server/app)?
- [ ] Object store for offline availability?
