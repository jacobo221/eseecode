"use static";

/**
 * Scrolls to the given element in the givent parent node
 * @private
 * @param {!HTMLElement} blockEl Block
 * @param {!HTMLElement} [scrollEl] Element to scroll, by default it is the view blocks element
 * @example $e.ui.blocks.scrollToBlock($e.ui.element.querySelector("#block-1231231231")
 */
$e.ui.blocks.scrollToBlock = (blockEl, scrollEl = $e.ui.element.querySelector("#view-blocks")) => {
	let blockHeight;
	if (blockEl.getBoundingClientRect().height) blockHeight = blockEl.getBoundingClientRect().height;
	else blockHeight = blockEl.getBoundingClientRect().bottom - blockEl.getBoundingClientRect().top;
	if (blockEl.offsetTop < scrollEl.scrollTop) {
		$e.ui.smoothScroll(scrollEl, blockEl.offsetTop - 10);
	} else if (blockEl.offsetTop + blockHeight > scrollEl.scrollTop + scrollEl.clientHeight) {
		$e.ui.smoothScroll(scrollEl, blockEl.offsetTop - scrollEl.clientHeight + blockHeight + 10);
	}
};

/**
 * Toggles between flow view and blocks view
 * @private
 * @example $e.ui.blocks.flowToggle()
 */
$e.ui.blocks.flowToggle = () => {
	const bodyEl = $e.ui.element.querySelector("#body");
	const displayFlow = $e.ide.blocks.flowVisible = !bodyEl.classList.contains("flow");
	bodyEl.classList[displayFlow ? "add" : "remove"]("flow");
	const buttonEl = $e.ui.element.querySelector("#view-blocks-tabs-flow");
	buttonEl.classList[displayFlow ? "add" : "remove"]("toggled");
	$e.ui.blocks.multiselectToggle(false);
};

/**
 * Toggles between multiple and single blocks selection
 * @private
 * @param {Boolean} [multiple] If true enable multiple select, if false disable mutipleselect, otherwise toggle
 * @example $e.ui.blocks.multiselectToggle()
 */
$e.ui.blocks.multiselectToggle = (multiple) => {
	if (multiple !== true && multiple !== false) multiple = !$e.ide.blocks.multiselect; // Ignore Event
	const buttonEl = $e.ui.element.querySelector("#view-blocks-tabs-multiselect");
	const multiselect = $e.ide.blocks.multiselect = multiple;
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	if (multiselect) {
		buttonEl.classList.add("toggled");
		viewEl.classList.add("multiselect");
	} else {
		buttonEl.classList.remove("toggled");
		viewEl.classList.remove("multiselect");
	}
	if (multiple === false) $e.ui.blocks.unselectAllBlocks();
};

/**
 * Toggles view blocks multiselect buttons
 * @private
 * @param {Boolean} visible If true, make butons visible, otherwise hide them
 * @example $e.ui.blocks.toggleMultiselectButtons(true)
 */
$e.ui.blocks.toggleMultiselectButtons = (visible) => {
	const buttons = Array.from($e.ui.element.querySelectorAll("#view-blocks-tabs-move, #view-blocks-tabs-duplicate, #view-blocks-tabs-remove"));
	if (visible) {
		buttons.forEach(tabEl => tabEl.classList.remove("hide"));
	} else {
		buttons.forEach(tabEl => tabEl.classList.add("hide"));
	}
};

/**
 * Unselects all blocks
 * @private
 * @example $e.ui.blocks.unselectAllBlocks()
 */
$e.ui.blocks.unselectAllBlocks = () => {
	const selectedBlocks = Array.from($e.ui.element.querySelectorAll("#view-blocks .block.selected"));
	selectedBlocks.forEach(blockEl => blockEl.classList.remove("selected"));
	$e.ide.blocks.lastSelected = undefined;
	$e.ui.blocks.toggleMultiselectButtons(false);
};

/**
 * Selects or unselect a block in a multiselection
 * @private
 * @param {Object} event Event
 * @example $e.ui.blocks.selectBlock()
 */
$e.ui.blocks.selectBlock = (event) => {
	const oldSelectedBlocks = Array.from($e.ui.element.querySelectorAll("#view-blocks .block.selected"));
	const blockEl = event.target.closest(".block:not(.subblock)");
	const selected = !blockEl.classList.contains("selected");
	if (selected && oldSelectedBlocks[0] && !Array.from(oldSelectedBlocks[0].parentNode.children).includes(blockEl)) { // Selected blocks must be siblings, otherwise overwrite the selection with just this block
		oldSelectedBlocks.forEach(blockEl => blockEl.classList.remove("selected"));
		$e.ide.blocks.lastSelected = undefined;
	}
	if (selected) {
		const nowSelectedBlocks = [];
		if (event.shiftKey && $e.ide.blocks.lastSelected) {
			const siblingBlocks = Array.from(blockEl.parentNode.children);
			const thisSelectedIndex = siblingBlocks.indexOf(blockEl);
			const lastSelectedIndex = siblingBlocks.indexOf($e.ide.blocks.lastSelected);
			const firstIndex = thisSelectedIndex < lastSelectedIndex ? thisSelectedIndex : lastSelectedIndex;
			const lastIndex = thisSelectedIndex > lastSelectedIndex ? thisSelectedIndex : lastSelectedIndex;
			for (let i = firstIndex; i <= lastIndex; i++) nowSelectedBlocks.push(siblingBlocks[i]);
		} else {
			nowSelectedBlocks.push(blockEl);
		}
		nowSelectedBlocks.forEach(blockEl => blockEl.classList.add("selected"));
		$e.ui.blocks.toggleMultiselectButtons(true);
		$e.ide.blocks.lastSelected = blockEl;
	} else {
		blockEl.classList.remove("selected");
		if (oldSelectedBlocks.length <= 1) {
			$e.ui.blocks.toggleMultiselectButtons(false);
			$e.ide.blocks.lastSelected = undefined;
		}
	}
};

/**
 * Cancels movement of multiple blocks
 * @private
 * @param {Object} event Event
 * @example $e.ui.blocks.moveBlocksEventCancel()
 */
$e.ui.blocks.moveBlocksEventCancel = (event) => {
	if (event.type !== "keydown") {
		if (!event.isPrimary) return;
		if (event.button !== undefined && event.button !== 0) return; // If it's a mouse click attend only to left button
	}
	$e.ui.blocks.moveBlocksStop();
};

/**
 * Stops an asynchronous move blocks event
 * @private
 * @example $e.ui.blocks.moveBlocksStop()
 */
$e.ui.blocks.moveBlocksStop = () => {
	$e.session.moveBlocksHandler = undefined;
	const viewContentEl = $e.ui.element.querySelector("#view-content");
	viewContentEl.classList.remove("moveBlocksHandler");
	viewContentEl.removeEventListener("pointerdown", $e.ui.blocks.moveBlocksEventAccept);
	document.body.removeEventListener("pointerdown", $e.ui.blocks.moveBlocksEventCancel);
	$e.ui.blocks.multiselectToggle(false);
};

/**
 * Starts movement of multiple blocks from UI
 * @private
 * @example $e.ui.blocks.moveBlocksEventStart()
 */
$e.ui.blocks.moveBlocksEventStart = () => {
	$e.session.moveBlocksHandler = true; // Semaphor so keyboard shortcurs and events on blocks will not be handled
	const viewContentEl = $e.ui.element.querySelector("#view-content");
	viewContentEl.classList.add("moveBlocksHandler");
	viewContentEl.addEventListener("pointerdown", $e.ui.blocks.moveBlocksEventAccept); // click is also triggered by touchstart
	document.body.addEventListener("pointerdown", $e.ui.blocks.moveBlocksEventCancel); // click is also triggered by touchstart
};

/**
 * Moves multiple blocks after the clicked block
 * @private
 * @param {Object} event Event
 * @example $e.ui.blocks.moveBlocksEventAccept()
 */
$e.ui.blocks.moveBlocksEventAccept = (event) => {
	const clickedBlockEl = event.target.closest(".block");
	if (!clickedBlockEl) return $e.ui.blocks.moveBlocksStop();
	if (clickedBlockEl.classList.contains("selected") && clickedBlockEl.nextSibling && clickedBlockEl.nextSibling.classList.contains("selected")) return $e.ui.blocks.moveBlocksStop();
	let destParentNode = clickedBlockEl.parentNode;
	let destNextSibling = clickedBlockEl.nextSibling;
	if (clickedBlockEl.classList.contains(".subblock")) {
		const firstSubblock = clickedBlockEl.querySelector(".subblock");
		destParentNode = firstSubblock;
		destNextSibling = firstSubblock.firstChild;
	} else if (clickedBlockEl.classList.contains(".subblock")) {
		destParentNode = clickedBlockEl;
		destNextSibling = clickedBlockEl.firstChild;
	}
	const selectedBlocks = Array.from($e.ui.element.querySelectorAll("#view-blocks .block.selected"));
	selectedBlocks.forEach((blockEl, i) => {
		const combine = i > 0;
		const undoSubitem = {
			sourceParentBlock: blockEl.parentNode,
			sourceNextSibling: blockEl.nextSibling,
			action: "move",
			blockEl: blockEl,
			newParentBlock: clickedBlockEl.parentNode,
			newNextSibling: clickedBlockEl.nextSibling,
		};
		$e.ui.blocks.insertIntoCode(blockEl, destParentNode, destNextSibling);
		if (combine) {
			$e.ide.blocks.changes.combine(undoSubitem);
		} else {
			$e.ide.blocks.changes.push(undoSubitem);
		}
	});
	$e.ide.blocks.changed(); // Must be called after the last undo is added in the combine item
	$e.ui.blocks.multiselectToggle(false);
	$e.ui.blocks.moveBlocksStop();
};

/**
 * Duplicates multiple blocks from UI
 * @private
 * @example $e.ui.blocks.duplicateBlocks()
 */
$e.ui.blocks.duplicateBlocks = () => {
	const selectedBlocks = Array.from($e.ui.element.querySelectorAll("#view-blocks .block.selected"));
	selectedBlocks.forEach((blockEl, i) => {
		let duplicateBefore = blockEl;
		while (duplicateBefore && duplicateBefore.classList.contains("selected")) duplicateBefore = duplicateBefore.nextSibling; // Duplicate groups of blocks after the end of teh group
		$e.ui.blocks.duplicateInCodeFromUI(blockEl, i > 0, duplicateBefore);
	});
	$e.ide.blocks.changed(); // Must be called after the last undo is added in the combine item
	$e.ui.blocks.multiselectToggle(false);
};

/**
 * Deletes multiple blocks from UI
 * @private
 * @example $e.ui.blocks.removeBlocks()
 */
$e.ui.blocks.removeBlocks = () => {
	const selectedBlocks = Array.from($e.ui.element.querySelectorAll("#view-blocks .block.selected"));
	selectedBlocks.forEach((blockEl, i) => {
		blockEl.classList.remove("selected"); // Unselect so if they are restored with undo they do not appear as selected
		$e.ui.blocks.deleteFromCodeFromUI(blockEl, i > 0);
	});
	$e.ide.blocks.changed(); // Must be called after the last undo is added in the combine item
	$e.ui.blocks.multiselectToggle(false);
};

/**
 * Initializes/Resets the blocks view window
 * @private
 * @example $e.ui.blocks.resetView()
 */
$e.ui.blocks.resetView = () => {
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	while (viewEl.hasChildNodes()) {
		viewEl.removeChild(viewEl.firstChild);
	}
	$e.ui.blocks.cancelFloatingBlock();
	$e.ui.blocks.addBeginTip();

	$e.ui.element.querySelector("#body").style.setProperty("--block-indent", "calc(" + $e.setup.tabSize + " / 2 * 1em)");
};

/**
 * Adds the view and toolbox tips for blocks if no code exists
 * @private
 * @example $e.ui.blocks.addBeginTip()
 */
$e.ui.blocks.addBeginTip = () => {
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	if (!$e.ui.blocks.codeIsEmpty()) return;
	const oldTipsEl = $e.ui.element.querySelector("#view-blocks-tip");
	if (oldTipsEl) oldTipsEl.parentNode.removeChild(oldTipsEl);
	const level = $e.modes.views.current.id;
	// View tip
	let text = "";
	if (level === "level1") {
		text = _("Click some blocks to start programming!");
	} else {
		text = _("Drop some blocks here to start programming!");
	}
	const tipEl = document.createElement("div");
	tipEl.id = "view-blocks-tip";
	tipEl.textContent = text;
	viewEl.appendChild(tipEl);
};

/**
 * Removes the view and toolbox tips for blocks
 * @private
 * @example $e.ui.blocks.removeBeginTip()
 */
$e.ui.blocks.removeBeginTip = () => {
	// Remove view tip
	const tipEl = $e.ui.element.querySelector("#view-blocks-tip");
	if (!tipEl) return;
	tipEl.parentNode.removeChild(tipEl);
};

/**
 * Returns whether there are blocks of code in the code
 * @private
 * @return True if there are no blocks in the code, false otherwise
 * @example $e.ui.blocks.codeIsEmpty()
 */
$e.ui.blocks.codeIsEmpty = () => {
	return !$e.ui.element.querySelector("#view-blocks").firstChild || !!$e.ui.element.querySelector("#view-blocks-tip");
};

/**
 * Initializes/Resets the blocks in the toolbox window
 * @private
 * @param {String} level Level name
 * @param {!HTMLElement} toolbox Toolbox window element
 * @example $e.ui.blocks.initToolbox("level2", $e.ui.element.querySelector("#toolbox-window"))
 */
$e.ui.blocks.initToolbox = (level, toolboxEl) => {
	$e.ui.resetToolbox(toolboxEl);
	let clearNext = false;
	if ($e.instructions.custom.length > 0) {
		// Check that there is an explicit instruction set
		$e.instructions.custom.forEach(instructionId => {
			const instructionName = $e.instructions.set[instructionId].name;
			if (instructionName == "blank") {
				clearNext = true;
				return;
			}
			if (clearNext) {
				clearNext = false;
				toolboxEl.appendChild(document.createElement("br"));
			}
			$e.ui.blocks.createAndPlaceBlock(instructionId, toolboxEl, undefined, undefined, { notIntoCode: true });
		});
	} else {
		$e.instructions.categories.forEach(categoryName => {
			let firstInCategory = true;
			Object.entries($e.instructions.set).forEach(([ instructionSetId, instruction ]) => {
				// Only show instructions in the current category
				if (categoryName != instruction.category) return;
				// See if this instruction is shown in this level
				if (instruction.show && instruction.show.some(instruction_level => instruction_level == level)) {
					const codeId = instruction.name;
					if (codeId.match(/^blank[0-9]*$/)) {
						clearNext = true;
						return;
					}
					if (firstInCategory || clearNext) {
						if (toolboxEl.firstChild) toolboxEl.appendChild(document.createElement("br")); // Skip the first break if it is the very first block
						firstInCategory = false;
						clearNext = false;
					}
					$e.ui.blocks.createAndPlaceBlock(instructionSetId, toolboxEl, undefined, undefined, { notIntoCode: true });
				}
			});
		});
	}
};