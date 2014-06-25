"use strict";

	/**
	 * Returns the block's height in the given level
	 * This takes into account space between blocks, border heights, etc
	 * @private
	 * @param {String} level Level name
	 * @param {!HTMLElement} div Div element
	 * @return {{width:Number, height:Number}}
	 * @example blockSize("level2", document.getElementById("div-123213213"))
	 */
	function blockSize(level, div) {
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
	 * @example cancelFloatingBlock()
	 */
	function cancelFloatingBlock(event) {
		if (event && event.type == "keydown") {
			if (event.keyCode != 27) {
				return;
			}
		}
		if ($_eseecode.session.floatingBlock.div) {
			if ($_eseecode.session.floatingBlock.div.parentNode == document.body) { // it could be that the div has been reassigned to the console
				deleteBlock($_eseecode.session.floatingBlock.div);
			}
			if ($_eseecode.session.floatingBlock.fromDiv) {
				$_eseecode.session.floatingBlock.fromDiv.style.opacity = 1;
			}
		}
		$_eseecode.session.floatingBlock.div = null;
		$_eseecode.session.floatingBlock.fromDiv = null;
		if (!isTouchDevice()) {
			document.body.removeEventListener("mouseup", unclickBlock, false);
			document.body.removeEventListener("mousemove", moveBlock, false);
			document.body.removeEventListener("keydown", cancelFloatingBlock, false);
		} else {
			document.body.removeEventListener("touchend", unclickBlock, false);
			document.body.removeEventListener("touchmove", moveBlock, false);
			document.body.removeEventListener("touchcancel", cancelFloatingBlock, false);
		}
		if (event) { // Only do this if it was tiggered by an event
			$_eseecode.session.blocksUndo.pop(); // Sice the edition was cancelled, pop the half-written undo element
		}
	}

	/**
	 * Block clicked listener. It listenes for clicks on blocks and acts accordingly
	 * @private
	 * @param {Object} event Event
	 * @example div.addEventListener(handler,clickBlock)
	 */
	function clickBlock(event) {
		if ($_eseecode.session.breakpointHandler) {
			addBreakpointEvent(event);
			return;
		}
		unhighlight();
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
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
		var instructionSetId = div.getAttribute("instructionSetId");
		var instruction = $_eseecode.instructions.set[instructionSetId];
		while (div && instruction.dummy) {
			div = div.parentNode;
			instructionSetId = div.getAttribute("instructionSetId");
			instruction = $_eseecode.instructions.set[instructionSetId];
		}
		if (!div) {
			// This should never happen
			event.stopPropagation();
			return;
		}
		var dialog = false;
		if (div.parentNode.id.match(/^dialog-/)) {
			dialog = true;
		}
		cancelFloatingBlock();
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
			$_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition = recursiveCount(element, div).count;
		}
		$_eseecode.session.floatingBlock.div = div.cloneNode(true);
		// Copy parameters
		for (var i=1; div.getAttribute("param"+i) !== null; i++) {
			$_eseecode.session.floatingBlock.div.setAttribute("param"+i,div.getAttribute("param"+i));
		}
		if (!dialog) {
			$_eseecode.session.floatingBlock.fromDiv.style.opacity = 0.4;
		}
		$_eseecode.session.floatingBlock.div.style.position = "absolute";
		document.body.appendChild($_eseecode.session.floatingBlock.div);
		$_eseecode.session.floatingBlock.div.id = newDivId();
		if ($_eseecode.session.floatingBlock.div.classList) {
			$_eseecode.session.floatingBlock.div.classList.add("floatingBlock");
		} else {			
			$_eseecode.session.floatingBlock.div.className += " floatingBlock";
		}
		paintBlock($_eseecode.session.floatingBlock.div);
		moveBlock();
		var handler;
		if (!isTouchDevice()) {
			handler = "click";
		} else {
			handler = "touchstart";
		}
		$_eseecode.session.floatingBlock.div.removeEventListener(handler,clickBlock);
		if (level != "level1") {
			// firefox is unable to use the mouse event handler if it is called from HTML handlers, so here we go
			if (!isTouchDevice()) {
				document.body.addEventListener("mouseup", unclickBlock, false);
				document.body.addEventListener("mousemove", moveBlock, false);
				document.body.addEventListener("keydown", cancelFloatingBlock, false);
			} else {
				document.body.addEventListener("touchend", unclickBlock, false);
				document.body.addEventListener("touchmove", moveBlock, false);
				document.body.addEventListener("touchcancel", cancelFloatingBlock, false);
			}
		} else { // In level1 we stick the block immediately
			unclickBlock();
		}
		event.stopPropagation();
	}

	/**
	 * Block unclicked listener. It listenes for unclicks on blocks and acts accordingly
	 * @private
	 * @param {Object} event Event
	 * @example div.addEventListener(handler,unclickBlock)
	 */
	function unclickBlock(event) {
		var blocksUndoIndex = $_eseecode.session.blocksUndo[0]+1;
		var consoleDiv = document.getElementById("console-blocks");
		var div = $_eseecode.session.floatingBlock.div;
		var divId = div.id;
		var action;
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var pos = eventPosition(event);
		if (level == "level1" ||
		    (pos.x > consoleDiv.offsetLeft &&
		     pos.x < consoleDiv.offsetLeft+consoleDiv.offsetWidth &&
		     pos.y > consoleDiv.offsetTop &&
		     pos.y < consoleDiv.offsetTop+consoleDiv.offsetHeight)) {
			div.style.position = "static";
			if (level == "level1") {
				action = "add";
				addBlock(div,true);
				$_eseecode.session.blocksUndo[blocksUndoIndex].divPosition = consoleDiv.childNodes.length-1;
				setTimeout(function() {
					smoothScroll(consoleDiv, consoleDiv.scrollHeight);
				}, 100); // Scroll down to see the new block. Do it after timeout, since the div scroll size isn't updated until this event is complete
			} else {
				var handler;
				if (!isTouchDevice()) {
					handler = "mousedown";
				} else {
					handler = "touchstart";
				}
				recursiveAddEventListener(div,handler,clickBlock);
				// The block was dropped in the code so we must add it
				// Detect where in the code we must insert the div
				var blockHeight = blockSize(level, div).height;
				var position = (pos.y-consoleDiv.offsetTop+consoleDiv.scrollTop)/blockHeight;
				position += 0.5; // +0.5 to allow click upper half of block to insert above, lower half of block to insert below
				position = Math.floor(position);
				$_eseecode.session.blocksUndo[blocksUndoIndex].divPosition = position;
				if (($_eseecode.session.blocksUndo[blocksUndoIndex].divPosition === $_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition) || (isNumber($_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition) && isNumber($_eseecode.session.blocksUndo[blocksUndoIndex].divPosition) && $_eseecode.session.blocksUndo[blocksUndoIndex].divPosition-1 == $_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition)) { // Nothing changed: Note that moving a block right below has no effect
					action = "setup";
					// We aren't using the floating block
					div = $_eseecode.session.floatingBlock.fromDiv;
					divId = div.id;
					var setupChanges = setupBlock(div);
					if (setupChanges.length > 0) {
						// Update undo array
						$_eseecode.session.blocksUndo[blocksUndoIndex].parameters = setupChanges;
						// Update the block icon
						paintBlock(div);
					} else {
						action = "cancel";
					}
				} else if ($_eseecode.session.floatingBlock.fromDiv && positionIsInBlock(consoleDiv, $_eseecode.session.floatingBlock.fromDiv, position)) {
					action = "cancel";
				} else {
					addBlock(div,position); // first we add the block, then we delete the old one, otherwise the positioning fails
					if ($_eseecode.session.floatingBlock.fromDiv) { // if the block doesn't come from the Dialog
						action = "move";
						$_eseecode.session.floatingBlock.fromDiv.parentNode.removeChild($_eseecode.session.floatingBlock.fromDiv);
					} else {
						action = "add";
						if (level == "level2" || level == "level3") {
							setupBlock(div);
						}
						paintBlock(div);
					}
					setTimeout(function() {
						var blockHeight = blockSize($_eseecode.modes.console[$_eseecode.modes.console[0]].name, div).height;
						if (position*blockHeight < consoleDiv.scrollTop) {
							smoothScroll(consoleDiv, position*blockHeight-10);
						} else if ((position+1)*blockHeight > consoleDiv.scrollTop+consoleDiv.clientHeight) {
							smoothScroll(consoleDiv, (position+1)*blockHeight-consoleDiv.clientHeight+10);
						}
					}, 100); // Scroll appropiately to see the new block. Do it after timeout, since the div scroll size isn't updated until this event is complete
				}
			}
			$_eseecode.session.blocksUndo[blocksUndoIndex].div = div;
		} else { // The block is dropped
			if ($_eseecode.session.floatingBlock.fromDiv) { // if the block doesn't come from the Dialog	
				$_eseecode.session.floatingBlock.fromDiv.parentNode.removeChild($_eseecode.session.floatingBlock.fromDiv);
				$_eseecode.session.blocksUndo[blocksUndoIndex].divPosition = false;
			} else {
				action = "cancel";
			}
		}
		if ($_eseecode.session.floatingBlock.div.classList) {
			$_eseecode.session.floatingBlock.div.classList.remove("floatingBlock");
		} else {			
			$_eseecode.session.floatingBlock.div.className = $_eseecode.session.floatingBlock.div.className.replace(/\s+floatingBlock/,"");
		}
		cancelFloatingBlock();
		if (action == "cancel") {
			$_eseecode.session.blocksUndo.pop();
		} else {
			$_eseecode.session.changesInCode = "blocks";
			$_eseecode.session.blocksUndo[0] = blocksUndoIndex;
			$_eseecode.session.blocksUndo.splice(blocksUndoIndex+1,$_eseecode.session.blocksUndo.length); // Remove the redo queue
			if (level == "level1") {
				execute(true);
			}
		}
	}

	/**
	 * Returns true if the position-th position in the code is inside div
	 * @private
	 * @param {!HTMLElement} consoleDiv Blocks console div
	 * @param {!HTMLElement} div Block div
	 * @param {Number} position Position to check if it is inside div
	 * @return {Boolean}
	 * @example positionIsInBlock(document.getElementById("console-blocks"), document.getElementById("div-1231231231"), 34)
	 */
	function positionIsInBlock(consoleDiv, div, position) {
		var startPos = searchBlockPosition(consoleDiv.firstChild,div).count-1;
		var endPos = searchBlockByPosition(div.firstChild.nextSibling,-1,startPos).count;
		return (position >= startPos && position <= endPos);
	}

	/**
	 * Add a listener to a handler in a div and its children recursively
	 * @private
	 * @param {!HTMLElement} div Div to add the listener to
	 * @param {String} handler Event handler to add the listener to
	 * @param {function()} callPointer Function to add the the listener
	 * @example recursiveAddEventListener(document.getElementById("div-1231231231"), "click", clickBlock)
	 */
	function recursiveAddEventListener(div, handler, callPointer) {
		if (!div) {
			return;
		}
		if (div.tagName !== "SPAN" && div.tagName !== "DIV") {
			return;
		}
		if (div.tagName === "DIV") {
			if (!$_eseecode.instructions.set[div.getAttribute("instructionSetId")].dummy) {
				div.addEventListener(handler,callPointer);
			}
		}
		recursiveAddEventListener(div.firstChild,handler,callPointer);
		recursiveAddEventListener(div.nextSibling,handler,callPointer);
	}

	/**
	 * Returns in found if targetDiv was found in div and in count the position of targetDiv in div
	 * @private
	 * @param {!HTMLElement} div Block in which to search for targetDiv
	 * @param {!HTMLElement} targetDiv Block to search for in div
	 * @return {{found:Boolean, count:Number}}
	 * @example recursiveCount(document.getElementById("console-blocks"), document.getElementById("div-1231231231"))
	 */
	function recursiveCount(div, targetDiv) {
		if (!div || (div == targetDiv)) {
			return { count: 0, found: (div == targetDiv) };
		} else if (div.tagName !== "DIV") {
			return recursiveCount(div.nextSibling,targetDiv);
		}
		var count = 1;
		var output = recursiveCount(div.firstChild,targetDiv);
		count += output.count;
		if (!output.found) {
			output = recursiveCount(div.nextSibling,targetDiv);
			count += output.count;
		}
		return { found: output.found, count: count };
	}

	/**
	 * Moves a block with the mouse movemement
	 * @private
	 * @param {Object} event Event
	 * @example document.body.removeEventListener("mousemove", moveBlock, false)
	 */
	function moveBlock(event) {
		event = event ? event : window.event;
		if (!event) {  // firefox doesn't know window.event
			return;
		}
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var div = $_eseecode.session.floatingBlock.div;
		var pos = eventPosition(event);
		div.style.left = pos.x*1 - $_eseecode.setup.blockWidth[level]/2 +"px";
		div.style.top = pos.y*1 - $_eseecode.setup.blockHeight[level]/2 +"px";
		// if mouse is above the console or under the console, scroll. Don't use smoothScroll since it uses a timeout and it will queue up in the events to launch
		var consoleDiv = document.getElementById("console-blocks");
		if (pos.y < consoleDiv.offsetTop) {
			consoleDiv.scrollTop -= 2;
		} else if (pos.y > consoleDiv.offsetTop+consoleDiv.clientHeight) {
			consoleDiv.scrollTop += 2;
		}
		if (isTouchDevice() && event) { // default action in touch devices is scroll
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
	 * @example addBlock(block, true)
	 */
	function addBlock(blockDiv, position, parent) {
		var consoleDiv = document.getElementById("console-blocks");
		// Before adding first block delete console tip
		if (consoleDiv.firstChild && consoleDiv.firstChild.id == "console-blocks-tip") {
			consoleDiv.innerHTML = "";
		}
		var parentDiv = consoleDiv;
		if (parent) {
			parentDiv = parent;
		}
		var nextDiv = null;
		if (position !== true) {
			// Insert the blockDiv in the appropiate position in the code
			var output = searchBlockByPosition(parentDiv.firstChild,position,0);
			if (output.element) {
				nextDiv = output.element;
				parentDiv = nextDiv.parentNode;
			} else {
				nextDiv = null;
			}
		} else if (parent) {
			var instructionSetId = parentDiv.getAttribute("instructionSetId");
			if (instructionSetId && $_eseecode.instructions.set[instructionSetId].block) { // Append child inside the block, before closure
				nextDiv = parentDiv.lastChild;
			}
		}
		var instruction = $_eseecode.instructions.set[blockDiv.getAttribute("instructionSetId")];
		if (instruction.block && !blockDiv.firstChild.nextSibling && !instruction.text) { // If we are adding a block to the console for the first time, create its children
			var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
			for (var i=0; i<instruction.block.length; i++) {
				var instructionName = instruction.block[i];
				var childDiv = document.createElement("div");
				childDiv.id = newDivId();
				childDiv.setAttribute("instructionSetId",getInstructionSetIdFromName(instructionName));
				blockDiv.appendChild(childDiv);
				createBlock(level,childDiv);
			}
		}
		parentDiv.insertBefore(blockDiv, nextDiv); // if it's the last child nextSibling is null so it'll be added at the end of the list
		paintBlock(blockDiv);
	}

	/**
	 * Returns in found if targetDiv was found in currentDiv or its siblings and in count its position
	 * @private
	 * @param {!HTMLElement} currentDiv Block in which to search for targetDiv
	 * @param {!HTMLElement} targetDiv Block to search for in div
	 * @return {{found:Boolean, count:Number}}
	 * @example searchBlockPosition(document.getElementById("console-blocks"), document.getElementById("div-1231231231"))
	 */
	function searchBlockPosition(currentDiv, targetDiv) {
		var count = 0;
		var found = false;
		while (currentDiv && !found) {
			found = (currentDiv == targetDiv);
			if (!found && currentDiv.firstChild.nextSibling) {
				var output = searchBlockPosition(currentDiv.firstChild.nextSibling, targetDiv);
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
	 * @return {{element:HTMLElement, count:Number}}
	 * @example searchBlockByPosition(document.getElementById("console-blocks").firstChild, 12, 1)
	 */
	function searchBlockByPosition(element, position, count) {
		while (element && count != position) { // if the code is almost empty position could be far ahead of the last block
			var instruction = $_eseecode.instructions.set[element.getAttribute("instructionSetId")];
			if (instruction.block) {
				var output = searchBlockByPosition(element.firstChild.nextSibling, position, count+1);
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
	 * Removes a block from the console and deletes it
	 * @private
	 * @param {!HTMLElement} div Block to delete
	 * @example deleteBlock(document.getElementById("div-123123123"))
	 */
	function deleteBlock(div) {
		var consoleDiv = document.getElementById("console-blocks");
		div.parentNode.removeChild(div);
		if (!consoleDiv.firstChild) {
			resetBlocksConsole(consoleDiv);
		}
	}

	/**
	 * Returns a new valid and unique block id
	 * @private
	 * @return {String}
	 * @example var id = newDivId()
	 */
	function newDivId() {
		var d = new Date();
		var id = d.getTime()*10000+Math.floor((Math.random()*10000));
		return "div-"+id;
	}

	/**
	 * Asks the user to setup the parameters of the instruction associated with the block. Returns a list of parameter changes in an array with the format ["param"+paramNumber, old_value, new_value]
	 * @private
	 * @param {!HTMLElement} div Block div
	 * @return {Array<String, String, String>}
	 * @example setupBlock(document.getElementById("div-123123123"))
	 */
	function setupBlock(div) {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var instruction = $_eseecode.instructions.set[div.getAttribute("instructionSetId")];
		var instructionName = instruction.name;
		var setupChanges = [];
		var paramNumber = 1; // parameters[0] is usually "param1"
		for (var i=0; i<instruction.parameters.length; i++) {
			var parameter = instruction.parameters[i];
			var parameterName = _(parameter.name);
			var defaultValue = parameter.default;
			var value = undefined;
			if (i==0 && instruction.validate) {
				paramNumber = 0;
				// This instruction requires an identifier
				if (div.getAttribute("param"+paramNumber)) {
					defaultValue = div.getAttribute("param"+paramNumber);
				} else {
					// Do not offer any default for identifiers
					defaultValue = "";
				}
				do {
					value = window.prompt(_("Enter a text to use as %s. The %s should easily relate to the use you are going to give to the block",[parameterName,parameterName])+":",defaultValue);
					if (value === null) {
						if (defaultValue) {
							value = defaultValue;
						} else {
							var d = new Date();
							value = instructionName+"_"+(d.getTime()*100+Math.floor(Math.random()*100)).toString(26);
						}
					}
				} while (!instruction.validate(value));
				div.setAttribute("param"+paramNumber,value);
				if (value !== defaultValue) {
					setupChanges.push([ "param"+paramNumber, defaultValue, value ]);
				}
				paramNumber++;
				continue;
			}
			var helpText = ordinal(paramNumber)+" "+_("enter the value for %s's parameter",[instructionName+"()"])+" \""+parameterName+"\"";
			if (div.getAttribute("param"+paramNumber) !== undefined) {
				defaultValue = div.getAttribute("param"+paramNumber);
			}
			if (defaultValue === undefined || defaultValue === null) {
				defaultValue = "";
			}
			if (level == "level2" && parameter.tip) {
				helpText += ".\n"+_(parameter.tip);
			}
			helpText += ":";
			if (level == "level2" || level == "level3") {
				value = window.prompt(helpText, defaultValue);
				//var value = setupParameterLevel3(div.id, paramNumber, instructionName, parameterName, defaultValue, parameter.type);
			}
			// If user clicked "cancel" use default parameter
			if (value === null) {
				value = defaultValue;
			} else if (value === undefined) {
				value = "";
			}
			div.setAttribute("param"+paramNumber, value);
			if (value !== defaultValue) {
				setupChanges.push([ "param"+paramNumber, defaultValue, value ]);
			}
			paramNumber++;
		}
		return setupChanges;
	}

	/**
	 * Given a block and an instruction it sets up the block
	 * @private
	 * @param {String} level Current level name
	 * @param {!HTMLElement} div Block div
	 * @param {Number} instructionSetId Id of the instruction in $_eseecode.instructions.set
	 * @param {Boolean} [dialog=false] Whether or not the block is in the dialog window
	 * @example createBlock("level2", document.body.createElement("div"), 3)
	 */
	function createBlock(level, div, instructionSetId, dialog) {
		var codeId;
		if (instructionSetId == null) { // If no instructionSetId is passed we just want to update the block
			instructionSetId = div.getAttribute("instructionSetId");
			codeId = div.id;
		} else { // This is a block that didn't exist before
			codeId = newDivId();
			div.setAttribute("id", codeId);
			div.setAttribute("instructionSetId", instructionSetId);
		}
		var instruction = $_eseecode.instructions.set[instructionSetId];
		div.className = "block "+level+" "+instruction.name;
		paintBlock(div,dialog);
		if (instruction.dummy) {
			return;
		}
		if (dialog) {
			var handler;
			if (!isTouchDevice()) {
				handler = "mousedown";
			} else {
				handler = "touchstart";
			}
			div.addEventListener(handler,clickBlock);
		} else {
			if (level == "level1") {
				var handler;
				if (!isTouchDevice()) {
					handler = "mousedown";
				} else {
					handler = "touchstart";
				}
				div.removeEventListener(handler,clickBlock);
			} else if (level == "level2" || level == "level3") {
				var handler;
				if (!isTouchDevice()) {
					handler = "mousedown";
				} else {
					handler = "touchstart";
				}
				div.addEventListener(handler,clickBlock);
			}
		}
	}

	/**
	 * Sets up the shape, color and icon of a block
	 * @private
	 * @param {!HTMLElement} div Block div
	 * @param {Boolean} [dialog=false] Whether or not the block is in the dialog window
	 * @param {Boolean} [skipRecursiveRepaint=false] Whether or not skip the repainting of the blocks' children
	 * @example paintBlock(document.getElementById("div-123123123"), false, true)
	 */
	function paintBlock(div, dialog, skipRecursiveRepaint) {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var instruction = $_eseecode.instructions.set[div.getAttribute("instructionSetId")];
		var color = "transparent"; // default color
		var searchCategoryForColor = instruction.category;
		if (instruction.category == "internal" && div.parentNode) {
			var parentInstruction = $_eseecode.instructions.set[div.parentNode.getAttribute("instructionSetId")];
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
		var output = loadParameters(level, div, dialog);
		var text = output.text;
		// We must first creat the inner text so the div expands its width if necessary
		var span = document.createElement("span");
		span.style.color = readableText(color);
		span.style.minHeight = $_eseecode.setup.blockHeight[level]+"px";
		span.style.fontFamily = "Arial";
		span.style.fontSize = "10px";
		span.style.fontWeight = "bold";
		span.className = "blockTitle";
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
		// Disable text selection on the span
		span.addEventListener("mousedown",function(e){e.preventDefault();},false);
		div.style.minWidth = $_eseecode.setup.blockWidth[level]+"px";
		div.style.minHeight = $_eseecode.setup.blockHeight[level]+"px";
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
					var g = color.substr(3,5);
					var b = color.substr(5,7);
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
			bgCtx.fillStyle = readableText(color);
			bgCtx.fillText(text,1,12);
*/
			div.style.backgroundImage = "url("+bgCanvas.toDataURL()+")";
		}
		if (!skipRecursiveRepaint) {
			while (div.parentNode && div.parentNode.getAttribute("instructionSetId")) {
				div = div.parentNode;
				paintBlock(div,dialog,true);
			}
		}
	}

	/**
	 * Undoes/Redoes the last action in the block undo pile
	 * @private
	 * @param {Boolean} [redo] Whether we want to redo or undo
	 * @example undoBlocks()
	 */
	function undoBlocks(redo) {
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
				div.setAttribute(parameter[0],parameter[newParm]);
			}
			paintBlock(div);
		} else {
			if (redo) {
				newDiv = undo.div;
				oldDiv = undo.fromDiv;
				newPosition = undo.divPosition;
				oldPosition = undo.fromDivPosition;
			} else {
				newDiv = undo.fromDiv;
				oldDiv = undo.div;
				newPosition = undo.fromDivPosition;
				oldPosition = undo.divPosition;
			}
			if (oldDiv) {
				deleteBlock(oldDiv);
			}
			if (newDiv) {
				addBlock(newDiv,newPosition);
			}
		}
		if (redo) {
			$_eseecode.session.blocksUndo[0]++;
		} else {
			$_eseecode.session.blocksUndo[0]--;
		}
		if ($_eseecode.modes.console[$_eseecode.modes.console[0]].name == "level1") {
			execute();
		}
	}

	/**
	 * Initializes/Resets the blocks undo pile in $_eseecode.session.blocksUndo
	 * @private
	 * @example resetUndoBlocks()
	 */
	function resetUndoBlocks() {
		$_eseecode.session.blocksUndo = [0, null];
	}

