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
 * @example $e.ui.blocks.toggleFlow()
 */
$e.ui.blocks.toggleFlow = () => {
	const bodyEl = $e.ui.element.querySelector("#body");
	const displayFlow = $e.ide.blocks.flowVisible = !bodyEl.classList.contains("flow");
	bodyEl.classList[displayFlow ? "add" : "remove"]("flow");
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