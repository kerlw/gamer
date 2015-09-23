[![Circle CI](https://img.shields.io/circleci/project/asynxis/gamer/master.svg?style=flat-square)](https://circleci.com/gh/asynxis/gamer/tree/master)
[![Coverage Status](https://img.shields.io/coveralls/asynxis/gamer.svg?style=flat-square)](https://coveralls.io/github/asynxis/gamer?branch=master)

# GamerJS
GamerJS - tiny, but powerful and easy customizable game server based on [Socket.IO](https://github.com/socketio/socket.io/).
## Features
+ Game with 1 to N players or AI.
+ Authentication.
+ **WebSockets** or **Long-Polling** for transferring data.
+ Public and private game-rooms.
+ **Turn-base behavior**, when players do turns one-by-one, like Tic-Tak-Toe, Age of Empires, Civilization ,etc.
+ **Realtime behavior**, when each player can do independent turns. Like Dota2, LoL, etc.

## Get started

## Workflow

1. Game server is initiated.
2. Client connects to the server. If the client want to create new game - step 3, if find already created or join - step 4.
3. Create new game:
  1. Public
    1. Client send `'client:create-public-room'` to the server.
    2. Client receive `'room:created'` with id in payload.
  2. Private
    1. Client send `'client:create-private-room'` to the server.
    2. Client receive `'room:created'` with id in payload.
4. Find already created game or join:
  1. Public
    1. Client send `'client:find-public-room'` to the server.
    2. Client receive `'room:found'` with id in payload or `'room:not-found'`.
  2. Private
    1. Client send `'client:join-private-room'` to the server.
    2. Client receive `'room:joined'` with id in payload or `'room:not-found'`.
5. When players number in game are equal to needed - all the client receive `'game:ready'`.
6. Now every client need send `'client:ready'` or `'client:not-ready'` to the server.
7. If some clients are not ready - move to step 2.
7. When all the clients are ready, server execute `inititalAction` action and after send `'game:initial-state'` to all the clients with the result as payload.
8. Send every second to the clients `'game:will-start-in'` with countdown as payload. It use `countdown` parameter as base and decrease it every second.
9. When countdown value is **zero** - the server sends `'game:started'` to all the clients.
10. After game is started, clients available to send `'client:turn'` to the server. Payload of this message will be passed to `'turnAction'` method.
11. After `'turnAction'` is done, `'syncAction'` is fired. In `'syncAction'` determine what the data  will be send with `'game:update-state'` message as payload.
12. Sending to all the clients `'game:update-state'` with result of `'syncAction'` method.
13. After it - `'gameOverAction'` will be fired. If the game is over - method fires callback with data, which will be passed to `'game:over'` message later.
13. Client receive `'game:update-state'` and update current game state.
14. Steps 10-13 is repeating until `'gameOverAction'` keep not firing callback.
15. When the game is over clients receive `'game:over'` message with information to show the game results, which was build in `'gameOverAction'` before.
16. After it, players still connected and game state on the server is identically to step 5. If rematch is take the place - client need to do step 6 and replay game again.

## API

#### Create new server
``` js
let gamer = require('gamer');
let gameServer = gamer(httpServer, options);
```
`httpServer` - the following values are supported:
+ **null** or **undefined**. Gamer will create his own httpServer.
+ **Plain** Node HTTP server:
``` js
let httpServer = require('http').createServer();
```
+ **KoaJS** httpServer:
``` js
let app = require('koa')();
let httpServer = require('http').createServer(app.callback());
```
+ **Express** httpServer:
``` js
let app = require('express')();
let httpServer = require('http').createServer(app);
```

`options` - the following options are supported:
+ **playersNumber** [int] Set needed number of players play the game.
+ **countdown** [int] Number of seconds before game starts after all the players are ready.
+ **inititalAction**
``` js
// This method will be fired right after all the players are ready and before countdown started
inititalAction: function(game, callback){
    // Current game object. You can extend it with .set() method.
    game.set("logic", new Logic());
    // Get client list of current game. In this meaning client <> player.
    var clients = game.getClients();
    // For each client you can also set custom values.
    clients[0].set("tiles",Logic.generateRandomTiles());
    clients[1].set("tiles",Logic.generateRandomTiles());
    // Call it when all preparations are done
    callback();
},
```
## Installation
`npm install gamer --save`
## Examples
+ [Tic-Tak-Toe](https://github.com/asynxis/gamer-examples/tree/master/barley-break), using React for Client.
+ [Barley-Breck](https://github.com/asynxis/gamer-examples/tree/master/tic-tac-toe), using React for Client.

## License

[MIT](https://github.com/asynxis/gamer/blob/master/LICENSE)
