"use static";

/**
 * Select text in ace
 * @private
 * @param {Number} lineStart Line where the selection starts
 * @param {Number} lineEnd Line where the selection ends
 * @param {String} style Ace style to use for highlighting
 * @example $e.ui.write.selectTextareaLine(12, 12, "ace_step")
 */
$e.ui.write.selectTextareaLine = (lineStart, lineEnd, style) => {
	lineStart--; // array starts at 0, we leave lineEnd as is beacuse we'll select until the beginning of the next line
	const Range = ace.require('ace/range').Range;
	ace.edit("view-write").session.addMarker(new Range(lineStart, 0, lineEnd - 1, ace.edit("view-write").session.getLine(lineEnd - 1).length - 1), style, "fullLine");
};

/**
 * Resizes the view height based on the window's size
 * @private
 * @example $e.ui.write.windowResizeHandler()
 */																																																																																															
$e.ui.write.windowResizeHandler = () => {
	ace.edit("view-write").resize();
};

/**
 * Writes in the write view at the position where the guide is the instruction clicked in the toolbox window
 * @private
 * @param {!Object} event Event
 * @example el.addEventListener("click", $e.ui.write.insertText)
 */
$e.ui.write.insertText = (event) => {
	let el = event.target;
	while (el && !el.dataset.instructionSetId) { // Target could be a block in el, so let's fetch the parent el
		el = el.parentNode;
	}
	const instructionSetId = el.dataset.instructionSetId;
	let text = $e.instructions.getParameters(instructionSetId).strings.code;
	
	const instruction = $e.instructions.set[el.dataset.instructionSetId];
	if (text.endsWith(" {")) {
		text += " \n}";
	}
	ace.edit("view-write").insert(text);
	ace.edit("view-write").focus();
};

/**
 * Initializes/Resets the write view window
 * @private
 * @param {!HTMLElement} code Leave initialized with this code
 * @param {Boolean} [resetCursor=true] Reset the cursor position to the beginning
 * @example $e.ui.write.resetView($e.ui.element.querySelector("#view-write"))
 */
$e.ui.write.resetView = (code = "", resetCursor) => {
	const cursorPosition = ace.edit("view-write").getCursorPosition();
	if (!$e.session.editor) { // Every time setOptions is called defining mode the worker-eseecode.js file is re-fetched, so make sure we only use set options once
		$e.session.editor = ace.edit("view-write");
		ace.require("ace/ext/language_tools");
		$e.session.editor.setOptions({
			theme: "ace/theme/chrome",
			mode: "ace/mode/eseecode",
			newLineMode: "windows", // Otherwise copy&paste in Windows pastes all code in a single line. Linux and Mac, on the other hand, can handle Windows newlines
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: true,
			fontSize: $e.ui.blocks.getPropertyByLevel("level4", "fontSize"),
			fontFamily: $e.ui.blocks.getPropertyByLevel("level4", "fontFamily"),
			tabSize: $e.setup.tabSize,
			fixedWidthGutter: true,
			animatedScroll: true,
		});
	}
	$e.session.editor.setHighlightActiveLine(true);
	// Only update code if it changed, to avoid adding empty changes into the ACE undo queue
	if (code != ace.edit("view-write").getValue()) {
		// We must unset $e.ui.write.changed call on ace change event otherwise it unhighlights the code
		$e.session.editor.session.off("change", $e.ui.write.changed);
		$e.session.editor.setValue(code);
	}
	if (resetCursor !== false) {
		$e.session.editor.gotoLine(0, 0);
	} else {
		$e.session.editor.gotoLine(cursorPosition.row + 1, cursorPosition.column);
	}
	$e.session.editor.session.on("change", $e.ui.write.changed);
	ace.edit("view-write").session.setUseWrapMode(false);
};

/**
 * Added as a listener it informs $e.session.updateOnViewSwitch that the code in write view changed
 * @private
 * @param {!Object} event Ace editor change event object
 * @example $e.ui.write.changed()
 */
$e.ui.write.changed = (event) => {
	$e.ide.changed();
	$e.session.updateOnViewSwitch = "write";
	$e.ui.debug.updateWriteBreakpoints(event);
};

/**
 * Initializes/Resets the write undo stack in ace
 * @private
 * @example $e.ui.write.resetUndo()
 */
$e.ui.write.resetUndo = () => {
	const UndoManager = ace.require("ace/undomanager").UndoManager; 
	ace.edit("view-write").session.setUndoManager(new UndoManager());
};
