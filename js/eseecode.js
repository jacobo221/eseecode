"use strict";

(function $eseecodeLoader(eseecodeEl) {

	// If the page is not ready, wait (we need document.body to be ready). This allows to call this script both in head and in body
	if (document.readyState === "complete") return window.addEventListener("load", () => $eseecodeLoader(eseecodeEl));

	// Do not run twice
	if (window.$e) return false;

	// Create the main object
	if (!window.$e) window.$e = { session: {}, ui: {} };

	// Now we run the sync function, so the initial sychronous call returns
	(async function() {
		$e.session.ready = false; // Mark that it is being loaded

		$e.cache_token = new URLSearchParams(window.location.search).get('v');

		const scripts = document.querySelectorAll("script");
		const scriptPath = scripts[scripts.length - 1].src;
		const eseecodePath =  scriptPath.substring(0, scriptPath.lastIndexOf("/js/"));
		
		$e.ui.element = eseecodeEl;
		if (!$e.ui.element) $e.ui.element = document.querySelector("#eseecode");
		if (!$e.ui.element) {
			$e.ui.element = document.createElement("div");
			$e.ui.element.id = "eseecode";
			document.body.appendChild($e.ui.element);
		}
		$e.ui.element.classList.add("eseecode");

		// At this point CSS files are not loaded yet, so set style directly to element
		$e.ui.element.style.visibility = "hidden"; // This allows for he opacity animation to not display an initian view of the element before running the animation, plus it hides the element's background colour (which only covers a fraction of the display) during the loading of the initial CSS files
		$e.ui.element.style.opacity = 0; // We make it invisible but displayed so the heights, widths, etc are calculated. Set back to visible from within $e.ui.reset()
		const wrapperProgressEl = document.createElement("div");
		wrapperProgressEl.id = "loadingWrapper";
		wrapperProgressEl.classList.add("loadingWrapper");
		wrapperProgressEl.style.position = "absolute"; // Initially there is no CSS loaded so prepare some defaults
		wrapperProgressEl.style.width = "100vw";
		wrapperProgressEl.style.height = "100vh";
		wrapperProgressEl.style.fontSize = "2em";
		wrapperProgressEl.style.textAlign = "center";
		const progressEl = document.createElement("div");
		progressEl.classList.add("loading"); // The animation will load when the CSS file is loaded, and the Loading text will automatically hide
		progressEl.textContent = "Loading...";
		wrapperProgressEl.appendChild(progressEl);
		$e.ui.element.parentNode.appendChild(wrapperProgressEl);

		// Load files, when order does matter:
		// File batches are divided in arrays to separate dependencies, so all files in same array are loaded in parallel
		// Functions can be called to add more files, but these will be loaded in sequence
		class countFiles {
			constructor(num, nextCallback, stopCallback) {
				self = this;
				self.countdown = num;
				self.nextCallback = nextCallback;
				self.stopCallback = stopCallback;
			}
			count(event) {
				self.countdown--;
				if (self.countdown === 0) self.success(event);
				else if (self.nextCallback) self.nextCallback(self.countdown, event);
			}
			kill(event) {
				self.countdown = undefined; // undefined + N == NaN
				if (self.stopCallback) self.stopCallback(self.countdown, event);
			}
			wait(r) {
				self.success = r;
			}
		}
		const loadedFiles = [];
		function loadFile(path, headEl, count, error) {
			if (loadedFiles.includes(path)) return count && count(); // Do not load the same file twice
			const pathLength = path.indexOf("?");
			if (pathLength > 0) path = path.substring(0, pathLength);
			const type = path.substring(path.lastIndexOf(".") + 1);
			if (type !== "js" && type !== "css") return error(); // Cannot autodetect type of file so cannot be correctly appended and monitored (onload/onerror), therefore fail now
			const fullPath = (path.startsWith("https://") || path.startsWith("http://") ? "" : eseecodePath + (type == "js" ? "/" : "/css/")) + path;
			const el = document.createElement(type == "js" ? "script" : "link");
			if (type == "css") el.rel = "stylesheet";
			if (count) el.onload = count;
			if (error) el.onerror = error;
			el.setAttribute(type == "js" ? "src" : "href", fullPath + ($e.cache_token ? '?v=' + $e.cache_token : ''));
			headEl.appendChild(el);
			loadedFiles.push(path);
		}
		const updateProgress = (from, to, steps, countdown, event) => { if (!progressEl.dataset.locked) progressEl.textContent = Math.floor(to - (to - from) / steps * countdown) + "%"; };
		const failedProgress = (countdown, error) => { console.error("Failure", error); progressEl.dataset.locked = true; progressEl.textContent = "Failed!"; progressEl.classList.remove("loading"); };
		const files_to_load =[
			[
				"definitions.css", /* This a theme file, so use theme-relative path */
				"ui.css", /*Load the CSS as soon as possible to style the progress animation. This a theme file, so use theme-relative path */
				"js/polyfills.js",
				"js/defaults.js",
			], [
				// Depends on js/defaults.js
				"themes/installed.js",
				"css/theme.js",
				"translations/installed.js",
				"js/common.js",
				"js/backend/backend.js",
				"js/backend/axis.js",
				"js/backend/whiteboard.js",
				"js/ide.js",
				"js/execution/runtime.js",
				"js/execution/ide.js",
				"js/blocks/blocks.js",
				"js/blocks/ide.js",
				"js/blocks/drag.js",
				"js/blocks/setup.js",
				"js/blocks/undo.js",
				"js/blocks/ui.js",
				"js/ui/dom.js",
				"js/ui/ui.js",
				"js/ui/translations.js",
				"js/ui/dialogs.js",
				"js/ui/whiteboard.js",
				"js/ui/views.js",
				"js/ui/write.js",
				"js/ui/themes.js",
				"js/instructions/set.js",
				"js/instructions/implementation.js",
				"js/instructions/icons.js",
				"js/libs/jison/eseecodeLanguage.js",
				"js/api.js",
				"js/libs/ace/ace.js",
				"js/libs/jsgif/LZWEncoder.js",
				"js/libs/jsgif/NeuQuant.js",
				"js/libs/jsgif/GIFEncoder.js",
			], [
				// Depends on theme.js
				() => $e.ui.themes.current.files,
				// Depends on js/ace/ace.js
				"js/debug/debug.js",
				"js/debug/whiteboard.js",
				"js/debug/breakpoints.js",
				"js/libs/ace/ext-language_tools.js",
				// Depends on js/jison/eseecodeLanguage.js
				"js/libs/jison/makeBlocks.js",
				"js/libs/jison/makeWrite.js",
			]
		];
		try {
			for (let i = 0, files = files_to_load[i]; i < files_to_load.length; i++, files = files_to_load[i]) {
				const subfiles = files.reduce((acc, v) => typeof v == "string" ? acc.concat(v) : acc.concat(v()), []);
				const numFiles = subfiles.length;
				const counter = new countFiles(
					numFiles,
					(countdown, event) => updateProgress(i * 100 / files_to_load.length, (i + 1) * 100 / files_to_load.length, numFiles, countdown, event),
					failedProgress
				);
				const headEl = document.querySelector("head");
				subfiles.forEach(file => loadFile(file, headEl, counter.count, counter.kill));
				await new Promise(r => counter.wait(r));
			}
			window._ = $e.ui.translations.translate; // Shorthand so we can just use _() instead of $e.ui.translation.translate()
			// All files loaded, start application
			$e.ui.reset();
			wrapperProgressEl.parentNode.removeChild(wrapperProgressEl);
		} catch(error) {
			console.error(error);
			failedProgress();
		}

	})();

	return $e;

})();
