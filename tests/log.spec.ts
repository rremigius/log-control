import Log, {LogLevel} from "../src";
import {assert} from "chai";
import {includes} from 'lodash';

describe("Log", () => {
	describe(".instance", () => {
		it("creates child instance that inherits driver and level from closest parent with value set.", () => {
			const foo = Log.instance('foo');
			foo.setDriver(<any>{});
			foo.setLevel(LogLevel.INFO);
			const bar = foo.instance('bar');
			assert.equal(bar.getLevel(), foo.getLevel(), "Level inherited");
			assert.equal(bar.getDriver(), foo.getDriver(), "Driver inherited");
		});
		it("with path as name creates child(ren) in hierarchy according to path", () => {
			let parent = Log.instance('foo');
			let child = Log.instance('foo/bar/qux');
			assert.equal(child.getParent()?.getParent(), parent);
		});
		it("with path can return same instance as calling instance on an instance.", () => {
			let foobar1 = Log.instance("foo/bar");
			let foobar2 = Log.instance("foo").instance("bar");

			let barfoo1 = Log.instance("bar").instance("foo");
			let barfoo2 = Log.instance("bar/foo");

			assert.equal(foobar1, foobar2, "instance('foo').instance('bar') and instance('foo/bar') (in that order) return the same.");
			assert.equal(barfoo1, barfoo2, "instance('bar/foo') and instance('bar').instance('foo') (in that order) return the same.");
		});
		it("with same name but different parent does not return the same.", () => {
			Log.root.resetInstances();
			let foo1 = Log.instance("foo");
			let foo2 = Log.instance("bar/foo");
			let foo3 = Log.instance("foo/foo");

			assert.notEqual(foo1, foo2, "Instance foo not equal to bar/foo.");
			assert.notEqual(foo2, foo3, "Instance bar/foo not equal to foo/foo.");
			assert.notEqual(foo3, foo1, "Instance foo/foo not equal to foo.");
		});
	});
	describe(".instance (static)", () => {
		it("creates/retrieves the Log instance with that name", () => {
			const log1 = Log.instance("foo");
			const log2 = Log.instance("foo");

			assert.equal(log1, log2, "Both Logs retrieved with same name are equal!");
		});
		it("with name parameter creates an instance from the root instance", () => {
			const log = Log.instance('foo');
			assert.equal(log.getParent(), Log.root);
		});
		it("without name parameter returns the root instance", () => {
			assert.equal(Log.instance(), Log.root);
		});
	});
	describe(".log", () => {
		it("passes arguments to `log` method of driver", () => {
			let log = Log.instance("foo");
			log.setDriver(<any>{
				log:(...args:any[])=>{
					assert.ok(includes(args, 123), "First argument found");
					assert.ok(includes(args, 'abc'), "Second argument found");
				},
			});
			log.log(123, 'abc');
		});
	});
	describe(".getPath", () => {
		it("returns the names of its ancestors as path.", () => {
			let log = Log.instance('foo').instance('bar').instance('qux');
			assert.deepEqual(log.getPath(), ['foo', 'bar', 'qux']);
		});
	});
});
