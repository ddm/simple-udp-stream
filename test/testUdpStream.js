"use strict";

var chai = require('chai');
var expect = chai.expect;

var dgram = require('dgram');
var fs = require('fs');
var path = require('path');
var bunyan = require('bunyan');

var SimpleUdpStream = require('../index');

describe("UDP stream", function () {

  it("should receive a written message", function (done) {

    var testMessage = "Test 1\n";

    var params = {
      destination: '127.0.0.1',
      port: 9999
    };

    var stream = new SimpleUdpStream(params);

    var receiver = dgram.createSocket('udp4');
    receiver.on('message', function (msg) {
      expect(msg.toString()).to.equal(testMessage);

      receiver.close();
      done();
    });
    receiver.bind(params.port, params.destination);

    stream.write(testMessage);
  });

  it("should receive a piped message", function (done) {

    var params = {
      destination: '127.0.0.1',
      port: 9999
    };

    var stream = new SimpleUdpStream(params);

    var receiver = dgram.createSocket('udp4');
    receiver.on('message', function (msg) {
      expect(msg.toString()).to.equal("Test 2\n");

      receiver.close();
      done();
    });
    receiver.bind(params.port, params.destination);

    fs.createReadStream(path.resolve(__dirname, 'test.message')).pipe(stream);
  });

  it("should receive a bunyan log message", function (done) {

    var params = {
      destination: '127.0.0.1',
      port: 9999
    };

    var logger = bunyan.createLogger({
      name: 'my-logger',
      streams: [{
        level: 'info',
        stream: new SimpleUdpStream(params)
      }]
    });

    var receiver = dgram.createSocket('udp4');
    receiver.on('message', function (msg) {
      var log = JSON.parse(msg.toString());
      expect(log).to.have.all.keys(["value", "msg", "name", "hostname", "pid", "level", "time", "v"]);
      expect(log.value).to.equal(1);
      expect(log.msg).to.equal("Hello");

      receiver.close();
      done();
    });
    receiver.bind(params.port, params.destination);

    logger.info({ value: 1 }, "Hello");
  });

});
