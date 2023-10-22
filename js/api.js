"use strict";

window.addEventListener("message", async (event) => {

	let api_call		= event.data;
	let api_parameters	= [];
	let api_nounce		= undefined;
	if (typeof api_call != "string") {
		api_call		= event.data.action;
		api_parameters	= event.data.parameters;
		api_nounce		= event.data.request;
		if (!api_parameters) api_parameters = [];
		else if (typeof api_parameters != "array") api_parameters = [ api_parameters ];
	}
    
	let response = await window["API_" + api_call](...api_parameters);

	if (api_nounce) event.source.postMessage({ response: response, nounce: api_nounce }, event.origin);

});

/**
 * Parses the parameters in the URL
 * @private
 * @param {String} [urlParams] URL to parse. If unset use browser's location
 * @param {Array} [parameters] Only load this specific parameters
 * @param {Boolean} [action] Run the action (true) or only set it up (false)
 * @param {Array} [except] Do not load this specific parameters
 * @example $e_loadURLParams("view=drag")
 */
async function $e_loadURLParams(url, parameters, action, except) {
	if (url === undefined) {
		url = window.location.href;
		if (action === undefined) {
			action = false;
		}
	} else {
		if (action === undefined) {
			action = true;
		}
	}
	let prerequisites = [ "instructions", "custominstructions", "customInstructions", "code", "precode" ]; // Lowest priority first, highest priority last
	let [urlPage, ...urlParams] = url.split("?");
	urlParams = urlParams.join("?");
	if (!urlParams) urlParams = "";
	urlParams = urlParams.split("&");
	urlParams = urlParams.sort((a, b) => prerequisites.indexOf(b.split("=")[0]) - prerequisites.indexOf(a.split("=")[0]));
	for (var i=0; i<urlParams.length; i++) {
		var urlParamParts = urlParams[i].match(/(\?|&)?([A-z\-_]+)=([^&#]+)/);
		if (urlParamParts !== null) {
			var key = urlParamParts[2].toLowerCase();
			var value = urlParamParts[3];
			if (parameters && parameters.indexOf(key) < 0) continue;
			if (except && except.indexOf(key) >= 0) continue;
			if (key == "e") {
				urlParams = urlParams.concat(atob(value).split("&"));
			} else if (key == "grid") {
				API_showGrid(value, action);
			} else if (key == "gridstep") {
				API_setGridStep(value, action);
			} else if (key == "griddivisions") {
				API_setGridDivisions(value, action);
			} else if (key == "guide") {
				API_showGuide(value, action);
			} else if (key == "viewtabs") {
				API_setViewTabs(value, action);
			} else if (key == "filemenu") {
				API_showFilemenu(value, action);
			} else if (key == "lang") {
				API_switchLanguage(value, action);
			} else if (key == "translations") {
				API_showTranslations(value, action);
			} else if (key == "theme") {
				API_setTheme(value, action);
			} else if (key == "themes") {
				API_showThemes(value);
			} else if (key == "maximize") {
				API_maximize(value, action);
			} else if (key == "input") {
				value = decodeURIComponent(value);
				API_setInput(value);
			} else if (key == "timeout") {
				API_setTimeout(value, action);
			} else if (key == "axis") {
				API_setAxis(value, action);
			} else if (key == "view") {
				API_switchView(value, action);
			} else if (key == "dialog") {
				API_switchDialog(value, action);
			} else if (key == "instructions") {
				value = decodeURIComponent(value);
				API_setInstructions(value, action);
			} else if (key == "custominstructions") {
				value = decodeURIComponent(value);
				API_setCustomInstructions(value, action);
			} else if (key == "forceblocksetup") {
				API_forceBlockSetup(value, action);
			} else if (key == "blocksetup") {
				API_setBlockSetup(value, action);
			} else if (key == "basepath") {
				value = decodeURIComponent(value);
				API_setBasePath(value);
			} else if (key == "fullscreenmenu") {
				API_showFullscreenmenu(value, action);
			} else if (key == "preventexit") {
				API_setPreventExit(value, action);
			} else if (key == "precode") {
				value = decodeURIComponent(value);
				API_uploadPrecode(value);
			} else if (key == "postcode") {
				value = decodeURIComponent(value);
				API_uploadPostcode(value);
			} else if (key == "code") {
				value = decodeURIComponent(value);
				API_uploadCode(value);
			} else if (key == "execute") {
				await API_execute(value);
			} else if (key == "pause") {
				API_setInstructionsPause(value);
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
async function API_loadURLParams(urlParams) {
	await $e_loadURLParams(urlParams);
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
		code = ace.edit("console-write").getValue();
	}
	return code;
}

/**
 * Returns the grid's properties
 * @since 3.0
 * @public
 * @example API_getGridProperties()
 */
function API_getGridProperties() {
	return { width: $_eseecode.canvasArray["grid"].canvas.width, height: $_eseecode.canvasArray["grid"].canvas.height };
}

/**
 * Runs the code in the console
 * @since 2.3
 * @public
 * @param {Boolean} [value] Run or not the code
 * @param {Boolean} [immediate] Run immediately (disable breakpoints and pauses)
 * @example API_execute(value)
 */
async function API_execute(value, immediate) {
	if (value === undefined) {
		value = true;
	}
	if ($e_confirmYes(value)) {
		await $e_executeFromUI(immediate);
	}
}

/**
 * Runs the a function right before running user code
 * @since 3.0
 * @public
 * @param {Function} [callback] Function to call before running user code
 * @example API_prerun(function() { alert("RUN!"); })
 */
async function API_prerun(callback) {
	$_eseecode.execution.api_prerun = callback;
}

/**
 * Runs the a function right after running user code
 * @since 3.0
 * @public
 * @param {Function} [callback] Function to call after running user code
 * @example API_postrun(function() { alert("DONE!"); })
 */
async function API_postrun(callback) {
	$_eseecode.execution.api_postrun = callback;
}

/**
 * Sets tool in fullscreen
 * @since 2.3
 * @public
 * @param {Boolean} [fullscreen] Force fullscreen
 * @example API_fullscreen()
 */
function API_fullscreen(value) {
	if ($e_confirmYes(value)) {
		value = true;
	} else {
		value = false;
	}
	$e_toggleFullscreen(value);
}

/**
 * Sets the code console maximized
 * @since 2.4
 * @public
 * @param {Boolean} [fullscreen] Force fullscreen
 * @example API_maximize()
 */
function API_maximize(value) {
	if ($e_confirmYes(value)) {
		value = true;
	} else {
		value = false;
	}
	$e_resizeConsole(!value);
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
 * Gets the input from I/O
 * @since 2.3
 * @public
 * @return {String} Input in the I/O
 * @example API_getInput()
 */
function API_getInput() {
	return document.getElementById("dialog-io-input").value;
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
 * @example API_getOuput()
 */
function API_getOuput() {
	return document.getElementById("dialog-io-output").value;
}

/**
 * Gets the number of lines of code in the last execution
 * @since 3.0
 * @public
 * @return {Number} Number of lines of code in the last execution
 * @example API_getLastExecutionCodeLinesCount()
 */
function API_getLastExecutionCodeLinesCount() {
	if (!$_eseecode.last_execution) return false;
	return $_eseecode.last_execution.linesCount;
}

/**
 * Gets the number of instructions run in the last execution
 * @since 3.0
 * @public
 * @return {Number} Number of instructions run in the last execution
 * @example API_getLastExecutionInstuctionsCount()
 */
function API_getLastExecutionInstuctionsCount() {
	if (!$_eseecode.last_execution) return false;
	return $_eseecode.last_execution.instructionsCount;
}

/**
 * Gets the exection time in the last execution
 * @since 3.0
 * @public
 * @return {Number} Execution time of code in the last execution
 * @example API_getLastExecutionTime()
 */
function API_getLastExecutionTime() {
	if (!$_eseecode.last_execution) return false;
	return $_eseecode.last_execution.time;
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
 * @param {Boolean} gridVisible Can be use to force toggling the grid
 * @param {Boolean} guideVisible Can be use to force toggling the guide
 * @return {String} Data URL of the whiteboard
 * @example API_getWhiteboard()
 */
function API_getWhiteboard(gridVisible, guideVisible) {
	return $e_downloadWhiteboard(true, gridVisible, guideVisible);
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
	value = typeof value == "string" ? value.toLowerCase() : value;
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
 * Sets if block setup is forced in level2
 * @since 3.0
 * @public
 * @param {Boolean} value Whether or not to force block setup when adding instructions on level2
 * @example API_forceBlockSetup(true)
 */
function API_forceBlockSetup(value) {
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e_confirmNo(value)) {
		$_eseecode.ui.forceBlockSetup = false;
	} else {
		$_eseecode.ui.forceBlockSetup = true;
	}
}

/**
 * Sets the default block setup style
 * @since 2.4
 * @public
 * @param {String} value Pixels between each line in the grid
 * @example API_setBlockSetup("basic")
 */
function API_setBlockSetup(value) {
	if (value) {
		value = value.toLocaleLowerCase();
		if (value === "visual" || value === "text") {
			$_eseecode.ui.setupType = value;
		}
	}
}

/**
 * Sets the base path for loading images
 * @since 3.0
 * @public
 * @param {String} value Base path, can be a full URL
 * @example API_setBasePath("https://eseeco.de/example/")
 */
function API_setBasePath(value) {
	if (value === undefined) {
		value = "";
	}
	$_eseecode.execution.basepath = value;
}

/**
 * Sets the separation of the lines in the grid
 * @since 2.3
 * @deprecated since version 2.4
 * @public
 * @param {Number|String} value Pixels between each line in the grid
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example API_setGridStep(50)
 */
function API_setGridStep(value, action) {
	if ($e_isNumber(value,true) && value > 0) {
		$_eseecode.ui.gridStep = value;
	}
	if (action !== false) {
		$e_resetGrid();
		$e_initializeUISetup();
	}
}

/**
 * Sets the number of the lines in the grid
 * @since 2.4
 * @public
 * @param {Number|String} value Number of lines in the grid
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example API_setGridDivisions(10)
 */
function API_setGridDivisions(value, action) {
	if ($e_isNumber(value,true)) {
		value = parseInt(value);
		if (value > 0 && value < $_eseecode.whiteboard.offsetWidth/2) {
			$_eseecode.ui.gridStep = $_eseecode.whiteboard.offsetWidth / (value + 1);
		}
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
 * @param {String} value Instructions to make available (separated with semi-colon, parameters can be postfixed to each instruction also separated with semi-colons)
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example API_setInstructions("turnLeft;90;forward")
 */
function API_setInstructions(value, action) {
	$_eseecode.session.disableCode = false; // By default enable code, but if there's a block with maxInstances enabled we must disable code
	var instructions = value.split(";");
	var customNameCount = {};
	$_eseecode.instructions.custom = [];
	for (var j=0; j<instructions.length; j++) {
		var instructionName = instructions[j].trim();
		if (customNameCount[instructionName] === undefined) {
			customNameCount[instructionName] = 1;
		} else {
			customNameCount[instructionName]++;
		}
		var baseInstructionId = instructionName;
		var newInstructionId = baseInstructionId+"-custom"+customNameCount[instructionName];
		if ($_eseecode.instructions.set[baseInstructionId]) {
	        $_eseecode.instructions.set[newInstructionId] = $e_clone($_eseecode.instructions.set[baseInstructionId]);
	        $_eseecode.instructions.set[newInstructionId].show = [];
	        var customInstructionsNum = 0;
	        if ($_eseecode.instructions.custom) {
	        	customInstructionsNum = $_eseecode.instructions.custom.length;
	        }
			$_eseecode.instructions.custom[customInstructionsNum] = newInstructionId;
			var k = 0;
			while (j+1+k < instructions.length && (
			  $e_isNumber(instructions[j+1+k],true) ||
			  $e_isBoolean(instructions[j+1+k],true) ||
			  decodeURIComponent(instructions[j+1+k]).charAt(0) == '"' ||
			  decodeURIComponent(instructions[j+1+k]).charAt(0) == "'" ||
			  instructions[j+1+k] == "showParams" ||
			  instructions[j+1+k] == "noChange" ||
			  instructions[j+1+k].indexOf("param:") == 0 ||
			  instructions[j+1+k].indexOf("count:") == 0)) {
                // Doing this when custom instructions have been previously created is redundant but doesn't hurt and allows us to increase variable i skipping the parameters without duplicating code
                if (instructions[j+1+k] == "showParams") {
                	$_eseecode.instructions.set[newInstructionId].showParams = true;
                } else if (instructions[j+1+k] == "noChange") {
                	$_eseecode.instructions.set[newInstructionId].noChange = true;
                } else if (instructions[j+1+k].indexOf("count:") == 0) {
                	var maxCount = parseInt(instructions[j+1+k].split(":")[1]);
                	if ($e_isNumber(maxCount)) {
                		$_eseecode.session.disableCode = true; // Disable Code view since we cannot count blocks usage there
                		$_eseecode.instructions.set[newInstructionId].maxInstances = maxCount;
                		$_eseecode.instructions.set[newInstructionId].countInstances = 0;
                	}
                } else if ($_eseecode.instructions.set[newInstructionId].parameters[k]) {
	            	var param = instructions[j+1+k];
                	if (param.indexOf("param:") == 0) {
                		param = param.split(":")[1];
                	}
	            	$_eseecode.instructions.set[newInstructionId].parameters[k].initial = param;
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
	if ($_eseecode.session.disableCode) {
		ace.edit("console-write").setOptions({readOnly: true});
	} else {
		ace.edit("console-write").setOptions({readOnly: false});
	}
}

/**
 * Sets definitions of custom instructions
 * @since 3.0
 * @public
 * @param {Number|String} value Seconds to wait for the execution to finish
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example API_setCustomInstructions({...})
 */
function API_setCustomInstructions(value, action) {
	try {
		var instructions = JSON.parse(value);
	} catch(e) { console.log("Invalid JSON: " + e); }
	if (!instructions) return;
	(Array.isArray(instructions) ? instructions : Object.values(instructions)).forEach(instruction_details => {
		let instruction_name = instruction_details.name;
		$_eseecode.instructions.set[instruction_name] = instruction_details;
		if (instruction_details.icon) $_eseecode.instructions.icons[instruction_name] = function(ctx, width, height, param) {
			var margin = 15;
			var img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = function(e) {
				var tempCanvas = document.createElement("canvas");
				tempCanvas.width = width - margin;
				tempCanvas.height = height - margin;
				var tempCtx = tempCanvas.getContext("2d");
				tempCtx.save();
				tempCtx.drawImage(img, 0, 0, width - 2 * margin, height - 2 * margin);
				tempCtx.restore();
				ctx.drawImage(tempCanvas, margin, margin);
				ctx.block.style.backgroundImage = "url("+ctx.canvas.toDataURL()+")";
			}
			img.src = instruction_details.icon;
		};
	});
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
		// Apply to currently running code if any
		$_eseecode.execution.endLimit = $_eseecode.execution.startTime+value*1000;
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
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e_confirmNo(value)) {
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
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e_confirmNo(value)) {
		$_eseecode.ui.fullscreenmenuVisible = false;
	} else {
		$_eseecode.ui.fullscreenmenuVisible = true;
	}
	if (action !== false) {
		$e_toggleFullscreenIcon();
	}
}

/**
 * Prevent exit when user has entered code
 * @since 2.4
 * @public
 * @param {Boolean|String} value Whether to prevent exit when user has coded
 * @example API_setPreventExit(false)
 */
function API_setPreventExit(value) {
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e_confirmNo(value)) {
		$_eseecode.ui.preventExit = false;
	} else {
		$_eseecode.ui.preventExit = true;
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
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e_confirmNo(value)) {
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
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e_confirmNo(value)) {
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
 * Shows/Hides views tabs
 * @since 2.4
 * @public
 * @param {String} value List of view tabs to display, separated with colon or semi-colon
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example API_setViewTabs("touch,drag")
 */
function API_setViewTabs(value, action) {
	if (value && value.length > 0) {
		for (var i=1, tab=undefined; tab = document.getElementById("console-tabs-level"+i); i++) {
			tab.style.display = "none";
		}
	}
	value = typeof value == "string" ? value.toLowerCase() : value;
	value = value.replace(/,/g , ";");
	var viewtabs = value.split(";");
	for (var i=0; i < viewtabs.length; i++) {
		var viewtab = viewtabs[i];
		var tabToShow = undefined;
		// Check that the level exists
		if ($e_isNumber(viewtab,true) && $_eseecode.modes.console[viewtab]) {
			tabToShow = viewtab;
		} else {
			for (var id in $_eseecode.modes.console) {
				if (id == 0) {
					continue;
				}
				var levelName = $_eseecode.modes.console[id].name.toLowerCase();
				var levelId = $_eseecode.modes.console[id].id.toLowerCase();
				if (levelName == viewtab || levelId == viewtab) {
					tabToShow = id;
					break;
				}
			}
		}
		if (tabToShow) {
			document.getElementById("console-tabs-level"+tabToShow).style.display = "block";
		}
	}
}

/**
 * Switches to the specified dialog
 * @since 2.4
 * @public
 * @param {String} value Dialog to switch to
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example API_switchDialog("io")
 */
function API_switchDialog(value, action) {
	value = typeof value == "string" ? value.toLowerCase() : value;
	// Check that the dialog exists
	if ($e_isNumber(value,true) && $_eseecode.modes.dialog[value]) {
		$_eseecode.modes.dialog[0] = value;
	} else {
		for (var id in $_eseecode.modes.dialog) {
			if (id == 0) {
				continue;
			}
			var levelName = $_eseecode.modes.dialog[id].name.toLowerCase();
			var levelId = $_eseecode.modes.dialog[id].id.toLowerCase();
			if (levelName == value || levelId == value) {
				$_eseecode.modes.dialog[0] = id;
				break;
			}
		}
	}
	if (action !== false) {
		$e_switchDialogMode();
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
	$e_switchTranslation(value, action);

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
	value = typeof value == "string" ? value.toLowerCase() : value;
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
	$e_uploadCode(code, run);
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
	$e_uploadCode(code, run, "precode");
}

/**
 * Loads postcode into the console
 * @since 2.4
 * @public
 * @param {String} code Code to set as postcode
 * @example API_uploadPostcode("repeat(4){forward(100)}")
 */
function API_uploadPostcode(code) {
	$e_uploadCode(code, false, "postcode");
}

/**
 * Runs code silently
 * @since 2.3
 * @public
 * @param {String} code Code to run
 * @example API_runCode("repeat(4){forward(100)}")
 */
function API_runCode(code) {
	$e_execute(true, code);
}

/**
 * Marks the code as saved now
 * @since 2.4
 * @public
 * @example API_updateSavedTime()
 */
function API_updateSavedTime() {
	$_eseecode.session.lastSave = new Date().getTime();
}

/**
 * Shows/Hides the translations menu
 * @since 2.4
 * @public
 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example API_showTranslations(false)
 */
function API_showTranslations(value, action) {
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e_confirmNo(value)) {
		$_eseecode.ui.translationsmenuVisible = false;
	} else {
		$_eseecode.ui.translationsmenuVisible = true;
	}
	if (action !== false) {
		$e_resetTranslationsmenu();
	}
}

/**
 * Switches the active theme
 * @since 2.4
 * @public
 * @param {String} theme Name of the theme to use
 * @param {Boolean} [run=true] If true, applies the theme immediately
 * @example API_setTheme("sharp")
 */
function API_setTheme(theme, run) {
	if (!$_eseecode.session.ready && !run) {
		return;
	}
	$e_switchTheme(theme, true);
}

/**
 * Shows/Hides the themes menu
 * @since 2.4
 * @public
 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example API_showThemes(false)
 */
function API_showThemes(value, action) {
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e_confirmNo(value)) {
		$_eseecode.ui.themesmenuVisible = false;
	} else {
		$_eseecode.ui.themesmenuVisible = true;
	}
	if (action !== false) {
		$e_resetThemesmenu();
	}
}

/**
 * Pauses every instruction for a certain amount of time
 * @since 3.0
 * @public
 * @param {Number} milliseconds Time to pause each instruction
 * @example API_setInstructionsPause(500)
 */
function API_setInstructionsPause(milliseconds) {
	var value = parseInt(milliseconds);
	$_eseecode.execution.pause = value;
	$e_resetInstructionsPause();
}

/**
 * Returns if the eSeeCode is ready
 * @since 2.4
 * @public
 * @return {String} The date since it is ready, undefined otherwise
 * @example API_isReady()
 */
function API_isReady() {
	return $_eseecode.session.ready;
}
