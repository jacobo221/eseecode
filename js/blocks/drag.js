"use strict";

/**
 * Returns whether there is a floating block
 * @private
 * @return {String} Specific action that will happen if the block is dropped now, or false of there is no floating block. Possible actions are "add", "move", "setup", "delete", "cancel"
 * @example $e.ui.blocks.getFloatingBlockAction()
 */
$e.ui.blocks.getFloatingBlockAction = () => {
	if (!$e.ui.blocks.floating) return false;
	const isToolbox = !$e.ui.blocks.floating.sourceBlockEl;
	const blockEl = $e.ui.blocks.floating.blockEl;
	if (isToolbox) {
		if ($e.modes.views.current.id == "level1") return "add";
		else if (blockEl.classList.contains("addCandidate")) return "add";
		else if (blockEl.classList.contains("cancelCandidate")) return "cancel";
	} else {
		if (blockEl.classList.contains("deleteCandidate")) return "delete";
		else if (blockEl.classList.contains("setupCandidate")) return "setup";
		else if (blockEl.classList.contains("moveCandidate")) return "move";
		else if (blockEl.classList.contains("cancelCandidate")) return "cancel";
	}
	return console.error("This should never happen in $e.ui.blocks.getFloatingBlockAction");
};

/**
 * Cleares floating block and all its visual effects
 * @private
 * @param {Boolean} [isMoving=false] If true, only a partial floating block visual cleaning will happen, to leave it ready for floating block movement
 * @example $e.ui.blocks.cleanFloatingBlockVisualEffects()
 */
$e.ui.blocks.cleanFloatingBlockVisualEffects = (isMoving = false) => {
	if (!$e.ui.blocks.floating) return;
	const blockEl = $e.ui.blocks.floating.blockEl;
	const sourceBlockEl = $e.ui.blocks.floating.sourceBlockEl;
	const sourceSetupBlockEl = $e.ui.blocks.floating.sourceSetupBlockEl;
	const oldPlaceholderEl = $e.ui.element.querySelector(".placeholder-before, .placeholder-after");
	if (sourceBlockEl) sourceBlockEl.classList.remove("deleteCandidate", "setupCandidate", "moveCandidate", "addCandidate", "cancelCandidate");
	if (sourceSetupBlockEl) sourceSetupBlockEl.classList.remove("setupCandidate");
	if (oldPlaceholderEl) oldPlaceholderEl.classList.remove("placeholder-before", "placeholder-after");
	blockEl.classList.remove("deleteCandidate", "setupCandidate", "moveCandidate", "addCandidate", "cancelCandidate", "fromToolbox", "highlight");
	if (!isMoving) {
		if (blockEl.parentNode.id == "body") {
			blockEl.parentNode.removeChild(blockEl);
		} else { // The floating block has been placed in the code
			blockEl.classList.remove("floating");
			blockEl.style.left = "";
			blockEl.style.top = "";
		}
	}
}

/**
 * Cancels a block movement or edition
 * @private
 * @param {Event|Boolean} [eventOrIsSetup=false] If true, only a partial floating block cancellation will happen, to leave it ready for block setup dialog
 * @example $e.ui.blocks.cancelFloatingBlock()
 */
$e.ui.blocks.cancelFloatingBlock = (eventOrIsSetup = false) => {
	if (eventOrIsSetup instanceof Event && !eventOrIsSetup.isPrimary) return;
	document.body.removeEventListener("pointerup", $e.ui.blocks.modifyEventAccept);
	document.body.removeEventListener("pointermove", $e.ui.blocks.modifyEventMove);
	document.body.removeEventListener("pointercancel", $e.ui.blocks.cancelFloatingBlock);
	if (eventOrIsSetup !== true) { // Event or false
		$e.ui.blocks.cleanFloatingBlockVisualEffects();
		$e.ui.blocks.floating = undefined;
	}
};

/**
 * Block clicked listener. It listenes for clicks on blocks and acts accordingly
 * @private
 * @param {Object} event Event
 * @example blockEl.addEventListener(handler, $e.ui.blocks.modifyEventStart)
 */
$e.ui.blocks.modifyEventStart = (event) => {
	if (!event.isPrimary) return;
	if (event && event.button !== undefined && event.button !== 0) return; // If it's a mouse click attend only to left button
	if ($e.session.breakpointHandler) {
		$e.ui.debug.addBreakpointEventAccept(event);
		return;
	}
	const level = $e.modes.views.current.id;
	if (level === "level1" && $e.execution.isRunning()) return; // Wait for the previous block addition to finish, otherwise superseding animations will break the execution
	$e.ui.unhighlight();
	// At this point we cannot know if the user wants to drag the block or wants to set up the block, so we must take both and see later (when the event is mousemove or mouseup)
	const clickedBlockEl = event.target.closest(".block:not(.subblock)");
	if (!clickedBlockEl) return console.error("This should never happen in $e.ui.blocks.modifyEventStart");
	if ($e.ui.blocks.getFloatingBlockAction()) $e.ui.blocks.modifyEventAccept(); // If two blocks are clicked too fast (before the animation is finished), make sure we add the previous one	const level = $e.modes.views.current.id;
	const isToolbox = !!clickedBlockEl.closest("#toolbox");
	$e.ui.blocks.cancelFloatingBlock();
	if (isToolbox) {
		// Cancel adding block if it is disabled
		let instructionSetId = clickedBlockEl.dataset.instructionSetId;
		let instruction = $e.instructions.set[instructionSetId];
		if ($e.isNumber(instruction.maxInstances) && instruction.countInstances >= instruction.maxInstances) return; // Make sure the block is not being moved instead of added
	} else {
		if (level == "level1") return; // In level1 blocks are not moved
	}
	const blockEl = $e.ide.blocks.clone(clickedBlockEl)
	$e.ui.blocks.floating = {
		mouse: { x: undefined, y: undefined },
		movesCount: 0,
		blockEl: blockEl,
		sourceSetupBlockEl: undefined,
		sourceSubblockEl: undefined,
	}
	if (!isToolbox) {
		const sourceSetupBlockEl = event.target.closest(".block");
		$e.ui.blocks.floating.sourceBlockEl = clickedBlockEl;
		$e.ui.blocks.floating.sourceSetupBlockEl = sourceSetupBlockEl;
		blockEl.classList.add("setupCandidate"); // Initially assume the block action is "setup"
		sourceSetupBlockEl.classList.add("setupCandidate"); // Initially assume the block action is "setup"
	} else {
		// Remove countdown from floating block
		const blockCountEl = $e.ui.blocks.floating.blockEl.querySelector(".countdown");
		if (blockCountEl) $e.ui.blocks.floating.blockEl.removeChild(blockCountEl);
	}
	blockEl.id = $e.backend.newblockId();
	blockEl.removeEventListener("pointerdown", $e.ui.blocks.modifyEventStart);
	const mainBodyEl = $e.ui.element.querySelector("#body");
	if (level == "level1") {
		// In level1 we stick the block immediately
		$e.ui.blocks.modifyEventAccept();
		// Do animation
		const animation_duration = 0.5; // In seconds
		const originBlockPosition = clickedBlockEl.getBoundingClientRect();
		const destBlockEl = $e.ui.element.querySelector("#view-blocks").lastChild;
		const destBlockPosition = destBlockEl.getBoundingClientRect();
		const shadowBlockEl = $e.ide.blocks.clone(clickedBlockEl);
		shadowBlockEl.classList.add("shadowBlock", "floating", "fromToolbox");
		shadowBlockEl.style.top = originBlockPosition.top + window.scrollY + "px";
		shadowBlockEl.style.left = originBlockPosition.left + window.scrollX + "px";
		shadowBlockEl.style.transition = "opacity " + animation_duration + "s, top " + animation_duration + "s, left " + animation_duration + "s";
		mainBodyEl.appendChild(shadowBlockEl);
		setTimeout(() => {
			[ "top", "left" ].forEach(key => shadowBlockEl.style[key] = destBlockPosition[key] + "px");
			shadowBlockEl.style.opacity = 0;
			setTimeout(() => {
				shadowBlockEl.parentNode.removeChild(shadowBlockEl);
			}, animation_duration * 1000);
		}, 0);
	} else {
		mainBodyEl.appendChild(blockEl); // We add it to #body so the .levelX class applies, which we need to get the block's size
		// Try to drag the block pinned from the same position it was clicked
		const clickedBlockElRect = clickedBlockEl.getBoundingClientRect();
		$e.ui.blocks.floating.mouse.x = event.pageX - clickedBlockElRect.left - window.scrollX;
		if ($e.isNumber($e.ui.blocks.floating.mouse.x) && $e.ui.blocks.floating.mouse.x > 0) {
			$e.ui.blocks.floating.mouse.y = event.pageY - clickedBlockElRect.top - window.scrollY;
		} else {
			// Android WebView (for embedding in Android app), doesn't take into acount scroll in getBoundingClientRect() when zooming
			$e.ui.blocks.floating.mouse.x = undefined;
		}
		blockEl.classList.add("floating");
		$e.ui.blocks.floating.lastPointedBlock = undefined;
		$e.ui.blocks.floating.lastPointedAfter = undefined;
		$e.ui.blocks.modifyEventMove(event);
		// firefox is unable to use the mouse event handler if it is called from HTML handlers, so here we go
		document.body.addEventListener("pointermove", $e.ui.blocks.modifyEventMove);
		document.body.addEventListener("pointerup", $e.ui.blocks.modifyEventAccept);
		document.body.addEventListener("pointercancel", $e.ui.blocks.cancelFloatingBlock);
	}
};

/**
 * Moves a block with the mouse movemement
 * @private
 * @param {Object} event Event
 * @example document.body.removeEventListener("pointermove", $e.ui.blocks.modifyEventMove)
 */
$e.ui.blocks.modifyEventMove = (event) => {

	if (event.isPrimary !== undefined && !event.isPrimary) return;

	if ($e.modes.views.current.id == "level1") return console.error("Invalid call to $e.ui.blocks.modifyEventMove from mode " + $e.modes.views.current.id); // This funcion is never triggered in level1

	// Position the floating block
	const blockEl = $e.ui.blocks.floating.blockEl;
	let blockRect = blockEl.getBoundingClientRect();
	const blockHeight = blockRect.height;
	const blockWidth = blockRect.width;
	if ($e.ui.blocks.floating.mouse.x !== undefined) {
		blockEl.style.left = event.pageX - $e.ui.blocks.floating.mouse.x + "px";
		blockEl.style.top = event.pageY - $e.ui.blocks.floating.mouse.y + "px";
	} else {
		blockEl.style.left = event.pageX - blockWidth / 2 + "px";
		blockEl.style.top = event.pageY - blockHeight / 2 + "px";
	}

	$e.ui.blocks.floating.movesCount++; // If the block is dragged far and back, the user was not trying to setup the block, they just thought twice about moving the block

	// Calculate where the block would be dropped
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	let pointedBlock = $e.ui.blocks.getDropBlockFromPosition($e.obtainPosition(event));
	let pointingAfter;
	if (pointedBlock) {
		const pointedBlockRect = pointedBlock.getBoundingClientRect();
		pointingAfter = event.pageY >= pointedBlockRect.top + pointedBlockRect.height / 2;
	}

	if (pointedBlock === $e.ui.blocks.floating.lastPointedBlock && pointingAfter === $e.ui.blocks.floating.lastPointingAfter) return; // Do not us $e.ui.element.querySelector(".placeholder-before, .placeholder-after") as the pointed element might be quite different to the block eventually used
	$e.ui.blocks.floating.lastPointedBlock = pointedBlock;
	$e.ui.blocks.floating.lastPointedAfter = pointingAfter;

	if (pointedBlock === false) { // Pointing outside of the code view
		
		const viewElRect = viewEl.getBoundingClientRect();
		if (event.pageY < viewElRect.top && viewEl.scrollTop > 0) { // If mouse is above the view or under the view, scroll. Don't use $e.ui.smoothScroll since it uses a timeout and it will queue up in the events to launch
			viewEl.scrollTop -= 2; // Scroll up
		} else if (event.pageY > viewElRect.bottom && viewEl.scrollTop < viewEl.scrollHeight - viewElRect.height) {
			viewEl.scrollTop += 2; // Scroll down
		} // else do nothing, pointedBlock = false is all we need

	} else if (pointedBlock === null) { // Pointing inside the code view, but no block at that height

		if ($e.ui.blocks.codeIsEmpty()) {
			pointedBlock = viewEl.firstChild;
			pointingAfter = false;
		} else if (event.pageY > viewEl.lastChild.getBoundingClientRect().bottom) { // See if it is pointing below the last block, and if so, point to the last block
			pointedBlock = viewEl.lastChild;
			pointingAfter = true;
		} else if (event.pageY < viewEl.firstChild.getBoundingClientRect().top) { // See if it is pointing above the first block, and if so, point to the first block
			pointedBlock = viewEl.firstChild;
			pointingAfter = false;
		} else {
			// Position is in between blocks inside the code, leave the block where it was originally
			pointedBlock = undefined;
		}

	} else if (pointedBlock) { // The block is inside the code view and over another block

		if (pointingAfter && pointedBlock.matches(".subblock:last-child")) { // In containers blocks cannot go inside the last subblock, we must pick the container as reference. Use :last-child until ".block:nth-first-child(1 of .block)" (introduced in Chrome and Firefox in 2023) can be considered widespread
			pointedBlock = pointedBlock.closest(".container");
		} else if (pointedBlock.matches(".subblock")) { // Container subblocks can only have blocks insterted after (actually, inside), not above
			const firstSubblockChild = pointedBlock.querySelector(".block");
			if (!pointingAfter) {
				if (firstSubblockChild) {
					if (event.pageY > pointedBlock.lastChild.getBoundingClientRect().bottom) { // Even if it is pointing in the top half of the element, it could still be meant for the end of the subblock, for example in an if-elseIf-else in which there's a very long empty column
						pointedBlock = pointedBlock.lastChild;
						pointingAfter = true;
					} else {
						pointedBlock = pointedBlock.querySelector(".block"); // Move to be the first block in the subblock
					}
				} else {
					pointingAfter = true; // Move inside the subblock
				}
			} else {
				if (firstSubblockChild) {
					pointedBlock = pointedBlock.lastChild; // Move to be the last block in the subblock
				} else {
					// Move inside the subblock
				}
			}
		}

	} else {
		console.error("This pointedBlock value should not happen in $e.ui.blocks.modifyEventMove", pointedBlock);
	}

	// Clean previous movement visual traces
	$e.ui.blocks.cleanFloatingBlockVisualEffects(true);

	// Apply the adequate visual effects
	const sourceBlockEl = $e.ui.blocks.floating.sourceBlockEl;
	const isToolbox = !sourceBlockEl;
	if (isToolbox) blockEl.classList.add("fromToolbox");
	if (pointedBlock === undefined) { 

		// Action will be discarded if dropped here
		blockEl.classList.add("cancelCandidate");
		if (sourceBlockEl) sourceBlockEl.classList.add("cancelCandidate");

	} else if (pointedBlock === false) {

		if (isToolbox) {
			// Block will be discarded if dropped here
			blockEl.classList.add("cancelCandidate");
			if (sourceBlockEl) sourceBlockEl.classList.add("cancelCandidate");
		} else {
			// Block will be removed if dropped here
			blockEl.classList.add("deleteCandidate");
			if (sourceBlockEl) sourceBlockEl.classList.add("deleteCandidate");
		}

	} else if (pointedBlock) {

		if ($e.ui.blocks.floating.movesCount === 1 && blockEl.classList.contains("container")) blockEl.style.setProperty("--block-code-height-in-code", sourceBlockEl.getBoundingClientRect().height + "px"); // This is a trick to preserve the subblocks' height when the container is floating (example: while(false){if(true){goToCenter()}else{}}goToCenter() while dragging the if() the height would break in the floating block's empty subblock
		
		// Add the placeholder to the calculated block
		const placeholderClass = pointingAfter ? "placeholder-after" : "placeholder-before";
		if (isToolbox) {
			blockEl.classList.add("addCandidate");
			pointedBlock.classList.add(placeholderClass);
		} else {
			if (
				(pointingAfter && pointedBlock === sourceBlockEl.previousElementSibling) ||
				(!pointingAfter && pointedBlock === sourceBlockEl.nextElementSibling) ||
				sourceBlockEl.contains(pointedBlock)
			) { // Nothing changed: Note that moving a block right above or below has no effect
				if ($e.ui.blocks.floating.movesCount <= $e.ui.maxDragForSetup) {
					blockEl.classList.add("setupCandidate");
					const sourceSetupBlockEl = $e.ui.blocks.floating.sourceSetupBlockEl;
					sourceSetupBlockEl.classList.add("setupCandidate");
				} else {
					blockEl.classList.add("cancelCandidate");
					sourceBlockEl.classList.add("cancelCandidate");
				}
			} else { // Only add the placeholder if the block will be moved
				sourceBlockEl.classList.add("moveCandidate");
				blockEl.classList.add("moveCandidate");
				pointedBlock.classList.add(placeholderClass);
			}
		}

	} else {
		console.error("This calculated pointedBlock value should not happen in $e.ui.blocks.modifyEventMove", pointedBlock);
	}
	
};

/**
 * Block unclicked listener. It listens for unclicks on blocks and acts accordingly
 * @private
 * @param {Object} event Event
 * @example blockEl.addEventListener(handler, $e.ui.blocks.modifyEventAccept)
 */
$e.ui.blocks.modifyEventAccept = async (event) => {
	if (event && !event.isPrimary) return;
	if (event && event.button !== undefined && event.button !== 0) return; // If its a mouse click attend only to left button
	const viewEl = $e.ui.element.querySelector("#view-blocks");
	let action = $e.ui.blocks.getFloatingBlockAction();
	if (!action) return; // If the floatingBlock has already been added there's nothing to do here (this could happen if two blocks are added consecutively too quickly, before the first block's animation has finished)
	const blockEl = $e.ui.blocks.floating.blockEl;
	const sourceBlockEl = $e.ui.blocks.floating.sourceBlockEl;
	const sourceParentBlock = sourceBlockEl ? sourceBlockEl.parentNode : undefined;
	const sourceNextSibling = sourceBlockEl ? sourceBlockEl.nextSibling : undefined;
	let targetBlockEl = blockEl; // Assume we will be acting on blockEl, change it in the few cases when we are not
	const level = $e.modes.views.current.id;
	const pointedEl = $e.ui.element.querySelector(".block.placeholder-before, .block.placeholder-after, #view-blocks-tip.placeholder-before, #view-blocks-tip.placeholder-after");
	let pointingAfter, parentNode, nextSibling;
	if (pointedEl) {
		pointingAfter = pointedEl.classList.contains("placeholder-after");
		if (pointedEl == viewEl || pointedEl.matches(".subblock")) { // Blocks referenced by a container subblock go inside the subblock
			parentNode = pointedEl;
			nextSibling = pointedEl.firstChild.nextElementSibling; // firstChild is icon, so point towards the next sibling
		} else { // Block referenced by a regular block go before/after the reference block
			parentNode = pointedEl.parentNode;
			nextSibling = pointingAfter ? pointedEl.nextSibling : pointedEl;
		}
	} else if (level === "level1") parentNode = viewEl;
	let addSetupResult;
	if (action === "add") {
		$e.ui.blocks.createAndPlaceBlock(targetBlockEl, parentNode, nextSibling);
		if (level === "level3" || (level === "level2" && $e.ui.blocks.forceSetup)) {
			const instruction = $e.instructions.set[targetBlockEl.dataset.instructionSetId];
			const firstSubblockEl = targetBlockEl.querySelector(".block");
			if (instruction.container && firstSubblockEl) addSetupResult = $e.ui.blocks.setup.open(firstSubblockEl, true);
			else addSetupResult = $e.ui.blocks.setup.open(targetBlockEl, true);
		}
	} else if (action === "move") {
		targetBlockEl = sourceBlockEl;
		$e.ui.blocks.createAndPlaceBlock(targetBlockEl, parentNode, nextSibling);
	} else if (action === "delete") {
		targetBlockEl = sourceBlockEl;
		$e.ui.blocks.removeFromCode(targetBlockEl);
	} else if (action === "setup") {
		targetBlockEl = $e.ui.blocks.floating.sourceSetupBlockEl;
		if ($e.ui.blocks.floating.movesCount > $e.ui.maxDragForSetup || !$e.ui.blocks.setup.open(targetBlockEl, false)) action = "cancel";
	} else if (action === "cancel") {
		// Do nothing
	} else return console.error("Invalid action in $e.ui.blocks.modifyEventAccept " + action);
	if (action != "cancel") {
		$e.session.updateOnViewSwitch = "blocks";
		if (action === "add" || action === "move" || action === "setup") $e.ui.blocks.scrollToBlock(targetBlockEl);
		if (level === "level1") {
			const lastStep = $e.execution.getProgramCounter(); // We need to save this as $e.execution.stop() will reser the programCounter
			$e.execution.stop();
			$e.session.runFrom = "level1_add_block";
			if ($e.execution.getProgramCounter() > 0) {
				$e.ide.execute(false, true, true, lastStep + 1); // Run immediately to the current position, then run the next instruction with animation
				await new Promise(function waitUntilStepped(r) { // Wait until execution has reached the target step. We must run this async, otherwise it freezes the execution and doesn't return here
					if (!$e.execution.isStepped()) setTimeout(() => waitUntilStepped(r), 10);
					else r();
				});
				await $e.ide.executeOrResume(false);
			} else {
				await $e.ide.execute(false, true, false);
			}
		} else {
			$e.execution.stop();
		}
		if (action != "setup") { // If action is setup it is up to $e.ui.blocks.setup.accept to update the undo/redo buttons or not
			$e.ide.blocks.changes.push({
				sourceBlockEl: sourceBlockEl,
				sourceParentBlock: sourceParentBlock,
				sourceNextSibling: sourceNextSibling,
				action: action,
				blockEl: targetBlockEl,
				newParentBlock: (action === "move" ? sourceBlockEl : blockEl).parentNode,
				newNextSibling: (action === "move" ? sourceBlockEl : blockEl).nextSibling,
				parameters: undefined,
			});
			if (action !== "add" || level === "level1" || (level === "level2" || level === "level3" && !addSetupResult)) $e.ide.blocks.changed(level !== "level1"); // If the block has to be set up after addition, wait for the block to be confirmed in the setup dialog before displaying the undo button, as the block addition might still be cancelled
		}
	}
	$e.ui.blocks.cancelFloatingBlock(action === "setup");
	$e.ui.updateViewButtonsVisibility();
};

/**
 * Returns the block under the line where the mouse is in the view-blocks element
 * @private
 * @param {!Object|Event|HTMLElement} positionReference Position coordinates, mouse Event or HTMLElement
 * @return {Object|Boolean} The element under the line where the mouse is in the view-blocks element, false if the position is not inside the code view or null if it is in the code view but no element is at that position's height
 * @example $e.ui.blocks.getDropBlockFromPosition(event)
 */
$e.ui.blocks.getDropBlockFromPosition = ({ x, y }) => {

	$e.ui.blocks.floating.blockEl.style.pointerEvents = "none"; // Disable pointer events so it does not disturb document.elementFromPoint
	let pointedEl = document.elementFromPoint(x, y);
	if (!pointedEl || !document.querySelector("#view-blocks").contains(pointedEl)) return false; // The pointed block is not in the view-blocks element nor the view-blocks element itself

	const getDroppableBlockFromElement = (el) => el.closest(".block");
	let pointedBlock = getDroppableBlockFromElement(pointedEl);
	// See if there is block in this Y coordinate, and if there is see if there is another block that is inside the currently found block
	const inc = $e.ui.blocks.getPropertyByLevel("level1", "width");
	const limit_distance_search = inc * 3;
	let distance = inc;
	const pointingBlocks = {
		left: pointedBlock,
		right: pointedBlock,
	};
	while (Object.values(pointingBlocks).some(pointingBlock => pointingBlock !== false)) {
		if (distance > limit_distance_search) break;
		// We will simoultaneously try left and right and find the nearest best match
		[ "left", "right" ].forEach(direction => {
			if (pointingBlocks[direction] === false) return; // Once we've reached the edge of the view on a direction, continue only with the other direction
			const pointed_x = direction == "left" ? x - distance : x + distance;
			let newPointedBlock = document.elementFromPoint(pointed_x, y);
			if (!newPointedBlock || !newPointedBlock.closest("#view-blocks")) return pointingBlocks[direction] = false;
			newPointedBlock = getDroppableBlockFromElement(newPointedBlock);
			const lastBlockInThisDirection = pointingBlocks[direction];
			if (newPointedBlock === lastBlockInThisDirection) return; // Nothing has changed, try with the next increment
			if (!lastBlockInThisDirection) {
				if (newPointedBlock) {
					pointingBlocks[direction == "left" ? "right" : "left"] = false; // We began outside blocks and we have found a block in this direction, kill the other direction, from now on we only care about finding the inner-most block in this y
					pointedBlock = pointingBlocks[direction] = newPointedBlock;
				} else console.error("This should not happen in $e.ui.blocks.getDropBlockFromPosition");
			} else { // We are coming from being already pointing at a block
				if (!newPointedBlock || !lastBlockInThisDirection.contains(newPointedBlock)) pointingBlocks[direction] = false; // We had found a block in this direction and now we are leaving it, do not continue in this direction
				else pointedBlock = pointingBlocks[direction] = newPointedBlock;
			}
		});
		distance += inc;
	}
	$e.ui.blocks.floating.blockEl.style.pointerEvents = ""; // Re-enable pointer events so it can be used to be added to the view
	
	return pointedBlock;

};