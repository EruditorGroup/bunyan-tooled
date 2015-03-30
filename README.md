# bunyan-tooled
Bunyan logger tooled with logstash and syslog

## Syslog support
Syslog is supported through BUNYAN_SYSLOG_URL environment variable which takes the form:
```
$ export BUNYAN_SYSLOG_URL=tcp://localhost:123?facility=18
```
Where parameters are:
    - protocol: tcp and udp are supported;
    - host: required;
    - port: required;
    - facility: optional, 16 by default.

## Logstash support
Logstash is supported throught BUNYAN_LOGSTASH_URL environment variable which takes the form:
```
$ export BUNYAN_LOGSTASH_URL=udp://localhost:123?tags=foo,bar
```
Where parameters are:
    - protocol: required, udp only;
    - host: required;
    - port: required;
    - tags: optional, comma separated.

## Options
Supported options:
    - name: passed to bunyan.createLogger;
    - level: optional, 10 by default, passed to bunyan.createLogger;
    - component: optional, passed to bunyan.createLogger;
    - strict: optional, false by default, throw an error if env variable presented but invalid, logger.warn otherwise;
    - shortStacks: optional, true by default, remove modules and nodejs files from error traces.
