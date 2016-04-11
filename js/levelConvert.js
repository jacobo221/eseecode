"use strict";

	/**
	 * Converts all blocks into code and puts the code in the write console
	 * @private
	 * @example $e_blocks2write()
	 */
	function $e_blocks2write() {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id;
		var code = $e_blocks2code(document.getElementById("console-blocks").firstChild);
		var cleanCode;
		if (eseecodeLanguage) {
			try {
				var program = eseecodeLanguage.parse(code);
				cleanCode = program.makeWrite(level,"","\t");
			} catch (exception) {
				// This should never happen
				cleanCode = code;
			}
		}
		$e_resetWriteConsole(cleanCode);
	}
	
	/**
	 * Returns as text the code from the blocks console
	 * This function generates the pseudocode visible in Code view
	 * @private
	 * @param {!HTMLElement} blockDiv Blocks console element
	 * @param {String} [indentation=""] Initial indentation
	 * @return {String} The code from the blocks console, as text
	 * @example $e_blocks2code(document.getElementById("console-blocks").firstChild)
	 */
	function $e_blocks2code(blockDiv,indentation) {
		if (!indentation) { // We assume this is the main call
			indentation = "";
		}
		var code = "";
		while (blockDiv && blockDiv.id != "console-blocks-tip") { // Check that there really is code in the block code area, otherwise there's nothing to convert
			var instruction = $_eseecode.instructions.set[blockDiv.getAttribute("data-instructionsetid")];
			var thisIndentation = indentation;
			if (instruction.code && instruction.code.unindent) {
				thisIndentation = thisIndentation.substr(0,thisIndentation.length-1);
			}
			code += thisIndentation + $e_loadParameters("level4",blockDiv).text + "\r\n"; // Use Windows newlines since it can't handle other newlines and Linux and Mac instead can
			if (blockDiv.firstChild.nextSibling) { // if it has a child it is a nested div/block
				code += $e_blocks2code(blockDiv.firstChild.nextSibling,indentation+"\t");
			}
			blockDiv = blockDiv.nextSibling;
		}
		return code;
	}

	/**
	 * Converts blocks in blocks console to a level
	 * @private
	 * @param {String} level Level to convert blocks to
	 * @example $e_blocks2blocks("level2")
	 */
	function $e_blocks2blocks(level) {
		var divs = document.getElementById("console-blocks").getElementsByTagName("div");
		for (var i=divs.length-1; i>=0; i--) { // We parse it bottom-up because we need to redraw the children before being able to accurately redraw the parents
			var div = divs[i];
			if (div.id == "console-blocks-tip") {
				continue;
			}
			$e_createBlock(level,div);
		}
	}
