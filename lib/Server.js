'use strict';

let events          = require('events');
let debug           = require('debug')('gamer:server');
let _               = require('lodash');

let Client          = require('./Client');
let Socket          = require('./Socket');
let errors          = require('./errors');
let config          = require('./config');

class Server extends events.EventEmitter {

  constructor(server, options) {
    super();

    // Validate parameters
    if (!options.playersNumber) {
      options.playersNumber = 2;
    }

    if (!options.countdown) {
      options.countdown = 3;
    }

    if (!_.isFunction(options.inititalAction)) {
      new errors.ValidationError('\'beforeStartAction method\' is required');
    }
    if (!_.isFunction(options.turnAction)) {
      new errors.ValidationError('\'turnAction method\' is required');
    }
    if (!_.isFunction(options.syncAction)) {
      new errors.ValidationError('\'syncAction method\' is required');
    }
    if (!_.isFunction(options.overAction)) {
      new errors.ValidationError('\'overAction method\' is required');
    }

    // Initiate parameters
    config.playersNumber = options.playersNumber;
    config.countdown = options.countdown;
    config.inititalAction = options.inititalAction;
    config.turnAction = options.turnAction;
    config.syncAction = options.syncAction;
    config.overAction = options.overAction;

    // Initiate Socket.IO
    let io = Socket.attach(server);
    io.sockets.on('connection', Client.register);
    debug('Initiated');
  }

  close() {
    Socket.get().close();
  }
}

module.exports = Server;
