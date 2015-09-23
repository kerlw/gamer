'use strict';

let _     = require('lodash');
let uuid = require('node-uuid');
let debug = require('debug')('gamer:game');
let ClientData = require('./ClientData');
let config = require('./config');
let events = require('./events');

class Game extends ClientData {

  constructor(room) {
    super();
    let self = this;

    this.id = uuid.v4();
    this.room = room;

    this.room.broadcast(events.GAME_READY);

    _.each(self.room.clients, client => {
      client.socket.once(events.CLIENT_READY, () => {
        debug('#' + this.id + ' - Client #' + client.id + ' ready!');
        client.ready = true;
        if (self.room.isReady()) {
          self.start();
        }
      });

      client.socket.once('client:not-ready', () => {
        debug('#' + this.id + ' - Client #' + client.id + ' NOT ready!');
        this.room.removeClient(client);
        this.room.broadcast(events.GAME_FAILED);
      });

    });

    debug('#' + this.id + ' created');
  }

  start() {
    let self = this;

    config.inititalAction(self, function() {
      self.room.broadcast('game:will-start-in');
      debug('#' + self.id + ' started');
    });

    // _.each(self.room.clients, client => {
    //   self.sync(client, self.over);
    //
    //   client.socket.on('client:turn', msg => {
    //     debug('Client #' + client.name + ' made a turn');
    //     self.server.turn(self, client, msg, () => {
    //       self.sync(client, self.over);
    //     });
    //   });
    // });
  }

  over(client) {

    let self = this;
    self.server.over(this, client, function(status, payload){
      if (status) {
        self.server.io.to(self.room.id).emit('game:over',payload);
        _.each(self.room.clients, function(client) {
          client.ready = false;
          client.socket.removeAllListeners('client:turn');
          debug('#' + self.id + ' is over');
        });
      }

    })

  }

  getClients() {
    return this.room.clients;
  }

  getOpponents(c) {
    return _.tilter(this.room.clients, function(client){
      return client !== c;
    });
  }

  getOpponent(client) {
    return _.find(this.room.clients, function(c){
      return c !== client;
    })
  };

  sync(client, callback) {
    this.server.sync(this, client, function(data){
      this.server.io.to(this.room.id).emit('state:update',data);
      callback.call(this, client);
    }.bind(this))
  }
}

module.exports = Game;
