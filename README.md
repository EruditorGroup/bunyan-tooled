# bunyan-tooled
Bunyan logger tooled with logstash and syslog

## Syslog support
Syslog is supported through BUNYAN_SYSLOG_URL environment variable which takes the form:
```
$ export BUNYAN_SYSLOG_URL=tcp://localhost:123?facility=18
```
Where parameters are:
- **protocol**: required, tcp and udp are supported;
- **host**: required;
- **port**: required;
- **facility**: optional, 16 by default.

## Logstash support
Logstash is supported throught BUNYAN_LOGSTASH_URL environment variable which takes the form:
```
$ export BUNYAN_LOGSTASH_URL=udp://localhost:123?tags=foo,bar
```
Where parameters are:
- **protocol**: required, udp only;
- **host**: required;
- **port**: required;
- **tags**: optional, comma separated.

## Options
Supported options:
- **name**: passed to bunyan.createLogger();
- **level**: optional, 10 by default, passed to streams parameters and bunyan.createLogger();
- **component**: optional, passed to bunyan.createLogger();
- **strict**: optional, false by default, throw an error if env variable presented but invalid, logger.warn otherwise;
- **shortStacks**: optional, true by default, remove modules and nodejs files from error traces.

## Short stacks
By default lines from modules and nodejs files are excluded from serialized errors. See how it works:
```
> var tooled = require('./logger.js')

> var serializer = t.makeErrorSerializer()

> var serializer2 = t.makeErrorSerializer({shortStacks: false})

> console.log(serializer(new Error('caboom')).stack)
Error: caboom
    at repl:1:25
    
> console.log(serializer2(new Error('caboom')).stack)
Error: caboom
    at repl:1:26
    at REPLServer.self.eval (repl.js:110:21)
    at Interface.<anonymous> (repl.js:239:12)
    at Interface.emit (events.js:95:17)
    at Interface._onLine (readline.js:203:10)
    at Interface._line (readline.js:532:8)
    at Interface._ttyWrite (readline.js:761:14)
    at ReadStream.onkeypress (readline.js:100:10)
    at ReadStream.emit (events.js:98:17)
    at emitKey (readline.js:1096:12)
```
