"use strict";

	/**
	 * Gets the execution step value from the setup and updates in the $_eseecode class
	 * @private
	 * @example $e_updateExecutionStep()
	 */
	function $e_updateExecutionStep() {
		$_eseecode.execution.step = parseInt(document.getElementById("setup-execute-step").value);
	}

	/**
	 * Gets the execution stepped value from the setup and updates in the $_eseecode class
	 * @private
	 * @example $e_updateExecutionStepped()
	 */
	function $e_updateExecutionStepped() {
		$_eseecode.execution.stepped = document.getElementById("setup-execute-stepped").checked;
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
	 * @example $e_checkExecutionLimits(31)
	 */
	function $e_checkExecutionLimits(lineNumber) {
		// If $_eseecode.execution.programCounterLimit === false the step limit is ignored
		var executionTime = new Date().getTime();
		$_eseecode.execution.programCounter++;
		$e_setHighlight(lineNumber);
		if ($_eseecode.execution.watchpointsChanged.length > 0) {
			var watchpointTriggered = false;
			for (var i=0; i < $_eseecode.execution.watchpointsChanged.length && !watchpointTriggered; i++) {
				var watch = $_eseecode.execution.watchpointsChanged[i];
				if ($_eseecode.session.watchpointsStatus[watch]) {
					watchpointTriggered = true;
				}
			}
			if (watchpointTriggered) {
				$_eseecode.execution.breakpointCounter++;
				if ($_eseecode.execution.breakpointCounter >= $_eseecode.execution.breakpointCounterLimit) {
					throw "executionWatchpointed";
				}
			}
		}
		if ($_eseecode.session.breakpoints[lineNumber] && $_eseecode.session.breakpointsStatus[lineNumber]) {
			$_eseecode.execution.breakpointCounter++;
			if ($_eseecode.execution.breakpointCounter >= $_eseecode.execution.breakpointCounterLimit) {
				throw "executionBreakpointed";
			}
		}
		if (executionTime > $_eseecode.execution.endLimit) {
			throw "executionTimeout";
		}
		if ($_eseecode.execution.programCounterLimit && $_eseecode.execution.programCounter >= $_eseecode.execution.programCounterLimit) {
			if ($_eseecode.execution.programCounter == 1) {
				$_eseecode.execution.programCounterLimit++;
				// We ignore the first line, it doesn't make sense to stop here when nothing has been done yet
				return
			}
			throw "executionStepped";
		}
	}

	/**
	 * Show execution results
	 * @private
	 * @param {String|Object} [err] Caught exception
	 * @example $e_showExecutionResults()
	 */
	function $e_showExecutionResults(err) {
		if (err === undefined) {
			if ($_eseecode.execution.programCounterLimit !== false) {
				// If in step by step, highlight last line
				$e_highlight($_eseecode.session.highlight.lineNumber);
			} else {
				$e_unhighlight();
			}
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
			document.getElementById("dialog-debug-execute").innerHTML = _("Instructions executed so far")+": "+($_eseecode.execution.programCounter-1)+"<br />"+_("Execution time so far")+": "+executionTime+" "+_("secs");
		}
	}

	/**
	 * Resets and sets up internal configuration for a new code execution
	 * @private
	 * @param {Boolean|String} [resetStepLimit] true = restart the stepping, false = update the stepping, "disabled" = ignore the stepping
	 * @example $e_initProgramCounter()
	 */
	function $e_initProgramCounter(resetStepLimit) {
		// Stop previous execution remaining animations
		for (var i=0; i<$_eseecode.session.timeoutHandlers.length; i++) {
			clearTimeout($_eseecode.session.timeoutHandlers[i]);
		}
		var withStep = $_eseecode.execution.stepped;
		if (resetStepLimit === "disabled") {
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
		$_eseecode.execution.programCounter = 0;
		$_eseecode.execution.breakpointCounter = 0;
		if (resetStepLimit) {
			$_eseecode.execution.programCounterLimit = 0;
			$_eseecode.execution.breakpointCounterLimit = 0;
			$e_executionTraceReset();
		} else {			
			$_eseecode.execution.breakpointCounterLimit++;
		}
		if (withStep) {
			if (!resetStepLimit) {
				var step = $_eseecode.execution.step;
				if (step < 1) {
					step = 1;
					$_eseecode.execution.step = step;
					$e_initSetup();			
				}
				$_eseecode.execution.programCounterLimit = ($_eseecode.execution.programCounterLimit?$_eseecode.execution.programCounterLimit:0) + step;
			}
		} else {
			$_eseecode.execution.programCounterLimit = false;
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
	 * @param {String} [code] Code to run. If unset run the code in the console window
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
		$e_initProgramCounter(withStep);
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
						if (lineNumber && neNumber[2]) {
							lineNumber = lineNumber[2];
							$e_highlight(lineNumber,"error");
							ace.edit("console-write").gotoLine(lineNumber,0,true);
						}
						return;
					}
					$e_resetWriteConsole(code);
				}
			}
			$e_resetCanvas();
			$e_resetBreakpointWatches();
			$e_resetWatchpoints();
		}
		try {
			var jsCode = "";
			if (!inCode && $_eseecode.execution.precode) { // Don't load precode again when running the code of an event
				jsCode += $e_code2run($_eseecode.execution.precode)+";$e_initProgramCounter("+(withStep=== "disabled"?'"disabled"':withStep)+");\n";
			}
			if (!justPrecode) {
				jsCode += $e_code2run(code);
			}
		} catch (exception) {
			$e_msgBox(_("Can't parse the code. There is the following problem in your code")+":\n\n"+exception.name + ":  " + exception.message);
			return;
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
		/*
		// if debug is open refresh it
		if ($_eseecode.modes.dialog[$_eseecode.modes.dialog[0]].id == "debug") {
			$e_resetDebug();
		}
		*/
	}

	/**
	 * Runs precode
	 * @private
	 * @example $e_executePrecode()
	 */
	function $e_executePrecode() {
		// Run precode if there is one
		if ($_eseecode.execution.precode) {
			$e_execute("disabled", null, true);
		}
	}

	/**
	 * Defines an error to handle during user code execution
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
	 * @example $e_endExecution();
	 */
	function $e_endExecution() {
		var executionTime = ((new Date().getTime())-$_eseecode.execution.startTime)/1000;
		document.getElementById("dialog-debug-execute").innerHTML = _("Instructions executed")+": "+($_eseecode.execution.programCounter-1)+"<br />"+_("Execution time")+": "+executionTime+" "+_("secs");
		$e_initProgramCounter(true);
		$e_unhighlight();
		$e_resetDebug();
		$e_executePrecode();
	}