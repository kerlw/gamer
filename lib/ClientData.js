"use strict"

class ClientData {

  constructor() {
    this.clientData = {}
  }
  
  get(name) {
    return this.clientData[name];
  }

  set(name, value) {
    return this.clientData[name] = value;
  }
}

module.exports = ClientData;
