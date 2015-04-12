simple-udp-stream
=================

[![Build status](https://travis-ci.org/ddm/simple-udp-stream.svg)](https://travis-ci.org/ddm/simple-udp-stream)
[![Dependencies status](https://david-dm.org/ddm/simple-udp-stream.svg)](https://david-dm.org/ddm/simple-udp-stream)

## Basic usage

    var SimpleUdpStream = require('simple-udp-stream');

    var stream = new SimpleUdpStream({
      destination: '127.0.0.1',
      port: 9999
    });

    stream.write("Hello World!");

![Wireshark simple capture](https://i.imgur.com/89Am8Zu.png)

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

![Kibana capture](https://i.imgur.com/u2yuKv6.png)

![Wireshark bunyan capture](https://i.imgur.com/ulxG3Kz.png)

## Limitations

IPv4 only for now. Open a GitHub issue if that is an issue for you. IPv6 support should be easy to add.

Message size is limited by the smallest MTU between source and destination: https://nodejs.org/api/dgram.html#dgram_socket_send_buf_offset_length_port_address_callback

If a message is too big, it will simply be dropped...
