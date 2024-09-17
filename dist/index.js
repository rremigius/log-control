import { isString, isEmpty, isFunction, concat } from 'lodash-es';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ALL"] = 0] = "ALL";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 5] = "FATAL";
    LogLevel[LogLevel["OFF"] = 6] = "OFF";
})(LogLevel || (LogLevel = {}));
let nativeLog = console;
export default class Log {
    static _root;
    static get root() {
        let Class = this;
        if (!Class._root) {
            Class._root = new Class('Log');
            Class._root.setLevel(LogLevel.ALL); // default level
        }
        return Class._root;
    }
    static get nativeLog() {
        return nativeLog;
    }
    static set nativeLog(driver) {
        nativeLog = driver;
    }
    static instance(name) {
        if (!name)
            return this.root;
        return this.root.instance(name);
    }
    name = 'log';
    level = undefined;
    driver = undefined;
    parent;
    instances = {};
    constructor(name, driver) {
        this.name = name;
        this.driver = driver;
    }
    instance(name) {
        if (!isString(name) || isEmpty(name)) {
            return this;
        }
        name = name.toLowerCase();
        // If instance already exist, return it
        if (name in this.instances) {
            return this.instances[name];
        }
        // Clone path
        let path = name.split('/');
        // Get next step name
        // TS: has to be string because of isEmpty check
        let step = path.shift();
        // Last leaf was popped, create child
        if (path.length === 0) {
            let instance = new Log(step);
            instance.setParent(this);
            this.instances[name] = instance;
            return instance;
        }
        // Not a leaf yet: recursion
        let child = this.instance(step);
        return child.instance(path.join('/'));
    }
    resetInstances() {
        this.instances = {};
    }
    setParent(parent) {
        this.parent = parent;
    }
    getParent() {
        return this.parent;
    }
    getPath() {
        if (!this.parent)
            return [];
        return this.parent.getPath().concat(this.name);
    }
    getFullName() {
        return this.getPath().join('/');
    }
    setDriver(driver) {
        this.driver = driver;
    }
    resetDriver() {
        this.driver = undefined;
    }
    getDriver() {
        if (this.driver)
            return this.driver;
        if (this.parent)
            return this.parent.getDriver();
        return nativeLog;
    }
    setLevel(level) {
        this.level = level;
    }
    getLevel() {
        if (!this.level) {
            if (!this.parent)
                return LogLevel.ALL;
            return this.parent.getLevel();
        }
        return this.level;
    }
    addName(args) {
        return concat('[ ' + this.getFullName() + ' ]', args);
    }
    message(method, level, args) {
        if (level < this.getLevel())
            return;
        let driver = this.getDriver();
        let func = driver[method];
        if (!isFunction(func)) {
            nativeLog.error(`Logging method '${method}' does not exist.`);
            return;
        }
        func.apply(driver, this.addName(args));
    }
    trace(...args) {
        return this.message('trace', LogLevel.DEBUG, args);
    }
    debug(...args) {
        return this.message('debug', LogLevel.DEBUG, args);
    }
    log(...args) {
        return this.message('log', LogLevel.DEBUG, args);
    }
    info(...args) {
        return this.message('info', LogLevel.INFO, args);
    }
    warn(...args) {
        return this.message('warn', LogLevel.WARN, args);
    }
    error(...args) {
        return this.message('error', LogLevel.ERROR, args);
    }
}
