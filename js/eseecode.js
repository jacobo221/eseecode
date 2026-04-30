"use strict";

(function $eseecodeLoader(eseecodeEl) {

	// If the page is not ready, wait (we need document.body to be ready). This allows to call this script both in head and in body
	if (document.readyState !== "complete") return window.addEventListener("load", () => $eseecodeLoader(eseecodeEl));

	// Do not run twice
	if (window.$e && $e.session) return false;

	// Create the main object
	if (!window.$e) window.$e = {};
	$e = Object.assign({ session: {}, ui: {} }, $e);

	// Now we run the sync function, so the initial sychronous call returns
	(async function() {
		$e.session.ready = false; // Mark that it is being loaded

		$e.cache_token = new URLSearchParams(document.currentScript?.src.split("?").slice(1).join("?")).get("v");

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

		// Load files in batches; all files within a batch load in parallel, batches are sequential to respect dependencies
		// Entries in each batch can be a path string or a function returning an array of path strings
		const loadedFiles = [];
		function loadFile(path, headEl) {
			if (loadedFiles.includes(path)) return Promise.resolve(); // Do not load the same file twice
			const pathLength = path.indexOf("?");
			if (pathLength > 0) path = path.substring(0, pathLength);
			const type = path.substring(path.lastIndexOf(".") + 1);
			if (type !== "js" && type !== "css") return Promise.reject(new Error("Cannot autodetect type: " + path)); // Cannot correctly append and monitor (onload/onerror)
			const fullPath = (path.startsWith("https://") || path.startsWith("http://") ? "" : eseecodePath + (type == "js" ? "/" : "/css/")) + path;
			const el = document.createElement(type == "js" ? "script" : "link");
			if (type == "css") el.rel = "stylesheet";
			el.setAttribute(type == "js" ? "src" : "href", fullPath + ($e.cache_token ? "?v=" + $e.cache_token : ""));
			loadedFiles.push(path);
			return new Promise((resolve, reject) => {
				el.onload = resolve;
				el.onerror = reject;
				headEl.appendChild(el);
			});
		}
		const updateProgress = (from, to, loaded, total) => { if (!progressEl.dataset.locked) progressEl.textContent = Math.floor(from + (to - from) * loaded / total) + "%"; };
		const failedProgress = (error) => { console.error("Failure", error); progressEl.dataset.locked = true; progressEl.textContent = "Failed!"; progressEl.classList.remove("loading"); };
		const files_to_load = [
			[
				"definitions.css", /* This a theme file, so use theme-relative path */
				"ui.css", /*Load the CSS as soon as possible to style the progress animation. This a theme file, so use theme-relative path */
				"js/polyfills.js",
				"js/init.js",
				"js/instructions/init.js",
				"js/execution/init.js",
				"js/ide/init.js",
				"js/backend/init.js",
				"js/ui/init.js",
				"js/debug/init.js",
			], [
				// Depends on js/defaults.js
				"themes/installed.js",
				"css/theme.js",
				"translations/installed.js",
				"js/common.js",
				"js/backend/backend.js",
				"js/backend/axis.js",
				"js/backend/whiteboard.js",
				"js/ide/ide.js",
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
				"js/libs/html-to-image/html-to-image.min.js",
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
			for (let i = 0; i < files_to_load.length; i++) {
				const subfiles = files_to_load[i].reduce((acc, v) => typeof v == "string" ? acc.concat(v) : acc.concat(v()), []);
				const headEl = document.querySelector("head");
				const from = i * 100 / files_to_load.length;
				const to = (i + 1) * 100 / files_to_load.length;
				let loaded = 0;
				await Promise.all(subfiles.map(file => loadFile(file, headEl).then(() => updateProgress(from, to, ++loaded, subfiles.length))));
			}
			// All files loaded, start application
			$e.ui.reset();
			wrapperProgressEl.remove();
		} catch(error) {
			console.error(error);
			failedProgress(error);
		}

	})();

	return $e;

})();
