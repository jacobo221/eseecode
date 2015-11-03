"use strict";

	/**
	 * Parses the parameters in the URL
	 * @private
	 * @param {String} [url] URL text to parse. If undefined uses browser's locations
	 * @example $e_loadURLParams()
	 */
	function $e_loadURLParams(definedURL) {
		var url = definedURL;
		if (url === undefined) {
			url = window.location.href;
		}
		var urlParams = url.split("&");
		for (var i=0; i< urlParams.length;i++) {
			var urlParamParts = urlParams[i].match(/(\?|&)?([A-z-_]+)=([^&#]+)/);
			if (urlParamParts !== null) {
				var key = urlParamParts[2].toLowerCase();
				var value = urlParamParts[3];
				if (key == "grid") {
					value = value.toLowerCase();
					if (value == "false" || value == "0" || value == "no" || value == "none") {
						$_eseecode.ui.gridVisible = false;
					} else {
						$_eseecode.ui.gridVisible = true;
					}
					if (definedURL) {
						$e_resetGrid();
						$e_initializeUISetup();
					}
				} else if (key == "gridstep") {
					if ($e_isNumber(value,true) && value >= 0) {
						$_eseecode.ui.gridStep = value;
					}
					if (definedURL) {
						$e_resetGrid();
						$e_initializeUISetup();
					}
				} else if (key == "guide") {
					value = value.toLowerCase();
					if (value == "false" || value == "0" || value == "no" || value == "none") {
						$_eseecode.ui.guideVisible = false;
					} else {
						$_eseecode.ui.guideVisible = true;
					}
					if (definedURL) {
						$e_resetGuide();
						$e_initializeUISetup();
					}
				} else if (key == "filemenu") {
					value = value.toLowerCase();
					if (value == "false" || value == "0" || value == "no" || value == "none") {
						$_eseecode.ui.filemenuVisible = false;
					} else {
						$_eseecode.ui.filemenuVisible = true;
					}
					if (definedURL) {
						$e_resetFilemenu();
					}
				} else if (key == "lang") {
					$_eseecode.i18n.current = value;
					if (definedURL) {
						$e_switchLanguage();
					}
				} else if (key == "timeout") {
					if ($e_isNumber(value,true) && value >= 0) {
						$_eseecode.execution.timeLimit = value;
					}
					if (definedURL) {
						$e_initializeUISetup();
					}
				} else if (key == "axis") {
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
					if (definedURL) {
						$e_resetGridModeSelect();
						$e_changeAxisBasedOnUISettings();
					}
				} else if (key == "view") {
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
					if (definedURL) {
						$e_switchConsoleMode();
					}
				} else if (key == "instructions") {
					var instructions = decodeURIComponent(value).split(";");
					var newInstructionId = $_eseecode.instructions.set.length;
					for (var j=0; j<instructions.length; j++) {
						var baseInstructionId = $e_getInstructionSetIdFromName(instructions[j]);
						if (baseInstructionId >= 0) {
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
									console.log("Error while loading instructions from URL: There is no "+$e_ordinal(k+1)+" parameter for instruction "+instructions[j]+". You tried to set it to: "+instructions[j+1+k])
						        }
						        k++;
							}
							j += k;
							newInstructionId++;
						} else {
							console.log("Error while loading instructions from URL: Instruction "+instructions[j]+" doesn't exist")
						}
            		}
            		if (definedURL) {
            			$e_initDialogBlocks($_eseecode.modes.dialog[$_eseecode.modes.dialog[0]].id, $_eseecode.modes.dialog[$_eseecode.modes.dialog[0]].element);
            		}
				}
			}
		}
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
	 * @since 2.3
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
	 * @since 2.3
	 * @public
	 * @return {String} Output in the I/O
	 * @example API_getOuput("1 1 2 3 5 8")
	 */
	function API_getOuput() {
		return document.getElementById("dialog-io-output").value;
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
	 * Allows to to pass URL parameters dynamically
	 * @since 2.3
	 * @public
	 * @param {String} url URL text to parse
	 * @example API_downloadCode("view=build")
	 */
	function API_loadURLParams(url) {
		$e_loadURLParams(url);
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

