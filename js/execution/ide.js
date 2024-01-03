"use strict";

/**
 * Gets the instructionsDelay value from the setup and updates in the $e class
 * @private
 * @example $e.execution.updateInstructionsDelay()
 */
$e.execution.updateInstructionsDelay = () => {
	$e.execution.instructionsDelay = parseInt($e.ui.element.querySelector("#toolbox-debug-execute-instructionsDelay-input").value);
	if ($e.execution.instructionsDelay < 0) $e.execution.instructionsDelay = 0;
};

/**
 * Informs that the code is now running/stopped/paused
 * @private
 * @param {String|Boolean} status Running status
 * @example $e.execution.updateStatus()
 */
$e.execution.updateStatus = (status) => {
	if ($e.execution.current.status === status) return;
	if (typeof status != "string") console.error("Invalid status in updateStatus", status);
	$e.ui.element.querySelector("#body").classList.remove($e.execution.current.status);
	$e.execution.current.status = status;
	$e.ui.element.querySelector("#body").classList.add(status);
	$e.ui.updateViewButtonsVisibility();
};

/**
 * Check whether there's code currently in the evaluation pipeline
 * @private
 * @example $e.execution.isEvaluating()
 */
$e.execution.isEvaluating = () => {
	return $e.execution.current.precode.running || $e.execution.current.usercode.running || $e.execution.current.postcode.running;
};

/**
 * Check whether the code is currently running
 * @private
 * @example $e.execution.isRunning()
 */
$e.execution.isRunning = () => {
	return $e.execution.current.status === "running";
};

/**
 * Checks if previous execution is breakpointed
 * @private
 * @example $e.execution.isBreakpointed()
 */
$e.execution.isBreakpointed = () => {
	return $e.execution.current.status == "breakpointed";
};

/**
 * Checks if previous execution is stepped
 * @private
 * @example $e.execution.isStepped()
 */
$e.execution.isStepped = () => {
	return $e.execution.current.status == "stepped";
};

/**
 * Checks if previous execution is paused
 * @private
 * @example $e.execution.isPaused()
 */
$e.execution.isPaused = () => {
	return $e.execution.current.status == "paused";
};

/**
 * Checks if previous execution is frozen
 * @private
 * @example $e.execution.isFrozen()
 */
$e.execution.isFrozen = () => {
	return $e.execution.current.status == "paused" || $e.execution.current.status == "breakpointed" || $e.execution.current.status == "stepped";
};

/**
 * Check whether there whiteboard is clean
 * @private
 * @example $e.execution.isClean()
 */
$e.execution.isClean = () => {
	return $e.execution.current.status === "clean";
};

/**
 * Check whether the code has finished running
 * @private
 * @example $e.execution.isFinished()
 */
$e.execution.isFinished = () => {
	return $e.execution.current.status === "finished";
};

/**
 * Check whether the code is not running nor paused
 * @private
 * @example $e.execution.isKilled()
 */
$e.execution.isKilled = () => {
	return $e.execution.current.status === "finished" || $e.execution.current.status === "stopped" || $e.execution.current.status === "clean";
};

/**
 * Stops execution and waits before returning
 * @private
 * @example $e.execution.stopAndWait()
 */
$e.execution.stopAndWait = async function() {
	$e.execution.stop();
	await new Promise(function waitUntilStopped(r) { // Wait until execution has been successfully stopped. We must run this async, otherwise it halts execution
		if ($e.execution.isEvaluating()) setTimeout(() => waitUntilStopped(r), 10);
		else r();
	});
};

/**
 * Pause the execution
 * @private
 * @example $e.execution.pause()
 */
$e.execution.pause = () => {
	if ($e.execution.isRunning()) $e.execution.updateStatus("paused"); // If it is "breakpointed" or "stepped", leave it as that already is paused and we do not want to overwrite that (this will only happen if pause is called from the API)
};

/**
 * Resume the execution
 * @private
 * @param {Boolean} [skipAnimation] Skips the animations
 * @example $e.execution.resume()
 */
$e.execution.resume = (skipAnimation) => {
	$e.execution.traceTruncate();
	if (skipAnimation !== undefined) $e.execution.current.animate = !skipAnimation;
	$e.execution.updateStatus("running");
};

/**
 * Stops previous execution animations
 * @private
 * @example $e.execution.stopAnimations()
 */
$e.execution.stopAnimations = () => {	
	// Stop previous execution remaining animations
	$e.execution.current.timeoutHandlers.forEach(handler => clearTimeout(handler));
};

/**
 * Stops previous execution sounds
 * @private
 * @example $e.execution.stopSounds()
 */
$e.execution.stopSounds = () => {	
	// Stop previous execution remaining sounds
	$e.execution.current.audioHandlers.forEach(handler => $e.backend.sound.stop(handler));
};

/**
 * Stops previous execution
 * @private
 * @example $e.execution.stop()
 */
$e.execution.stop = () => {
	if ($e.execution.current.pauseHandler) clearTimeout($e.execution.current.pauseHandler); // Stop if paused
	$e.execution.current.kill = true;
	clearTimeout($e.execution.current.breaktouiHandler);
	if (!$e.execution.isFinished()) $e.execution.updateStatus("stopped"); // Do not overwrite finished with stopped, as finished is used for stepped execution to display the correct buttons
	$e.execution.stopAnimations();
	$e.execution.stopSounds();
};

/**
 * Finishes the current execution
 * @private
 * @example $e.execution.end();
 */
$e.execution.end = () => {
	if ($e.execution.current.startTime !== undefined) { // When running precode initially startTime is not set so use this to detect if it is just precode we're running and in this case act as if nothing happened
		const executionTime = ((new Date().getTime()) - $e.execution.current.startTime) / 1000;
		const executionInstructions = $e.execution.current.programCounter;
		$e.ui.element.querySelector("#toolbox-debug-execute-stats").innerHTML = _("Instructions executed") + ": " + executionInstructions + "<br />" + _("Execution time") + ": " + executionTime + " " + _("secs");
		if (!$e.execution.precode.running && !$e.execution.current.postcode.running) {
			$e.execution.current.time = executionTime;
			$e.execution.current.instructionsCount = executionInstructions;
		}
	}
	$e.execution.current.kill = true;
	$e.ui.unhighlight();
};

/**
 * Clears all the history in the tracing platform
 * @private
 * @example $e.execution.traceClear()
 */
$e.execution.traceClear = () => {
	$e.execution.current.trace.stack = [];
};

/**
 * Cuts the trace disarding everything after the current position
 * @private
 * @example $e.execution.traceTruncate()
 */
$e.execution.traceTruncate = () => {
	$e.execution.current.trace.stack.splice($e.execution.current.trace.current + 1);
};

/**
 * Replace non-deterministic functions with deterministic ones
 * @private
 * @example $e.execution.traceInject()
 */
$e.execution.traceInject = () => {
	$e.execution.current.trace.current = -1;
	$e.execution.current.trace.replaced = [];
	Object.values($e.instructions.set).concat(Object.values($e.instructions.custom)).filter(v => v.nondeterministic).forEach((insrtruction) => {
		const functionName = insrtruction.name;
		$e.execution.current.trace.replaced.push({
			name: functionName,
			original: window[functionName],
		});
		window[functionName] = (() => {
			const callback = window[functionName];
			return (...argv) => {
				$e.execution.current.trace.current++;
				let value;
				if ($e.execution.current.trace.current < $e.execution.current.trace.stack.length) {
					value = $e.execution.current.trace.stack[$e.execution.current.trace.current];
				} else {
					value = callback(...argv);
					$e.execution.current.trace.stack.push(value);
				}

				return value;
			};
		})();
	});
};

/**
 * Replace the substitute deterministic functions with the original ones
 * @private
 * @example $e.execution.traceRestore()
 */
$e.execution.traceRestore = () => {
	$e.execution.current.trace.replaced.forEach((replacedFunction) => {
		window[replacedFunction.name] = replacedFunction.original;
	});
};