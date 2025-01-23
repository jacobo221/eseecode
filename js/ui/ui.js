"use strict";

/**
 * Initializes or resets custom UI elements
 * Such elements include the view and toolbox buttons and the view and toolbox backgrounds
 * @private
 * @example $e.ui.initElements()
 */
$e.ui.initElements = () => {
	
	// View background
	let canvas, ctx, el, width, height, src;
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	el = $e.ui.element.querySelector("#view-content");
	width = el.parentNode.offsetWidth; // Use parent in case it had display:none at this moment
	height = el.parentNode.offsetHeight;
	if (height === 0) height = 800; // Sometimes we reach this point before the browser has finished loading the DOM
	canvas.width = width;
	canvas.height = height;
	let rBackground ="D5";
	let gBackground = "DF";
	let bBackground = "DA";
	ctx.fillStyle = "#" + rBackground + gBackground + bBackground;
	ctx.fillRect(0, 0, width, height);
	const colorDifferMax = 30;
	let widthMax = 30;
	rBackground = parseInt(rBackground, 16);
	gBackground = parseInt(gBackground, 16);
	bBackground = parseInt(bBackground, 16);
	for (let i = 0; i < 75; i++) {
		const randomValue = Math.floor(Math.random() * colorDifferMax - colorDifferMax / 2);
		const r = (randomValue + rBackground).toString(16).slice(-2);
		const g = (randomValue + gBackground).toString(16).slice(-2);
		const b = (randomValue + bBackground).toString(16).slice(-2);
		ctx.fillStyle = "#" + r + g + b;
		const x = Math.floor(Math.random() * width);
		const y = Math.floor(Math.random() * height);
		const size = Math.floor(Math.random() * widthMax);
		ctx.beginPath();
		ctx.arc(x, y, size, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.closePath();
	}
	src = canvas.toDataURL();
	el.style.setProperty("--view-bg-image", "url(" + src + ")");

	// Toolbox background
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	el = $e.ui.element.querySelector("#toolbox-content");
	width = el.parentNode.clientWidth; // Use parent in case it had display:none at this moment
	height = el.parentNode.clientHeight;
	canvas.width = width;
	canvas.height = height;
	rBackground = "FF";
	gBackground = "FA";
	bBackground = "CD";
	ctx.fillStyle = "#" + rBackground + gBackground + bBackground;
	ctx.fillRect(0,0,width,height);
	widthMax = 20;
	for (let i = 0; i < 10; i++) {
		ctx.strokeStyle = "#EAEAEA";
		const x = Math.floor(Math.random() * width);
		const y = Math.floor(Math.random() * height);
		const sideStart = Math.floor(Math.random() * 2);
		const sideEnd = Math.floor(Math.random() * 2);
		const size = Math.floor(Math.random() * widthMax);
		ctx.lineWidth = size;
		ctx.beginPath();
		if (sideStart == 0) {
			ctx.moveTo(0, x);
		} else {
			ctx.moveTo(x, 0);
		}
		if (sideEnd == 0) {
			ctx.lineTo(width, y);
		} else {
			ctx.lineTo(y, height);
		}
		ctx.stroke();
	}
	src = canvas.toDataURL();
	el.style.setProperty("--toolbox-bg-image", "url(" + src + ")");
};

/**
 * Initializes/Resets the input/output UI
 * @private
 * @param {Boolean} [clearInput=false] Do you want to clear the input area?
 * @example $e.ui.resetIO()
 */
$e.ui.resetIO = (clearInput) => {
	$e.ui.element.querySelector("#toolbox-io-output").textContent = "";
	if (clearInput) $e.ui.element.querySelector("#toolbox-io-input").value = $e.execution.inputDefault;
};

/**
 * Downloads the user code as a file to the user's device
 * @private
 * @example $e.ui.saveCode()
 */
$e.ui.saveCode = () => {
	$e.ui.msgBox.open(_("Give a name to the file") + ": <input id=\"filename\" value=\"" + $e.ui.codeFilename + "\">", { acceptAction: () => { 
		let filename = $e.ui.element.querySelector("#filename").value;
		filename = filename.replace("/", "").replace("\\", "");
		if (filename.length > 0 && !filename.includes(".")) {
			filename += ".esee";
		}
		if (filename.length > 0) {
			$e.ui.codeFilename = filename;
		} else {
			filename = $e.ui.codeFilename;
		}
		const mimetype = "text/plain";
		$e.ide.saveFile($e.downloadCode(), filename, mimetype);
		$e.ui.msgBox.close();
	}, acceptName: _("Save"), cancel: true, focus: "filename" });
};

/**
 * Asks the user via the UI to upload a file which will then trigger $e.loadCode()
 * @private
 * @example $e.ui.loadCode()
 */
$e.ui.loadCode = () => {
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		if ($e.session.lastSave < $e.session.lastChange) {
			$e.ui.msgBox.open(_("You have made changes to your code which you haven't yet saved. Are you sure you want to load another code?"), { acceptAction : () => { $e.ui.msgBox.close(); $e.ui.openCodeFile(); }, cancelAction: $e.ui.msgBox.close });
		} else {
			$e.ui.openCodeFile();
		}
	} else {
		$e.ui.msgBox.open(_("Sorry, your browser doesn't support uploading files directly. Paste your code into Code view and then switch to the view you wish to code with."));
	}
};

/**
 * Uploads a file which will then trigger $e.ui.openCodeFileHandler()
 * @private
 * @example $e.ui.openCodeFile()
 */
$e.ui.openCodeFile = () => {
	const uploadButton = document.createElement("input");
	uploadButton.type = "file";
	uploadButton.addEventListener("change", $e.ui.openCodeFileHandler);
	uploadButton.addEventListener("click", $e.ui.openCodeFileHandler); // To help fix Android 4.4 webview bug not calling openFileChooser
	uploadButton.classList.add("hide");
	document.body.appendChild(uploadButton);
	uploadButton.click();
	document.body.removeChild(uploadButton);
};

/**
 * Completes or cancels the $e.ui.openCodeFile() asynchronous event by loading the code into the view if possible
 * @private
 * @param {!Object} event Eventfile.type
 * @example $e.ui.openCodeFileHandler(event)
 */
$e.ui.openCodeFileHandler = (event) => {
	if (event.type == "click") {
		// This is just a handler for embedding apps to be able to use their own fileChooser dialogs
		return;
	}
	if (event.target.files.length === 0) {
		return;
	}
	const file = event.target.files[0];
	if (!file) {
		$e.ui.msgBox.open(_("Failed to upload the file!"));
		return;
	} else if (file.type && !file.type.match('text.*')) {
		$e.ui.msgBox.open(_("%s is not a valid eSee file! (Invalid file type %s)", [ file.name, file.type ]));
		return;
	}
	const reader = new FileReader();
	reader.onload = (event) => {
		$e.ui.loadCodeFile(event.target.result, file.name, $e.ui.loadCodeFile);
		$e.ui.loading.close();
	};
	reader.onerror = $e.ui.loading.close;
	$e.ui.loading.open();
	reader.readAsText(file);
};

/**
 * Loads a code file
 * @private
 * @param {String} code Code to load
 * @param {String} filename Name of the code file
 * @example $e.ui.loadCodeFile("forward(100)", "esee.code")
 */
$e.ui.loadCodeFile = (code, filename) => {
	$e.ide.uploadCode(code);
	$e.ui.codeFilename = filename;
	// If on level1 show Run button so it can be run
	if ($e.modes.views.current.id == "level1") {
		$e.ui.element.querySelector("#button-execute").classList.remove("hide");
	}
};

/**
 * Scrolls to a position in the element, it scrolls smoothly
 * @private
 * @param {!HTMLElement} el Element to scroll
 * @param {Number} height Pixels from top to scroll to
 * @param {Number} [startTop] Offset from the start. If unset it takes the current el's scroll offset
 * @example $e.ui.smoothScroll()
 */
$e.ui.smoothScroll = (el, height, startTop = el.scrollTop) => {
	clearTimeout($e.ui.scrollTimeout); // This is to prevent two scroll timeouts tunning at the same time
	height = parseInt(height);
	if  (
		(startTop < height && (el.scrollTop >= el.scrollHeight - el.clientHeight || el.scrollTop > height)) ||
		(startTop > height && (el.scrollTop <= 0 || el.scrollTop < height))
	) return; // This is to prevent infinite loop if height is out of el's height bounds
	let increment = 1;
	if ((height > el.scrollTop && height - el.scrollTop > el.clientHeight * 0.3) ||
		(height < el.scrollTop && el.scrollTop - height > el.clientHeight * 0.3)) {
		increment *= 10;
	}
	if (el.scrollTop > height) {
		increment *= -1;
	}
	el.scrollTop += increment;
	if (el.scrollTop != height) {
		$e.ui.scrollTimeout = setTimeout(() => { $e.ui.smoothScroll(el, height, startTop) }, 1);
	}
};

/**
 * Initializes/Resets all UI elements, called by the user
 * @private
 * @example $e.ui.resetExecution()
 */
$e.ui.resetExecution = () => {
	if (!$e.ide.codeIsEmpty() || $e.ide.hasUndoRedo()) {
		$e.ui.msgBox.open(_("Do you really want to start over?"), { acceptAction: $e.ui.resetForced, cancelAction: $e.ui.msgBox.close });
		return false;
	} else {
		$e.ui.resetForced();
	}
};

/**
 * Pause execution fromUI
 * @private
 * @example $e.ui.pauseExecution()
 */
$e.ui.pauseExecution = () => {
	$e.execution.pause();
};

/**
 * Resumes execution fromUI
 * @private
 * @example $e.ui.resume()
 */
$e.ui.resume = () => {
	$e.execution.resume();
};

/**
 * Initializes/Resets the filemenu UI element
 * @private
 * @example $e.ui.resetFileMenu()
 */
$e.ui.resetFileMenu = () => {
	if ($e.ui.filemenuVisible && $e.ui.translations.available.length > 1) {
		$e.ui.element.querySelector("#filemenu").classList.remove("hide");
	} else {
		$e.ui.element.querySelector("#filemenu").classList.add("hide");
	}
};

/**
 * Initializes/Resets all UI elements
 * @private
 * @example $e.ui.reset()
 */
$e.ui.reset = async () => {
	$e.ui.element.style.opacity = 0; // We make it invisible but displayed so the heights, widths, etc are calculated. Set back to visible from within $e.ui.reset()
	const firstLoad = !$e.backend.whiteboard.element;
	if (firstLoad) { // First load
		$e.ui.init();
		$e.backend.whiteboard.element = $e.ui.element.querySelector("#whiteboard");
		$e.ui.toolboxWindow = $e.ui.element.querySelector("#toolbox-window");
		$e.ui.themes.init();
		$e.instructions.init();
		$e.ide.initCategories();
		$e.ide.loadBrowserURLParameters(undefined, [ "precode", "code", "postcode", "execute", "maximize", "toolbox", "theme" ]); // Prepare the environment except execution and UI elements that are loaded later
		$e.ui.initializeSetup();
		window.addEventListener("resize", $e.ui.write.windowResizeHandler);
		if ($e.ui.whiteboardResizeInterval) clearInterval($e.ui.whiteboardResizeInterval);
		$e.ui.whiteboardResizeInterval = setInterval($e.ui.whiteboardResizeHandler, 100);
		document.addEventListener("fullscreenchange", (event) => {
			if (!$e.ui.isFullscreen()) {
				$e.ui.toggleFullscreenIcon(false);
			} else {
				$e.ui.toggleFullscreenIcon(true);
			}
		});
		$e.ui.toggleFullscreenIcon();
		if ($e.setup.autosaveInterval && $e.setup.autosaveInterval > 0) {
			setInterval(() => {
				if ($e.session.lastAutosave < $e.session.lastChange) $e.ide.autosave();
			}, $e.setup.autosaveInterval * 1000);
		}
	}
	$e.ui.loadWhiteboardSize();
	$e.ui.initElements();
	$e.ui.themes.resetMenu();
	$e.ui.element.querySelector("#title").innerHTML = '<a href="' + $e.platform.website + '" target="_blank" id="logo"><img src="' + $e.basepath + $e.platform.logo + '" title="" /></a>';
	$e.ui.resetGridModeSelect();
	$e.ide.blocks.changes.reset();
	$e.ui.debug.resetBreakpointsHighlights();
	$e.debug.resetMonitors();
	$e.ide.blocks.resetCount();
	$e.ui.resetFileMenu();
	// Init $e.modes array with ui elements
	if (!$e.modes.views.current) $e.modes.views.current = $e.modes.views.available[$e.setup.defaultView];
	Object.values($e.modes.views.available).forEach(view => view.tab = $e.ui.element.querySelector("#view-tabs-" + view.id));
	if (!$e.modes.toolboxes.current) $e.modes.toolboxes.current = $e.modes.toolboxes.available[$e.setup.defaultToolbox];
	Object.values($e.modes.toolboxes.available).forEach(toolbox => {
		const modeId = toolbox.type;
		toolbox.element = $e.ui.element.querySelector("#toolbox-" + modeId);
		toolbox.tab = $e.ui.element.querySelector("#toolbox-tabs-" + ($e.modes.views.available[toolbox.id] ? "pieces" : modeId));
	});
	$e.ui.resizeView(true);
	$e.ui.initView();
	await $e.backend.reset(false); // Precode is loaded later with $e.ide.loadBrowserURLParameters()
	$e.ui.debug.reset(true);
	$e.debug.resetMonitors();
	$e.ui.debug.updateMonitors();
	$e.ide.resetUndo();
	$e.ui.refreshUndo();
	$e.ui.element.querySelector("#toolbox-tabs-window").classList.add("hide");
	$e.ui.translations.resetMenu();
	$e.ui.translations.switch();
	document.body.removeEventListener("keydown", $e.ui.keyboardShortcuts);
	document.body.addEventListener("keydown", $e.ui.keyboardShortcuts);
	window.removeEventListener("beforeunload", $e.ui.windowRefresh);
	window.addEventListener("beforeunload", $e.ui.windowRefresh);
	$e.ui.write.windowResizeHandler();
	$e.ui.whiteboardResizeHandler();
	// onkeydown handler will be called from shortcuts so it is only called when no shortcut exists
	document.body.removeEventListener("keyup", $e.backend.events.keyboard);
	[ "pointerdown", "pointermove", "pointerup", "pointerout", "pointercancel" ].forEach(type => $e.backend.whiteboard.element.removeEventListener(type, $e.backend.events.pointer));
	$e.backend.events.reset();
	// onkeydown handler will be called from shortcuts so it is only called when no shortcut exists
	document.body.addEventListener("keyup", $e.backend.events.keyboard, false);
	[ "pointerdown", "pointermove", "pointerup", "pointerout", "pointercancel" ].forEach(type => $e.backend.whiteboard.element.addEventListener(type, $e.backend.events.pointer));
	$e.session.updateOnViewSwitch = false;
	$e.ide.loadBrowserURLParameters([ "e", "precode", "code", "postcode", "execute", "maximize" ]);
	if (firstLoad && $e.setup.autorestore) $e.ide.loadAutosave();
	$e.ui.themes.current.loaded = true; // Initially we assume the theme (default) is loaded, switchTheme will immediately change it to false otherwise
	$e.ide.loadBrowserURLParameters([ "theme" ], undefined, true);
	$e.session.lastChange = 0;
	const testUntilReady = () => {
		if ($e.ui.translations.current.loaded && $e.ui.themes.current.loaded) {
			$e.session.ready = Date.now();
			$e.ide.loadBrowserURLParameters([ "toolbox" ], undefined, true);
			$e.ui.element.style.visibility = ""; // Remove the visiblity = "hidden" set in eseecode.js to improve the loading animation
			$e.ui.element.style.opacity = 1;
		} else {
			setTimeout(testUntilReady, 100);
		}
	};
	testUntilReady();
	return;
};

/**
 * Highlight code
 * @private
 * @param {Number} [lineNumber] Line to highlight. If unset it highlights the last line marked with setHighlight()
 * @param {String} [reason=stepped] Reason for highlighting. Available reasons are: "stepped", "breakpointed", "error"
 * @example $e.ui.highlight(12, "error")
 */
$e.ui.highlight = (lineNumber, reason = "stepped") => {
	if (!lineNumber) {
		lineNumber = $e.execution.current.highlight.lineNumber;
		reason = $e.execution.current.highlight.reason;
	}
	if (!lineNumber) return;
	$e.ui.unhighlight();
	let displayLineNumber = lineNumber;
	if (reason == "steps") displayLineNumber++; // Steps are triggered before executing the next line
	const mode = $e.modes.views.current.type;
	if (mode == "blocks") {
		const blockEl = $e.ide.blocks.getByPosition(displayLineNumber);
		if (blockEl && blockEl.id != "view-blocks-tip") { // after last instruction in code there is no block (execution finished) so we must check if the block exists
			blockEl.classList.add("highlight");
			if (reason === "error") blockEl.classList.add("highlight-error");
			else if (reason === "breakpointed") blockEl.classList.add("highlight-breakpoint");
			$e.ui.blocks.scrollTo(blockEl);
		}
	} else if (mode == "write") {
		let style;
		if (reason == "error") {
			style = "ace_stack";
		} else if (reason == "breakpointed") {
			style = "ace_breakpoint";
		} else {
			style = "ace_step";
		}
		$e.ui.write.selectTextareaLine(displayLineNumber, displayLineNumber, style);
		$e.session.editor.scrollToLine(displayLineNumber, true, true);
	}
	$e.ide.highlight(lineNumber, reason);
};

/**
 * Removes code highlight
 * @private
 * @example $e.ui.unhighlight()
 */
$e.ui.unhighlight = () => {
	const line = $e.execution.current.highlight.lineNumber; // Remember, steps are triggered before executing the next line
	if (!line) return;
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	viewEl.querySelectorAll(".highlight").forEach(el => el.classList.remove("highlight", "highlight-breakpoint", "highlight-error")); // by the time we have to unhighlight it the block might not exist anymore
	const markers = $e.session.editor.session.getMarkers(false);
	Object.values(markers).forEach(marker => $e.session.editor.session.removeMarker(marker.id));
	$e.ide.unhighlight();
};

/**
 * Keyboard shortcuts listener. It listenes for all keyboard presses and calls functions when shurtcut combinations happen
 * @private
 * @param {Object} event Event
 * @example document.body.addEventListener("keydown", $e.ui.keyboardShortcuts)
 */
$e.ui.keyboardShortcuts = async (event) => {
	let isShortcut = false;
	if (event.key == "Escape") {
		if ($e.session.moveBlocksHandler) {
			isShortcut = true;
			// It is cancelled within multiselectToggle later in this function
		} else if ($e.session.breakpointHandler) {
			isShortcut = true;
			$e.ui.debug.addBreakpointEventCancel(event);
		} else if ($e.ui.element.querySelector(".msgBoxWrapper")) {
			isShortcut = true;
			if ($e.ui.element.querySelector(".setupBlock")) {
				$e.ui.blocks.setup.cancel();
			} else {
				$e.ui.msgBox.close();
			}
		} else if ($e.ui.blocks.getFloatingBlockAction()) {
			isShortcut = true;
			$e.ui.blocks.cancelFloatingBlock();
		}
	} else if (event.ctrlKey && event.key == "o") { // CTRL+O
		if ($e.ui.disableKeyboardShortcuts) return;
		isShortcut = true;
		$e.ui.openCodeFile();
		event.preventDefault();
	} else if (event.ctrlKey && event.key == "s") { // CTRL+S
		if ($e.ui.disableKeyboardShortcuts) return;
		isShortcut = true;
		$e.ui.saveCode();
		event.preventDefault();
	} else if (event.key == "r" && event.ctrlKey) { // CTRL+R
		if ($e.ui.disableKeyboardShortcuts) return;
		isShortcut = true;
		$e.session.runFrom = "keyboard_shortcut";
		if ($e.execution.isRunning()) {
			$e.execution.pause();
		} else {
			$e.ide.executeOrResume();
		}
		event.preventDefault();
	} else if ($e.modes.views.current.type == "blocks") {
		if (event && event.type == "keydown") {
			if (event.ctrlKey && event.key == "z") { // CTRL+Z
				if ($e.ui.disableKeyboardShortcuts) return;
				isShortcut = true;
				event.preventDefault();
				await $e.ui.undo();
			} else if (event.ctrlKey && (event.key == "Z" || event.key == "y")) { // CTRL+SHIFT+Z or CTRL+Y
				if ($e.ui.disableKeyboardShortcuts) return;
				isShortcut = true;
				event.preventDefault();
				await $e.ui.redo();
			}
		}
	}
	if (isShortcut) {
		$e.ui.blocks.multiselectToggle(false);
	} else {
		// Not a valid eSeeCode shortcut, call the keyboard handler for the user code to parse it
		$e.backend.events.keyboard(event);
	}
};

/**
 * Parses the parameters to initialize UI setup
 * @private
 * @example $e.ui.initializeSetup()
 */
$e.ui.initializeSetup = () => {
	$e.ui.element.querySelector("#setup-guide-enable").checked = $e.ui.guideVisible;
	$e.ui.element.querySelector("#setup-grid-enable").checked = $e.ui.gridVisible;
	$e.ui.element.querySelector("#setup-grid-divisions").value = Math.round($e.backend.whiteboard.width / $e.ui.gridStep) - 1;
};

/**
 * Detects whether the site is in fullscreen mode or not
 * @return {Boolean} True if the page is in fullscreen mode
 * @example $e.ui.isFullscreen();
 */
$e.ui.isFullscreen = () => {
	return !!window.navigator.standalone || !!document.fullscreenElement;
};

/**
 * Redraws the maximize/restore fullscreen icon
 * @example $e.ui.toggleFullscreenIcon();
 */
$e.ui.toggleFullscreenIcon = () => {
	const fullscreenButton = $e.ui.element.querySelector("#fullscreen-button");
	// Do not show this button if the page is embedded
	if ($e.ui.fullscreenmenuVisible === false) {
			fullscreenButton.classList.add("hide");
	} else {
			fullscreenButton.classList.remove("hide");
	}
};

/**
 * Set/unsets fullscreen view
 * @param {Boolean} [fullscreen] Force fullscreen
 * @example $e.ui.toggleFullscreen();
 */
$e.ui.toggleFullscreen = (fullscreen) => {
	if (!$e.ui.isFullscreen() || fullscreen === true) {
		const element = document.documentElement;
		if(element.requestFullscreen) element.requestFullscreen();
	} else {
		if(document.exitFullscreen) document.exitFullscreen();
	}
};

/**
 * Resets all UI elements even if code is already loaded
 * @private
 * @example $e.ui.resetForced()
 */
$e.ui.resetForced = () => {
	$e.ui.reset();
	$e.ui.msgBox.close();
};

/**
 * Window refresh handler
 * @private
 * @example $e.ui.windowRefresh()
 */
$e.ui.windowRefresh = (event) => {
	if ($e.session.lastSave < $e.session.lastChange && $e.ui.preventExit !== false) {
			event.returnValue = _("Careful, any code you haven't saved will be lost if you leave this page!");
	}
};

/**
 * Runs the code, triggered by the user
 * @private
 * @example $e.ui.execute()
 */
$e.ui.execute = async function() {
	$e.session.runFrom = "user_ui_button";
	$e.ide.execute();
};

/**
 * Undoes the last action in the current level
 * @private
 * @param {Boolean} [redo] Whether we want to redo or undo
 * @example $e.ui.undo()
 */
$e.ui.undo = async (redo) => {
	redo = redo === true; // redo could be an Event, but we do not care about event
	const mode = $e.modes.views.current.type;
	if (mode == "blocks") {
		$e.ide.blocks.changes.undo(redo);
		if ($e.modes.views.current.id == "level1") {
			$e.session.runFrom = "level1_undo_block";
			await $e.ide.execute(false, true, true);
		}
	} else if (mode == "write") {
		if (redo) {
			$e.session.editor.session.getUndoManager().redo();
		} else {
			$e.session.editor.session.getUndoManager().undo();
		}
	}
	$e.ui.refreshUndo();
};

/**
 * Redoes the last action in the current level
 * @private
 * @example $e.ui.redo()
 */
$e.ui.redo = async () => {
	await $e.ui.undo(true);
};

/**
 * Shows/Hide undo/redo buttons
 * @private
 * @example $e.ui.refreshUndo()
 */
$e.ui.refreshUndo = () => {
	let hasUndo, hasRedo;
	if ($e.modes.views.current.type === "write") {
		const aceUndoManager =  $e.session.editor.session.getUndoManager();
		hasUndo = aceUndoManager.hasUndo();
		hasRedo = aceUndoManager.hasRedo();
	} else {
		hasUndo = $e.ide.blocks.changes.hasUndo();
		hasRedo = $e.ide.blocks.changes.hasRedo();
	}
	if (hasUndo) {
		$e.ui.element.querySelector("#button-undo").classList.remove("invisible");
	} else {
		$e.ui.element.querySelector("#button-undo").classList.add("invisible");
	}
	if (hasRedo) {
		$e.ui.element.querySelector("#button-redo").classList.remove("invisible");
	} else {
		$e.ui.element.querySelector("#button-redo").classList.add("invisible");
	}
	$e.ui.updateViewButtonsVisibility();
};