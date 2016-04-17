"use strict";

	/**
	 * Returns the block's height in the given level
	 * This takes into account space between blocks, border heights, etc
	 * @private
	 * @param {String} level Level name
	 * @param {!HTMLElement} div Div element
	 * @return {{width:Number, height:Number}} Block's height in the given level
	 * @example $e_blockSize("level2", document.getElementById("div-123213213"))
	 */
	function $e_blockSize(level, div) {
		var size = { width: div.clientWidth, height: div.clientHeight };
		if (div.lastChild && div.lastChild.tagName === "DIV") {
			// div is a block, check size based on the last child which is always a single element			
			size = { width: div.lastChild.clientWidth, height: div.lastChild.clientHeight };
		}
		if (level == "level1") {
			size.height += 7+1+1; // add border and margin
		} else if (level == "level2" || level == "level3") {
			size.height += 1; // add border and margin
		}
		return size;
	}

	/**
	 * Cancels a block movement or edition
	 * @private
	 * @param {Object} event Event
	 * @example $e_cancelFloatingBlock()
	 */
	function $e_cancelFloatingBlock(event) {
		if ($_eseecode.session.floatingBlock.div) {
			if ($_eseecode.session.floatingBlock.div.parentNode == document.body) { // it could be that the div has been reassigned to the console
				$e_deleteBlock($_eseecode.session.floatingBlock.div);
			}
			if ($_eseecode.session.floatingBlock.fromDiv) {
				$_eseecode.session.floatingBlock.fromDiv.style.opacity = 1;
			}
		}
		$_eseecode.session.floatingBlock.div = null;
		$_eseecode.session.floatingBlock.fromDiv = null;
		$_eseecode.session.floatingBlock.mouse.x = undefined;
		$_eseecode.session.floatingBlock.mouse.y = undefined;
		document.body.removeEventListener("mouseup", $e_unclickBlock, false);
		document.body.removeEventListener("mousemove", $e_moveBlock, false);
		document.body.removeEventListener("touchend", $e_unclickBlock, false);
		document.body.removeEventListener("touchmove", $e_moveBlock, false);
		document.body.removeEventListener("touchcancel", $e_cancelFloatingBlock, false);
		if (event) { // Only do this if it was tiggered by an event
			$_eseecode.session.blocksUndo.pop(); // Sice the edition was cancelled, pop the half-written undo element
		}
	}

	/**
	 * Block clicked listener. It listenes for clicks on blocks and acts accordingly
	 * @private
	 * @param {Object} event Event
	 * @example div.addEventListener(handler,$e_clickBlock, false)
	 */
	function $e_clickBlock(event) {
		if (event && event.which > 0 && event.which != 1) {
			// If its a mouse click attend only to left button
			return;
		}
		if ($_eseecode.session.breakpointHandler) {
			$e_addBreakpointEventEnd(event);
			return;
		}
		$e_unhighlight();
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id
		var div = event.target;
		if (div.tagName !== "DIV") {
			if (div.id.match(/^div-blankspan-/)) {
				event.stopPropagation();
				return;
			} else {
				while (div.tagName !== "DIV") {
					div = div.parentNode;
				}
			}
		}
		var instructionSetId = div.getAttribute("data-instructionsetid");
		var instruction = $_eseecode.instructions.set[instructionSetId];
		while (div && instruction.dummy) {
			div = div.parentNode;
			instructionSetId = div.getAttribute("data-instructionsetid");
			instruction = $_eseecode.instructions.set[instructionSetId];
		}
		if (!div) {
			// This should never happen
			event.stopPropagation();
			return;
		}
		if ($_eseecode.session.floatingBlock.div) {
			// If two blocks are clicked too fast (before the animation is finished), make sure we add the previous one
			$e_unclickBlock();
		}
		var dialog = false;
		if (div.parentNode.id.match(/^dialog-/)) {
			dialog = true;
		}
		$e_cancelFloatingBlock();
		// Cancel click block if it is disabled
		if ($e_isNumber(instruction.maxInstances) && instruction.countInstances >= instruction.maxInstances) {
			if (dialog) { // Make sure the block is not being moved instead of added
				return;
			}
		}
		var blocksUndoIndex = $_eseecode.session.blocksUndo[0]+1;
		if (blocksUndoIndex > $_eseecode.setup.undoDepth) { // never remember more than 20 actions (which means the array has 21 elements, since the first one is the index)
			blocksUndoIndex--;
			$_eseecode.session.blocksUndo.shift();
			$_eseecode.session.blocksUndo[0] = blocksUndoIndex-1;
		}
		$_eseecode.session.blocksUndo[blocksUndoIndex] = { fromDiv: null, fromDivPosition: false, div: null, divPosition: false };
		if (!dialog) {
			$_eseecode.session.floatingBlock.fromDiv = div;
			$_eseecode.session.blocksUndo[blocksUndoIndex].fromDiv = $_eseecode.session.floatingBlock.fromDiv;
			var count = 0;
			var element = document.getElementById("console-blocks").firstChild;
			$_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition = $e_recursiveCount(element, div).count;
		}
		$_eseecode.session.floatingBlock.div = div.cloneNode(true);
		// Remove coundown from floating block
		if (dialog && $_eseecode.session.floatingBlock.div.firstChild.nextSibling) {
			$_eseecode.session.floatingBlock.div.removeChild($_eseecode.session.floatingBlock.div.firstChild.nextSibling)
		}
		var mousePos = $e_eventPosition(event);
		// Try to drag the block pinned from the same position it was clicked
		$_eseecode.session.floatingBlock.mouse.x = mousePos.x - div.getBoundingClientRect().left - window.pageXOffset;
		if ($e_isNumber($_eseecode.session.floatingBlock.mouse.x) && $_eseecode.session.floatingBlock.mouse.x > 0) {
			$_eseecode.session.floatingBlock.mouse.y = mousePos.y - div.getBoundingClientRect().top - window.pageYOffset;
		} else {
			// IE8 and earlier don't support window.pageXOffset, Android WebView (for embedding in Android app), doesn't take into acount scroll in getBoundingClientRect() when zooming
			$_eseecode.session.floatingBlock.mouse.x = undefined;
		}
		// Copy parameters
		for (var i=1; div.getAttribute("data-param"+i) !== null; i++) {
			$_eseecode.session.floatingBlock.div.setAttribute("data-param"+i,div.getAttribute("data-param"+i));
		}
		if (!dialog) {
			$_eseecode.session.floatingBlock.fromDiv.style.opacity = 0.4;
		}
		$_eseecode.session.floatingBlock.div.style.position = "absolute";
		document.body.appendChild($_eseecode.session.floatingBlock.div);
		$_eseecode.session.floatingBlock.div.id = $e_newDivId();
		if ($_eseecode.session.floatingBlock.div.classList) {
			$_eseecode.session.floatingBlock.div.classList.add("floatingBlock");
		} else {			
			$_eseecode.session.floatingBlock.div.className += " floatingBlock";
		}
		$e_paintBlock($_eseecode.session.floatingBlock.div);
		$_eseecode.session.floatingBlock.div.style.opacity = 0.8;
		$e_moveBlock(event);
		$_eseecode.session.floatingBlock.div.removeEventListener("click", $e_clickBlock, false);
		$_eseecode.session.floatingBlock.div.removeEventListener("touchstart", $e_clickBlock, false);
		if (level != "level1") {
			// firefox is unable to use the mouse event handler if it is called from HTML handlers, so here we go
			document.body.addEventListener("mouseup", $e_unclickBlock, false);
			document.body.addEventListener("mousemove", $e_moveBlock, false);
			document.body.addEventListener("touchend", $e_unclickBlock, false);
			document.body.addEventListener("touchmove", $e_moveBlock, false);
			document.body.addEventListener("touchcancel", $e_cancelFloatingBlock, false);
		} else { // In level1 we stick the block immediately
			var consoleDiv = document.getElementById("console-blocks");
			var blockMeasures = $e_blockSize($_eseecode.modes.console[$_eseecode.modes.console[0]].id, $_eseecode.session.floatingBlock.div);
			var blockPosition = $_eseecode.session.floatingBlock.div.getBoundingClientRect();
			var consolePosition = consoleDiv.getBoundingClientRect();
			var diffTop = consolePosition.top - blockPosition.top;
			var diffLeft = consolePosition.left - blockPosition.left;
			var diffHeight = consoleDiv.style.height.replace("px","") - blockMeasures.height;
			var diffWidth = (consolePosition.width?consolePosition.width:367) - blockMeasures.width;
			var animationInterval = 50;
			var animationRepetitions = 8;
			var shadowDiv = document.createElement("div");
			shadowDiv.style.width = blockMeasures.width+"px";
			shadowDiv.style.height = blockMeasures.height+"px";
			shadowDiv.style.border = "3px solid #666666";
			shadowDiv.setAttribute("data-downcounter", animationRepetitions);
			shadowDiv.style.position = "absolute";
			shadowDiv.style.top = blockPosition.top+"px";
			shadowDiv.style.left = blockPosition.left+"px";
			document.body.appendChild(shadowDiv);
			var shadowBlockToConsole = function() {
				var downcounter = parseInt(shadowDiv.getAttribute("data-downcounter"));
				if (downcounter == 0) {
					document.body.removeChild(shadowDiv);
				} else {
					downcounter--;
					var upcounter = animationRepetitions-downcounter;
					shadowDiv.style.top = (blockPosition.top + diffTop/animationRepetitions*upcounter) + "px";
					shadowDiv.style.left = (blockPosition.left + diffLeft/animationRepetitions*upcounter) + "px";
					shadowDiv.style.height = (blockMeasures.height + diffHeight/animationRepetitions*upcounter) + "px";
					shadowDiv.style.width = (blockMeasures.width + diffWidth/animationRepetitions*upcounter) + "px";
					shadowDiv.setAttribute("data-downcounter", downcounter);
					setTimeout(shadowBlockToConsole, animationInterval);
				}
			}
			setTimeout(shadowBlockToConsole, animationInterval);
			setTimeout($e_unclickBlock, animationInterval*animationRepetitions); // We call this appart from the animation instead of when finishing the animation so thatif the animation fails it still runs
		}
		event.stopPropagation();
	}

	/**
	 * Block unclicked listener. It listens for unclicks on blocks and acts accordingly
	 * @private
	 * @param {Object} event Event
	 * @example div.addEventListener(handler,$e_unclickBlock, false)
	 */
	function $e_unclickBlock(event) {
		if (event && event.which > 0 && event.which != 1) {
			// If its a mouse click attend only to left button
			return;
		}
		var blocksUndoIndex = $_eseecode.session.blocksUndo[0]+1;
		var consoleDiv = document.getElementById("console-blocks");
		var div = $_eseecode.session.floatingBlock.div;
		if (!div) {
			// If the floatingBlock has already been added there's nothing to do here (this could happen if two blocks are added before too quickly, before the first block's animation has finished)
			return;
		}
		$_eseecode.session.floatingBlock.div.style.opacity = 1;
		var divId = div.id;
		var action;
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id
		var pos = $e_eventPosition(event);
		if (level == "level1" ||
		    (pos.x > consoleDiv.getBoundingClientRect().left &&
		     pos.x < consoleDiv.getBoundingClientRect().left+consoleDiv.offsetWidth &&
		     pos.y > consoleDiv.getBoundingClientRect().top &&
		     pos.y < consoleDiv.getBoundingClientRect().top+consoleDiv.offsetHeight)) {
			div.style.position = "static";
			if (level == "level1") {
				action = "add";
				$e_addBlock(div,true);
				$_eseecode.session.blocksUndo[blocksUndoIndex].divPosition = consoleDiv.childNodes.length-1;
				setTimeout(function() {
					$e_smoothScroll(consoleDiv, consoleDiv.scrollHeight);
				}, 100); // Scroll down to see the new block. Do it after timeout, since the div scroll size isn't updated until this event is complete
			} else {
				$e_recursiveAddEventListener(div,"mousedown",$e_clickBlock);
				$e_recursiveAddEventListener(div,"touchstart",$e_clickBlock);
				// The block was dropped in the code so we must add it
				// Detect where in the code we must insert the div
				var position = $e_blockPositionFromCoords(consoleDiv, pos);
				$_eseecode.session.blocksUndo[blocksUndoIndex].divPosition = position;
				if (($_eseecode.session.blocksUndo[blocksUndoIndex].divPosition === $_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition) || ($e_isNumber($_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition) && $e_isNumber($_eseecode.session.blocksUndo[blocksUndoIndex].divPosition) && $_eseecode.session.blocksUndo[blocksUndoIndex].divPosition-1 == $_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition)) { // Nothing changed: Note that moving a block right below has no effect
					// We aren't using the floating block
					div = $_eseecode.session.floatingBlock.fromDiv;
					divId = div.id;
					action = "setup";
					if (!$e_setupBlock(div, false)) {
						action = "cancel";
					}
				} else if ($_eseecode.session.floatingBlock.fromDiv && $e_positionIsInBlock(consoleDiv, $_eseecode.session.floatingBlock.fromDiv, position)) {
					div = $_eseecode.session.floatingBlock.fromDiv;
					divId = div.id;
					action = "setup"; // This used to be "cancel" without setup but it may not be intuitive enough
					if (!$e_setupBlock(div, false)) {
						action = "cancel";
					}
				} else {
					$e_addBlock(div,position); // first we add the block, then we delete the old one, otherwise the positioning fails
					if ($_eseecode.session.floatingBlock.fromDiv) { // if the block doesn't come from the Dialog
						action = "move";
						$_eseecode.session.floatingBlock.fromDiv.parentNode.removeChild($_eseecode.session.floatingBlock.fromDiv);
					} else {
						action = "add";
						if (level == "level2" || level == "level3") {
							$e_setupBlock(div, true);
						}
						$e_paintBlock(div);
					}
					$e_scrollToBlock(div, consoleDiv);
				}
			}
			$_eseecode.session.blocksUndo[blocksUndoIndex].div = div;
		} else { // The block is dropped
			if ($_eseecode.session.floatingBlock.fromDiv) { // if the block doesn't come from the Dialog
				var previousBlock = $_eseecode.session.floatingBlock.fromDiv.previousElementSibling;
				var nextBlock = $_eseecode.session.floatingBlock.fromDiv.nextSibling;
				$e_deleteBlock($_eseecode.session.floatingBlock.fromDiv);
				$_eseecode.session.blocksUndo[blocksUndoIndex].divPosition = false;
				$e_roundBlockCorners(previousBlock);
				$e_roundBlockCorners(nextBlock);
				action = "remove";
			} else {
				action = "cancel";
			}
		}
		if ($_eseecode.session.floatingBlock.div) {
			if ($_eseecode.session.floatingBlock.div.classList) {
				$_eseecode.session.floatingBlock.div.classList.remove("floatingBlock");
			} else {			
				$_eseecode.session.floatingBlock.div.className = $_eseecode.session.floatingBlock.div.className.replace(/\s+floatingBlock/,"");
			}
		}
		$e_cancelFloatingBlock();
		if (action == "cancel") {
			$_eseecode.session.blocksUndo.pop();
		} else {
			$_eseecode.session.updateOnConsoleSwitch = "blocks";
			$_eseecode.session.blocksUndo[0] = blocksUndoIndex;
			$_eseecode.session.blocksUndo.splice(blocksUndoIndex+1,$_eseecode.session.blocksUndo.length); // Remove the redo queue
			if (level == "level1") {
				$_eseecode.session.lastChange = new Date().getTime();
				$e_executeFromUI();
			} else if (action != "setup" && action != "add") {
				$_eseecode.session.lastChange = new Date().getTime();
			}
			$e_refreshUndoUI();
		}
	}
	
	/**
	 * Scrolls to the given element in the givent parent node
	 * @private
	 * @param {!HTMLElement} element Block
	 * @param {!HTMLElement} parentDiv Blocks container div
	 * @example $e_scrollToBlock(document.getElementById("div-1231231231"), document.getElementById("console-blocks"))
	 */
	function $e_scrollToBlock(element, parentDiv) {
		var blockHeight;
		if (element.getBoundingClientRect().height) {
			blockHeight = element.getBoundingClientRect().height;
		} else {
			blockHeight = element.getBoundingClientRect().bottom-element.getBoundingClientRect().top;
		}
		setTimeout(function() {
			if (element.offsetTop < parentDiv.scrollTop) {
				$e_smoothScroll(parentDiv, element.offsetTop-10);
			} else if (element.offsetTop+blockHeight > parentDiv.scrollTop+parentDiv.clientHeight) {
				$e_smoothScroll(parentDiv, element.offsetTop-parentDiv.clientHeight+blockHeight+10);
			}
		}, 100); // Scroll appropiately to see the new block. Do it after timeout, since the div scroll size isn't updated until this event is complete
	}
	
	/**
	 * Returns the position where the block has been dropped
	 * @private
	 * @param {!HTMLElement} consoleDiv Blocks console div
	 * @param {Object} coords Coordinates
	 * @param !HTMLElement} [blockElement] Block to start with
	 * @return {Number} Position where the block has been dropped
	 * @example $e_blockPositionFromCoords(document.getElementById("console-blocks"), document.getElementById("div-1231231231"))
	 */
	function $e_blockPositionFromCoords(consoleDiv, coords, blockElement) {
		if (blockElement === undefined) {
			blockElement = consoleDiv.firstChild;
		}
		var position = 0;
		// Check the height of the span, because the block's height includes subblocks
		if (!blockElement || blockElement.id == "console-blocks-tip") {
			// Console is empty
			return 0;
		}
		var blockHeight;
		if (blockElement.firstChild.getBoundingClientRect().height) {
			blockHeight = blockElement.firstChild.getBoundingClientRect().height;
		} else {
			blockHeight = blockElement.firstChild.getBoundingClientRect().bottom-blockElement.firstChild.getBoundingClientRect().top;
		}
		if (coords.y > blockElement.getBoundingClientRect().top+blockHeight/2) {
			position++;
			if (blockElement.firstChild.nextSibling) { // If has subblocks
				position += $e_blockPositionFromCoords(consoleDiv, coords, blockElement.firstChild.nextSibling);
			}
			if (blockElement.nextSibling) {
				position += $e_blockPositionFromCoords(consoleDiv, coords, blockElement.nextSibling);
			}
		}
		return position;
	}

	/**
	 * Returns true if the position-th position in the code is inside div
	 * @private
	 * @param {!HTMLElement} consoleDiv Blocks console div
	 * @param {!HTMLElement} div Block div
	 * @param {Number} position Position to check if it is inside div
	 * @return {Boolean} true if the position-th position in the code is inside div
	 * @example $e_positionIsInBlock(document.getElementById("console-blocks"), document.getElementById("div-1231231231"), 34)
	 */
	function $e_positionIsInBlock(consoleDiv, div, position) {
		var startPos = $e_searchBlockPosition(consoleDiv.firstChild,div).count-1;
		var endPos = $e_searchBlockByPosition(div.firstChild.nextSibling,-1,startPos).count+1;
		return (position >= startPos && position <= endPos);
	}

	/**
	 * Add a listener to a handler in a div and its children recursively
	 * @private
	 * @param {!HTMLElement} div Div to add the listener to
	 * @param {String} handler Event handler to add the listener to
	 * @param {function()} callPointer Function to add the the listener
	 * @example $e_recursiveAddEventListener(document.getElementById("div-1231231231"), "click", $e_clickBlock)
	 */
	function $e_recursiveAddEventListener(div, handler, callPointer) {
		if (!div) {
			return;
		}
		if (div.tagName !== "SPAN" && div.tagName !== "DIV") {
			return;
		}
		if (!div.getAttribute("data-instructionsetid")) {
			return;
		}
		if (div.tagName === "DIV") {
			if (!$_eseecode.instructions.set[div.getAttribute("data-instructionsetid")].dummy) {
				div.addEventListener(handler,callPointer,false);
			}
		}
		$e_recursiveAddEventListener(div.firstChild,handler,callPointer);
		$e_recursiveAddEventListener(div.nextSibling,handler,callPointer);
	}

	/**
	 * Returns in found if targetDiv was found in div and in count the position of targetDiv in div
	 * @private
	 * @param {!HTMLElement} div Block in which to search for targetDiv
	 * @param {!HTMLElement} targetDiv Block to search for in div
	 * @return {{found:Boolean, count:Number}} In found if targetDiv was found in div and in count the position of targetDiv in div
	 * @example $e_recursiveCount(document.getElementById("console-blocks"), document.getElementById("div-1231231231"))
	 */
	function $e_recursiveCount(div, targetDiv) {
		if (!div || (div == targetDiv)) {
			return { count: 0, found: (div == targetDiv) };
		} else if (div.tagName !== "DIV") {
			return $e_recursiveCount(div.nextSibling,targetDiv);
		}
		var count = 1;
		var output = $e_recursiveCount(div.firstChild,targetDiv);
		count += output.count;
		if (!output.found) {
			output = $e_recursiveCount(div.nextSibling,targetDiv);
			count += output.count;
		}
		return { found: output.found, count: count };
	}

	/**
	 * Moves a block with the mouse movemement
	 * @private
	 * @param {Object} event Event
	 * @example document.body.removeEventListener("mousemove", $e_moveBlock, false)
	 */
	function $e_moveBlock(event) {
		event = event ? event : window.event;
		if (!event) {  // firefox doesn't know window.event
			return;
		}
		var div = $_eseecode.session.floatingBlock.div;
		var pos = $e_eventPosition(event);
		var blockHeight, blockWidth;
		if (div.getBoundingClientRect().height) {
			blockHeight = div.getBoundingClientRect().height;
			blockWidth = div.getBoundingClientRect().width;
		} else {
			blockHeight = div.getBoundingClientRect().bottom-div.getBoundingClientRect().top;
			blockWidth = div.getBoundingClientRect().right-div.getBoundingClientRect().left;
		}
		if ($_eseecode.session.floatingBlock.mouse.x !== undefined) {
			div.style.left = pos.x - $_eseecode.session.floatingBlock.mouse.x - 10 +"px"; // -10 is a magic number, it seems to work perfect
			div.style.top = pos.y - $_eseecode.session.floatingBlock.mouse.y +"px";
		} else {
			div.style.left = pos.x - blockWidth/2 +"px";
			div.style.top = pos.y - blockHeight/2 +"px";
		}
		// if mouse is above the console or under the console, scroll. Don't use $e_smoothScroll since it uses a timeout and it will queue up in the events to launch
		var consoleDiv = document.getElementById("console-blocks");
		if (pos.y < consoleDiv.getBoundingClientRect().top) {
			consoleDiv.scrollTop -= 2;
		} else if (pos.y > consoleDiv.getBoundingClientRect().top+consoleDiv.clientHeight) {
			consoleDiv.scrollTop += 2;
		}
		if (event) {
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				return false;
			}
		}
	}

	/**
	 * Adds a block in a position in the blocks console
	 * @private
	 * @param {!HTMLElement} blockDiv Block to add
	 * @param {Boolean|Number} position Position to add the block at. If set to true it adds it at the end
	 * @param {HTMLElement} [parent] If set, blockDiv must be a child of parent. In this case position counts from the parent's position
	 * @param {Boolean] [isConverting] Set to true if the block is being added as part of a level conversion operation
	 * @example $e_addBlock(block, true)
	 */
	function $e_addBlock(blockDiv, position, parent, isConverting) {
		var instructionId = blockDiv.getAttribute("data-instructionsetid");
		var instruction = $_eseecode.instructions.set[instructionId];
		var consoleDiv = document.getElementById("console-blocks");
		// Before adding first block delete console tip
		if (consoleDiv.firstChild && consoleDiv.firstChild.id == "console-blocks-tip") {
			$e_removeBlocksTips();
			// Ensure that we do not add the block with the tip red border
			blockDiv.style.border = "";
			blockDiv.style.marginBottom = "";
		}
		var parentDiv = consoleDiv;
		if (parent) {
			parentDiv = parent;
		}
		var nextDiv = null;
		if (position !== true) {
			// Insert the blockDiv in the appropiate position in the code
			var output = $e_searchBlockByPosition(parentDiv.firstChild,position,0);
			if (output.element) {
				nextDiv = output.element;
				parentDiv = nextDiv.parentNode;
			} else {
				nextDiv = null;
			}
		} else if (parent) {
			var instructionSetId = parentDiv.getAttribute("data-instructionsetid");
			if (instructionSetId && $_eseecode.instructions.set[instructionSetId].block) { // Append child inside the block, before closure
				nextDiv = parentDiv.lastChild;
			}
		}
		if (instruction.block && !blockDiv.firstChild.nextSibling && !instruction.text) { // If we are adding a block to the console for the first time, create its children
			$e_createSubblocks(blockDiv);
		}
		if ($e_isNumber(instruction.maxInstances)) {
			if (!$_eseecode.session.floatingBlock.fromDiv) { // Make sure the block is not being moved instead of added)
				instruction.countInstances++;
				$e_updateBlockCount(instructionId);
			}
		}
		parentDiv.insertBefore(blockDiv, nextDiv); // if it's the last child nextSibling is null so it'll be added at the end of the list
		$e_paintBlock(blockDiv);
		if (!isConverting) {
			$e_updateBlocksBreakpoints(blockDiv, "addBlock");
		}
	}

	/**
	 * Adds a block subblocks
	 * @private
	 * @param {!HTMLElement} blockDiv Block to add
	 * @example $e_createSubblocks(block)
	 */
	function $e_createSubblocks(blockDiv) {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id
		var instruction = $_eseecode.instructions.set[blockDiv.getAttribute("data-instructionsetid")];
		if (instruction.block) {
			var oldChild = blockDiv.firstChild.nextSibling; // The first element inside a BlockDiv is its span title, so we can safely skip it
			var action = "keep";
			var instructionBlockIndex = 0;
			var instructionName = instruction.block[instructionBlockIndex];
			var instructionId = instructionName;
			while (oldChild !== null) {
				var oldInstructionId = oldChild.getAttribute("data-instructionsetid");
				var oldInstruction = $_eseecode.instructions.set[oldInstructionId];
				if (oldInstruction.dummy === true) {
					if (instructionId !== oldInstructionId) {
						action = "delete";
					} else {
						action = "keep";
						instructionBlockIndex++;
						instructionName = instruction.block[instructionBlockIndex];
						instructionId = instructionName;
					}
				}
				var oldChildSibling = oldChild.nextSibling; // we do this because we might delete old child before getting nextSibling
				if (action === "delete") {
					blockDiv.removeChild(oldChild);
				}
				oldChild = oldChildSibling;
			}
			for (var i=instructionBlockIndex; i<instruction.block.length; i++) {
				var instructionName = instruction.block[i];
				var instructionId = instructionName;
				var childDiv = document.createElement("div");
				childDiv.id = $e_newDivId();
				childDiv.setAttribute("data-instructionsetid",instructionId);
				blockDiv.appendChild(childDiv);
				$e_createBlock(level,childDiv);
			}
		}
	}
	
	/**
	 * Returns in found if targetDiv was found in currentDiv or its siblings and in count its position
	 * @private
	 * @param {!HTMLElement} currentDiv Block in which to search for targetDiv
	 * @param {!HTMLElement} targetDiv Block to search for in div
	 * @return {{found:Boolean, count:Number}} In found if targetDiv was found in currentDiv or its siblings and in count its position
	 * @example $e_searchBlockPosition(document.getElementById("console-blocks"), document.getElementById("div-1231231231"))
	 */
	function $e_searchBlockPosition(currentDiv, targetDiv) {
		var count = 0;
		var found = false;
		while (currentDiv && !found) {
			found = (currentDiv == targetDiv);
			if (!found && currentDiv.firstChild.nextSibling) {
				var output = $e_searchBlockPosition(currentDiv.firstChild.nextSibling, targetDiv);
				count += output.count;
				found = output.found
			}
			count++;
			currentDiv = currentDiv.nextSibling;
		}
		return { found: found, count: count };
	}

	/**
	 * Returns the position-th element in element or its siblings. In count it returns the amount of blocks parsed in case the element wasn't found. If position == -1 the size of the element block and its siblings is returned in count
	 * @private
	 * @param {!HTMLElement} element Block in which to search for
	 * @param {Number} position Position to return the block from
	 * @param {Number} count Initial counter (position of element)
	 * @return {{element:HTMLElement, count:Number}} In element the position-th element in element or its siblings. In count it returns the amount of blocks parsed in case the element wasn't found. If position == -1 the size of the element block and its siblings is returned in count
	 * @example $e_searchBlockByPosition(document.getElementById("console-blocks").firstChild, 12, 1)
	 */
	function $e_searchBlockByPosition(element, position, count) {
		while (element && count != position) { // if the code is almost empty position could be far ahead of the last block
			var instruction = $_eseecode.instructions.set[element.getAttribute("data-instructionsetid")];
			if (instruction && instruction.block) {
				var output = $e_searchBlockByPosition(element.firstChild.nextSibling, position, count+1);
				count = output.count-1;
				if (output.element) {
					element = output.element;
				} else {
					element = element.nextSibling;
				}
			} else {
				element = element.nextSibling;
			}
			count++;
		}
		return { element: element, count: count };
	}

	/**
	 * Enables/Disabled dialog blocks when their count reaches maxInstances
	 * @private
	 * @param {!String|!HTMLElement} instruction Instruction id or dialog block
	 * @example $e_updateBlockCount("forward1")
	 */
	function $e_updateBlockCount(instructionObject) {
		if (!instructionObject) {
			return;
		}
		var instructionId, dialogBlock;
		if ((typeof instructionObject) === "string") {
			instructionId = instructionObject;
			// Find the block in the dialog
			dialogBlock = document.getElementById("dialog-blocks").firstChild;
			while (dialogBlock) {
				if (dialogBlock.getAttribute("data-instructionsetid") == instructionId) {
					// Found it
					break;
				}
				dialogBlock = dialogBlock.nextSibling;
			}
		} else {
			instructionId = instructionObject.getAttribute("data-instructionsetid");
			dialogBlock = instructionObject;
		}
		if (!dialogBlock) {
			return;
		}
		var instruction = $_eseecode.instructions.set[instructionId];
		if ($e_isNumber(instruction.maxInstances)) {
			var blockCountSpan = document.getElementById(dialogBlock.id+"-blockCount");
			if (!blockCountSpan) {
				var blockCountSpan = document.createElement("span");
				blockCountSpan.id = dialogBlock.id+"-blockCount";
				blockCountSpan.className = "blockCount";
				blockCountSpan.innerHTML = instruction.maxInstances;
				dialogBlock.appendChild(blockCountSpan);
			}
			blockCountSpan.innerHTML = instruction.maxInstances - instruction.countInstances;
			if (instruction.countInstances >= instruction.maxInstances) {
				dialogBlock.style.opacity = "0.4";
			} else {
				dialogBlock.style.opacity = "1";
			}
		}
	}

	/**
	 * Resets the instances count for all instructions
	 * @private
	 * @example $e_resetInstructionsCount()
	 */
	function $e_resetInstructionsCount() {
		for (var key in $_eseecode.instructions.set) {
			var instruction = $_eseecode.instructions.set[key];
			if ($e_isNumber(instruction.maxInstances)) {
				instruction.countInstances = 0;
			}
		}
	}
	
	/**
	 * Removes a block from the console and deletes it
	 * @private
	 * @param {!HTMLElement} div Block to delete
	 * @example $e_deleteBlock(document.getElementById("div-123123123"))
	 */
	function $e_deleteBlock(div) {
		// We must do this before we delete the block
		$e_updateBlocksBreakpoints(div, "deleteBlock");
		var consoleDiv = document.getElementById("console-blocks");
		var instructionId = div.getAttribute("data-instructionsetid");
		var instruction = $_eseecode.instructions.set[instructionId];
		if ($e_isNumber(instruction.maxInstances) && div != $_eseecode.session.floatingBlock.div) {
			instruction.countInstances--;
			$e_updateBlockCount(instructionId);
		}
		div.parentNode.removeChild(div);
		if (!consoleDiv.firstChild) {
			$e_resetBlocksConsole(consoleDiv);
		}
	}

	/**
	 * Returns a new valid and unique block id
	 * @private
	 * @return {String} A valid and unique block id
	 * @example var id = $e_newDivId()
	 */
	function $e_newDivId() {
		var d = new Date();
		var id = d.getTime()*10000+Math.floor((Math.random()*10000));
		return "div-"+id;
	}

	/**
	 * Asks the user to setup the parameters of the instruction associated with the block
	 * @private
	 * @param {!HTMLElement} div Block div
	 * @param {Boolean} blockAdd Whether the block is being added or modified
	 * @return {Boolean} true if the setup dialog was shown, false otherwise
	 * @example $e_setupBlock(document.getElementById("div-123123123"))
	 */
	function $e_setupBlock(div, blockAdd) {
		var returnVal = true;
		var instruction = $_eseecode.instructions.set[div.getAttribute("data-instructionsetid")];
		if (instruction.dummy && instruction.parameters === null) {
			// This is a subblock, configure its parent node
			div = div.parentNode;
			instruction = $_eseecode.instructions.set[div.getAttribute("data-instructionsetid")];
		}
		if (instruction.noChange) {
			returnVal = false;
			return returnVal;
		}
		var instructionName = instruction.name;
		var parameterInputs = [];
		var paramNumber = 1; // parameters[0] is "param1"
		for (var i=0; i<instruction.parameters.length; i++) {
			var parameter = instruction.parameters[i];
			parameterInputs[i] = {};
			for (var key in parameter) {
				parameterInputs[i][key] = parameter[key];
			}
			parameterInputs[i].name = _(parameter.name);
			parameterInputs[i].id = paramNumber;
			var defaultValue = parameter.initial;
			if (div.getAttribute("data-param"+paramNumber) !== undefined) {
				defaultValue = div.getAttribute("data-param"+paramNumber);
			} else {
				// Only check predefined values if coming from programmer instruction set initializations
				defaultValue = $e_parsePredefinedConstants(defaultValue);
			}
			if (parameter.type == "number") {
				if (defaultValue !== "" && defaultValue !== undefined && defaultValue !== null) {
					if ($e_isNumber(defaultValue, true)) {
						defaultValue = parseFloat(defaultValue);
					}
				} else {
					defaultValue = "";
				}
			}
			parameterInputs[i].initial = defaultValue;
			paramNumber++;
		}
		if (parameterInputs.length > 0 || instruction.convert) {		
			// We have parameters to ask for. Create a msgBox
			var instructionSetId = div.getAttribute("data-instructionsetid");
			var instruction = $_eseecode.instructions.set[instructionSetId];
			var instructionName = instruction.name;
			var msgDiv = document.createElement("div");
			msgDiv.className = "msgBox-tab";
			var input = document.createElement("input");
			input.id = "setupBlockDiv";
			input.value = div.id;
			input.type = "hidden";
			msgDiv.appendChild(input);
			input = document.createElement("input");
			input.id = "setupBlockAdd";
			input.value = blockAdd;
			input.type = "hidden";
			msgDiv.appendChild(input);
			var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id
			if (instruction.convert) {
				var convertDiv = document.createElement("div");
				var span = document.createElement("span");
				span.innerHTML = _("Convert to another instruction")+": ";
				convertDiv.appendChild(span);
				var element = document.createElement("select");
				element.id = "setupBlockConvert";
				element.innerHTML = "<option value='"+div.getAttribute("data-instructionsetid")+"' selected=\"selected\">"+instruction.name+"</option>";
				for (var i = 0; i < instruction.convert.length; i++) {
					var convertInstruction = instruction.convert[i];
					element.innerHTML += "<option value='"+convertInstruction+"'>"+convertInstruction+"</option>";
				}
				convertDiv.appendChild(element);
				msgDiv.appendChild(convertDiv);
			}
			var msgTab = document.createElement("div");
			msgTab.className = "msgBox-tabs";
			msgTab.innerHTML = "<a id=\"setupBlockTabsBasic\" href=\"#\" onclick=\"$e_setupBlockVisual(true);\">"+_("Switch to basic setup")+"</a> <a id=\"setupBlockTabsAdvanced\" href=\"#\" onclick=\"$e_setupBlockVisual(false);\">"+_("Switch to advanced setup")+"</a>";
			if (!blockAdd) {
				msgTab.innerHTML += " <a id=\"setupBlockTabsDuplicate\" href=\"#\" onclick=\"$e_duplicateBlock();\" class=\"outsider\">"+_("Duplicate block")+"</a></div>";
			}
			msgDiv.appendChild(msgTab);
			var msgContent = document.createElement("div");
			var iconDiv = document.createElement("div");
			iconDiv.id = "setupBlockIcon";
			iconDiv.className = "block";
			iconDiv.style.float = "left";
			iconDiv.setAttribute("data-instructionsetid", instructionSetId);
			var icon = document.createElement("canvas");
			$e_paintBlock(iconDiv, false, false);
			iconDiv.appendChild(icon);
			msgContent.appendChild(iconDiv);
			for (var i=0; i<parameterInputs.length; i++) {
				var parameter = parameterInputs[i];
				var textDiv = document.createElement("div");
				var helpText = "";
				if (level != "level2") {
					helpText += _("Enter the value for %s's %s parameter",[instructionName+(parameter.noBrackets?"":"()"), $e_ordinal(parameter.id)])+" \""+_(parameter.name)+"\":\n";
				}
				var tipTrans = _(parameter.tip);
				if (parameter.tip) {
					helpText += "<b>"+tipTrans;
				}
				helpText += "</b>"
				if (tipTrans && tipTrans.charAt(tipTrans.length-1) != '?') {
					helpText += ":";
				}
				helpText += "<br />";
				var span = document.createElement("span");
				span.innerHTML += helpText;
				textDiv.appendChild(span);
				input = document.createElement("input");
				input.id = "setupBlock"+parameter.id;
				input.value = parameter.initial;
				input.type = "text";
				input.style.width = "100px";
				var div = document.createElement("div");
				div.id = input.id+"Visual";
				textDiv.appendChild(div);
				textDiv.appendChild(input);
				input = document.createElement("input");
				input.id = "setupBlock"+parameter.id+"Default";
				input.value = parameter.initial;
				input.type = "hidden";
				textDiv.appendChild(input);
				msgContent.appendChild(textDiv);
			}
			input = document.createElement("input");
			input.id = "setupBlockCount";
			input.value = parameterInputs.length;
			input.type = "hidden";
			msgContent.appendChild(input);
			msgDiv.appendChild(msgContent);
			$e_msgBox(msgDiv, {acceptAction:$e_setupBlockAccept,cancelAction:$e_setupBlockCancel,focus:"setupBlock"+parameterInputs[0].id});
			if (level === "level2") {
				$e_setupBlockVisual(true, instruction.parameters);
			} else {
				$e_setupBlockVisual(false, instruction.parameters);
			}
		} else {
			if ($_eseecode.session.blocksUndo[$_eseecode.session.blocksUndo[0]+1].fromDiv) { // Check this is a block setup, not a block add
				// Nothing to setup so don't update undo stack
				returnVal = false;
			}
		}
		return returnVal;
	}

	/**
	 * Duplicates a block in the code
	 * @private
	 * @example $e_duplicateBlock()
	 */
	function $e_duplicateBlock() {
		// Duplicate the block
		var divId = document.getElementById("setupBlockDiv").value;
		var div = document.getElementById(divId);
		var newDiv = div.cloneNode(true);
		newDiv.id = $e_newDivId();
		div.parentNode.insertBefore(newDiv, div.nextSibling); // Insert after current block
		$e_addBlockEventListeners($_eseecode.modes.console[$_eseecode.modes.console[0]].id, newDiv, undefined, false, true);
		// Swap the id in setup dialog so the new setup is applied to the new block, not to the original block
		document.getElementById("setupBlockDiv").value = newDiv.id;
		$e_setupBlockAccept();
		var blocksUndoIndex = ++$_eseecode.session.blocksUndo[0];
		$_eseecode.session.blocksUndo[blocksUndoIndex] = {};
		$_eseecode.session.blocksUndo[blocksUndoIndex].div = newDiv;
		$_eseecode.session.blocksUndo[blocksUndoIndex].divPosition = $e_recursiveCount(document.getElementById("console-blocks").firstChild, newDiv).count;
	}
	
	/**
	 * Adds or removes the visual parameters setup in parameters setup dialog
	 * @private
	 * @param {Boolean} visualMode Whether to show visual setup or not
	 * @example $e_setupBlockVisual(true)
	 */
	function $e_setupBlockVisual(visualMode) {
		var iconDiv = document.getElementById("setupBlockIcon");
		if (visualMode) {
			iconDiv.style.display = "block";
		} else {
			iconDiv.style.display = "none";
		}
		var blockDiv = document.getElementById(document.getElementById("setupBlockDiv").value);
		var instruction = $_eseecode.instructions.set[blockDiv.getAttribute("data-instructionsetid")];
		var parameters = instruction.parameters;
		var parametersCount = document.getElementById("setupBlockCount").value;
		var updateIcon = function() {
			// First we search which is the last parameter with value, so we use "undefined" with all unset
			// parameters up to it and don't set the parameters at all after it
			var lastParameterWithValue = -1;
			for (var i=parametersCount-1; i>=0 && lastParameterWithValue<0; i--) {
				if (document.getElementById("setupBlock"+(i+1)).value !== "") {
					lastParameterWithValue = i;
				}
			}
			iconDiv.innerHTML = "";	
			for (var i=0; i<parametersCount; i++) {
				if (i <= lastParameterWithValue) {
					iconDiv.setAttribute("data-param"+(i+1),document.getElementById("setupBlock"+(i+1)).value);
				} else {
					iconDiv.removeAttribute("data-param"+(i+1));
				}
			}
			$e_paintBlock(iconDiv, false, false);
		}
		var supportedInputs = { range: false, number: false, color: false };
		var testDiv = document.createElement("input");
		for (var key in supportedInputs) {
			try {
				testDiv.type = key;
			} catch (excepion) {
				// input.type = ... can throw exception in IE9 and below if the type is unsupported
			}
			if (testDiv.getAttribute("type") === key) {
				supportedInputs[key] = true;
			}
		}
		for (var i=0; i<parametersCount; i++) {
			var parameter = parameters[i];
			var parameterInputId = "setupBlock"+(i+1);
			var input = document.getElementById(parameterInputId);
			var div = document.getElementById(parameterInputId+"Visual");
			div.innerHTML = "";
			if (visualMode) {
				input.style.display = "none";
			} else {
				input.style.display = "block";
				continue;
			}
			var defaultValue = input.value;
			var visualTypeSupportedByBrowser = false;
			var element;
			if (parameter.type === "text" || parameter.type === "layer") {
				visualTypeSupportedByBrowser = true;
				element = document.createElement("div");
				element.id = parameterInputId+"Block";
				var input = document.createElement("input");
				input.id = parameterInputId+"VisualInput";
				input.type = "text";
				if (defaultValue !== undefined && defaultValue !== "") {
					if (defaultValue.charAt(0) === '"' && defaultValue.charAt(defaultValue-1) === '"') {
						defaultValue = defaultValue.substring(1,defaultValue.length-1);
					}
					input.value = defaultValue;
				} else if (parameter.initial !== undefined) {
					input.value = parameter.initial;
				}
				var changeFunction = function() {
					var parameterInputId = this.parentNode.id.match(/setupBlock[0-9]+/)[0];
					document.getElementById(parameterInputId).value = '"'+this.value+'"';
					updateIcon();
				};
				input.addEventListener("change", changeFunction, false);
				input.addEventListener("keyup", changeFunction, false);
				element.appendChild(input);
			} else if (parameter.type === "font") {
				visualTypeSupportedByBrowser = true;
				var fonts = ["monospace", "serif", "sans-serif", "fantasy", "Arial", "Arial Black", "Arial Narrow", "Arial Rounded MT Bold", "Bookman Old Style", "Bradley Hand ITC", "Century", "Century Gothic", "Comic Sans MS", "Courier", "Courier New", "Georgia", "Gentium", "Impact", "King", "Lucida Console", "Lalit", "Modena", "Monotype Corsiva", "Papyrus", "Tahoma", "TeX", "Times", "Times New Roman", "Trebuchet MS", "Verdana", "Verona" ];
				var fontDetect = new Detector();
				visualTypeSupportedByBrowser = true;
				element = document.createElement("div");
				element.id = parameterInputId+"Block";
				var input = document.createElement("select");
				input.id = parameterInputId+"VisualInput";
				for (var j = 0; j < fonts.length; j++) {
					if (fontDetect.detect(fonts[j])) {
						input.innerHTML += "<option value='"+j+"'>"+fonts[j]+"</option>";
					}
				}
				if (defaultValue !== undefined && defaultValue !== "") {
					for (var j = 0; j < fonts.length; j++) {
						if ('"'+fonts[j]+'"' === defaultValue) {
							input.value = j;
						}
					}
				} else if (parameter.initial !== undefined) {
					input.value = parameter.initial;
				}
				input.addEventListener("change", function() {
					var parameterInputId = this.parentNode.id.match(/setupBlock[0-9]+/)[0];
					document.getElementById(parameterInputId).value = '"'+fonts[this.value]+'"';
					updateIcon();
				}, false);
				element.appendChild(input);
			} else if (parameter.type === "number") {
				element = document.createElement("div");
				element.id = parameterInputId+"Block";
				if (supportedInputs["range"]) {
					visualTypeSupportedByBrowser = true;
					var useSlider = false;
					var minValue = $e_parsePredefinedConstants(parameter.minValue);
					var maxValue = $e_parsePredefinedConstants(parameter.maxValue);
					if (minValue !== undefined && maxValue !== undefined) {
						useSlider = true;
					}
					var stepValue = 1;
					if (parameter.stepValue !== undefined) {
						stepValue = parameter.stepValue;
					}
					var valueEscalation = 1;
					if (stepValue < 1) {
						// Number inputs only accept integers, so escalate
						valueEscalation = 1/stepValue;
					}
					var elementMinus = document.createElement("input");
					elementMinus.type = "button";
					elementMinus.value = "-";
					elementMinus.style.width = "50px";
					elementMinus.setAttribute("data-valueescalation", valueEscalation);
					elementMinus.addEventListener("click", function() {
						var valueEscalation = parseFloat(this.getAttribute("data-valueescalation"));
						var parameterInputId = this.parentNode.parentNode.id.match(/setupBlock[0-9]+/)[0];
						var elem = document.getElementById(parameterInputId+"VisualInput");
						var val;
						if ($e_isNumber(elem.value,true)) {
							val = parseFloat(elem.value);
						} else if (elem.getAttribute("min")) {
							val = elem.getAttribute("min")
						} else if (elem.getAttribute("max")) {
							val = elem.getAttribute("max");
						} else {
							val = 0;
						}
						var stepValue = 1;
						if (elem.step !== undefined) {
							stepValue = parseFloat(elem.step);
						}
						elem.value = (parseFloat(val)*valueEscalation - stepValue*valueEscalation)/valueEscalation; // This calculation (using valueEscalation) avoids javascript's float imprecision with calculations
						if (elem.getAttribute("min") && parseFloat(elem.value) < elem.getAttribute("min")) {
							elem.value = elem.getAttribute("min");
						}
						try {
							elem.dispatchEvent(new Event('change'));
						} catch(err) {
							// IE doesn't support the previous method
							var event = document.createEvent('Event');
							event.initEvent('change', true, true);
							elem.dispatchEvent(event);
						}
					}, false);
					element.appendChild(elementMinus);
					if (useSlider) {
						var elementInput = document.createElement("input");
						elementInput.id = parameterInputId+"VisualInput";
						elementInput.setAttribute("type", "range");
						elementInput.setAttribute("step", stepValue*valueEscalation);
						if (defaultValue !== undefined && defaultValue !== "") {
							elementInput.value = defaultValue*valueEscalation;
						} else if (parameter.initial !== undefined) {
							elementInput.value = parameter.initial*valueEscalation;
						}
						elementInput.setAttribute("min", (minValue<maxValue?minValue:maxValue)*valueEscalation);
						elementInput.setAttribute("max", (minValue>maxValue?minValue:maxValue)*valueEscalation);
						elementInput.setAttribute("data-valueescalation", valueEscalation);
						elementInput.addEventListener("change", function() {
							var parameterInputId = this.parentNode.parentNode.id.match(/setupBlock[0-9]+/)[0];
							document.getElementById(parameterInputId+"VisualSpan").innerHTML = this.value/parseFloat(this.getAttribute("data-valueescalation"));
							document.getElementById(parameterInputId).value = this.value/parseFloat(this.getAttribute("data-valueescalation"));
							updateIcon();
						}, false);
						var elementText = document.createElement("span");
						elementText.className = "helpNote";
						elementText.innerHTML = minValue;
						element.appendChild(elementText);
						element.appendChild(elementInput);
						elementText = document.createElement("span");
						elementText.className = "helpNote";
						elementText.innerHTML = maxValue;
						element.appendChild(elementText);
					} else {
						var elementInput = document.createElement("input");
						elementInput.id = parameterInputId+"VisualInput";
						elementInput.setAttribute("type", "number");
						if (defaultValue !== undefined && defaultValue !== "") {
							elementInput.value = defaultValue;
						} else if (parameter.initial !== undefined) {
							elementInput.value = parameter.initial;
						}
						if (minValue !== undefined) {
							elementInput.setAttribute("min", (minValue<maxValue?minValue:maxValue)*valueEscalation);
						}
						if (maxValue !== undefined) {
							elementInput.setAttribute("max", (minValue>maxValue?minValue:maxValue)*valueEscalation);
						}
						elementInput.setAttribute("data-valueescalation", valueEscalation);
						elementInput.setAttribute("step", stepValue);
						elementInput.addEventListener("change", function() {
							var parameterInputId = this.parentNode.parentNode.id.match(/setupBlock[0-9]+/)[0];
							document.getElementById(parameterInputId).value = this.value;
							updateIcon();
						}, false);
						element.appendChild(elementInput);
					}
					var elementPlus = document.createElement("input");
					elementPlus.type = "button";
					elementPlus.value = "+";
					elementPlus.style.width = "50px";
					elementPlus.setAttribute("data-valueescalation", valueEscalation);
					elementPlus.addEventListener("click", function() {
						var valueEscalation = parseFloat(this.getAttribute("data-valueescalation"));
						var parameterInputId = this.parentNode.parentNode.id.match(/setupBlock[0-9]+/)[0];
						var elem = document.getElementById(parameterInputId+"VisualInput");
						var val;
						if ($e_isNumber(elem.value,true)) {
							val = parseFloat(elem.value);
						} else if (elem.getAttribute("min")) {
							val = elem.getAttribute("min");
						} else if (elem.getAttribute("max")) {
							val = elem.getAttribute("max");
						} else {
							val = 0;
						}
						var stepValue = 1;
						if (elem.step !== undefined) {
							stepValue = parseFloat(elem.step);
						}
						elem.value = (parseFloat(val)*valueEscalation + stepValue*valueEscalation)/valueEscalation; // This calculation (using valueEscalation) avoids javascript's float imprecision with calculations
						if (elem.getAttribute("max") && parseFloat(elem.value) > elem.getAttribute("max")) {
							elem.value = elem.getAttribute("max");
						}
						try {
							elem.dispatchEvent(new Event('change'));
						} catch(err) {
							// IE doesn't support the previous method
							var event = document.createEvent('Event');
							event.initEvent('change', true, true);
							elem.dispatchEvent(event);
						}
					}, false);
					element.appendChild(elementPlus);
					if (useSlider) {
						var elementSpace = document.createElement("span");
						elementSpace.innerHTML = "  ";
						element.appendChild(elementSpace);
						var elementSpan = document.createElement("span");
						elementSpan.id = parameterInputId+"VisualSpan";
						if (defaultValue !== undefined && defaultValue !== "") {
							elementSpan.innerHTML = defaultValue;
						} else if (parameter.initial !== undefined) {
							input.value = parameter.initial;
						}
						element.appendChild(elementSpan);
					}
				}
			} else if (parameter.type === "bool") {
				visualTypeSupportedByBrowser = true;
				element = document.createElement("div");
				element.id = parameterInputId+"Block";
				var input = document.createElement("select");
				input.id = parameterInputId+"VisualInput";
				input.innerHTML = "<option value='true'>"+_("true")+"</option><option value='false'>"+_("false")+"</option>";
				if (defaultValue !== undefined && defaultValue !== "") {
					if (defaultValue === "false") {
						input.value = "false";
					} else if (defaultValue === "true") {
						input.value = "true";
					}
				} else if (parameter.initial !== undefined) {
					input.value = parameter.initial.toString();
				}
				input.addEventListener("change", function() {
					var parameterInputId = this.parentNode.id.match(/setupBlock[0-9]+/)[0];
					document.getElementById(parameterInputId).value = (this.value === "false")?false:true;
					updateIcon();
				}, false);
				element.appendChild(input);
			} else if (parameter.type === "color") {
				visualTypeSupportedByBrowser = true;
				element = document.createElement("div");
				element.id = parameterInputId+"Block";
				var input = document.createElement("input");
				input.id = parameterInputId+"VisualInput";
				if (supportedInputs["color"]) {
					input.setAttribute("type", "color");
				} else {
					// Use jsColor
					input.className = "color";
					jscolor.color(input, {});
				}
				if (defaultValue !== undefined && defaultValue !== "") {
					var value = defaultValue;
					if (value.charAt(0) == '"') {
						value = value.substring(1,value.length-1);
					}
					input.value = value;
				} else if (parameter.initial !== undefined) {
					input.value = parameter.initial;
				}
				input.addEventListener("change", function() {
					var parameterInputId = this.parentNode.id.match(/setupBlock[0-9]+/)[0];
					var value = this.value;
					if (value.charAt(0) === "#") {
						value = '"'+value+'"';
					} else if (value.charAt(1) === "#") {
						// Old Chrome versions will change type to "color" but use text input, so check for # in second char
						value = value;
					} else {
						value = '"#'+value+'"';
					}
					document.getElementById(parameterInputId).value = value;
					updateIcon();
				}, false);
				element.appendChild(input);
			} else if (parameter.type == "parameters") {
				visualTypeSupportedByBrowser = true;
				element = document.createElement("div");
				element.id = parameterInputId+"Block";
				div.appendChild(element); // We need to add the element earlier to access subelements wih getElementById
				var input = document.createElement("input");
				input.id = parameterInputId+"VisualInput";
				input.style.display = "none";
				element.appendChild(input);
				// Parse parameters
				var subelement, subinput;
				// This function is called when generating the div and also when clicking the Add button
				var functionParameterAdd = function(defaultParamValue) {
					if ((typeof defaultParamValue) !== "string") {
						// When it is called from an event, parameterInputId has no value and defaultParamValue contains the event
						parameterInputId = defaultParamValue.target.id.match(/setupBlock[0-9]+/)[0];
						defaultParamValue = "";
					}
					var numParam;
					for (numParam=0; document.getElementById(parameterInputId+"BlockParm"+numParam); numParam++);
					var element = document.getElementById(parameterInputId+"Block");
					var subelement = document.createElement("div");
					var subparameterId = parameterInputId+"BlockParm"+numParam;
					subelement.id = subparameterId;
					element.appendChild(subelement);
					var subinput = document.createElement("input");
					subinput.id = subparameterId+"Input";
					subinput.value = defaultParamValue;
					var updateFunction = function(parameterInputId) {
						var paramValue = document.getElementById(parameterInputId+"BlockParm0Input").value;
						for (var k=1; document.getElementById(parameterInputId+"BlockParm"+k+"Input"); k++) {
							var subparameterValue = document.getElementById(parameterInputId+"BlockParm"+k+"Input").value;
							if (subparameterValue.length > 0) {
								paramValue += ", " + subparameterValue;
							}
						}
						document.getElementById(parameterInputId).value = paramValue;
						updateIcon();
					};
					var changeFunction = function(event) {
						var subparameterId = event.target.id.match(/setupBlock[0-9]+BlockParm[0-9]+/)[0];
						var parameterInputId = subparameterId.match(/setupBlock[0-9]+/)[0];
						var paramNum = subparameterId.match(/BlockParm[0-9]+/)[0].match(/[0-9]+/)[0];
						paramNum = paramNum;
						var paramInput = document.getElementById(subparameterId+"Input");
						var paramValue = paramInput.value.replace(",",""); // Do not accept ","
						paramInput.value = paramValue;
						var lastParameter;
						for (lastParameter=1; document.getElementById(parameterInputId+"BlockParm"+lastParameter); lastParameter++); // Param0 exists for sure
						lastParameter--;
						if (paramNum == lastParameter) { // One is string the other int, so check with ==
							if (paramValue !== "") {
								document.getElementById(parameterInputId+"BlockAddButton").style.visibility = "visible";
							} else {
								document.getElementById(parameterInputId+"BlockAddButton").style.visibility = "hidden";
							}
						}
						updateFunction(parameterInputId);
					};
					var clickFunctionParameterRemove = function(event) {
						var removeDiv = event.target.parentNode;
						var removeDivId = removeDiv.id;
						var parameterInputId = removeDivId.match(/setupBlock[0-9]+/)[0];
						var paramNum = removeDivId.match(/BlockParm[0-9]+/)[0].match(/[0-9]+/)[0];
						removeDiv.parentNode.removeChild(removeDiv);
						var k;
						for (k=parseInt(paramNum)+1; document.getElementById(parameterInputId+"BlockParm"+k); k++) {
						console.log(k)
							document.getElementById(parameterInputId+"BlockParm"+k).id = parameterInputId+"BlockParm"+(k-1);
							document.getElementById(parameterInputId+"BlockParm"+k+"Input").id = parameterInputId+"BlockParm"+(k-1)+"Input";
						}
						var lastParm = k - 2;
						if (lastParm === 0) {
							document.getElementById(parameterInputId+"BlockParm0").getElementsByClassName("buttonRemove")[0].style.visibility = "hidden";
						}
						updateFunction(parameterInputId);
					};
					subinput.addEventListener("change", changeFunction, false);
					subinput.addEventListener("keyup", changeFunction, false);
					subelement.appendChild(subinput);
					var removeIcon = document.createElement("span");
					removeIcon.innerHTML = "-";
					removeIcon.className = "buttonRemove";
					removeIcon.addEventListener("click", clickFunctionParameterRemove, false);
					removeIcon.addEventListener("touchstart", clickFunctionParameterRemove, false);
					subelement.appendChild(removeIcon);
					if (numParam === 0) { // If there's only one parameter it can't be removed
						removeIcon.style.visibility = "hidden";
					} else {
						// There are two or more parameters so the first parameter can be removed
						document.getElementById(parameterInputId+"BlockParm0").getElementsByClassName("buttonRemove")[0].style.visibility = "visible";
					}
					var blockAddDiv = document.getElementById(parameterInputId+"BlockAddButton");
					if (blockAddDiv) {
						blockAddDiv.style.visibility = "hidden";
					}
					updateFunction(parameterInputId);
				};
				// Generate parameter inputs from value
				var value = "";
				if (defaultValue !== undefined && defaultValue !== "") {
					value = defaultValue;
				} else if (parameter.initial !== undefined) {
					value = parameter.initial;
				}
				input.value = value;
				value = value.split(",");
				var j;
				for (j=0; j<value.length; j++) {
					functionParameterAdd(value[j].trim());
				}
				// Create the Add button
				subelement = document.createElement("div");
				subelement.id = parameterInputId+"BlockAdd";
				div.appendChild(subelement);
				subinput = document.createElement("input"); // This input is just to add up the space to align the Remove and the Add icons
				subinput.style.visibility = "hidden";
				subelement.appendChild(subinput);
				var addIcon = document.createElement("span");
				addIcon.id = parameterInputId+"BlockAddButton";
				addIcon.innerHTML = "+";
				addIcon.className = "buttonAdd";
				addIcon.style.visibility = "hidden"; // Use visibility:hidden instead of display:none so it will position correctly when shown
				addIcon.addEventListener("click", functionParameterAdd, false);
				addIcon.addEventListener("touchstart", functionParameterAdd, false);
				subelement.appendChild(addIcon);
			} else if (parameter.type == "var") {
				visualTypeSupportedByBrowser = true;
				element = document.createElement("div");
				element.id = parameterInputId+"Block";
				var input = document.createElement("input");
				input.id = parameterInputId+"VisualInput";
				input.type = "text";
				if (defaultValue !== undefined && defaultValue !== "") {
					input.value = defaultValue;
				} else if (parameter.initial !== undefined) {
					input.value = parameter.initial;
				}
				var changeFunction = function() {
					var parameterInputId = this.parentNode.id.match(/setupBlock[0-9]+/)[0];
					document.getElementById(parameterInputId).value = this.value;
					updateIcon();
				};
				input.addEventListener("change", changeFunction, false);
				input.addEventListener("keyup", changeFunction, false);
				element.appendChild(input);
			}
			if (!visualTypeSupportedByBrowser) {
				element = document.createElement("input");
				element.style.width = "480px";
				element.addEventListener("change", function() {
					var parameterInputId = this.parentNode.id.match(/setupBlock[0-9]+/)[0];
					document.getElementById(parameterInputId).value = this.value;
					updateIcon();
				}, false);
			}
			if (!element.parentNode) {
				// In some cases we need to add the element earlier to access subelements wih getElementById
				div.appendChild(element);
			}
			if (parameter.optional) {
				element = document.createElement("div");
				element.id = parameterInputId+"Toggle";
				var input = document.createElement("input");
				input.type = "checkbox";
				input.id = parameterInputId+"ToggleInput"
				var span = document.createElement("span");
				span.innerHTML = _("Leave without value");
				element.appendChild(input);
				element.appendChild(span);
				input.addEventListener("change", function() {
					var parameterInputId = this.parentNode.parentNode.id.match(/setupBlock[0-9]+/)[0];
					if (this.checked) {
						document.getElementById(parameterInputId).value = "";
						document.getElementById(parameterInputId+"Block").style.display = "none";
					} else {
						document.getElementById(parameterInputId).value = document.getElementById(parameterInputId+"VisualInput").value;
						document.getElementById(parameterInputId+"Block").style.display = "block";
					}
					updateIcon();
				}, false);
				div.appendChild(element);
				if (document.getElementById(parameterInputId).value === "") {
					input.checked = true;
					document.getElementById(parameterInputId+"Block").style.display = "none";
				}
			}
		}
		if (visualMode) {
			document.getElementById("setupBlockTabsBasic").className = "hide";
			document.getElementById("setupBlockTabsAdvanced").className = "headerButton";
		} else {
			document.getElementById("setupBlockTabsBasic").className = "headerButton";
			document.getElementById("setupBlockTabsAdvanced").className = "hide";
		}
		updateIcon();
	}
	
	/**
	 * Round the corners of a block according to its context
	 * @private
	 * @param {!HTMLElement} div Block div
	 * @example $e_roundBlockCorners(document.getElementById("div-123523423434"))
	 */
	function $e_roundBlockCorners(div) {
		if (!div || div.tagName != "DIV") {
			return;
		}
		if (div.id === "setupBlockIcon") {
			return;
		}
		var width = div.getBoundingClientRect().width;
		if (width) {
			var borderRadius = 10;
			var previous = div.previousElementSibling;
			var next = div.nextSibling;
			var isFunction;
			if (div.className.match(/\bfunction\b/)) {
				isFunction = true;
			} else {
				isFunction = false;
			}
			if (!previous || previous.tagName != "DIV" || isFunction ) {
				if (previous && isFunction) {
					previous.style.borderBottomRightRadius = borderRadius+"px";
					previous.style.borderBottomLeftRadius = borderRadius+"px";
				}
				div.style.borderTopRightRadius = borderRadius+"px";
				div.style.borderTopLeftRadius = borderRadius+"px";
			} else {
				var previousWidth = previous.getBoundingClientRect().width;
				if (previousWidth > width) {
					previous.style.borderBottomRightRadius = Math.min(previousWidth-width,borderRadius)+"px";
					div.style.borderTopRightRadius = "";
				} else if (width > previousWidth) {
					previous.style.borderBottomRightRadius = "";
					div.style.borderTopRightRadius = Math.min(width-previousWidth,borderRadius)+"px";
				} else {
					previous.style.borderBottomRightRadius = "";
					div.style.borderTopRightRadius = "";
				}
				previous.style.borderBottomLeftRadius = "";
				div.style.borderTopLeftRadius = "";
			}
			if (!next || next.className.match(/\bdummyBlock\b/) || isFunction) {
				div.style.borderBottomRightRadius = borderRadius+"px";
				div.style.borderBottomLeftRadius = borderRadius+"px";
				if (next && isFunction) {
					next.style.borderTopRightRadius = borderRadius+"px";
					next.style.borderTopLeftRadius = borderRadius+"px";
				}
			} else {
				var nextWidth = next.getBoundingClientRect().width;
				if (nextWidth > width) {
					div.style.borderBottomRightRadius = "";
					next.style.borderTopRightRadius = Math.min(nextWidth-width,borderRadius)+"px";;
				} else if (width > nextWidth) {
					div.style.borderBottomRightRadius = Math.min(width-nextWidth,borderRadius)+"px";
					next.style.borderTopRightRadius = "";
				} else {
					div.style.borderBottomRightRadius = "";
					next.style.borderTopRightRadius = "";
				}
				div.style.borderBottomLeftRadius = "";
				next.style.borderTopLeftRadius = "";
			}
		}
	}

	/**
	 * Takes the parameters from a msgBox and applies them in the block. You probably want to call msgBoxClose() here
	 * @see setupBlock
	 * @see $e_msgBoxClose
	 * @private
	 * @param {Object} event Event
	 * @example $e_setupBlockAccept()
	 */
	function $e_setupBlockAccept(event) {
		var setupChanges = [];
		var divId = document.getElementById("setupBlockDiv").value;
		var div = document.getElementById(divId);
		var parametersCount = document.getElementById("setupBlockCount").value;
		var instructionId = div.getAttribute("data-instructionsetid");
		var instruction = $_eseecode.instructions.set[instructionId];
		var blocksUndoIndex = $_eseecode.session.blocksUndo[0];
		var instructionConverted = false;
		if (document.getElementById("setupBlockConvert")) {
			var newInstructionId = document.getElementById("setupBlockConvert").value;
			if (newInstructionId != instructionId) {
				instructionConverted = true;
				var newDiv = div.cloneNode(true);
				var newDivId = $e_newDivId();
				newDiv.setAttribute("id", newDivId);	
				$e_addBlockEventListeners($_eseecode.modes.console[$_eseecode.modes.console[0]].id, newDiv, newInstructionId)
				instructionId = newInstructionId;
				newDiv.setAttribute("data-instructionsetid",instructionId);
				$e_createSubblocks(newDiv);
				div.parentNode.insertBefore(newDiv, div);
				div.parentNode.removeChild(div);
				$_eseecode.session.blocksUndo[blocksUndoIndex].div = newDiv;
				div = newDiv;
				divId = newDivId;
			}
		}
		var paramNumber = 1;
		for (var i=0; i<parametersCount; i++) {
			if (instruction.parameters[i] && instruction.parameters[i].validate) {
				var value = document.getElementById("setupBlock"+paramNumber).value;
				if (!instruction.parameters[i].validate(value)) {
					$e_msgBox(_("The value for parameter \"%s\" is invalid!",[_(instruction.parameters[i].name)]));
					return;
				}
			}
			paramNumber++;
		}
		// First we search which is the last parameter with value, so we use "undefined" with all unset
		// parameters up to it and don't set the parameters at all after it
		var lastParameterWithValue = -1;
		for (var i=parametersCount-1; i>=0 && lastParameterWithValue<0; i--) {
			if (document.getElementById("setupBlock"+(i+1)).value !== "") {
				lastParameterWithValue = i;
			}
		}
		paramNumber = 1;
		for (var i=0; i<parametersCount; i++) {
			var inputElement = document.getElementById("setupBlock"+paramNumber);
			var value = inputElement.value;
			if (inputElement.className === "color") {
				value = "#"+value;
			}
			var defaultValue = document.getElementById("setupBlock"+paramNumber+"Default").value;
			if (i <= lastParameterWithValue) {
				div.setAttribute("data-param"+paramNumber, value);
			} else {
				div.removeAttribute("data-param"+paramNumber);
			}
			setupChanges.push(["data-param"+paramNumber, defaultValue, value]);
			paramNumber++;
		}
		if (setupChanges.length > 0) {
			$_eseecode.session.lastChange = new Date().getTime();
			if (document.getElementById("setupBlockAdd").value !== "true") {
				// Update undo array
				$_eseecode.session.blocksUndo[blocksUndoIndex].parameters = setupChanges;
			}
		} else if (instructionConverted) {
			$_eseecode.session.lastChange = new Date().getTime();
			// Already saved the div into the undo stack earlier
		} else if ($_eseecode.session.blocksUndo[blocksUndoIndex].fromDiv) {
			// If nothing changed don't update undo stack
			$_eseecode.session.blocksUndo.pop();
			$_eseecode.session.blocksUndo[0]--;
			$e_refreshUndoUI();
		} else if (document.getElementById("setupBlockAdd").value === "true") {
			$_eseecode.session.lastChange = new Date().getTime();
		}
		// Update the block icon
		$e_paintBlock(div);
		$e_msgBoxClose();
	}

	/**
	 * Cancels a setupBlock. You probably want to call $e_msgBoxClose() here
	 * @see setupBlock
	 * @see $e_msgBoxClose
	 * @private
	 * @param {Object} event Event
	 * @example $e_setupBlockCancel()
	 */
	function $e_setupBlockCancel(event) {
		if (document.getElementById("setupBlockAdd").value === "true") {
			var divId = document.getElementById("setupBlockDiv").value;
			var div = document.getElementById(divId);
			$e_deleteBlock(div);
		}
		$_eseecode.session.blocksUndo.pop();
		$_eseecode.session.blocksUndo[0]--;
		$e_refreshUndoUI();
		$e_msgBoxClose();
	}

	/**
	 * Given a block and an instruction it sets up the block
	 * @private
	 * @param {String} level Current level name
	 * @param {!HTMLElement} div Block div
	 * @param {String} instructionSetId Id of the instruction in $_eseecode.instructions.set
	 * @param {Boolean} [dialog=false] Whether or not the block is in the dialog window
	 * @example $e_createBlock("level2", document.body.createElement("div"), 3)
	 */
	function $e_createBlock(level, div, instructionSetId, dialog) {
		var codeId;
		if (instructionSetId == null) { // If no instructionSetId is passed we just want to update the block
			instructionSetId = div.getAttribute("data-instructionsetid");
			codeId = div.id;
		} else { // This is a block that didn't exist before
			codeId = $e_newDivId();
			div.setAttribute("id", codeId);
			div.setAttribute("data-instructionsetid", instructionSetId);
		}
		var instruction = $_eseecode.instructions.set[instructionSetId];
		div.className = "block "+level+" "+instruction.name;
		$e_paintBlock(div,dialog);
		$e_addBlockEventListeners(level, div, instructionSetId, dialog);
	}

	/**
	 * Creates the event listeners of a block
	 * @private
	 * @param {String} level Current level name
	 * @param {!HTMLElement} div Block div
	 * @param {String} instructionSetId Id of the instruction in $_eseecode.instructions.set
	 * @param {Boolean} [dialog=false] Whether or not the block is in the dialog window
	 * @param {Boolean} [recursive=false] Whether or not to recurisvely add the listeners to all children
	 * @example $e_addBlockEventListeners("level2", document.body.createElement("div"))
	 */
	
	function $e_addBlockEventListeners(level, div, instructionSetId, dialog, recursive) {
		if (!div || div.tagName != "DIV") {
			return;
		}
		if (instructionSetId === undefined) {
			instructionSetId = div.getAttribute("data-instructionsetid");
		}
		var instruction = $_eseecode.instructions.set[instructionSetId];
		if (instruction.dummy) {
			return;
		}
		if (dialog) {
			div.addEventListener("mousedown", $e_clickBlock, false);
			div.addEventListener("touchstart", $e_clickBlock, false);
		} else {
			if (level == "level1") {
				div.removeEventListener("mousedown", $e_clickBlock, false);
				div.removeEventListener("touchstart", $e_clickBlock, false);
			} else if (level == "level2" || level == "level3") {
				div.addEventListener("mousedown", $e_clickBlock, false);
				div.addEventListener("touchstart", $e_clickBlock, false);
			}
		}
		if (recursive) {
			if (recursive === true) {
				recursive = 1;
			}
			if (div.firstChild) {
				$e_addBlockEventListeners(level, div.firstChild, undefined, dialog, recursive+1);
			}
			if (recursive !== true && div.nextSibling) {
				$e_addBlockEventListeners(level, div.nextSibling, undefined, dialog, recursive+1);
			}
		}
	}

	/**
	 * Sets up the shape, color and icon of a block
	 * @private
	 * @param {!HTMLElement} div Block div
	 * @param {Boolean} [dialog=false] Whether or not the block is in the dialog window
	 * @param {Boolean} [skipRecursiveRepaint=false] Whether or not skip the repainting of the blocks' children
	 * @example $e_paintBlock(document.getElementById("div-123123123"), false, true)
	 */
	function $e_paintBlock(div, dialog, skipRecursiveRepaint) {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id;
		var instructionId = div.getAttribute("data-instructionsetid");
		var instruction = $_eseecode.instructions.set[instructionId];
		var color = "transparent"; // default color
		var searchCategoryForColor = instruction.category;
		if (instruction.category == "internal" && div.parentNode) {
			var parentInstruction = $_eseecode.instructions.set[div.parentNode.getAttribute("data-instructionsetid")];
			if (parentInstruction && parentInstruction.block) {
				searchCategoryForColor = parentInstruction.category;
			}
		}
		for (var i=0; i<$_eseecode.instructions.categories.length; i++) {
			if (searchCategoryForColor == $_eseecode.instructions.categories[i].name) {
				color = $_eseecode.instructions.categories[i].color;
				break;
			}
		}
		if (instruction.dummy) {
			if (div.classList) {
				div.classList.add("dummyBlock");
			} else {
				div.className += " dummyBlock";
			}
		}
		if (instruction.code && instruction.code.unindent) {
			div.style.marginLeft = "0px";
		}
		var output = $e_loadParameters(level, div, dialog);
		var text = output.text;
		// We must first creat the inner text so the div expands its width if necessary
		var span = document.createElement("span");
		span.style.color = $e_readableText(color);
		if (!instruction.dummy) {
			span.style.minHeight = $_eseecode.setup.blockHeight[level]+"px";
		} else {
			span.style.minHeight = "15px";
		}
		span.style.fontFamily = "Arial";
		if (level == "level3") {
			span.style.fontSize = "13px";
			span.style.paddingLeft = "5px";
			span.style.paddingRight = "5px";
		} else {
			span.style.fontSize = "10px";
			span.style.paddingLeft = "";
			span.style.paddingRight = "";
		}
		span.style.fontWeight = "bold";
		span.className = "blockTitle";
		if (level == "level1") {
			span.style.display = "none";
		}
		span.innerHTML = text;
		if (div.firstChild) {
			var firstChild = div.firstChild;
			div.insertBefore(span,firstChild);
			if (firstChild.tagName === "SPAN") {
				div.removeChild(firstChild);
			}
		} else {
			div.appendChild(span);
		}
		div.style.minWidth = $_eseecode.setup.blockWidth[level]+"px";
		if (!instruction.dummy) {
			div.style.minHeight = $_eseecode.setup.blockHeight[level]+"px";
		} else {
			div.style.minHeight = "15px";
		}
		div.setAttribute("title", text+((dialog && instruction.tip)?": "+_(instruction.tip):"")); // help for blind people
		if (!instruction.dummy) {
			var bgWidth = div.clientWidth;
			var bgHeight = div.clientHeight;
			var bgCanvas = document.createElement("canvas");
			bgCanvas.setAttribute("width", bgWidth);
			bgCanvas.setAttribute("height", bgHeight);
			var bgCtx = bgCanvas.getContext("2d");
			bgCtx.fillStyle = color;
			bgCtx.fillRect(0,0,bgWidth,bgHeight);
			if (!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)) {
				// There is a bug in IE11 where it fails to show transparent gradients on canvas. See https://connect.microsoft.com/IE/feedback/details/828441 . This hack works around the bug
				if (color.charAt(0) == "#") {
					var r = color.substr(1,2);
					var g = color.substr(3,2);
					var b = color.substr(5,2);
					if (level == "level1" || level == "level2") {
						var gradient = bgCtx.createRadialGradient(bgWidth/2,bgHeight/2,bgHeight,bgWidth/3,bgHeight/3,bgHeight/4);
						gradient.addColorStop(0,'rgb(150,150,150)');
						gradient.addColorStop(1,'rgb('+parseInt(r,16)+','+parseInt(g,16)+','+parseInt(b,16)+')');
						bgCtx.fillStyle = gradient;
						bgCtx.beginPath();
						bgCtx.fillRect(0,0,bgWidth,bgHeight);
						bgCtx.closePath();
						bgCtx.fill();
					} else if (level == "level3") {
						var gradient = bgCtx.createLinearGradient(0,0,0,bgHeight);
						gradient.addColorStop(0,'rgb(120,120,120)');
						gradient.addColorStop(0.5,'rgb('+parseInt(r,16)+','+parseInt(g,16)+','+parseInt(b,16)+')');
						gradient.addColorStop(1,'rgb(120,120,120)');
						bgCtx.fillStyle = gradient;
						bgCtx.fillRect(0,0,bgWidth,bgHeight);
					}
				} else {
						bgCtx.fillStyle = color;
						bgCtx.fillRect(0,0,bgWidth,bgHeight);
				}
			} else {
				if (level == "level1" || level == "level2") {
					var gradient = bgCtx.createRadialGradient(bgWidth/2,bgHeight/2,bgHeight*1.5,bgWidth/3,bgHeight/3,bgHeight/4);
					gradient.addColorStop(0.0,'rgba(0,0,0,1)');
					gradient.addColorStop(1.0,'rgba(0,0,0,0)');
					bgCtx.fillStyle = gradient;
					bgCtx.beginPath();
					bgCtx.arc(bgWidth/2,bgHeight/2,bgHeight,2*Math.PI,0,false);
					bgCtx.closePath();
					bgCtx.fill();
				} else if (level == "level3") {
					var gradient = bgCtx.createLinearGradient(0,0,0,bgHeight);	
					gradient.addColorStop(0.0,'rgba(0,0,0,0.25)');
					gradient.addColorStop(0.5,'rgba(0,0,0,0)');
					gradient.addColorStop(1.0,'rgba(0,0,0,0.25)');
					bgCtx.fillStyle = gradient;
					bgCtx.fillRect(0,-bgHeight*2,bgWidth,bgHeight*3);
				}
			}
			var height = parseInt(div.style.minHeight.replace("px",""));
			var width = parseInt(div.style.minWidth.replace("px",""));
			if ((level == "level1" || level == "level2") && $_eseecode.instructions.icons[instruction.name]) {
				$_eseecode.instructions.icons[instruction.name](bgCtx, width, height, output.parameters);
			}
/*
			bgCtx.font="bold 10px Arial";
			bgCtx.fillStyle = $e_readableText(color);
			bgCtx.fillText(text,1,12);
*/
			div.style.backgroundImage = "url("+bgCanvas.toDataURL()+")";
			if (!dialog) {
				$e_roundBlockCorners(div);
			} else {
				if ($e_isNumber(instruction.maxInstances)) {
					$e_updateBlockCount(instructionId);
				}
			}
		}
		if (!skipRecursiveRepaint) {
			while (div.parentNode && div.parentNode.getAttribute("data-instructionsetid")) {
				div = div.parentNode;
				$e_paintBlock(div,dialog,true);
			}
		}
	}

	/**
	 * Undoes/Redoes the last action in the block undo pile
	 * @private
	 * @param {Boolean} [redo] Whether we want to redo or undo
	 * @example $e_undoBlocks()
	 */
	function $e_undoBlocks(redo) {
		var blocksUndoIndex = $_eseecode.session.blocksUndo[0];
		var undo, oldDiv, newDiv, oldPosition, newPosition, newIndex;
		if (redo) {
			undo = $_eseecode.session.blocksUndo[blocksUndoIndex+1];
		} else {
			undo = $_eseecode.session.blocksUndo[blocksUndoIndex];
		}
		if (!undo) {
			return;
		}
		if (undo.parameters) {
			var div = undo.div;
			var newParm;
			if (redo) {
				newParm = 2;
			} else {
				newParm = 1;
			}
			for (var i=0; i<undo.parameters.length; i++) {
				var parameter = undo.parameters[i];
				if (parameter[newParm] !== "") {
					div.setAttribute(parameter[0],parameter[newParm]);
				} else {
					div.removeAttribute(parameter[0]);
				}
			}
			$e_paintBlock(div);
		} else {
			if (redo) {
				newDiv = undo.div;
				oldDiv = undo.fromDiv;
				newPosition = undo.divPosition + 1;
				oldPosition = undo.fromDivPosition;
				if (newPosition > oldPosition) {
					// Since we'll be deleting the old block from above the new position we need to shift the position
					newPosition--;
				}
			} else {
				newDiv = undo.fromDiv;
				oldDiv = undo.div;
				newPosition = undo.fromDivPosition;
				oldPosition = undo.divPosition;
			}
			if (oldDiv) {
				$e_deleteBlock(oldDiv);
			}
			if (newDiv) {
				$e_addBlock(newDiv,newPosition);
			}
		}
		if (redo) {
			$_eseecode.session.blocksUndo[0]++;
		} else {
			$_eseecode.session.blocksUndo[0]--;
		}
		if ($_eseecode.modes.console[$_eseecode.modes.console[0]].id == "level1") {
			$e_executeFromUI();
		}
	}

	/**
	 * Initializes/Resets the blocks undo pile in $_eseecode.session.blocksUndo
	 * @private
	 * @example $e_resetUndoBlocks()
	 */
	function $e_resetUndoBlocks() {
		$_eseecode.session.blocksUndo = [0];
	}

