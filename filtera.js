// ==UserScript==
// @name			Filtera
// @namespace		http://tampermonkey.net/
// @homepage		https://greasyfork.org/scripts/427124-filtera
// @updateURL		https://greasyfork.org/scripts/427124-filtera/code/Filtera.js
// @installURL		https://greasyfork.org/scripts/427124-filtera/code/Filtera.js
// @downloadURL		https://greasyfork.org/scripts/427124-filtera/code/Filtera.js
// @version			0.1
// @description		A Wrapper for CSS filter property.
// @defaulticon		
// @author			V. H.
// @grant			unsafeWindow
// @require			https://greasyfork.org/scripts/419588-uniq/code/UniQ.js
// @compatible		Chrome
// @license			AFL-3.0
// ==/UserScript==

/**
 * property - propertyr - propertyl
 */

"use strict";

const SYMS = {
	HTMLM: {
		_id: Symbol("#_id"),
		_idc: Symbol("#_idc"),
		_idcnt: Symbol("#_idcnt")
	}
};

class FLT {
	
	constructor(wrp, cb) {
		this.htmlmap = new _FLT.HTMLM(this);
		
		this.root = document.createElement("form");
		this.root.id = "_FLT" + this.htmlmap.id;
		this.root.classList.add("_FLT");
		this.root.setAttribute("novalidate", "");
		this.root.onsubmit = function submit(e) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			
			return false;
		};
		
		this.blur		= 0;
		this.brightness	= 100;
		this.contrast	= 100;
		this.grayscale	= 0;
		this.hueRotate	= 0;
		this.invert		= 0;
		this.opacity	= 100;
		this.saturate	= 100;
		this.sepia		= 0;
		
		this.wrp = wrp;
		this.cb = cb;
		
		this.lay();
		
		if (this.wrp) this.wrp.style.filter = this.filter;
	} //ctor
	
	static init(...args) {
		return new _FLT(...args);
	} //init
	
	parseFilter(str = this.filter) {
		let farr = str.split(' ');
		
		for (const f of farr) {
			const val = f.replace(/^\w+\(|(?:%|deg|px)?\);?$/ig, ''),
				prop = f.replace(/^(\w+)\(.*$/ig, "$1");
			
			Object.entries(this.htmlm).filter(m => m[0] == prop).forEach(m => {
				m[1].value = val;
				
				if (this.htmlm[prop + 'r']) this.htmlm[prop + 'r'].value = val;
				
				this[prop] = val;
			});
		}
		
		return this.notify();
	} //parseFilter
	
	addTo(elm) {
		if (!(elm instanceof HTMLElement)) throw "Parent Element is corrupted";
		
		elm.appendChild(this.root);
		
		return this;
	} //addTo
	
	lay(root = this.root) {
		if (root instanceof HTMLElement) {
			for (const prop in this.htmlmap) {
				if (prop.endsWith('l') || prop.endsWith('r') ||
					!(this.htmlmap[prop] instanceof HTMLElement) ||
					root.contains(this.htmlmap[prop])) continue;
				
				if (this.htmlmap[prop + 'l'] instanceof HTMLElement) root.appendChild(this.htmlmap[prop + 'l']);
				root.appendChild(this.htmlmap[prop]);
				if (this.htmlmap[prop + 'r'] instanceof HTMLElement) root.appendChild(this.htmlmap[prop + 'r']);
				root.appendChild(document.createElement("br"));
			}
		} else throw "Root Element is corrupted";
		
		return this;
	} //lay
	
	get filter() {
		return `blur(${this.blur}px) brightness(${this.brightness}%) contrast(${this.contrast}%) grayscale(${this.grayscale}%) hue-rotate(${this.hueRotate}deg) invert(${this.invert}%) opacity(${this.opacity}%) saturate(${this.saturate}%) sepia(${this.sepia}%)`;
	} //filter
	
	get htmlm() {
		return this.htmlmap;
	} //htmlm
	
	notify(prop, val) {
		let bypass = false;
		
		if (prop) this[prop] = val;
		
		if (this.cb) bypass = this.cb(prop, val);
		if (!bypass && this.wrp) this.wrp.style.filter = this.filter;
		
		return this;
	} //notify
	
};

FLT.HTMLM = class HTMLM {
	
	constructor(parent) {
		if (typeof document == "undefined" || typeof document.createElement == "undefined") throw "Enviromental Error - Improper Global APIs";
		
		this.id = _FLT.HTMLM.id;
		
		this.blur			= FLT.HTMLM.inp("number", 0, null, 1, null, 1, 0, /^\d+$/i, "Blur", "Blur >= 0px", "blur"); //>=0px =0px
		this.blurl			= FLT.HTMLM.lab(this.blur.id = "_flt_blur" + this.id, "Blur");
		this.brightness		= FLT.HTMLM.inp("number", 0, null, 1, null, 1, 100, /^\d+$/i, "Brightness", "Brightness >= 0%", "brightness"); //>=0% =1
		this.brightnessl	= FLT.HTMLM.lab(this.brightness.id = "_flt_brightness" + this.id, "Brightness");
		this.contrast		= FLT.HTMLM.inp("number", 0, null, 1, null, 1, 100, /^\d+$/i, "Contrast", "Contrast >= 0%", "contrast"); //>=0% =1
		this.contrastl		= FLT.HTMLM.lab(this.contrast.id = "_flt_contrast" + this.id, "Contrast");
		this.grayscale		= FLT.HTMLM.inp("number", 0, 100, 1, 3, 1, 0, /^(1\d{2}|\d{1,2})$/i, "Grayscale", "100% >= Grayscale >= 0%", "grayscale"); //>=0%<=100% =0
		this.grayscaler		= FLT.HTMLM.inp("range", 0, 100, 1, 3, 1, 0, /^(1\d{2}|\d{1,2})$/i, "Grayscale", "100% >= Grayscale >= 0%", "grayscale");
		this.grayscalel		= FLT.HTMLM.lab(this.grayscale.id = "_flt_grayscale" + this.id, "Grayscale");
		this.hueRotate		= FLT.HTMLM.inp("number", 0, 359, 1, 3, 1, 0, /^(3[0-5]\d|[1-2]\d{2}|\d{1,2})$/i, "Hue-Rotate", "359deg >= Hue-Rotate >= 0deg", "hueRotate"); //>=0<=359deg =0deg
		this.hueRotater		= FLT.HTMLM.inp("range", 0, 359, 1, 3, 1, 0, /^(3[0-5]\d|[1-2]\d{2}|\d{1,2})$/i, "Hue-Rotate", "359deg >= Hue-Rotate >= 0deg", "hueRotate");
		this.hueRotatel		= FLT.HTMLM.lab(this.hueRotate.id = "_flt_hueRotate" + this.id, "Hue-Rotate");
		this.invert			= FLT.HTMLM.inp("number", 0, 100, 1, 3, 1, 0, /^(1\d{2}|\d{1,2})$/i, "Invert", "100% >= Invert >= 0%", "invert"); //>=0<=100% =0
		this.invertr		= FLT.HTMLM.inp("range", 0, 100, 1, 3, 1, 0, /^(1\d{2}|\d{1,2})$/i, "Invert", "100% >= Invert >= 0%", "invert");
		this.invertl		= FLT.HTMLM.lab(this.invert.id = "_flt_invert" + this.id, "Invert");
		this.opacity		= FLT.HTMLM.inp("number", 0, 100, 1, 3, 1, 100, /^(1\d{2}|\d{1,2})$/i, "Opacity", "100% >= Opacity >= 0%", "opacity"); //>=0<=100% =1
		this.opacityr		= FLT.HTMLM.inp("range", 0, 100, 1, 3, 1, 100, /^(1\d{2}|\d{1,2})$/i, "Opacity", "100% >= Opacity >= 0%", "opacity");
		this.opacityl		= FLT.HTMLM.lab(this.opacity.id = "_flt_opacity" + this.id, "Opacity");
		this.saturate		= FLT.HTMLM.inp("number", 0, null, 1, null, 1, 100, /^\d+$/i, "Saturate", "100% >= Saturate >= 0%", "saturate"); //>=0 =1
		this.saturatel		= FLT.HTMLM.lab(this.saturate.id = "_flt_saturate" + this.id, "Saturate");
		this.sepia			= FLT.HTMLM.inp("number", 0, 100, 1, 3, 1, 0, /^(1\d{2}|\d{1,2})$/i, "Sepia", "100% >= Sepia >= 0%", "sepia"); //>=0%<=100% =0
		this.sepiar			= FLT.HTMLM.inp("range", 0, 100, 1, 3, 1, 0, /^(1\d{2}|\d{1,2})$/i, "Sepia", "100% >= Sepia >= 0%", "sepia");
		this.sepial			= FLT.HTMLM.lab(this.sepia.id = "_flt_sepia" + this.id, "Sepia");
		
		this.hueRotate.setAttribute("data-wraparound", "");
		this.hueRotater.setAttribute("data-wraparound", "");
		
		this.parent = parent;
		
		this.setup();
	} //ctor
	
	setup(propl = this) {
		for (const prop in propl) {
			let hasinp = false;
			
			if (prop.endsWith('l') || !(propl[prop] instanceof HTMLElement)) continue;
			else if ((!prop.endsWith('r') && propl[prop + 'r']) || (prop.endsWith('r') && propl[prop.replace(/r$/, '')])) hasinp = true;
			
			propl[prop].onchange = e => {
				if (!e.target) return false;
				
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				
				if ((!e.target.min.length || Number(e.target.value) >= e.target.min) &&
					(!e.target.max.length || Number(e.target.value) <= e.target.max)) {
					(propl[e.target.name] || {}).value = (propl[e.target.name + 'r'] || {}).value = e.target.value;
					this.parent.notify(e.target.name, e.target.value);
				} else return false;
			};
			
			if (hasinp) propl[prop].oninput = propl[prop].onchange;
			
			propl[prop].addEventListener("wheel", m => {
				if (!(m.target && typeof m.deltaY != "undefined")) return false;
				
				m.preventDefault();
				m.stopPropagation();
				m.stopImmediatePropagation();
				
				if ((!m.target.min.length || (m.target.value || 0) - Math.sign(m.deltaY) * (m.target.step || 1) >= m.target.min) &&
					(!m.target.max.length || (m.target.value || 0) - Math.sign(m.deltaY) * (m.target.step || 1) <= m.target.max)) {
					(propl[m.target.name] || { value: 0 }).value = (propl[m.target.name + 'r'] || { value: 0 }).value = m.target.value - Math.sign(m.deltaY) * (m.target.step || 1);
					this.parent.notify(m.target.name, m.target.value);
				} else if (m.target.hasAttribute("data-wraparound")) {
					let v = m.target.value - Math.sign(m.deltaY) * (m.target.step || 1);
					
					v %= Number(m.target.max) + 1;
					if (v < m.target.min) v = (Number(m.target.max) + 1) - Math.abs(v - m.target.min);
					
					(propl[m.target.name] || { value: 0 }).value = (propl[m.target.name + 'r'] || { value: 0 }).value = v;
					
					this.parent.notify(m.target.name, m.target.value);
				} else return false;
			}, {
				passive: false,
				capture: true
			});
		}
		
		return propl;
	} //setup
	
	static get id() {
		return _FLT.HTMLM[SYMS.HTMLM._idcnt].next().value;
	} //id
	
	static *[SYMS.HTMLM._idc]() {
		while (true) yield _FLT.HTMLM[SYMS.HTMLM._id]++;
	} //id
	
};
FLT.style = `
._FLT label::after {
	content: ": "
}
._FLT label {
	user-select: none;
}
._FLT {
	box-sizing: border-box;
	display: block flex;
	flex-flow: column wrap;
	background-position: center;
	background-size: 100%;
	background-repeat: no-repeat;
	text-align: center;
	vertical-align: middle;
	margin: 0;
	padding: auto;
	resize: both;
	overflow: auto;
	overscroll-behavior: contain;
	scrollbar-width: thin;
	scrollbar-gutter: stable;
	z-index: 9999;
}
`;
FLT.defaults = `blur(0px) brightness(100%) contrast(100%) grayscale(0%) hue-rotate(0deg) invert(0%) opacity(100%) saturate(100%) sepia(0%)`;

Object.defineProperty(FLT.HTMLM, SYMS.HTMLM._id, {
	value: 0,
	enumerable: false,
	configurable: false,
	writable: true,
});
Object.defineProperty(FLT.HTMLM, SYMS.HTMLM._idcnt, {
	value: FLT.HTMLM[SYMS.HTMLM._idc](),
	enumerable: false,
	configurable: false,
	writable: false,
});

FLT.HTMLM.inp = (type = "number", min = 0, max, minlen = 1, maxlen = 6, step = 1, value = 0, pattern = /^\d+$/i, placeholder, title, name) => {
	let ret = document.createElement("input");
	
	if (type)				ret.type = type;
	if (min !== null)		ret.min = min;
	if (minlen !== null)	ret.minlen = minlen;
	if (max !== null)		ret.max = max;
	if (maxlen !== null)	ret.maxlen = maxlen;
	if (step !== null)		ret.step = step;
	if (value !== null)		ret.value = value;
	if (pattern)			ret.pattern = pattern;
	if (placeholder)		ret.placeholder = placeholder;
	if (title)				ret.title = title;
	if (name)				ret.name = name;
	
	ret.size = 6;
	
	return ret;
};
FLT.HTMLM.lab = (fr, text) => {
	let ret = document.createElement("label");
	
	if (text) ret.innerHTML = text;
	if (fr) ret.for = fr;
	
	return ret;
};

if (typeof unsafeWindow != "undefined") unsafeWindow._FLT = FLT;
if (typeof window != "undefined") window._FLT = FLT;

if (typeof GM_addStyle != "undefined") GM_addStyle(_FLT.style);
