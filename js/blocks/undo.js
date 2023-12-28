"use strict";

/**
 * Add a new change in the undo stack
 * @private
 * @param {Object} undoItem Change description to add to the undo stack
 * @example $e.ide.blocks.changes.push(undoItem)
 */
$e.ide.blocks.changes.push = (undoItem) => {
	let blocksUndoIndex = ++$e.ide.blocks.changes.current;
	if (blocksUndoIndex >= $e.setup.undoDepth) { // Never remember more than $e.setup.undoDepth actions
		$e.ide.blocks.changes.stack.shift();
		blocksUndoIndex = $e.ide.blocks.changes.current = $e.setup.undoDepth - 1;
	}
	$e.ide.blocks.changes.stack[blocksUndoIndex] = undoItem;
	$e.ide.blocks.changes.stack.splice(blocksUndoIndex + 1, $e.ide.blocks.changes.stack.length); // Clear the redo stack
}

/**
 * Removes the last item in the undo stack
 * @private
 * @example $e.ide.blocks.changes.pop 
 */
$e.ide.blocks.changes.pop = () => {
	$e.ide.blocks.changes.stack.pop();
	$e.ide.blocks.changes.current--;
};

/**
 * Initializes/Resets the blocks undo pile in $e.ide.blocks.changes.stack
 * @private
 * @example $e.ide.blocks.changes.reset()
 */
$e.ide.blocks.changes.reset = () => {
	$e.ide.blocks.changes.stack = [];
	$e.ide.blocks.changes.current = -1;
};

/**
 * Returns whether there are undo steps in the stack
 * @private
 * @return True if there are steps to undo in the stack, false otherwise
 * @example $e.ide.blocks.changes.hasUndo()
 */
$e.ide.blocks.changes.hasUndo = () => {
	return $e.ide.blocks.changes.current >= 0;
}

/**
 * Returns whether there are redo steps in the stack
 * @private
 * @return True if there are steps to redo in the stack, false otherwise
 * @example $e.ide.blocks.changes.hasRedo()
 */
$e.ide.blocks.changes.hasRedo = () => {
	return $e.ide.blocks.changes.current < $e.ide.blocks.changes.stack.length - 1;
}

/**
 * Undoes/Redoes the last action in the block undo pile
 * @private
 * @param {Boolean} [redo] Whether we want to redo or undo
 * @example $e.ide.blocks.changes.undo()
 */
$e.ide.blocks.changes.undo = (redo) => {
	const undoItem = $e.ide.blocks.changes.stack[$e.ide.blocks.changes.current + (redo ? 1 : 0)];
	if (!undoItem) return console.error("This should not happen in $e.ide.blocks.changes.undo");
	const blockEl = undoItem.blockEl;
	if (undoItem.action == "setup") {
		const newParmIndex = redo ? 2 : 1;
		undoItem.parameters.forEach(parameter => {
			const key = "param" + parameter[0];
			if (parameter[newParmIndex] !== "") {
				blockEl.dataset[key] = parameter[newParmIndex];
			} else {
				delete blockEl.dataset[key];
			}
		});
		$e.ui.blocks.paint(blockEl);
	} else if (undoItem.action == "move") {
		let useParent, useNextSibling;
		if (redo) {
			useParent = undoItem.newParentBlock;
			useNextSibling = undoItem.newNextSibling;
		} else {
			useParent = undoItem.sourceParentBlock;
			useNextSibling = undoItem.sourceNextSibling;
		}
		$e.ui.blocks.insertIntoCode(blockEl, useParent, useNextSibling);
	} else if (undoItem.action == "add") {
		if (redo) {
			$e.ui.blocks.insertIntoCode(blockEl, undoItem.newParentBlock, undoItem.newNextSibling);
		} else {
			$e.ui.blocks.removeFromCode(blockEl);
		}
	} else if (undoItem.action == "delete") {
		if (redo) {
			$e.ui.blocks.removeFromCode(blockEl);
		} else {
			$e.ui.blocks.insertIntoCode(blockEl, undoItem.sourceParentBlock, undoItem.sourceNextSibling);
		}
	} else {
		console.error("Invalid undo action: " + change.action);
	}

	if (redo) {
		$e.ide.blocks.changes.current++;
	} else {
		$e.ide.blocks.changes.current--;
	}

	$e.execution.stop();
	$e.session.updateOnViewSwitch = "blocks";
};