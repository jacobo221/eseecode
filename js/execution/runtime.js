"use strict";

/**
 * Runs code
 * @private
 * @param {Boolean} [immediate] Run immediately (disable breakpoints and pauses)
 * @param {String} [inCode] Code to run. If unset run the code in the view window
 * @param {Boolean} [justPrecode] Whether or not to ignore the usercode and just run the precode
 * @example $e.execution.execute()
 */
$e.execution.execute = async function(immediate, inCode, justPrecode, skipAnimation) {
	if (!inCode) $e.execution.resetSandbox();
	let code;
	if (immediate || inCode) code = inCode; // Code from events runs without stepping or breakpoints
	$e.ui.unhighlight();
	if (code === undefined) {
		const mode = $e.modes.views.current.type;
		if (mode == "blocks") {
			const viewEl = $e.ui.element.querySelector("#view-blocks");
			code = $e.ide.blocks.toCode(viewEl.firstChild);
		} else if (mode == "write") {
			code = $e.session.editor.getValue();
			// Check and clean code before parsing
			if (eseecodeLanguage) {
				try {
					const program = eseecodeLanguage.parse(code);
					code = program.makeWrite("", "\t");
				} catch (exception) {
					$e.ui.msgBox.open(_("Can't parse the code. There is the following problem in your code") + ":\n\n" + exception.name + ":  " + exception.message);
					const lineNumber = exception.message.match(/. (i|o)n line ([0-9]+)/);
					if (lineNumber && lineNumber[2]) {
						lineNumber = lineNumber[2];
						$e.ui.highlight(lineNumber, "error");
						$e.session.editor.gotoLine(lineNumber, 0, true);
					}
					return;
				}
				$e.ui.write.resetView(code, false);
			}
		}
		if (code && $e.session.lastChange) $e.ide.autosave(code); // Only overwrite autosaved code if the user has entered code, thus not taking statements initial code for autosave
		if (!justPrecode) await $e.backend.reset(false); // $e.backend.reset() calls $e.execution.execute() to load the precode, so prevent infinite loops
		$e.debug.resetMonitors();
		$e.ui.debug.resetLayers();
		$e.ui.debug.updateMonitors();
	}
	$e.execution.current.kill = false; // Must be set after $e.backend.reset()
	$e.execution.current.breaktoui = false;
	if (!inCode && !justPrecode && !immediate && $e.execution.prerun) $e.execution.prerun();
	let jsCode = "";
	try {
		jsCode += "\"use strict\";";
		jsCode += "(async function() {";
		let instructions = Object.values($e.instructions.set);
		if (!inCode && ($e.execution.precode || instructions.some(d => d.run))) { // Don't load precode again when running the code of an event
			let customInstructionsCode = "";
			Object.values(instructions).forEach(instruction_details => {
				if (!instruction_details || !instruction_details.run) return;
				customInstructionsCode += "\nfunction " + instruction_details.name + "(";
				if (instruction_details.parameters) {
					let parameters_text = "";
					Object.values(instruction_details.parameters).forEach(instructionParam_details => {
						if (!instructionParam_details || !instructionParam_details.name) return;
						parameters_text += (parameters_text ? ", " : "") + instructionParam_details.name;
					});
					customInstructionsCode += parameters_text;
				}
				customInstructionsCode += "){\n" + instruction_details.run + "}\n";
			});
			// We want to run precode inline so it shares the same context
			const real_precode = $e.execution.code2run(customInstructionsCode + $e.execution.precode, { inject: false, inline: true, realcode: true });
			jsCode += "$e.execution.current.precode.running=true;" + real_precode + ";";
		}
		if (!justPrecode) {
			const real_usercode = $e.execution.code2run(code, { inject: !immediate, realcode: true });
			jsCode += "$e.execution.current.animate = " + !skipAnimation + ";$e.execution.current.usercode.running=true;$e.execution.initProgramCounter();$e.execution.updateStatus(\"running\");" + real_usercode + ";$e.execution.current.usercode.running=false;";
			$e.execution.current.linesCount = real_usercode.split("\n").length - 1;
			if (!inCode && $e.execution.postcode) { // Don't load postcode again when running the code of an event
				const real_postcode = $e.execution.code2run($e.execution.postcode, { realcode: true });
				jsCode += ";$e.execution.current.postcode.running=true;" + real_postcode + ";";
			}
			jsCode += "$e.execution.updateStatus(\"finished\");";
		}
		jsCode += "})();";
	} catch (exception) {
		$e.ui.msgBox.open(_("Can't parse the code. There is the following problem in your code") + ":\n\n" + exception.name + ":  " + exception.message);
		return;
	}
	if (inCode === undefined || inCode === null) {
		$e.session.lastRun = Date.now();
	}
	const oldWindowProperties = Object.getOwnPropertyNames(window);
	$e.execution.traceInject();
	await eval(jsCode);
	$e.execution.current.stepped = undefined;
	$e.execution.current.animate = false; // Leave it as false so if the whiteboard is reset placing the guide in the initial position is not an animated movement. It is necessary to have it here and not jsCode so t¡if the execution is stopped this is still done
	$e.execution.traceRestore();
	$e.execution.updateSandboxChanges(oldWindowProperties, Object.getOwnPropertyNames(window)); // Do not reset yet (reset before next new execution), as there might be interaction to run with the last run code
	$e.execution.current.usercode.running = false;
	// if debug is open refresh it
	if ($e.modes.toolboxes.current.id == "debug") {
		$e.ui.debug.resetLayers();
	}
	if (!inCode && !justPrecode && !immediate && $e.execution.postrun) $e.execution.postrun();
};

/**
 * Converts user code to executable code and returns it
 * @private
 * @param {String} pseudoCode User code to convert
 * @param {Object} options Encoding options
 * @return {String} Executable code
 * @example eval($e.execution.code2run("repeat(4){forward(100)}"))
 */
$e.execution.code2run = (pseudoCode, options) => {
	const program = eseecodeLanguage.parse(pseudoCode);
	const userCode = program.makeWrite("", "\t", options);
	let code = "";
	const globalVars = $e.instructions.variables;
	globalVars.forEach(globalVar => code += "var " + globalVar.name + "=" + globalVar.value + ";");
	code += "try { " + userCode + ";" +
			"$e.execution.showResults();" +
		"} catch(err) {" +
			"$e.execution.showResults(err);" +
		"}" +
		"$e.execution.current.precode.running=false;" +
		"$e.execution.current.usercode.running=false;" +
		"$e.execution.current.postcode.running=false;"; // This is used for pre/user/post-code, so mark all as finished once the translated code is run
	return code;
};

/**
 * Resets and sets up internal configuration for a new code execution
 * @private
 * @example $e.execution.initProgramCounter()
 */
$e.execution.initProgramCounter = () => {
	if ($e.execution.current.precode.running) { // We do check limits with postcode because if it runs user-defined functions we must count statistics and check limits
		// Precode/Postcode is run as is with no checks and without altering $e.execution variables
		return;
	}
	$e.execution.current.startTime = Date.now();
	$e.execution.current.programCounter = -1;
	$e.execution.current.lastRunLineNumber = -1;
	Object.entries($e.execution.current.monitors).forEach(([key, monitor]) => {
		if ($e.isNumber(key, true)) monitor.count = 0;
	});
};

/**
 * Returns the current execution's program counter
 * @private
 * @example $e.execution.getProgramCounter()
 */
$e.execution.getProgramCounter = () => {
	return $e.execution.current.programCounter;
};

/**
 * Setup execution sandboxing
 * It deletes or resets variables created in the last execution
 * @private
 * @example $e.execution.resetSandbox()
 */
$e.execution.resetSandbox = () => {
	if (!$e.execution.current.sandboxProperties) $e.execution.current.sandboxProperties = [];
	$e.execution.current.sandboxProperties.forEach(sandboxProperty => window[sandboxProperty] = undefined);
};

/**
 * Checks and takes note of which variables where created during the last execution
 * The list of changes is pushed into $e.execution.current.sandboxProperties
 * @private
 * @param {Array<String>} oldKeys List of variables existing before the last execution
 * @param {Array<String>} newKeys List of variables existing after the last execution
 * @example $e.execution.updateSandboxChanges(oldKeys, newKeys)
 */
$e.execution.updateSandboxChanges = (oldKeys, newKeys) => {
	newKeys.forEach(keyNameNew => {
		if (!oldKeys.some(keyNameOld => {
			if (keyNameOld == keyNameNew) return true;
		})) $e.execution.current.sandboxProperties.push(keyNameNew);
	});
};

$e.execution.injectCode = (options, lineNumber, inline) => {
	var str = "";
	if (!options.inject) return str;
	if (inline !== true) str += ";";
	// Although from a developer point of view it would be cleaner to pause executions with function*/yield, we use async/await because the former cannot be used in arrow functions
	str += "await $e.execution.injection(" + lineNumber + ",(" + $e.execution.injected + ")()," + inline + ")";
	if (inline !== true) str += ";";
	return str;
};

$e.execution.injected = (() => {
	$e.execution.current.watchesChanged = [];
	Object.entries($e.execution.current.monitors).forEach(([key, monitor]) => {
		if ($e.isNumber(key, true)) return;
		try {
			var newValue;
			newValue = eval(key);
			if (newValue !== monitor.value) {
				monitor.oldValue = monitor.value;
				monitor.value = newValue;
				$e.execution.current.watchesChanged.push(key);
			}
		} catch(error) {}
	});
}).toString().replaceAll("\n", "").replaceAll("\t", ""); // This function will be re-encoded into a one-liner by deleting all newline characters, so write it accordingly

/**
 * Freeze the execution until the status is changed back to running
 * @private
 * @example $e.execution.freeze()
 */
$e.execution.freeze = async () => {
	await new Promise(r => {
		(function freezeCallback() {
			if (!$e.execution.isFrozen() || $e.execution.current.kill) return r();
			setTimeout(freezeCallback, 1);
		})();
	});
	if ($e.execution.current.kill) throw "executionKilled";
}

/**
 * Function to trace monitors during execution, injected in the runtime code
 * @private
 * @param {Number} lineNumber Code line number currently running
 * @param {Object} variables This parameter is ignored but is necessary to be able to run an inline function uppon call to obtain the watches variable values
 * @param {Boolean} [inline] Set to true if it is being called inline (as part of the parameters of a call or inside a condition)
 * @example $e.execution.eseeCodeInjection(123)
 */
$e.execution.injection = async (lineNumber, variables, inline) => {

	if ($e.execution.current.precode.running) return; // We check with postcoding because if this code calls a user-defined function we must count statistics and check limits. Precode/Postcode is run as is with no checks and without altering $e.execution variables
	
	// Check limits
	if ($e.execution.current.kill) throw "executionKilled";

	$e.execution.current.programCounter++;

	if ($e.execution.current.stepped !== undefined && $e.execution.current.programCounter < $e.execution.current.stepped) return; // Stepped executions do not trigger breakpoints. This is particularly necessary for backwards steps since they re-run the whole program up to the target instruction number and we do not want breakpoints to be triggered in the way

	$e.ui.highlight(lineNumber, "stepped");

	// Operate debug features: stats, breakpoints, watches, layers view, stepped, paused, ...
	let hasChangedWatchesBreakpoints;
	if ($e.execution.current.stepped !== undefined && $e.execution.current.programCounter >= $e.execution.current.stepped) {

		$e.execution.current.stepped = undefined;
		$e.ui.debug.updateMonitors(false);
		$e.execution.updateStatus("stepped");
		await $e.execution.freeze();
		$e.execution.updateStatus("running");

	} else if (hasChangedWatchesBreakpoints = $e.execution.current.watchesChanged.some(w => $e.execution.monitors[w] && $e.execution.monitors[w].breakpoint)) {

		await $e.debug.breakpointReached($e.execution.current.lastRunLineNumber, $e.execution.current.watchesChanged, true, hasChangedWatchesBreakpoints); // Variable changes are detected after running the instruction, so highlight the previous instruction
		$e.execution.updateStatus("running");

	} else if ($e.execution.monitors[lineNumber] && $e.session.runFrom != "level1_add_block" && $e.session.runFrom != "level1_undo_block") {

		$e.execution.current.monitors[lineNumber].count++;
		if ($e.execution.monitors[lineNumber].breakpoint) {
			await $e.debug.breakpointReached(lineNumber);
		}
		$e.execution.updateStatus("running");

	} else if ($e.execution.isPaused()) {

		await $e.execution.freeze();
		$e.execution.updateStatus("running");

	} else if ($e.session.runFrom != "level1_add_block" && $e.session.runFrom != "level1_undo_block" && $e.execution.instructionsDelay) { // We don't want to pause execution in level1/Touch

		await new Promise(r => {
			$e.execution.current.pauseHandler = setTimeout(r, $e.execution.instructionsDelay - ($e.execution.current.animatedTime ? $e.execution.current.animatedTime : 0));
		});
		$e.execution.current.animatedTime = 0;

	} else if ($e.execution.current.breaktoui) {

		// Every now and then break synchronism so the program can be paused by the user if there is an infinite loop, instead of crashing the browser
		$e.execution.current.breaktoui = false;
		await new Promise(r => { setTimeout(r, 0); });
		$e.execution.current.breaktouiHandler = setTimeout(() => $e.execution.current.breaktoui = true, $e.execution.breaktouiInterval);
	
	}
	
	if ($e.execution.current.layersChanged) {
		if ($e.execution.current.layersChanged === true) $e.ui.debug.resetLayers();
		else $e.ui.debug.addOrUpdateLayers($e.execution.current.layersChanged);
		$e.ui.debug.highlightCurrentLayer();
	}
	$e.ui.debug.updateMonitors();

	// Prepare for next instruction
	$e.execution.current.layersChanged = [];
	$e.execution.current.lastRunLineNumber = lineNumber;

	// The only case in which we need to return something is for return, since it could be with no parameters leave undefined
	return undefined;
};

/**
 * Checks the passed parameters to a given function
 * @private
 * @param {String} instructionName Name of the instruction calling it
 * @throws codeError
 * @example $e.execution.parseParameterTypes("forward", arguments);
 */
$e.execution.parseParameterTypes = (instructionName, params) => {
	const instructionId = instructionName;
	const instruction = $e.instructions.set[instructionId];
	const instructionParams = instruction.parameters;
	let msg = "";
	let invalidCount = 0;
	instructionParams.forEach((parameter, i) => {
		let invalidParameter = false;
		const value = params[i];
		let msgParam = "";
		if (value === undefined || value === null || value === "") {
			if (!parameter.optional) {
				msgParam = _("has no value, but a value is required. The value received is:") + " " + value + " (" + _($e.debug.analyzeVariable(value).type) + ")\n";
				invalidParameter = true;
			}
		} else if ((parameter.type == "number" && !$e.isNumber(value)) ||
			(parameter.type == "bool" && !$e.isBoolean(value)) ||
			(parameter.type == "color" && !$e.isColor(value)) ||
			(parameter.type == "layer" && !$e.backend.whiteboard.layers.isLayer(value)) ||
			(parameter.type == "window" && !$e.backend.windows.isWindow(value))) {
			msgParam = _("should be a %s but instead received this %s:", [ _(parameter.type), _($e.debug.analyzeVariable(value).type) ]) + " " + value + "\n";
			invalidParameter = true;
		} else if (parameter.validate && !parameter.validate(value)) {
			msgParam = _("doesn't have a valid value:") + " " + value + "\n";
			invalidParameter = true;
		}
		if (invalidParameter) {
			msg += _("The %s parameter (%s)", [ $e.ordinal(i + 1), _(parameter.name) ]) + " " + msgParam;
			invalidCount++;
		}
	});
	if (invalidCount > 0) {
		let header = "";
		if (invalidCount > 1) {
			header += _("Invalid parameters") + ":";
		} else {
			header += _("Invalid parameter") + ":";
		}
		header += " ";
		if (invalidCount > 1) {
			header += "\n";
		}
		throw $e.execution.codeError(instructionName, header + msg);
	}
};

/**
 * Defines an error to handle during user code execution
 * @private
 * @param {String} name Name of the instruction
 * @param {String} text Text to show the user
 * @return Returns an exception codeError object
 * @example new $e.execution.codeError("foward", "Invalid parameter");
 */
$e.execution.codeError = (name, text) => {
	return {
		type: "codeError",
		name: name,
		line: $e.execution.current.highlight.lineNumber,
		text: text,
	};
};

/**
 * Show execution results
 * @private
 * @param {String|Object} [err] Caught exception
 * @example $e.execution.showResults()
 */
$e.execution.showResults = (err) => {
	if (err === undefined) {
		$e.ui.unhighlight();
	} else if (err === "executionKilled") {
		// Do nothing
	} else if (err.type == "codeError") {
		const instructionId = err.name;
		let brackets = "";
		if (instructionId >= 0) {
			const instruction = $e.instructions.set[instructionId];
			if (!instruction.code || instruction.code.noBrackets !== true) {
				brackets = "()";
			}
		}
		$e.ui.msgBox.open(_("Error found during execution at line %s in %s", [ err.line, err.name + brackets ]) + "\n" + err.text) + ":";
		$e.ui.highlight(err.line, "error");
	} else {
		// The code didn't finish running and there is no known reason
		$e.execution.printError(err);
	}
};

/**
 * Displays execution error
 * @private
 * @param {!Object} [err] Caught exception
 * @example $e.execution.printError(err)
 */
$e.execution.printError = (err) => {
	let lineNumber;
	if (err.lineNumber) { // Firefox
		lineNumber = err.lineNumber;
	} else if (err.stack) { // Chrome
		const lines = err.stack.split("\n");
		lines.forEach(line => {
			if (line.includes("at <anonymous>:")) lineNumber = line.split(":")[1];
		});
	}
	let message;
	if (lineNumber) {
		const mode = $e.modes.views.current.type;
		$e.ui.highlight(lineNumber, "error");
		if (mode == "write") {
			$e.session.editor.gotoLine(lineNumber, 0);
		}
		message = _("Error '%s' in line %s", [ err.name, lineNumber ]) + ": " + err.message;
	} else if (err.stack) {
		message = err.name + ": " + err.message + "\n" + err.stack;
	} else {
		message = _("Runtime error!");
	}
	$e.ui.msgBox.open(message, { classes: "error" });
};