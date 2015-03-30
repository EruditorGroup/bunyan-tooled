// Generated by CoffeeScript 1.8.0
(function() {
  var bunyan, construct, isFinite, levelMapping, makeErrorSerializer, makeLogstashOptions, makeSyslogOptions, parse;

  bunyan = require("bunyan");

  parse = require("url").parse;

  isFinite = Number.isFinite;

  levelMapping = {
    10: "trace",
    20: "debug",
    30: "info",
    40: "warn",
    50: "error",
    60: "fatal"
  };

  construct = function(options) {
    var e, err, logger, logstashFail, opts, streams, syslogFail;
    streams = [
      {
        stream: process.stdout
      }
    ];
    syslogFail = false;
    logstashFail = false;
    if (process.env.BUNYAN_SYSLOG_URL) {
      try {
        opts = makeSyslogOptions(process.env.BUNYAN_SYSLOG_URL, options);
        streams.push({
          level: levelMapping[options.level] || "trace",
          type: "raw",
          stream: require('bunyan-syslog').createBunyanStream(opts)
        });
      } catch (_error) {
        e = _error;
        syslogFail = e;
      }
    }
    if (process.env.BUNYAN_LOGSTASH_URL) {
      try {
        opts = makeLogstashOptions(process.env.BUNYAN_LOGSTASH_URL, options);
        streams.streams.push({
          type: 'raw',
          stream: require('bunyan-logstash').createStream(opts)
        });
      } catch (_error) {
        e = _error;
        logstashFail = e;
      }
    }
    logger = bunyan.createLogger({
      name: options.name,
      level: options.level || 10,
      streams: streams,
      serializers: {
        err: makeErrorSerializer(options)
      }
    });
    if (options.component) {
      logger = logger.child({
        component: options.component
      });
    }
    if (syslogFail) {
      err = new Error("Failed to add syslog stream to bunyan: " + syslogFail.message);
      if (options.strict) {
        throw err;
      } else {
        logger.warn(err);
      }
    }
    if (logstashFail) {
      err = new Error("Failed to add logstash stream to bunyan: " + syslogFail.message);
      if (options.strict) {
        throw err;
      } else {
        logger.warn(err);
      }
    }
    return logger;
  };

  makeSyslogOptions = function(url, params) {
    var opts, _ref;
    if (params == null) {
      params = {};
    }
    url = parse(url, true);
    opts = {
      port: Number(url.port),
      host: url.hostname,
      facility: url.query.facility ? Number(url.query.facility.slice(1)) : NaN,
      type: (url.protocol || '').slice(0, -1)
    };
    if (!(opts.port > 0)) {
      throw new Error("Invalid port number (" + url.port + ")");
    }
    if (!opts.host) {
      throw new Error("Invalid host (" + url.hostname + ")");
    }
    if ((_ref = opts.type) !== "tcp" && _ref !== "udp") {
      throw new Error("Unsupported protocol (" + url.protocol + ")");
    }
    if (!isFinite(opts.facility)) {
      opts.facility = 16;
    }
    return opts;
  };

  makeLogstashOptions = function(url, params) {
    var opts, protocol, tags;
    if (params == null) {
      params = {};
    }
    url = parse(url, true);
    opts = {
      port: Number(url.port),
      host: url.hostname,
      level: levelMapping[params.level] || "trace"
    };
    if (params.name) {
      opts.application = params.name;
    }
    tags = url.query.tags ? url.query.tags.split(',') : void 0;
    if (tags) {
      opts.tags = tags;
    }
    protocol = (url.protocol || '').slice(0, -1);
    if (!(opts.port > 0)) {
      throw new Error("Invalid port number (" + url.port + ")");
    }
    if (!opts.host) {
      throw new Error("Invalid host (" + url.hostname + ")");
    }
    if (protocol !== "udp") {
      throw new Error("Unsupported protocol (" + url.protocol + ")");
    }
    return opts;
  };

  makeErrorSerializer = function(options) {
    if (options == null) {
      options = {};
    }
    if (options.shortStacks === false) {
      return bunyan.stdSerializers.err;
    } else {
      return function(err) {
        var serialized;
        serialized = bunyan.stdSerializers.err(err);
        if (serialized === null) {
          return serialized;
        }
        serialized.stack = String(serialized.stack || '').split('\n').filter(function(line) {
          return !((line.match(/node_modules/)) || (line.match(/at node\.js:\d+:\d+$/)) || (line.match(/^\s+at.*\([^\/\\]+\.js:\d+:\d+\)$/)));
        }).join('\n');
        return serialized;
      };
    }
  };

  construct.makeSyslogOptions = makeSyslogOptions;

  construct.makeLogstashOptions = makeLogstashOptions;

  construct.makeErrorSerializer = makeErrorSerializer;

  module.exports = construct;

}).call(this);
