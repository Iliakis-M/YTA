// ==UserScript==
// @name			Youtube Automation
// @namespace		https://greasyfork.org/scripts?set=439787
// @homepage		https://greasyfork.org/scripts/419583-youtube-automation
// @updateURL		https://greasyfork.org/scripts/419583-youtube-automation/code/Youtube%20Automation.user.js
// @installURL		https://greasyfork.org/scripts/419583-youtube-automation/code/Youtube%20Automation.user.js
// @downloadURL		https://greasyfork.org/scripts/419583-youtube-automation/code/Youtube%20Automation.user.js
// @version			2.2.5
// @description		Automatically cancels dialogs and removes Ads, making YouTube friendlier and lightweight.
// @author			V. H.
// @defaulticon		https://www.google.com/s2/favicons?domain=youtube.com
// @include			/^.{3,5}:\/\/(.+?\.)?youtu\.?be(.com)?(?=\/)/
// @grant			GM_log
// @grant			GM_addStyle
// @grant			unsafeWindow
// @grant			onurlchange
// @grant			GM_setValue
// @grant			GM_getValue
// @grant			GM_deleteValue
// @grant			GM_addElement
// @grant			GM_download
// @grant			GM_registerMenuCommand
// @require			https://greasyfork.org/scripts/419588-uniq/code/UniQ.js
// @require			https://greasyfork.org/scripts/423445-ytdc/code/YTDC.js
// @require			https://greasyfork.org/scripts/427124-filtera/code/Filtera.js
// @connect			self
// @run-at			document-body
// @compatible		Chrome
// @license			AFL-3.0
// @noframes		
// ==/UserScript==

/**
 * Trigger the Panel from Tampermonkey menu to access the Utilities.
 * 
 * Disable the CSS if you use white theme.
 * 
 * This is an AdBlock filter to turn off profile pictures in live chat, and thus, reduce network usage and cpu:
 * 	||yt4.ggpht.com/ytc$image,media,other,object,xmlhttprequest
 * 
 * This is an AdBlock rule to turn off livechat completely:
 * 	||youtube.com/live*$script,websocket,other,media,object,xmlhttprequest,ping,font,stylesheet,image
 * 
 * Cookies to Block:
 * [*.]doubleclick.net - Ads & Tracking of Google
 * 
 * 
 * YouTube itag: https://gist.github.com/sidneys/7095afe4da4ae58694d128b1034e01e2
 */

 void async function _script() {
	"use strict";
	
	var _clean, _redir, loc = new URL(location.href);
	
	unsafeWindow.google_ad_status = unsafeWindow.ytautoconf_count = 0;
	unsafeWindow._time = -1;
	
	GM_registerMenuCommand("Panel", panel, "P");
	
	GM_log("YT Automation loaded.");
	
	//Get embedded player
	unsafeWindow._getPlayer = function _getPlayer() {
		let p;
		
		if (unsafeWindow.videoPlayer && !unsafeWindow.videoPlayer.setPlaybackQuality) {
			for (const i in unsafeWindow.videoPlayer) {
				if (unsafeWindow.videoPlayer[i] && unsafeWindow.videoPlayer[i].setPlaybackQuality) {
					p = unsafeWindow.videoPlayer[i];
					break;
				}
			}
		} else {
			p = document.querySelector("#movie_player, #movie_player-flash, #movie_player-html5, #movie_player-html5-flash") ||
				document.getElementsByClassName("html5-video-player")[0];
		}
		
		return ((unsafeWindow.videoPlayer = unsafeWindow.videoPlayer || p), p);
	}; //_getPlayer
	
	await sleep(500);
	
	//Skin - Disable on white theme
	GM_addStyle(`
	/* V. H. ~ Youtube Automation */
	::-webkit-scrollbar {
		min-width: 10px;
		width: 15px;
		max-width: 20px;
		opacity: .8;
		position: sticky;
		right: 0;
		transition: width 1s, opacity 1s;
		z-index: 999;
		cursor: default;
	}
	::-webkit-scrollbar:hover, ::-webkit-scrollbar:focus {
		opacity: 1;
	}
	::-webkit-scrollbar-track {
		box-shadow: inset 0 0 3px grey;
		border-radius: 5px;
		cursor: default;
	}
	::-webkit-scrollbar-thumb {
		background-color: rgba(150, 150, 150, .8);
		border-radius: 5px;
		box-shadow: inset 0 0 2px 1px lightgray;
		cursor: default;
	}
	::-webkit-scrollbar-button {
		background-color: rgba(120, 120, 120, .8);
	}
	::-webkit-resizer, ::-webkit-scrollbar-corner {
		background-color: rgba(160, 160, 160, .7);
		border-radius: 5px;
	}
	::-webkit-input-placeholder {
		color: rgba(100, 100, 200, .9);
	}
	::selection {
		background-color: rgba(50, 50, 200, .8);
		color: rgb(200, 200, 50);
	}
	
	:paused {
		border: 2px dotted rgba(50, 200, 50, .8);
	}
	video {
		cursor: cell;
	}
	img, video, svg, paper-button, tp-yt-paper-button {
		border-radius: calc(2px + 2vmin);
		filter: drop-shadow(1px 1px 1px rgba(200, 100, 100, .3));
	}
	paper-button, tp-yt-paper-button {
		transition: box-shadow 1s;
	}
	yt-icon-button, paper-button, tp-yt-paper-button {
		box-shadow: 0 0 1px 1px rgba(120, 120, 120, .2);
		padding: 2px;
	}
	paper-button:hover, yt-icon-button:hover {
		box-shadow: 0 0 2px 2px rgba(130, 130, 130, .4);
	}
	#country-code::after {
		content: " - Modded";
	}
	#input, #search, #contenteditable-textarea, input, textarea {
		caret-color: aquamarine;
	}
	#movie_player {
		resize: both;
	}
	#columns, #primary, #secondary, #contents {
		background-image: radial-gradient(circle closest-side at center, #303030 10%, #101010 110%);
		background-attachment: fixed;
		background-repeat: no-repeat;
		background-blend-mode: color-dodge;
		background-position: center;
		background-size: cover;
		padding: 5px 10px 0 10px;
		margin: 5px;
	}
	ytd-watch-next-secondary-results-renderer > #contents, ytd-watch-next-secondary-results-renderer > #items, .ytd-comments #contents {
		overflow-y: auto;
		max-height: 76vh;
		border: 2px groove rgba(150, 150, 150, .4);
		resize: both;
		border-radius: 10px;
		scrollbar-gutter: stable;
		overscroll-behavior: contain;
		scrollbar-width: thin;
	}
	yt-formatted-string, span, p {
		color: #CCCCCC;
		text-shadow: -1px -1px 1px rgba(130, 130, 130, .3) !important;
		padding: auto;
	}
	
	#_YTA_Top {
		bottom: 3vmin;
		right: 3vmin;
	}
	#_YTA_Tool {
		top: 1vmin;
		left: 40vmin;
	}
	#_YTA_Tool, #_YTA_Top {
		position: fixed;
		min-width: 20px;
		width: 3vmax;
		max-width: 50px;
		min-height: 20px;
		height: 3vmax;
		max-height: 50px;
		border-radius: 50%;
		box-shadow: 1px 1px 1px 1px rgba(150, 150, 150, .5);
		transition: all 500ms;
		opacity: .5;
		z-index: 9999;
		box-sizing: border-box;
		background-image: radial-gradient(circle closest-side at center, rgba(200, 200, 200, .85), rgba(50, 50, 50, .7));
		background-position: center;
		background-size: 100%;
		color: rgb(100, 100, 50);
		text-shadow: 1px 1px 1px rgba(100, 100, 50, .9);
		text-align: center;
		vertical-align: middle;
		line-height: 100%;
		padding: 1px;
		cursor: pointer;
	}
	#_YTA_Panel {
		position: fixed;
		top: 50px;
		border-radius: 2vmin;
		background-image: radial-gradient(circle farthest-side at center, rgba(220, 220, 220, .8), rgba(100, 100, 100, .6));
		background-position: center;
		background-size: 100%;
		background-repeat: no-repeat;
		text-align: center;
		vertical-align: middle;
		margin: 0;
		padding: auto;
		resize: both;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		scrollbar-width: thin;
		scrollbar-gutter: stable;
		z-index: 9999;
		opacity: .6;
		box-sizing: border-box;
		transition: 500ms opacity;
		cursor: pointer;
		color: rgb(15, 15, 15);
		display: block flex;
		flex-flow: column wrap;
		align-items: baseline;
		align-content: center;
		justify-content: space-around;
		min-height: 20vh;
		max-height: 70vh;
		max-width: 90vw;
		min-width: 20vw;
	}
	#_YTA_Panel:hover {
		opacity: .85;
		box-shadow: 1px 1px 1px lightgray;
	}
	#_YTA_Panel fieldset {
		margin: 3px;
		padding: 1px;
		height: auto;
		width: auto;
		border: 1px ridge black;
		font-size: 1.05em;
		cursor: default;
		overflow: auto;
		border-radius: 5px;
	}
	#_YTA_Panel form {
		display: block flex;
		flex-flow: column wrap;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		scrollbar-width: thin;
		scrollbar-gutter: stable;
		text-align: center;
		vertical-align: middle;
		margin: 0;
		padding: auto;
		resize: both;
		border-radius: 5px;
		align-items: baseline;
		align-content: center;
		justify-content: space-around;
	}
	#_YTA_Panel form * {
		margin: auto;
		padding: 1px;
		border-radius: 1vmin;
		text-shadow: -1px 0 rgba(100, 100, 100, .5);
	}
	#_YTA_Panel form *:hover {
		border-radius: 1vmin;
		text-shadow: -1px 0 gray;
		box-shadow: 1px 1px 1px rgba(100, 100, 100, .7);
	}
	#_YTA_Panel label {
		user-select: none;
	}
	#_YTA_Panel legend {
		user-select: none;
		touch-callout: none;
		pointer-events: none;
	}
	#_YTA_Panel label::after {
		content: ": ";
	}
	#_YTA_Top:hover, #_YTA_Tool:hover {
		box-shadow: 0 0 2px 2px rgba(150, 150, 150, .7);
		opacity: .8;
		border-radius: 35%;
		text-shadow: 1px 1px 2px rgba(110, 110, 60, .8);
	}
	#_YTA_Top:active, #_YTA_Tool:active {
		opacity: .9;
		border-radius: 40%;
		background-image: radial-gradient(circle closest-side at center, rgba(230, 230, 230, .9), rgba(80, 80, 80, .7));
	}
	._YTA_hidden {
		visibility: hidden !important;
		display: none !important;
		width: 0 !important;
		height: 0 !important;
		opacity: 0 !important;
		pointer-events: none !important;
		user-select: none !important;
	}
	/* */
	`);
	
	await unsafeWindow.try_max(() => document.readyState === "complete" && document.body, 4, 500);
	
	const banlist = [ "Video paused. Continue watching?", "Keep your music and videos playing with YouTube Premium." ],
		p = await unsafeWindow.try_max(_setup, 4, 500),
		hide = () => unsafeWindow.do_if(document.querySelectorAll("paper-button#button, tp-yt-paper-button#button"), btns => {
			for (const btn of btns) {
				if (btn.innerText.includes("HIDE CHAT")) {
					setTimeout(() => {
						btn.click();
						
						GM_log("Chat hidden.");
					}, 2000);
					
					return true;
				} else if (/NO,? THANKS/i.test(btn.innerText)) {
					btn.click();
					
					GM_log("Dismissed.");
				}
			}
			
			return false;
		}),
		makepanel = () => unsafeWindow.do_if(!document.getElementById("_YTA_Panel") && unsafeWindow.videoPlayer, p => {
			let diag = document.createElement("dialog"), //root
				hidepanel = document.createElement("button"), //hide
				rreload = document.createElement("button"), //reload
				ssave = document.createElement("button"), //download
				filtereset = document.createElement("button"), //reset filters
				field = document.createElement("fieldset"), //utils
				fieldl = document.createElement("legend"), //utils label
				filter = document.createElement("fieldset"), //filters
				filterl = document.createElement("legend"), //filters label
				nullish = document.createElement("img"), //drag shadow
				flt = unsafeWindow.flt = _FLT.init(unsafeWindow.videoPlayer._p || unsafeWindow.videoPlayer, (prop, val) => {
					if (prop == "speed") {
						if (unsafeWindow.videoPlayer) {
							let targ = unsafeWindow.videoPlayer._p || unsafeWindow.videoPlayer;
							
							if (targ.setPlaybackRate) targ.setPlaybackRate(val);
							else targ.playbackRate = val;
						}
						
						return true;
					} else if (prop == "volume") {
						if (unsafeWindow.videoPlayer) unsafeWindow.videoPlayer.setVolume(val);
						
						return true;
					} else return false;
					
					GM_setValue("filter", flt.filter);
				}), x = 0, y = 0, drg = false,
				speed = _FLT.HTMLM.inp("number", 0.065, 3.9, 1, 3, 0.1, 0, /^\d(\.\d{1,2})?$/i, "Speed", "0.63 >= Speed >= 3.9", "speed"),
				volume = _FLT.HTMLM.inp("number", 0, 100, 1, 3, 1, 100, /^\d(\.\d{1,2})?$/i, "Volume", "0.63 >= Volume >= 3.9", "volume");
			
			speed.id = "_flt_speed" + flt.htmlmap.id;
			volume.id = "_flt_volume" + flt.htmlmap.id;
			
			Object.assign(flt.htmlm, flt.htmlm.setup({
				speed:		speed,
				speedr:		_FLT.HTMLM.inp("range", 0.065, 3.9, 1, 3, 0.1, 0, /^\d(\.\d{1,2})?$/i, "Speed", "0.63 >= Speed >= 3.9", "speed"),
				speedl:		_FLT.HTMLM.lab(speed.id, "Speed"),
				volume:		volume,
				volumer:	_FLT.HTMLM.inp("range", 0, 100, 1, 3, 1, 100, /^\d(\.\d{1,2})?$/i, "Volume", "0.63 >= Volume >= 3.9", "volume"),
				volumel:	_FLT.HTMLM.lab(volume.id, "Volume"),
			}));
			
			flt.lay();
			
			(unsafeWindow.videoPlayer._p || unsafeWindow.videoPlayer).style.filter = GM_getValue("filter", "");
			
			ssave.innerText = "Download";
			ssave.id = "_YTA_Down";
			ssave.onclick = c => {
				try {
					const ytdd = unsafeWindow.ytInitialPlayerResponse ? unsafeWindow.ytInitialPlayerResponse.streamingData.formats : null;
					
					if (ytdd && ytdd.length && ytdd[ytdd.length - 1].url) {
						open(ytdd[ytdd.length - 1].url, document.title + " - DOWNLOAD")
						.alert("Press the 3 vertical dots or right-click and select 'download'");
						GM_download({
							url: ytdd[ytdd.length - 1].url,
							name: document.title + " - DOWNLOAD",
							saveAs: true,
						});
					} else if (ytdd && ytdd.length && ytdd[ytdd.length - 1].signatureCipher) {
						open(unsafeWindow._ytd.process(), document.title + " - DOWNLOAD")
						.alert("Press the 3 vertical dots or right-click and select 'download'");
						GM_download({
							url: unsafeWindow._ytd.process(),
							name: document.title + " - DOWNLOAD",
							saveAs: true,
						});
					} else throw "Force - rel";
					
					GM_log("Download triggered");
				} catch(e) {
					console.error(e);
					GM_log("Attempting download relog...");
					alert("Retry after Reload (doesn't work [well] on livestreams)");
					
					timerel();
				}
			};
			
			field.onmousedown = m => { m.stopImmediatePropagation(); drg = false; diag.draggable = false; };
			fieldl.innerText = "YTA Panel";
			filterl.innerText = "Player Filters";
			
			diag.id = "_YTA_Panel";
			diag.draggable = false;
			diag.classList.toggle("_YTA_hidden");
			diag.onmousedown = diag.ondragstart = m => {
				if (m.offsetX >= m.target.offsetWidth - 15) return;
				
				if (m.dataTransfer) {
					m.dataTransfer.effectAllowed = m.dataTransfer.dropEffect = "move";
					m.dataTransfer.setDragImage(nullish, diag.offsetWidth / 2, diag.offsetHeight / 2);
				}
				
				x = m.offsetX;
				y = m.offsetY;
				
				drg = true;
			};
			document.body.addEventListener("mousemove", diag.ondragend = diag.ondrag = diag.onmousemove = m => {
				if (!(drg && !m.button)) return;
				
				m.preventDefault();
				
				if (m.dataTransfer) {
					m.dataTransfer.effectAllowed = m.dataTransfer.dropEffect = "move";
					m.dataTransfer.setDragImage(nullish, diag.offsetWidth / 2, diag.offsetHeight / 2);
				}
				
				diag.style.left = `${m.clientX - x}px`;
				diag.style.top = `${m.clientY - y}px`;
				
				if (m.type === "dragend") {
					drg = false;
					x = y = 0;
				}
			}, true);
			addEventListener("mouseup", document.body.onmouseup = diag.onmouseup = m => { drg = false; x = y = 0; }, true);
			
			hidepanel.innerText = "Hide Panel";
			hidepanel.onclick = e => panel();
			rreload.innerText = "Reload (maintain time)";
			rreload.onclick = e => timerel();
			filtereset.innerText = "Reset Filters";
			filtereset.onclick = e => {
				if (unsafeWindow.videoPlayer) {
					let targ = unsafeWindow.videoPlayer._p || unsafeWindow.videoPlayer;
					
					targ.style.filter = filterstr = `blur(0px) brightness(100%) contrast(100%) grayscale(0%) hue-rotate(0deg) invert(0%) opacity(100%) saturate(100%) sepia(0%)`;
					
					if (targ.setPlaybackRate) targ.setPlaybackRate(1);
					else targ.playbackRate = 1;
				}
				
				GM_setValue("filter", `blur(0px) brightness(100%) contrast(100%) grayscale(0%) hue-rotate(0deg) invert(0%) opacity(100%) saturate(100%) sepia(0%)`);
			};
			
			filter.appendChild(filterl); field.appendChild(fieldl);
			field.appendChild(hidepanel); field.appendChild(rreload); field.appendChild(filtereset);
			field.appendChild(document.createElement("br"));
			field.appendChild(ssave);
			field.appendChild(document.createElement("hr"));
			
			flt.addTo(filter); field.appendChild(filter); diag.appendChild(field);
			document.body.appendChild(diag);
			
			GM_log("_YTA_Panel created.");
			
			if (GM_getValue("sticky1", false)) {
				GM_deleteValue("sticky1");
				panel();
			}
			
			return true;
		}),
		makebtn = () => unsafeWindow.do_if(!document.getElementById("_YTA_Top") && document.body, e => {
			const btn = document.createElement("button"),
				p = document.createElement("button");
			
			p.innerText = "Tool";
			p.id = "_YTA_Tool";
			p.onclick = c => panel();
			btn.innerText = "Top";
			btn.id = "_YTA_Top";
			btn.onclick = c => {
				document.querySelectorAll("ytd-watch-next-secondary-results-renderer > #contents, ytd-watch-next-secondary-results-renderer > #items, .ytd-comments #contents").forEach(q => (q.scrollTop = 0));
				scrollTo(0, 0);
				
				GM_log("Scrolled to Top");
				
				return true;
			};
			
			document.body.appendChild(p);
			document.body.appendChild(btn);
			
			GM_log("_YTA_Top/Tool created.");
		});
	
	await unsafeWindow._ytd.init();
	
	delete unsafeWindow.ytads;
	if (unsafeWindow.yt) {
		delete unsafeWindow.yt.ads;
		delete unsafeWindow.yt.ads_;
	}
	if (unsafeWindow.ytInitialPlayerResponse) {
		delete unsafeWindow.ytInitialPlayerResponse.adPlacements;
		delete unsafeWindow.ytInitialPlayerResponse.playerAds;
	}
	
	const i = setInterval(_clean = async () => {
		unsafeWindow.try_once(hide);
		unsafeWindow.try_once(makebtn);
		unsafeWindow.try_once(makepanel);
		
		if ((unsafeWindow.videoPlayer._p || unsafeWindow.videoPlayer).style.filter) GM_setValue("filter", (unsafeWindow.videoPlayer._p || unsafeWindow.videoPlayer).style.filter);
		
		if (GM_getValue("down", false)) {
			GM_deleteValue("down");
			document.getElementById("_YTA_Down").click();
		}
		
		if (unsafeWindow.ytInitialPlayerResponse) delete unsafeWindow.ytInitialPlayerResponse.playerAds;
		if (unsafeWindow.yt) {
			delete unsafeWindow.yt.ads;
			delete unsafeWindow.yt.ads_;
			
			if (unsafeWindow.yt.www) delete unsafeWindow.yt.www.ads;
		}
		
		delete unsafeWindow.ytads;
		
		//Ad&Pause
		unsafeWindow.do_if(document.querySelectorAll("tp-yt-iron-overlay-backdrop.opened"), ally => {
			for (const al of ally) {
				GM_log("Closed Ally");
				
				al.remove();
			}
			
			if (ally.length && unsafeWindow.videoPlayer && unsafeWindow.videoPlayer.playVideo) unsafeWindow.videoPlayer.playVideo();
			
			return ally.length;
		});
		
		//Reload
		if (document.querySelector("a[href^='//support.google.com/youtube/?p=player_error']") || document.getElementsByClassName("ytp-ad-player-overlay-instream-info").length) {
			GM_log(`Reloading... ${unsafeWindow._time}`);
			
			timerel();
		}
		
		//Box Ad
		document.getElementsByClassName("ytp-ad-overlay-close-button").forEach(ad => {
			unsafeWindow.ytautoconf_count++;
			GM_log("Removed an Ad box.");
			ad.click();
		});
		
		//Home screen Ad box
		document.getElementsByTagName("ytd-display-ad-renderer").forEach(ad => {
			unsafeWindow.ytautoconf_count++;
			GM_log("Removed home Ad.");
			ad.parentNode.parentNode.remove();
		});
		
		//Ad elements
		document.getElementsByClassName("ytp-ad-module, #toast, #masthead-ad, #player-ads").forEach(ad => {
			unsafeWindow.ytautoconf_count++;
			GM_log("Removed Ad / toast.");
			ad.remove();
		});
		
		//AFK
		document.getElementsByClassName("yt-confirm-dialog-renderer").forEach(diag => {
			if (diag.innerText && banlist.includes(diag.innerText)) {
				if (diag.innerText === banlist[0]) diag.parentNode.parentNode.parentNode.querySelector("#confirm-button").click();
				else diag.parentNode.parentNode.parentNode.querySelector("#cancel-button").click();
				
				if (diag.parentNode.parentNode.parentNode) diag.parentNode.parentNode.parentNode.remove();
				else if (diag.parentNode.parentNode) diag.parentNode.parentNode.remove();
				
				unsafeWindow.ytautoconf_count++;
				GM_log(`Skipped a dialog. (${diag.innerText})`);
			}
		});
	}, 600);
	
	sleep(500).then(_clean);
	
	document.addEventListener("fullscreenchange", f => {
		unsafeWindow.do_if(document.getElementById("_YTA_Top"), t => t.classList.toggle("_YTA_hidden"));
		unsafeWindow.do_if(document.getElementById("_YTA_Tool"), t => t.classList.toggle("_YTA_hidden"));
		
		GM_log("Fullscreen toggle.");
	});
	
	addEventListener("urlchange", _redir = async u => {
		unsafeWindow.try_once.remove(hide);
		
		if (await _setup() && u.url.includes("/watch")) {
			if (unsafeWindow.ytInitialPlayerResponse && unsafeWindow.ytInitialPlayerResponse.streamingData && unsafeWindow.ytInitialPlayerResponse.streamingData.formats)
				unsafeWindow.ytInitialPlayerResponse = null;
		}
		
		unsafeWindow._time = -1;
		
		GM_log("YTRedir:  " + u.url);
	});
	
	//Video Quality
	async function _setup() {
		localStorage.setItem("yt-player-quality", JSON.stringify({ "data": "hd720" }));
		localStorage.setItem("yt-player-av1-pref", "720");
		localStorage.setItem("yt-html5-player-modules::subtitlesModuleData::module-enabled", true);
		localStorage.setItem("ytaq_ytgaming", true); localStorage.setItem("ytaq_gaming", true);
		sessionStorage.setItem("yt-player-quality", JSON.stringify({ "data": "hd720" }));
		sessionStorage.setItem("yt-player-av1-pref", "720");
		sessionStorage.setItem("yt-html5-player-modules::subtitlesModuleData::module-enabled", true);
		sessionStorage.setItem("ytaq_ytgaming", true); sessionStorage.setItem("ytaq_gaming", true);
		
		const player = await unsafeWindow.try_max(unsafeWindow._getPlayer, 4, 500);
		
		if (player) {
			const p = player.getElementsByTagName("video")[0];
			
			if (player.setPlaybackQualityRange) player.setPlaybackQualityRange("large", "hd720");
			if (player.setPlaybackQuality) player.setPlaybackQuality("hd720");
			if (p.setPlaybackQualityRange) p.setPlaybackQualityRange("large", "hd720");
			if (p.setPlaybackQuality) p.setPlaybackQuality("hd720");
			
			if (p) {
				player._p = p;
				
				p.preload = "auto";
				if (p.controlslist) p.controlslist.remove("nodownload");
				
				player.ontimeupdate = p.ontimeupdate = e => {
					unsafeWindow._time = ~~(player.getCurrentTime() || p.currentTime);
					
					if (player && p && GM_getValue("seek", -1) > 0) {
						player.seekTo(GM_getValue("seek", unsafeWindow._time));
						GM_deleteValue("seek");
						
						GM_log("Seeked to:", GM_getValue("seek", unsafeWindow._time));
					}
				};
				p.onvolumechange = player.onvolumechange = e => {
					const vol = document.getElementById("_YTA_Panel_volume"), vol2 = document.getElementById("_YTA_Panel_volume2");
					
					if (vol) vol.value = (player.getVolume || p.getVolume)();
					if (vol2) vol2.value = (player.getVolume || p.getVolume)();
				};
			}
			
			GM_log("Quality Adjusted, Event hooks set up.");
		}
		
		return player;
	} //_setup
	
	function panel() {
		unsafeWindow.do_if(document.getElementById("_YTA_Panel"), pan => {
			pan.classList.toggle("_YTA_hidden");
			pan.toggleAttribute("open");
		});
		
		GM_log("Panel triggered.");
	} //panel
	
	//Reload
	async function timerel(a = true, c = false) {
		GM_setValue("sticky1", a);
		if (c) GM_setValue("down", c);
		
		if (unsafeWindow._time >= 0) {
			GM_log("Seek to:", unsafeWindow._time);
			GM_setValue("seek", unsafeWindow._time);
		}
		
		GM_log("Reloading...");
		
		return location.reload();
	} //timerel
	unsafeWindow._timerel = timerel;
}();
