'use strict';
let Server = require('./lib/Server.js');
module.exports = function(app, options) {
  return new Server(app, options);
};
