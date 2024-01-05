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
	$e.session.editor.session.addMarker(new Range(lineStart, 0, lineEnd - 1, $e.session.editor.session.getLine(lineEnd - 1).length - 1), style, "fullLine");
};

/**
 * Resizes the view height based on the window's size
 * @private
 * @example $e.ui.write.windowResizeHandler()
 */																																																																																															
$e.ui.write.windowResizeHandler = () => {
	$e.session.editor.resize();
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
	$e.session.editor.insert(text);
	$e.session.editor.focus();
};

/**
 * Initializes/Resets the write view window
 * @private
 * @param {!HTMLElement} code Leave initialized with this code
 * @param {Boolean} [resetCursor=true] Reset the cursor position to the beginning
 * @example $e.ui.write.resetView($e.ui.element.querySelector("#view-write"))
 */
$e.ui.write.resetView = (code = "", resetCursor) => {
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
		$e.ui.element.querySelector("#view-write").addEventListener("copy", (event) => {
			if (event.clipboardData) event.clipboardData.setData("text/html", $e.ide.write.synthaxHighlight(event.clipboardData.getData("text/plain")));
		});
	}
	const cursorPosition = $e.session.editor.getCursorPosition();
	$e.session.editor.setHighlightActiveLine(true);
	// Only update code if it changed, to avoid adding empty changes into the ACE undo queue
	if (code != $e.session.editor.getValue()) {
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
	$e.session.editor.session.setUseWrapMode(false);
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
	$e.session.editor.session.setUndoManager(new UndoManager());
};

/**
 * Add HTML synthax highlight to a code
 * @private
 * @example $e.ui.write.synthaxHighlight()
 */
// Reference: https://stackoverflow.com/a/73471460
$e.ide.write.synthaxHighlight = (code) => {
	const styles = {
		"ace_layer ace_text-layer": "",
		"ace_line_group": "",
		"ace_line": "",
		"ace_paren ace_lparen": "color: rgb(0, 0, 0)",
		"ace_paren ace_rparen": "color: rgb(0, 0, 0)",
		"ace_identifier": "color: rgb(0, 0, 0)",
		"ace_storage ace_type": "color: rgb(147, 15, 128)",
		"ace_constant ace_language [a-z_]*": "color: rgb(88, 92, 246)",
		"ace_constant ace_buildin": "color: rgb(88, 72, 246)",
		"ace_constant ace_language": "color: rgb(88, 92, 246)",
		"ace_constant ace_library": "color: rgb(6, 150, 14)",
		"ace_invalid": "background-color: rgb(153, 0, 0; color: white",
		"ace_support ace_function": "color: rgb(60, 76, 114)",
		"ace_support ace_constant": "color: rgb(6, 150, 14);",
		"ace_support ace_type": "color: rgb(109, 121, 222)",
		"ace_support ace_clas": "color: rgb(109, 121, 222)",
		"ace_support ace_other": "color: rgb(109, 121, 222)",
		"ace_variable ace_parameter": "font-style: italic; color: #FD971F",
		"ace_keyword ace_operator": "color: rgb(104, 118, 135)",
		"ace_comment": "color: #236e24",
		"ace_comment ace_doc": "color: #236e24",
		"ace_comment ace_doc ace_tag": "color: #236e24",
		"ace_constant ace_numeric": "color: rgb(0, 0, 205)",
		"ace_variable": "color: rgb(49, 132, 149)",
		"ace_variable ace_language": "color: rgb(49, 132, 149)",
		"ace_xml-pe": "color: rgb(104, 104, 91)",
		"ace_entity ace_name ace_function": "color: #0000A2",
		"ace_heading": "color: rgb(12, 7, 255)",
		"ace_list": "color:rgb(185, 6, 144)",
		"ace_storage": "color: rgb(147, 15, 128)",
		"ace_keyword": "color: rgb(147, 15, 128)",
		"ace_meta ace_tag": "color: rgb(147, 15, 128)",
		"ace_string ace_regex": "color: rgb(255, 0, 0)",
		"ace_string": "color: #1A1AA6",
		"ace_entity ace_other ace_attribute-name": "color: #994409",
	}; // From js/libs/ace/theme-chrome.js
	const tokenizer = $e.session.editor.session.getMode().getTokenizer();
	const Text = ace.require("ace/layer/text").Text;
	const root = document.createElement("div");
	const rootText = new Text(root);
	code.replaceAll("\r", "").replaceAll("\t", "    ").split("\n").forEach(line => {
		const tokens = tokenizer.getLineTokens(line, "start");
		const leadingSpacesCount = (line.match(/^\s*/) || [])[0].length;
		const lineGroupEl = document.createElement("div");
		lineGroupEl.className = "ace_line_group";
		const lineEl = document.createElement("div");
		lineEl.className = "ace_line";
		const spaceSpan = document.createElement("span");
		if (tokens && tokens.tokens.length) {
			const outputLines = [];
			rootText.$renderSimpleLine(outputLines, tokens.tokens);
			spaceSpan.innerHTML = "&nbsp;".repeat(leadingSpacesCount);
			lineEl.insertBefore(spaceSpan, lineEl.children[0]);
			lineEl.innerHTML += outputLines.join("");
		} else {
			spaceSpan.innerHTML = "&nbsp;";
			lineEl.appendChild(spaceSpan);
		}
		lineGroupEl.appendChild(lineEl);
		root.children[0].appendChild(lineGroupEl);
	});
	let output = root.innerHTML;
	Object.entries(styles).forEach(([ key, value ]) => output = output.replace(new RegExp("class=\\\"" + key + "\\\"", "g"), "style=\"" + value + "\""));
	output = output.replaceAll(" style=\"\"", "");
	return output;
};