"use strict";

var chai = require('chai');
var expect = chai.expect;

var dgram = require('dgram');
var fs = require('fs');
var path = require('path');
var bunyan = require('bunyan');

var SimpleUdpStream = require('../index');

describe("UDP stream", function () {

  it("should send a message", function (done) {

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

  it("should pipe a message", function (done) {

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

  it("should log a bunyan message", function (done) {

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

    logger.info({
      value: 1
    }, "Hello");
  });

  it("should send 1000 messages", function (done) {

    var params = {
      destination: '127.0.0.1',
      port: 9999
    };

    var stream = new SimpleUdpStream(params);

    var receiver = dgram.createSocket('udp4');
    var counter = 0;
    receiver.on('message', function (msg) {
      expect(msg.toString()).to.equal("" + counter++);

      if (counter == 999) {
        receiver.close();
        done();
      }
    });
    receiver.bind(params.port, params.destination);

    for (var i = 0; i < 1000; i++) {
      stream.write("" + i);
    }
  });

});
