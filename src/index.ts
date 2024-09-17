import { isString, isEmpty, isFunction, concat } from 'lodash-es';

export enum LogLevel {
	ALL,
	DEBUG,
	INFO,
	WARN,
	ERROR,
	FATAL,
	OFF
}

interface Driver {
	debug:(...args:any[])=>void;
	log:(...args:any[])=>void;
	info:(...args:any[])=>void;
	warn:(...args:any[])=>void;
	error:(...args:any[])=>void;
	trace:(...args:any[])=>void;
}
type method = 'debug'|'log'|'info'|'warn'|'error'|'trace';

let nativeLog:Driver = console;

export default class Log {
	private static _root?:Log;
	static get root() {
		let Class = this;
		if(!Class._root) {
			Class._root = new Class('Log');
			Class._root.setLevel(LogLevel.ALL); // default level
		}
		return Class._root;
	}
	static get nativeLog() {
		return nativeLog;
	}
	static set nativeLog(driver:Driver) {
		nativeLog = driver;
	}
	static instance(name?:string) {
		if(!name) return this.root;
		return this.root.instance(name);
	}

	private readonly name:string = 'log'
	private level?:LogLevel = undefined;
	private driver?:Driver = undefined;
	private parent?:Log;
	private instances:Record<string,Log> = {};

	constructor(name:string, driver?:Driver) {
		this.name = name;
		this.driver = driver;
	}

	instance(name:string):Log {
		if(!isString(name) || isEmpty(name)) {
			return this;
		}

		name = name.toLowerCase();

		// If instance already exist, return it
		if(name in this.instances) {
			return this.instances[name];
		}

		// Clone path
		let path = name.split('/');

		// Get next step name
		// TS: has to be string because of isEmpty check
		let step = <string>path.shift();

		// Last leaf was popped, create child
		if(path.length === 0) {
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

	setParent(parent:Log) {
		this.parent = parent;
	}

	getParent() {
		return this.parent;
	}

	getPath():string[] {
		if(!this.parent) return [];
		return this.parent.getPath().concat(this.name);
	}

	getFullName() {
		return this.getPath().join('/');
	}

	setDriver(driver:Driver) {
		this.driver = driver;
	}

	resetDriver() {
		this.driver = undefined;
	}

	getDriver():Driver {
		if(this.driver) return this.driver;
		if(this.parent) return this.parent.getDriver();
		return nativeLog;
	}

	setLevel(level:LogLevel) {
		this.level = level;
	}

	getLevel():LogLevel {
		if(!this.level) {
			if(!this.parent) return LogLevel.ALL;
			return this.parent.getLevel();
		}
		return this.level;
	}

	private addName(args:any[]) {
		return concat('[ ' + this.getFullName() + ' ]', args);
	}

	message(method:method, level:LogLevel, args:any[]) {
		if(level < this.getLevel()) return;

		let driver = this.getDriver();
		let func = driver[method];
		if(!isFunction(func)) {
			nativeLog.error(`Logging method '${method}' does not exist.`);
			return;
		}
		func.apply(driver, this.addName(args));
	}

	trace(...args:any[]) {
		return this.message('trace', LogLevel.DEBUG, args);
	}
	debug(...args:any[]) {
		return this.message('debug', LogLevel.DEBUG, args);
	}
	log(...args:any[]) {
		return this.message('log', LogLevel.DEBUG, args);
	}
	info(...args:any[]) {
		return this.message('info', LogLevel.INFO, args);
	}
	warn(...args:any[]) {
		return this.message('warn', LogLevel.WARN, args);
	}
	error(...args:any[]) {
		return this.message('error', LogLevel.ERROR, args);
	}
}
