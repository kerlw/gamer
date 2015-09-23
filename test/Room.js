'use strict';

const PORT = 5500;

let should = require('should');
let path = require('path');
let sinon = require('sinon');
let http = require('http');
let stub = sinon.stub();

let io = require('socket.io-client');



let socketURL = 'http://0.0.0.0:' + PORT;
let options = {
  transports: ['websocket'],
  'force new connection': true
};

let Client = require('../lib/Client.js');
let Server = require('../lib/Server.js');
let Room = require('../lib/Room.js');



describe('Room', function() {
  //let client1, client2;
  let gamer;
  beforeEach(function() {
    let server = http.createServer().listen(PORT);
    gamer = new Server(server, {});
  });

  it('should create public room', function(done) {
    let client1 = io.connect(socketURL, options);
    client1.once('connect', function() {
      client1.emit('client:create-public-room');
    });

    client1.once('room:created', function(rId) {
      let roomId = rId;
      roomId.should.not.be.empty;
      done();
    });
  });

  it('should create private room', function(done) {
    let client1 = io.connect(socketURL, options);
    client1.once('connect', function() {
      client1.emit('client:create-private-room');
    });

    client1.once('room:created', function(rId) {
      let roomId = rId;
      roomId.should.not.be.empty;
      client1.disconnect();
      done();
    });
  });

  it('should find public room', function(done) {
    let roomId;
    let client1 = io.connect(socketURL, options);
    let client2 = io.connect(socketURL, options);

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
        client1.disconnect();
        client2.disconnect();
        done();
      }
    };

    client1.once('game:ready', cb);
    client2.once('game:ready', cb);
  });

  it('should join private room', function(done) {
    let roomId;
    let client1 = io.connect(socketURL, options);
    let client2 = io.connect(socketURL, options);

    client1.emit('client:create-private-room');

    client1.once('room:created', function(rId) {
      roomId = rId;
      client2.emit('client:join-private-room', roomId);
    });

    client2.once('room:joined', function(rId) {
      rId.should.equal(roomId);
    });

    let readyClientsCount = 0;
    let cb = function() {
      readyClientsCount++;
      if (readyClientsCount === 2) {
        client1.disconnect();
        client2.disconnect();
        done();
      }
    };

    client1.once('game:ready', cb);
    client2.once('game:ready', cb);
  });

  it('should not find room', function(done) {
    let client1 = io.connect(socketURL, options);
    client1.once('connect', function() {
      client1.emit('client:find-public-room');
    });

    client1.once('room:not-found', function() {
      client1.disconnect();
      done();
    });
  });

  it('should not join room', function(done) {
    let client1 = io.connect(socketURL, options);
    client1.once('connect', function() {
      client1.emit('client:join-private-room', 'dsadsf');
    });

    client1.once('room:not-found', function() {
      client1.disconnect();
      done();
    });
  });

  afterEach(function() {
    gamer.close();
  });
});
