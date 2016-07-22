# **This is a work in progress repo. Please be patient.**

# Domino AMD Loader

**Domino AMD Loader** is implementation of the [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) (Asynchronous Module Definition) API for the [IBM Domino](www.ibm.com/software/products/en/ibmdomino) server environment. The loader is still not 100% compatible with the API, but most of the core functionality is there:

- Automatic dependencies resolution
- Module isolation
- Factory instance caching

Additionally to the traditional AMD goodies the loader gives you the means of loading files from various sources - filesystem, remote http(s) urls, nsf resources (files/script libraries). The modules are executed with the rights of the loader signer so beware of security implications.

To give you taste of what you can do with the loader:

```javascript
// require modules:
// "cdn:" is a prefix specifying the bundle where the modules are to be loaded from - more infor in the usage section.
// - util	<= various utility functons - forEach, map, padleft, uuid(), isString, isArray, isFunction.. etc.
// - log	<= logging abstraction
// - notes	<= notes C objects recycling made easy
// - mail	<= messaging abstraction - attachments handling, html and text mime parts handling.. etc.
require(["cdn:xspfw/util", "cdn:xspfw/log", "cdn:xspfw/notes", "cdn:xspfw/mail"], function(util, log, notes, mail) {
	var nv, nvec, nve;		// some temp vars
	var memo = new mail.Message();	// new object of class Message
	var that = {};			// not working in a Class context create one

	memo.From = "no-reply@perfectbg.com";	// set originator mail
	memo.FromName = "No Reply";		// set originator name

	try {
		// Own the temp objects so notes object can be recycled
		// memory inefficient (spikes in usage) but easy to use and fast
		notes.own(that,
			nv = database.getView("SYSTEM/DocumentQueue"),
			nvec = nv.getAllEntries(),
			nve = nvec.getFirstEntry()
		);

		while(!!nve) {
			// Loop over the values of the second column
			// getColumnValues().get(1) can the string, array or java.util.Vector
			util.forEach(nve.getColumnValues().get(1), function(email) {
				// Send individual message to every recipient of document in the DocumentQueue view
				memo.Subject = "Hello, " + email;
				memo.SendTo = email;
				memo.Text = "Hellow, " + email;				// mime part text/plain
				memo.HTML = "<p>Hellow, <em>" + email + "</em>";	// mime part text/html
				memo.send();
				log.info("Message to " + email + " sent.");
			})

			// Own the next etry. Everything will be recycled in the finally block
			notes.own(that,
				nve = nvec.getNextEntry(nve);
			)
		}
	} catch(e) {
		log.err(e);
	} finally {
		// Clean up - recycle all notes objects used in "that" context
		notes.clean(that)
	}
});
```

Additional repo with part of the toolkit/framework will be made available in the next weeks. Modules are intended to be written in typescript, but you can use plain javascript of course.

The only dependency of the loader is org.apache.commons.io. I will drop it as soon as i have the time to rewrite the helper method used in plain ts/js/java.

# How to use the loader

You just need to:

1. **Include amd.js** (or the minified version) in you nsf's script libraries
2. **Configure** the loader by adding at least one bundle to you xsp.properties (Application Configuration > Xsp Properties). Every bundle is represented by a single line as follows:
	```
	amd.bundle.<bundle_name>=<bindle_address>
	```
	For example the "cdn" bundle in the first example above is defined in xsp.properties like:
	```
	amd.bundle.cdn=file:///local/notesdata/domino/html/_CDN_ROOT/_JSS/src/
	```
	This literally means: load every module prefixed with "cdn:" from file located on the local filesystem in "/local/notesdata/domino/html/_CDN_ROOT/_JSS/src/".
	For example the full address of the the "xspfw/mail module" is  "/local/notesdata/domino/html/_CDN_ROOT/_JSS/src/xspfw/mail.js". For module loading java.net.Url is used
	so what kind of address you will be able to load from depends on that protocols your java.net.Url can handle. As far as I know at least "file://" and "http://" are supported.
	Loader plugins will be implemented in the the future so proper security/signature checks on (for example) remote http javascript can be performed as well as more flexible address handling,
	source caching, automatic module reloading and so on.

3. Add the **library as a resource** in the xpages that are going to use the loader.

```xml
<xp:this.resources>
	<xp:script src="/amd.jss" clientSide="false"></xp:script>
</xp:this.resources>
```

4. **Require** some modules.

```javascript
require(["cdn:xspfw/log"], function(log) {
	log.info("log module required");
	log.warn("log module required");
	log.err("no error here");
	log.setLevel(log.level_info);
	log.info("log module required");
	log.warn("log module required");
	log.err("no error here");
});
```

# Why to use modules - Modules vs Script libraries
The long version you can find in this [thorough article](http://requirejs.org/docs/whyamd.html).
The short version is - script libraries are [**dangerous**](#1-script-libraries-are-dangerous), [**slow**](#2-slow-especially-as-implemented-in-the-domino-environment), especially as implemented in the domino environment and [**do not resolve dependencies**](#3-depencies-resolution) automaticaly.


### 1. Script libraries are dangerous
You can find hundreds of articles and examples how you can break every single nsf application running on the same server with a single line of javascript. But that's not the main problem. When using plain script libraries you most certainly will end up with some kind of **variable collision** and excessively **polluted global scope**.

### **Variable collision** - the simplest example to consider..

```javascript
// cms.jss script library
function getProfile(name) {
	// get some information about the user logged in
	return {	// something like
		name: "John Doe",
		admin: true,
		facebookId: 123123123123
	}
}

// ##########################################
// facebook-integration.jss library
function getProfile(fbId) {
	// get the facebook profile
	return {	// something like
		firstName: "John",
		lastName: "Doe",
		avatar: "http://cdn.facebook.com/....../r4686576ugasfd6.jpg"
	}
}
```

You cannot use both libraries in the same xpage because you have two functions with the same name. You would say `"I will rename one of the functions"`
and that would have been possible if you were the author of the library. What will happen if the "facebook-integration.jss" is something you got from openntf.org for example -
you will have to hunt down every single occurrence of getProfile and rename it to something else or wrap the whole library in closure and expose only what you need to the global scope.
Either way you wasted your time - this solution is not permanent - in a month or two you will end up colliding your (not so) "new" fb\_getProfile function with the fb\_getProfile() of the colleague next desk.

So what is the solution? - Write modules. The example above can be avoided if both libraries were modules.

```javascript
// cms.jss script library
define(function() {
	return {
		getProfile: function(name) {
			// get some information about the user logged in
			return {	// something like
				name: "John Doe",
				admin: true,
				facebookId: 123123123123
			}
		}
	}
})
```

```javascript
// facebook-integration.ts library - will be transpiled to javascript
define(function() {
	return {
		getProfile: function(fbId) {
			// get the facebook profile
			return {	// something like
				firstName: "John",
				lastName: "Doe",
				avatar: "http://cdn.facebook.com/....../r4686576ugasfd6.jpg"
			}
		}
	}
})
```

Both modules can be used at the same time like that:

```javascript
// Assuming "cdn" is the bundle that contains facebook-integration.js and cms.js at the root level.
require(["cdn:cms", "cdn:facebook-integration"], function(cms, fb) {
	var cmsProfile = cms.getProfile(session.getEffectiveUserName());
	var fbProfile = fb.getProfile(cmsProfile.facebookId);
	// do something with the profiles..
})
```

### There is noting much to say about **global scope pollution**
It is BAD, very BAD. It slows down javascript execution system wide, makes wired bugs happen, it can completely breaks your code if you missed to declare a variable or if you love to use the same variable name often. Don't take my word for it - read how global scope access (and pollution) slows down execution [here](http://www.webreference.com/programming/javascript/jkm3/index.html)

The wired bugs I'm talking about happen if (when) you accidentally overwrite variable in a library for example:

```javascript
// hitcounter.js
var counter = counter || 0;
function hit() {
	return counter++
}

// ---------------------------------
// in an event handler in some xpage
counter = 0;	// missing var here = counter is the variable in the library above.
while(iterator.hasNext()) {
	// do something with the items
	counter++;
}

// counter is the count of the items - it has overwriten the library counter
// hit() will not return the hit count anymore.
```

But that is not the way to shoot yourself in the leg. Lets say you have a datasource named doc and in a button click event handler the declaration `var doc = database.getDocumentByUNID(..some_temp_unid..)`. This code will break some of your logic.. sometimes.. If the button have not been clicked your code will work as expected. If you press the button you will get wired behavior -
expressions like `#{doc.title}` will work fine, but something like `#{javascript:doc.getItemValueString('title')}` will return the title of the some_temp_unid's document instead of the current datasource title item. Why's that - expression language prioritizes scope variables (doc datasource  is in viewScope) and javascript prioritizes global scope variables. This kind of bugs are hard to track because they have inconsistent (at first sight) occurrence - only if/when the button have been pressed. Using modules naturally eliminates those situations:

```javascript
require(["some/module"], function(someModule) {
	var doc = database.getDocumentByUNID("some_temp_unid");
})
```

> Doc will not leak in the global scope so no javascript outside ot the callback will be able to access the variable

---
### 2. Slow especially as implemented in the domino environment
After investigation of the decompiled java code of IBM's xsp framework you will notice the inefficiencies in script library handling - libraries are evaluated at the moment of inclusion as resource no matter if you are using any function/var from it. Using IBM's library <=> resource model this is unavoidable. By using modules this can be avoided thus saving considerable memory and processing resource.

Consider a complex xpage (web service entry point for example) referencing more than 20 javascript libraries. Initial load time of this service will be enormous - all the code will have to be read parsed and executed no matter that you will be using only fraction of the functionality at the moment of the first request. Consecutive requests will be fast using IBM's logic but not as fast if all the libraries were modules - even if the script library is not reparsed/reexecuted after initial load, code is rechecked for changes. You can verify this by disabling automatic build and changing something in a script library - the new code will be used without discarding the view, session and application scope/state. When using the loader and require() you get a cached instance of the module instance, so no file access is involved. In our experience when used in complex web applications modules instead of script libraries shaves of 30-40% of every xpage request. Of course this depends on the writing style of former script libraries, but cpu will be saved even only considering avoiding the file access.

### 3. Depencies resolution
In modern well thought environments like nodejs you don't need to rediscover the wheel - you require() a module and all the dependencies are loaded. In domino on the other hand copying and pasting functions around, and if everything else fails the whole libraries, is an everyday developer job. There is no elegant way of code sharing and no way of creating composite systems other than:

1. Try to use a library
2. If there is error that some function is missing
3. Try to find where in the other libraries was the particular function defined..
4. **Repeat** until all dependencies are met.. or at least seams that way.

The result is frustration and wasted time. The solution is again modules. The loader is capable of dynamic recursive dependency loading and the result is:
- No more copy and paste, wasted time and pulled hair
- Shared code between applications
- Faster and less bug prone development

# How to write modules
*Some notes before we begin:*

Modules are intended to be written in **[typescript](https://www.typescriptlang.org/)**, but if you prefer javascript you can use it too. The configuration of the ts compiler should be:
- "target": "es3",
- "module": "amd",
- "noEmitOnError": false

> You may notice some `"use amd"` statements in the examples that's because I've started using typescript for domino modules long before typescript auto compile was usable (and fast enough) for my use,
> so I wrote my own simple VSCode extension for typescript to domino compilation. The `"use amd"` clause instructs the compiler to emit amd compatible module.
> The extension will be uploaded in a separate repo in the next few weeks too.

I personally use **[Visual Studio Code](https://code.visualstudio.com/)** instead of Domino Designer for all javascript/typescript development. Most of the applications developed this way have **maximum of 3 script libraries** - amd.js, config.js, crypto/secrets.js.

## Why typescript
- For starers IBM's "variation" of javascript used in the Domino environment is closer to typescript than javascript.
- Typescript is strong typed (yes that is a good thing)
- VSCode (and most of the alternatives) code completion is working marvelous when using typescript
- TS modules resolve class members, member types, function arguments and literally everything else at ***edit time***.
This way you can avoid almost every stupid error you make in your code before even compiling let alone running it.

## Why VSCode instead Designer
**Designer is slow, unstable**, ibm's javascript editors are missing crucial functionalities and parse javascript plain wrong resulting in unusable "Outline" side panel (not that anyone need it). **Code on the other hand is crazy fast** (compared to designer). By my opinion, it is one of the best typescript/javascript IDEs and is really easy to extend giving you the tools and means to integrate it with literally everything. It is possible given the time to integrate Code so it can access resources directly in the nsf virtual filesystem. Imagine not having to kill and restart Designer every hour, hour and half because some "widget have been dismissed", because "Building workspace" bacame a neverending task ot just because Designer have been frozen for the past 5 minutes.

## Example modules
