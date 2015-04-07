simple-udp-stream
=================

## Usage

    var SimpleUdpStream = require('simple-udp-stream');

    var stream = new SimpleUdpStream({
      destination: '127.0.0.1',
      port: 9999
    });

    stream.write("Hello World!");

## Bunyan

    var bunyan = require('bunyan');

    var logger = bunyan.createLogger({
      name: 'my-logger',
      streams: [{
        level: 'info',
        stream: require('simple-udp-stream')({
          destination: '127.0.0.1',
          port: 9999
        })
      }]
    });

    logger.info({ value: 1 }, "Hello World!");