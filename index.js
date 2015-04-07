"use strict";

var stream = require('stream');
var util = require('util');
var dgram = require('dgram');
var _ = require('lodash');

var nodeVersion = process.version.replace('v', '').split(/\./gi).map(function (t) {
  return parseInt(t, 10);
});

/**
 * Writable stream over UDP
 * <br>
 * See <a href="https://nodejs.org/api/stream.html#stream_class_stream_writable">node.js documentation</a>
 *
 * @class SimpleUdpStream
 *
 * @param {!Object} options
 * @param {!string} options.destination - destination hostname or address for UDP packets
 * @params {!number} options.port - destination port for UDP packets
 *
 * @constructor
 */
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

/**
 * @method write
 * @memberOf SimpleUdpStream
 *
 * @param {!string|!Buffer} chunk - the data to write
 * @param {?string} encoding - the encoding, if <code>chunk</code> is a string
 * @param {?Function} callback - callback upon write
 * @returns {boolean} true
 */

/**
 * @method _write
 * @memberOf SimpleUdpStream
 *
 * @param {!string|!Buffer} chunk - the data to write
 * @param {?string} encoding - the encoding, if <code>chunk</code> is a string
 * @param {?Function} callback - callback upon write
 * @returns {boolean} true
 * @private
 */
SimpleUdpStream.prototype._write = function (chunk, encoding, callback) {
  if (_.isString(chunk)) chunk = new Buffer(chunk, encoding);

  this.socket.send(chunk, 0, chunk.length, this.destinationPort, this.destinationAddress);

  if (_.isFunction(callback)) callback();
  return true;
};

module.exports = SimpleUdpStream;
