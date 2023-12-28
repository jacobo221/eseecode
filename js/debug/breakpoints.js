"use strict";

/**
 * Add a watch: If it ealready exists, leave it
 * @private
 * @param {String} watch Variable to monitor
 * @param {Boolean} [pause] If true execution will pause when reached
 * @example $e.debug.addWatch("num")
 */
$e.debug.addWatch = (watch, pause) => {
	$e.execution.monitors[watch] = { breakpoint: !!pause };
	$e.execution.current.monitors[watch] = { value: undefined, oldValue: undefined };
};

/**
 * Enables/disables a watch
 * @private
 * @param {String} line Watch to disable/enable
 * @param {!HTMLElement} element HTML checkbox that triggered the function
 * @example $e.debug.toggleWatch("num", this)
 */
$e.debug.toggleWatch = (watch, element) => {
	$e.execution.monitors[watch].breakpoint = !!element.checked;
};

/**
 * Deletes a watch
 * @private
 * @param {String} watch Watch to remove
 * @example $e.debug.removeWatch("num")
 */
$e.debug.removeWatch = (watch) => {
	delete $e.execution.monitors[watch];
	delete $e.execution.current.monitors[watch];
};

/**
 * Starts an asynchronous watch addition event
 * @private
 * @example $e.ui.debug.addWatchEventStart()
 */
$e.ui.debug.addWatchEventStart = () => {
	const msgEl = document.createElement("div");
	const labelEl = document.createElement("label");
	labelEl.textContent = _("Enter the name of the variable you want to control") + ": ";
	msgEl.appendChild(labelEl);
	const input = document.createElement("input");
	input.id = "watchAddInput";
	msgEl.appendChild(input);
	$e.ui.msgBox.open(msgEl, { acceptAction: $e.ui.debug.addWatchEventAccept, cancelAction: $e.ui.msgBox.close, focus: "watchAddInput" });
};

/**
 * Completes an asynchronous watch addition event
 * @private
 * @param {Object} event Event
 * @example $e.ui.debug.addWatchEventAccept()
 */
$e.ui.debug.addWatchEventAccept = (event) => {
	const watch = $e.ui.element.querySelector("#watchAddInput").value;
	if (watch.match(/^[A-Za-z][A-Za-z_0-9]*$/)) {
		$e.ui.debug.addOrUpdateWatch(watch);
		setTimeout($e.ui.msgBox.close, 50); // Allow for form submit listeners to be triggered
	} else {
		$e.ui.msgBox.open(_("The variable name you entered is invalid!"));
	}
};

/**
 * Synchronous part of a watch addition
 * @private
 * @param {String} watch Variable to monitor
 * @param {Boolean} [showChange] If true the text will display the old value too
 * @param {Boolean} [pause] If true execution will pause when reached
 * @example $e.ui.debug.addOrUpdateWatch("num")
 */
$e.ui.debug.addOrUpdateWatch = (watch, showChange, pause) => {
	if (!watch) {
		$e.ui.debug.addWatchEventStart();
	} else if (watch !== null) {
		let watchEl = $e.ui.element.querySelector("#toolbox-debug-analyzer-watch-" + watch);
		if (!watchEl) {
			if ($e.execution.monitors[watch] === undefined) $e.debug.addWatch(watch);
			watchEl = document.createElement("div");
			watchEl.id = "toolbox-debug-analyzer-watch-" + watch;
			watchEl.classList.add("toolbox-debug-analyzer-watch");
			const watchesEl = $e.ui.element.querySelector("#toolbox-debug-analyzer-watches");
			if (watchesEl.hasChildNodes()) {
				let child = watchesEl.firstChild;
				// Find the right alphabetical order place for the watch
				while (child !== null) {
					const watchName = child.id.match(/^toolbox-debug-analyzer-watch-([A-Za-z0-9]+)$/);
					if (watchName !== null) {
						watchName = watchName[1];
						if (watchName > watch) {
							break;
						}
					}
					child = child.nextSibling;
				}
				if (child !== null) {
					watchesEl.insertBefore(watchEl, child);
				} else {
					watchesEl.appendChild(watchEl);
				}
			} else {
				watchesEl.appendChild(watchEl);
			}
		}
		const watchObject = $e.debug.analyzeVariable($e.execution.current.monitors[watch].value, $e.execution.current.monitors[watch].oldValue);
		let watchText = "<input type=\"checkbox\" id=\"toolbox-debug-analyzer-watch-" + watch + "-break\" onchange=\"$e.debug.toggleWatch(\'" + watch + "\', this)\" " + ($e.execution.monitors[watch].breakpoint ? "checked" : "") + " /><label for=\"toolbox-debug-analyzer-watch-" + watch + "-break\">" + watch + "</label>: ";
		if (showChange) {
			watchText += watchObject.old.text + " <span style=\"font-size:smaller;\">[" + watchObject.old.type + "]</span>" + " → " + watchObject.new.text + " <span style=\"font-size:smaller;\">[" + watchObject.new.type + "]</span>";
		} else {
			watchText += watchObject.new.text + " <span style=\"font-size:smaller;\">[" + watchObject.new.type + "]</span>";
		}
		watchText += "<button id=\"toolbox-debug-analyzer-watch-" + watch + "-remove\" class=\"toolbox-debug-analyzer-watch-remove link\" onclick=\"$e.ui.debug.updateRemoveWatch('" + watch + "')\">❌</button>";
		watchEl.innerHTML = watchText;
	}
};

/**
 * Highlights watches
 * @private
 * @param {Array<String>} watches Watches to highlight
 * @example $e.ui.debug.highlightWatches("num")
 */
$e.ui.debug.highlightWatches = (watches) => {
	let watchEl = $e.ui.element.querySelector("#toolbox-debug-analyzer-watches").firstChild;
	while (watchEl !== null) {
		watchEl.classList.remove("highlight");
		watchEl = watchEl.nextSibling;
	}
	watches.forEach(watch => {
		$e.ui.element.querySelector("#toolbox-debug-analyzer-watch-" + watch).classList.add("highlight");
	});
};

/**
 * Deletes a watch from UI
 * @private
 * @param {String} watch Watch to remove
 * @example $e.debug.removeWatch("num")
 */
$e.ui.debug.updateRemoveWatch = (watch) => {
	$e.debug.removeWatch(watch);
	const watchEl = $e.ui.element.querySelector("#toolbox-debug-analyzer-watch-" + watch);
	if (watchEl) watchEl.parentNode.removeChild(watchEl);
};

/**
 * Add watch from UI
 * @private
 * @param {String} oldLine Line where the breakpoint was
 * @example $e.ui.debug.addWatch()
 */
$e.ui.debug.addWatch = () => {
	$e.ui.debug.addOrUpdateWatch();
};

/**
 * Keeps track of the breakpoints in the Code view code. This function is to be called by Ace's change event
 * @private
 * @param {!Object} event Ace editor change event object
 * @example editor.on("change", $e.ui.debug.updateWriteBreakpoints);
 */
$e.ui.debug.updateWriteBreakpoints = (event) => {
	Object.keys($e.execution.monitors).forEach(breakpointLine => {
		if (!$e.isNumber(breakpointLine, true)) return;
		breakpointLine = parseInt(breakpointLine);
		if (event.data.action === "insertText") {
			if (event.data.range.start.row === breakpointLine - 1 && event.data.range.start.row !== event.data.range.end.row) {
				// The breakpoint line has been split, update breakpoint
				if (!ace.edit("view-write").session.getLine(breakpointLine-1).replace(/\s/g, '').length) {
					// Only move breakpoint if we are moving the instruction line down, not if we are splitting it
					$e.ui.debug.updateModifiedBreakpoint(breakpointLine, breakpointLine + event.data.range.end.row - event.data.range.start.row);
				}
			} else if (event.data.range.start.row < breakpointLine - 1 && event.data.range.start.row !== event.data.range.end.row) {
				// A line was added before the breakpoint, update breakpoint
				$e.ui.debug.updateModifiedBreakpoint(breakpointLine, breakpointLine + event.data.range.end.row - event.data.range.start.row);
			}
		} else if (event.data.action === "removeText" || event.data.action === "removeLines") {
			if (event.data.range.start.row === breakpointLine-1 && event.data.range.start.row !== event.data.range.end.row) {
				// The breakpoint line has been merged, update breakpoint
				$e.ui.debug.updateModifiedBreakpoint(breakpointLine, event.data.range.end.row);
			} else if (event.data.range.start.row < breakpointLine-1 && event.data.range.end.row > breakpointLine-1) {
				// Several lines where removed and this breakpoint was in the middle of those
				$e.ui.debug.updateRemovedBreakpoint(breakpointLine);
			} else if (event.data.range.start.row < breakpointLine-1 && event.data.range.start.row !== event.data.range.end.row) {
				// A line was removed before the breakpoint, update breakpoint
				$e.ui.debug.updateModifiedBreakpoint(breakpointLine, breakpointLine - (event.data.range.end.row - event.data.range.start.row));
			}
		}
	});
};

/**
 * Add a breakpoint. If it already exists, leave it
 * @private
 * @param {Number|String} [line] Line in code to add the monitor to
 * @example $e.debug.addBreakpoint(12)
 */
$e.debug.addBreakpoint = (line) => {
	if (!$e.execution.monitors[line]) {
		$e.execution.monitors[line] = { breakpoint: true };
		$e.execution.current.monitors[line] = { count: 0 };
	}
};

/**
 * Enables/disables a breakpoint
 * @private
 * @param {String} line Breakpoint to disable/enable
 * @example $e.ui.debug.toggleBreakpoint(12, this)
 */
$e.ui.debug.toggleBreakpoint = (line) => {
	const element = $e.ui.element.querySelector("#toolbox-debug-analyzer-breakpoint-" + line + "-break");
	$e.execution.monitors[line].breakpoint = element.checked;
};

/**
 * Starts an asynchronous breakpoint addition event
 * @private
 * @example $e.ui.debug.addBreakpointEventStart()
 */
$e.ui.debug.addBreakpointEventStart = () => {
	$e.session.breakpointHandler = true; // Semaphor so keyboard shortcurs and events on blocks will not be handled
	const viewContentEl = $e.ui.element.querySelector("#view-content");
	viewContentEl.classList.add("addBreakpointHandler");
	viewContentEl.addEventListener("pointerdown", $e.ui.debug.addBreakpointEventAccept); // click is also triggered by touchstart
	document.body.addEventListener("pointerdown", $e.ui.debug.addBreakpointEventCancel); // click is also triggered by touchstart
};

/**
 * Completes or cancels an asynchronous breakpoint addition event
 * @private
 * @param {Object} event Event. If unset and in blocks mode it will cancel the breakpoint event
 * @example $e.ui.debug.addBreakpointEventAccept()
 */
$e.ui.debug.addBreakpointEventAccept = (event) => {
	event.stopPropagation();
	if (!event.isPrimary) return;
	if (event && event.button !== undefined && event.button !== 0) return; // If its a mouse click attend only to left button
	const oldLine = $e.session.breakpointHandler; // Do this now as $e.ui.debug.addBreakpointEventStop clears it
	$e.ui.debug.addBreakpointEventStop();
	let line;
	if ($e.modes.views.current.type == "write") {
		line = ace.edit("view-write").selection.getCursor()["row"] + 1;
	} else {
		let target = event.target;
		while (target !== null && target.id.match(/^block-[0-9]+$/) === null) {
			if (target.id === "view-content") {
				target = null;
			} else {
				target = target.parentNode;
			}
		}
		if (target !== null) {
			line = $e.ide.blocks.getPosition($e.ui.element.querySelector("#view-blocks"), target);
		}
	}
	if (line) {
		if ($e.isNumber(oldLine)) $e.ui.debug.updateModifiedBreakpoint(oldLine, line);
		else $e.ui.debug.addOrUpdateBreakpointInUI(line);
	}
};

/**
 * Cancels an asynchronous breakpoint addition event
 * @private
 * @example $e.ui.debug.addBreakpointEventCancel()
 */
$e.ui.debug.addBreakpointEventCancel = (event) => {
	if (!event.isPrimary) return;
	if (event && event.button !== undefined && event.button !== 0) return; // If it's a mouse click attend only to left button
	$e.ui.debug.addBreakpointEventStop();
};

/**
 * Stops an asynchronous breakpoint addition event
 * @private
 * @example $e.ui.debug.addBreakpointEventStop()
 */
$e.ui.debug.addBreakpointEventStop = () => {
	$e.session.breakpointHandler = undefined;
	const viewContentEl = $e.ui.element.querySelector("#view-content");
	viewContentEl.classList.remove("addBreakpointHandler");
	viewContentEl.removeEventListener("pointerdown", $e.ui.debug.addBreakpointEventAccept);
	document.body.removeEventListener("pointerdown", $e.ui.debug.addBreakpointEventCancel);
};

/**
 * Synchronous part of a breakpoint addition
 * @private
 * @param {Number|String} [line] Line in code to add the monitor to. If unset it calls for the user to set it up via the UI
 * @param {Number|String} [replaceLine] Monitor to replace
 * @example $e.ui.debug.addOrUpdateBreakpointInUI(12)
 */
$e.ui.debug.addOrUpdateBreakpointInUI = (line, replaceLine) => {
	if (!line) return $e.ui.debug.addBreakpointEventStart();
	if (!replaceLine) replaceLine = line;
	let breakpointEl;
	if (!(breakpointEl = $e.ui.element.querySelector("#toolbox-debug-analyzer-breakpoint-" + line))) {
		if (!$e.execution.monitors[line]) $e.debug.addBreakpoint(line);
		breakpointEl = document.createElement("div");
		breakpointEl.id = "toolbox-debug-analyzer-breakpoint-" + line;
		breakpointEl.classList.add("toolbox-debug-analyzer-breakpoint");
		const breakpointsEl = $e.ui.element.querySelector("#toolbox-debug-analyzer-breakpoints");
		if (breakpointsEl.hasChildNodes()) {
			let child = breakpointsEl.firstChild;
			while (child !== null) {
				let number = child.id.match(/^toolbox-debug-analyzer-line([0-9]+)$/);
				if (number !== null) {
					number = number[1];
					if (parseInt(number) > parseInt(line)) {
						break;
					}
				}
				child = child.nextSibling;
			}
			if (child !== null) {
				breakpointsEl.insertBefore(breakpointEl, child);
			} else {
				breakpointsEl.appendChild(breakpointEl);
			}
		} else {
			breakpointsEl.appendChild(breakpointEl);
		}
		if ($e.execution.monitors[line].breakpoint) {
			if ($e.modes.views.current.type == "write") {
				ace.edit("view-write").session.setBreakpoint(line - 1, "ace-breakpoint");
			} else {
				const viewEl = $e.ui.element.querySelector("#view-blocks");
				const blockEl = $e.ide.blocks.getByPosition(viewEl, line);
				if (blockEl) blockEl.classList.add("highlight");
			}
		}
	}
	breakpointEl.addEventListener("pointerover", () => $e.ui.highlight(line, "breakpointed"));
	breakpointEl.addEventListener("pointerout", $e.ui.unhighlight);
	breakpointEl.addEventListener("pointercancel", $e.ui.unhighlight);
	let breakpointText = "<input type=\"checkbox\" id=\"toolbox-debug-analyzer-breakpoint-" + line + "-break\" onchange=\"$e.ui.debug.toggleBreakpointInUI(" + line + ", this)\" " + ($e.execution.monitors[line].breakpoint ? "checked" : "") + " />";
	breakpointText += "<label id=\"toolbox-debug-analyzer-breakpoint-" + line + "-name\" for=\"toolbox-debug-analyzer-breakpoint-" + line + "-break\">" + _("Line") + " " + line + "</label>: ";
	breakpointText += "<span id=\"toolbox-debug-analyzer-breakpoint" + line + "-count\">" + $e.execution.current.monitors[line].count + "</span>";
	breakpointText += "<button id=\"toolbox-debug-analyzer-breakpoint-" + line + "-edit\" class=\"toolbox-debug-analyzer-breakpoint-edit link\" onclick=\"$e.ui.debug.modifyBreakpoint(" + line + ")\">✏️</button>";
	breakpointText += "<button id=\"toolbox-debug-analyzer-breakpoint-" + line + "-remove\" class=\"toolbox-debug-analyzer-breakpoint-remove link\" onclick=\"$e.ui.debug.updateRemovedBreakpointFromUI(" + line + ")\">❌</button>";
	breakpointEl.innerHTML = breakpointText;
	$e.ui.element.querySelector("#toolbox-debug-analyzer-breakpoint-" + line).classList[$e.execution.current.highlight.lineNumber == line ? "add" : "remove"]("highlight");
};

/**
 * Edit breakpoint
 * @private
 * @param {String} oldLine Line where the breakpoint was
 * @param {String} [line] Line where the breakpoint will be. If unset just add the breakpoint
 * @example $e.debug.modifyBreakpoint(12, 17)
 */
$e.debug.modifyBreakpoint = (oldLine, line) => {
	$e.execution.monitors[line] = $e.execution.monitors[oldLine];
	$e.execution.current.monitors[line] = $e.execution.current.monitors[oldLine];
	delete $e.execution.monitors[oldLine];
	delete $e.execution.current.monitors[oldLine];
};

/**
 * Edit breakpoint in UI
 * @private
 * @param {String} oldLine Line where the breakpoint was
 * @param {String} [line] Line where the breakpoint will be. If unset just add the breakpoint
 * @example $e.ui.debug.updateModifiedBreakpoint(12, 17)
 */
$e.ui.debug.updateModifiedBreakpoint = (oldLine, line) => {

	if (oldLine == line) return; // Nothing to do
	else if ($e.execution.monitors[line]) return; // Here's already a breakpoint. The action to use is remove breakpoint, not edit breakpoint

	$e.debug.modifyBreakpoint(oldLine, line);
	if ($e.modes.views.current.type == "write") {
		if ($e.execution.monitors[line].breakpoint) {
			ace.edit("view-write").session.setBreakpoint(line - 1, "ace-breakpoint");
		}
		ace.edit("view-write").session.clearBreakpoint(oldLine - 1);
	} else {
		const viewEl = $e.ui.element.querySelector("#view-blocks");
		let blockEl;
		if ($e.execution.monitors[line].breakpoint) {
			blockEl = $e.ide.blocks.getByPosition(viewEl, line);
			if (blockEl) blockEl.classList.remove("highlight");
		}
		blockEl = $e.ide.blocks.getByPosition(viewEl, oldLine);
		if (blockEl) blockEl.classList.remove("highlight");
	}
	const blockEl = $e.ui.element.querySelector("#toolbox-debug-analyzer-breakpoint-" + oldLine);
	if (blockEl) blockEl.parentNode.removeChild(blockEl);
	$e.ui.debug.addOrUpdateBreakpointInUI(line, oldLine);

};

/**
 * Add breakpoint from UI
 * @private
 * @param {String} oldLine Line where the breakpoint was
 * @example $e.ui.debug.addBreakpoint())
 */
$e.ui.debug.addBreakpoint = () => {
	$e.ui.debug.addBreakpointEventStart();
};

/**
 * Edit breakpoint from UI
 * @private
 * @param {String} oldLine Line where the breakpoint was
 * @example $e.ui.debug.modifyBreakpoint(12)
 */
$e.ui.debug.modifyBreakpoint = (oldLine) => {
	$e.ui.debug.addBreakpointEventStart();
	$e.session.breakpointHandler = oldLine; // Do it after $e.ui.debug.addBreakpointEventStart() as otherwise it is overwritten
};

/**
 * Keeps track of the breakpoints in the blocks code. This function is to be called by $e.ui.blocks.add() and $e.ui.blocks.removeFromCode()
 * @private
 * @param {!Object} blockEl Element of a block
 * @param {String} [action] Action that triggers the update
 * @example $e.ui.debug.updateBlocksBreakpoints(blockEl);
 */
$e.ui.debug.updateBlocksBreakpoints = (blockEl, action) => {
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	const line = $e.ide.blocks.getPosition(viewEl, blockEl);
	const blockSize = $e.ide.blocks.getTreeSize(blockEl);
	Object.keys($e.execution.monitors).forEach(breakpointLine => {
		if (!$e.isNumber(breakpointLine, true)) return;
		breakpointLine = parseInt(breakpointLine);
		if (breakpointLine < line) return;
		if (action === "add") {
			$e.ui.debug.updateModifiedBreakpoint(breakpointLine, breakpointLine + blockSize);
		} else if (action === "delete") {
			$e.ui.debug.updateModifiedBreakpoint(breakpointLine, breakpointLine - blockSize);
		}
	});
};

/**
 * Initializes/Resets the breakpoints' highlights in UI
 * @private
 * @example $e.ui.debug.resetBreakpointsHighlights()
 */
$e.ui.debug.resetBreakpointsHighlights = () => {
	ace.edit("view-write").session.clearBreakpoints();
	if ($e.ui.blocks.codeIsEmpty()) return;
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	Object.keys($e.execution.monitors).forEach(key => {
		if (!$e.isNumber(breakpointLine, true)) return;
		const blockEl = $e.ide.blocks.getByPosition(viewEl, key);
		blockEl.classList.remove("highlight");
	});
};

/**
 * Enables/disables a breakpoint in UI
 * @private
 * @param {String} line Breakpoint to disable/enable
 * @example $e.ui.debug.toggleBreakpointInUI(12, this)
 */
$e.ui.debug.toggleBreakpointInUI = (line) => {
	$e.ui.debug.toggleBreakpoint(line);
	if ($e.modes.views.current.type == "write") {
		if ($e.execution.monitors[line].breakpoint) {
			ace.edit("view-write").session.setBreakpoint(line - 1, "ace-breakpoint");
		} else {
			ace.edit("view-write").session.clearBreakpoint(line - 1);
		}
	} else {
		const viewEl = $e.ui.element.querySelector("#view-blocks");
		const blockEl = $e.ide.blocks.getByPosition(viewEl, line);
		if (blockEl) {
			if ($e.execution.monitors[line].breakpoint) {
				blockEl.classList.add("highlight");
			} else {
				blockEl.classList.remove("highlight");
			}
		}
	}
};

/**
 * Deletes a breakpoint
 * @private
 * @param {String} line Line to remove breakpoint from
 * @example $e.ui.debug.updateRemovedBreakpoint(12)
 */
$e.debug.updateRemovedBreakpoint = (line) => {
	delete $e.execution.monitors[line];
	delete $e.execution.current.monitors[line];
};

/**
 * Deletes a breakpoint called from UI
 * @private
 * @param {String} line Line to remove breakpoint from
 * @example $e.ui.debug.updateRemovedBreakpointFromUI(12)
 */
$e.ui.debug.updateRemovedBreakpointFromUI = (line) => {
	$e.ui.debug.updateRemovedBreakpoint(line);
};

/**
 * Deletes a breakpoint in UI
 * @private
 * @param {String} line Line to remove breakpoint from
 * @example $e.ui.debug.updateRemovedBreakpoint(12)
 */
$e.ui.debug.updateRemovedBreakpoint = (line) => {
	$e.debug.updateRemovedBreakpoint(line);
	if ($e.modes.views.current.type == "write") {
		ace.edit("view-write").session.clearBreakpoint(line-1);
	} else {
		const blockEl = $e.ide.blocks.getByPosition($e.ui.element.querySelector("#view-blocks").firstChild, line - 1);
		if (blockEl) blockEl.classList.remove("highlight");
	}
	const breakpointEl = $e.ui.element.querySelector("#toolbox-debug-analyzer-breakpoint-" + line);
	if (breakpointEl) breakpointEl.parentNode.removeChild(breakpointEl);
};

/**
 * Initializes/Resets the breakpoints and watches in $e.execution.monitors and $e.execution.current.monitors
 * @private
 * @example $e.debug.resetMonitors()
 */
$e.debug.resetMonitors = () => {
	if (!$e.execution.monitors) $e.execution.monitors = {};
	if (!$e.execution.current.monitors) $e.execution.current.monitors = {};
	Object.entries($e.execution.current.monitors).forEach(([key, monitor]) => {
		if ($e.isNumber(key, true)) monitor.count = 0;
		else monitor.oldValue = monitor.value = undefined;
	});
};

/**
 * Updates the monitors in UI
 * @private
 * @param {Boolean} [showChange] If true the text will display the old value too
 * @example $e.ui.debug.updateMonitors()
 */
$e.ui.debug.updateMonitors = (showChange) => {
	Object.keys($e.execution.monitors).forEach(key => {
		if ($e.isNumber(key, true)) $e.ui.debug.addOrUpdateBreakpointInUI(key);
		else $e.ui.debug.addOrUpdateWatch(key, showChange && $e.execution.current.watchesChanged.includes(key));
	});
};

/**
 * Updates the debug UI with monitors' status
 * @private
 * @param {Number} lineNumber Line of code being executed
 * @param {Array<String>} watchesChanged List of watches that have changed value
 * @param {Boolean} [switchToolbox] If true, toolbox UI is switched to debug
 * @param {Boolean} [pause] If true, it will not pause execution. Defaults to true
 * @return {Object<type:String,text:String>} Type of object and its value as in text if possible
 * @example $e.debug.breakpointReached(115, [ "firstname" ])
 */
$e.debug.breakpointReached = async function(lineNumber, watchesChanged, switchToolbox = true, pause = true) {
	if (switchToolbox && pause) $e.ui.switchToolboxMode("debug");
	if (watchesChanged) $e.ui.debug.highlightWatches(watchesChanged);
	if (pause) {
		$e.ui.debug.updateMonitors(true);
		$e.execution.updateStatus("breakpointed");
		$e.ui.highlight(lineNumber, "breakpointed");
		await $e.execution.freeze();
	}
	$e.ui.debug.updateMonitors(false);
};