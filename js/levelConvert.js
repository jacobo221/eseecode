"use strict";

	/**
	 * Converts all blocks into code and puts the code in the write console
	 * @private
	 * @example blocks2write()
	 */
	function blocks2write() {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var code = blocks2code(document.getElementById("console-blocks").firstChild);
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
		resetWriteConsole(cleanCode);
	}
	
	/**
	 * Returns as text the code from the blocks console
	 * This function generates the pseudocode visible in level4
	 * @private
	 * @param {!HTMLElement} blockDiv Blocks console element
	 * @param {String} [indentation=""] Initial indentation
	 * @return {String} The code from the blocks console, as text
	 * @example blocks2code(document.getElementById("console-blocks").firstChild)
	 */
	function blocks2code(blockDiv,indentation) {
		if (!indentation) { // We assume this is the main call
			indentation = "";
		}
		var code = "";
		while (blockDiv && blockDiv.id != "console-blocks-tip") { // Check that there really is code in the block code area, otherwise there's nothing to convert
			var instruction = $_eseecode.instructions.set[blockDiv.getAttribute("instructionSetId")];
			var thisIndentation = indentation;
			if (instruction.code && instruction.code.unindent) {
				thisIndentation = thisIndentation.substr(0,thisIndentation.length-1);
			}
			code += thisIndentation + loadParameters("level4",blockDiv).text + "\n";
			if (blockDiv.firstChild.nextSibling) { // if it has a child it is a nested div/block
				code += blocks2code(blockDiv.firstChild.nextSibling,indentation+"\t");
			}
			blockDiv = blockDiv.nextSibling;
		}
		return code;
	}

	/**
	 * Converts blocks in blocks console to a level
	 * @private
	 * @param {String} level Level to convert blocks to
	 * @example blocks2blocks("level2")
	 */
	function blocks2blocks(level) {
		var divs = document.getElementById("console-blocks").getElementsByTagName("div");
		for (var i=divs.length-1; i>=0; i--) { // We parse it bottom-up because we need to redraw the children before begin able to accurately redraw the parents
			var div = divs[i];
			if (div.id == "console-blocks-tip") {
				continue;
			}
			createBlock(level,div);
		}
	}

	/**
	 * Converts user code to executable code and returns it
	 * @private
	 * @param {String} pseudoCode User code to convert
	 * @return {String} Executable code
	 * @example eval(code2run("repeat(4){forward(100)}"))
	 */
	function code2run(pseudoCode) {
		var program = eseecodeLanguage.parse(pseudoCode);
		var level;
		for (var i=0;i<$_eseecode.modes.console.length;i++) {
			if ($_eseecode.modes.console[i].div == "write") {
				level = $_eseecode.modes.console[i].name;
			}
		}
		var code = program.makeWrite(level,"","\t",true);
		code = "\"use strict\";try {"+code+";\n\
				showExecutionResults();\n\
			} catch(err) {\n\
				showExecutionResults(err);\n\
			}";
		return code;
	}
