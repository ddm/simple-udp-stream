"use strict";

var chai = require("chai");
var expect = chai.expect;

var dgram = require("dgram");
var fs = require("fs");
var path = require("path");
var bunyan = require("bunyan");

var SimpleUdpStream = require("../index");

var params = {
  destination: "127.0.0.1",
  port: 9999
};

describe("UDP stream", function () {

  it("should send a message", function (done) {

    var testMessage = "Test 1\n";

    var stream = new SimpleUdpStream(params);

    var receiver = dgram.createSocket("udp4");
    receiver.on("message", function (msg) {
      expect(msg.toString()).to.equal(testMessage);

      receiver.close();
      done();
    });
    receiver.bind(params.port, params.destination);

    stream.write(testMessage);
  });

  it("should pipe a message", function (done) {

    var stream = new SimpleUdpStream(params);

    var receiver = dgram.createSocket("udp4");
    receiver.on("message", function (msg) {
      expect(msg.toString()).to.equal("Test 2\n");

      receiver.close();
      done();
    });
    receiver.bind(params.port, params.destination);

    fs.createReadStream(path.resolve(__dirname, "test.message")).pipe(stream);
  });

  it("should log a bunyan message", function (done) {

    var logger = bunyan.createLogger({
      name: "my-logger",
      streams: [{
        level: "info",
        stream: new SimpleUdpStream(params)
      }]
    });

    var receiver = dgram.createSocket("udp4");
    receiver.on("message", function (msg) {
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

  it("should send several messages", function (done) {

    var NUMBER_OF_MESSAGES = 100;

    var stream = new SimpleUdpStream(params);

    var receiver = dgram.createSocket("udp4");
    var counter = 0;
    receiver.on("message", function (msg) {
      expect(msg.toString()).to.equal("" + counter++);

      if (counter === NUMBER_OF_MESSAGES) {
        receiver.close();
        done();
      }
    });
    receiver.bind(params.port, params.destination);

    for (var i = 0; i < NUMBER_OF_MESSAGES; i++) {
      stream.write("" + i);
    }
  });

  it("should end gracefully", function (done) {

    var testMessage = "Last message";

    var stream = new SimpleUdpStream(params);

    var receiver = dgram.createSocket("udp4");
    receiver.on("message", function (msg) {
      expect(msg.toString()).to.equal(testMessage);
    });
    receiver.bind(params.port, params.destination);

    stream.end(testMessage, "utf8", function () {
      receiver.close();
      done();
    });
  });

  it("should emit 'finish' on end", function (done) {
    var testMessage = "Last message";

    var stream = new SimpleUdpStream(params);

    var receiver = dgram.createSocket("udp4");
    receiver.on("message", function (msg) {
      expect(msg.toString()).to.equal(testMessage);
    });
    receiver.bind(params.port, params.destination);

    stream.on("finish", function () {
      receiver.close();
      done();
    });

    stream.end(testMessage, "utf8");
  });

});
