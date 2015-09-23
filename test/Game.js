'use strict';

const PORT = 5501;

let should = require('should');
let path = require('path');
let sinon = require('sinon');
let http = require('http');
let stub = sinon.stub();

let io = require('socket.io-client');

let socketURL = 'http://127.0.0.1:' + PORT;
let options = {
  transports: ['websocket'],
  'force new connection': true
};

let Client = require('../lib/Client.js');
let Server = require('../lib/Server.js');
let Room = require('../lib/Room.js');

let turny;

describe('Game', function() {
  let client1, client2, roomId;

  beforeEach(function(done) {
    let server = http.createServer().listen(PORT);
    turny = new Server(server, {inititalAction: function(game, cb) {cb();}});
    client1 = io.connect(socketURL, options);
    client2 = io.connect(socketURL, options);

    client1.emit('client:create-public-room');

    client1.once('room:created', function(rId) {
      roomId = rId;
      client2.emit('client:find-public-room');
    });

    client2.once('room:found', function(rId) {
      rId.should.equal(roomId);
    });

    let readyClientsCount = 0;
    let cb = function() {
      readyClientsCount++;
      if (readyClientsCount === 2) {
        done();
      }
    };

    client1.once('game:ready', cb);
    client2.once('game:ready', cb);
  });

  it('should start game with countdown', function(done) {

    client1.emit('client:ready');

    let readyClientsCount = 0;
    let cb = function() {

      readyClientsCount++;
      if (readyClientsCount === 2) {
        done();
      }
    };

    client1.once('game:failed', function() {
      client2 = io.connect(socketURL, options);
      client2.emit('client:find-public-room');
      client2.once('room:found', function() {
        client1.emit('client:ready');
        client2.emit('client:ready');
      });
      client2.once('game:will-start-in', cb);
    });

    client2.emit('client:not-ready');

    client1.once('game:will-start-in', cb);
  });

  afterEach(function() {
    turny.close();
  });
});
