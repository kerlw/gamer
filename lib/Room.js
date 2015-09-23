'use strict';

let _ = require('lodash');
let debug = require('debug')('turny:room');
let uuid = require('node-uuid');
let rooms = [];
let io = require('./Socket').get();
let Game = require('./Game');
let config = require('./config');

class Room {

  constructor(options) {
    this.id = uuid.v4();
    this.clients = [];
    this.playersNumber = (options.playersNumber) ? options.playersNumber : 2;
    this.access = (options.access) ? options.access : 'public';
  }

  isFull() {
    return this.playersNumber === this.clients.length;
  }

  isReady() {
    let readyClients = _.filter(this.clients, client => client.ready);
    return this.playersNumber === readyClients.length;
  }

  addClient(client) {
    this.clients.push(client);
    if (this.isFull()) {
      this.game = new Game(this);
    }
  }

  removeClient(client) {
    this.clients = _.filter(this.clients, c => c !== client);
    client.socket.leave(this.id);
    this.game = null;
    _.each(this.clients, c => c.ready = false);
    debug('#' + this.id + ' - Client #' + client.id + ' was removed');
  }

  broadcast(message, payload) {
    if (payload === undefined) payload = {};
    io.to(this.id).emit(message, payload);
  }

  static createPublic(playersNumber) {
    let room = new Room({playersNumber:playersNumber, access:'public'});
    rooms.push(room);
    return room;
  }

  static findPublic() {
    return _.find(rooms, room => !room.isFull() && room.access === 'public');
  }

  static createPrivate(playersNumber) {
    let room = new Room({playersNumber:playersNumber, access:'private'});
    rooms.push(room);
    return room;
  }

  static findPrivate(roomId) {
    return _.find(rooms, room => !room.isFull()
      && room.access === 'private' && room.id === roomId);
  }

  static remove(room) {
    rooms = _.filter(rooms, r => r !== room);
  }

  static getList() {
    return rooms;
  };
}

module.exports = Room;
