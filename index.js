"use strict";

var stream = require("stream");
var util = require("util");
var dgram = require("dgram");
var _ = require("underscore");

var nodeVersion = process.version.replace("v", "").split(/\./gi).map(function (t) {
  return parseInt(t, 10);
});

/**
 * Writable stream over UDP
 * (see <a href="https://nodejs.org/api/stream.html#stream_class_stream_writable">node.js documentation</a>)
 *
 * @class SimpleUdpStream
 *
 * @param {!Object} options
 * @param {!string} options.destination - destination hostname or address for UDP packets
 * @param {!number} options.port - destination port for UDP packets
 *
 * @constructor
 */
function SimpleUdpStream(options) {
  if (!(this instanceof SimpleUdpStream)) {
    return new SimpleUdpStream(options);
  }

  this.destinationAddress = _.isString(options.destination) ? options.destination : "0.0.0.0";
  this.destinationPort = _.isNumber(options.port) ? options.port
      : _.isString(options.port) ? parseInt(options.port, 10)
      : 9999; // default logstash port for UDP

  stream.Writable.call(this);

  if (nodeVersion[0] === 0 && nodeVersion[1] < 11) {
    this.socket = dgram.createSocket("udp4");
  } else {
    this.socket = dgram.createSocket({
      type: "udp4",
      reuseAddr: true
    });
  }

  var self = this;
  function onShutdown() { self.end(); }
  process.once("SIGTERM", onShutdown);
  process.once("SIGINT", onShutdown);
  process.once("message", function (msg) { if (msg === "shutdown") { onShutdown(); } });
  process.once("uncaughtException", onShutdown);
}

util.inherits(SimpleUdpStream, stream.Writable);

/**
 * @callback SimpleUdpStream~writeCallback
 *
 * Called when the write has been performed
 *
 * @param {?Error} err - an error if one occured during write
 */

/**
 * See <a href="https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback">node.js documentation</a>
 *
 * @method write
 * @memberOf SimpleUdpStream
 * @instance
 *
 * @param {!string|!Buffer} chunk - the data to write
 * @param {?string} encoding - the encoding, if <code>chunk</code> is a string
 * @param {?SimpleUdpStream~writeCallback} callback - callback upon write
 * @returns {boolean} true
 */

/**
 * @method _write
 * @memberOf SimpleUdpStream
 * @instance
 *
 * @param {!string|!Buffer} chunk - the data to write
 * @param {?string} encoding - the encoding, if <code>chunk</code> is a string
 * @param {?SimpleUdpStream~writeCallback} callback - callback upon write
 * @returns {boolean} true
 * @private
 */
 /* eslint no-underscore-dangle:0 */
SimpleUdpStream.prototype._write = function _write(chunk, encoding, callback) {
  var message = (chunk instanceof Buffer) ? chunk
      : _.isString(chunk) ? new Buffer(chunk, encoding)
      : (chunk && _.isFunction(chunk.toString)) ? new Buffer(chunk.toString(), encoding)
      : new Buffer("" + chunk, encoding);

  this.socket.send(message, 0, message.length, this.destinationPort, this.destinationAddress, function () {
    if (_.isFunction(callback)) {
      callback();
    }
  });

  return true;
};

/**
 * See <a href="https://nodejs.org/api/stream.html#stream_writable_end_chunk_encoding_callback">node.js documentation</a>
 *
 * @method end
 * @memberOf SimpleUdpStream
 * @instance
 *
 * @param {!string|!Buffer} chunk - the data to write
 * @param {?string} encoding - the encoding, if <code>chunk</code> is a string
 * @param {?SimpleUdpStream~writeCallback} callback - callback upon write
 */
SimpleUdpStream.prototype.end = function end(chunk, encoding, callback) {
  var self = this;
  if (_.isFunction(callback)) {
    self.on("finish", callback);
  }

  function closeSocket() {
    self.socket.on("close", function () {
      self.emit("finish");
    });
    self.socket.close();
  }

  if (chunk) {
    self.write(chunk, encoding, closeSocket);
  } else {
    setImmediate(closeSocket);
  }
};

module.exports = SimpleUdpStream;
