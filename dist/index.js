"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const Log = function (name, driver) {
    this.name = lodash_1.isString(name) ? name.toLowerCase() : 'log';
    this._level = undefined;
    this._parent = undefined;
    this._driver = driver;
    this._instances = {};
};
Log.nativeLog = console;
Log.prototype.instance = function (name) {
    if (!lodash_1.isString(name) || lodash_1.isEmpty(name)) {
        return this;
    }
    name = name.toLowerCase();
    // If instance already exist, return it
    if (name in this._instances) {
        return this._instances[name];
    }
    // Clone path
    let path = name.split('/');
    // Get next step name
    let step = path.shift();
    // Last leaf was popped, create child
    if (path.length === 0) {
        let instance = new this.constructor(step);
        instance.setParent(this);
        this._instances[name] = instance;
        return instance;
    }
    // Not a leaf yet: recursion
    let child = this.instance(step);
    return child.instance(path.join('/'));
};
Log.prototype.setParent = function (parentLog) {
    this._parent = parentLog;
};
Log.prototype.getParent = function () {
    return this._parent;
};
Log.prototype.getPath = function () {
    if (!this._parent)
        return [];
    return this._parent.getPath().concat(this.name);
};
Log.prototype.getFullName = function () {
    return this.getPath().join('/');
};
Log.prototype.setDriver = function (driver) {
    this._driver = driver;
};
Log.prototype.resetDriver = function () {
    this._driver = undefined;
};
Log.prototype.getDriver = function () {
    if (this._driver !== undefined) {
        return this._driver;
    }
    if (this._parent !== undefined) {
        return this._parent.getDriver();
    }
    return Log.nativeLog;
};
Log.prototype.setLevel = function (level) {
    this._level = level;
};
Log.prototype.getLevel = function () {
    if (this._level !== undefined)
        return this._level;
    if (this._parent) {
        return this._parent.getLevel();
    }
    return Log.Level.ALL;
};
Log.prototype.debug = function () {
    this._log('debug', Log.Level.DEBUG, arguments);
};
Log.prototype.log = function () {
    this._log('log', Log.Level.DEBUG, arguments);
};
Log.prototype.info = function () {
    this._log('info', Log.Level.INFO, arguments);
};
Log.prototype.warn = function () {
    this._log('warn', Log.Level.WARN, arguments);
};
Log.prototype.error = function () {
    this._log('error', Log.Level.ERROR, arguments);
};
Log.prototype.trace = function () {
    this._log('trace', Log.Level.DEBUG, arguments);
};
Log.prototype._log = function (method, level, args) {
    if (level >= this.getLevel()) {
        let driver = this.getDriver();
        let func = driver[method];
        if (!lodash_1.isFunction(func)) {
            func = this.getParent().getDriver()[func];
        }
        if (!lodash_1.isFunction(func)) {
            console.error(`Logging method ${func} does not exist.`);
        }
        func.apply(driver, this._addName(args));
    }
};
Log.prototype._addName = function (args) {
    [].unshift.apply(args, ['[ ' + this.getFullName() + ' ]']);
    return args;
};
Log.root = function () {
    let Class = this;
    if (!Class._root) {
        Class._root = new Class('Log');
        Class._root.setLevel(Class.Level.ALL); // default level
    }
    return Class._root;
};
/**
 * Creates a Log instance with the given name. If an instance was already created before, it will return the existing
 * instance.
 * @param {string|Array} [name]
 * @return {Log}
 */
Log.instance = function (name) {
    return Log.root().instance(name);
};
Log.resetInstances = function () {
    Log.root()._instances = {};
};
Log.error = function () {
    this.root().error.apply(this.instance(), arguments);
};
Log.info = function () {
    this.root().info.apply(this.instance(), arguments);
};
Log.warn = function () {
    this.root().warn.apply(this.instance(), arguments);
};
Log.log = function () {
    this.root().log.apply(this.instance(), arguments);
};
Log.trace = function () {
    this.root().trace.apply(this.instance(), arguments);
};
Log.setLevel = function (level) {
    this.root().setLevel(level);
};
Log.getLevel = function () {
    return this.root().getLevel();
};
Log.getDriver = function () {
    return this.root().getDriver();
};
Log.setDriver = function (driver) {
    return this.root().setDriver(driver);
};
Log.Level = {
    ALL: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5,
    OFF: 6
};
Log._root = null;
Log._instances = {};
module.exports = Log;
