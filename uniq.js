// ==UserScript==
// @name			UniQ
// @namespace		https://greasyfork.org/users/723559-valen-h
// @homepage		https://greasyfork.org/scripts/419588-uniq
// @updateURL		https://greasyfork.org/scripts/419588-uniq/code/UniQ.js
// @installURL		https://greasyfork.org/scripts/419588-uniq/code/UniQ.js
// @downloadURL		https://greasyfork.org/scripts/419588-uniq/code/UniQ.js
// @version			1.2
// @description		Utilities for faster development.
// @author			V. H.
// @license			AFL-3.0
// @grant			unsafeWindow
// ==/UserScript==

/**
 * @file uniq.js
 * @since 3/1/2021
 */
 
 if (typeof unsafeWindow == "undefined") unsafeWindow = window;

/**
 * Executes only once.
 * 
 * @param {Function} what - Target function
 * @param {...args} args - Non-fixed arguments
 * 
 * @return {bool} true on success.
 */
if (!unsafeWindow.try_once) {
	unsafeWindow.try_once = function try_once(what, ...args) {
		if (unsafeWindow.try_once.trylist.includes(what)) return false;
		else if (what(...args)) unsafeWindow.try_once.trylist.push(what);
		else return false;
		
		return true;
	}; //try_once
	unsafeWindow.try_once.trylist = [ ];
	unsafeWindow.try_once.remove = function remove(value) {
		if (!value)
			return unsafeWindow.try_once.trylist.splice(0, unsafeWindow.try_once.trylist.length);
		
		const idx = unsafeWindow.try_once.trylist.findIndex(value);
		
		if (idx >= 0) return unsafeWindow.try_once.trylist.splice(idx, 1);
		
		return false;
	};
}

/**
 * Fixate parameters of function.
 * 
 * @param {Function} fn - Target function
 * @param {...args} args - Fixed arguments
 * 
 * @return {Function} Fixed new function.
 */
if (!unsafeWindow.fixed_params) unsafeWindow.fixed_params = function fixed_params(fn, ...args) {
	return (...a) => fn(...args, ...a);
}; //fixed_params

/**
 * Retry execution until success.
 * 
 * @param {Function} what - Target function
 * @param {Number=500} delay - Delay of retry
 * @param {...any} args - Target function arguments
 * 
 * @return {Promise} Data.
 */
if (!unsafeWindow.try_until) unsafeWindow.try_until = async function try_until(what, delay = 500, ...args) {
	return new Promise(async (res, rej) => {
		let data;
		
		try {
			if (data = await what(...args)) res(data);
			else setTimeout((w, d, ...args) => try_until(w, d, ...args).then(res, rej), delay, what, delay, ...args);
		} catch(e) { rej(e); }
	});
}; //try_until

/**
 * Try execution many times.
 * 
 * @param {Function} what - Target function
 * @param {Number=3} tries - Attempt tries
 * @param {Object|Number=0} delay - Delay of retry
 * @param {...any} args - Target function arguments
 * 
 * @return {any} Data.
 */
if (!unsafeWindow.try_max) unsafeWindow.try_max = async function try_max(what, tries = 3, delay = 0, ...args) {
	let data;
	
	do {
		data = await what(...args);
		if (!data && delay > 0) await sleep(typeof delay === "object" ? delay['t'] : delay);
	} while (!data && --tries > 0);
	
	return data;
}; //try_max

/**
 * Block execution.
 * 
 * @param {Number=500} by - By
 * 
 * @return {Promise} Blocker.
 */
if (!unsafeWindow.sleep) unsafeWindow.sleep = async function sleep(by = 500) {
	return await new Promise((res, rej) => setTimeout(by => res(by), by, by));
}; //sleep

/**
 * Do If.
 * 
 * @param {any} v - If true
 * @param {Function} fn - Target function
 * @param {...any} args - Target function arguments
 * 
 * @return {any} Data.
 */
if (!unsafeWindow.do_if) unsafeWindow.do_if = function do_if(v, fn = e => e, ...args) {
	return v ? fn.bind(fn)(v, ...args) : v;
}; //do_if

/**
 * Parses cookies into tuple array [[],[]]
 * 
 * @since 4/3/2021
 * 
 * @param {String=window.document.cookie} cookies - Target cookiestring
 * @param {String=';'} b1 - first sep
 * @param {String='='} b2 - second sep
 * @param {String=';'} j1 - first join
 * @param {String='='} j2 - second join
 * 
 * @return {Array<String[]>} Enchanted pairs.
 */
if (!unsafeWindow.parseCookies) unsafeWindow.parseCookies = function parseCookies(cookies = unsafeWindow.document.cookie || window.document.cookie || document.cookie, b1 = /(?<!\\);/gm, b2 = /(?<!\\)=/gm, j1 = ';', j2 = '=') {
	const arr = [ ];
	
	cookies.split(b1).forEach((section, idx) => {
		let p = section.trim().split(b2).map(p => p.trim()).filter(a => a);
		const pp = [ p.shift(), p.join(j2) ].filter(a => a);
		
		pp._idx = idx;
		
		arr.push(pp);
	});
	
	arr.joinAll = (function joinAll(_b1 = j1, _b2 = j2) {
		return this.map(cookie => cookie.join(_b2)).join(_b1);
	}).bind(arr);
	arr.findC = (function findC(name) {
		return this.filter(cookie => cookie[0] == name);
	}).bind(arr);
	arr.set = (function set(targ = unsafeWindow.document || window.document || document, _b1 = j1, _b2 = j2) {
		for (const c of this) targ.cookie = c.join(j2);
		
		return targ.cookie;
	}).bind(arr);
	arr.setC = (function setC(name, val, targ = unsafeWindow.document || window.document || document, _b1 = j1, _b2 = j2) {
		const l = this.findC(name);
		
		if (!l.length && val) l.push([name, val]);
		
		for (const c of l) {
			if (val) c[1] = val;
			
			targ.cookie = c.join(j2);
		}
		
		return targ.cookie;
	}).bind(arr);
	arr.erase = (function erase(named) {
		if (named) this.findC(named).forEach(c => (c[1] = `;max-age=0;expires=${new Date().toUTCString()}`));
		else
			for (const c of this) c[1] = `;max-age=0;expires=${new Date().toUTCString()}`;
		
		return this;
	}).bind(arr);
	
	return arr;
}; //parseCookies

/**
 * Increments Storage Value.
 * 
 * @since 13/3/2021
 * 
 * @param {String} a - Name of key
 * @param {any} b - Initial Value
 * @param {any} c - Incrementor
 * @param {any} e - Prop Value
 * 
 * @return {any} New data.
 */
if (!unsafeWindow.incVal) unsafeWindow.incVal = function incVal(a, b = 0, c = 1, e = "") {
	let d;
	
	if (typeof c === "number" && typeof b === "number") GM_setValue(a, d = GM_getValue(a, b) + c);
	else if (typeof b === "string") GM_setValue(a, d = GM_getValue(a, b));
	else if (b instanceof Array) {
		d = GM_getValue(a, b);
		
		if (c) d.push(c);
		
		GM_setValue(a, d);
	} else {
		d = GM_getValue(a, b);
		
		if (typeof c === "string") d[c] = e;
		
		GM_setValue(a, d);
	}
	
	return d;
}; //incVal

/**
 * Erases a value.
 * 
 * @since 13/3/2021
 * 
 * @param {String} key - Which value, empty for all
 */
if (!unsafeWindow.erase) unsafeWindow.erase = function erase(key) {
	if (key) GM_deleteValue(key);
	else
		for (let i of GM_listValues()) GM_deleteValue();
}; //erase

/**
 * Class or Id query.
 * 
 * @since 16/4/2021
 * 
 * @param {String} str - Id/Class
 * 
 * @return CSS #str, .str
 */
 if (!unsafeWindow.idclass) unsafeWindow.idclass = function idclass(str) {
	return `#${str}, .${str}`;
}; //idclass

/**
 * Binds to XHRs.
 * 
 * @since 2/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interXHR) {
	unsafeWindow.interXHR = function interXHR(bind = true) {
		if ((bind && unsafeWindow.interXHR.bound) || !(bind || unsafeWindow.interXHR.bound)) return XMLHttpRequest.prototype.open;
		
		unsafeWindow.interXHR.bound = bind;
		if (!unsafeWindow.interXHR.interOrig) unsafeWindow.interXHR.interOrig = XMLHttpRequest.prototype.open;
		
		if (bind) XMLHttpRequest.prototype.open = function open(...args) {
				let v;
				
				if (unsafeWindow.interXHR.cbs.some(inter => (v = inter.call(this, ...args)))) return v;
				
				return this ? unsafeWindow.interXHR.interOrig.call(this, ...args) : unsafeWindow.interXHR.interOrig(...args);
			};
		else XMLHttpRequest.prototype.open = unsafeWindow.interXHR.interOrig;
		
		return XMLHttpRequest.prototype.open;
	}; //interXHR
}
/**
 * Binds to Fetch.
 * 
 * @since 2/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interFetch) {
	unsafeWindow.interFetch = function interFetch(bind = true) {
		if ((bind && unsafeWindow.interFetch.bound) || !(bind || unsafeWindow.interFetch.bound)) return fetch;
		
		unsafeWindow.interFetch.bound = bind;
		if (!unsafeWindow.interFetch.interOrig) unsafeWindow.interFetch.interOrig = fetch;
		
		if (bind) unsafeWindow.fetch = window.fetch = fetch = function fetch(...args) {
				let v;
				
				if (unsafeWindow.interFetch.cbs.some(inter => (v = inter.call(this, ...args)))) return v;
				
				return this ? unsafeWindow.interFetch.interOrig.call(this, ...args) : unsafeWindow.interFetch.interOrig(...args);
			};
		else unsafeWindow.fetch = window.fetch = fetch = unsafeWindow.interFetch.interOrig;
		
		return fetch;
	}; //interFetch
}
/**
 * Binds to Window.open
 * 
 * @since 2/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interWinopen) {
	unsafeWindow.interWin = unsafeWindow.interWinopen = function interWinopen(bind = true) {
		if ((bind && unsafeWindow.interWinopen.bound) || !(bind || unsafeWindow.interWinopen.bound)) return open;
		
		unsafeWindow.interWinopen.bound = bind;
		if (!unsafeWindow.interWinopen.interOrig) unsafeWindow.interWinopen.interOrig = open;
		
		if (bind) unsafeWindow.open = window.open = open = (function open(...args) {
				let v;
				
				if (unsafeWindow.interWinopen.cbs.some(inter => (v = inter.call(this, ...args)))) return v;
				
				return this ? unsafeWindow.interWinopen.interOrig.call(this, ...args) : unsafeWindow.interWinopen.interOrig(...args);
			}).bind(window);
		else unsafeWindow.open = window.open = open = unsafeWindow.interWinopen.interOrig.bind(window);
		
		return open;
	}; //interWinopen
}

/**
 * Binds to Events.
 * 
 * @since 2/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interEvent) {
	unsafeWindow.interEvent = function interEvent(bind = true) {
		if ((bind && unsafeWindow.interEvent.bound) || !(bind || unsafeWindow.interEvent.bound)) return EventTarget.prototype.addEventListener;
		
		unsafeWindow.interEvent.bound = bind;
		if (!unsafeWindow.interEvent.interOrig) unsafeWindow.interEvent.interOrig = EventTarget.prototype.addEventListener;
		
		if (bind) EventTarget.prototype.addEventListener = function addEventListener(...args) {
				let v;
				
				if (unsafeWindow.interEvent.cbs.some(inter => (v = inter.call(this, ...args)))) return v;
				
				return this ? unsafeWindow.interEvent.interOrig.call(this, ...args) : unsafeWindow.interEvent.interOrig(...args);
			};
		else EventTarget.prototype.addEventListener = unsafeWindow.interEvent.interOrig;
		
		return EventTarget.prototype.addEventListener;
	}; //interEvent
}

/**
 * Binds to Document.write
 * 
 * @since 8/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interWrite) {
	unsafeWindow.interWrite = function interWrite(bind = true) {
		if ((bind && unsafeWindow.interWrite.bound) || !(bind || unsafeWindow.interWrite.bound)) return Document.prototype.write;
		
		unsafeWindow.interWrite.bound = bind;
		if (!unsafeWindow.interWrite.interOrig) unsafeWindow.interWrite.interOrig = Document.prototype.write;
		
		if (bind) document.write = Document.prototype.write = function write(...args) {
				let v;
				
				if (unsafeWindow.interWrite.cbs.some(inter => (v = inter.call(this, ...args)))) return v;
				
				return this ? unsafeWindow.interWrite.interOrig.call(this, ...args) : unsafeWindow.interWrite.interOrig(...args);
			};
		else document.write = Document.prototype.write = unsafeWindow.interWrite.interOrig;
		
		return Document.prototype.write;
	}; //interWrite
}

/**
 * Binds to Image
 * 
 * @since 8/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interImage) {
	unsafeWindow.interImage = function interImage(bind = true) {
		if ((bind && unsafeWindow.interImage.bound) || !(bind || unsafeWindow.interImage.bound)) return Image;
		
		unsafeWindow.interImage.bound = bind;
		if (!unsafeWindow.interImage.interOrig) unsafeWindow.interImage.interOrig = Image;
		
		if (bind) unsafeWindow.Image = window.Image = Image = class NImage extends Image {
				constructor(...args) {
					super(...args);
					
					let v;
					
					if (unsafeWindow.interImage.cbs.some(inter => (v = inter.call(this, ...args)))) throw v;
				} //ctor
			};
		else unsafeWindow.Image = window.Image = Image = unsafeWindow.interImage.interOrig;
		
		return Image;
	}; //interImage
}
/**
 * Binds to Audio
 * 
 * @since 8/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interAudio) {
	unsafeWindow.interAudio = function interAudio(bind = true) {
		if ((bind && unsafeWindow.interAudio.bound) || !(bind || unsafeWindow.interAudio.bound)) return Audio;
		
		unsafeWindow.interAudio.bound = bind;
		if (!unsafeWindow.interAudio.interOrig) unsafeWindow.interAudio.interOrig = Audio;
		
		if (bind) unsafeWindow.Audio = window.Audio = Audio = class NAudio extends Audio {
				constructor(...args) {
					super(...args);
					
					let v;
					
					if (unsafeWindow.interAudio.cbs.some(inter => (v = inter.call(this, ...args)))) throw v;
				} //ctor
			};
		else unsafeWindow.Audio = window.Audio = Audio = unsafeWindow.interAudio.interOrig;
		
		return Audio;
	}; //interAudio
}

/**
 * Binds to Document.createElement
 * 
 * @since 9/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interMake) {
	unsafeWindow.interMake = function interMake(bind = true) {
		if ((bind && unsafeWindow.interMake.bound) || !(bind || unsafeWindow.interMake.bound)) return Document.prototype.createElement;
		
		unsafeWindow.interMake.bound = bind;
		if (!unsafeWindow.interMake.interOrig) unsafeWindow.interMake.interOrig = Document.prototype.createElement;
		
		if (bind) Document.prototype.createElement = function createElement(...args) {
				let v;
				
				if (unsafeWindow.interMake.cbs.some(inter => (v = inter.call(this, ...args)))) return v;
				
				return this ? unsafeWindow.interMake.interOrig.call(this, ...args) : unsafeWindow.interMake.interOrig(...args);
			};
		else Document.prototype.createElement = unsafeWindow.interMake.interOrig;
		
		return Document.prototype.createElement;
	}; //interMake
}

/**
 * Binds to setInterval.
 * 
 * @since 15/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interInter) {
	unsafeWindow.interInter = function interInter(bind = true) {
		if ((bind && unsafeWindow.interInter.bound) || !(bind || unsafeWindow.interInter.bound)) return setInterval;
		
		unsafeWindow.interInter.bound = bind;
		if (!unsafeWindow.interInter.interOrig) unsafeWindow.interInter.interOrig = setInterval;
		
		if (bind) unsafeWindow.setInterval = setInterval = function setInterval(...args) {
				let v;
				
				if (unsafeWindow.interInter.cbs.some(inter => (v = inter.call(this, ...args)))) return v;
				
				return this ? unsafeWindow.interInter.interOrig.call(this, ...args) : unsafeWindow.interInter.interOrig(...args);
			};
		else unsafeWindow.setInterval = setInterval = unsafeWindow.interInter.interOrig;
		
		return setInterval;
	}; //interInter
}
/**
 * Binds to setTimeout.
 * 
 * @since 15/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interTime) {
	unsafeWindow.interTime = function interTime(bind = true) {
		if ((bind && unsafeWindow.interTime.bound) || !(bind || unsafeWindow.interTime.bound)) return setTimeout;
		
		unsafeWindow.interTime.bound = bind;
		if (!unsafeWindow.interTime.interOrig) unsafeWindow.interTime.interOrig = setTimeout;
		
		if (bind) unsafeWindow.setTimeout = setTimeout = function setTimeout(...args) {
				let v;
				
				if (unsafeWindow.interTime.cbs.some(inter => (v = inter.call(this, ...args)))) return v;
				
				return this ? unsafeWindow.interTime.interOrig.call(this, ...args) : unsafeWindow.interTime.interOrig(...args);
			};
		else unsafeWindow.setTimeout = setTimeout = unsafeWindow.interTime.interOrig;
		
		return setTimeout;
	}; //interTime
}

/**
 * Binds to JSON.parse
 * 
 * @since 22/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interParse) {
	unsafeWindow.interParse = function interParse(bind = true) {
		if ((bind && unsafeWindow.interParse.bound) || !(bind || unsafeWindow.interParse.bound)) return JSON.parse;
		
		unsafeWindow.interParse.bound = bind;
		if (!unsafeWindow.interParse.interOrig) unsafeWindow.interParse.interOrig = JSON.parse;
		
		if (bind) JSON.parse = function parse(...args) {
				let v;
				
				if (unsafeWindow.interParse.cbs.some(inter => (v = inter.call(this, ...args)))) return v;
				
				return this ? unsafeWindow.interParse.interOrig.call(this, ...args) : unsafeWindow.interTime.interOrig(...args);
			};
		else JSON.parse = unsafeWindow.interParse.interOrig;
		
		return JSON.parse;
	}; //interParse
}
/**
 * Binds to JSON.stringify
 * 
 * @since 22/4/2021
 * 
 * @param {bind} key - bind or unbind
 */
if (!unsafeWindow.interStringify) {
	unsafeWindow.interStringify = function interStringify(bind = true) {
		if ((bind && unsafeWindow.interStringify.bound) || !(bind || unsafeWindow.interStringify.bound)) return JSON.stringify;
		
		unsafeWindow.interStringify.bound = bind;
		if (!unsafeWindow.interStringify.interOrig) unsafeWindow.interStringify.interOrig = JSON.stringify;
		
		if (bind) JSON.stringify = function stringify(...args) {
				let v;
				
				if (unsafeWindow.interStringify.cbs.some(inter => (v = inter.call(this, ...args)))) return v;
				
				return this ? unsafeWindow.interStringify.interOrig.call(this, ...args) : unsafeWindow.interTime.interOrig(...args);
			};
		else JSON.stringify = unsafeWindow.interStringify.interOrig;
		
		return JSON.stringify;
	}; //interStringify
}

for (const i in unsafeWindow) {
	if (i.startsWith("inter")) {
		unsafeWindow[i].cbs = [ ];
		unsafeWindow[i].add = (function add(inter, idx, once = true) {
			if (inter instanceof Array) return inter.map(() => this.add(idx++, once));
			else if (typeof inter !== "function") throw "param1 must be a function.";
			else if (once && this.cbs.includes(inter)) return null;
			
			if (idx < 0) this.cbs.unshift(inter);
			else if (idx === undefined || idx === null) this.cbs.push(inter);
			else this.cbs.splice(idx, 0, inter);
			
			return this.cbs;
		}).bind(unsafeWindow[i]);
		unsafeWindow[i].remove = (function remove(inter, rep) {
			if (typeof inter === "number") return this.cbs.splice(inter, ...(rep ? [ 1, rep ] : [ 1 ]));
			else if (this.cbs.includes(inter))
				return this.cbs.splice(this.cbs.findIndex(inter), 1, ...(rep ? [ 1, rep ] : [ 1 ]));
			else if (inter === undefined || inter === null) return this.cbs.splice(0, ...(rep ? [ this.cbs.length, rep ] : [ this.cbs.length ]));
			
			return false;
		}).bind(unsafeWindow[i]);
	}
}

/**
 * A better Wrapper for Proxy
 * 
 * @since 28/5/2021
 */
if (!unsafeWindow._Binder) unsafeWindow._Binder = class Binder {
	
	constructor(target) {
		this.cbs = [ ];
		
		return new Proxy(target, this);
	} //ctor
	
	static bind(...args) {
		return new Binder(...args);
	} //bind
	
	register(handle, index) {
		if (!this.cbs.includes(handle)) {
			if (index) return this.cbs.splice(index, 0, handle) || this;
			else return this.cbs.push(handle) || this;
		}
		
		return this;
	} //register
	
	unregister(handle, replace) {
		if (typeof handle == "number") handle = this.cbs[handle];
		if (typeof replace == "number") replace = this.cbs[replace];
		
		if (this.cbs.includes(handle)) {
			if (replace) {
				if (this.cbs.includes(replace)) this.unregister(replace);
				
				return this.cbs.splice(this.cbs.findIndex(h => h == handle), 1, replace) || this;
			} else return this.cbs.splice(this.cbs.findIndex(h => h == handle), 1) || this;
		}
		
		return this;
	} //unregister
	
	callback(target, d1 = target, d2 = d1, rcv = d2) {
		let ret = false;
		
		for (const cb of this.cbs)
			if (ret = cb(target, d1, d2, rcv)) return ret;
		
		return false;
	} //callback
	
	apply(target, thisArg, argumentsList) {
		let ret;
		
		if (!(ret = this.callback(target, thisArg, argumentsList)))
			return Reflect.apply(target, thisArg, argumentsList);
		
		return ret;
	} //apply
	
	construct(target, argumentsList, newTarget) {
		let ret;
		
		if (!(ret = this.callback(target, argumentsList, newTarget)))
			return Reflect.construct(target, argumentsList, newTarget);
		
		return ret;
	} //construct
	
	defineProperty(target, property, descriptor) {
		let ret;
		
		if (!(ret = this.callback(target, property, descriptor)))
			return Reflect.construct(target, argumentsList, newTarget);
		
		return ret;
	} //defineProperty
	
	deleteProperty(target, property) {
		let ret;
		
		if (!(ret = this.callback(target, property)))
			return Reflect.deleteProperty(target, property);
		
		return ret;
	} //deleteProperty
	
	get(target, property, receiver) {
		let ret;
		
		if (!(ret = this.callback(target, property, receiver)))
			return Reflect.get(target, property, receiver);
		
		return ret;
	} //get
	
	getOwnPropertyDescriptor(target, property) {
		let ret;
		
		if (!(ret = this.callback(target, property)))
			return Reflect.getOwnPropertyDescriptor(target, property);
		
		return ret;
	} //getOwnPropertyDescriptor
	
	getPrototypeOf(target) {
		let ret;
		
		if (!(ret = this.callback(target)))
			return Reflect.getPrototypeOf(target);
		
		return ret;
	} //getPrototypeOf
	
	has(target, property) {
		let ret;
		
		if (!(ret = this.callback(target, property)))
			return Reflect.has(target, property);
		
		return ret;
	} //has
	
	isExtensible(target) {
		let ret;
		
		if (!(ret = this.callback(target)))
			return Reflect.isExtensible(target);
		
		return ret;
	} //isExtensible
	
	ownKeys(target) {
		let ret;
		
		if (!(ret = this.callback(target)))
			return Reflect.ownKeys(target);
		
		return ret;
	} //ownKeys
	
	preventExtensions(target) {
		let ret;
		
		if (!(ret = this.callback(target)))
			return Reflect.preventExtensions(target);
		
		return ret;
	} //preventExtensions
	
	set(target, property, value, receiver) {
		let ret;
		
		if (!(ret = this.callback(target, property, value, receiver)))
			return Reflect.set(target, property, value, receiver);
		
		return ret;
	} //set
	
	setPrototypeOf(target, prototype) {
		let ret;
		
		if (!(ret = this.callback(target, prototype)))
			return Reflect.setPrototypeOf(target, prototype);
		
		return ret;
	} //setPrototypeOf
	
} //Binder

if (typeof HTMLCollection != "undefined" && !HTMLCollection.prototype.forEach) HTMLCollection.prototype.forEach = Array.prototype.forEach;
if (typeof HTMLCollection != "undefined" && !HTMLCollection.prototype.filter) HTMLCollection.prototype.filter = Array.prototype.filter;
if (typeof HTMLCollection != "undefined" && !HTMLCollection.prototype.find) HTMLCollection.prototype.find = Array.prototype.find;
if (typeof HTMLCollection != "undefined" && !HTMLCollection.prototype.findIndex) HTMLCollection.prototype.find = Array.prototype.findIndex;
if (typeof HTMLCollection != "undefined" && !HTMLCollection.prototype.findAll) HTMLCollection.prototype.findAll = Array.prototype.findAll;
if (typeof HTMLCollection != "undefined" && !HTMLCollection.prototype.some) HTMLCollection.prototype.some = Array.prototype.some;
if (typeof HTMLCollection != "undefined" && !HTMLCollection.prototype.every) HTMLCollection.prototype.every = Array.prototype.every;
if (typeof HTMLCollection != "undefined" && !HTMLCollection.prototype.splice) HTMLCollection.prototype.splice = Array.prototype.splice;
if (!Array.prototype.shuffle) (HTMLCollection || Array).prototype.shuffle = Array.prototype.shuffle = function shuffle() {
	let i = this.length;
	
	if (!i) return this;
	
	while (--i) {
		const j = Math.floor(Math.random() * (i + 1));
		
		[this[i], this[j]] = [this[j], this[i]];
	}
	
	return this;
}; //shuffle
