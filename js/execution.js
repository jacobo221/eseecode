"use strict";

	/**
	 * Gets the execution step value from the setup and updates in the $_eseecode class
	 * @private
	 * @example $e_updateExecutionStep()
	 */
	function $e_updateExecutionStep() {
		$_eseecode.execution.step = parseInt(document.getElementById("dialog-debug-execute-step").value);
	}

	/**
	 * Gets the execution stepped value from the setup and updates in the $_eseecode class
	 * @private
	 * @example $e_updateExecutionStepped()
	 */
	function $e_updateExecutionStepped() {
		$_eseecode.execution.stepped = document.getElementById("dialog-debug-execute-stepped").checked;
	}

	/**
	 * Gets the execution time limit value from the setup and updates in the $_eseecode class
	 * @private
	 * @example $e_updateExecutionTime()
	 */
	function $e_updateExecutionTime() {
		$_eseecode.execution.timeLimit = parseInt(document.getElementById("setup-execute-time").value);
	}

	/**
	 * Function to trace breakpoints during execution, injected in the runtime code
	 * @private
	 * @param {Number} lineNumber Code line number currently running
	 * @param {Object} variables This parameter is ignored but is necessary to be able to run an inline function uppon call to obtain the watchpoint variable values
	 * @example $e_eseeCodeInjection(123)
	 */
	function $e_eseeCodeInjection(lineNumber, variables) {
		$e_checkExecutionLimits(lineNumber);
		// The only case in which we need to return something is for return, since it could be with no parameters leave undefined
		return undefined;
	}

	/**
	 * Check the execution control limits
	 * @private
	 * @param {Number} lineNumber Code line number currently running
	 * @throws executionWatchpointed | executionBreakpointed | executionTimeout | executionStepped
	 * @example $e_checkExecutionLimits(31)
	 */
	function $e_checkExecutionLimits(lineNumber) {
		if ($_eseecode.execution.precode.running) {
			// Precode is run as is with no checks and without altering $_eseecode.execution variables
			return;
		}
		var executionTime = new Date().getTime();
		$_eseecode.execution.programCounter++;
		$e_setHighlight(lineNumber);
		if ($_eseecode.execution.watchpointsChanged.length > 0) {
			var watchpointTriggered = false;
			for (var i=0; i < $_eseecode.execution.watchpointsChanged.length && !watchpointTriggered; i++) {
				var watch = $_eseecode.execution.watchpointsChanged[i];
				if ($_eseecode.session.watchpoints[watch].status) {
					watchpointTriggered = true;
				}
			}
			if (watchpointTriggered) {
				$_eseecode.execution.breakpointCounter++;
				if ($_eseecode.execution.breakpointCounter >= $_eseecode.execution.breakpointCounterLimit) {
					$_eseecode.execution.breakpointCounterLimit++;
					throw "executionWatchpointed";
				}
			}
		}
		if ($_eseecode.session.breakpoints[lineNumber]) {
			$_eseecode.session.breakpoints[lineNumber].count++;
			if ($_eseecode.session.breakpoints[lineNumber].status) {
				$_eseecode.execution.breakpointCounter++;
				if ($_eseecode.execution.breakpointCounter >= $_eseecode.execution.breakpointCounterLimit) {
					$_eseecode.execution.breakpointCounterLimit++;
					throw "executionBreakpointed";
				}
			}
		}
		if (executionTime > $_eseecode.execution.endLimit) {
			throw "executionTimeout";
		}
		if ($_eseecode.execution.stepped && $_eseecode.execution.programCounter >= $_eseecode.execution.programCounterLimit) {
			if ($_eseecode.execution.programCounter == 1) {
				$_eseecode.execution.programCounterLimit++;
				// We ignore the first line, it doesn't make sense to stop here when nothing has been done yet
				return
			}
			throw "executionStepped";
		}
	}
	
	/**
	 * Stops previous execution animations
	 * @private
	 * @example $e_stopPreviousAnimations()
	 */
	function $e_stopPreviousAnimations() {	
		// Stop previous execution remaining animations
		for (var i=0; i<$_eseecode.session.timeoutHandlers.length; i++) {
			clearTimeout($_eseecode.session.timeoutHandlers[i]);
		}
	}

	/**
	 * Resets and sets up internal configuration for a new code execution
	 * @private
	 * @param {Boolean|String} [disableStepping] true = ignore the stepping
	 * @example $e_initProgramCounter()
	 */
	function $e_initProgramCounter(disableStepping) {
		if ($_eseecode.execution.precode.running) {
			// Precode is run as is with no checks and without altering $_eseecode.execution variables
			return;
		}
		var withStep = $_eseecode.execution.stepped;
		if (disableStepping === "disabled") {
			withStep = false;
		}
		$_eseecode.execution.startTime = new Date().getTime();
		var time = $_eseecode.execution.timeLimit;
		if (time <= 0) {
			time = 3;
			$_eseecode.execution.timeLimit = time;
			$e_initSetup();
		}
		$_eseecode.execution.endLimit = $_eseecode.execution.startTime+time*1000;
		if (withStep) {
			if (!disableStepping) {
				var step = $_eseecode.execution.step;
				if (step < 1) {
					step = 1;
					$_eseecode.execution.step = step;
					$e_initSetup();
				}
				$_eseecode.execution.programCounterLimit = $_eseecode.execution.programCounter + step;
			}
		}
		$_eseecode.execution.programCounter = 0;
		$_eseecode.execution.breakpointCounter = 0;
		for (var key in $_eseecode.session.breakpoints) {
			$_eseecode.session.breakpoints[key].count = 0;
		}
		$e_executionTraceReset("randomColor");
		$e_executionTraceReset("randomNumber");
	}

	/**
	 * Displays execution error
	 * @private
	 * @param {!Object} [err] Caught exception
	 * @example $e_printExecutionError(err)
	 */
	function $e_printExecutionError(err) {
		var lineNumber;
		if (err.lineNumber) { // Firefox
			lineNumber = err.lineNumber;
			lineNumber++; // Firefox starts lines at 0
		} else if (err.stack) { // Chrome
			var lines = err.stack.split("\n");
			var i;
			for (i=0;i<lines.length;i++) {
				if (lines[i].indexOf("at <anonymous>:") >= 0) {
					lineNumber = lines[i].split(":")[1];
				}
			}
		}
		var message, action;
		if (lineNumber) {
			var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
			$e_highlight(lineNumber,"error");
			if (mode == "write") {
				ace.edit("console-write").gotoLine(lineNumber,0);
			}
			message = _("Error '%s' in line %s",[err.name,lineNumber])+": "+err.message;
		} else if (err.stack) {
			message = err.name+": "+err.message+"\n"+err.stack;
		} else {
			message = _("Runtime error!");
		}
		$e_msgBox(message);
	}

	/**
	 * Setup execution sandboxing
	 * It deletes or resets variables created in the last execution
	 * @private
	 * @example $e_resetSandbox()
	 */
	function $e_resetSandbox() {
		if (!$_eseecode.execution.sandboxProperties) {
			$_eseecode.execution.sandboxProperties = [];
		}
		for (var i=0; i<$_eseecode.execution.sandboxProperties.length; i++) {
			 window[$_eseecode.execution.sandboxProperties[i]] = undefined;
		}
	}

	/**
	 * Checks and takes note of which variables where created during the last execution
	 * The list of changes is pushed into $_eseecode.execution.sandboxProperties
	 * @private
	 * @param {Array<String>} oldKeys List of variables existing before the last execution
	 * @param {Array<String>} newKeys List of variables existing after the last execution
	 * @example $e_updateSandboxChanges(oldKeys, newKeys)
	 */
	function $e_updateSandboxChanges(oldKeys, newKeys) {
		for (var i=0; i<newKeys.length; i++) {
			var keyNameNew = newKeys[i];
			var found = false;
			for (var j=0; j<oldKeys.length; j++) {
				var keyNameOld = oldKeys[j];
				if (keyNameOld == keyNameNew) {
					found = true;
					break;
				}
			}
			if (!found) {
				$_eseecode.execution.sandboxProperties.push(keyNameNew);
			}
			found = false;
		}
	}

	/**
	 * Runs code
	 * @private
	 * @param {Boolean} [forceNoStep] Whether or not to force to ignore the stepping
	 * @param {String} [inCode] Code to run. If unset run the code in the console window
	 * @param {Boolean} [justPrecode] Whether or not to ignore the usercode and just run the precode
	 * @example $e_execute()
	 */
	function $e_execute(forceNoStep, inCode, justPrecode) {
		if (!inCode) {
			$e_resetSandbox();
		}
		var code;
		var withStep;
		if (forceNoStep || inCode) { // Code from events run without stepping
			code = inCode;
			withStep = "disabled";
		}
		$e_unhighlight();
		if (code === undefined) {
			var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
			if (mode == "blocks") {
				var consoleDiv = document.getElementById("console-blocks");
				code = $e_blocks2code(consoleDiv.firstChild);
			} else if (mode == "write") {
				code = ace.edit("console-write").getValue();
				// Check and clean code before parsing
				if (eseecodeLanguage) {
					try {
						var program = eseecodeLanguage.parse(code);
						var level;
						for (var i=0;i<$_eseecode.modes.console.length;i++) {
							if ($_eseecode.modes.console[i].div == "write") {
								level = $_eseecode.modes.console[i].id;
							}
						}
						code = program.makeWrite(level,"","\t");
					} catch (exception) {
						$e_msgBox(_("Can't parse the code. There is the following problem in your code")+":\n\n"+exception.name + ":  " + exception.message);
						var lineNumber = exception.message.match(/. (i|o)n line ([0-9]+)/);
						if (lineNumber && lineNumber[2]) {
							lineNumber = lineNumber[2];
							$e_highlight(lineNumber,"error");
							ace.edit("console-write").gotoLine(lineNumber,0,true);
						}
						return;
					}
					$e_resetWriteConsole(code, false);
				}
			}
			$e_resetCanvas(true);
			$e_resetBreakpointWatches();
			$e_resetWatchpoints();
		}
		try {
			var jsCode = "";
			if (!inCode && $_eseecode.execution.precode.code) { // Don't load precode again when running the code of an event
				// We want to run precode inline so it shares the same context, so we don't use $e_executePrecode()
				jsCode += "$_eseecode.execution.precode.running=true;"+$e_code2run($_eseecode.execution.precode.code)+";$_eseecode.execution.precode.running=false;\n";
			}
			if (!justPrecode) {
				jsCode += "$e_initProgramCounter("+(withStep==="disabled"?'true':'false')+");"+$e_code2run(code);
			}
		} catch (exception) {
			$e_msgBox(_("Can't parse the code. There is the following problem in your code")+":\n\n"+exception.name + ":  " + exception.message);
			return;
		}
		if (inCode === undefined || inCode === null) {
			$_eseecode.session.lastRun = new Date().getTime();
		}
		var script = document.createElement("script");
		script.id = "executionCode";
		script.type = "text/javascript";
		script.innerHTML = jsCode;
		var oldWindowProperties;
		if (Object.getOwnPropertyNames) {
			oldWindowProperties = Object.getOwnPropertyNames(window);
		}
		document.getElementById("eseecode").appendChild(script);
		var newWindowProperties;
		if (Object.getOwnPropertyNames) {
			newWindowProperties = Object.getOwnPropertyNames(window);
			$e_updateSandboxChanges(oldWindowProperties,newWindowProperties);
		}
		document.getElementById("eseecode").removeChild(script);
		// if debug is open refresh it
		if ($_eseecode.modes.dialog[$_eseecode.modes.dialog[0]].id == "debug") {
			$e_resetDebug();
		}
	}

	/**
	 * Converts user code to executable code and returns it
	 * @private
	 * @param {String} pseudoCode User code to convert
	 * @return {String} Executable code
	 * @example eval($e_code2run("repeat(4){forward(100)}"))
	 */
	function $e_code2run(pseudoCode) {
		var program = eseecodeLanguage.parse(pseudoCode);
		var level;
		for (var i=0;i<$_eseecode.modes.console.length;i++) {
			if ($_eseecode.modes.console[i].div == "write") {
				level = $_eseecode.modes.console[i].id;
			}
		}
		var userCode = program.makeWrite(level,"","\t",true);
		var code = "\"use strict\";";
		var globalVars = $_eseecode.instructions.variables;
		for (var i=0; i<globalVars.length; i++) {
			code += "var "+globalVars[i].name+"="+globalVars[i].value+";";
		}
		code += "try {"+userCode+";\n\
				$e_showExecutionResults();\n\
			} catch(err) {\n\
				$e_showExecutionResults(err);\n\
			}";
		return code;
	}

	/**
	 * Show execution results
	 * @private
	 * @param {String|Object} [err] Caught exception
	 * @example $e_showExecutionResults()
	 */
	function $e_showExecutionResults(err) {
		if (err === undefined) {
			$e_unhighlight();
		} else if (err === "executionTimeout") {
			$e_highlight($_eseecode.session.highlight.lineNumber,"error");
			$e_msgBox(_("The execution is being aborted because it is taking too long.\nIf you want to allow it to run longer increase the value in 'Stop execution after' in the setup tab"));
		} else if (err === "executionStepped") {
			$e_highlight($_eseecode.session.highlight.lineNumber);
		} else if (err === "executionBreakpointed") {
			$e_highlight($_eseecode.session.highlight.lineNumber);
			$e_switchDialogMode("debug");
		} else if (err == "executionWatchpointed") {
			$e_highlight($_eseecode.session.highlight.lineNumber-1); // We detect it before running the next instruction, so highlight the previous instuction
			$e_switchDialogMode("debug");
			$e_highlightWatchpoint($_eseecode.execution.watchpointsChanged);
		} else if (err.type == "codeError") {
			$e_msgBox(_("Error found during execution at line %s:",[err.line])+"\n"+err.text);
			$e_highlight(err.line,"error");
		} else {
			// The code didn't finish running and there is no known reason
			$e_printExecutionError(err);
		}
		if (err !== undefined) {
			var executionTime = ((new Date().getTime())-$_eseecode.execution.startTime)/1000;
			document.getElementById("dialog-debug-execute-stats").innerHTML = _("Instructions executed so far")+": "+($_eseecode.execution.programCounter-1)+"<br />"+_("Execution time so far")+": "+executionTime+" "+_("secs");
		}
	}

	/**
	 * Runs the code, triggered by the user
	 * @private
	 * @example $e_executeFromUI()
	 */
	function $e_executeFromUI() {
		$e_stopPreviousAnimations();
		$e_execute();
	}

	/**
	 * Defines an error to handle during user code execution
	 * @private
	 * @param {String} name Name of the instruction
	 * @param {String} text Text to show the user
	 * @return Returns an exception codeError object
	 * @example new $e_codeError("foward", "Invalid parameter");
	 */
	function $e_codeError(name, text) {
		this.type = "codeError";
		this.name = name;
		this.line = $_eseecode.session.highlight.lineNumber;
		this.text = text;
	}

	/**
	 * Prepares execution environment for the next run
	 * @private
	 * @example $e_endExecution();
	 */
	function $e_endExecution() {
		var executionTime = ((new Date().getTime())-$_eseecode.execution.startTime)/1000;
		document.getElementById("dialog-debug-execute-stats").innerHTML = _("Instructions executed")+": "+($_eseecode.execution.programCounter-1)+"<br />"+_("Execution time")+": "+executionTime+" "+_("secs");
		$_eseecode.execution.programCounter = 0;
		$_eseecode.execution.programCounterLimit = 0;
		$_eseecode.execution.breakpointCounterLimit = 1;
		$e_executionTraceReset();
		$e_unhighlight();
	}

	/**
	 * Checks the passed parameters to a given function
	 * @private
	 * @param {String} instructionName Name of the instruction calling it
	 * @throws codeError
	 * @example $e_parseParameterTypes("forward",arguments);
	 */
	function $e_parseParameterTypes(instructionName,params) {
		var instructionId = $e_getInstructionSetIdFromName(instructionName);
		var instruction = $_eseecode.instructions.set[instructionId];
		var instructionParams = instruction.parameters;
		var msg = "";
		var invalidCount = 0;
		for (var i=0; i< instructionParams.length; i++) {
			var invalidParameter = false;
			var parameter = instructionParams[i];
			var value = params[i];
			var msgParam = "";
			if (value === undefined || value === null || value === "") {
				if (!parameter.optional) {
					msgParam = _("has no value, but a value is required. The value recieved is:")+" "+value+" ("+$e_analyzeVariable(value).type+")\n";
					invalidParameter = true;
				}
			} else if ((parameter.type == "number" && !$e_isNumber(value)) ||
			 (parameter.type == "bool" && !$e_isBoolean(value)) ||
			 (parameter.type == "color" && !$e_isColor(value)) ||
			 (parameter.type == "layer" && !$e_isLayer(value)) ||
			 (parameter.type == "window" && !$e_isWindow(value))) {
				msgParam = _("should be a %s but instead recieved this %s:",[parameter.type,$e_analyzeVariable(value).type])+" "+value+"\n";
				invalidParameter = true;
			}
			if (invalidParameter) {
				msg += _("The %s parameter (%s)",[$e_ordinal(i+1),parameter.name])+" "+msgParam;
				invalidCount++;
			}
		}
		if (invalidCount > 0) {
			var header = "";
			if (invalidCount>1) {
				header += _("Invalid parameters in %s",[instructionName]);
			} else {
				header += _("Invalid parameter in %s",[instructionName]);
			}
			if (!instruction.code || instruction.code.noBrackets !== true) {
				header += "()";
			}
			if (invalidCount > 1) {
				header += "\n";
			} else {
				header += ". ";
			}
			throw new $e_codeError(instructionName,header+msg);
		}
	}
