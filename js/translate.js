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
			//console.log("\""+text+"\": \"\",");
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
	 * @example switchLanguage("ca")
	 */
	function switchLanguage(lang, force) {
		if (!lang) {
			if (!lang) {
				var urlParts = window.location.href.match(/(\?|&)lang=([^&#]+)/);
				if (urlParts !== null) {
					lang = urlParts[2];
				}
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
		addStaticText();
		switchDialogMode();
		switchConsoleMode();
		document.getElementById("language-select").value = lang;
		var translator = "";
		if ($_eseecode.i18n.available[lang].translator) {
			translator = $_eseecode.i18n.available[lang].translator;
			if ($_eseecode.i18n.available[lang].translatorLink) {
				translator = "<a href=\""+$_eseecode.i18n.available[lang].translatorLink+"\" target=\"_blank\">"+translator+"</a>";
			}
			translator = _("Translated to %s by %s",[$_eseecode.i18n.available[lang].name,translator]);
		}
		document.getElementById("language-translator").innerHTML = translator;
	}

	/**
	 * Initializes/Resets static text translations
	 * @private
	 * @example addStaticText()
	 */
	function addStaticText() {
		for (var i=1; i<$_eseecode.modes.console.length; i++) {
			var levelName = $_eseecode.modes.console[i].name;
			var levelText = levelName.substr(0,1).toUpperCase()+levelName.substr(1);
			document.getElementById("console-tabs-level"+i).innerHTML = "<a href=\"#\">"+_(levelText)+"</a>";
			document.getElementById("console-tabs-level"+i).title = _("Double click to maximize/restore");
		}
		document.getElementById("language-title").innerHTML = _("Select language")+": ";
		document.getElementById("language-select").title = _("Select language");
		document.getElementById("title").innerHTML = _($_eseecode.platform.name.text);
		document.getElementById("author").innerHTML = _("v")+"<a href=\""+_($_eseecode.platform.version.link)+"\" target=\"_blank\">"+_($_eseecode.platform.version.text)+"</a><br />\
		"+_("Author")+": "+"<a href=\""+_($_eseecode.platform.author.link)+"\" target=\"_blank\">"+_($_eseecode.platform.author.text)+"</a><br />\
		"+_("Licensed under the")+" "+"<a href=\""+_($_eseecode.platform.license.link)+"\" target=\"_blank\">"+_($_eseecode.platform.license.text)+"</a></div>";
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
		document.getElementById("dialog-tabs-setup").title = _("Setup");
		document.getElementById("dialog-tabs-debug").innerHTML = "<a href=\"#\">"+_("Debug")+"</a>";
		document.getElementById("dialog-tabs-window").innerHTML = "<a href=\"#\">"+_("Window")+"</a>";
		document.getElementById("dialog-tabs-pieces").innerHTML = "<a href=\"#\">"+_("Pieces")+"</a>";
		document.getElementById("dialog-blocks").title = _("Blocks available");
		document.getElementById("dialog-write").title = _("Instructions available");
		document.getElementById("dialog-window").title = _("Interactive window");
		document.getElementById("dialog-debug").title = _("Debug dialog");
		document.getElementById("dialog-debug-layers-title").innerHTML = _("Layers")+":";
		document.getElementById("dialog-debug-layers-help").title = _("Here you can:\n * analyze the order of layers\n * view a layer alone and its cursor\n * toggle layer visibility\n * set the active layer\n * run commands");
		document.getElementById("dialog-debug-analyzer-title").innerHTML = _("Analyzer")+":";
		document.getElementById("dialog-debug-analyzer-help").title = _("Here you can:\n * mark a line to stop the program at that point\n * watch values of variables at those stops");
		document.getElementById("dialog-debug-command-label").innerHTML = _("Command");
		document.getElementById("dialog-debug-command-input").title = _("Command");
		document.getElementById("dialog-debug-command-button").title = _("Run");
		document.getElementById("dialog-setup").title = _("Setup dialog");
		document.getElementById("setup-grid-enable-label").innerHTML = _("Toggle grid");
		document.getElementById("setup-grid-enable").title = _("Toggle grid");
		document.getElementById("setup-grid-step-title").innerHTML = _("Grid")+": ";
		document.getElementById("setup-grid-step").title = _("Grid inter-line space");
		document.getElementById("setup-turtle-enable-title").innerHTML = _("Cursor")+":";
		document.getElementById("setup-turtle-enable-label").innerHTML = _("Toggle cursor");
		document.getElementById("setup-turtle-enable").title = _("Toggle cursor");
		document.getElementById("downloadImage").innerHTML = "<b>"+_("Download whiteboard image")+"</b>";
		document.getElementById("downloadLayers").innerHTML = "<b>"+_("Download layers")+"</b>";
		document.getElementById("setup-execute-step-title").innerHTML = _("Pause every")+" ";
		document.getElementById("setup-execute-step").title = _("Number of instructions until pause");
		document.getElementById("setup-execute-step-title2").innerHTML = " "+_("instructions")+" ";
		document.getElementById("setup-execute-stepped").title = _("Run stepped");
		document.getElementById("setup-execute-time-title").innerHTML = _("Stop execution after")+" ";
		document.getElementById("setup-execute-time").title = _("Number of seconds to run");
		document.getElementById("setup-execute-time-title2").innerHTML = " "+_("seconds");
	}

	/**
	 * Initializes/Resets the language selection element to provide all available translations
	 * @private
	 * @example resetLanguageSelect("ca")
	 */
	function resetLanguageSelect() {
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
