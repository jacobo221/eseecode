"use strict";

/**
 * Resets the debug window
 * @private
 * @param {Boolean} [clearMonitors] If true breakpoints and watches will be cleared
 * @example $e.ui.debug.reset()
 */
$e.ui.debug.reset = (clearMonitors) => {
	// Clean old debug info and create new debug info
	$e.ui.debug.resetLayers();
	if (clearMonitors) {
		$e.ui.element.querySelector("#toolbox-debug-analyzer-breakpoints").textContent = "";
		$e.ui.element.querySelector("#toolbox-debug-analyzer-watches").textContent = "";
	}
};

/**
 * Analyzes the type of a variable
 * @private
 * @param {*} value Value to analyze
 * @param {*} oldValue Value to analyze
 * @return {Object<type:String,text:String>} Type of object and its value as in text if possible
 * @example $e.debug.analyzeVariable(num)
 */
$e.debug.analyzeVariable = (value, oldValue) => {
	function analyzeValue(retValue) {
		if (retValue.type === "undefined") {
			retValue.text = "";
		} else if (retValue.type === "object") {
			if (value === null) {
				retValue.text = "null";
			} else if (Array.isArray(value)) {
				retValue.type = "array";
			}
		} else if (retValue.type === "number") {
			if (value === Infinity) {
				retValue.text = "Infinity";
			} else if (value === NaN) {
				retValue.text = "NaN";
			}
		} else if (retValue.type === "function") {
			retValue.text = "";
		}
		return retValue;
	}
	let retNewValue = analyzeValue({
		type: typeof value,
		text: value,
	});
	let retOldValue = analyzeValue({
		type: typeof oldValue,
		text: oldValue,
	});
	return { old: retOldValue, new: retNewValue };
};

/**
 * Initializes/Resets the instructions pause UI element
 * @private
 * @example $e.ui.debug.resetInstructionsPause()
 */
$e.ui.debug.resetInstructionsPause = () => {
	$e.ui.element.querySelector("#toolbox-debug-execute-instructionsPause-input").value = $e.execution.instructionsPause;
};

/**
 * Enable all/none of the debug monitors
 * @private
 * @example $e.ui.debug.enableAllNoneBreakpoints()
 */
$e.ui.debug.enableAllNoneBreakpoints = () => {
	const checkboxEl = $e.ui.element.querySelector("#toolbox-debug-analyzer-title-toggles-checkbox");
	const visibility = checkboxEl.checked;
	$e.ui.element.querySelectorAll("#toolbox-debug-analyzer-breakpoints input[type=checkbox], #toolbox-debug-analyzer-watches input[type=checkbox]").forEach((el, i) => {
		el.checked = visibility;
		$e.ui.toggleCanvas(i, visibility);
	});
};

/**
 * Run debug command from UI toolbox
 * @private
 * @example $e.ui.debug.resetInstructionsPause()
 */
$e.ui.debug.command = (event) => {
	event.preventDefault();
	$e.execution.execute(true, $e.ui.element.querySelector("#toolbox-debug-command-input").value);
};