'use strict';

let util = require('util');

function ServerError(message) {
  // Super constructor
  Error.call(this);
  // Super helper method to include stack trace in error object
  Error.captureStackTrace(this, this.constructor);
  // Set our function’s name as error name.
  this.name = this.constructor.name;
  this.message = message || 'Server Error';
}
util.inherits(ServerError, Error);

function ValidationError(message) {
  // Super constructor
  Error.call(this);
  // Super helper method to include stack trace in error object
  Error.captureStackTrace(this, this.constructor);
  // Set our function’s name as error name.
  this.name = this.constructor.name;
  this.message = message || 'Validation Error';
}
util.inherits(ValidationError, Error);

module.exports.ServerError = ServerError;
module.exports.ValidationError = ValidationError;
