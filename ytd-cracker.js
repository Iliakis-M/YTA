// ==UserScript==
// @name			YTDC
// @namespace		https://greasyfork.org/users/723559-valen-h
// @homepage		https://greasyfork.org/scripts/423445-ytdc/
// @updateURL		https://greasyfork.org/scripts/423445-ytdc/code/YTDC.js
// @installURL		https://greasyfork.org/scripts/423445-ytdc/code/YTDC.js
// @downloadURL		https://greasyfork.org/scripts/423445-ytdc/code/YTDC.js
// @version			0.1
// @description		This tool is able to decipher YouTube signatures.
// @author			V. H.
// @license			AFL-3.0
// @grant			none
// ==/UserScript==
/**
 * @since 17/3/2021
 * @file ytd-cracker.js
 */

class _YTD {
	
	_xml = new XMLHttpRequest();
	_base = "";
	_decipher = null;
	static decreg = /\w{1,3}?\s*?=\s*?\w{1,3}?\.split\(\s*?["']{2}?\s*?\)\W*?(?:\w{1,3}?\.\w{1,3}?\(\s*?\w{1,3}?\s*?,\s*?\d+?\s*?\).*?\W*?)*?.*?\w{1,3}?\.join\(\s*?["']{2}?\s*?\)/m;
	static nsreg = "var\\s@1@\\s*?=\\s*?\\{.*?\\};";
	
	constructor(...a) {
		this._xml.overrideMimeType("text/javascript");
		this._xml.onloadend = e => {
			if (this._xml.responseText)
				this._base = this._xml.responseText;
		};
		
		if (a.length) this.init(...a);
	} //ctor
	
	static _init(...a) {
		return new _YTD(...a);
	} //_init
	
	async init(a, b) {
		await this.getPlayer(a);
		this.parse(b);
		
		return this;
	} //init
	
	async getPlayer(scr = Array.from(document.scripts).find(scr => scr.src && scr.src.endsWith("base.js")) || "https://www.youtube.com/s/player/223a7479/player_ias.vflset/en_US/base.js") {
		if (!scr) throw "Bad Source";
		
		if (scr instanceof HTMLScriptElement) scr = scr.src;
		
		this._xml.open("GET", scr, false);
		this._xml.send();
		
		return this._xml.responseText;
	} //getPlayer
	
	parse(base = this._base) {
		if (!base) throw "Bad Source";
		
		const decstr = (base.trim().match(_YTD.decreg) || [ "'not-found';" ])[0].trim(),
			comms = decstr.split(/[;\n]/gmi).map(a => a.trim()),
			ns = comms.length > 2 ? comms[1].split('.')[0].trim() : "not-found",
			nsreg = new RegExp(_YTD.nsreg.replace(/@1@/g, ns), "ms"),
			nsstr = (base.trim().match(nsreg) || [ "'not-found';" ])[0].replace(/\n/g, '').trim(),
			dec = `${nsstr}${decstr}`;
		
		this._decipher = new Function(comms[0].split('=')[0].trim(), dec);
		
		return { decstr, comms, ns, nsreg, nsstr, dec };
	} //parse
	
	decipher(sig) {
		if (!sig) throw "Bad Sig";
		else if (!this._decipher) throw "Bad Decipher";
		
		return this._decipher(sig);
	} //decipher
	
	process(cip) {
		if (!cip) cip = ytInitialPlayerResponse ? ytInitialPlayerResponse.streamingData ? ytInitialPlayerResponse.streamingData.formats[ytInitialPlayerResponse.streamingData.formats.length - 1].signatureCipher : "" : "";
		
		cip = cip.split('&').map(decodeURIComponent);
		
		return `${cip[2].slice(4)}&${cip[1].slice(3)}=${this.decipher(cip[0].slice(2))}`;
	} //process
	
};

_ytd = _YTD._init();
