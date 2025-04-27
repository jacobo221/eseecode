"use strict";

/**
 * Returns the block's height
 * This takes into account space between blocks, border heights, etc
 * @private
 * @param {!HTMLElement} [blockEl] Block element. Optional if the function been called before in the same level
 * @return {{width:Number, height:Number}} Block's height in the given level
 * @example $e.ui.blocks.getSize("level2", $e.ui.element.querySelector("#block-123213213"))
 */
$e.ui.blocks.getSize = (blockEl) => {
	if (blockEl.lastChild && blockEl.lastChild.classList.contains("block")) {
		// blockEl contains blocks, check size based on the last child which is always a single element			
		blockEl = blockEl.lastChild;
	}

	const elComputedStyle = getComputedStyle(blockEl);
	const width = blockEl.getBoundingClientRect().width + (parseFloat(elComputedStyle.marginLeft) || 0) + (parseFloat(elComputedStyle.marginRight) || 0);
	const height = blockEl.getBoundingClientRect().height + (parseFloat(elComputedStyle.marginTop) || 0) + (parseFloat(elComputedStyle.marginBottom) || 0);
	return { width: width, height: height };
};

/**
 * Gives the properties of a block for a certain level
 * @see $e.ui.msgBox.open
 * @private
 * @param {String} level Name of the level
 * @param {String} property Property to obtain
 * @return {Object} Properties of blocks in the specified level
 * @example $e.ui.blocks.getPropertyByLevel("level3")
 */
$e.ui.blocks.getPropertyByLevel = (level, property) => {
	if (level == "level4") level = "level3"; // Level 4 mimics level 3
	const computerStyle = getComputedStyle(document.body);
	if (property === "width") return parseInt(computerStyle.getPropertyValue(level === "level1" || level === "level2" ? "--block-big-size" : undefined));
	if (property === "height") return parseInt(computerStyle.getPropertyValue(level === "level1" || level === "level2" ? "--block-big-size" : "--block-small-size"));
	if (property === "fontSize") return parseInt(computerStyle.getPropertyValue("--default-text-size"));
	if (property === "fontFamily") return computerStyle.getPropertyValue("--monospace-font");
};

/**
 * Enables/Disabled toolbox blocks when their count reaches maxInstances
 * @private
 * @param {!String|!HTMLElement} instruction Instruction id or toolbox block
 * @example $e.ui.blocks.updateCount("forward1")
 */
$e.ui.blocks.updateCount = (instructionObject) => {
	let instructionId, toolboxBlock;
	if ((typeof instructionObject) === "string") {
		instructionId = instructionObject;
		toolboxBlock = $e.ui.element.querySelector("#toolbox-blocks > .block[data-instruction-set-id=" + instructionId + "]");
	} else {
		instructionId = instructionObject.dataset.instructionSetId;
		toolboxBlock = instructionObject;
	}
	if (!toolboxBlock) return;
	const instruction = $e.instructions.set[instructionId];
	if ($e.isNumber(instruction.maxInstances)) {
		const blockCountEl = $e.ui.element.querySelector("#" + toolboxBlock.id + "-countdown");
		if (!blockCountEl) {
			const blockCountEl = document.createElement("span");
			blockCountEl.classList.add("counter");
			blockCountEl.id = toolboxBlock.id + "-countdown";
			blockCountEl.classList.add("countdown");
			blockCountEl.textContent = instruction.maxInstances;
			toolboxBlock.appendChild(blockCountEl);
		}
		blockCountEl.textContent = instruction.maxInstances - instruction.countInstances;
		if (instruction.countInstances >= instruction.maxInstances) toolboxBlock.classList.add("disabled");
		else toolboxBlock.classList.remove("disabled");
	}
};

/**
 * Removes a block from the view and deletes it
 * @private
 * @param {!HTMLElement} blockEl Block to delete
 * @example $e.ui.blocks.removeFromCode($e.ui.element.querySelector("#block-123123123"))
 */
$e.ui.blocks.removeFromCode = (blockEl) => {
	$e.ui.debug.updateBlocksBreakpoints(blockEl, "delete"); // We must do this before we delete the block
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	const instructionSetId = blockEl.dataset.instructionSetId;
	const instruction = $e.instructions.set[instructionSetId];
	if (instruction.reportContainer) {
		const containerEl = blockEl.closest(".container");
		if (containerEl) containerEl.classList.remove("has-" + instructionSetId);
	}
	if ($e.isNumber(instruction.maxInstances)) {
		instruction.countInstances--;
		$e.ui.blocks.updateCount(instructionSetId);
	}
	blockEl.remove();
	if (!viewEl.firstChild) $e.ui.blocks.addBeginTip();
};

/**
 * Duplicates a block in the code
 * @private
 * @param {!HTMLElement} blockEl Block element to duplicate
 * @param {Boolean} [combine] If true the change will be added to the last change
 * @param {HTMLElement} [duplicateBefore] If set the new block will be added before this element
 * @example $e.ui.blocks.duplicateInCodeFromUI(blockEl)
 */
$e.ui.blocks.duplicateInCodeFromUI = (blockEl, combine, duplicateBefore) => {
	const newBlockEl = $e.ide.blocks.clone(blockEl);
	newBlockEl.classList.remove("setupCandidate");
	Array.from(newBlockEl.querySelectorAll(".setupCandidate")).forEach(el => el.classList.remove("setupCandidate"));
	$e.ui.blocks.createAndPlaceBlock(newBlockEl, blockEl.parentNode, duplicateBefore ? duplicateBefore : blockEl.nextSibling, false); // Insert after current block
	const undoItem = {
		action: "add",
		blockEl: newBlockEl,
		newParentBlock: newBlockEl.parentNode,
		newNextSibling: newBlockEl.nextSibling,
	};
	if (combine) {
		$e.ide.blocks.changes.combine(undoItem);
		// Remember to call $e.ide.blocks.changed() elsewhere when the combination is finished
	} else {
		$e.ide.blocks.changes.push(undoItem);
		$e.ide.blocks.changed();
	}
	return newBlockEl;
};

/**
 * Removes a block from the code
 * @private
 * @param {!HTMLElement} blockEl Block element to remove
 * @param {Boolean} [combine] If true the change will be added to the last change
 * @example $e.ui.blocks.deleteFromCodeFromUI(blockEl)
 */
$e.ui.blocks.deleteFromCodeFromUI = (blockEl, combine) => {
	const undoItem = {
		action: "delete",
		blockEl: blockEl,
		sourceParentBlock: blockEl.parentNode,
		sourceNextSibling: blockEl.nextSibling,
	};
	if (combine) {
		$e.ide.blocks.changes.combine(undoItem);
		// Remember to call $e.ide.blocks.changed() elsewhere when the combination is finished
	} else {
		$e.ide.blocks.changes.push(undoItem);
		$e.ide.blocks.changed();
	}
	$e.ui.blocks.removeFromCode(blockEl);
	$e.ide.blocks.changed();
};

/**
 * Adds a new block into the code, called from UI
 * @private
 * @param {String} instructionSetId Name of the subblock to add
 * @param {!HTMLElement} parentBlock Block element where the subblock has to be added
 * @param {!HTMLElement} [nextSibling] Subblock element in parentBlock that the new block has to precede, or null to add it at the end of parentBlock
 * @example $e.ui.blocks.addIntoCodeFromUI("elseif"", blockEl)
 */
$e.ui.blocks.addIntoCodeFromUI = (instructionSetId, parentBlock, nextSibling = null) => {
	const blockEl = $e.ui.blocks.createAndPlaceBlock(instructionSetId, parentBlock, nextSibling, undefined, { isSubblock: parentBlock.classList.contains("container") });
	$e.ide.blocks.changes.push({
		action: "add",
		blockEl: blockEl,
		newParentBlock: parentBlock,
		newNextSibling: nextSibling,
	});
	$e.ide.blocks.changed();
};

/**
 * Given a block and an instruction it sets up the block
 * @private
 * @param {!HTMLElement|String} blockOrInstructionSetId Block element to place or instruction name to create and place
 * @param {HTMLElement} [parentBlock] Block in which to place the block. If it is null it will be placed in the root of the code. If it is undefined it will not be placed
 * @param {HTMLElement} [nextSibling=null] Block right before which to place the block, must be a child of parentBlock
 * @param {Array<*>|Boolean} [params] Values of the parameters. If set to false, the parameters are not initialized
 * @param {Object} [options] If noInitSubblocks is true container blocks with no subblocks will not have their mandatory subblocks created, if notIntoCode is true the code checks will not be run (useful when creating temporary blocks or block in the toolbox), if isSubblock is true the block will be initialized as a subblock
 * @return {HTMLElement} Block element
 * @example $e.ui.blocks.createAndPlaceBlock("forward")
 */
$e.ui.blocks.createAndPlaceBlock = (blockOrInstructionSetId, parentBlock, nextSibling = null, params, options = {}) => {
	let blockEl = blockOrInstructionSetId;
	let instructionSetId;
	if (typeof blockOrInstructionSetId == "string") {
		instructionSetId = blockOrInstructionSetId;
		blockEl = document.createElement(instructionSetId === "end" || instructionSetId === "endDo" ? "span" : "div"); /* Blocks are divs and icons/end's are spans, thus we can use CSS selectors :first/last-of-type until ".block:nth-first-child(1 of .block)" (introduced in Chrome and Firefox in 2023) can be considered widespread */
	} else {
		instructionSetId = blockEl.dataset.instructionSetId;
	}
	const isUpdate = blockOrInstructionSetId === blockEl;
	$e.ui.blocks.initialize(blockEl, instructionSetId, isUpdate ? false : params, options);
	if (parentBlock !== undefined) {
		if (options.notIntoCode) {
			parentBlock.insertBefore(blockEl, nextSibling);
	 	} else {
			$e.ui.blocks.insertIntoCode(blockEl, parentBlock, nextSibling);
		}
		const instruction = $e.instructions.set[instructionSetId];
		if (instruction && instruction.reportContainer) {
			const containerEl = blockEl.closest(".container");
			if (containerEl) containerEl.classList.add("has-" + instructionSetId);
		}
	}
	return blockEl;
};

/**
 * Given a block and an instruction it sets up the block
 * @private
 * @param {!HTMLElement} blockEl Block element
 * @param {String} instructionSetId Id of the instruction in $e.instructions.set
 * @param {Array<*>|Boolean} [params=[]] Values of the parameters. If set to false, the parameters are not initialized
 * @param {Object} [options] If noInitSubblocks is true container blocks with no subblocks will not have their mandatory subblocks created, if isSubblock is true the block will be initialized as a subblock
 * @return {HTMLElement} Block element
 * @example $e.ui.blocks.initialize(document.body.createElement("div"), "forward")
 */
$e.ui.blocks.initialize = (blockEl, instructionSetId, params = [], options = {}) => {
	let instruction = $e.instructions.set[instructionSetId];
	if (!instruction) {
		const customInstructionName = instructionSetId
		instructionSetId = "call";
		instruction = $e.instructions.set[instructionSetId];
		if (params !== false) params = [ customInstructionName ].concat(params);
	}
	if (!blockEl.id) blockEl.id = $e.backend.newblockId();
	blockEl.dataset.instructionSetId = instructionSetId;
	if (params !== false) {
		if (instructionSetId == "call") {
			blockEl.dataset["param0"] = params[0];
			blockEl.dataset["param1"] = "";
			params.slice(1).forEach((param, i) => blockEl.dataset["param1"] += (i === 0 ? "" : ", ") + (param === undefined ? "" : param)); // With this we make sure all the parameters are initialized in the block's dataset
		} else if (instruction.parameters) {
			instruction.parameters.forEach((instructionParameter, i) => blockEl.dataset["param" + i] = params[i] === undefined ? "" : params[i]); // With this we make sure all the parameters are initialized in the block's dataset
		}
	}
	blockEl.classList.add("block", instruction.name);
	if (options.isSubblock || (blockEl.parentNode && blockEl.parentNode.classList.contains("container"))) blockEl.classList.add("subblock");
	if (instruction.container) blockEl.classList.add("container");
	if (instruction.code && instruction.code.extraIndent) blockEl.classList.add("extraIndent");
	if (instruction.classes) blockEl.classList.add(...instruction.classes);
	const isToolbox = blockEl.closest("#toolbox-blocks");
	$e.ui.blocks.paint(blockEl, isToolbox);
	$e.ui.blocks.addListeners(blockEl);
	if (!options.noInitSubblocks && instruction.container && !blockEl.querySelector(".block")) { // We are creating a new container, initialize it with its mandatory subblocks
		instruction.container.filter(subblock => !subblock.optional).forEach(subblock => $e.ui.blocks.createAndPlaceBlock(subblock.instruction, blockEl, undefined, undefined, { notIntoCode: options.notIntoCode, isSubblock: true }));
	}
	return blockEl;
};

/**
 * Sets up the shape, color and icon of a block
 * @private
 * @param {!HTMLElement} blockEl Block element
 * @param {Boolean} [isToolbox] Whether or not the block is in the toolbox window. Default is false
 * @example $e.ui.blocks.paint($e.ui.element.querySelector("#block-123123123"), false, true)
 */
$e.ui.blocks.paint = (blockEl, isToolbox) => {
	const instructionId = blockEl.dataset.instructionSetId;
	const instruction = $e.instructions.set[instructionId];
	const parametersOutput = $e.ide.blocks.getParameters(blockEl);
	const iconEl = document.createElement("span"); // We create this as a span so blocks are divs and icons are footers, thus we can use CSS selectors :first/last-of-type until ".block:nth-first-child(1 of .block)" (introduced in Chrome and Firefox in 2023) can be considered widespread */
	iconEl.classList.add("icon");
	Object.entries(parametersOutput.strings).forEach(([key, value]) => {
		const labelEl = document.createElement("label");
		labelEl.classList.add(key);
		labelEl.textContent = value;
		iconEl.appendChild(labelEl);
	});
	const oldIconEl = blockEl.querySelector(".icon");
	blockEl.insertBefore(iconEl, oldIconEl);
	if (oldIconEl) blockEl.removeChild(oldIconEl);
	blockEl.title = parametersOutput.strings.name + ((isToolbox && instruction.tip) ? ": " + _(instruction.tip) : ""); // Help for blind people
	blockEl.classList.add("category-" + instruction.category.replace(/\s/g, ''));
	$e.instructions.setIcon(instruction.name, iconEl, parametersOutput.parameters);
	if (isToolbox && $e.isNumber(instruction.maxInstances)) $e.ui.blocks.updateCount(instructionId);
};

/**
 * Given a block it adds the event listeners
 * @private
 * @param {!HTMLElement} blockEl Block element
 * @example $e.ui.blocks.addListeners(document.body.createElement("div"))
 */
$e.ui.blocks.addListeners = (blockEl) => {
	function addListenerRecursively (blockEl, handler, callPointer, options) {
		if (!blockEl) return;
		addListenerRecursively(blockEl.firstElementChild, handler, callPointer, options);
		addListenerRecursively(blockEl.nextElementSibling, handler, callPointer, options);
		if (!blockEl.classList.contains("block")) return;
		blockEl.addEventListener(handler, callPointer, options);
	}
	addListenerRecursively(blockEl, "pointerdown", $e.ui.blocks.modifyEventStart);
	addListenerRecursively(blockEl, "touchstart", (event) => event.preventDefault()); // In Chrome stop the TouchEvent from cancelling the PointerEvent
};

/**
 * Adds a block in a position in the blocks view
 * @private
 * @param {!HTMLElement} blockEl Block to add
 * @param {HTMLElement} [parentNode] Ifset, blockEl will ne inserted inside parentNode. Otherwise it is added at the end of the code
 * @param {HTMLElement} [nextSibling] If set, blockEl will be inserted before nextSibling. Must be child of parentNode
 * @example $e.ui.blocks.insertIntoCode(blockEl)
 */
$e.ui.blocks.insertIntoCode = (blockEl, parentNode = null, nextSibling = null) => {
	if (!parentNode) parentNode = $e.ui.element.querySelector("#view-blocks");
	parentNode.insertBefore(blockEl, nextSibling && nextSibling.id == "view-blocks-tip" ? null : nextSibling); // Often $e.ui.blocks.removeBeginTip is called after this function so ignore the view-begin-tip block
	const instructionSetId = blockEl.dataset.instructionSetId;
	const instruction = $e.instructions.set[instructionSetId];
	$e.ui.blocks.removeBeginTip(); // Before adding first block delete view tip if it exists
	if ($e.isNumber(instruction.maxInstances)) {
		if (!$e.ui.blocks.getDragginBlockAction() == "move") { // Make sure the block is not being moved instead of added)
			instruction.countInstances++;
			$e.ui.blocks.updateCount(instructionSetId);
		}
	}
	const counterBlockEl = blockEl.querySelector(".counter");
	if (counterBlockEl) blockEl.removeChild(counterBlockEl);
	if (!$e.ui.blocks.lockBreakpoints) $e.ui.debug.updateBlocksBreakpoints(blockEl, "add");
};