"use static";

/**
 * Switch translation
 * @private
 * @param {String} [lang] Language code to translate to. If unset it checks the "lang" parameter in the browser's URL. If it can't determine the new translation, it takes "default"
 * @param {Boolean} [run=true] Switch language in already visible UI elements
 * @example $e.ui.translations.switch("ca")
 */
$e.ui.translations.switch = (lang, run) => {
	$e.ui.translations.current.loaded = false;
	run = (!run || run !== false);
	if (!lang || lang == "default") {
		$e.ui.translations.current = { id: "default", name: "English", code: "en", strings: {} };
		lang = "default";
	}
	lang = lang.toLowerCase();
	const headElement = document.querySelector("head");
	const translationsPath = "translations";
	const translationPath = $e.basepath + "/" + translationsPath + "/" + lang + ".js" + ($e.cache_token ? "?v=" + $e.cache_token : "");
	// Remove the previous theme
	const headElements = headElement.children;
	Array.from(headElements).forEach(element => {
		if (element.tagName === "SCRIPT" && element.src && element.src.includes(translationsPath+"/")) {
			element.parentNode.removeChild(element);
		}
	});
	// Add translation file
	const runWhenTranslationLoaded = (run) => {
		let translation;
		if (run) {
			translation = $e.ui.translations.current;
			$e.ui.translations.addStaticText();
			$e.ui.resetGridModeSelect();
			$e.ui.translations.resetMenu();
			$e.ui.themes.resetMenu();
			$e.ui.switchView();
			$e.ui.switchToolboxMode();
			const elementTranslator = $e.ui.element.querySelector("#translations-translator");
			if (translation.translator && elementTranslator) {
				const translatorHTML = translation.translator;
				if (translation.translatorLink) {
					translatorHTML = "<span class=\"link\" onclick=\"window.open('" + translation.translatorLink + "', '_blank')\">" + translatorHTML + "</span>";
				}
				elementTranslator.innerHTML = _("Translated to %s by %s", [translation.name, translatorHTML]);
			}
		}
		const select = $e.ui.element.querySelector("#translations-select");
		select.value = lang;
		if (run) $e.ui.element.lang = translation.code;
		$e.ui.translations.current.loaded = true;
	};
	if (lang === "default") {
		runWhenTranslationLoaded(run);
	} else {
		const elementJS = document.createElement("script");
		elementJS.type = "text/javascript";
		elementJS.src = translationPath;
		elementJS.onload = () => { runWhenTranslationLoaded(run); };
		headElement.appendChild(elementJS);
	}
};

/**
 * Initializes/Resets the translations menu UI element
 * @private
 * @example $e.ui.themes.resetMenu()
 */
$e.ui.translations.resetMenu = () => {
	if ($e.ui.translations.menuVisible && $e.ui.translations.available.length > 1) {
		$e.ui.translations.resetSelect();
		$e.ui.element.querySelector("#translations").classList.remove("hide");
	} else {
		$e.ui.element.querySelector("#translations").classList.add("hide");
	}
};

/**
 * Initializes/Resets the translation selection element to provide all available translations
 * @private
 * @example $e.ui.translations.resetSelect()
 */
$e.ui.translations.resetSelect = () => {
	const select = $e.ui.element.querySelector("#translations-select");
	// Reset translations in dropdown menu
	select.options.length = 0;
	// Get available translations
	let translations = $e.ui.translations.available;
	// Sort by name
	translations = translations.sort((a, b) => {
		return a.name > b.name;
	});
	// Add translations to dropdown menu
	translations.forEach(translation => {
		const option = document.createElement("option");
		option.value = translation.id;
		option.text = translation.name;
		select.add(option, null);
	});
	select.value = $e.ui.translations.current.id;
};

/**
 * Initializes/Resets static text translations
 * @private
 * @example $e.ui.translations.addStaticText()
 */
$e.ui.translations.addStaticText = () => {
	Object.values($e.modes.views.available).forEach(view => {
		const levelId = view.id;
		const levelText = view.name;
		$e.ui.element.querySelector("#view-tabs-" + levelId).textContent = _(levelText);
		$e.ui.element.querySelector("#view-tabs-" + levelId).title = _("Double click to maximize/restore");
	});
	$e.ui.element.querySelector("#translations-switch").title = _("Language");
	$e.ui.element.querySelector("#themes-switch").title = _("Theme");
	$e.ui.element.querySelector("#logo").title = _($e.platform.name);
	$e.ui.element.querySelector("#toolbox-setup-author").innerHTML = _("v") + "<span class=\"link\" onclick=\"window.open('" + _($e.platform.changelog) + "', '_blank')\"\">" + _($e.platform.version) + "</span><br />" + _("Licensed under the") + " " + "<span class=\"link\" onclick=\"window.open('" + _($e.platform.license_link) + "', '_blank')\">" + _($e.platform.license) + "</span></div>";
	$e.ui.element.querySelector("#loadcode").textContent = _("Open");
	$e.ui.element.querySelector("#savecode").textContent = _("Download");
	$e.ui.element.querySelector("#whiteboard").title = _("Whiteboard");
	$e.ui.element.querySelector("#view-blocks").title = _("View Blocks");
	$e.ui.element.querySelector("#view-write").title = _("View Write");
	$e.ui.element.querySelector("#button-undo").title = _("Undo");
	$e.ui.element.querySelector("#button-execute").title = _("Run");
	$e.ui.element.querySelector("#button-pause").title = _("Pause");
	$e.ui.element.querySelector("#button-clear").title = _("Clear");
	$e.ui.element.querySelector("#button-reset").title = _("Reset");
	$e.ui.element.querySelector("#button-redo").title = _("Redo");
	$e.ui.element.querySelector("#view-tabs-title").textContent = _("Views") + ": ";
	$e.ui.element.querySelector("#view-blocks-tabs-flow").title = _("Toggle between code style and flow style");
	$e.ui.element.querySelector("#view-blocks-tabs-multiselect").title = _("Toggle between single block and multiple block selection");
	$e.ui.element.querySelector("#view-blocks-tabs-move").title = _("Move selected blocks");
	$e.ui.element.querySelector("#view-blocks-tabs-duplicate").title = _("Duplicate selected blocks");
	$e.ui.element.querySelector("#view-blocks-tabs-remove").title = _("Remove selected blocks");
	$e.ui.element.querySelector("#toolbox-tabs-setup").title = _("Setup");
	$e.ui.element.querySelector("#toolbox-tabs-debug").textContent = _("Debug");
	$e.ui.element.querySelector("#toolbox-tabs-window").textContent = _("Window");
	$e.ui.element.querySelector("#toolbox-tabs-io").textContent = _("I/O");
	$e.ui.element.querySelector("#toolbox-tabs-pieces").textContent = _("Pieces");
	$e.ui.element.querySelector("#toolbox-blocks").title = _("Blocks available");
	$e.ui.element.querySelector("#toolbox-write").title = _("Instructions available");
	$e.ui.element.querySelector("#toolbox-window").title = _("Interactive window");
	$e.ui.element.querySelector("#toolbox-debug").title = _("Debug toolbox");
	$e.ui.element.querySelector("#toolbox-debug-layers-title-name").textContent = _("Layers");
	$e.ui.element.querySelector("#toolbox-debug-layers-title-toggles-name").textContent =  _("Show/Hide");
	$e.ui.element.querySelector("#toolbox-debug-layers-help").title = _("Here you can:\n * analyze the order of layers\n * view a layer alone and its guide\n * toggle layer visibility\n * set the active layer\n * run commands");
	$e.ui.element.querySelector("#toolbox-debug-analyzer-title-name").textContent = _("Analyze");
	$e.ui.element.querySelector("#toolbox-debug-analyzer-title-toggles-name").textContent = _("Break?");
	$e.ui.element.querySelector("#toolbox-debug-breakpoint-add").textContent = "➕ " + _("Breakpoint");
	$e.ui.element.querySelector("#toolbox-debug-watch-add").textContent = "➕ " + _("Watch");
	$e.ui.element.querySelector("#toolbox-debug-analyzer-help").title = _("Here you can:\n * mark a line to stop the program at that point\n * watch values of variables\n * stop the program when a watched variable is updated");
	$e.ui.element.querySelector("#toolbox-debug-execute-execution-title-name").textContent = _("Execution");
	$e.ui.element.querySelector("#toolbox-debug-execute-execution-help").title = _("Execution control and statistics");
	$e.ui.element.querySelector("#toolbox-debug-execute-stats").textContent = "";
	$e.ui.element.querySelector("#toolbox-debug-execute-step-backwards").title = _("Run backwards to undo the last instruction");
	$e.ui.element.querySelector("#toolbox-debug-execute-step-forward").title = _("Run only the next instruction");
	$e.ui.element.querySelector("#toolbox-debug-execute-instructionsDelay").title = _("Execution speed");
	$e.ui.element.querySelector("#toolbox-debug-command-input").title = _("Command");
	$e.ui.element.querySelector("#toolbox-debug-command-button").title = _("Run");
	$e.ui.element.querySelector("#toolbox-setup").title = _("Setup toolbox");
	$e.ui.element.querySelector("#toolbox-io-input-title").textContent = _("Input");
	$e.ui.element.querySelector("#toolbox-io-output-title").textContent = _("Output");
	$e.ui.element.querySelector("#setup-grid-enable").title = _("Toggle grid");
	$e.ui.element.querySelector("#setup-grid-divisions-title").textContent = _("Whiteboard divisions") + ": ";
	$e.ui.element.querySelector("#setup-grid-divisions").title = _("Grid inter-line space");
	$e.ui.element.querySelector("#setup-guide-enable-title").textContent = _("Guide") + ":";
	$e.ui.element.querySelector("#whiteboard-tabs-download-button").title = _("Download as an image");
};

/**
 * Translate the string
 * Translation strings must be available at $e.ui..strings[text]
 * @private
 * @param {String} text Text to translate
 * @param {Array<String>} [params] Parameters to instert into the text replacing '%s'
 * @return {String} The translated string
 * @example _("text")
 */
$e.ui.translations.translate = (text, params) => {
	const strings = $e.ui.translations.current.strings;
	let translated;
	if (strings[text]) {
		translated = strings[text];
	} else {
		translated = text;
	}
	if (params) {
		if (!Array.isArray(params)) params = [ params ];
		params.forEach(param => translated = translated.replace(/%s/, param));
	}
	return translated;
};

window._ = $e.ui.translations.translate; // Shorthand so we can just use _() instead of $e.ui.translation.translate()