"use strict";

/**
 * Returns a new valid and unique block id
 * @private
 * @return {String} A valid and unique block id
 * @example $e.backend.newblockId()
 */
$e.backend.newblockId = () => {
	return "block-" + $e.backend.unique();
};

/**
 * Returns a new valid and unique numebr
 * @private
 * @return {Number} A valid and unique block id
 * @example $e.backend.unique()
 */
$e.backend.unique = () => {
	return ++$e.ide.last_id;
};

/** Stop a background sound
 * @private
 * @param {Object} audio Audio object to stop
 * @example $e.backend.sound.stop(backgroundSound("music.mp3"))
 */
$e.backend.sound.stop = (audio) => {
	if (!audio) return;
	audio.pause();
	if (audio.parentNode) audio.remove();
};

/** Returns a window and focuses to it if none had focus
 * @private
 * @param {Number} [id] Window id (if blank it creates a new id)
 * @return {!HTMLElement} HTML element representing the Window
 * @example $e.backend.windows.current = $e.backend.windows.get(id)
 */
$e.backend.windows.get = (id) => {
	const windowElement = $e.backend.windows.getOrCreate(id);
	if (!$e.backend.windows.current) $e.backend.windows.switch(id);
	return windowElement;
};

/**
 * Returns if a window exists with this id
 * @private
 * @param {String} value Value to test
 * @return {Boolean} True if a window exists with this id, false otherwise
 * @example $e.backend.windows.isWindow(5)
 */
$e.backend.windows.isWindow = (value) => {
	return $e.backend.windows.available[value] !== undefined;
};

/** Returns the window
 * If needed, window is created overlapping exactly the whiteboard element
 * The created window can be accessed via $e.backend.windows.available[id]
 * @private
 * @param {Number} [id] Window id (if blank it creates a new id)
 * @return {!HTMLElement} HTML element representing the Window
 * @example $e.backend.windows.current = $e.backend.windows.getOrCreate(id)
 */
$e.backend.windows.getOrCreate = (id) => {
	if (typeof id === "undefined") id = $e.backend.windows.available.length;
	if (!$e.backend.windows.available[id]) {
		const newWindow = document.createElement("div");
		newWindow.id = "window-" + id;
		newWindow.classList.add("hide", "toolbox-window");
		$e.backend.windows.available[id] = newWindow;
		$e.ui.toolboxWindow.appendChild(newWindow);
	}
	return $e.backend.windows.available[id];
};

/** Switches the currently active window
 * @private
 * @param {Number} [id] Window id
 * @example $e.backend.windows.switch(3)
 */
$e.backend.windows.switch = (id) => {
	if (id !== undefined) { // 0 is a valid id
		$e.backend.windows.current = $e.backend.windows.getOrCreate(id);
	}
	// even if we did $e.backend.windows.get() still do the following, since it fixes rendering issues
	Object.entries($e.backend.windows.available).forEach(([key, window]) => {
		if (window) window.classList.add("hide");
	});
	$e.backend.windows.current.classList.remove("hide");
	$e.ui.element.querySelector("#toolbox-tabs-window").classList.remove("hide");
};

/**
 * Deletes a window element
 * @private
 * @param {String} id Element id
 * @example $e.backend.windows.remove("b1")
 */
$e.backend.windows.remove = (id) => {
	const obj = $e.ui.element.querySelector("#element-" + id);
	if (!obj) return false;
	const objParent = obj.parentNode;
	if (!objParent) return false;
	return objParent.removeChild(obj);
};

/**
 * Hides a window element
 * @private
 * @param {String} id Element id
 * @example $e.backend.windows.hide("b1")
 */
$e.backend.windows.hide = (id) => {
	const obj = $e.ui.element.querySelector("#element-" + id);
	obj.classList.add("hide");
};

/**
 * Shows a window element if it was hidden
 * @private
 * @param {String} id Element id
 * @example $e.backend.windows.show("b1")
 */
$e.backend.windows.show = (id) => {
	const obj = $e.ui.element.querySelector("#element-" + id);
	obj.classList.remove("hide");
};

/** Initializes/Resets the input/output
 * @private
 * @example $e.backend.io.reset()
 */
$e.backend.io.reset = () => {
	$e.execution.current.inputPosition = 0;
	$e.execution.current.inputRaw = $e.execution.inputDefault;
};


/** Initializes/Resets the backend (whiteboard, IO, execution)
 * @private
 * @param {Boolean} [runPrecode=true] If true precode is not executed
 * @example $e.backend.reset()
 */
$e.backend.reset = async (runPrecode) => {
	await $e.execution.stopAndWait();
	await $e.backend.whiteboard.reset(runPrecode);
	$e.backend.io.reset();
	$e.ui.resetIO();
	$e.execution.initProgramCounter();
}

/**
 * Resets all the user code handlers
 * @private
 * @example $e.backend.events.reset()
 */
$e.backend.events.reset = (event) => {
	$e.session.handlers = {
		keyboard: {
			key: undefined,
			lastKey: undefined,
		},
		pointer: {
			x: undefined,
			y: undefined,
			lastX: undefined,
			lastY: undefined,
			pressed: false,
			
		}
	}
};

/**
 * Handles keyboard events to be able to handle them in user code
 * @private
 * @example $e.backend.events.keyboard()
 */
$e.backend.events.keyboard = (event) => {
	switch (event.type) {
		case "keyup":
			$e.session.handlers.keyboard.key = undefined;
			break;
		default:
			$e.session.handlers.keyboard.key = event.key;
			$e.session.handlers.keyboard.lastKey = event.key;
	}
};

/**
 * Handles mouse/touch events to be able to handle them in user code
 * @private
 * @example $e.backend.events.pointer()
 */
$e.backend.events.pointer = (event) => {
	if (event.isPrimary !== undefined && !event.isPrimary) return;
	switch (event.type) {
		case "pointerout":
		case "pointerleave":
		case "pointercancel":
			$e.session.handlers.pointer.x = undefined;
			$e.session.handlers.pointer.y = undefined;
			break;
		default:
			$e.session.handlers.pointer.x = event.offsetX;
			$e.session.handlers.pointer.y = event.offsetY;
	}
	switch (event.type) {
		case "pointerup":
		case "pointercancel":
			$e.session.handlers.pointer.pressed = false;
			break;
		case "pointerdown":
			$e.session.handlers.pointer.pressed = true;
			$e.session.handlers.pointer.lastX = $e.session.handlers.pointer.x;
			$e.session.handlers.pointer.lastY = $e.session.handlers.pointer.y;
			break;
	}
};