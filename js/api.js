"use strict";

	/**
	 * Parses the parameters in the URL
	 * @private
	 * @param {String} [urlParams] URL to parse. If unset use browser's location
	 * @example $e_loadURLParams("view=drag")
	 */
	function $e_loadURLParams(urlParams) {
		var action;
		if (urlParams === undefined) {
			urlParams = window.location.href;
			action = false;
		} else {
			action = true;
		}
		urlParams = urlParams.split("&");
		for (var i=0; i<urlParams.length; i++) {
			var urlParamParts = urlParams[i].match(/(\?|&)?([A-z\-_]+)=([^&#]+)/);
			if (urlParamParts !== null) {
				var key = urlParamParts[2].toLowerCase();
				var value = urlParamParts[3];
				if (key == "grid") {
					API_showGrid(value, action);
				} else if (key == "gridstep") {
					API_setGridStep(value, action);
				} else if (key == "guide") {
					API_showGuide(value, action);
				} else if (key == "filemenu") {
					API_showFilemenu(value, action);
				} else if (key == "lang") {
					API_switchLanguage(value, action);
				} else if (key == "input") {
					var value = decodeURIComponent(value);
					API_setInput(value);
				} else if (key == "timeout") {
					API_setTimeout(value, action);
				} else if (key == "axis") {
					API_setAxis(value, action);
				} else if (key == "view") {
					API_switchView(value, action);
				} else if (key == "instructions") {
					var value = decodeURIComponent(value);
					API_setInstructions(value, action);
				} else if (key == "fullscreenmenu") {
					API_showFullscreenmenu(value, action);
				}
			}
		}
	}

	/**
	 * Parses the parameters in the URL
	 * @since 2.3
	 * @public
	 * @param {String} [urlParams] URL to parse. If unset use browser's location
	 * @example API_loadURLParams("view=drag")
	 */
	function API_loadURLParams(urlParams) {
		$e_loadURLParams(urlParams);
	}

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
	 * Runs the code in the console
	 * @since 2.3
	 * @public
	 * @example API_execute()
	 */
	function API_execute() {
		$e_executeFromUI();
	}
	
	/**
	 * Returns the name of the current dialog
	 * @since 2.3
	 * @public
	 * @param {Boolean} [fullscreen] Force fullscreen
	 * @example API_fullscreen()
	 */
	function API_fullscreen(value) {
		if (value === true || value == "true" || value == "1" || value == "yes") {
			value = true;
		} else {
			value = false;
		}
		$e_toggleFullscreen(value);
	}
	
	/**
	 * Returns the name of the current dialog
	 * @since 2.3
	 * @public
	 * @returns {String} Name of the current dialog
	 * @example API_getDialog()
	 */
	function API_getDialog() {
		return $_eseecode.modes.dialog[$_eseecode.modes.dialog[0]].name.toLowerCase();
	}

	/**
	 * Returns an image grid containing all the layers
	 * @private
	 * @param {Number} columns Amount of columns per line
	 * @return {*} The image binary
	 * @example API_getLayersAsGrid(5)
	 */
	function API_getLayersAsGrid(columns) {
		return $e_imagifyLayers(true, columns).imageBinary;
	}

	/**
	 * Returns an image animation containing all the layers
	 * @private
	 * @param {Number} milliseconds Waiting interval between each layer, in milliseconds
	 * @return {*} The image binary
	 * @example API_getLayersAsGrid(5)
	 */
	function API_getLayersAsAnimation(milliseconds) {
		return $e_imagifyLayers(false, milliseconds).imageBinary;
	}

	/**
	 * Gets the output from I/O
	 * @since 2.3
	 * @public
	 * @return {String} Output in the I/O
	 * @example API_getOuput("1 1 2 3 5 8")
	 */
	function API_getOuput() {
		return document.getElementById("dialog-io-output").value;
	}
	
	/**
	 * Returns the name of the current view
	 * @since 2.3
	 * @public
	 * @returns {String} Name of the current view
	 * @example API_getView()
	 */
	function API_getView() {
		return $_eseecode.modes.console[$_eseecode.modes.console[0]].name.toLowerCase();
	}

	/**
	 * Returns the image binary of the whiteboard
	 * @since 2.3
	 * @public
	 * @return {*} Image binary of the whiteboard
	 * @example API_getWhiteboard()
	 */
	function API_getWhiteboard() {
		return $e_imagifyWhiteboard().imageBinary;
	}
	
	/**
	 * Resets the execution
	 * @since 2.3
	 * @public
	 * @example API_reset()
	 */
	function API_reset() {
		$e_resetCanvasFromUI();
	}
	
	/**
	 * Restarts eSeeCode interface
	 * @since 2.3
	 * @public
	 * @example API_restart()
	 */
	function API_restart() {
		$e_resetUI(false);
		$e_msgBoxClose();
	}
	
	/**
	 * Chooses the predefined axis to use for the grid
	 * @since 2.3
	 * @public
	 * @param {Number|String} value Index of the predefined axis to use
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_setAxis(0)
	 */
	function API_setAxis(value, action) {
		value = value.toLowerCase();
		var axis = undefined;
		if ($e_isNumber(value,true) && $_eseecode.coordinates.predefined[value]) {
			$_eseecode.coordinates.userSelection = value;
		} else {
			value = decodeURIComponent(value);
			for (var i=0; i<$_eseecode.coordinates.predefined.length; i++) {
				if (value == $_eseecode.coordinates.predefined[i].name.toLowerCase()) {
					$_eseecode.coordinates.userSelection = i;
					break;
				}
			}
		}
		if (action !== false) {
			$e_resetGridModeSelect();
			$e_changeAxisBasedOnUISettings();
		}
	}
	
	/**
	 * Sets the separation of the lines in the grid
	 * @since 2.3
	 * @public
	 * @param {Number|String} value Pixels between each line in the grid
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_setGridStep(50)
	 */
	function API_setGridStep(value, action) {
		if ($e_isNumber(value,true) && value >= 0) {
			$_eseecode.ui.gridStep = value;
		}
		if (action !== false) {
			$e_resetGrid();
			$e_initializeUISetup();
		}
	}

	/**
	 * Sets the input in I/O
	 * @since 2.3
	 * @public
	 * @param {String} value Input to use
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_setInput("1 1 2 3 5 8")
	 */
	function API_setInput(value, action) {
		if (value === undefined) {
			value = "";
		}
		$_eseecode.execution.inputDefault = value;
		if (action !== false) {
			$e_resetIO(true);
		}
	}
	
	/**
	 * Sets the instruction blocks to make available to the user
	 * @since 2.3
	 * @public
	 * @param {String} value Instructions to makwe available (spearated with semi-colon, parameters can be postfixed to each instruction also separated with semi-colons)
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_setInstructions("turnLeft;90;forward")
	 */
	function API_setInstructions(value, action) {
		var instructions = value.split(";");
		for (var j=0; j<instructions.length; j++) {
			var instructionName = instructions[j].trim();
			var baseInstructionId = instructionName;
			var newInstructionId = baseInstructionId+"-custom"+j;
			if ($_eseecode.instructions.set[baseInstructionId]) {
		        $_eseecode.instructions.set[newInstructionId] = $e_clone($_eseecode.instructions.set[baseInstructionId]);
		        $_eseecode.instructions.set[newInstructionId].show = [];
				$_eseecode.instructions.custom[$_eseecode.instructions.custom.length] = newInstructionId;
				var k = 0;
				while (j+1+k < instructions.length && ($e_isNumber(instructions[j+1+k],true) || $e_isBoolean(instructions[j+1+k],true) || decodeURIComponent(instructions[j+1+k]).charAt(0) == '"' || decodeURIComponent(instructions[j+1+k]).charAt(0) == "'")) {
                    // Doing this when custom instructions have been previously created is redundant but doesn't hurt and allows us to increase variable i skipping the parameters without duplicating code
			        if ($_eseecode.instructions.set[newInstructionId].parameters[k]) {
			        	$_eseecode.instructions.set[newInstructionId].parameters[k].initial = instructions[j+1+k];
			        	$_eseecode.instructions.set[newInstructionId].parameters[k].forceInitial = true;
			        } else {
						console.warn("Error while loading instructions from URL: There is no "+$e_ordinal(k+1)+" parameter for instruction "+instructions[j]+". You tried to set it to: "+instructions[j+1+k])
			        }
			        k++;
				}
				j += k;
				newInstructionId++;
			} else {
				console.warn("Error while loading instructions from URL: Instruction "+instructionName+" doesn't exist")
			}
		}
		if (action !== false) {
			$e_initDialogBlocks($_eseecode.modes.dialog[$_eseecode.modes.dialog[0]].id, $_eseecode.modes.dialog[$_eseecode.modes.dialog[0]].element);
		}
	}
	
	/**
	 * Sets the execution time limit
	 * @since 2.3
	 * @public
	 * @param {Number|String} value Seconds to wait for the execution to finish
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_setTimeout(20)
	 */
	function API_setTimeout(value, action) {
		if ($e_isNumber(value,true) && value >= 0) {
			$_eseecode.execution.timeLimit = value;
		}
		if (action !== false) {
			$e_initializeUISetup();
		}
	}
	
	/**
	 * Shows/Hides the filemenu
	 * @since 2.3
	 * @public
	 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_showFilemenu(false)
	 */
	function API_showFilemenu(value, action) {
		value = value.toLowerCase();
		if (value === false || value == "false" || value == "0" || value == "no" || value == "none") {
			$_eseecode.ui.filemenuVisible = false;
		} else {
			$_eseecode.ui.filemenuVisible = true;
		}
		if (action !== false) {
			$e_resetFilemenu();
		}
	}
	
	/**
	 * Shows/Hides the fullscreen menu
	 * @since 2.3
	 * @public
	 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_showFilemenu(false)
	 */
	function API_showFullscreenmenu(value, action) {
		value = value.toLowerCase();
		if (value === false || value == "false" || value == "0" || value == "no" || value == "none") {
			$_eseecode.ui.fullscreenmenuVisible = false;
		} else {
			$_eseecode.ui.fullscreenmenuVisible = true;
		}
		if (action !== false) {
			$e_toggleFullscreenIcon();
		}
	}
	
	/**
	 * Shows/Hides the grid
	 * @since 2.3
	 * @public
	 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_showGrid(false)
	 */
	function API_showGrid(value, action) {
		value = value.toLowerCase();
		if (value === false || value == "false" || value == "0" || value == "no" || value == "none") {
			$_eseecode.ui.gridVisible = false;
		} else {
			$_eseecode.ui.gridVisible = true;
		}
		if (action !== false) {
			$e_resetGrid();
			$e_initializeUISetup();
		}
	}
	
	/**
	 * Shows/Hides the guide
	 * @since 2.3
	 * @public
	 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_showGuide(false)
	 */
	function API_showGuide(value, action) {
		value = value.toLowerCase();
		if (value === false || value == "false" || value == "0" || value == "no" || value == "none") {
			$_eseecode.ui.guideVisible = false;
		} else {
			$_eseecode.ui.guideVisible = true;
		}
		if (action !== false) {
			$e_resetGuide();
			$e_initializeUISetup();
		}
	}
	
	/**
	 * Switches to the specified language
	 * @since 2.3
	 * @public
	 * @param {String} value Language to switch to
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_switchLanguage("ca")
	 */
	function API_switchLanguage(value, action) {
		$_eseecode.i18n.current = value;
		if (action !== false) {
			$e_switchLanguage();
		}
	}
	
	/**
	 * Switches to the specified view
	 * @since 2.3
	 * @public
	 * @param {String} value View to switch to
	 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
	 * @example API_switchView("build")
	 */
	function API_switchView(value, action) {
		value = value.toLowerCase();
		// Check that the level exists
		if ($e_isNumber(value,true) && $_eseecode.modes.console[value]) {
			$_eseecode.modes.console[0] = value;
		} else {
			for (var id in $_eseecode.modes.console) {
				if (id == 0) {
					continue;
				}
				var levelName = $_eseecode.modes.console[id].name.toLowerCase();
				var levelId = $_eseecode.modes.console[id].id.toLowerCase();
				if (levelName == value || levelId == value) {
					$_eseecode.modes.console[0] = id;
					break;
				}
			}
		}
		if (action !== false) {
			$e_switchConsoleMode();
		}
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
	 * @since 2.2
	 * @public
	 * @param {String} code Code to set as precode
	 * @param {Boolean} [run=true] If false, it doesn't run the code immediately, only when the user executes user code
	 * @example API_uploadPrecode("repeat(4){forward(100)}")
	 */
	function API_uploadPrecode(code, run) {
		if (run === undefined) {
			run = true;
		}
		$e_uploadCode(code, run, true);
	}

