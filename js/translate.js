"use strict";

	/**
	 * Translate the string
	 * Translation strings must be available at $_eseecode.ui.translation[text]
	 * @private
	 * @param {String} text Text to translate
	 * @param {Array<String>} [params] Parameters to instert into the text replacing '%s'
	 * @return {String} The translated string
	 * @example _("text")
	 */
	function _(text, params) {
		var strings = $_eseecode.ui.translation.strings;
		var translated;
		if (strings[text]) {
			translated = strings[text];
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
		document.getElementById("translations-title").innerHTML = _("Select language")+": ";
		document.getElementById("translations-select").title = _("Select language");
		document.getElementById("themes-title").innerHTML = _("Select theme")+": ";
		document.getElementById("themes-select").title = _("Select theme");
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
		document.getElementById("button-stop").title = _("Stop animations");
		document.getElementById("button-clear").title = _("Clear");
		document.getElementById("button-reset").title = _("Reset");
		document.getElementById("button-redo").title = _("Redo");
		document.getElementById("console-tabs-title").innerHTML = _("Views")+": ";
		document.getElementById("dialog-tabs-setup").title = _("Setup");
		document.getElementById("dialog-tabs-debug").innerHTML = _("Debug");
		document.getElementById("dialog-tabs-window").innerHTML = _("Window");
		document.getElementById("dialog-tabs-io").innerHTML = _("I/O");
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
		document.getElementById("dialog-io-input-title").innerHTML = _("Input");
		document.getElementById("dialog-io-output-title").innerHTML = _("Output");
		document.getElementById("setup-grid-enable").title = _("Toggle grid");
		document.getElementById("setup-grid-divisions-title").innerHTML = _("Grid divisions")+": ";
		document.getElementById("setup-grid-divisions").title = _("Grid inter-line space");
		document.getElementById("setup-guide-enable-title").innerHTML = _("Guide")+":";
		document.getElementById("setup-guide-enable-label").innerHTML = _("Toggle guide");
		document.getElementById("setup-guide-enable").title = _("Toggle guide");
		document.getElementById("setup-execute-time-title").innerHTML = _("Stop execution after")+" ";
		document.getElementById("setup-execute-time").title = _("Number of seconds to run");
		document.getElementById("setup-execute-time-title2").innerHTML = " "+_("seconds");
		document.getElementById("whiteboard-tabs-download-button").title = _("Download as an image");
	}
