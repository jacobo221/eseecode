"use static";

/**
 * Scrolls to the given element in the givent parent node
 * @private
 * @param {!HTMLElement} blockEl Block
 * @param {!HTMLElement} [scrollEl] Element to scroll, by default it is the view blocks element
 * @example $e.ui.blocks.scrollTo($e.ui.element.querySelector("#block-1231231231")
 */
$e.ui.blocks.scrollTo = (blockEl, scrollEl = $e.ui.element.querySelector("#view-blocks")) => {
	const blockRect = blockEl.getBoundingClientRect();
	const blockHeight = blockRect.height ? blockRect.height : blockRect.bottom - blockRect.top;
	let blockOffsetTop = 0;
	let pathBlock = blockEl;
	while (pathBlock.classList.contains("block")) {
		blockOffsetTop += pathBlock.offsetTop;
		pathBlock = pathBlock.parentNode;
	}
	if (blockOffsetTop < scrollEl.scrollTop) {
		$e.ui.smoothScroll(scrollEl, blockOffsetTop - 10);
	} else if (blockOffsetTop + blockHeight > scrollEl.scrollTop + scrollEl.clientHeight) {
		$e.ui.smoothScroll(scrollEl, blockOffsetTop - scrollEl.clientHeight + blockHeight + 10);
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
 * @param {Event|Boolean} [multipleOrEvent] If true enable multiselect, if false disable multiselect, otherwise toggle
 * @example $e.ui.blocks.multiselectToggle()
 */
$e.ui.blocks.multiselectToggle = (multipleOrEvent = !$e.ide.blocks.multiselect) => {
	let multiselect;
	if (multipleOrEvent instanceof Event) {
		multiselect = !$e.ide.blocks.multiselect;
	} else {
		multiselect = multipleOrEvent;
	}
	const buttonEl = $e.ui.element.querySelector("#view-blocks-tabs-multiselect");
	$e.ide.blocks.multiselect = multiselect;
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	if (multiselect) {
		buttonEl.classList.add("toggled");
		viewEl.classList.add("multiselect");
		document.body.addEventListener("pointerdown", $e.ui.blocks.multiselectEventCancel);
	} else {
		buttonEl.classList.remove("toggled");
		viewEl.classList.remove("multiselect");
		$e.ui.blocks.multipleMoveCancel();
		$e.ui.blocks.unselectAll();
		document.body.removeEventListener("pointerdown", $e.ui.blocks.multiselectEventCancel);
	}
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
 * Cancels selection of multiple blocks
 * @private
 * @param {Object} event Event
 * @example $e.ui.blocks.multiselectEventCancel()
 */
$e.ui.blocks.multiselectEventCancel = (event) => {
	if (event.type !== "keydown") {
		if (!event.isPrimary) return;
		if (event.button !== undefined && event.button !== 0) return; // If it's a mouse click attend only to left button
	}
	if (event.target.closest("#view-content")) return; // Ignore within view-content (because view-blocks tabs are contained in view-content) as this trigger is also listening in document-body so it would cancel all triggers within view-blocks
	$e.ui.blocks.multiselectToggle(false);
};

/**
 * Unselects all blocks
 * @private
 * @example $e.ui.blocks.unselectAll()
 */
$e.ui.blocks.unselectAll = () => {
	const selectedBlocks = Array.from($e.ui.element.querySelectorAll("#view-blocks .block.selected"));
	selectedBlocks.forEach(blockEl => blockEl.classList.remove("selected"));
	$e.ide.blocks.lastSelected = undefined;
	$e.ui.blocks.toggleMultiselectButtons(false);
};

/**
 * Selects or unselect a block in a multiselection
 * @private
 * @param {Object} event Event
 * @example $e.ui.blocks.select()
 */
$e.ui.blocks.select = (event) => {
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
 * Stops an asynchronous move blocks event
 * @private
 * @example $e.ui.blocks.multipleMoveCancel()
 */
$e.ui.blocks.multipleMoveCancel = () => {
	$e.session.moveBlocksHandler = undefined;
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	viewEl.classList.remove("moveBlocksHandler");
	const oldPlaceholderEl = viewEl.querySelector(".placeholder-before, .placeholder-after");
	if (oldPlaceholderEl) oldPlaceholderEl.classList.remove("placeholder-before", "placeholder-after");
	viewEl.removeEventListener("pointerdown", $e.ui.blocks.multipleMoveEventAccept);
	viewEl.removeEventListener("pointermove", $e.ui.blocks.multipleMoveEventMove);
};

/**
 * Starts movement of multiple blocks from UI
 * @private
 * @example $e.ui.blocks.multiipleMoveEventStart()
 */
$e.ui.blocks.multiipleMoveEventStart = () => {
	$e.session.moveBlocksHandler = true; // Semaphor so keyboard shortcurs and events on blocks will not be handled
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	viewEl.classList.add("moveBlocksHandler");
	$e.ui.blocks.dragging = {
		lastPointedBlock: undefined,
		lastPointedAfter: undefined,
	}
	viewEl.addEventListener("pointerdown", $e.ui.blocks.multipleMoveEventAccept); // click is also triggered by touchstart
	viewEl.addEventListener("pointermove", $e.ui.blocks.multipleMoveEventMove); // click is also triggered by touchstart
};

/**
 * Moves multiple blocks from UI
 * @private
 * @example $e.ui.blocks.multipleMoveEventMove(event)
 */
$e.ui.blocks.multipleMoveEventMove = (event) => {

	if (event.isPrimary !== undefined && !event.isPrimary) return;

	if ($e.modes.views.current.id == "level1") return console.error("Invalid call to $e.ui.blocks.multipleMoveEventMove from mode " + $e.modes.views.current.id); // This funcion is never triggered in level1

	const pointedBlockDetails = $e.ui.blocks.getMovePointedBlock(event);
	if (!pointedBlockDetails) return;
	const { pointedBlock, pointingAfter } = pointedBlockDetails;

	const oldPlaceholderEl = $e.ui.element.querySelector(".placeholder-before, .placeholder-after");
	if (oldPlaceholderEl) oldPlaceholderEl.classList.remove("placeholder-before", "placeholder-after");

	if (
		!pointedBlock ||
		pointedBlock.classList.contains("selected") ||
		(pointingAfter && pointedBlock.nextSibling && pointedBlock.nextSibling.classList.contains("selected")) ||
		(!pointingAfter && pointedBlock.previousSibling && pointedBlock.previousSibling.classList.contains("selected"))
	) return; // Nothing to do as there would be no changes
	const placeholderClass = pointingAfter ? "placeholder-after" : "placeholder-before";
	pointedBlock.classList.add(placeholderClass);
};

/**
 * Moves multiple blocks after the clicked block
 * @private
 * @param {Object} event Event
 * @example $e.ui.blocks.multipleMoveEventAccept()
 */
$e.ui.blocks.multipleMoveEventAccept = (event) => {
	if (event.isPrimary !== undefined && !event.isPrimary) return;
	$e.ui.blocks.multipleMoveEventMove(event);
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	const clickedBlockEl = viewEl.querySelector(".block.placeholder-before, .block.placeholder-after")
	if (!clickedBlockEl) return $e.ui.blocks.multiselectToggle(false);
	let destParentNode = clickedBlockEl.parentNode;
	let destNextSibling = clickedBlockEl.classList.contains("placeholder-before") ? clickedBlockEl : clickedBlockEl.nextSibling;
	if (clickedBlockEl.classList.contains("container")) {
		const firstSubblock = clickedBlockEl.querySelector(".subblock");
		destParentNode = firstSubblock;
		destNextSibling = firstSubblock.querySelector(".block");
	} else if (clickedBlockEl.classList.contains("subblock")) {
		destParentNode = clickedBlockEl;
		destNextSibling = clickedBlockEl.querySelector(".block");
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
};

/**
 * Duplicates multiple blocks from UI
 * @private
 * @example $e.ui.blocks.multipleDuplicate()
 */
$e.ui.blocks.multipleDuplicate = () => {
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
 * @example $e.ui.blocks.multipleRemove()
 */
$e.ui.blocks.multipleRemove = () => {
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