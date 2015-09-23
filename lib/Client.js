'use strict';
let uuid = require('node-uuid');
let _ = require('lodash');

let debug = require('debug')('turny:client');
let ClientData = require('./ClientData');
let Room = require('./Room');
let io = require('./Socket').get();
let events = require('./events');
let errors = require('./errors');
let config = require('./config');

class Client extends ClientData {

  constructor(socket) {
    super();
    this.id = uuid.v4();
    this.socket = socket;

    this.socket.on(events.CLIENT_CREATE_PUBLIC_ROOM,
      this.createPublicRoom.bind(this));
    this.socket.on(events.CLIENT_FIND_PUBLIC_ROOM,
      this.findPublicRoom.bind(this));
    this.socket.on(events.CLIENT_CREATE_PRIVATE_ROOM,
      this.createPrivateRoom.bind(this));
    this.socket.on(events.CLIENT_JOIN_PRIVATE_ROOM,
      this.joinPrivateRoom.bind(this));

    this.socket.on('disconnect', this.disconnected.bind(this));

    debug(this.id + ' connected');
  }

  disconnected() {
    if (this.room) {
      if (this.room.clients.length === 1) {
        Room.remove(this.room);
      } else {
        this.room.removeClient(this);
      }
    }
  }

  createPublicRoom() {
    let room = Room.createPublic(config.playersNumber);
    this.joinRoom(room);
    this.socket.emit(events.ROOM_CREATED, room.id);
  }

  findPublicRoom() {
    let room = Room.findPublic();
    if (room) {
      this.joinRoom(room);
      this.socket.emit(events.ROOM_FOUND, room.id);
    } else {
      this.socket.emit(events.ROOM_NOT_FOUND);
    }
  }

  createPrivateRoom() {
    let room = Room.createPrivate(config.playersNumber);
    this.joinRoom(room);
    this.socket.emit(events.ROOM_CREATED, room.id);
  }

  joinPrivateRoom(id) {
    let room = Room.findPrivate(id);
    if (room) {
      this.joinRoom(room);
      this.socket.emit(events.ROOM_JOINED, room.id);
    } else {
      this.socket.emit(events.ROOM_NOT_FOUND);
    }
  }

  joinRoom(room) {
    this.socket.join(room.id);
    // console.log(config.io.sockets.adapter.rooms);
    // console.log(this.socket.adapter.rooms);
    this.room = room;
    debug('#' + this.id + ' joined to room #' + room.id);
    room.addClient(this);
  }

  get name() {
    try {
      return this.socket.decoded_token.name;
    } catch (e) {
      return '';
    }
  }

  static register(socket) {
    return new Client(socket);
  }
}

module.exports = Client;
