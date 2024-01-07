"use static";

/**
 * Returns a new block cloned from the given one, with new ids, no parent and no event listeners
 * @private
 * @param {HTMLElement} blockEl Block to clone
 * @return {HTMLElement} New block cloned from the given one, with new ids, no parent and no event listeners
 * @example $e.ide.blocks.clone(blockEl)
 */
$e.ide.blocks.clone = (blockEl) => {
	const newBlockEl = blockEl.cloneNode(true);
	newBlockEl.id = $e.backend.newblockId();
	Array.from(newBlockEl.querySelectorAll(".block")).forEach(newSubblockEl => newSubblockEl.id = $e.backend.newblockId());
	return newBlockEl;
};

/**
 * Returns whether the value is complex (not visualizable, ie. a variable name or an expression) or not
 * @private
 * @param {String} value Input value to convert
 * @return {Boolean} Whether the value is complex (not visualizable, ie. a variable name or an expression) or not
 * @example $e.ide.blocks.blockParameterIsComplex("a + 3")
 */
$e.ide.blocks.blockParameterIsComplex = (value) => {
	if (value === undefined || value === "" || value === "undefined") return false;
	try {
		JSON.parse(value);
		return false;
	} catch(error) {
		return true;
	}
};

/**
 * Returns the parameters of a block, or the default parameters if none were set
 * In parameters it returns the parameters in an array, in text it returns the parameters ready to insert them in code
 * @private
 * @param {!HTMLElement} blockEl Block element
 * @return {parameters:Array<String>, text:String} Parameters of a block, or the default parameters if none were set
 * @example $e.ide.blocks.getParameters($e.ui.element.querySelector("#block-123123123"))
 */
$e.ide.blocks.getParameters = (blockEl) => {
	const instructionSetId = blockEl.dataset.instructionSetId;
	if (!instructionSetId) return; // This may happen for the view-begin-tip
	const instruction = $e.instructions.set[instructionSetId];
	const parameters = [];
	if (instruction.parameters) {
		instruction.parameters.forEach((instructionParameter, i) => {
			let value = blockEl.dataset["param" + i];
			if (value === undefined) value = "";
			if (value === "" && (instructionParameter.optional !== true || instructionParameter.forceInitial === true)) {
				value = $e.instructions.parsePredefinedConstants(instructionParameter.initial); // Only check predefined values if coming from programmer instruction set initializations
				value = value === undefined ? "" : JSON.stringify(value);
			}
			blockEl.dataset["param" + i] = value;
			parameters.push(value);
		});
	}
	return $e.instructions.getParameters(instructionSetId, parameters, blockEl.dataset.instructionName);
};

/**
 * Obtain the container's definition of a subblock
 * @private
 * @param {HTMLElement|String} blockElOrInstructionSetId Subblock element or its instructionSetId
 * @param {HTMLElement|String} [parentBlockOrCointainerInstructionSetId] Container block element or its instructionSetId
 * @param {Boolean} [returnAllSubblocksDefinitions] If set to true it will return also the full container's subblocks definitions
 * @return {Object} In "containerDefinitions" the containers' subblocks definition, in "containerSubblockDefinition" the container's definition about the subblock
 * @example $e.ide.blocks.getContainerSubblockDefinition(document.querySelector("block-3"))
 */
$e.ide.blocks.getContainerSubblockDefinition = (blockElOrInstructionSetId, parentBlockOrCointainerInstructionSetId, returnAllSubblocksDefinitions) => {
	const subblockInstructionSetId = typeof blockElOrInstructionSetId == "object" ? blockElOrInstructionSetId.dataset.instructionSetId : blockElOrInstructionSetId;
	if (!blockElOrInstructionSetId.parentNode && !parentBlockOrCointainerInstructionSetId) return {};
	const containerInstructionSetId = typeof parentBlockOrCointainerInstructionSetId == "object" ? parentBlockOrCointainerInstructionSetId.dataset.instructionSetId : (typeof parentBlockOrCointainerInstructionSetId == "string" ? parentBlockOrCointainerInstructionSetId : blockElOrInstructionSetId.parentNode.dataset.instructionSetId);
	if (!containerInstructionSetId) return {};
	const containerInstruction = $e.instructions.set[containerInstructionSetId];
	if (!containerInstruction || !containerInstruction.container) return {};
	const containerSubblockDefinition = containerInstruction.container.find(v => v.instruction == subblockInstructionSetId);
	if (returnAllSubblocksDefinitions) return { containerDefinitions: containerInstruction.container, containerSubblockDefinition: containerSubblockDefinition };
	else return containerSubblockDefinition;
}

/**
 * Returns the position of targetBlock in currentBlock, or -1 otherwise
 * @private
 * @param {!HTMLElement} currentBlock Block in which to search for targetBlock
 * @param {!HTMLElement} targetBlock Block to search for in currentBlock
 * @return {Number} The amount of blocks above the taget element if it is found, otherwise -1
 * @example $e.ide.blocks.getPosition($e.ui.element.querySelector("#view-blocks"), $e.ui.element.querySelector("#block-1231231231"))
 */
$e.ide.blocks.getPosition = (currentBlock, targetBlock) => {
	return Array.from(currentBlock.querySelectorAll(".block:not(.container)")).findIndex(el => el == targetBlock) + 1;
};

/**
 * Returns the position-th element in element. In count it returns the amount of blocks parsed in case the element wasn't found. If position == -1 the size of the element block and its siblings is returned in count
 * @private
 * @param {Number} position Block position to return the block from, first block is 1
 * @param {HTMLElement} element Block in which to search for
 * @example $e.ide.blocks.getByPosition(12)
 */
$e.ide.blocks.getByPosition = (position) => {
	if ($e.ui.blocks.codeIsEmpty()) return undefined;
	const viewEl = $e.ui.element.querySelector("#view-blocks")
	return viewEl.querySelectorAll(".block:not(.container)")[position - 1];
};

/**
 * Returns the amount of instructions in the block, including the block passed as argument if it is a block
 * @private
 * @param {!HTMLElement} element Block of which to get the amount of instructions
 * @return {Number} Amount of instructions in the block
 * @example $e.ide.blocks.getTreeSize($e.ui.element.querySelector("#view-blocks"))
 */
$e.ide.blocks.getTreeSize = (element) => {
	return (element.matches(".block:not(.container)") ? 1 : 0) + element.querySelectorAll(".block:not(.container)").length;
};

/**
 * Resets the instances count for all instructions
 * @private
 * @example $e.ide.blocks.resetCount()
 */
$e.ide.blocks.resetCount = () => {
	Object.values($e.instructions.set).forEach(instruction => {
		if ($e.isNumber(instruction.maxInstances)) instruction.countInstances = 0;
	});
};


/**
 * Converts all blocks into code and puts the code in the write view
 * @private
 * @example $e.ide.blocks.toWrite()
 */
$e.ide.blocks.toWrite = () => {
	const code = $e.ide.blocks.toCode($e.ui.element.querySelector("#view-blocks").firstChild);
	let cleanCode;
	if (eseecodeLanguage) {
		try {
			const program = eseecodeLanguage.parse(code);
			cleanCode = program.makeWrite("", "\t");
		} catch (exception) {
			// This should never happen
			cleanCode = code;
		}
	}
	$e.ui.write.resetView(cleanCode);
};

/**
 * Returns as text the code from the blocks view
 * This function generates the pseudocode visible in Code view
 * @private
 * @param {!HTMLElement} blockEl First block to convert
 * @param {String} [indentation=""] Initial indentation
 * @return {String} The code from the blocks view, as text
 * @example $e.ide.blocks.toCode($e.ui.element.querySelector("#view-blocks").firstChild)
 */
$e.ide.blocks.toCode = (blockEl, indentation = "") => {
	let code = "";
	while (blockEl) {
		if (blockEl.classList.contains("block")) {
			const isContainer = blockEl.classList.contains("container");
			const extraIndent = blockEl.classList.contains("extraIndent") ? "\t" : "";
			if (!isContainer) code += indentation + extraIndent + $e.ide.blocks.getParameters(blockEl).strings.code + "\r\n"; // Use Windows newlines since it can't handle other newlines and Linux and Mac instead can
			const subBlock = blockEl.querySelector(".block");
			if (subBlock) code += $e.ide.blocks.toCode(subBlock, indentation + (isContainer ? "" : "\t") + extraIndent);
		}
		blockEl = blockEl.nextElementSibling;
	}
	return code;
};

/**
 * Run the necessary tasks when code changes
 * @private
 * @param {Boolean} [resetProgramCounter=true] If true, resets the program counter
 * @example $e.ide.blocks.changed()
 */
$e.ide.blocks.changed = (resetProgramCounter = true) => {
	$e.ide.changed(resetProgramCounter);
	$e.session.updateOnViewSwitch = "block";
};