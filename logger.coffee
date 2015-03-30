bunyan = require "bunyan"
{parse} = require "url"

{isFinite} = Number


construct = (loggerParams, options={strict: false, shortStacks: true}) ->
    streams = [{stream: process.stdout}]
    syslogFail = false
    logstashFail = false

    if process.env.BUNYAN_SYSLOG_URL
        try
            opts = makeSyslogOptions process.env.BUNYAN_SYSLOG_URL, loggerParams
            streams.push
                level: "debug" # there are no trace level in syslog
                type:  "raw"
                stream: require('bunyan-syslog').createBunyanStream opts
        catch e
            syslogFail = e

    if process.env.BUNYAN_LOGSTASH_URL
        try
            opts = makeLogstashOptions process.env.BUNYAN_LOGSTASH_URL, loggerParams
            streams.streams.push
                type: 'raw'
                stream: require('bunyan-logstash').createStream opts
        catch e
            logstashFail = e

    logger = bunyan.createLogger
        name:    loggerParams.name
        level:   loggerParams.level or 10
        streams: streams
        serializers: err: makeErrorSerializer options

    if loggerParams.component then logger = logger.child {component: loggerParams.component}

    if syslogFail
        err = new Error "Failed to add syslog stream to bunyan: #{syslogFail.message}"
        if options.strict then throw err else logger.warn err

    if logstashFail
        err = new Error "Failed to add logstash stream to bunyan: #{syslogFail.message}"
        if options.strict then throw err else logger.warn err

    logger


makeSyslogOptions = (url, params={}) ->
    url = parse url, true
    opts =
        port: Number url.port
        host: url.hostname
        facility: if url.query.facility then Number url.query.facility[1..] else NaN
        type: url.protocol[0..-2]
    if not (opts.port > 0) then throw new Error "Invalid port number (#{url.port})"
    if not opts.host then throw new Error "Invalid host (#{url.hostname})"
    if opts.type not in ["tcp", "udp"] then throw new Error "Unsupported protocol (#{url.protocol})"
    if not isFinite opts.facility then opts.facility = 16
    opts


makeLogstashOptions = (url, params={}) ->
    url = parse url, true
    opts = 
        port: Number url.port
        host: url.hostname
        level: "debug"
    if params.application then opts.application = params.name
    tags = if url.query.tags then url.query.tags.split ','
    if tags then opts.tags = tags
    protocol = (url.protocol or "udp:")[0..-2]
    if not (opts.port > 0) then throw new Error "Invalid port number (#{url.port})"
    if not opts.host then throw new Error "Invalid host (#{url.hostname})"
    if protocol != "udp" then throw new Error "Unsupported protocol (#{url.protocol})"
    opts


makeErrorSerializer = (options) ->
    if not options.shortStacks then bunyan.stdSerializers.err
    else (err) ->
        serialized = bunyan.stdSerializers.err err
        if serialized == null then return serialized
        # remove modules and nodejs files from trace
        serialized.stack = String(serialized.stack or '')
            .split '\n'
            .filter (line) ->
                not ((line.match /node_modules/) or # like "at Foo.bar (/dirname/node_modules/foo/main.js:12:34)"
                     (line.match /at node\.js:\d+:\d+$/) or # like "at startup (node.js:119:16)"
                     (line.match /^\s+at.*\([^\/\\]+\.js:\d+:\d+\)$/)) # like "at Module.load (module.js:356:32)"
            .join '\n'
        serialized


construct.makeSyslogOptions = makeSyslogOptions
construct.makeLogstashOptions = makeLogstashOptions
construct.makeErrorSerializer = makeErrorSerializer
module.exports = construct
