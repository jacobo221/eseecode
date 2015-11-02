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
		$_eseecode.session.lastSave = new Date().getTime();
		return code;
	}

	/**
	 * Loads code into the console
	 * @public
	 * @param {String} code Code to upload
	 * @param {Boolean} [run=false] If true, it runs the code immediately
	 * @example API_uploadCode("repeat(4){forward(100)}",true)
	 */
	function API_uploadCode(code, run) {
		if (run === undefined) {
			run = false;
		}
		$e_uploadCode(code, run, false);
	}

	/**
	 * Loads precode into the console
	 * @public
	 * @param {String} code Code to set as precode
	 * @param {Boolean} [run=true] If false, it doesn't run the code immediately, only when the user executes user code
	 * @example API_uploadPreode("repeat(4){forward(100)}")
	 */
	function API_uploadPrecode(code, run) {
		if (run === undefined) {
			run = true;
		}
		$e_uploadCode(code, run, true);
	}

	/**
	 * Sets the input in I/O
	 * @public
	 * @param {String} text Input to use
	 * @example API_setInput("1 1 2 3 5 8")
	 */
	function API_setInput(text) {
		if (text === undefined) {
			text = "";
		}
		$_eseecode.execution.inputRaw = text;
	}

	/**
	 * Gets the output from I/O
	 * @public
	 * @return {String} Output in the I/O
	 * @example API_getOuput("1 1 2 3 5 8")
	 */
	function API_getOuput() {
		return document.getElementById("dialog-io-output").value;
	}

