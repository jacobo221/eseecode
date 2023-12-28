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
	
	let response = await $e.api[api_call](...api_parameters);

	if (api_nounce) event.source.postMessage({ response: response, nounce: api_nounce }, event.origin);

});

/**
 * Parses the parameters in the URL
 * @since 2.3
 * @public
 * @param {String} [url] URL to parse. If unset use browser's location
 * @param {Array} [whitelist] Only load this specific parameters
 * @param {Boolean} [action] Run the action (true) or only set it up (false)
 * @param {Array} [blacklist] Do not load this specific parameters
 * @example $e.api.api.loadURLParams("view=drag")
 */
$e.api.loadURLParams = async function(url = "", whitelist, action = true, blacklist) { // By default explicit API calls result in immediate UI effect
	let url_params = "";
	if (url.includes("?")) {
		url_params = url.split("?")[1]; // Full URL with parameters
	} else {
		if (url.match(/^https?:\/\/|file:\/\//)) { // Full URL without parameters
			url_params = "";
		} else {
			url_params = url; // Only parameters
		}
	}
	url_params = new URLSearchParams(url_params);
	if (url_params.get("e")) {
		const encodedParamsSearch = new URLSearchParams(atob(url_params.get("e")));
		encodedParamsSearch.forEach((k, v) => url_params.append(k, v));
	}

	let prerequisites = [ "instructions", "custominstructions", "customInstructions", "code", "precode" ]; // Lowest priority first, highest priority last
	Array.from(url_params).sort((a, b) => prerequisites.indexOf(b[0]) - prerequisites.indexOf(a[0])).forEach(async function(param) {
		const key = param[0].toLowerCase();
		let value = param[1];
		if (whitelist && !whitelist.includes(key)) return;
		if (blacklist && blacklist.includes(key)) return;
		if (key == "e") return; // Already processed

		if (key == "grid") {
			$e.api.showGrid(value, action);
		} else if (key == "gridstep") {
			$e.api.setGridStep(value, action);
		} else if (key == "griddivisions") {
			$e.api.setGridDivisions(value, action);
		} else if (key == "guide") {
			$e.api.showGuide(value, action);
		} else if (key == "guideimage") {
			$e.api.setGuideImage(value, action);
		} else if (key == "guidesize") {
			$e.api.setGuideSize(value, action);
		} else if (key == "background") {
			$e.api.setWhiteboardBackground(value, action);
		} else if (key == "viewtabs") {
			$e.api.setViewTabs(value, action);
		} else if (key == "filemenu") {
			$e.api.showFilemenu(value, action);
		} else if (key == "lang") {
			$e.api.switchLanguage(value, action);
		} else if (key == "translations") {
			$e.api.showTranslations(value, action);
		} else if (key == "theme") {
			$e.api.setTheme(value, action);
		} else if (key == "themes") {
			$e.api.showThemes(value);
		} else if (key == "maximize") {
			$e.api.maximize(value, action);
		} else if (key == "flow") {
			$e.api.showFlow(value, action);
		} else if (key == "flowtab") {
			$e.api.showFlowTab(value, action);
		} else if (key == "input") {
			$e.api.setInput(value);
		} else if (key == "axis") {
			$e.api.setAxis(value, action);
		} else if (key == "view") {
			$e.api.switchView(value, action);
		} else if (key == "dialog" || key == "toolbox") { // dialog is deprecated since 4.0
			$e.api.switchToolbox(value, action);
		} else if (key == "instructions") {
			$e.api.setInstructions(value, action);
		} else if (key == "custominstructions") {
			$e.api.setCustomInstructions(value, action);
		} else if (key == "forceblocksetup") {
			$e.api.forceBlockSetup(value, action);
		} else if (key == "blocksetup") {
			$e.api.setBlockSetup(value, action);
		} else if (key == "basepath") {
			$e.api.setBasePath(value);
		} else if (key == "fullscreenmenu") {
			$e.api.showFullscreenmenu(value, action);
		} else if (key == "preventexit") {
			$e.api.setPreventExit(value, action);
		} else if (key == "precode") {
			$e.api.uploadPrecode(value);
		} else if (key == "postcode") {
			$e.api.uploadPostcode(value);
		} else if (key == "code") {
			$e.api.uploadCode(value);
		} else if (key == "execute") {
			await $e.api.execute(value);
		} else if (key == "pause") {
			$e.api.setInstructionsPause(value);
		} else if (key == "stepsize") {
			$e.api.setStepSize(value);
		} else if (key == "breakpoints") {
			$e.api.addBreakpoints(value, false, action);
		} else if (key == "watches") {
			$e.api.addWatches(value, false, action);
		} else if (key == "whiteboardresolution") {
			$e.api.setWhiteboardResolution(value, action);
		} else if (key == "v") {
			// Do nothing, this is only used to skip caching in URLs
		} else {
			console.error("Unknown API key", key);
		}
	});

	// Default to browser language if no language has been defined
	if (!whitelist && !url_params.get("lang") && navigator.language) $e.ui.translations.switch(navigator.language.substring(0, 2));

};

/**
 * Loads data from a file. This function can be called by embedding apps such as Android's webview or iOS's uiwebview, for example they could replace $e.ui.openCodeFile() and then call $e.ide.loadFile
 * @private
 * @param data Data to load
 * @param filename File name where the data was read from
 * @param call Function to call
 * @example $e.api.ide.loadFile("forward(100)", "esee.code", $e.ui.loadCodeFile)
 */
$e.api.loadFile = (data, filename, call) => {
	return call(data, filename);
};

/**
 * Returns the user's code
 * @public
 * @return {String} User code
 * @example $e.api.downloadCode()
 */
$e.api.downloadCode = () => {
	const mode = $e.modes.views.current.type;
	let code;
	if (mode == "blocks") {
		code = $e.ide.blocks.toCode($e.ui.element.querySelector("#view-blocks").firstChild);
	} else if (mode == "write") {
		code = ace.edit("view-write").getValue();
	}
	return code;
};

/**
 * Returns the grid's properties
 * @since 3.0
 * @public
 * @example $e.api.getGridProperties()
 */
$e.api.getGridProperties = () => {
	return { width: $e.backend.whiteboard.layers.available["grid"].canvas.width, height: $e.backend.whiteboard.layers.available["grid"].canvas.height };
};

/**
 * Runs the code in the view
 * @since 2.3
 * @public
 * @param {Boolean} [value] Run or not the code
 * @param {Boolean} [immediate] Run immediately (disable breakpoints and pauses)
 * @example $e.api.execution.execute(value)
 */
$e.api.execute = async function (value = true, immediate) {
	if ($e.confirmYes(value)) {
		$e.session.runFrom = "api";
		await $e.ide.execute(immediate);
	}
};

/**
 * Runs the a function right before running user code
 * @since 3.0
 * @public
 * @param {Function} [callback] Function to call before running user code
 * @example $e.api.prerun(function() { alert("RUN!"); })
 */
$e.api.prerun = async function (callback) {
	$e.execution.$e.prerun = callback;
};

/**
 * Runs the a function right after running user code
 * @since 3.0
 * @public
 * @param {Function} [callback] Function to call after running user code
 * @example $e.api.postrun(function() { alert("DONE!"); })
 */
$e.api.postrun = async function (callback) {
	$e.execution.$e.postrun = callback;
};

/**
 * Sets tool in fullscreen
 * @since 2.3
 * @public
 * @param {Boolean} [fullscreen] Force fullscreen
 * @example $e.api.fullscreen()
 */
$e.api.fullscreen = (value) => {
	if ($e.confirmYes(value)) {
		value = true;
	} else {
		value = false;
	}
	$e.ui.toggleFullscreen(value);
};

/**
 * Sets the code view maximized
 * @since 2.4
 * @public
 * @param {Boolean} [fullscreen] Force fullscreen
 * @example $e.api.maximize()
 */
$e.api.maximize = (value) => {
	if ($e.confirmYes(value)) {
		value = true;
	} else {
		value = false;
	}
	$e.ui.resizeView(!value);
};

/**
 * Switches to flow view
 * @since 4.0
 * @public
 * @param {Boolean} [displayFlow] If true, switches to flow view
 * @example $e.api.showFlow()
 */
$e.api.showFlow = (value) => {
	if ($e.confirmYes(value)) {
		value = true;
	} else {
		value = false;
	}
	$e.ui.blocks.toggleFlow(value);
};

/**
 * Returns the name of the current toolbox
 * @since 4.0
 * @public
 * @returns {String} Name of the current toolbox
 * @example $e.api.getToolbox()
 */
$e.api.getToolbox = () => {
	return $e.modes.toolboxes.current.name.toLowerCase();
};

/**
 * @since 2.3
 * @deprecated since 4.0
 */
$e.api.getDialog = $e.api.getToolbox;

/**
 * Gets the input from I/O
 * @since 2.3
 * @public
 * @return {String} Input in the I/O
 * @example $e.api.getInput()
 */
$e.api.getInput = () => {
	return $e.ui.element.querySelector("#toolbox-io-input").value;
};

/**
 * Returns an image grid containing all the layers
 * @private
 * @param {Number} columns Amount of columns per line
 * @return {*} The image binary
 * @example $e.api.getLayersAsGrid(5)
 */
$e.api.getLayersAsGrid = (columns) => {
	return $e.ide.imagifyLayers(true, columns).imageBinary;
};

/**
 * Returns an image animation containing all the layers
 * @private
 * @param {Number} milliseconds Waiting interval between each layer, in milliseconds
 * @return {*} The image binary
 * @example $e.api.getLayersAsGrid(5)
 */
$e.api.getLayersAsAnimation = (milliseconds) => {
	return $e.ide.imagifyLayers(false, milliseconds).imageBinary;
};

/**
 * Gets the output from I/O
 * @since 2.3
 * @public
 * @return {String} Output in the I/O
 * @example $e.api.getOuput()
 */
$e.api.getOuput = () => {
	return $e.ui.element.querySelector("#toolbox-io-output").textContent;
};

/**
 * Gets the number of lines of code in the last execution
 * @since 3.0
 * @public
 * @return {Number} Number of lines of code in the last execution
 * @example $e.api.getLastExecutionCodeLinesCount()
 */
$e.api.getLastExecutionCodeLinesCount = () => {
	if (!$e.last_execution) return false;
	return $e.last_execution.linesCount;
};

/**
 * Gets the number of instructions run in the last execution
 * @since 3.0
 * @public
 * @return {Number} Number of instructions run in the last execution
 * @example $e.api.getLastExecutionInstuctionsCount()
 */
$e.api.getLastExecutionInstuctionsCount = () => {
	if (!$e.last_execution) return false;
	return $e.last_execution.instructionsCount;
};

/**
 * Gets the exection time in the last execution
 * @since 3.0
 * @public
 * @return {Number} Execution time of code in the last execution
 * @example $e.api.getLastExecutionTime()
 */
$e.api.getLastExecutionTime = () => {
	if (!$e.last_execution) return false;
	return $e.last_execution.time;
};

/**
 * Returns the name of the current view
 * @since 2.3
 * @public
 * @returns {String} Name of the current view
 * @example $e.api.getView()
 */
$e.api.getView = () => {
	return $e.modes.views.current.name.toLowerCase();
};

/**
 * Returns the image binary of the whiteboard
 * @since 2.3
 * @public
 * @param {Boolean} gridVisible Can be use to force toggling the grid
 * @param {Boolean} guideVisible Can be use to force toggling the guide
 * @return {String} Data URL of the whiteboard
 * @example $e.api.getWhiteboard()
 */
$e.api.getWhiteboard = (gridVisible, guideVisible) => {
	return $e.ide.downloadWhiteboard(true, gridVisible, guideVisible);
};

/**
 * Resets the execution
 * @since 2.3
 * @public
 * @example $e.api.reset()
 */
$e.api.reset = () => {
	$e.ide.reset();
};

/**
 * Restarts eSeeCode interface
 * @since 2.3
 * @public
 * @example $e.api.restart()
 */
$e.api.restart = () => {
	$e.ui.reset();
	$e.ui.msgBox.close();
};

/**
 * Chooses the predefined axis to use for the grid
 * @since 2.3
 * @public
 * @param {Number|String} value Index of the predefined axis to use
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.setAxis(0)
 */
$e.api.setAxis = (value, action = true) => {
	value = typeof value == "string" ? value.toLowerCase() : value;
	const axis = undefined;
	if ($e.isNumber(value, true) && $e.backend.whiteboard.axis.predefined[value]) {
		$e.backend.whiteboard.axis.userSelection = value;
	} else {
		$e.backend.whiteboard.axis.predefined.some((coords, i) => {
			if (value == $coords.name.toLowerCase()) {
				$e.backend.whiteboard.axis.userSelection = i;
				return true;
			}
		});
	}
	if (action) {
		$e.ui.resetGridModeSelect();
		$e.backend.whiteboard.axis.update();
	}
};

/**
 * Sets if block setup is forced in level2
 * @since 3.0
 * @public
 * @param {Boolean} value Whether or not to force block setup when adding instructions on level2
 * @example $e.api.forceBlockSetup(true)
 */
$e.api.forceBlockSetup = (value) => {
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e.confirmNo(value)) {
		$e.ui.blocks.forceSetup = false;
	} else {
		$e.ui.blocks.forceSetup = true;
	}
};

/**
 * Sets the default block setup style
 * @since 2.4
 * @public
 * @param {String} value Pixels between each line in the grid
 * @example $e.api.setBlockSetup("basic")
 */
$e.api.setBlockSetup = (value) => {
	if (value) {
		value = value.toLocaleLowerCase();
		if (value === "visual" || value === "text") {
			$e.ui.setupType = value;
		}
	}
};

/**
 * Sets the base path for loading images and sounds
 * @since 3.0
 * @public
 * @param {String} value Base path, can be a full URL
 * @example $e.api.setBasePath("https://eseeco.de/example/")
 */
$e.api.setBasePath = (value = "") => {
	$e.execution.basepath = value;
};

/**
 * Sets a custom image for the whiteboard guide
 * @since 3.2
 * @public
 * @param {String} value URL where the image is, can be a relative path
 * @example $e.api.setGuideImage("https://eseecode.com/favicon.png")
 */
$e.api.setGuideImage = (value) => {
	$e.execution.guide.imageUrl = value;
};

/**
 * Sets a custom size for the whiteboard guide
 * @since 3.2
 * @public
 * @param {Integer} value Size in pixels of the guide
 * @example $e.api.setGuideSize(25)
 */
$e.api.setGuideSize = (value) => {
	$e.execution.guide.size = value;
};

/**
 * Sets the background of the whiteboard
 * @since 3.2
 * @public
 * @param {String} url URL where the background is, can be a relative path
 * @example $e.api.setWhiteboardBackground("https://eseecode.com/favicon.png")
 */
$e.api.setWhiteboardBackground = (value) => {
	$e.execution.background = value;
};

/**
 * Sets the separation of the lines in the grid
 * @since 2.3
 * @deprecated since version 2.4
 * @public
 * @param {Number|String} value Pixels between each line in the grid
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.setGridStep(50)
 */
$e.api.setGridStep = (value, action = true) => {
	if ($e.isNumber(value, true) && value > 0) {
		$e.ui.gridStep = value;
	}
	if (action) {
		$e.ide.resetGrid();
		$e.ui.initializeSetup();
	}
};

/**
 * Sets the number of the lines in the grid
 * @since 2.4
 * @public
 * @param {Number|String} value Number of lines in the grid
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.setGridDivisions(10)
 */
$e.api.setGridDivisions = (value, action = true) => {
	if ($e.isNumber(value, true)) {
		value = parseInt(value);
		if (value > 0 && value < $e.backend.whiteboard.width / 2) {
			$e.ui.gridStep = $e.backend.whiteboard.width / (value + 1);
		}
	}
	if (action) {
		$e.ide.resetGrid();
		$e.ui.initializeSetup();
	}
};

/**
 * Sets the input in I/O
 * @since 2.3
 * @public
 * @param {String} value Input to use
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.setInput("1 1 2 3 5 8")
 */
$e.api.setInput = (value = "", action = true) => {
	$e.backend.io.reset();
	$e.execution.inputDefault = value;
	if (action) $e.ui.resetIO(true);
};

/**
 * Sets the instruction blocks to make available to the user
 * @since 2.3
 * @public
 * @param {String} value Instructions to make available (separated with semi-colon, parameters can be postfixed to each instruction also separated with semi-colons)
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.setInstructions("turnLeft;90;forward")
 */
$e.api.setInstructions = (value, action = true) => {
	$e.session.disableCode = false; // By default enable code, but if there's a block with maxInstances enabled we must disable code
	const instructions = value.split(";");
	const customNameCount = {};
	$e.instructions.custom = [];
	instructions.forEach((instruction, i) => {
		const instructionName = instruction.trim();
		if (customNameCount[instructionName] === undefined) {
			customNameCount[instructionName] = 1;
		} else {
			customNameCount[instructionName]++;
		}
		const baseInstructionId = instructionName;
		const newInstructionId = baseInstructionId + "-custom" + customNameCount[instructionName];
		if ($e.instructions.set[baseInstructionId]) {
			$e.instructions.set[newInstructionId] = $e.clone($e.instructions.set[baseInstructionId]);
			$e.instructions.set[newInstructionId].show = [];
			let customInstructionsNum = 0;
			if ($e.instructions.custom) {
				customInstructionsNum = $e.instructions.custom.length;
			}
			$e.instructions.custom[customInstructionsNum] = newInstructionId;
			for (let k = 0; j + 1 + k < instructions.length && (
			$e.isNumber(instructions[j + 1 + k], true) ||
			$e.isBoolean(instructions[j + 1 + k], true) ||
			instructions[j + 1 + k].startsWith('"') ||
			instructions[j + 1 + k].startsWith("'") ||
			instructions[j + 1 + k] == "showParams" ||
			instructions[j + 1 + k] == "noChange" ||
			instructions[j + 1 + k].startsWith("param:") ||
			instructions[j + 1 + k].startsWith("count:")); k++) {
				// Doing this when custom instructions have been previously created is redundant but doesn't hurt and allows us to increase variable i skipping the parameters without duplicating code
				if (instructions[j + 1 + k] == "showParams") {
					$e.instructions.set[newInstructionId].showParams = true;
				} else if (instructions[j + 1 + k] == "noChange") {
					$e.instructions.set[newInstructionId].noChange = true;
				} else if (instructions[j + 1 + k].startsWith("count:")) {
					const maxCount = parseInt(instructions[j + 1 + k].split(":")[1]);
					if ($e.isNumber(maxCount)) {
						$e.session.disableCode = true; // Disable Code view since we cannot count blocks usage there
						$e.instructions.set[newInstructionId].maxInstances = maxCount;
						$e.instructions.set[newInstructionId].countInstances = 0;
					}
				} else if ($e.instructions.set[newInstructionId].parameters[k]) {
					let param = instructions[j + 1 + k];
					if (param.startsWith("param:")) {
						param = param.split(":")[1];
					}
					$e.instructions.set[newInstructionId].parameters[k].initial = param;
					$e.instructions.set[newInstructionId].parameters[k].forceInitial = true;
				} else {
					console.error("Error while loading instructions from URL: There is no " + $e.ordinal(k + 1) + " parameter for instruction " + instruction + ". You tried to set it to: " + instructions[j + 1 + k]);
				}
			}
			j += k;
			newInstructionId++;
		} else {
			console.error("Error while loading instructions from URL: Instruction " + instructionName + " doesn't exist");
		}
	});
	if (action) $e.ui.blocks.initToolbox($e.modes.toolboxes.current.id, $e.modes.toolboxes.current.element);
	ace.edit("view-write").setOptions({readOnly: !!$e.session.disableCode});
};

/**
 * Sets definitions of custom instructions
 * @since 3.0
 * @public
 * @param {Number|String} value JSON or object defining an instruction using set.js structure plus an optional "run" property with the body of the function code and an "icon" property with the URL or relative path of the icon representing the instruction
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.setCustomInstructions({...})
 */
$e.api.setCustomInstructions = (value, action = true) => {
	let instructions;
	try {
		instructions = JSON.parse(value);
	} catch(error) { console.error("Invalid JSON: " + error); }
	if (!instructions) return;
	(Array.isArray(instructions) ? instructions : Object.values(instructions)).forEach(instruction_details => {
		let instruction_name = instruction_details.name;
		$e.instructions.set[instruction_name] = instruction_details;
		if (instruction_details.icon) $e.instructions.icons[instruction_name] = (iconEl, param) => {
			const margin = height < 15 * 4 ? 0 : 15;
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => {
				const tempCanvas = document.createElement("canvas");
				tempCanvas.width = width - margin;
				tempCanvas.height = height - margin;
				const tempCtx = tempCanvas.getContext("2d");
				tempCtx.save();
				tempCtx.drawImage(img, 0, 0, width - 2 * margin, height - 2 * margin);
				tempCtx.restore();
				ctx.drawImage(tempCanvas, margin, margin);
			}
			img.src = instruction_details.icon;
		};
	});
	if (action) $e.ui.blocks.initToolbox($e.modes.toolboxes.current.id, $e.modes.toolboxes.current.element);
};

/**
 * Shows/Hides the filemenu
 * @since 2.3
 * @public
 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.showFilemenu(false)
 */
$e.api.showFilemenu = (value, action = true) => {
	value = typeof value == "string" ? value.toLowerCase() : value;
	$e.ui.filemenuVisible = !$e.confirmNo(value);
	if (action) $e.ui.resetFileMenu();
};

/**
 * Shows/Hides the fullscreen menu
 * @since 2.3
 * @public
 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.showFilemenu(false)
 */
$e.api.showFullscreenmenu = (value, action = true) => {
	value = typeof value == "string" ? value.toLowerCase() : value;
	$e.ui.fullscreenmenuVisible = !$e.confirmNo(value);
	if (action) $e.ui.toggleFullscreenIcon();
};

/**
 * Prevent exit when user has entered code
 * @since 2.4
 * @public
 * @param {Boolean|String} value Whether to prevent exit when user has coded
 * @example $e.api.setPreventExit(false)
 */
$e.api.setPreventExit = (value) => {
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e.confirmNo(value)) {
		$e.ui.preventExit = false;
	} else {
		$e.ui.preventExit = true;
	}
};

/**
 * Shows/Hides the grid
 * @since 2.3
 * @public
 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.showGrid(false)
 */
$e.api.showGrid = (value, action = true) => {
	value = typeof value == "string" ? value.toLowerCase() : value;
	$e.ui.gridVisible = !$e.confirmNo(value);
	if (action) {
		$e.ide.resetGrid();
		$e.ui.initializeSetup();
	}
};

/**
 * Shows/Hides the guide
 * @since 2.3
 * @public
 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.showGuide(false)
 */
$e.api.showGuide = (value, action = true) => {
	value = typeof value == "string" ? value.toLowerCase() : value;
	$e.ui.guideVisible = !$e.confirmNo(value);
	if (action) {
		$e.ui.resetGuide();
		$e.ui.initializeSetup();
	}
};

/**
 * Shows/Hides views tabs
 * @since 2.4
 * @public
 * @param {String} value List of view tabs to display, separated with colon or semi-colon
 * @example $e.api.setViewTabs("touch, drag")
 */
$e.api.setViewTabs = (value) => {
	Object.values($e.modes.views.available).forEach(view => $e.ui.element.querySelector("#view-tabs-" + view.id).classList.add("hide"));
	value = value.replace(/,/g , ";");
	const viewtabs = value.split(";");
	viewtabs.forEach(id => {
		if (!$e.modes.views.available[id]) {
			const view = Object.values($e.modes.views.available).find(view => id.toLowerCase() == view.name.toLowerCase());
			if (!view) return console.error("Unknown view tab " + id);
			id = view.id;
		}
		$e.ui.element.querySelector("#view-tabs-" + id).classList.remove("hide");
	});
};

/**
 * Shows/Hides flow tabs
 * @since 4.0
 * @public
 * @param {Boolean} value Whether to display the flow tabs or not
 * @example $e.api.setFlowTabs(false)
 */
$e.api.showFlowTab = (value) => {
	document.querySelector("#view-tabs-flow").classList[!$e.confirmYes(value) ? "add" : "remove"]("hide");
};

/**
 * Switches to the specified toolbox
 * @since 4.0
 * @public
 * @param {String} id Toolbox to switch to
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.switchToolbox("io")
 */
$e.api.switchToolbox = (id, action = true) => {
	if (!$e.modes.toolboxes.available[id]) {
		const toolbox = Object.values($e.modes.toolboxes.available).find(toolbox => id.toLowerCase() == toolbox.name.toLowerCase());
		if (!toolbox) return console.error("Unknown toolbox " + id);
		id = toolbox.id;
	}
	if (action) {
		$e.ui.switchToolboxMode(id);
	} else {
		$e.modes.toolboxes.current = $e.modes.toolboxes.available[id];
	}
};

/**
 * @since 2.4
 * @deprecated since 4.0
 */
$e.api.switchDialog = $e.api.switchToolbox;

/**
 * Switches to the specified language
 * @since 2.3
 * @public
 * @param {String} value Language to switch to
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.switchLanguage("ca")
 */
$e.api.switchLanguage = (value, action) => {
	$e.ui.translations.switch(value, action);

};

/**
 * Switches to the specified view
 * @since 2.3
 * @public
 * @param {String} id View to switch to
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.switchView("build")
 */
$e.api.switchView = (id, action = true) => {
	if (!$e.modes.views.available[id]) {
		const view = Object.values($e.modes.views.available).find(view => id.toLowerCase() == view.name.toLowerCase());
		if (!view) return console.error("Unknown view " + id);
		id = view.id;
	}
	$e.modes.views.current = $e.modes.views.available[id];
	if (action) $e.ui.switchViewMode();
};

/**
 * Loads code into the view
 * @public
 * @param {String} code Code to upload
 * @param {Boolean} [run=false] If true, it runs the code immediately
 * @example $e.api.uploadCode("repeat(4){forward(100)}", true)
 */
$e.api.uploadCode = (code, run = false) => {
	$e.ide.uploadCode(code, run);
};

/**
 * Loads precode into the view
 * @since 2.2
 * @public
 * @param {String} code Code to set as precode
 * @param {Boolean} [run=true] If false, it doesn't run the code immediately, only when the user executes user code
 * @example $e.api.uploadPrecode("repeat(4){forward(100)}")
 */
$e.api.uploadPrecode = (code, run=true) => {
	$e.ide.uploadCode(code, run, "precode");
};

/**
 * Loads postcode into the view
 * @since 2.4
 * @public
 * @param {String} code Code to set as postcode
 * @example $e.api.uploadPostcode("repeat(4){forward(100)}")
 */
$e.api.uploadPostcode = (code) => {
	$e.ide.uploadCode(code, false, "postcode");
};

/**
 * Runs code silently
 * @since 2.3
 * @public
 * @param {String} code Code to run
 * @example $e.api.runCode("repeat(4){forward(100)}")
 */
$e.api.runCode = (code) => {
	$e.execution.execute(true, code);
};

/**
 * Stops execution
 * @since 3.2
 * @public
 * @example $e.api.stop()
 */
$e.api.stop = () => {
	$e.execution.stop();
};

/**
 * Pauses execution
 * @since 3.2
 * @public
 * @example $e.api.pause()
 */
$e.api.pause = () => {
	$e.execution.pause();
};

/**
 * Resumes execution
 * @since 3.2
 * @public
 * @example $e.api.resume()
 */
$e.api.resume = () => {
	$e.execution.resume();
};

/**
 * Marks the code as saved now
 * @since 2.4
 * @public
 * @example $e.api.updateSavedTime()
 */
$e.api.updateSavedTime = () => {
	$e.session.lastSave = new Date().getTime();
};

/**
 * Shows/Hides the translations menu
 * @since 2.4
 * @public
 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.showTranslations(false)
 */
$e.api.showTranslations = (value, action = true) => {
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e.confirmNo(value)) {
		$e.ui.translations.menuVisible = false;
	} else {
		$e.ui.translations.menuVisible = true;
	}
	if (action) $e.ui.translations.resetMenu();
};

/**
 * Returns the whiteboard size
 * @since 4.0
 * @public
 * @return {Object<Number, Number>} Returns an object width and the height
 * @example $e.api.getWhiteboardResolution()
 */
$e.api.getWhiteboardResolution = () => {
	return { width: $e.backend.whiteboard.width, height: $e.backend.whiteboard.width };
};

/**
 * Changes the whiteboard size
 * @since 4.0
 * @public
 * @param {Array<Number>Number|String|Number} value Width and height of the new whiteboard
 * @param {Boolean} [run=true] If true, applies the theme immediately
 * @example $e.api.setWhiteboardResolution("sharp")
 */
$e.api.setWhiteboardResolution = (value, run) => {
	if ($e.isNumber(value)) value = [ value ];
	else if (typeof value == "string") value = value.split(",");
	if (value[1] === undefined) value[1] = value[0];
	[ $e.backend.whiteboard.width, $e.backend.whiteboard.width ] = value.map(v => parseInt(v));
	$e.ui.loadWhiteboardSize();
	if (run) $e.backend.whiteboard.reset();
};

/**
 * Switches the active theme
 * @since 2.4
 * @public
 * @param {String} theme Name of the theme to use
 * @param {Boolean} [run=true] If true, applies the theme immediately
 * @example $e.api.setTheme("sharp")
 */
$e.api.setTheme = (theme, run) => {
	if (!$e.session.ready && !run) return;
	$e.ui.themes.switch(theme, true);
};

/**
 * Shows/Hides the themes menu
 * @since 2.4
 * @public
 * @param {Boolean|String} value Whether to show it (true) or hide it (false)
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.showThemes(false)
 */
$e.api.showThemes = (value, action = true) => {
	value = typeof value == "string" ? value.toLowerCase() : value;
	if ($e.confirmNo(value)) {
		$e.ui.themes.menuVisible = false;
	} else {
		$e.ui.themes.menuVisible = true;
	}
	if (action) $e.ui.themes.resetMenu();
};

/**
 * Pauses every instruction for a certain amount of time
 * @since 3.0
 * @public
 * @param {Number} value Time to pause each instruction, in milliseconds
 * @example $e.api.setInstructionsPause(500)
 */
$e.api.setInstructionsPause = (milliseconds) => {
	$e.execution.instructionsPause = parseInt(milliseconds);
	$e.ui.debug.resetInstructionsPause();
};

/**
 * Defines the number of instructions to jump on every stepped execution
 * @since 4.0
 * @public
 * @param {Number} step Number of instructions after which execution must be paused when running stepped
 * @example $e.api.setStepSize(1)
 */
$e.api.setStepSize = (value) => {
	$e.execution.stepSize = !value ? 1 : value;
};

/**
 * Run a number of steps (forward or backwards)
 * @since 4.0
 * @public
 * @param {Number} steps Number of steps to run. A possitive number runs forwards, a negative number runs backwards
 * @example $e.api.runSteps(1)
 */
$e.api.runSteps = (value) => {
	$e.ide.runSteps(value);
};

/**
 * Adds breakpoints
 * @since 4.0
 * @public
 * @param {Number|String|Array<Number|String>} value Block/Line numbers and/or variable names where breakpoints are to be placed
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.setBreakpoints([8, "name", "age"])
 */
$e.api.addBreakpoints = (value, action = true) => {
	if (value === "" || !value) value = [];
	else if (typeof value == "string") value = value.replace(/ /g, '').split(",").map(v => $e.isNumber(parseInt(v)) ? parseInt(v) : v);
	else if (typeof value == "number") value = [ value ];
	$e.execution.monitors = Object.assign($e.execution.monitors, value.reduce((acc, b) => acc[b] = { breakpoint: true }, {}));
	if (action) $e.ui.debug.updateMonitors();
};

/**
 * Remove breakpoints
 * @since 4.0
 * @public
 * @param {Number|String|Array<Number|String>} value Block/Line numbers and/or variable names to remove from breakpoints
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.ui.debug.updateRemovedBreakpoints([8, "name", "age"])
 */
$e.api.removeBreakpoints = (value, action = true) => {
	if (value === "" || !value) value = [];
	else if (typeof value == "string") value = value.replace(/ /g, '').split(",").map(v => $e.isNumber(parseInt(v)) ? parseInt(v) : v);
	else if (typeof value == "number") value = [ value ];
	value.forEach(key => {
		delete $e.execution.monitors[key];
		delete $e.execution.current.monitors[key];
	});
	if (action) $e.ui.debug.updateMonitors();
};

/**
 * Gets list of breakpoints
 * @since 3.2
 * @public
 * @return {Array<Number|String>} Block/Line numbers and/or variable names where breakpoints/watches are to be set up
 * @example $e.api.getBreakpoints()
 */
$e.api.getBreakpoints = () => {
	const list = [];
	Object.entries($e.session.monitor).forEach(([key, b]) => { if ($e.isNumber(key) || b.breakpoint) list.push(b); });
	return list;
};

/**
 * Adds watches
 * @since 4.0
 * @public
 * @param {String|Array<String>} value Variable names to watch
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.debug.addWatches([ "firstname", "surname" ])
 */
$e.api.addWatches = (value = [], action = true) => {
	if (value === "") value = [];
	else if (typeof value == "string") value = value.replace(/ /g, '').split(",");
	else if (typeof value == "number") value = [ value ];
	$e.execution.current.monitors = Object.assign($e.execution.current.monitors, value.reduce((acc, b) => acc[b] = { breakpoint: false }, {}));
	if (action) $e.ui.debug.updateMonitors();
};

/**
 * Remove watches
 * @since 4.0
 * @public
 * @param {String|Array<String>} value Block/Line numbers and/or variable names to remove from watches
 * @param {Boolean} [action=true] Whether to run the actions to apply the changes (true) or just set the variables (false)
 * @example $e.api.debug.removeWatches([ "name", "age" ])
 */
$e.api.removeWatches = (value = [], action = true) => {
	if (value === "") value = [];
	else if (typeof value == "string") value = value.replace(/ /g, '').split(",");
	else if (typeof value == "number") value = [ value ];
	value.forEach(key => {
		delete $e.execution.monitors[key];
		delete $e.execution.current.monitors[key];
	});
	if (action) $e.ui.debug.updateMonitors();
};

/**
 * Gets watches
 * @since 3.2
 * @public
 * @return {Array<String>} Variable names where watches are set up
 * @example $e.api.getWatches()
 */
$e.api.getWatches = () => {
	const list = [];
	Object.entries($e.session.monitor).forEach(([key, b]) => { if (!$e.isNumber(key) && !b.breakpoint) list.push(b); });
	return list;
};

/**
 * Returns if the eSeeCode is ready
 * @since 2.4
 * @public
 * @return {String} The date since it is ready, undefined otherwise
 * @example $e.api.isReady()
 */
$e.api.isReady = () => {
	return $e.session.ready;
};

/**
 * Returns the status of the last execution
 * @since 4.0
 * @public
 * @return {String} Status of the execution
 * @example $e.api.getStatus()
 */
$e.api.getStatus = () => {
	return $e.execution.current.status;
};