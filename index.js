"use strict";

var stream = require('stream');
var util = require('util');
var dgram = require('dgram');
var _ = require('lodash');

var nodeVersion = process.version.replace('v', '').split(/\./gi).map(function (t) {
  return parseInt(t, 10);
});

function SimpleUdpStream(options) {
  if (!(this instanceof SimpleUdpStream)) return new SimpleUdpStream(options);

  this.destinationAddress = _.isString(options.destination) ? options.destination : '0.0.0.0';
  this.destinationPort = _.isNumber(options.port) ? options.port : _.isString(options.port) ? parseInt(options.port) : 9999; // default logstash port for UDP

  stream.Writable.call(this);

  if (nodeVersion[0] === 0 && nodeVersion[1] < 11) {
    this.socket = dgram.createSocket('udp4');
  } else {
    this.socket = dgram.createSocket({
      type: 'udp4',
      reuseAddr: true
    });
  }
}

util.inherits(SimpleUdpStream, stream.Writable);

SimpleUdpStream.prototype._write = function (message, encoding, callback) {
  if (_.isString(message)) message = new Buffer(message, encoding);

  this.socket.send(message, 0, message.length, this.destinationPort, this.destinationAddress);

  if (_.isFunction(callback)) callback();
  return true;
};

module.exports = SimpleUdpStream;
