"use strict";

	/**
	 * Returns the user's code
	 * @public
	 * @return {String} User code
	 * @example API_downloadCode()
	 */
	function API_downloadCode() {
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		var code;
		if (mode == "blocks") {
			code = $e_blocks2code(document.getElementById("console-blocks").firstChild);
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
	 * @param {Boolean} [preload] If true, runs code and stores it to be run before every execution of user code
	 * @example API_uploadCode("repeat(4){forward(100)}",false)
	 */
	function API_uploadCode(code,preload) {
		if (!code) {
			return;
		}
		if (!$e_resetUI(true)) {
			return;
		}
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id;
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		var program;
		// Always start by trying to load the code into the current level
		var switchToMode;
		if (eseecodeLanguage) {
			try {
				program = eseecodeLanguage.parse(code);
			} catch (exception) {
				$e_msgBox(_("Can't open the code in %s mode because there are erros in the code. Please open the file in Code view mode and fix the following errors",[level])+":\n\n"+exception.name + ":  " + exception.message);
			}
		} else {
			$e_msgBox(_("Can't open the code in %s mode because you don't have the eseecodeLanguage script loaded. Please open the file in Code view mode",[level]));
		}
		if (preload === true) {
			$_eseecode.execution.precode = code;
			$e_execute();
		} else {
				$_eseecode.session.changesInCode = true; // Mark the code as changed, otherwise if starting in Code mode and changing to blocks console all code would be lost
		        if (mode == "blocks") {
			        program.makeBlocks(level,document.getElementById("console-blocks"));
		        } else if (mode == "write") {
			        $e_resetWriteConsole(program.makeWrite(level,"","\t"));
		        }
		        $e_resetCanvas();
		}
	}

