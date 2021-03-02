"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = __importStar(require("../src"));
const chai_1 = require("chai");
const lodash_1 = require("lodash");
describe("Log", () => {
    describe(".instance", () => {
        it("creates child instance that inherits driver and level from closest parent with value set.", () => {
            const foo = src_1.default.instance('foo');
            foo.setDriver({});
            foo.setLevel(src_1.LogLevel.INFO);
            const bar = foo.instance('bar');
            chai_1.assert.equal(bar.getLevel(), foo.getLevel(), "Level inherited");
            chai_1.assert.equal(bar.getDriver(), foo.getDriver(), "Driver inherited");
        });
        it("with path as name creates child(ren) in hierarchy according to path", () => {
            var _a;
            let parent = src_1.default.instance('foo');
            let child = src_1.default.instance('foo/bar/qux');
            chai_1.assert.equal((_a = child.getParent()) === null || _a === void 0 ? void 0 : _a.getParent(), parent);
        });
        it("with path can return same instance as calling instance on an instance.", () => {
            let foobar1 = src_1.default.instance("foo/bar");
            let foobar2 = src_1.default.instance("foo").instance("bar");
            let barfoo1 = src_1.default.instance("bar").instance("foo");
            let barfoo2 = src_1.default.instance("bar/foo");
            chai_1.assert.equal(foobar1, foobar2, "instance('foo').instance('bar') and instance('foo/bar') (in that order) return the same.");
            chai_1.assert.equal(barfoo1, barfoo2, "instance('bar/foo') and instance('bar').instance('foo') (in that order) return the same.");
        });
        it("with same name but different parent does not return the same.", () => {
            src_1.default.root.resetInstances();
            let foo1 = src_1.default.instance("foo");
            let foo2 = src_1.default.instance("bar/foo");
            let foo3 = src_1.default.instance("foo/foo");
            chai_1.assert.notEqual(foo1, foo2, "Instance foo not equal to bar/foo.");
            chai_1.assert.notEqual(foo2, foo3, "Instance bar/foo not equal to foo/foo.");
            chai_1.assert.notEqual(foo3, foo1, "Instance foo/foo not equal to foo.");
        });
    });
    describe(".instance (static)", () => {
        it("creates/retrieves the Log instance with that name", () => {
            const log1 = src_1.default.instance("foo");
            const log2 = src_1.default.instance("foo");
            chai_1.assert.equal(log1, log2, "Both Logs retrieved with same name are equal!");
        });
        it("with name parameter creates an instance from the root instance", () => {
            const log = src_1.default.instance('foo');
            chai_1.assert.equal(log.getParent(), src_1.default.root);
        });
        it("without name parameter returns the root instance", () => {
            chai_1.assert.equal(src_1.default.instance(), src_1.default.root);
        });
    });
    describe(".log", () => {
        it("passes arguments to `log` method of driver", () => {
            let log = src_1.default.instance("foo");
            log.setDriver({
                log: (...args) => {
                    chai_1.assert.ok(lodash_1.includes(args, 123), "First argument found");
                    chai_1.assert.ok(lodash_1.includes(args, 'abc'), "Second argument found");
                },
            });
            log.log(123, 'abc');
        });
    });
    describe(".getPath", () => {
        it("returns the names of its ancestors as path.", () => {
            let log = src_1.default.instance('foo').instance('bar').instance('qux');
            chai_1.assert.deepEqual(log.getPath(), ['foo', 'bar', 'qux']);
        });
    });
});
