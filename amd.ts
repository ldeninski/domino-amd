// @ifndef BUILD
/// <reference path="typings/com.ibm.domino.d.ts" />
/// <reference path="typings/apache-commons-codec.d.ts" />
/// <reference path="typings/apache-commons-io.d.ts" />
/// <reference path="typings/java.d.ts" />
// @endif
// This file is intended to be executed as server side javascript library

declare var module: any;

(function (global: any) {
	const enum M_STATE {
		ERROR = -1,
		UNDEFINED,
		DEFINED,
		LOADING,
		DONE
	}
	interface IModule {
		requireUrl: string,
		bundleid: string,
		id: string,
		url: string,
		library: string,
		deps: string[],
		factory: Function,
		instance: any,
		state: M_STATE
	}

	interface _IDebug {
		enter(procName: string, args: IArguments);
		leave();
		printStackTrace(): void;
		log(msg: any): void;
		err(msg: any): void;
	}
	var modules: { [id: string]: IModule; } = {};
	var bundles: { [id: string]: string; } = {};
	// @ifndef BUILD
	// debug helpers - will be removed in BUILD #############
	class StackFrame {
		name: string;
		args: IArguments;
		constructor(stack: StackFrame[], procName: string, args: IArguments) {
			this.name = procName;
			this.args = args;
			stack.push(this);
		}
	}
	class _Debug implements _IDebug {
		private
		callstack: StackFrame[];

		constructor() {
			this.callstack = [];
		}
		enter(procName: string, args: IArguments) {
			return new StackFrame(this.callstack, procName, args);
		}
		leave() {
			return this.callstack.pop();
		}
		printStackTrace(): void {
			print("--- stack trace ---")
			for (var i = this.callstack.length - 1; i > 0; i--) {
				print(this.callstack[i].name);
			}
		}

		log(msg): void {
			print(msg)
		}
		err(msg): void {
			print(msg)
		}
	}
	var _dbg: _IDebug = new _Debug();
	// END OF debug helpers ###########################
	// @endif
	// @ifdef BUILD
	var _dbg: _IDebug = {
		enter: function () { },
		leave: function () { },
		printStackTrace: function (): void { },
		log(): void { },
		err(msg): void {
			print(msg)
		}
	};
	// @endif

	function require(deps: string[] | string, callback?: Function, root: any = undefined, soft: boolean = false) {
		_dbg.enter("require", arguments);
		try {
			if (typeof deps == "string") { // signature is require("somebundle:module")
				return getModuleInstance(<string>deps);
			}

			var callbackParams = [];

			for (var i = 0; i < deps.length; i++) {
				var dep = getModuleInstance(deps[i])

				if (dep) {
					callbackParams.push(dep);
				} else {
					if (soft) {
						callbackParams.push(null);
					} else {
						_dbg.err("Error loading module: " + deps[i]);
						return
					}
				}
			}

			return callback.apply(root, callbackParams);
		} finally {
			_dbg.leave();
		}
	}

	function extend(b, d) {
		_dbg.enter("extend", arguments);
		try {
			for (var k in d) {
				if (k != "default") b[k] = d[k];
			}
		} finally {
			_dbg.leave();
		}
	}

	function dynamicLoad(moduleUrl, requestedBy?) {
		_dbg.enter("dynamicLoad", arguments);
		try {
			_dbg.log("Dynamic loading " + moduleUrl)
			var bundle: string;
			var bundleid: string;
			var module: IModule = {
				requireUrl: moduleUrl,
				url: "",
				library: "",
				bundleid: "",
				id: "",
				deps: [],
				factory: null,
				instance: null,
				state: M_STATE.UNDEFINED
			}
			var src = null

			if (moduleUrl.indexOf(":") > -1) {
				bundleid = moduleUrl.split(":").shift()

				if (bundleid == '' && requestedBy && requestedBy.bundleid) {
					bundleid = requestedBy.bundleid
				}

				if (bundleid != "" && bundleid != "nsf") {
					if (!bundles.hasOwnProperty(bundleid)) {
						bundle = context.getProperty("amd.bundle." + bundleid)
						if (bundle + "" == "") {
							_dbg.err("Error getting bundle: " + bundleid)
							return null;
						}
						bundles[bundleid] = bundle
					} else {
						bundle = bundles[bundleid]
					}

					try {
						_dbg.log("loading: " + bundleid + ":" + moduleUrl.split(":").pop() + ".js")
						module.bundleid = bundleid
						module.id = moduleUrl.split(":").pop()
						module.url = bundle + module.id + ".js"
						_dbg.log("dynload: 1");
						src = org.apache.commons.io.IOUtils.toString((new java.net.URL(module.url)).openStream(), "UTF-8")
					} catch (e) {
						_dbg.err("Error getting module source: " + moduleUrl)
						_dbg.err(e)
					}
				} else {
					try {
						module.bundleid = "nsf"
						module.id = moduleUrl.split(":").pop()
						module.url = "/" + module.id + ".jss"
						_dbg.log("dynload: 2");
						src = org.apache.commons.io.IOUtils.toString(facesContext.getExternalContext().getResourceAsStream(module.url), "UTF-8")
					} catch (e) {
						_dbg.err("Error getting module source: " + moduleUrl)
						_dbg.err(e)
					}
				}
			} else {
				try {
					module.bundleid = "nsf"
					module.id = moduleUrl
					module.url = "/" + moduleUrl + ".jss"
					_dbg.log("dynload: 3");
					src = org.apache.commons.io.IOUtils.toString(facesContext.getExternalContext().getResourceAsStream(module.url), "UTF-8")
				} catch (e) {
					_dbg.err("Error getting module source: " + moduleUrl)
					_dbg.err(e)
				}
			}

			if (src) {
				var closure = src.replace(/^\/\/=@/gm, '') + "\n" + "//# sourceURL=" + module.url
				_dbg.log("Executing module @ sourceURL = " + module.url)
				try {
					(new Function("module", closure))(module);		// will call define(id?, deps?, factory)
					if (!!modules[module.id]) {
						_dbg.log("Module FOUND in modules[] after closure exec: " + module.id)
						module.state = M_STATE.DEFINED;		// define defined the module
					} else {
						_dbg.log("Module not in modules[] after closure exec: " + module.id)
						module.state = M_STATE.ERROR;		// define defined different module with different id?!
					}
				} catch (e) {
					_dbg.err("Error in factory of " + module.id);
					_dbg.err(e);
					return null;
				}
				return module;
			} else {
				_dbg.err("Cannot get src of " + module.id);
				return null;
			}

		} finally {
			_dbg.leave();
		}
	}

	function getModuleInstance(moduleSpec: string, requestedBy?) {
		_dbg.enter("getModuleInstance", arguments);
		try {
			var dep;
			var moduleid = ""
			var moduleUrl = "";
			var exports = null;
			var module: IModule = null;

			_dbg.log("getModuleInstance(" + moduleSpec + ")")

			moduleUrl = moduleSpec
			if (moduleUrl.indexOf(":") > -1) {				// found bundleid
				moduleid = moduleUrl.split(":").pop()
			} else {										// no bundle - relative to this bundle module
				moduleid = moduleUrl
			}

			module = modules.hasOwnProperty(moduleid) ? modules[moduleid] : null;		// is module allready defined
			_dbg.log("Requested instance of: " + moduleid)

			if (!!!module) {
				module = dynamicLoad(moduleUrl, requestedBy)							// load dynamically
				_dbg.log("after dynamic load of " + moduleid)
				if (!!!modules[module.id]) {									// test if module is NOW defined
					_dbg.err("Error in define. Module " + moduleid + " not found in modules[] after define?!");
					module.state = M_STATE.ERROR;
					_dbg.printStackTrace();
					return null;
				}
			}

			if (!!!module || module.state == M_STATE.ERROR || module.state == M_STATE.UNDEFINED) {	// error loading module - error in factory or cannot get source ot define defined the wrong module
				module.state = M_STATE.ERROR;
				return null;
			} else if (module.state == M_STATE.DEFINED) {			// exec factory
				module.state = M_STATE.LOADING;

				var factoryParams = [];

				for (var i = 0; i < module.deps.length; i++) {
					if (module.deps[i] == "exports") {
						dep = exports = {}
					} else {
						// no bundleid prepend bundleid of the current module
						dep = getModuleInstance((module.deps[i].indexOf(":") == -1 ? (module.bundleid + ":") : "") + module.deps[i], module)
					}

					if (dep) {
						factoryParams.push(dep)
					} else {
						module.state = M_STATE.ERROR;
						_dbg.err("Error in module dependenties of: " + module.id)
						return null
					}

				}

				try {
					module.instance = module.factory.apply(null, factoryParams);
				} catch (e) {
					module.state = M_STATE.ERROR;
					_dbg.err("Factory error: " + e + " @ " + (module.id || module))
				};

				if (exports) {
					if (exports.__esModule && !!exports["default"]) {
						extend(exports["default"], exports)
						module.instance = exports["default"]
					} else {
						module.instance = exports
					}
				}

				if (module.instance) {
					module.state = M_STATE.DONE;
					return module.instance
				} else {
					module.state = M_STATE.ERROR;
					_dbg.err("Error in module factory of: " + module.id)
					return null
				}

			} if (module.state == M_STATE.DONE) {			// module is executed return the instance
				return module.instance
			} if (module.state == M_STATE.LOADING) {			// module is loading but instance is requested - circular referrence
				_dbg.err("Error - circular referrence of: " + module.id)
				module.state = M_STATE.ERROR
				return null
			} else {
				_dbg.err("Unknown error in: " + (module.id || moduleSpec))	// module is undefined - should not happen
				module.state = M_STATE.ERROR
				return null
			}
		} finally {
			_dbg.leave();
		}
	}
	global.wish = function (deps: string[] | string, callback?: Function, root: any = undefined) {
		return require(deps, callback, root, true)
	}

	global.unload = function (moduleid: string) {
		var module = modules.hasOwnProperty(moduleid) ? modules[moduleid] : null;

		if (!!module) {
			delete modules[moduleid];
		}
	}

	global.define = function (a1, a2, a3) {		// cannot be debugged.. the usual way :) ..try anyway
		_dbg.log("in define")
		_dbg.log("a1 = " + a1)
		_dbg.log("a2 = " + a2)
		_dbg.log("a3 = " + a3)
		if (a1 instanceof Function && a2 == undefined) {			// signature is define(factory)
			_dbg.log("signature is define(factory)")
			module.factory = a1
		} else if (a3 instanceof Function) {		// signature is define(id, deps, fatory)
			_dbg.log("signature is define(id, deps, fatory)")
			module.id = a1
			module.deps = a2
			module.factory = a3
		} else if (a1 instanceof Array) {		// signautre is define(deps, factory)
			_dbg.log("signautre is define(deps, factory)")
			module.deps = a1
			module.factory = a2
		} else {								// signature is define(id, factory)
			_dbg.log("signature is define(id, factory)")
			module.id = a1
			module.factory = a2
		}


		// can be implemented different - dynamicLoad can insert the module in modules[] - will not complain about multiple define
		if (!modules.hasOwnProperty(module.id)) {
			_dbg.log("defining module: " + module.id)
			_dbg.log("deps: " + module.deps.join(", "))
			_dbg.log(modules["require"])
			modules[module.id] = module
			_dbg.log(module.id + ": ")
			_dbg.log(modules[module.id].requireUrl);
			_dbg.log(modules[module.id].state);
		} else {
			_dbg.err("module allready defined: " + module.id)
		}
	};
	global.define.amd = {}

	global.require = require;

	(new Function("module", "global", 'global.define("require", function() {return global.require})'))(
		{
			requireUrl: "require",
			bundleid: "",
			id: "require",
			url: "require",
			library: "amd.jss",
			deps: [],
			factory: null,
			state: M_STATE.DEFINED,
			instance: null
		}, global
	);
	// @ifndef BUILD
	(new Function("module", "global", 'global.define("global", function() {return global})'))(
		{
			requireUrl: "global",
			bundleid: "",
			id: "global",
			url: "global",
			library: "amd.jss",
			deps: [],
			factory: null,
			state: M_STATE.DEFINED,
			instance: null
		}, global
	)
	// @endif
})(this);
