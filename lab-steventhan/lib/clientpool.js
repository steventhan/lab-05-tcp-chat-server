'use strict';

const EE = require('events');

var ClientPool = function() {
  this.ee = new EE();
  this.pool = {};
};


module.exports = ClientPool;
