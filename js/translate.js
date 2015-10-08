"use strict";

	/**
	 * Translate the string
	 * Translation strings must be available at $_eseecode.i18n.available[language_code][text]
	 * @private
	 * @param {String} text Text to translate
	 * @param {Array<String>} [params] Parameters to instert into the text replacing '%s'
	 * @return {String} The translated string
	 * @example _("text")
	 */
	function _(text, params) {
		var langCurrent = $_eseecode.i18n.current;
		var lang = $_eseecode.i18n.available[langCurrent];
		if (!lang) {
			lang = $_eseecode.i18n.available["initial"];
		}
		var translated;
		if (lang[text]) {
			translated = lang[text];
		} else {
			translated = text;
		}
		if (params) {
			for (var i=0; i<params.length; i++) {
				translated = translated.replace(/%s/,params[i]);
			}
		}
		return translated;
	}

	/**
	 * Switch translation
	 * @private
	 * @param {String} [lang] Language code to translate to. If unset it checks the "lang" parameter in the browser's URL. If it can't determine the new language, it takes "initial"
	 * @param {Boolean} [force] Forces the language switch even if it is the same as the current language. If the language doens't exist it falls back to "initial"
	 * @example $e_switchLanguage("ca")
	 */
	function $e_switchLanguage(lang, force) {
		if (!lang) {
			var urlParts = window.location.href.match(/(\?|&)lang=([^&#]+)/);
			if (urlParts !== null) {
				lang = urlParts[2];
			}
			if (!lang) {
				lang = "initial";
			}
		}
		lang = lang.toLowerCase();
		// Only switch if necessary
		if (lang === $_eseecode.i18n.current && !force) {
			return;
		}
		// Check the translation is available
		if (!$_eseecode.i18n.available[lang]) {
			if (force) {
				lang = "initial";
			} else {
				return;
			}
		}
		$_eseecode.i18n.current = lang;
		$e_addStaticText();
		$e_switchDialogMode();
		$e_resetGridModeSelect();
		$e_switchConsoleMode();
		document.getElementById("language-select").value = lang;
		var translator = "";
		if ($_eseecode.i18n.available[lang].translator) {
			translator = $_eseecode.i18n.available[lang].translator;
			if ($_eseecode.i18n.available[lang].translatorLink) {
				translator = "<span class=\"link\" onclick=\"window.open('"+$_eseecode.i18n.available[lang].translatorLink+"','_blank')\">"+translator+"</span>";
			}
			translator = _("Translated to %s by %s",[$_eseecode.i18n.available[lang].name,translator]);
		}
		if (document.getElementById("language-translator")) {
			document.getElementById("language-translator").innerHTML = translator;
		}
	}

	/**
	 * Initializes/Resets static text translations
	 * @private
	 * @example $e_addStaticText()
	 */
	function $e_addStaticText() {
		for (var i=1; i<$_eseecode.modes.console.length; i++) {
			var levelId = $_eseecode.modes.console[i].id;
			var levelText = $_eseecode.modes.console[i].name;
			document.getElementById("console-tabs-"+levelId).innerHTML = _(levelText);
			document.getElementById("console-tabs-"+levelId).title = _("Double click to maximize/restore");
		}
		document.getElementById("language-title").innerHTML = _("Select language")+": ";
		document.getElementById("language-select").title = _("Select language");
		document.getElementById("title-logo").title = _($_eseecode.platform.name.text);
		document.getElementById("dialog-setup-author").innerHTML = _("v")+"<span class=\"link\" onclick=\"window.open('"+_($_eseecode.platform.version.link)+"','_blank')\"\">"+_($_eseecode.platform.version.text)+"</span><br />"
		//+_("Author")+": "+"<span class=\"link\" onclick=\"window.open('"+_($_eseecode.platform.author.link)+"','_blank')\">"+_($_eseecode.platform.author.text)+"</span><br />"
		+_("Licensed under the")+" "+"<span class=\"link\" onclick=\"window.open('"+_($_eseecode.platform.license.link)+"','_blank')\">"+_($_eseecode.platform.license.text)+"</span></div>";
		document.getElementById("loadcode").value = _("Load code");
		document.getElementById("savecode").value = _("Save code");
		document.getElementById("whiteboard").title = _("Whiteboard");
		document.getElementById("console-blocks").title = _("Console Blocks");
		document.getElementById("console-write").title = _("Console Write");
		document.getElementById("button-undo").title = _("Undo");
		document.getElementById("button-execute").title = _("Run");
		document.getElementById("button-clear").title = _("Clear");
		document.getElementById("button-reset").title = _("Reset");
		document.getElementById("button-redo").title = _("Redo");
		document.getElementById("console-tabs-title").innerHTML = _("Views")+": ";
		document.getElementById("dialog-tabs-setup").title = _("Setup");
		document.getElementById("dialog-tabs-debug").innerHTML = _("Debug");
		document.getElementById("dialog-tabs-window").innerHTML = _("Window");
		document.getElementById("dialog-tabs-pieces").innerHTML = _("Pieces");
		document.getElementById("dialog-blocks").title = _("Blocks available");
		document.getElementById("dialog-write").title = _("Instructions available");
		document.getElementById("dialog-window").title = _("Interactive window");
		document.getElementById("dialog-debug").title = _("Debug dialog");
		document.getElementById("dialog-debug-layers-title").innerHTML = '<span style="position:absolute;left:0px;font-weight:normal;font-size:small"><input type="checkbox" onclick="$e_debugSelectAllNoneLayers(this)" style="float:left" checked /> '+_("All/None")+'</span>'+_("Layers")+":";
		document.getElementById("dialog-debug-layers-help").title = _("Here you can:\n * analyze the order of layers\n * view a layer alone and its guide\n * toggle layer visibility\n * set the active layer\n * run commands");
		document.getElementById("dialog-debug-analyzer-title").innerHTML = _("Analyzer")+":";
		document.getElementById("dialog-debug-analyzer-help").title = _("Here you can:\n * mark a line to stop the program at that point\n * watch values of variables at those stops\n * stop the program when a controlled variable is updated");
		document.getElementById("dialog-debug-execute-stats-title").innerHTML = _("Execution")+":";
		document.getElementById("dialog-debug-execute-stats-help").title = _("Execution statistics");
		document.getElementById("dialog-debug-execute-stats").innerHTML = "";
		document.getElementById("dialog-debug-execute-step-title").innerHTML = _("Pause every")+" ";
		document.getElementById("dialog-debug-execute-step").title = _("Number of instructions until pause");
		document.getElementById("dialog-debug-execute-step-title2").innerHTML = " "+_("instructions")+" ";
		document.getElementById("dialog-debug-execute-step").title = _("Run stepped");
		document.getElementById("dialog-debug-command-input").title = _("Command");
		document.getElementById("dialog-debug-command-button").title = _("Run");
		document.getElementById("dialog-setup").title = _("Setup dialog");
		document.getElementById("setup-grid-enable").title = _("Toggle grid");
		document.getElementById("setup-grid-step-title").innerHTML = _("Grid")+": ";
		document.getElementById("setup-grid-step").title = _("Grid inter-line space");
		document.getElementById("setup-guide-enable-title").innerHTML = _("Guide")+":";
		document.getElementById("setup-guide-enable-label").innerHTML = _("Toggle guide");
		document.getElementById("setup-guide-enable").title = _("Toggle guide");
		document.getElementById("setup-downloadLayers-title").innerHTML = _("Download layers")+": ";
		document.getElementById("setup-downloadLayers-interval-title").innerHTML = _("Animation interval (in msecs)")+": ";
		document.getElementById("setup-downloadLayers-columns-title").innerHTML = _("Layers per row")+": ";
		document.getElementById("setup-execute-time-title").innerHTML = _("Stop execution after")+" ";
		document.getElementById("setup-execute-time").title = _("Number of seconds to run");
		document.getElementById("setup-execute-time-title2").innerHTML = " "+_("seconds");
		document.getElementById("whiteboard-tabs-download-button").innerHTML = _("Download as an image");
	}

	/**
	 * Initializes/Resets the language selection element to provide all available translations
	 * @private
	 * @example $e_resetLanguageSelect("ca")
	 */
	function $e_resetLanguageSelect() {
		var select = document.getElementById("language-select");
		// Reset languages in dropdown menu
		select.options.length = 0;
		// Get available translations
		var languages = [];
		for (var langKey in $_eseecode.i18n.available) {
			languages.push([langKey, $_eseecode.i18n.available[langKey].name]);
		}
		// Sort by name
		languages = languages.sort(function(a,b) {
			return a[1] > b[1];
		});
		// Add languages to dropdown menu
		for (var i=0; i<languages.length; i++) {
			var langKey = languages[i][0];
			var option = document.createElement("option");
			option.text = $_eseecode.i18n.available[langKey].name;
			option.value = langKey;
			select.add(option, null);
		}
	}
