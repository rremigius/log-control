LogControl
===

LogControl is a logging utility focused at fine-grained control of logging levels of hierarchical components.

## Features

- Each module/component/file can have its own logger, messages prefixed with a specific name.
- Hierarchically organised, so log levels can be set for an entire tree of loggers.
- Configurable driver, for interoperability with other log utilities.

## Getting Started

### Getting a Log instance

```javascript
let log = Log.instance("mycomponent");
log.info("Logging works!");
```

### Log levels for different instances

```javascript
let log1 = Log.instance("component1");
let log2 = Log.instance("component2");

log1.setLevel(Log.Level.OFF);
log1.info("This will not be logged.");

log2.info("This will be logged.");
```

### Hierarchical loggers

```javascript
let carLog = Log.instance("car");
let interiorLog = Log.instance("car/interior");
let seatingLog = Log.instance("car/interior/seating");
let engineLog = Log.instance("car/engine");

interiorLog.setLevel(Log.Level.OFF);

carLog.info("This will be logged.");
interiorLog.info("This will *not* be logged.");
seatingLog.info("This will *not* be logged.");
engineLog.info("This will be logged.");
```

A hierarchy can also be created from instances themselves:

```javascript
let carLog = Log.instance("car");
let engineLog = carLog.instance("engine");
console.log(engineLog === Log.instance("car/engine")); // true
```

### Setting a driver

If an existing logging util is already being used, the Log Control utility can be applied on top of it, by setting
the Log driver:

```javascript
let myDriver = {
    trace:(...args) => { /*...*/ },
    debug:(...args) => { /*...*/ },
    log:(...args) => { /*...*/ },
    info:(...args) => { /*...*/ },
    warn:(...args) => { /*...*/ },
    error:(...args) => { /*...*/ }
}
Log.instance().setDriver(myDriver);
Log.instance().info("This will be logged by myDriver");
```

Similar to the log level, the driver is applied hierarchically:

```javascript
let carLog = Log.instance("car");
let engineLog = Log.instance("car/engine");
let exhaustLog = Log.instance("car/engine/exhaust");
let dashLog = Log.instance("car/dashboard");

engineLog.setDriver(myDriver);

engineLog.info("Logged by myDriver");
exhaustLog.info("Logged by myDriver");
carLog.info("Still logged by console");
dashLog.info("Still logged by console");

```
