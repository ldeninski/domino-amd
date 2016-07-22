// This file is intended to be executed as server side javascript library
(function (global) {
    var modules = {};
    var bundles = {};
    var _dbg = {
        enter: function () { },
        leave: function () { },
        printStackTrace: function () { },
        log: function () { },
        err: function (msg) {
            print(msg);
        }
    };
    function require(deps, callback, root, soft) {
        if (root === void 0) { root = undefined; }
        if (soft === void 0) { soft = false; }
        _dbg.enter("require", arguments);
        try {
            if (typeof deps == "string") {
                return getModuleInstance(deps);
            }
            var callbackParams = [];
            for (var i = 0; i < deps.length; i++) {
                var dep = getModuleInstance(deps[i]);
                if (dep) {
                    callbackParams.push(dep);
                }
                else {
                    if (soft) {
                        callbackParams.push(null);
                    }
                    else {
                        _dbg.err("Error loading module: " + deps[i]);
                        return;
                    }
                }
            }
            return callback.apply(root, callbackParams);
        }
        finally {
            _dbg.leave();
        }
    }
    function extend(b, d) {
        _dbg.enter("extend", arguments);
        try {
            for (var k in d) {
                if (k != "default")
                    b[k] = d[k];
            }
        }
        finally {
            _dbg.leave();
        }
    }
    function dynamicLoad(moduleUrl, requestedBy) {
        _dbg.enter("dynamicLoad", arguments);
        try {
            _dbg.log("Dynamic loading " + moduleUrl);
            var bundle;
            var bundleid;
            var module = {
                requireUrl: moduleUrl,
                url: "",
                library: "",
                bundleid: "",
                id: "",
                deps: [],
                factory: null,
                instance: null,
                state: 0 /* UNDEFINED */
            };
            var src = null;
            if (moduleUrl.indexOf(":") > -1) {
                bundleid = moduleUrl.split(":").shift();
                if (bundleid == '' && requestedBy && requestedBy.bundleid) {
                    bundleid = requestedBy.bundleid;
                }
                if (bundleid != "" && bundleid != "nsf") {
                    if (!bundles.hasOwnProperty(bundleid)) {
                        bundle = context.getProperty("amd.bundle." + bundleid);
                        if (bundle + "" == "") {
                            _dbg.err("Error getting bundle: " + bundleid);
                            return null;
                        }
                        bundles[bundleid] = bundle;
                    }
                    else {
                        bundle = bundles[bundleid];
                    }
                    try {
                        _dbg.log("loading: " + bundleid + ":" + moduleUrl.split(":").pop() + ".js");
                        module.bundleid = bundleid;
                        module.id = moduleUrl.split(":").pop();
                        module.url = bundle + module.id + ".js";
                        _dbg.log("dynload: 1");
                        src = org.apache.commons.io.IOUtils.toString((new java.net.URL(module.url)).openStream(), "UTF-8");
                    }
                    catch (e) {
                        _dbg.err("Error getting module source: " + moduleUrl);
                        _dbg.err(e);
                    }
                }
                else {
                    try {
                        module.bundleid = "nsf";
                        module.id = moduleUrl.split(":").pop();
                        module.url = "/" + module.id + ".jss";
                        _dbg.log("dynload: 2");
                        src = org.apache.commons.io.IOUtils.toString(facesContext.getExternalContext().getResourceAsStream(module.url), "UTF-8");
                    }
                    catch (e) {
                        _dbg.err("Error getting module source: " + moduleUrl);
                        _dbg.err(e);
                    }
                }
            }
            else {
                try {
                    module.bundleid = "nsf";
                    module.id = moduleUrl;
                    module.url = "/" + moduleUrl + ".jss";
                    _dbg.log("dynload: 3");
                    src = org.apache.commons.io.IOUtils.toString(facesContext.getExternalContext().getResourceAsStream(module.url), "UTF-8");
                }
                catch (e) {
                    _dbg.err("Error getting module source: " + moduleUrl);
                    _dbg.err(e);
                }
            }
            if (src) {
                var closure = src.replace(/^\/\/=@/gm, '') + "\n" + "//# sourceURL=" + module.url;
                _dbg.log("Executing module @ sourceURL = " + module.url);
                try {
                    (new Function("module", closure))(module); // will call define(id?, deps?, factory)
                    if (!!modules[module.id]) {
                        _dbg.log("Module FOUND in modules[] after closure exec: " + module.id);
                        module.state = 1 /* DEFINED */; // define defined the module
                    }
                    else {
                        _dbg.log("Module not in modules[] after closure exec: " + module.id);
                        module.state = -1 /* ERROR */; // define defined different module with different id?!
                    }
                }
                catch (e) {
                    _dbg.err("Error in factory of " + module.id);
                    _dbg.err(e);
                    return null;
                }
                return module;
            }
            else {
                _dbg.err("Cannot get src of " + module.id);
                return null;
            }
        }
        finally {
            _dbg.leave();
        }
    }
    function getModuleInstance(moduleSpec, requestedBy) {
        _dbg.enter("getModuleInstance", arguments);
        try {
            var dep;
            var moduleid = "";
            var moduleUrl = "";
            var exports = null;
            var module = null;
            _dbg.log("getModuleInstance(" + moduleSpec + ")");
            moduleUrl = moduleSpec;
            if (moduleUrl.indexOf(":") > -1) {
                moduleid = moduleUrl.split(":").pop();
            }
            else {
                moduleid = moduleUrl;
            }
            module = modules.hasOwnProperty(moduleid) ? modules[moduleid] : null; // is module allready defined
            _dbg.log("Requested instance of: " + moduleid);
            if (!!!module) {
                module = dynamicLoad(moduleUrl, requestedBy); // load dynamically
                _dbg.log("after dynamic load of " + moduleid);
                if (!!!modules[module.id]) {
                    _dbg.err("Error in define. Module " + moduleid + " not found in modules[] after define?!");
                    module.state = -1 /* ERROR */;
                    _dbg.printStackTrace();
                    return null;
                }
            }
            if (!!!module || module.state == -1 /* ERROR */ || module.state == 0 /* UNDEFINED */) {
                module.state = -1 /* ERROR */;
                return null;
            }
            else if (module.state == 1 /* DEFINED */) {
                module.state = 2 /* LOADING */;
                var factoryParams = [];
                for (var i = 0; i < module.deps.length; i++) {
                    if (module.deps[i] == "exports") {
                        dep = exports = {};
                    }
                    else {
                        // no bundleid prepend bundleid of the current module
                        dep = getModuleInstance((module.deps[i].indexOf(":") == -1 ? (module.bundleid + ":") : "") + module.deps[i], module);
                    }
                    if (dep) {
                        factoryParams.push(dep);
                    }
                    else {
                        module.state = -1 /* ERROR */;
                        _dbg.err("Error in module dependenties of: " + module.id);
                        return null;
                    }
                }
                try {
                    module.instance = module.factory.apply(null, factoryParams);
                }
                catch (e) {
                    module.state = -1 /* ERROR */;
                    _dbg.err("Factory error: " + e + " @ " + (module.id || module));
                }
                ;
                if (exports) {
                    if (exports.__esModule && !!exports["default"]) {
                        extend(exports["default"], exports);
                        module.instance = exports["default"];
                    }
                    else {
                        module.instance = exports;
                    }
                }
                if (module.instance) {
                    module.state = 3 /* DONE */;
                    return module.instance;
                }
                else {
                    module.state = -1 /* ERROR */;
                    _dbg.err("Error in module factory of: " + module.id);
                    return null;
                }
            }
            if (module.state == 3 /* DONE */) {
                return module.instance;
            }
            if (module.state == 2 /* LOADING */) {
                _dbg.err("Error - circular referrence of: " + module.id);
                module.state = -1 /* ERROR */;
                return null;
            }
            else {
                _dbg.err("Unknown error in: " + (module.id || moduleSpec)); // module is undefined - should not happen
                module.state = -1 /* ERROR */;
                return null;
            }
        }
        finally {
            _dbg.leave();
        }
    }
    global.wish = function (deps, callback, root) {
        if (root === void 0) { root = undefined; }
        return require(deps, callback, root, true);
    };
    global.unload = function (moduleid) {
        var module = modules.hasOwnProperty(moduleid) ? modules[moduleid] : null;
        if (!!module) {
            delete modules[moduleid];
        }
    };
    global.define = function (a1, a2, a3) {
        _dbg.log("in define");
        _dbg.log("a1 = " + a1);
        _dbg.log("a2 = " + a2);
        _dbg.log("a3 = " + a3);
        if (a1 instanceof Function && a2 == undefined) {
            _dbg.log("signature is define(factory)");
            module.factory = a1;
        }
        else if (a3 instanceof Function) {
            _dbg.log("signature is define(id, deps, fatory)");
            module.id = a1;
            module.deps = a2;
            module.factory = a3;
        }
        else if (a1 instanceof Array) {
            _dbg.log("signautre is define(deps, factory)");
            module.deps = a1;
            module.factory = a2;
        }
        else {
            _dbg.log("signature is define(id, factory)");
            module.id = a1;
            module.factory = a2;
        }
        // can be implemented different - dynamicLoad can insert the module in modules[] - will not complain about multiple define
        if (!modules.hasOwnProperty(module.id)) {
            _dbg.log("defining module: " + module.id);
            _dbg.log("deps: " + module.deps.join(", "));
            _dbg.log(modules["require"]);
            modules[module.id] = module;
            _dbg.log(module.id + ": ");
            _dbg.log(modules[module.id].requireUrl);
            _dbg.log(modules[module.id].state);
        }
        else {
            _dbg.err("module allready defined: " + module.id);
        }
    };
    global.define.amd = {};
    global.require = require;
    (new Function("module", "global", 'global.define("require", function() {return global.require})'))({
        requireUrl: "require",
        bundleid: "",
        id: "require",
        url: "require",
        library: "amd.jss",
        deps: [],
        factory: null,
        state: 1 /* DEFINED */,
        instance: null
    }, global);
})(this);
