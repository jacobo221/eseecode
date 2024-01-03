"use strict";

/**
 * Tasks to run when the code changes
 * @private
 * @param {Boolean} [resetProgramCounter=true] If true, resets the program counter
 * @example $e.ide.changed()
 */
$e.ide.changed = (resetProgramCounter = true) => {
	if (resetProgramCounter) {
		$e.execution.stop();
		$e.execution.initProgramCounter(); // This is so stepped execution will start from the beginning
	}
	$e.session.lastChange = new Date().getTime();
	$e.ui.unhighlight();
	$e.ui.refreshUndo();
	$e.ui.updateViewButtonsVisibility();
	$e.ui.element.querySelector("#restorecode").classList.add("disabled");
};

/**
 * Autosave code
 * @private
 * @param {String} [forceCode] If contains code this is the code that will be autosaved
 * @example $e.ide.autosave()
 */
$e.ide.autosave = (forceCode = true) => {
	const mode = $e.modes.views.current.type;
	let code;
	if (typeof forceCode === "string") {
		code = forceCode;
	} else if (mode === "write") {
		code = $e.session.editor.getValue();
	} else {
		code = $e.ide.blocks.toCode($e.ui.element.querySelector("#view-blocks").firstChild);
	}
	if (forceCode || code) localStorage.setItem("code", code); // Do not overwrite stored code if it is empty, unless forced store has been requested
	$e.session.lastAutosave = Date.now();
};

/**
 * Returns if there is autosaved code available
 * @private
 * @example $e.ide.hasAutosave()
 */
$e.ide.hasAutosave = () => {
	const code = localStorage.getItem("code");
	return !!code;
};

/**
 * Load autosaved code
 * @private
 * @example $e.ide.loadAutosave()
 */
$e.ide.loadAutosave = () => {
	const code = localStorage.getItem("code");
	if (code) $e.ide.uploadCode(code);
	$e.ui.element.querySelector("#restorecode").classList.add("disabled");
};

/**
 * Parses the parameters in the browser's URL
 * @private
 * @param {Array} [whitelist] Only load this specific parameters
 * @param {Array} [blacklist] Do not load this specific parameters
 * @param {Boolean} [action=false] Run the action (true) or only set it up (false)
 * @example $e.ide.loadBrowserURLParameters([ "precode" ])
 */
$e.ide.loadBrowserURLParameters = async function(whitelist, blacklist, action = false) {
	return await $e.api.loadURLParams(window.location.href, whitelist, action, blacklist); // Page load API calls are silent, they will be loaded during page load
};

/**
 * Hides or displays the appropiate buttons in the view
 * @private
 * @param {String} [id] Toolbox name. If unset it keeps the current toolbox
 * @example $e.ui.updateViewButtonsVisibility("debug")
 */
$e.ui.updateViewButtonsVisibility = (id = $e.modes.views.current.id) => {
	$e.ui.element.querySelector("#view-blocks-tabs").classList[$e.ide.codeIsEmpty() || id === "level4" ? "add" : "remove"]("hide");
	$e.ui.element.querySelector("#button-reset").classList[$e.ide.codeIsEmpty() || id != "level1" ? "add" : "remove"]("hide");
	$e.ui.element.querySelector("#button-execute").classList[$e.execution.isRunning() || $e.execution.isFrozen() || $e.ide.codeIsEmpty() ? "add" : "remove"]("hide");
	$e.ui.element.querySelector("#button-pause").classList[$e.execution.isRunning() ? "remove" : "add"]("hide");
	$e.ui.element.querySelector("#button-resume").classList[$e.execution.isFrozen() ? "remove" : "add"]("hide");
	$e.ui.element.querySelector("#button-clear").classList[!$e.execution.isClean() ? "remove" : "add"]("hide");
	$e.ui.element.querySelector("#toolbox-debug-execute-step-backwards").classList[$e.execution.getProgramCounter() > 0 && ($e.execution.isFrozen() || $e.execution.isFinished()) ? "remove" : "add"]("disabled");
	$e.ui.element.querySelector("#toolbox-debug-execute-step-forward").classList[!$e.ide.codeIsEmpty() && !$e.execution.isRunning() && !$e.execution.isFinished() ? "remove" : "add"]("disabled");
	$e.ui.element.querySelector("#toolbox-debug-breakpoint-add").classList[!$e.ide.codeIsEmpty() ? "remove" : "add"]("disabled");
};

/**
 * Clears code highlight
 * @private
 * @example $e.ui.unhighlight()
 */
$e.ide.unhighlight = () => {
	$e.execution.current.highlight.lineNumber = undefined;
	$e.execution.current.highlight.reason = undefined;
};

/**
 * Mark a line to highlight
 * @private
 * @param lineNumber Line to mark to highlight
 * @param {String} [reason] Reason for highlighting. Available reasons are: "step", "error"
 * @example $e.ide.highlight(12)
 */
$e.ide.highlight = (lineNumber, reason) => {
	$e.execution.current.highlight.lineNumber = lineNumber;
	if (reason) $e.execution.current.highlight.reason = reason;
};

$e.ide.initCategories = () => {
	$e.instructions.categories = Object.values($e.instructions.set).reduce((acc, instruction) => acc.includes(instruction.category) ? acc : acc.concat(instruction.category), []);
};

/**
 * Returns a list of all eSeeCode functions declared in the code that return a specific type of value
 * @private
 * @param {!HTMLElement} type Type of value to act as filter
 * @return {Array<String>} List of all eSeeCode functions declared in the code that return a specific type of value
 * @example $e.ide.getFunctionsByType("number"))
 */
$e.ide.getFunctionsByType = (type) => {
	return Object.values($e.instructions.set).reduce((acc, instruction) => {
		if (instruction.type === type) acc.push(instruction.name);
	}, []);
};

/**
 * Get if the session has undo/redo instructions
 * @private
 * @return {Boolean} True if the session has undo/redo instructions, false otherwise
 * @example $e.ide.hasUndoRedo()
 */
$e.ide.hasUndoRedo = () => {
	const aceUndoManager =  $e.session.editor.session.getUndoManager();
	return $e.ide.blocks.hasUndo() || $e.ide.blocks.hasRedo() || aceUndoManager.hasUndo() || aceUndoManager.hasRedo();
};

/**
 * Resets the undo stacks
 * @private
 * @example $e.ide.resetUndo()
 */
$e.ide.resetUndo = () => {
	$e.ide.blocks.changes.reset();
	$e.ui.write.resetUndo();
};

/**
 * Checks is theres code in the view
 * @private
 * @return {Boolean} Whether the view is empty of code
 * @example $e.ide.codeIsEmpty()
 */
$e.ide.codeIsEmpty = () => {
	const mode = $e.modes.views.current.type;
	if (mode === "write") {
		return !$e.session.editor.getValue();
	} else {
		return $e.ui.blocks.codeIsEmpty();
	}
};

/**
 * Resets the execution and whiteboard
 * @private
 * @example $e.ide.reset()
 */
$e.ide.reset = async function() {
	await $e.backend.reset();
	$e.ui.unhighlight();
	$e.ui.switchToolboxMode($e.modes.views.current.id); // Switch to current view's "pieces" toolbox
};

/**
 * Resumes or runs the code
 * @private
 * @param {Boolean} [skipAnimation] Skips the animations
 * @example $e.ide.executeOrResume()
 */
$e.ide.executeOrResume = async function(skipAnimation) {
	if ($e.execution.isFrozen()) {
		$e.execution.resume(skipAnimation);
	} else {
		await $e.ide.execute(undefined, undefined, undefined, skipAnimation);
	}
};

/**
 * Stops and runs the code from the beginning
 * @private
 * @param {Boolean} [immediate] Run immediately (disable breakpoints and pauses)
 * @param {Boolean} [keepTrace] Do not clear the trace stack
 * @param {Boolean} [skipAnimation] Skips the animations
 * @param {Number} [forceStepped] Pause execution at this point
 * @example $e.ide.execute()
 */
$e.ide.execute = async function(immediate, keepTrace, skipAnimation, forceStepped) {
	$e.execution.stop();
	if (!keepTrace) $e.execution.traceClear();
	if (forceStepped) $e.execution.current.stepped = forceStepped;
	await $e.execution.execute(immediate, undefined, false, skipAnimation);
};

/**
 * Runs a step forward or backwards
 * @private
 * @param {Number} [steps] Positive value to step forward, negative value to step backwards. By default go 1 step forward
 * @example $e.ide.runSteps()
 */
$e.ide.runSteps = async function(steps = 1) {
	if (steps instanceof Event) steps = 1; // It may be called directly from UI
	if (steps === 0) return console.error("Step set to 0 in $e.execute.step()");
	if (steps < 0) {
		let stepped = $e.execution.getProgramCounter() + steps * $e.execution.stepSize; // We must get programCOunter before calling $e.ide.reset()
		if (stepped < 0) stepped = 0;
		await $e.backend.reset();
		$e.execution.current.stepped = stepped; // We must set this after calling $e.backend.reset()
		$e.ide.execute(false, true, true);
	} else {
		$e.execution.current.stepped = $e.execution.getProgramCounter() + steps * $e.execution.stepSize;
		$e.execution.traceTruncate();
		await $e.ide.executeOrResume(false);
	}
}

/**
 * Loads code into the view
 * @private
 * @param {String} code Code to upload
 * @param {Boolean} [run=false] If true, it runs the code immediately
 * @param {String} [type="code"] If "code" it stores the code as user code, if "precode" it stores the code to be run before every execution of user code, if "postcode" it will be run after
 * @example $e.ide.uploadCode("repeat(4){forward(100)}", "precode")
 */
$e.ide.uploadCode = (code, run, type) => {
	if (code === undefined) return;
	const level = $e.modes.views.current.id;
	const mode = $e.modes.views.current.type;
	let program;
	// Always start by trying to load the code into the current level
	let switchToMode;
	let codeParseable = true;
	if (eseecodeLanguage) {
		try {
			program = eseecodeLanguage.parse(code);
		} catch (exception) {
			codeParseable = false;
			$e.ui.msgBox.open(_("Can't open the code in %s mode because there are erros in the code. Please open the file in Code view mode and fix the following errors", [level]) + ":\n\n" + exception.name + ":  " + exception.message);
		}
	} else {
		codeParseable = false;
		$e.ui.msgBox.open(_("Can't open the code in %s mode because you don't have the eseecodeLanguage script loaded. Please open the file in Code view mode", [level]));
	}
	if (type === "precode") {
		$e.execution.precode = code;
		$e.execution.current.precode.standby = !run;
	} else if (type === "postcode") {
		$e.execution.postcode = code;
	} else {
		if (!$e.execution.isKilled()) $e.execution.stop();
		$e.session.updateOnViewSwitch = true; // Mark the code as changed, otherwise if starting in Code mode and changing to blocks view all code would be lost
		if (codeParseable) {
			if (mode == "blocks") {
				const viewEl = $e.ui.element.querySelector("#view-blocks");
				$e.ui.blocks.resetView();
				program.makeBlocks(viewEl);
				$e.session.updateOnViewSwitch = "blocks";
			} else if (mode == "write") {
				$e.ui.write.resetView(program.makeWrite("", "\t"));
				$e.session.updateOnViewSwitch = "write";
			}
			$e.ui.updateViewButtonsVisibility();
		} else {
			$e.ui.switchViewMode("code");
			$e.ui.write.resetView(code);
		}
	}
	if (run) {
		if (type === "precode") $e.execution.execute(true, undefined, true);
		else $e.ide.execute();
	}
};

/**
 * Saves data to a file. This function can be replaced by embedding apps such as Android's webview or iOS's uiwebview
 * @private
 * @param data Data to save, encoded in base64 if it is not text
 * @param filename File name
 * @param mimetype MIME type
 * @example $e.ide.saveFile("forward(100)", "esee.code", "text/plain")
 */
$e.ide.saveFile = (data64, filename, mimetype) => {
	if (!mimetype.startsWith("text/")) {
		data = window.atob(data64);
		const rawLength = data.length;
		const uInt8Array = new Uint8Array(rawLength);
		for (let i = 0; i < rawLength; ++i) {
			uInt8Array[i] = data.charCodeAt(i);
		}
		data = uInt8Array;
	} else {
		// It is text, so the data has been passed as a String, not in base64
		data = data64;
	}
	const downloadLink = document.createElement("a");
	// Chrome / Firefox
	const supportDownloadAttribute = 'download' in downloadLink;
	// Safari
	const isSafari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
	if (supportDownloadAttribute) {
		let blob;
		try {
			blob = new Blob([ data ], { type:mimetype });
		} catch(error) {
			// If Blob doesn't exist assume it is an old browser using deprecated BlobBuilder
			const builder = new window.BlobBuilder();
			builder.append(data);
			blob = builderbuilder.getBlob(mimetype);
		}
		const codeURI = URL.createObjectURL(blob);
		downloadLink.href = codeURI;
		downloadLink.download = filename;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
		// Just in case that some browser handle the click/window.open asynchronously I don't revoke the object URL immediately
		setTimeout(function () {
			URL.revokeObjectURL(codeURI);
		}, 250);
		$e.ui.msgBox.close();
	} else if (isSafari) {
		$e.ui.msgBox.close(); // We cannot close the msgBox later because we would be closing the new msgBox where the link is going to be create it, so close it now
		setTimeout(() => {
			$e.ui.msgBox.open(_("Your browser doesn't support direct download of files, please click on %s and save the page that will open.", [ "<a id='msgBoxDw' target='_blank'>" + _("this link") + "</a>" ]), { acceptName: _("Close") });
			const downloadLinkElement = $e.ui.element.querySelector("#msgBoxDw");
			if (!mimetype.istartsWith("text/")) {
				downloadLinkElement.href = "data:" + mimetype + ";base64," + data64;
			} else {
				downloadLinkElement.href = "data:" + mimetype + "," + encodeURIComponent(data64);
			}
			downloadLinkElement.addEventListener("click", $e.ui.msgBox.close);
		}, 100);
	} else {
		const oWin = window.open("about:blank", "_blank");
		if (!mimetype.startsWith("text/")) {
			oWin.document.write("data:" + mimetype + ";base64," + data64);
		} else {
			oWin.document.write("data:" + mimetype + "," + encodeURIComponent(data64));
		}
		oWin.document.close();
		// Keep the window open, this is the last option
		oWin.close();
		$e.ui.msgBox.close();
	}
	$e.session.lastSave = new Date().getTime();
};