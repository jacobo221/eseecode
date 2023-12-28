"use strict";

/**
 * Edits an existing window button
 * @since 1.0
 * @public
 * @param {String} id Button id
 * @param {String} [text] Text to show in the button
 * @param {Number} [posx] X coordinate to place the button in the window
 * @param {Number} [posy] Y coordinate to place the button in the window
 * @param {Number} [width] Width of the button
 * @param {Number} [height] Height of the button
 * @param {String|Function} [action] Code to run on button click
 * @example windowButtonEdit("b2", "turn", 170, 90, "turnRight(15)")
 */
function windowButtonEdit(id, text, posx, posy, action, width, height) {
	$e.execution.parseParameterTypes("windowButtonEdit", arguments);
	const button = $e.ui.element.querySelector("#element-" + id);
	$e.ui.resizeView(true); // We need this to calculate the offset of the toolbox window
	$e.ui.switchToolboxMode("window"); // We need to display it order to get its coordinates, but we also want to display it since we are doing something with it so we want to display the window after execution is done
	button.style.position = "absolute";
	if (text) button.value = text;
	if (posx) button.style.left = ($e.ui.toolboxWindow.offsetLeft + posx) + "px";
	if (posy) button.style.top = ($e.ui.toolboxWindow.offsetTop + posy) + "px";
	if (width) button.style.width = width + "px";
	if (height) button.style.height = height + "px";
	if (action) {
		const oldButton = button;
		button = oldButton.cloneNode(true); // Clone to remove handlers
		oldButton.parentNode.replaceChild(button, oldButton);
		if (typeof action === "string") {
			button.addEventListener("click", () => $e.execution.execute(true, action)); // click is also triggered by touchstart
		} else if (typeof action === "function") {
			button.addEventListener("click", action); // click is also triggered by touchstart
		}
	}
};

/**
 * Edits an existing window static text
 * @since 1.0
 * @public
 * @param {String} id Static text id
 * @param {String} [text] Text to show
 * @param {Number} [posx] X coordinate to place the static text in the window
 * @param {Number} [posy] Y coordinate to place the static text in the window
 * @param {Number} [width] Maximum width of the static text (will wrap below if it doesn't fit)
 * @param {Boolean} [bold] Set bold shape to the static text font
 * @param {Boolean} [italic] Set italic shape to the static text font
 * @param {Number} [size] Size of the font to apply to the static text
 * @param {String} [color] Color to apply to the static text
 * @param {String} [family] Font family to apply to the static text
 * @example windowTextCreate("t2", "Repeticions:", 10, 100, undefined, true)
 */
function windowTextEdit(id, text, posx, posy, width, bold, italic, size, color, family) {
	$e.execution.parseParameterTypes("windowTextEdit", arguments);
	const div = $e.ui.element.querySelector("#element-" + id);
	$e.ui.resizeView(true); // We need this to calculate the offset of the toolbox window
	$e.ui.switchToolboxMode("window");
	div.style.position = "absolute";
	if (text !== false) div.innerHTML = text;
	if (posx !== undefined) div.style.left = ($e.ui.toolboxWindow.offsetLeft + posx) + "px";
	if (posy !== undefined) div.style.top = ($e.ui.toolboxWindow.offsetTop + posy) + "px";
	if (width) div.style.width = width + "px";
	if (bold !== undefined) div.style.fontWeight = "bold";
	if (italic !== undefined) div.style.fontStyle = "italic";
	if (size !== undefined) div.style.fontSize = size + $e.setup.defaultFontSize;
	if (color !== undefined) div.style.color = color;
	if (family !== undefined) div.style.fontFamily = family;
};

/**
 * Edits an existing window embedded image
 * @since 1.0
 * @public
 * @param {String} id Image id
 * @param {String|Number} canvasId Layer id that will be used as image
 * @param {Number} [posx] X coordinate to place the image in the window
 * @param {Number} [posy] Y coordinate to place the image in the window
 * @param {Number} [width] Width to resize the image to
 * @param {Number} [height] height to resize the image to
 * @param {String|Function} [onclick] Code to run when the image is clicked
 * @param {String|Function} [onmouseover] Code to run when the mouse is over the image
 * @param {String|Function} [onmouseout] Code to run when the mouse is moved away from being over the image
 * @example windowImageEdit("img1", "3", 100, 100, 60, 15)
 */
function windowImageEdit(id, canvasId, posx, posy, width, height, onclick, onmouseover, onmouseout) {
	$e.execution.parseParameterTypes("windowImageEdit", arguments);
	let img = $e.ui.element.querySelector("#element-" + id);
	$e.ui.resizeView(true); // We need this to calculate the offset of the toolbox window
	$e.ui.switchToolboxMode("window");
	
	img.style.position = "absolute";
	if (canvasId) img.src = $e.backend.whiteboard.layers.get(canvasId).canvas.toDataURL();
	if (posx !== undefined) img.style.left = ($e.ui.toolboxWindow.offsetLeft + posx) + "px";
	if (posy !== undefined) img.style.top = ($e.ui.toolboxWindow.offsetTop + posy) + "px";
	if (width) img.width = width;
	if (height) img.height = height;
	if (onclick || onmouseover || onmouseout) {
		const oldImg = img;
		img = oldImg.cloneNode(true); // Clone to remove handlers
		oldImg.parentNode.replaceChild(img, oldImg);
		if (onmouseover) {
			if (typeof onmouseover === "string") {
				img.addEventListener("pointerdown", () => $e.execution.execute(true, onmouseover));
				img.addEventListener("pointerover", () => $e.execution.execute(true, onmouseover));
			} else if (typeof onmouseover === "function") {
				img.addEventListener("pointerdown", onmouseover);
				img.addEventListener("pointerover", onmouseover);
			}
		}
		if (onclick) {
			if (typeof onclick === "string") {
				img.addEventListener("pointerup", () => $e.execution.execute(true, onclick)); // click is also triggered by touchstart
			} else if (typeof onclick === "function") {
				img.addEventListener("pointerup", onclick); // click is also triggered by touchstart
			}
		}
		if (onmouseout) {
			if (typeof onmouseout === "string") {
				img.addEventListener("pointerup", () => $e.execution.execute(true, onmouseout));
				img.addEventListener("pointerout", () => $e.execution.execute(true, onmouseout));
			} else if (typeof onmouseout === "function") {
				img.addEventListener("pointerup", onmouseout);
				img.addEventListener("pointerout", onmouseout);
			}
		}
	}
};

/**
 * Edits an existing window input box
 * @since 1.0
 * @public
 * @param {String} id Input box id
 * @param {Number} [posx] X coordinate to place the input box in the window
 * @param {Number} [posy] Y coordinate to place the input box in the window
 * @param {Number} [width] Width of th input box (in pixels)
 * @param {Number} [height] Height of th input box (in pixels)
 * @param {String} [type] Type of input box (see HTML5 reference)
 * @example windowInputEdit("i1", 70, 75, 90, 15, "color")
 */
function windowInputEdit(id, posx, posy, width, height, type) {
	$e.execution.parseParameterTypes("windowInputEdit", arguments);
	const input = $e.ui.element.querySelector("#element-" + id);
	$e.ui.resizeView(true); // We need this to calculate the offset of the toolbox window
	$e.ui.switchToolboxMode("window");
	input.style.position = "absolute";
	if (width) input.style.width = width + "px";
	if (height) input.style.height = height + "px";
	if (posx !== undefined) input.style.left = ($e.ui.toolboxWindow.offsetLeft + posx) + "px";
	if (posy !== undefined) input.style.top = ($e.ui.toolboxWindow.offsetTop + posy) + "px";
	if (type) input.type = type;
};

/**
 * Edits an existing window input box
 * @since 1.0
 * @param {String} id Input box id
 * @param {String} value Value to set in the input box
 * @example windowInputSet("secret", "")
 */
function windowInputSet(id, value) {
	$e.execution.parseParameterTypes("windowInputSet", arguments);
	const input = $e.ui.element.querySelector("#element-" + id);
	$e.ui.switchToolboxMode("window");
	input.value = value;
};

/**
 * Creates an existing window button
 * @since 1.0
 * @public
 * @param {Number} windowId Window id
 * @param {String} id Button id
 * @param {String} [text] Text to show in the button
 * @param {Number} [posx] X coordinate to place the button in the window
 * @param {Number} [posy] Y coordinate to place the button in the window
 * @param {Number} [width] Width of the button
 * @param {Number} [height] Height of the button
 * @param {String|Function} [action] Code to run on button click
 * @example windowButtonCreate(1, "b2", "turn", 170, 90, "turnRight(15)")
 */
function windowButtonCreate(windowId, id, text, posx, posy, action, width, height) {
	$e.execution.parseParameterTypes("windowButtonCreate", arguments);
	const window = $e.backend.windows.get(windowId);
	const button = document.createElement("input");
	button.id = "element-" + id;
	button.type = "button";
	window.appendChild(button);
	windowButtonEdit(id, text, posx, posy, action, width, height);
};

/**
 * Creates a window static text
 * @since 1.0
 * @public
 * @param {Number} windowId Window id
 * @param {String} id Static text id
 * @param {String} [text] Text to show
 * @param {Number} [posx] X coordinate to place the static text in the window
 * @param {Number} [posy] Y coordinate to place the static text in the window
 * @param {Number} [width] Maximum width of the static text (will wrap below if it doesn't fit)
 * @param {Boolean} [bold] Set bold shape to the static text font
 * @param {Boolean} [italic] Set italic shape to the static text font
 * @param {Number} [size] Size of the font to apply to the static text
 * @param {String} [color] Color to apply to the static text
 * @param {String} [family] Font family to apply to the static text
 * @example windowTextCreate(1, "t2", "Repeticions:", 10, 100, undefined, true)
 */
function windowTextCreate(windowId, id, text, posx, posy, width, bold, italic, size, color, family) {
	$e.execution.parseParameterTypes("windowTextCreate", arguments);
	const window = $e.backend.windows.get(windowId);
	const div = document.createElement("div");
	div.id = "element-" + id;
	window.appendChild(div);
	windowTextEdit(id, text, posx, posy, width, bold, italic, size, color, family);
};

/**
 * Creates a window embedded image
 * @since 1.0
 * @public
 * @param {Number} windowId Window id
 * @param {String} id Image id
 * @param {String|Number} canvasId Layer id that will be used as image
 * @param {Number} [posx] X coordinate to place the image in the window
 * @param {Number} [posy] Y coordinate to place the image in the window
 * @param {Number} [width] Width to resize the image to
 * @param {Number} [height] height to resize the image to
 * @param {String|Function} [onclick] Code to run when the image is clicked
 * @param {String|Function} [onmouseover] Code to run when the mouse is over the image
 * @param {String|Function} [onmouseout] Code to run when the mouse is moved away from being over the image
 * @example windowImageCreate(1, "img1", "3", 100, 100, 60, 15)
 */
function windowImageCreate(windowId, id, canvasId, posx, posy, width, height, onclick, onmouseover, onmouseout) {
	$e.execution.parseParameterTypes("windowImageCreate", arguments);
	const window = $e.backend.windows.get(windowId);
	const img = document.createElement("img");
	img.id = "element-" + id;
	window.appendChild(img);
	windowImageEdit(id, canvasId, posx, posy, width, height, onclick, onmouseover, onmouseout);
};

/**
 * Creates a window input box
 * @since 1.0
 * @public
 * @param {Number} windowId Window id
 * @param {String} id Input box id
 * @param {Number} [posx] X coordinate to place the input box in the window
 * @param {Number} [posy] Y coordinate to place the input box in the window
 * @param {Number} [width] Width of th input box (in pixels)
 * @param {Number} [height] Height of th input box (in pixels)
 * @param {String} [type] Type of input box (see HTML5 reference)
 * @example windowInputCreate(1, "i1", 70, 75, 90, 15, "color")
 */
function windowInputCreate(windowId, id, posx, posy, width, height, type) {
	$e.execution.parseParameterTypes("windowInputCreate", arguments);
	const window = $e.backend.windows.get(windowId);
	const input = document.createElement("input");
	input.id = "element-" + id;
	window.appendChild(input);
	windowInputEdit(id, posx, posy, width, height, type);
};

/**
 * Removes all elements in a window
 * @since 2.2
 * @public
 * @param {Number} id Window id
 * @example windowClean(2)
 */
function windowClean(id) {
	$e.execution.parseParameterTypes("windowClean", arguments);
	$e.ui.toolboxWindow.removeChild($e.backend.windows.available[id]);
	$e.backend.windows.getOrCreate(id);
};

/**
 * Hides a layer
 * @since 1.0
 * @public
 * @param {Number|String} id Layer id
 * @param {Boolean} [hide=true] Whether to hide the layer or not
 * @example hide(2)
 */
function hide(id, hide) {
	$e.execution.parseParameterTypes("hide", arguments);
	let canvas = $e.backend.whiteboard.layers.current;
	if (id !== undefined) canvas = $e.backend.whiteboard.layers.get(id);
	if (hide === false) {
		show(id);
	} else {
		canvas.div.style.display = "none";
	}
};

/**
 * Hides the current window
 * @since 1.0
 * @public
 * @param {Number} [id] Window id
 * @example windowHide(id)
 */
function windowHide(id) {
	$e.execution.parseParameterTypes("windowHide", arguments);
	let theWindow;
	if (id === undefined) {
		theWindow = $e.backend.windows.current;
	} else {
		theWindow = $e.backend.windows.available[id];
	}
	theWindow.style.display = "none";
};

/**
 * Returns the value in the window input box
 * @since 1.0
 * @public
 * @param {String} id Input box id
 * @return {String} Value in the window input box
 * @example windowInputGet("i1")
 */
function windowInputGet(id) {
	$e.execution.parseParameterTypes("windowInputGet", arguments);
	const inputElement = $e.ui.element.querySelector("#element-" + id);
	if (inputElement ) {
		let value = inputElement.value;
		if (inputElement.classList.contains("color")) {
			value = "#" + value;
		}
	}
	return value;
};

/**
 * Returns the text in the window static text
 * @since 1.0
 * @public
 * @param {String} id Static text id
 * @return {String} Text in the window static text
 * @example windowTextGet("t2")
 */
function windowTextGet(id) {
	$e.execution.parseParameterTypes("windowTextGet", arguments);
	let value = undefined;
	if ($e.ui.element.querySelector("#element-" + id) !== null) {
		value = $e.ui.element.querySelector("#element-" + id).innerHTML;
	}
	return value;
};

/**
 * Shows a layer
 * @since 1.0
 * @public
 * @param {Number|String} [id] Layer id
 * @param {Boolean} [show=true] Whether to show the layer or not
 * @example show(2)
 */
function show(id, show) {
	$e.execution.parseParameterTypes("show", arguments);
	let canvas = $e.backend.whiteboard.layers.current;
	if (id !== undefined) canvas = $e.backend.whiteboard.layers.get(id);
	if (show === false) {
		hide(id);
	} else {
		canvas.div.style.display = "inline";
	}
};

/**
 * Shows the current window
 * @since 1.0
 * @public
 * @param {Number} [id] Window id
 * @example windowShow()
 */
function windowShow(id) {
	$e.execution.parseParameterTypes("windowShow", arguments);
	if (id === undefined) {
		$e.backend.windows.switch();
	} else {
		$e.backend.windows.switch(id);
	}
};

/**
 * Changes the active window
 * @since 1.0
 * @public
 * @param {Number} [id] Window id
 * @example windowUse(2)
 */
function windowUse(id) {
	$e.execution.parseParameterTypes("windowUse", arguments);
	$e.backend.windows.switch(id);
};

/**
 * Returns the layer name
 * @since 1.0
 * @public
 * @param {Number} [id] Layer id
 * @return {String} Layer name
 * @example getLayerName(2)
 */
function getLayerName(id) {
	$e.execution.parseParameterTypes("getLayerName", arguments);
	let canvas = $e.backend.whiteboard.layers.current;
	if (id !== undefined) canvas = $e.backend.whiteboard.layers.get(id);
	return canvas.name;
};

/**
 * Returns if the specified layer is visible or hidden
 * @since 1.0
 * @public
 * @param {Number|String} [id] Layer id
 * @return {Boolean} Whether the specified layer is visible or hidden
 * @example getLayerVisibility(2)
 */
function getLayerVisibility(id) {
	$e.execution.parseParameterTypes("getLayerVisibility", arguments);
	let canvas = $e.backend.whiteboard.layers.current;
	if (id !== undefined) canvas = $e.backend.whiteboard.layers.get(id);
	return canvas.div.style.display != "none";
};

/**
 * Returns as a value the image visible in the specified layer
 * @since 1.0
 * @public
 * @param {Number|String} [id] Layer id
 * @return {String} Image in the specified layer
 * @example getLayerImage(2)
 */
function getLayerImage(id) {
	$e.execution.parseParameterTypes("getLayerImage", arguments);
	let canvas = $e.backend.whiteboard.layers.current;
	if (id !== undefined) canvas = $e.backend.whiteboard.layers.get(id);
	return canvas.canvas.toDataURL();
};

/**
 * Gets the size of the future draw lines and text in the currently active layer
 * @since 3.0
 * @public
 * @example getSize()
 */
function getSize() {
	$e.execution.parseParameterTypes("getSize", arguments);
	return $e.backend.whiteboard.layers.current.style.size;
};

/**
 * Gets the color of the future draw lines and text in the currently active layer
 * @since 3.0
 * @public
 * @example getColor()
 */
function getColor() {
	$e.execution.parseParameterTypes("getColor", arguments);
	return $e.backend.whiteboard.layers.current.style.color;
};

/**
 * Gets whether the future text will be bold in the currently active layer
 * @since 3.0
 * @public
 * @example getBold()
 */
function getBold() {
	$e.execution.parseParameterTypes("getBold", arguments);
	return $e.backend.whiteboard.layers.current.style.bold;
};

/**
 * Gets whether the future text will be italic in the currently active layer
 * @since 3.0
 * @public
 * @example getItalic()
 */
function getItalic() {
	$e.execution.parseParameterTypes("getItalic", arguments);
	return $e.backend.whiteboard.layers.current.style.italic;
};

/**
 * Gets the font name of the future text in the currently active layer
 * @since 3.0
 * @public
 * @example getFont()
 */
function getFont() {
	$e.execution.parseParameterTypes("getFont", arguments);
	return $e.backend.whiteboard.layers.current.style.font;
};

/**
 * Returns a random color
 * @since 1.0
 * @public
 * @return {String} A random color
 * @example getRandomColor()
 */
function getRandomColor() {
	let r = getRandomNumber(256).toString(16);
	if (r.length < 2) r = "0" + r;
	let g = getRandomNumber(256).toString(16);
	if (g.length < 2) g = "0" + g;
	let b = getRandomNumber(256).toString(16);
	if (b.length < 2) b = "0" + b;
	return "#" + r + g + b;
};

/**
 * Returns a positive random integer number
 * @since 1.0
 * @public
 * @param {Number} [upperbound] The highest number desired, excluding this number
 * @return {Number} A positive random integer number [0,upperbound-1]
 * @throws codeError
 * @example getRandomNumber(100)
 */
function getRandomNumber(upperbound) {
	$e.execution.parseParameterTypes("getRandomNumber", arguments);
	if (upperbound < 0) throw new $e.execution.codeError("getRandomNumber", _("Upperbound cannot be lower than 0, received:") + " " + upperbound);
	if (upperbound === undefined) upperbound = Number.MAX_VALUE;
	return Math.floor(Math.random() * upperbound); // [0,upperbound-1]
};

/**
 * Returns the sine of an angle
 * @since 1.0
 * @public
 * @param {Number} angle Angle
 * @return {Number} Sine of an angle
 * @example getSine(90)
 */
function getSine(angle) {
	$e.execution.parseParameterTypes("getSine", arguments);
	return Math.sin(angle * Math.PI / 180);
};

/**
 * Returns the arcsine of an angle
 * @since 1.0
 * @public
 * @param {Number} angle Angle
 * @return {Number} Arcsine of an angle
 * @example getArcsine(90)
 */
function getArcsine(angle) {
	$e.execution.parseParameterTypes("getArcsine", arguments);
	return Math.asin(angle) * 180 / Math.PI;
};

/**
 * Returns the cosine of an angle
 * @since 1.0
 * @public
 * @param {Number} angle Angle
 * @return {Number} Cosine of an angle
 * @example getCosine(90)
 */
function getCosine(angle) {
	$e.execution.parseParameterTypes("getCosine", arguments);
	return Math.cos(angle * Math.PI / 180);
};

/**
 * Returns the arccosine of an angle
 * @since 1.0
 * @public
 * @param {Number} angle Angle
 * @return {Number} Arccosine of an angle
 * @example getArccosine(90)
 */
function getArccosine(angle) {
	$e.execution.parseParameterTypes("getArccosine", arguments);
	return Math.acos(angle) * 180 / Math.PI;
};

/**
 * Returns the tangent of an angle
 * @since 1.0
 * @public
 * @param {Number} angle Angle
 * @return {Number} Tangent of an angle
 * @example getTangent(90)
 */
function getTangent(angle) {
	$e.execution.parseParameterTypes("getTangent", arguments);
	return Math.tan(angle * Math.PI / 180);
};

/**
 * Returns the arctangent of an angle
 * @since 1.0
 * @public
 * @param {Number} angle Angle
 * @return {Number} Arctangent of an angle
 * @example getArctangent(90)
 */
function getArctangent(angle) {
	$e.execution.parseParameterTypes("getArctangent", arguments);
	return Math.atan(angle) * 180 / Math.PI;
};

/**
 * Returns the square root of the number
 * @since 1.0
 * @public
 * @param {Number} number Number
 * @return {Number} Square root of the number
 * @example getSquareRoot(9)
 */
function getSquareRoot(number) {
	$e.execution.parseParameterTypes("getSquareRoot", arguments);
	return Math.sqrt(number);
};

/**
 * Returns the width of the layer
 * @since 1.0
 * @public
 * @return {Number} Width of the layer
 * @example getLayerWidth()
 */
function getLayerWidth() {
	return $e.backend.whiteboard.width;
};

/**
 * Returns the height of the layer
 * @since 1.0
 * @public
 * @return {Number} Height of the layer
 * @example getLayerHeight()
 */
function getLayerHeight() {
	return $e.backend.whiteboard.width;
};

/**
 * Returns whether the layer exists
 * @since 2.4
 * @return {String|Number} layerId Layer id of the layer to check
 * @public
 * @return {Boolean} Whether a layer with the provided id exists
 * @example getLayerExists("character")
 */
function getLayerExists(layerId) {
	$e.execution.parseParameterTypes("getLayerExists", arguments);
	if ($e.backend.whiteboard.layers.get(layerId)) return true;
	return false;
};

/**
 * Returns the layer's guide's position's X coordinate
 * @since 1.0
 * @public
 * @param {Number|String} [id] Layer id
 * @return {Number} The layer's guide's position's X coordinate
 * @example getX()
 */
function getX(id) {
	$e.execution.parseParameterTypes("getX", arguments);
	let guide;
	if (typeof id === "undefined") guide = $e.backend.whiteboard.layers.current.guide;
	else guide = $e.backend.whiteboard.layers.get(id).guide;
	guide = $e.backend.whiteboard.axis.system2userCoords(guide);
	const isFloat = Number(guide.x) === guide.x && guide.x % 1 !== 0 && guide.x !== Infinity;
	return isFloat ? Math.round(guide.x) : guide.x;
};

/**
 * Returns the layer's guide's position's Y coordinate
 * @since 1.0
 * @public
 * @param {Number|String} [id] Layer id
 * @return {Number} The layer's guide's position's Y coordinate
 * @example getY()
 */
function getY(id) {
	$e.execution.parseParameterTypes("getY", arguments);
	let guide;
	if (typeof id === "undefined") guide = $e.backend.whiteboard.layers.current.guide;
	else guide = $e.backend.whiteboard.layers.get(id).guide;
	guide = $e.backend.whiteboard.axis.system2userCoords(guide);
	const isFloat = Number(guide.y) === guide.y && guide.y % 1 !== 0 && guide.y !== Infinity;
	return isFloat ? Math.round(guide.y) : guide.y;
};

/**
 * Returns the layer's guide's position's angle
 * Angle 0 is when the guide is looking horizontally right
 * @since 1.0
 * @public
 * @param {Numbe|Stringr} [id] Layer id
 * @return {Number} The layer's guide's position's angle
 * @example getAngle()
 */
function getAngle(id) {
	$e.execution.parseParameterTypes("getAngle", arguments);
	let guide;
	if (typeof id === "undefined") guide = $e.backend.whiteboard.layers.current.guide;
	else guide = $e.backend.whiteboard.layers.get(id).guide;
	return $e.backend.whiteboard.axis.system2userAngle(guide.angle);
};

/**
 * Draws a line from a coordinate to another using user coordinates
 * @since 1.0
 * @public
 * @param {Number} originx X coordinate where the line starts
 * @param {Number} originy Y coordinate where the line starts
 * @param {Number} destinationx X coordinate where the line ends
 * @param {Number} destinationy Y coordinate where the line ends
 * @example lineAt(200, 200, 50, 50)
 */
function lineAt(originx, originy, destinationx, destinationy) {
	$e.execution.parseParameterTypes("lineAt", arguments);
	$e.backend.whiteboard.layers.systemLineAt($e.backend.whiteboard.axis.user2systemCoords({ x: originx, y: originy }), $e.backend.whiteboard.axis.user2systemCoords({ x: destinationx, y: destinationy }));
};

/**
 * Draws a line from current guide position to a specified coodinate
 * @since 1.0
 * @public
 * @param {Number} destinationx X coordinate where the line ends
 * @param {Number} destinationy Y coordinate where the line ends
 * @example line(50, 50)
 */
function line(destinationx, destinationy) {
	$e.execution.parseParameterTypes("line", arguments);
	const coords = $e.backend.whiteboard.axis.user2systemCoords({ x: destinationx, y: destinationy });
	$e.backend.whiteboard.layers.systemLineAt($e.backend.whiteboard.layers.current.guide, coords);
	$e.backend.whiteboard.guides.move(coords);
};

/**
 * Moves the guide forward
 * @since 1.0
 * @public
 * @param {Number} pixels Amount of pixels to move forward
 * @example forward(50)
 */
function forward(pixels) {
	$e.execution.parseParameterTypes("forward", arguments);
	const pos = {};
	pos.x = $e.backend.whiteboard.layers.current.guide.x + pixels * Math.cos($e.backend.whiteboard.layers.current.guide.angle * Math.PI / 180) * Math.abs($e.backend.whiteboard.axis.scale.x);
	pos.y = $e.backend.whiteboard.layers.current.guide.y + pixels * Math.sin($e.backend.whiteboard.layers.current.guide.angle * Math.PI / 180) * Math.abs($e.backend.whiteboard.axis.scale.y);
	$e.backend.whiteboard.layers.systemLineAt($e.backend.whiteboard.layers.current.guide, pos);
	$e.backend.whiteboard.guides.move(pos);
};

/**
 * Draws an arc
 * @since 1.0
 * @public
 * @param {Number} radius Radius of the arc
 * @param {Number} degrees Amount of degrees to arc
 * @param {Boolean} [follow=false] false = arc around the guide, true = arc following the guide's position and angle and move the guide to the end of the arc
 * @param {Boolean} [counterclockwise=false] Move clockwise or counterclockwise
 * @example arc(50, 270)
 */
function arc(radius, degrees, follow, counterclockwise) {
	$e.execution.parseParameterTypes("arc", arguments);
	let posx, posy;
	let startradians, endradians;
	let move;
	if (degrees === undefined) degrees = 360;
	if (counterclockwise) {
		degrees = -degrees;
		move = 1;
	} else {
		move = -1;
	}
	if (follow) {
		startradians = ($e.backend.whiteboard.layers.current.guide.angle + 90 * move) * Math.PI / 180;	
		posx = $e.backend.whiteboard.layers.current.guide.x + radius * Math.cos(($e.backend.whiteboard.layers.current.guide.angle - 90 * move) * Math.PI / 180);
		posy = $e.backend.whiteboard.layers.current.guide.y + radius * Math.sin(($e.backend.whiteboard.layers.current.guide.angle - 90 * move) * Math.PI / 180);
	} else {
		startradians = $e.backend.whiteboard.layers.current.guide.angle * Math.PI / 180;
		posx = $e.backend.whiteboard.layers.current.guide.x;
		posy = $e.backend.whiteboard.layers.current.guide.y;
	}
	endradians = startradians + degrees * Math.PI / 180;
	if (!$e.backend.whiteboard.layers.current.shaping) {
		$e.backend.whiteboard.layers.current.context.beginPath();
	}
	let oldLineWidth;
	if ($e.backend.whiteboard.layers.current.context.lineWidth > radius * 2) { // if lineWidth is larger than radius*2 the line is drawn with negative color
		oldLineWidth = $e.backend.whiteboard.layers.current.context.lineWidth;
		$e.backend.whiteboard.layers.current.context.lineWidth = radius + oldLineWidth / 2;
		radius = $e.backend.whiteboard.layers.current.context.lineWidth / 2;
		
	}
	let shiftPixels = 0;
	if ($e.backend.whiteboard.layers.current.context.lineWidth == 1) {
		// We use half-pixels because otherwise setSize(1) draws lines 2px wide
		shiftPixels = -0.5;
	}
	$e.backend.whiteboard.layers.current.context.arc(posx + shiftPixels, posy + shiftPixels, radius, startradians, endradians, counterclockwise);
	$e.backend.whiteboard.layers.current.context.stroke();
	if (oldLineWidth !== undefined) {
		$e.backend.whiteboard.layers.current.context.lineWidth = oldLineWidth;
	}
	if (!$e.backend.whiteboard.layers.current.shaping) {
		$e.backend.whiteboard.layers.current.context.closePath();
	}

	if (follow) {
		let COx, COy; // vector from center to origin
		COx = $e.backend.whiteboard.layers.current.guide.x - posx;
		COy = $e.backend.whiteboard.layers.current.guide.y - posy;
		const rotateAngle = degrees * Math.PI / 180;
		$e.backend.whiteboard.layers.current.guide.y = posy + Math.sin(rotateAngle) * COx + Math.cos(rotateAngle) * COy;
		$e.backend.whiteboard.layers.current.guide.x = posx + Math.cos(rotateAngle) * COx - Math.sin(rotateAngle) * COy;
	}
	$e.backend.whiteboard.layers.current.guide.angle += degrees;
	$e.backend.whiteboard.guides.draw();
};

/**
 * Writes text at a specific position
 * @since 1.0
 * @public
 * @param {String} text Text to write
 * @param {Number} posx X coordinate to start writing
 * @param {Number} posy Y coordinate to start writing
 * @param {Number} [angle=0] Angle in which to write
 * @example writeAt("Hello!", 200, 200, 90)
 */
function writeAt(text, posx, posy, angle) {
	$e.execution.parseParameterTypes("writeAt", arguments);
	const coords = $e.backend.whiteboard.axis.user2systemCoords({ x: posx, y: posy });
	$e.backend.whiteboard.layers.systemWriteAt(text, coords, $e.backend.whiteboard.axis.user2systemAngle(angle));
};

/**
 * Writes text at guide's position
 * @since 1.0
 * @public
 * @param {String} text Text to write
 * @example write("Hello!")
 */
function write(text) {
	$e.execution.parseParameterTypes("write", arguments);
	$e.backend.whiteboard.layers.systemWriteAt(text, $e.backend.whiteboard.layers.current.guide, $e.backend.whiteboard.layers.current.guide.angle);
};

/**
 * Fills the shape described within its block
 * @name fill
 * @since 3.1
 * @public
 * @param {String} fillcolor Color to use for the fill
 * @param {String} bordercolor Color to use for the border
 * @example fill("red") { forward(100); turnLeft(90); forward(100); }
 */

/**
 * Defines the beginning of a shape definition
 * @since 1.0
 * @public
 * @example beginShape()
 */
function beginShape() {
	$e.backend.whiteboard.layers.current.shaping = true;
	$e.backend.whiteboard.layers.current.context.beginPath();
	const pos = $e.backend.whiteboard.layers.current.guide; // necessary to mark the starting point in shapes in case the guide has never been moved before
	$e.backend.whiteboard.layers.current.context.moveTo(pos.x, pos.y);
};

/**
 * Defines the end of a shape definition
 * @since 1.0
 * @public
 * @example endShape()
 */
function endShape() {
	$e.backend.whiteboard.layers.current.shaping = false;
	$e.backend.whiteboard.layers.current.context.closePath();
	$e.backend.whiteboard.layers.current.context.fill();
};

/**
 * Turns the guide right
 * @since 1.0
 * @public
 * @param {Number} angle Angle
 * @example turnRight(90)
 */
function turnRight(angle) {
	$e.execution.parseParameterTypes("turnRight", arguments);
	$e.backend.whiteboard.guides.setAngle($e.backend.whiteboard.layers.current.guide.angle + angle);
};

/**
 * Turns the guide left
 * @since 1.0
 * @public
 * @param {Number} angle Angle
 * @example turnLeft(90)
 */
function turnLeft(angle) {
	$e.execution.parseParameterTypes("turnLeft", arguments);
	$e.backend.whiteboard.guides.setAngle($e.backend.whiteboard.layers.current.guide.angle - angle);
};

/**
 * Turns the guide to it's original angle
 * The original angle is the guide looking horizontally to the right
 * @since 2.1
 * @public
 * @param {Number} [angle=0] Angle to set to
 * @example turnReset(90)
 */
function turnReset(angle) {
	$e.execution.parseParameterTypes("turnReset", arguments);
	if (angle === undefined) angle = 0;
	$e.backend.whiteboard.guides.setAngle($e.backend.whiteboard.axis.user2systemAngle(angle));
};

/**
 * Puts an image in the specified position of the whiteboard
 * @since 1.0
 * @public
 * @param {String} src image source. Can be an external http:// image or an image from getLayerImage()
 * @param {Number} posx X coordinate where the image will be placed
 * @param {Number} posy Y coordinate where the image will be placed
 * @param {Boolean} [centered] Whether or not the image should be centered in the given position
 * @param {Number} [width] Image width
 * @param {Number} [height] Image height
 * @param {Number} [rotation] Degrees to rotate the image
 * @param {Boolean} [flipX] Flip the image horizontally
 * @param {Boolean} [flipY] Flip the image vertically
 * @throws codeError
 * @example image(getLayerImage(3), 50, 50, true, 200, 150)
 */
function image(src, posx, posy, centered, width, height, rotation, flipX, flipY) {
	$e.execution.parseParameterTypes("image", arguments);
	if (width < 0) throw new $e.execution.codeError("image", _("Width cannot be lower than 0, received:") + " " + width);
	if (height < 0) throw new $e.execution.codeError("image", _("Height cannot be lower than 0, received:") + " " + height);
	const img = new Image();
	const canvas = $e.backend.whiteboard.layers.current;
	const systemPos = $e.backend.whiteboard.axis.user2systemCoords({ x: posx, y: posy });
	// We need to save the current canvas in a variable otherwise it will load the image in whatever the currentCanvas is when the image is loaded
	img.onload = () => {
		if (width === undefined) {
			if (height === undefined) {
				width = this.width;
			} else {
				width = this.width * (height / this.height);
			}
		}
		if (height === undefined) {
			if (width === undefined) {
				height = this.height;
			} else {
				height = this.height * (width / this.width);
			}
		}
		const tempCanvas = document.createElement("canvas");
		tempCanvas.width = width;
		tempCanvas.height = height;
		const tempCtx = tempCanvas.getContext("2d");
		let scaleX = 1;
		let scaleY = 1;
		if (flipX) scaleX = -1;
		if (flipY) scaleY = -1;
		tempCtx.save();
		tempCtx.scale(scaleX, scaleY);
		tempCtx.drawImage(img, 0, 0, width * scaleX, height * scaleY);
		tempCtx.restore();
		canvas.context.translate(systemPos.x, systemPos.y);
		canvas.context.rotate(rotation * Math.PI / 180);
		if (centered) {
			canvas.context.drawImage(tempCanvas, -width / 2, -height / 2);
		} else {
			canvas.context.drawImage(tempCanvas, 0, 0);
		}
		// Restore the canvas position and orientation for future image() calls
		canvas.context.translate(-systemPos.x, -systemPos.y);
		canvas.context.rotate(-rotation * Math.PI / 180);
	}
	if (src) {
		if (!src.startsWith("http://") && !src.startsWith("https://")) src = $e.execution.basepath + src;
		img.src = src;
	}
};

/**
 * Moves the guide to a specific position
 * @since 1.0
 * @public
 * @param {Number} posx X coordinate where the guide will be moved
 * @param {Number} posy Y coordinate where the guide will be moved
 * @example goTo(50, 50)
 */
function goTo(posx, posy) {
	$e.execution.parseParameterTypes("goTo", arguments);
	const pos = $e.backend.whiteboard.axis.user2systemCoords({ x: posx, y: posy });
	$e.backend.whiteboard.guides.move(pos);
};

/**
 * Moves the guide to the center of the whiteboard
 * @since 1.0
 * @public
 * @example goToCenter()
 */
function goToCenter() {
	$e.backend.whiteboard.guides.move({ x: getLayerWidth() / 2, y: getLayerHeight() / 2 });
};

/**
 * Moves the guide to the upper-left corner of the whiteboard
 * @since 1.0
 * @public
 * @example goToUpLeft()
 */
function goToUpLeft() {
	$e.backend.whiteboard.guides.move({ x: 0, y: 0 });
};

/**
 * Moves the guide to the upper-right corner of the whiteboard
 * @since 1.0
 * @public
 * @example goToUpRight()
 */
function goToUpRight() {
	$e.backend.whiteboard.guides.move({ x: getLayerWidth(), y: 0 });
};

/**
 * Moves the guide to the lower-left of the whiteboard
 * @since 1.0
 * @public
 * @example goToLowLeft()
 */
function goToLowLeft() {
	$e.backend.whiteboard.guides.move({ x: 0, y: getLayerHeight() });
};

/**
 * Moves the guide to the lower-right of the whiteboard
 * @since 1.0
 * @public
 * @example goToLowRight()
 */
function goToLowRight() {
	$e.backend.whiteboard.guides.move({ x: getLayerWidth(), y: getLayerHeight() });
};

/**
 * Returns a color from RGB components
 * @since 1.0
 * @public
 * @param {Number} red Red component in the range [0,255]
 * @param {Number} green Green component in the range [0,255]
 * @param {Number} blue Blue component in the range [0,255]
 * @return {String} Color
 * @example getRGB(0,128,256)
 */
function getRGB(red, green, blue) {
	$e.execution.parseParameterTypes("getRGB", arguments);
	return "rgb(" + red + "," + green + "," + blue + ")";
};

/**
 * Sets the layer transparency
 * @since 2.2
 * @public
 * @param {Number} value Transparency value in the range [0,1]
 * @param {Number|String} [id] Id of the layer to affect
 * @throws codeError
 * @example transparency(0.5)
 */
function transparency(value, id) {
	let layer = $e.backend.whiteboard.layers.current;
	$e.execution.parseParameterTypes("transparency", arguments);
	if (value < 0) throw new $e.execution.codeError("transparency", _("Value cannot be lower than 0, received:") + " " + value);
	if (value > 1) throw new $e.execution.codeError("transparency", _("Value cannot be higher than 1, received:") + " " + value);
	if (id !== undefined) layer = $e.backend.whiteboard.layers.get(id);
	layer.context.globalAlpha = value;
};

/**
 * Pushes a layer down in the layers order
 * Upper layers overlap lower layers
 * @since 1.0
 * @public
 * @param {Number} [levels=1] Amount of steps to push the layer down
 * @param {Number|String} [id] Id of the layer to affect
 * @throws codeError
 * @example push(3)
 */
function push(levels, id) {
	$e.execution.parseParameterTypes("push", arguments);
	if (levels < 0) throw new $e.execution.codeError("push", _("Levels cannot be lower than 0, received:") + " " + levels);
	if (typeof levels === "undefined") levels = 1;
	if (levels < 1) return;
	$e.backend.whiteboard.layers.push(levels, id);
};

/**
 * Pulls a layer up in the layers order
 * Upper layers overlap lower layers
 * @since 1.0
 * @public
 * @param {Number} [levels=1] Amount of steps to pull the layer up
 * @param {Number|String} [id] Id of the layer to affect
 * @throws codeError
 * @example pull(3)
 */
function pull(levels, id) {
	$e.execution.parseParameterTypes("pull", arguments);
	if (levels < 0) throw new $e.execution.codeError("pull", _("Levels cannot be lower than 0, received:") + " " + levels);
	if (typeof levels === "undefined") levels = 1;
	if (levels < 1) return;
	$e.backend.whiteboard.layers.pull(levels, id);
};

/**
 * Deletes a layer
 * @since 2.3
 * @public
 * @param {String|Number} [id] Id of the layer to affect. By default, the top layer
 * @throws codeError
 * @example pop(3)
 */
function pop(id) {
	$e.execution.parseParameterTypes("pop", arguments);
	let layer;
	if (id === undefined) layer = $e.backend.whiteboard.layers.top;
	else layer = $e.backend.whiteboard.layers.get(id);
	if (!layer.layerUnder && !layer.layerOver) throw new $e.execution.codeError("pop", _("There is only one layer, you cannot delete it")); // We must check if there is only one layer
	$e.backend.whiteboard.layers.remove(layer.name);
	if (layer.layerOver) layer.layerOver.layerUnder = layer.layerUnder;
	else $e.backend.whiteboard.layers.top = layer.layerUnder;
	if (layer.layerUnder) layer.layerUnder.layerOver = layer.layerOver;
	else $e.backend.whiteboard.layers.bottom = layer.layerOver;
	if ($e.backend.whiteboard.layers.current == layer) $e.backend.whiteboard.layers.current = $e.backend.whiteboard.layers.top;
};

/**
 * Deletes all content in a layer
 * @since 1.0
 * @public
 * @param {Number|String} [id] Layer id. If missing, currently active layer
 * @example clean()
 */
function clean(id) {
	$e.execution.parseParameterTypes("clean", arguments);
	if (id === undefined) id = $e.backend.whiteboard.layers.current.name;
	$e.backend.whiteboard.layers.clear(id);
};

/**
 * Starts an animation, returns an animation handler
 * It will run a code on every specified time until the code returns false or an amount of times is specified
 * @since 2.0
 * @public
 * @param {String|Function} command Code to run on every 
 * @param {Number} [seconds=0.5] Seconds between each code run
 * @param {Number} [count] Maximum amount of times to run the animation
 * @param {Number} [timeoutHandlersIndex] Animation handler to use
 * @return {Number} Animation handler or false if the animation stopped
 * @throws Code execution exception
 * @example animate("stepForward()", 0.25)
 */
function animate(command, seconds, count, timeoutHandlersIndex) {
	$e.execution.parseParameterTypes("animate", arguments);
	let returnValue;
	if (typeof command === "string") {
		try {
			returnValue = eval(command);
		} catch(event) {
			throw event;
		}
	} else if (typeof command === "function") {
		command();
	}
	if (seconds === undefined) seconds = 0.5;
	if (timeoutHandlersIndex === undefined) {
		timeoutHandlersIndex = $e.execution.current.timeoutHandlers.length;
	} else {
		clearTimeout($e.execution.current.timeoutHandlers[timeoutHandlersIndex]);
	}
	if (count > 1 || (count === undefined && returnValue !== false)) {
		$e.execution.current.timeoutHandlers[timeoutHandlersIndex] = setTimeout(() => { animate(command, seconds, (count !== undefined) ? count - 1 : count, timeoutHandlersIndex); }, seconds * 1000);
	}
	return timeoutHandlersIndex;
};

/**
 * Animate layers by displaying them one at a time
 * @since 2.1
 * @public
 * @param {Number} [delay=0.5]
 * @example animateLayers(0.1)
 */
function animateLayers(delay) {
	$e.execution.parseParameterTypes("animateLayers", arguments);
	if (delay === undefined) {
		delay = 0.5;
	}
	let layer = $e.backend.whiteboard.layers.bottom;
	while (layer) {
		hide(layer.name);
		layer = layer.layerOver;
	}
	animate(() => {
		let layer = $e.backend.whiteboard.layers.bottom;
		let visibleLayer = layer.name;
		while (layer) {
			if (layer.div.style.display != "none") { /* Find currently displaying layer */
				visibleLayer = layer;
			}
			hide(layer.name);
			layer = layer.layerOver;
		}
		visibleLayer = visibleLayer.layerOver;
		if (!visibleLayer) {
			visibleLayer = $e.backend.whiteboard.layers.bottom;
		}
		show(visibleLayer.name);
		$e.ui.resetGuide(false); // Hide the guide
	}, delay);
};


/**
 * Stops an animation
 * @since 2.0
 * @public
 * @param {Number} [timeoutHandlersIndex] Animation handler to stop
 * @example unanimate(2)
 */
function unanimate(timeoutHandlersIndex) {
	$e.execution.parseParameterTypes("unanimate", arguments);
	if (timeoutHandlersIndex === undefined) {
		Object.entries($e.execution.current.timeoutHandlers).forEach((key, handler) => {
			clearTimeout(handler);
			delete $e.execution.current.timeoutHandlers[key];
		});
	} else {
		clearTimeout($e.execution.current.timeoutHandlers[timeoutHandlersIndex]);
		delete $e.execution.current.timeoutHandlers[timeoutHandlersIndex];
	}
};

/**
 * Switches the currently active layer, returns the layer name
 * @since 1.0
 * @public
 * @param {Number|String} [id] Layer id. If unset it switches to a new layer
 * @return {Number} Layer name
 * @example use()
 */
function use(id) {
	$e.execution.parseParameterTypes("use", arguments);
	return $e.backend.whiteboard.layers.switch(id);
};

/**
 * Creates a clone of the current layer in another layer, returns the layer name
 * @since 2.1
 * @public
 * @param {Number|String} [id] Layer id. If unset it creates it in a new layer
 * @return {Number} Layer name
 * @throws codeError
 * @example snapshot()
 */
function snapshot(id) {
	$e.execution.parseParameterTypes("snapshot", arguments);
	const currentCanvas = $e.backend.whiteboard.layers.current;
	const canvas = $e.backend.whiteboard.layers.switch(id);
	const imageClone = getLayerImage(currentCanvas.name);
	const img = new Image();
	img.onload = () => canvas.context.drawImage(img, 0, 0);
	canvas.guide = $e.clone(currentCanvas.guide);
	canvas.style = $e.clone(currentCanvas.style);
	canvas.shaping = $e.clone(currentCanvas.shaping);
	$e.backend.whiteboard.layers.switch(currentCanvas.name);
	img.src = imageClone;
	return canvas.name;
};

/**
 * Play an audio file and wait
 * @since 3.0
 * @public
 * @param {Text} source Source file to play
 * @param {Boolean} [background] Play sound in the background, without stopping the execution of the code
 * @param {Boolean} [repeat=false] Loop the sound
 * @param {Number} [audioHandlersIndex] Animation handler to use
 * @return {Number} Sound handler or undefined if it is not a background sound
 * @example sound("sound.mp3")
 */
async function sound(source, background, loop, audioHandlersIndex) {
	$e.execution.parseParameterTypes("sound", arguments);
	const audio = new Audio(source);
	if (background) {
		if (audioHandlersIndex === undefined) {
			audioHandlersIndex = $e.execution.current.audioHandlers.length;
		} else {
			$e.backend.sound.stop($e.execution.current.audioHandlers[audioHandlersIndex]);
		}
		audio.loop = loop;
		$e.execution.current.audioHandlers[audioHandlersIndex] = audio;
		audio.load;
		audio.play();
		return audioHandlersIndex;
	} else {
		await (() => {
			return new Promise((res) => {
				audio.play();
				audio.addEventListener("ended", res);
			});
		})();
		return undefined;
	}
};

/**
 * Stop playing an audio file in the background
 * @since 3.0
 * @public
 * @param {Text} audioHandlersIndex Handle id of the audio to stop, as returned by sound()
 * @example stopSound()
 */
function stopSound(audioHandlersIndex) {
	$e.backend.sound.stop($e.execution.current.audioHandlers[audioHandlersIndex]);
	delete $e.execution.current.audioHandlers[audioHandlersIndex];
};

/**
 * Sets the size of the future draw lines and text in the currently active layer
 * @since 1.0
 * @public
 * @param {Number} size Size in pixels
 * @example setSize(2)
 */
function setSize(size) {
	$e.execution.parseParameterTypes("setSize", arguments);
	$e.backend.whiteboard.layers.setSize(size);
};

/**
 * Resets the size of the future draw lines and text in the currently active layer
 * @since 1.0
 * @deprecated since version 2.3
 * @public
 * @example unsetSize()
 */
function unsetSize() {
	setSize(2); // default is 2 because 1 (odd widths) is rendered in half pixels and shows different width in some browsers
};

/**
 * Sets the color of the future draw lines and text in the currently active layer
 * @since 1.0
 * @public
 * @param {String} color Color to use
 * @example setColor("#FF0000")
 */
function setColor(color) {
	$e.execution.parseParameterTypes("setColor", arguments);
	$e.backend.whiteboard.layers.setColor(color);
};

/**
 * Sets the draw color to be transparent in the currently active layer
 * @since 1.0
 * @public
 * @example unsetColor()
 */
function unsetColor() { // Sets color to transparent
	setColor("transparent");
};

/**
 * Sets the font to use in future text writes in the currently active layer
 * @since 1.0
 * @public
 * @param {String} font Font to use
 * @example setFont("Arial")
 */
function setFont(font) {
	$e.execution.parseParameterTypes("setFont", arguments);
	$e.backend.whiteboard.layers.current.style.font = font;
	$e.backend.whiteboard.layers.applyTextStyle();
};

/**
 * Resets the font to use in future text writes in the currently active layer
 * @since 1.0
 * @public
 * @example unsetFont()
 */
function unsetFont() {
	setFont("sans-serif");
};

/**
 * Sets the bold property in future text writes in the currently active layer
 * @since 1.0
 * @public
 * @param {Boolean} [bold=true] Whether to use bold text
 * @example setBold(true)
 */
function setBold(bold) {
	$e.execution.parseParameterTypes("setBold", arguments);
	if (bold === undefined || bold) { // optional parameter
		$e.backend.whiteboard.layers.current.style.bold = true;
	} else {
		$e.backend.whiteboard.layers.current.style.bold = false;
	}
	$e.backend.whiteboard.layers.applyTextStyle();
};

/**
 * Unsets the bold property in future text writes in the currently active layer
 * @since 1.0
 * @public
 * @example unsetBold()
 */
function unsetBold() {
	setBold(false);
};

/**
 * Sets the italic property in future text writes in the currently active layer
 * @since 1.0
 * @public
 * @param {Boolean} [italic=true] Whether to use italic text
 * @example setItalic(true)
 */
function setItalic(italic) {
	$e.execution.parseParameterTypes("setItalic", arguments);
	if (italic === undefined || italic) { // optional parameter
		$e.backend.whiteboard.layers.current.style.italic = true;
	} else {
		$e.backend.whiteboard.layers.current.style.italic = false;
	}
	$e.backend.whiteboard.layers.applyTextStyle();
};

/**
 * Unsets the italic property in future text writes in the currently active layer
 * @since 1.0
 * @public
 * @example unsetItalic()
 */
function unsetItalic() {
	setItalic(false);
};

/**
 * Deletes a window button
 * @since 1.0
 * @public
 * @param {String} id Button id
 * @example windowButtonRemove("b1")
 */
function windowButtonRemove(id) {
	$e.execution.parseParameterTypes("windowButtonRemove", arguments);
	return $e.backend.windows.remove(id);
};

/**
 * Deletes a window static text
 * @since 1.0
 * @public
 * @param {String} id Static text id
 * @example windowTextRemove("b1")
 */
function windowTextRemove(id) {
	$e.execution.parseParameterTypes("windowTextRemove", arguments);
	return $e.backend.windows.remove(id);
};

/**
 * Deletes a window image
 * @since 1.0
 * @public
 * @param {String} id Image id
 * @example windowImageRemove("b1")
 */
function windowImageRemove(id) {
	$e.execution.parseParameterTypes("windowImageRemove", arguments);
	return $e.backend.windows.remove(id);
};

/**
 * Deletes a window input box
 * @since 1.0
 * @public
 * @param {String} id Input box id
 * @example windowInputRemove("b1")
 */
function windowInputRemove(id) {
	$e.execution.parseParameterTypes("windowInputRemove", arguments);
	return $e.backend.windows.remove(id);
};

/**
 * Hides a window button
 * @since 1.0
 * @public
 * @param {String} id Button id
 * @example windowButtonHide("b1")
 */
function windowButtonHide(id) {
	$e.execution.parseParameterTypes("windowButtonHide", arguments);
	$e.backend.windows.hide(id);
};

/**
 * Hides a window static text
 * @since 1.0
 * @public
 * @param {String} id Static text id
 * @example windowTextHide("t1")
 */
function windowTextHide(id) {
	$e.execution.parseParameterTypes("windowTextHide", arguments);
	$e.backend.windows.hide(id);
};

/**
 * Hides a window input box
 * @since 1.0
 * @public
 * @param {String} id Input box id
 * @example windowInputHide("i1")
 */
function windowInputHide(id) {
	$e.execution.parseParameterTypes("windowInputHide", arguments);
	$e.backend.windows.hide(id);
};

/**
 * Hides a window image
 * @since 1.0
 * @public
 * @param {String} id Image id
 * @example windowImageHide("img1")
 */
function windowImageHide(id) {
	$e.execution.parseParameterTypes("windowImageHide", arguments);
	$e.backend.windows.hide(id);
};

/**
 * Shows a window button if it was hidden
 * @since 1.0
 * @public
 * @param {String} id Button id
 * @example windowButtonShow("b1")
 */
function windowButtonShow(id) {
	$e.execution.parseParameterTypes("windowButtonShow", arguments);
	$e.backend.windows.show(id);
};

/**
 * Shows a window static text if it was hidden
 * @since 1.0
 * @public
 * @param {String} id Static text id
 * @example windowTextShow("t1")
 */
function windowTextShow(id) {
	$e.execution.parseParameterTypes("windowTextShow", arguments);
	$e.backend.windows.show(id);
};

/**
 * Shows a window image if it was hidden
 * @since 1.0
 * @public
 * @param {String} id Image id
 * @example windowImageShow("img1")
 */
function windowImageShow(id) {
	$e.execution.parseParameterTypes("windowImageShow", arguments);
	$e.backend.windows.show(id);
};

/**
 * Shows a window input box if it was hidden
 * @since 1.0
 * @public
 * @param {String} id Input box id
 * @example windowInputShow("i1")
 */
function windowInputShow(id) {
	$e.execution.parseParameterTypes("windowInputShow", arguments);
	$e.backend.windows.show(id);
};

/**
 * Changes the axis of the whiteboard
 * @since 2.1
 * @deprecated since version 2.4
 * @public
 * @param {Number} [posx=0] X position of the vertical axis, origin us upperleft corner
 * @param {Number} [posy=0] Y position of the horizontal axis, origin us upperleft corner
 * @param {Number} [xScale=1] Scale by which to multiply the x coordinates, originaly increasing from left to right
 * @param {Number} [yScale=1] Scale by which to multiply the y coordinates, originaly increasing downwards
 * @example changeAxis(200, 200)
 */
function changeAxis(posx, posy, xScale, yScale) {
	if (posx === undefined) posx = 0;
	if (posy === undefined) posy = 0;
	if (xScale === undefined) xScale = 1;
	if (yScale === undefined) yScale = 1;
	$e.backend.whiteboard.axis.change({ x: posx, y: posy }, { x: xScale, y: yScale });
};

/**
 * Changes the axis of the whiteboard
 * @since 2.1
 * @public
 * @param {Number} firstX First value in the horizontal axis (left)
 * @param {Number} lastX Last value in the horizontal axis (right)
 * @param {Number} firstY First value in the vertical axis (down)
 * @param {Number} lastY Last value in the vertical axis (up)
 * @throws codeError
 * @example setAxis(-200, 200, -200, 200);
 */
function setAxis(firstX, lastX, firstY, lastY) {
	$e.execution.parseParameterTypes("setAxis", arguments);
	if (firstX == lastX) {
		throw new $e.execution.codeError("setAxis", _("firstX and lastX must be different"));
	} else if (firstY == lastY) {
		throw new $e.execution.codeError("setAxis", _("firstY and lastY must be different"));
	}
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	const posx = -firstX * (canvasWidth / (lastX - firstX));
	const posy =  -lastY * (-canvasHeight) / (lastY - firstY);
	const xScale = canvasWidth / (lastX - firstX);
	const yScale = -canvasHeight / (lastY - firstY);
	$e.backend.whiteboard.axis.change({ x: posx, y: posy }, { x: xScale, y: yScale });
};

/**
 * Stops the execution of any future code
 * @since 1.0
 * @public
 * @example stop()
 */
function stop() {
	$e.execution.current.kill = true;
};

/**
 * Writes in the output area
 * @since 2.3
 * @public
 * @param {String} [text=""] Static text that will be shown in the output section
 * @param {Boolean} [newline=true] Whether or not there should be a carriage return
 * @example output("Hello")
 */
function output(text = "", newline = true) {
	$e.execution.parseParameterTypes("output", arguments);
	const outputEl = $e.ui.element.querySelector("#toolbox-io-output");
	outputEl.textContent += text;
	if (newline) outputEl.textContent += "\n";
	$e.ui.switchToolboxMode("io");
};

	/**
 * Reads from the input area
 * @since 2.3
 * @public
 * @param {String} [type="guess"] How to read the input. Possible values: "char", "word", "number", "integer", "line", "guess"
 * @throws codeError
 * @example input("line")
 */
function input(type) {
	$e.execution.parseParameterTypes("input", arguments);
	if ($e.execution.current.inputPosition >= $e.execution.current.inputRaw.length) return undefined;
	if (type === undefined) type = "guess";
	let result;
	if (type == "char") {
		result = $e.execution.current.inputRaw[$e.execution.current.inputPosition];
		$e.execution.current.inputPosition++;
	} else if (type == "word" || type == "number" || type == "integer" || type == "guess") {
		let firstLetter = $e.execution.current.inputPosition;
		while ((firstLetter < $e.execution.current.inputRaw.length) && ($e.execution.current.inputRaw[firstLetter] == " " || $e.execution.current.inputRaw[firstLetter] == "\t" || $e.execution.current.inputRaw[firstLetter] == "\n")) {
			firstLetter++;
		}
		if (firstLetter >= $e.execution.current.inputRaw.length) return undefined;
		let lastLetter = firstLetter;
		while ((lastLetter < $e.execution.current.inputRaw.length) && ($e.execution.current.inputRaw[lastLetter] != " " && $e.execution.current.inputRaw[lastLetter] != "\t" && $e.execution.current.inputRaw[lastLetter] != "\n")) {
			lastLetter++;
		}
		const wordAsString = $e.execution.current.inputRaw.substring(firstLetter, lastLetter);
		if (type == "word") {
			result = wordAsString;
		} else if (type == "integer" || type == "number") {
			let matchNumber;
			if (type == "integer") 	matchNumber = wordAsString.match(/^[+-]?[0-9]+/);
			else matchNumber = wordAsString.match(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/);
			if (!matchNumber) throw new $e.execution.codeError("input", _("Could not read %s, instead read:", [type])+" "+wordAsString);
			lastLetter = firstLetter+matchNumber[0].length;
			wordAsString = $e.execution.current.inputRaw.substring(firstLetter, lastLetter);
			result = parseFloat(wordAsString);
		} else {
			if (isFinite(wordAsString) && wordAsString.length > 0) result = parseFloat(wordAsString);
			else result = wordAsString;
		}
		$e.execution.current.inputPosition = lastLetter;
	} else if (type == "line") {
		let endOfLine = $e.execution.current.inputPosition;
		while (endOfLine < $e.execution.current.inputRaw.length && $e.execution.current.inputRaw[endOfLine] != "\n") {
			endOfLine++;
		}
		result = $e.execution.current.inputRaw.substring($e.execution.current.inputPosition, endOfLine);
		$e.execution.current.inputPosition = endOfLine + 1;
	}
	return result;
};

/**
 * Returns the current input position
 * @since 2.3
 * @public
 * @return {Number} The index position of the input chain
 * @example getInputPosition()
 */
function getInputPosition() {
	return $e.execution.current.inputPosition;
};

/**
 * Sets the position of the input pointer to a fixed place
 * @since 2.3
 * @public
 * @param {Number} [position=0] Position to go to
 * @example inputReset(10)
 */
function inputReset(position) {
	$e.execution.parseParameterTypes("inputReset", arguments);
	if (position === undefined) position = 0;
	$e.execution.current.inputPosition = position;
};

/**
 * Checks if a key in the keyboard is being pressed
 * @since 2.4
 * @public
 * @return {Boolean} Whether a key os being pressed or not
 * @example getKeyboardPressed()
 */
function getKeyboardPressed() {
	const keyboard = $e.session.handlers.keyboard;
	return (keyboard && keyboard.key !== undefined);
};

/**
 * Returns the value of the key that is being pressed in the keyboard
 * @since 2.4
 * @public
 * @return {String|Boolean} Value of the key being pressed, false if none is being pressed
 * @example getKeyboardKey()
 */
function getKeyboardKey() {
	const keyboard = $e.session.handlers.keyboard;
	if (!keyboard) return false;
	return keyboard.key;
};

/**
 * Returns the value of the last key in the keyboard that was being pressed and marks it as processed so the next call to getKeyboardLastKey() doesn't give it again
 * @since 2.4
 * @public
 * @return {String|Boolean} Value of the last key that was pressed, false if none has been pressed yet
 * @example getKeyboardLastKey()
 */
function getKeyboardLastKey() {
	const keyboard = $e.session.handlers.keyboard;
	if (!keyboard) return false;
	const lastKey = keyboard.lastKey;
	$e.session.handlers.keyboard.lastKey = undefined;
	return lastKey;
};

/**
 * Checks whether the pointer (mouse or touch panel) is being pressed (click if its a mouse, touch if its a tocuh device)
 * @since 2.4
 * @public
 * @return {Boolean} Whether the pointer is being pressed
 * @example getPointerPressed()
 */
function getPointerPressed() {
	const pointer = $e.session.handlers.pointer;
	return (pointer && pointer.pressed);
};

/**
 * Checks whether the pointer (mouse or touch gesture) is over the whiteboard
 * @since 2.4
 * @public
 * @return {Boolean} Whether the pointer is over the whiteboard or not
 * @example getPointerOver()
 */
function getPointerOver() {
	return ($e.session.handlers.pointer.x !== undefined);
};

/**
 * Returns the horitzontal position of the pointer (mouse or touch gesture) in the whiteboard
 * @since 2.4
 * @public
 * @return {Number|Boolean} Horitzontal position of the pointer in the whiteboard, false if its not in the whiteboard
 * @example getPointerX()
 */
function getPointerX() {
	const pointer = $e.session.handlers.pointer;
	if (pointer && pointer.x) return $e.backend.whiteboard.axis.system2userCoords({ x: pointer.x, y: pointer.y }).x;
	return false; // Out of scope
};

/**
 * Returns the vertical position of the pointer (mouse or touch gesture) in the whiteboard
 * @since 2.4
 * @public
 * @return {Number|Boolean} Vertical position of the pointer in the whiteboard, false if its not in the whiteboard
 * @example getPointerY()
 */
function getPointerY() {
	const pointer = $e.session.handlers.pointer;
	if (!pointer || !pointer.y) return false; // Out of scope
	return $e.backend.whiteboard.axis.system2userCoords({ x: pointer.x, y: pointer.y }).y;
};

/**
 * Returns the horitzontal position of the pointer the last time it was clicked (mouse or touch gesture) in the whiteboard
 * @since 2.4
 * @public
 * @return {Number|Boolean} Horitzontal position of the pointer in the whiteboard, false if its not in the whiteboard
 * @example getPointerLastX()
 */
function getPointerLastX() {
	const pointer = $e.session.handlers.pointer;
	if (!pointer || !pointer.lastX) return false; // Out of scope
	$e.session.handlers.pointer.lastX = undefined;
	return $e.backend.whiteboard.axis.system2userCoords({ x: pointer.lastX, y: pointer.lastY }).x;
};

/**
 * Returns the vertical position of the pointer the last time it was clicked (mouse or touch gesture) in the whiteboard
 * @since 2.4
 * @public
 * @return {Number|Boolean} Vertical position of the pointer in the whiteboard, false if its not in the whiteboard
 * @example getPointerLastY()
 */
function getPointerLastY() {
	const pointer = $e.session.handlers.pointer;
	if (!pointer || !pointer.lastY) return false; // Out of scope
	$e.session.handlers.pointer.lastY = undefined;
	return $e.backend.whiteboard.axis.system2userCoords({ x: pointer.lastX, y: pointer.lastY }).y;
};

/**
 * Returns the color in a certain coordinate in the current layer
 * @since 2.4
 * @public
 * @param {Number} x Coordinate x of the position to check the color
 * @param {Number} y Coordinate y of the position to check the color
 * @param {Number|String} [layer] Id of the layer to affect
 * @return {String} Color in the specified position
 * @example getPixelColor(100,100)
 */
function getPixelColor(x, y, layer) {
	if (layer === undefined) layer = $e.backend.whiteboard.layers.current;
	else layer = $e.backend.whiteboard.layers.get(layer);
	const coords = $e.backend.whiteboard.axis.user2systemCoords({ x: x, y: y });
	const p = layer.context.getImageData(coords.x, coords.y, 1, 1).data;
	const r = p[0], g = p[1], b = p[2];
	if (r > 255 || g > 255 || b > 255) return undefined;	// Invalid color component
	const bytes = ((r << 16) | (g << 8) | b).toString(16);
	return "#" + ("000000" + bytes).slice(-6);
};

/**
 * Returns the current millisecond within the current second in time
 * @since 2.4
 * @public
 * @return {Number} Current milliseconds in the current second
 * @example getMilliseconds()
 */
function getMilliseconds() {
	return new Date().getMilliseconds();
};

/**
 * Returns the character corresponding to a key code
 * @since 2.4
 * @public
 * @param {String} keyCode Key code to convert
 * @return {Number} The character corresponding to the key code
 * @example getCharFromCode(110)
 */
function getCharFromCode(keyCode) {
	$e.execution.parseParameterTypes("keyCode", arguments);
	return String.fromCharCode(keyCode);
};

/**
 * Returns the current second
 * @since 2.4
 * @public
 * @return {Number} Current second
 * @example getSeconds()
 */
function getSeconds() {
	return new Date().getSeconds();
};

/**
 * Returns the current minute
 * @since 2.4
 * @public
 * @return {Number} Current minute
 * @example getMinutes()
 */
function getMinutes() {
	return new Date().getMinutes();
};

/**
 * Returns the current hour
 * @since 2.4
 * @public
 * @return {Number} Current hour
 * @example getHours()
 */
function getHours() {
	return new Date().getHours();
};

/**
 * Returns the current day of the week
 * @since 2.4
 * @public
 * @return {Number} Current day of the week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 * @example getWeekDay()
 */
function getWeekDay() {
	return new Date().getDay();
};

/**
 * Returns the current day of the month
 * @since 2.4
 * @public
 * @return {Number} Current day of the month
 * @example getDay()
 */
function getDay() {
	return new Date().getDate();
};

/**
 * Returns the current month
 * @since 2.4
 * @public
 * @return {Number} Current month
 * @example getMonth()
 */
function getMonth() {
	return new Date().getMonth();
};

/**
 * Returns the current year
 * @since 2.4
 * @public
 * @return {Number} Current year
 * @example getYear()
 */
function getYear() {
	return new Date().getFullYear();
};

/**
 * Returns a timestamp of the current hour
 * @since 2.4
 * @public
 * @return {Number} Timestamp of the current hour, in Epoch format (milliseconds since 1970/01/01)
 * @example getTimestamp()
 */
function getTimestamp() {
	return new Date().getTime();
};

/**
 * Stops execution and waits for the user to accept the message
 * @since 4.0
 * @public
 * @param {String} message Message to display to the user
 * @param {Boolean} timeout Milliseconds to wait before closing the message
 * @example say("Hello!")
 */
async function say(message, timeout) {
	return await new Promise(r => {
		let timeout_handle;
		if (timeout) timeout_handle = setTimeout(() => { $e.ui.msgBox.close() ; r(); }, timeout);
		message = "" + message; // Convert to text
		$e.ui.msgBox.open(message, {
			acceptAction: (event) => {
				clearTimeout(timeout_handle);
				r();
				$e.ui.msgBox.close();
			},
			acceptName: _("Accept"),
		});
	});
};

/**
 * Stops execution and waits for the user to answer a question
 * @since 3.0
 * @public
 * @param {String} message Message to display to the user in the prompt
 * @param {String} initial_value Initial value in the input field
 * @param {Boolean} timeout Milliseconds to wait before cancelling the prompt
 * @return {String} User's answer
 * @example ask("Age")
 */
async function ask(message, initial_value, timeout) {
	return await new Promise(r => {
		let timeout_handle;
		if (timeout) timeout_handle = setTimeout(() => { $e.ui.msgBox.close() ; r(); }, timeout);
		$e.ui.msgBox.open((message ? message + "<br>" : "") + "<input id=\"ask_answer\"" + (initial_value ? " value=\"" + initial_value + "\"" : "") + ">", {
			acceptAction: (event) => {
				clearTimeout(timeout_handle);
				r($e.ui.element.querySelector("#ask_answer").value);
				$e.ui.msgBox.close();
			},
			acceptName: _("Submit"),
			cancelAction: (event) => {
				clearTimeout(timeout_handle);
				$e.ui.msgBox.close();
				r(false);
			},
			focus: "ask_answer",
		});
	});
};

/**
 * Stops execution for the specified time (in milliseconds)
 * @since 3.0
 * @public
 * @return {Number} Milliseconds to wait
 * @example wait(2000)
 */
async function wait(milliseconds) {
	if (milliseconds === undefined) milliseconds = 1000;
	return await new Promise(r => setTimeout(() => r(), milliseconds));
};

// Additional instructions

/**
 * Allows to iterate a specific amount of times
 * It updates a variable repeatCount which starts at 0 and increments on every iteration
 * @name repeat
 * @since 1.0
 * @public
 * @param {Number} count Amout of times to repeat the inline block of code
 * @example repeat(4) { forward(100); turnLeft(90); }
 */

/**
 * Allows to iterate based on a condition
 * @name while
 * @since 1.0
 * @public
 * @param {Boolean} condition While this condition resolves true the inline code will be repeatedly run
 * @example while(a < 4) { write(a); a = a+1; }
 */

/**
 * Allows to branch the code
 * @name if
 * @since 1.0
 * @public
 * @param {Boolean} condition While this condition resolves true the inline code will be repeatedly run
 * @example if(isWrong) { write("Wrong answer!"); }
 */

/**
 * Allows to encapsulate groups of instructions
 * @name function
 * @since 1.0
 * @public
 * @param {String} identifier Unique identifier for the function
 * @param {Array<*>} parameters Parameters of the function
 * @return Pointer to the function
 * @example function test(parameter) { if (parameter=="test") write("correct!"); }
 */

/**
 * Allows to declare a variable
 * @name var
 * @since 1.0
 * @public
 * @param {String} identifier Unique identifier for the variable
 * @return Pointer to the variable
 * @example var thisIsAVariable
 */

/**
 * Allows to declare a variable containing several values
 * @name array
 * @since 1.0
 * @public
 * @param {String} identifier Unique identifier for the array
 * @return Pointer to the array
 * @example array thisIsAnArray
 */