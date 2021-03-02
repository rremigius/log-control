export declare enum LogLevel {
    ALL = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    FATAL = 5,
    OFF = 6
}
interface Driver {
    debug: (...args: any[]) => void;
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
    trace: (...args: any[]) => void;
}
declare type method = 'debug' | 'log' | 'info' | 'warn' | 'error' | 'trace';
export default class Log {
    static Level: {
        ALL: number;
        DEBUG: number;
        INFO: number;
        WARN: number;
        ERROR: number;
        FATAL: number;
        OFF: number;
    };
    private static _root?;
    static get root(): Log;
    static get nativeLog(): Driver;
    static set nativeLog(driver: Driver);
    static instance(name?: string): Log;
    private readonly name;
    private level?;
    private driver?;
    private parent?;
    private instances;
    constructor(name: string, driver?: Driver);
    instance(name: string): Log;
    resetInstances(): void;
    setParent(parent: Log): void;
    getParent(): Log | undefined;
    getPath(): string[];
    getFullName(): string;
    setDriver(driver: Driver): void;
    resetDriver(): void;
    getDriver(): Driver;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    private addName;
    message(method: method, level: LogLevel, args: any[]): void;
    trace(...args: any[]): void;
    debug(...args: any[]): void;
    log(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
export {};
