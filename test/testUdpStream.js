"use strict";

var chai = require('chai');
var expect = chai.expect;
var dgram = require('dgram');
var fs = require('fs');
var path = require('path');

var SimpleUdpStream = require('../index');

describe("UDP stream", function () {

  it("should receive a written message", function (done) {

    var testMessage = "Test 1\n";

    var params = {
      destination: '127.0.0.1',
      port: 9999
    };

    var stream = new SimpleUdpStream(params);

    var receiver = dgram.createSocket("udp4");
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

    var receiver = dgram.createSocket("udp4");
    receiver.on('message', function (msg) {
      expect(msg.toString()).to.equal("Test 2\n");

      receiver.close();
      done();
    });
    receiver.bind(params.port, params.destination);

    fs.createReadStream(path.resolve(__dirname, 'test.message')).pipe(stream);
  });

});
