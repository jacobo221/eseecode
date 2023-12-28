"use static";

/**
 * Restores the toolbox window
 * @private
 * @example $e.ui.restoreToolbox()
 */
$e.ui.restoreToolbox = () => {
	$e.ui.resizeView(true);
};

/**
 * Resizes the view window
 * @private
 * @param {Boolean} [restore=false] If false it maximizes the view window taking up the toolbox window, otherwise it restores its size to the initial size
 * @example $e.ui.resizeView(true)
 */
$e.ui.resizeView = (restore) => {
	restore = restore === true; // Check for true only, as restore could be Event
	const bodyEl = $e.ui.element.querySelector("#body");
	const toolboxColumn = $e.ui.element.querySelector("#toolbox");
	if (restore || bodyEl.classList.contains("view-maximized")) { // We asume view has by default same width as toolbox
		bodyEl.classList.remove("view-maximized");
		toolboxColumn.classList.remove("hide");
	} else {
		bodyEl.classList.add("view-maximized");
		toolboxColumn.classList.add("hide");
	}
	$e.ui.switchToolboxMode($e.modes.views.current.id);
	ace.edit("view-write").resize();
};

/**
 * Switches the toolbox window adding animations, run from UI
 * @private
 * @param {String} [id] Level to switch to
 * @example $e.ui.switchViewModeFromUI("level2")
 */
$e.ui.switchViewModeFromUI = (id) => {
	const oldView = $e.modes.views.available[$e.modes.views.current.id];
	const newView = $e.modes.views.available[id];
	if (oldView.type != newView.type) $e.ui.loading.open();
	setTimeout(() => {
		$e.ui.switchViewMode(id, true);
		$e.ui.loading.close();
	}, 100);
};

/**
 * Switches the user interface to the specified view
 * @private
 * @param {String} [id] Can refer to a view number, a view id or to a view name. If unset it checks the "view" parameter in the browser's URL. If it can't determine the new view, it keeps the current view
 * @param {Boolean} [switchToolbox=false] If set to true, it will also switch the toolbox to the pieces of the new view
 * @example $e.ui.switchViewMode(2)
 */
$e.ui.switchViewMode = (id, switchToolbox = false) => {
	const oldMode = $e.modes.views.current.id;
	if (!id) id = oldMode;
	let program;
	const oldView = $e.modes.views.available[oldMode];
	const newView = $e.modes.views.available[id];
	if (oldView.type == "write" && newView.type == "blocks") {
		let code;
		code = ace.edit("view-write").getValue();
		if (eseecodeLanguage) {
			try {
				program = eseecodeLanguage.parse(code);
			} catch (exception) {
				$e.ui.msgBox.open(_("Can't convert the code to blocks. There is the following problem in your code") + ":\n\n" + exception.name + ":  " + exception.message);
				if (!exception.message) return;
				const lineNumberMatch = exception.message.match(/. (i|o)n line ([0-9]+)/);
				if (!lineNumberMatch) return;
				const lineNumber = lineNumberMatch[2];
				$e.ui.highlight(lineNumber, "error");
				ace.edit("view-write").gotoLine(lineNumber, 0, true);
				return;
			}
		} else {
			if (!confirm(_("You don't have the eseecodeLanguage loaded. If you still want to switch to %s you won't be able to go back to any blocks mode.\nAre you sure you want to switch to %s?", [ newView.name, newView.name ]))) return;
		}
	}
	// Save scroll position
	const oldHeight = $e.ui.blocks.getPropertyByLevel(id, "height");
	const oldViewEl = $e.ui.element.querySelector("#view-" + oldView.type);
	let oldScrollTop;
	if (oldView.type == "write") {
		oldScrollTop = ace.edit("view-write").session.getScrollTop();
	} else {
		oldScrollTop = oldViewEl.scrollTop;
	}
	// Show only active view
	$e.modes.views.current = newView;
	Object.values($e.modes.views.available).forEach(view => {
		view.tab.classList.add("tab");
		view.tab.classList.remove("active");
		$e.ui.element.querySelector("#view-" + view.type).classList.add("hide");
	});
	$e.ui.element.querySelector("#view-" + $e.modes.views.current.type).classList.remove("hide");
	// Continue switching view
	const bodyEl = $e.ui.element.querySelector("#body");
	Object.values($e.modes.views.available).forEach(view => bodyEl.classList.remove(view.id)); // Remove level class if this is a level change
	bodyEl.classList.add(id);
	if (oldView.type == "blocks") {
		if (newView.type == "write") {
			if ($e.session.updateOnViewSwitch && $e.session.updateOnViewSwitch !== "write") {
				// Only reset the write view if changes were made in the blocks, this preserves the undo's
				if ($e.ui.blocks.codeIsEmpty()) {
					$e.ui.write.resetView("");
				} else {
					$e.ide.blocks.toWrite();
				}
				$e.ui.write.resetUndo();
			}
			ace.edit("view-write").session.clearBreakpoints(); // Even if we haven't changed the code in blocks mode, we could have changed the breakponts
		}
	} else if (oldView.type == "write") {
		if (newView.type == "blocks") {
			const viewEl = $e.ui.element.querySelector("#view-blocks");
			if ($e.session.updateOnViewSwitch && $e.session.updateOnViewSwitch != "blocks") {
				// Only reset the blocks view if changes were made in the code, this preserves the undo's
				$e.ide.blocks.changes.reset();
				$e.ui.blocks.resetView();
				program.makeBlocks(viewEl);
			}
		}
	}
	// Update the block size in CSS
	if (newView.type == "blocks") bodyEl.style.setProperty("--block-current-size", "var(--block-" + (newView.id === "level3" ? "small" : "big") + "-size)");
	// Scroll to the same position in new view
	const newViewEl = $e.ui.element.querySelector("#view-" + newView.type);
	const newHeight = $e.ui.blocks.getPropertyByLevel(id, "height");
	const scrollTop = oldScrollTop * newHeight / oldHeight;
	if (newView.type == "write") {
		ace.edit("view-write").session.setScrollTop(scrollTop);
	} else {
		newViewEl.scrollTop = oldScrollTop * newHeight / oldHeight;
	}
	// Update tabs
	newView.tab.classList.add("active");
	if (newView.type == "write") {
		ace.edit("view-write").focus(); // If write mode, focus in the textarea. Do this after $e.ui.switchToolboxMode() in case the toolbox tries to steal focus
	} else {
		$e.ui.blocks.addBeginTip(); // Force to recheck since until now "view-blocks" element had display:none so height:0px and so the tip couldn't define to max height
	}
	if (oldView.type != newView.type) {
		$e.session.updateOnViewSwitch = false;
	}
	$e.ui.updateViewButtonsVisibility(id);
	$e.ui.refreshUndo();
	$e.ui.highlight();
	if (switchToolbox || $e.modes.toolboxes.current.type === "blocks" || $e.modes.toolboxes.current.type === "write") $e.ui.switchToolboxMode(id);
};

/**	
 * Switches the toolbox window
 * @private
 * @param {String} [id] Toolbox name. If unset it keeps the current toolbox window
 * @example $e.ui.switchToolboxMode("debug")
 */
$e.ui.switchToolboxMode = (id = $e.modes.toolboxes.current.id) => {
	if (!$e.session.ready) return; // We are going to go though several functions that reset the toolbox and the view, so lock it for now until teh platform is ready and we really want to initialize it
	Object.values($e.modes.toolboxes.available).forEach((toolbox) => {
		if (!toolbox.element) return; // We might call this function before the toolboxes have been created, so check
		toolbox.element.classList.add("hide");
		toolbox.tab.classList.add("tab");
		toolbox.tab.classList.remove("active");
	});
	if (id == "window") $e.ui.element.querySelector("#toolbox-tabs-window").classList.remove("hide");
	// window doesn't need initialization
	const toolbox = $e.modes.toolboxes.available[id];
	if (toolbox.element) { // We might run this before the toolboxes have been created, so check
		toolbox.element.classList.remove("hide");
		toolbox.tab.classList.add("active");
		if (toolbox.type == "blocks") $e.ui.blocks.initToolbox(toolbox.id, toolbox.element);
		else if (toolbox.type == "write") $e.ui.write.initToolbox(toolbox.id, toolbox.element);
	}
	const debugCommand = $e.ui.element.querySelector("#toolbox-debug-command-form");
	if (id == "debug") {
		$e.ui.debug.reset();
		debugCommand.classList.remove("hide");
	} else {
		debugCommand.classList.add("hide");
	}
	// Update current toolbox
	$e.modes.toolboxes.current = toolbox;
};

/**
 * Initializes/Resets the view
 * @private
 * @example $e.ui.initView()
 */
$e.ui.initView = () => {
	$e.ui.blocks.resetView();
	$e.ui.write.resetView();
};

/**
 * Initializes/Resets the write toolbox window
 * @private
 * @param {String} level Level name
 * @param {!HTMLElement} toolboxEl Toolbox window element
 * @example $e.ui.write.initToolbox("level2", $e.ui.element.querySelector("#toolbox-window"))
 */
$e.ui.write.initToolbox = (level, toolboxEl) => {
	$e.ui.resetToolbox(toolboxEl);
	// First, let's sort the instructions alphabetically
	let keys = [];
	let customInstructionSet = false;
	if ($e.instructions.custom && $e.instructions.custom.length > 0) {
		customInstructionSet = true;
		Object.values($e.instructions.custom).forEach(instruction => keys[keys.length] = instruction);
	} else {
		Object.keys($e.instructions.set).forEach(key => keys[keys.length] = key);
	}
	keys = keys.sort();
	// Now let's do the rest
	$e.instructions.categories.forEach(categoryName => {
		let firstInCategory = true;
		keys.forEach(key => {
			const instruction = $e.instructions.set[key];
			if (categoryName != instruction.category) return;
			let show = false;
			if (customInstructionSet) {
				show = true;
			} else {
				show = instruction.show && instruction.show.some(show => show == level);
			}
			if (!show) return;
			// write view can use all available instructions
			let title = instruction.name;
			if (title == "blank") return;
			const blockEl = document.createElement('div');
			blockEl.classList.add("textblock");
			blockEl.id = "block-" + title;
			blockEl.title = _(instruction.tip);
			blockEl.dataset.instructionSetId = instruction.name;
			blockEl.addEventListener("click", $e.ui.write.insertText);
			blockEl.classList.add("category-" + categoryName.replace(/\s/g, ''));
			if (firstInCategory) {
				blockEl.classList.add("first-in-category");
				firstInCategory = false;
			}
			if (instruction.nameRewrite && instruction.nameRewrite[level]) {
				title = instruction.nameRewrite[level];
			}
			blockEl.innerHTML = '<b>' + title + '</b>';
			if (instruction.code && instruction.code.space) {
				blockEl.innerHTML += " ";
			}
			if (!instruction.code || !instruction.code.noBrackets) {
				blockEl.innerHTML += '<b>(</b>';
			}
			if (instruction.parameters) {
				instruction.parameters.forEach((param, i) => {
					if (i !== 0) blockEl.innerHTML += param.separator ? " " + param.separator + " " : ", ";
					blockEl.innerHTML += _(param.name);
				});
			}
			if (!instruction.code || !instruction.code.noBrackets) {
				blockEl.innerHTML += '<b>)</b>';
			}
			if (instruction.block) {
				blockEl.innerHTML += ' <b>{</b> ... <b>}</b>';
			}
			toolboxEl.appendChild(blockEl);
		});
	});
	if ($e.session.disableCode) {
		$e.ui.msgBox.open(_("There is a limit on the amount of times you can use some blocks.\nSince there is no way to control these limits in Code view, editting has been disabled.\nYou can view the code here but you must go back to any other view that uses blocks to continue editting your code."));
	}
};

/**
 * Initializes/Resets the toolbox window
 * @private
 * @param {!HTMLElement} toolboxEl Toolbox element
 * @example $e.ui.resetToolbox($e.ui.element.querySelector("#toolbox-window"))
 */
$e.ui.resetToolbox = (toolboxEl) => {
	toolboxEl.textContent = "";
};