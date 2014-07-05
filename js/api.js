"use strict";

	/**
	 * Returns the user's code
	 * @public
	 * @return {String} User code
	 * @example downloadCode()
	 */
	function downloadCode() {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		var code;
		if (mode == "blocks") {
			code = blocks2code(document.getElementById("console-blocks").firstChild);
		} else if (mode == "write") {
			var code;
			code = ace.edit("console-write").getValue();
		}
		return code;
	}

	/**
	 * Loads code into the console
	 * @public
	 * @param {String} code Code to upload
	 * @example uploadCode("repeat(4){forward(100)}")
	 */
	function uploadCode(code) {
		if (!code) {
			return;
		}
		if (!resetUI(true)) {
			return;
		}
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		var program;
		// Always start by trying to load the code into the current level
		var switchToMode;
		if (eseecodeLanguage) {
			try {
				program = eseecodeLanguage.parse(code);
			} catch (exception) {
				msgBox(_("Can't open the code in %s mode because there are erros in the code. Please open the file in level4 mode and fix the following errors",[level])+":\n\n"+exception.name + ":  " + exception.message);
			}
		} else {
			msgBox(_("Can't open the code in %s mode because you don't have the eseecodeLanguage script loaded. Please open the file in level4 mode",[level]));
		}
		if (mode == "blocks") {
			program.makeBlocks(level,document.getElementById("console-blocks"));
		} else if (mode == "write") {
			resetWriteConsole(program.makeWrite(level,"","\t"));
		}
		resetCanvas();
	}
