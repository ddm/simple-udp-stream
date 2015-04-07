simple-udp-stream
=================

## Basic usage

    var SimpleUdpStream = require('simple-udp-stream');

    var stream = new SimpleUdpStream({
      destination: '127.0.0.1',
      port: 9999
    });

    stream.write("Hello World!");

## Bunyan and logstash

Configure [logstash](http://logstash.net/) to listen to UDP logs:

    input {
      udp {
         port => 9999
         codec => json
      }
    }
    output {
      elasticsearch {
        host => localhost
        protocol => http
      }
    }

Configure [bunyan](https://github.com/trentm/node-bunyan) to log over UDP:

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
