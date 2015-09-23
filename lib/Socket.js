'use strict';

let sio = require('socket.io'), io = new sio();

module.exports.attach = function(server) {
  return io = io.attach(server);
};

module.exports.get = function() {
  return io;
};
