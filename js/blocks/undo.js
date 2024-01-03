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
 * Add a new change into the last undo in the stack
 * @private
 * @param {Object} undoSubitem Change description to add into the last undo in the stack
 * @example $e.ide.blocks.changes.combine(undoItem)
 */
$e.ide.blocks.changes.combine = (undoSubitem) => {
	let lastUndo = $e.ide.blocks.changes.stack[$e.ide.blocks.changes.stack.length - 1];
	if (!Array.isArray(lastUndo)) lastUndo = $e.ide.blocks.changes.stack[$e.ide.blocks.changes.stack.length - 1] = [ lastUndo ];
	lastUndo.push(undoSubitem);
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
	let undoItem = $e.ide.blocks.changes.stack[$e.ide.blocks.changes.current + (redo ? 1 : 0)];
	if (!undoItem) return console.error("This should not happen in $e.ide.blocks.changes.undo");
	if (!Array.isArray(undoItem)) undoItem = [ undoItem ];
	if (!redo) undoItem = undoItem.slice().reverse(); // slice() is there to create a new array so that reverse() doesn't mutate the original one
	undoItem.forEach(undoSubitem => {
		const blockEl = undoSubitem.blockEl;
		if (undoSubitem.action == "setup") {
			const newParmIndex = redo ? 2 : 1;
			undoSubitem.parameters.forEach(parameter => {
				const key = "param" + parameter[0];
				if (parameter[newParmIndex] !== "") {
					blockEl.dataset[key] = parameter[newParmIndex];
				} else {
					delete blockEl.dataset[key];
				}
			});
			$e.ui.blocks.paint(blockEl);
		} else if (undoSubitem.action == "move") {
			let useParent, useNextSibling;
			if (redo) {
				useParent = undoSubitem.newParentBlock;
				useNextSibling = undoSubitem.newNextSibling;
			} else {
				useParent = undoSubitem.sourceParentBlock;
				useNextSibling = undoSubitem.sourceNextSibling;
			}
			$e.ui.blocks.insertIntoCode(blockEl, useParent, useNextSibling);
		} else if (undoSubitem.action == "add") {
			if (redo) {
				$e.ui.blocks.insertIntoCode(blockEl, undoSubitem.newParentBlock, undoSubitem.newNextSibling);
			} else {
				$e.ui.blocks.removeFromCode(blockEl);
			}
		} else if (undoSubitem.action == "delete") {
			if (redo) {
				$e.ui.blocks.removeFromCode(blockEl);
			} else {
				$e.ui.blocks.insertIntoCode(blockEl, undoSubitem.sourceParentBlock, undoSubitem.sourceNextSibling);
			}
		} else {
			console.error("Invalid undo action: " + change.action);
		}
	});

	if (redo) {
		$e.ide.blocks.changes.current++;
	} else {
		$e.ide.blocks.changes.current--;
	}

	$e.execution.stop();
	$e.session.updateOnViewSwitch = "blocks";
};