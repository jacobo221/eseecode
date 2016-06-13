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
		$e_parseParameterTypes("windowButtonEdit", arguments);
		var id = "element-"+id;
		var button = document.getElementById(id);
		$e_resizeConsole(true); // We need this to calculate the offset of the dialog window
		$e_switchDialogMode("window"); // We need to display it order to get its coordinates, but we also want to display it since we are doing something with it so we want to display the window after execution is done
		button.style.position = "absolute";
		if (text) {
			button.value = text;
		}
		if (posx) {
			button.style.left = ($_eseecode.ui.dialogWindow.offsetLeft+posx)+"px";
		}
		if (posy) {
			button.style.top = ($_eseecode.ui.dialogWindow.offsetTop+posy)+"px";
		}
		if (width) {
			button.style.width = width+"px";
		}
		if (height) {
			button.style.height = height+"px";
		}
		if (action) {
			var oldButton = button;
			button = oldButton.cloneNode(true); // Clone to remove handlers
			oldButton.parentNode.replaceChild(button, oldButton);
			if (typeof action === "string") {
				button.addEventListener("mousedown", function() { $e_execute(true,action); }, false);
				button.addEventListener("touchstart", function() { $e_execute(true,action); }, false);
			} else if (typeof action === "function") {
				button.addEventListener("mousedown", action, false);
				button.addEventListener("touchstart", action, false);
			}
		}
	}

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
		$e_parseParameterTypes("windowTextEdit", arguments);
		var id = "element-"+id;
    	var div = document.getElementById(id);
		$e_resizeConsole(true); // We need this to calculate the offset of the dialog window
		$e_switchDialogMode("window");
		div.style.position = "absolute";
		if (text !== false) {
	    		div.innerHTML = text;
		}
		if (posx !== undefined) {
			div.style.left = ($_eseecode.ui.dialogWindow.offsetLeft+posx)+"px";
		}
		if (posy !== undefined) {
			div.style.top = ($_eseecode.ui.dialogWindow.offsetTop+posy)+"px";
		}
		if (width) {
			div.style.width = width+"px";
		}
		if (bold !== undefined) {
			div.style.fontWeight = "bold";
		}
		if (italic !== undefined) {
			div.style.fontStyle = "italic";
		}
		if (size !== undefined) {
			div.style.fontSize = size+$_eseecode.setup.defaultFontSize;
		}
		if (color !== undefined) {
			div.style.color = color;
		}
		if (family !== undefined) {
			div.style.fontFamily = family;
		}
	}

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
		$e_parseParameterTypes("windowImageEdit", arguments);
		var id = "element-"+id;
    	var img = document.getElementById(id);
		$e_resizeConsole(true); // We need this to calculate the offset of the dialog window
		$e_switchDialogMode("window");
		
		img.style.position = "absolute";
		if (canvasId) {
			img.src = $e_getLayer(canvasId).canvas.toDataURL();
		}
		if (posx !== undefined) {
			img.style.left = ($_eseecode.ui.dialogWindow.offsetLeft+posx)+"px";
		}
		if (posy !== undefined) {
			img.style.top = ($_eseecode.ui.dialogWindow.offsetTop+posy)+"px";
		}
		if (width) {
			img.width = width;
		}
		if (height) {
			img.height = height;
		}
		if (onclick) {
			var oldImg = img;
			img = oldImg.cloneNode(true); // Clone to remove handlers
 			oldImg.parentNode.replaceChild(img, oldImg);
			if (onmouseover) {
				if (typeof onmouseover === "string") {
					img.addEventListener("mousedown", function() { $e_execute(true,onmouseover); }, false);
					img.addEventListener("touchstart", function() { $e_execute(true,onmouseoveraction); }, false);
				} else if (typeof onmouseover === "function") {
					img.addEventListener("mousedown", onmouseover, false);
					img.addEventListener("touchstart", onmouseover, false);
				}
			}
			if (onclick) {
				if (typeof onclick === "string") {
					img.addEventListener("mousedown", function() { $e_execute(true,onclick); }, false);
					img.addEventListener("touchstart", function() { $e_execute(true,onclick); }, false);
				} else if (typeof onclick === "function") {
					img.addEventListener("mousedown", onclick, false);
					img.addEventListener("touchstart", onclick, false);
				}
			}
			if (onmouseout) {
				if (typeof onmouseout === "string") {
					img.addEventListener("mousedown", function() { $e_execute(true,onmouseout); }, false);
					img.addEventListener("touchstart", function() { $e_execute(true,onmouseout); }, false);
				} else if (typeof onmouseout === "function") {
					img.addEventListener("mousedown", onmouseout, false);
					img.addEventListener("touchstart", onmouseout, false);
				}
			}
		}
	}

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
		$e_parseParameterTypes("windowInputEdit", arguments);
		var id = "element-"+id;
	    var input = document.getElementById(id);
		$e_resizeConsole(true); // We need this to calculate the offset of the dialog window
		$e_switchDialogMode("window");
		input.style.position = "absolute";
		if (width) {
			input.style.width = width+"px";
		}
		if (height) {
			input.style.height = height+"px";
		}
		if (posx !== undefined) {
			input.style.left = ($_eseecode.ui.dialogWindow.offsetLeft+posx)+"px";
		}
		if (posy !== undefined) {
			input.style.top = ($_eseecode.ui.dialogWindow.offsetTop+posy)+"px";
		}
		if (type) {
			if (type === "color") {
				try {
					input.type = type;
				} catch (excepion) {
					// input.type = ... can throw exception in IE9 and below if the type is unsupported
					// Use jsColor
					input.className = "color";
					jscolor.color(input, {});
				}
			} else {
    				input.type = type;
			}
		}
	}

	/**
	 * Edits an existing window input box
	 * @since 1.0
	 * @param {String} id Input box id
	 * @param {String} value Value to set in the input box
	 * @example windowInputSet("secret", "")
	 */
	function windowInputSet(id, value) {
		$e_parseParameterTypes("windowInputSet", arguments);
		var id = "element-"+id;
    	var input = document.getElementById(id);
		$e_switchDialogMode("window");
		input.value = value;
	}

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
		$e_parseParameterTypes("windowButtonCreate", arguments);
		var window = $e_getWindow(windowId);
  		var button = document.createElement("input");
		button.id = "element-"+id;
		button.type = "button";
		window.appendChild(button);
		windowButtonEdit(id, text, posx, posy, action, width, height);
	}

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
		$e_parseParameterTypes("windowTextCreate", arguments);
		var window = $e_getWindow(windowId);
    	var div = document.createElement("div");
		div.id = "element-"+id;
		window.appendChild(div);
		windowTextEdit(id, text, posx, posy, width, bold, italic, size, color, family);
	}

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
		$e_parseParameterTypes("windowImageCreate", arguments);
		var window = $e_getWindow(windowId);
    	var img = document.createElement("img");
		img.id = "element-"+id;
		window.appendChild(img);
		windowImageEdit(id, canvasId, posx, posy, width, height, onclick, onmouseover, onmouseout);
	}

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
		$e_parseParameterTypes("windowInputCreate", arguments);
		var window = $e_getWindow(windowId);
    		var input = document.createElement("input");
		input.id = "element-"+id;
		window.appendChild(input);
		windowInputEdit(id, posx, posy, width, height, type);
	}

	/**
	 * Removes all elements in a window
	 * @since 2.2
	 * @public
	 * @param {Number} id Window id
	 * @example windowClean(2)
	 */
	function windowClean(id) {
		$e_parseParameterTypes("windowClean", arguments);
		$_eseecode.ui.dialogWindow.removeChild($_eseecode.windowsArray[id]);
		$e_getOrCreateWindow(id);
	}

	/**
	 * Hides a layer
	 * @since 1.0
	 * @public
	 * @param {Number|String} id Layer id
	 * @param {Boolean} [hide=true] Whether to hide the layer or not
	 * @example hide(2)
	 */
	function hide(id, hide) {
		$e_parseParameterTypes("hide", arguments);
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $e_getLayer(id);
		}
		if (hide === false) {
			show(id);
		} else {
			canvas.div.style.display = "none";
		}
	}

	/**
	 * Hides the current window
	 * @since 1.0
	 * @public
	 * @param {Number} [id] Window id
	 * @example windowHide(id)
	 */
	function windowHide(id) {
		$e_parseParameterTypes("windowHide", arguments);
		var theWindow;
		if (id === undefined) {
			theWindow = $_eseecode.currentWindow;
		} else {
			theWindow = $_eseecode.windowsArray[id];
		}
		theWindow.style.display = "none";
	}

	/**
	 * Returns the value in the window input box
	 * @since 1.0
	 * @public
	 * @param {String} id Input box id
	 * @return {String} Value in the window input box
	 * @example windowInputGet("i1")
	 */
	function windowInputGet(id) {
		$e_parseParameterTypes("windowInputGet", arguments);
		var value = undefined;
		var inputElement = document.getElementById("element-"+id);
		if (inputElement !== null) {
			value = document.getElementById("element-"+id).value;
			var value = inputElement.value;
			if (inputElement.className === "color") {
				value = "#"+value;
			}
		}
		return value;
	}

	/**
	 * Returns the text in the window static text
	 * @since 1.0
	 * @public
	 * @param {String} id Static text id
	 * @return {String} Text in the window static text
	 * @example windowTextGet("t2")
	 */
	function windowTextGet(id) {
		$e_parseParameterTypes("windowTextGet", arguments);
		var value = undefined;
		if (document.getElementById("element-"+id) !== null) {
			value = document.getElementById("element-"+id).innerHTML;
		}
		return value;
	}

	/**
	 * Shows a layer
	 * @since 1.0
	 * @public
	 * @param {Number|String} [id] Layer id
	 * @param {Boolean} [show=true] Whether to show the layer or not
	 * @example show(2)
	 */
	function show(id, show) {
		$e_parseParameterTypes("show", arguments);
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $e_getLayer(id);
		}
		if (show === false) {
			hide(id);
		} else {
			canvas.div.style.display = "inline";
		}
	}

	/**
	 * Shows the current window
	 * @since 1.0
	 * @public
	 * @param {Number} [id] Window id
	 * @example windowShow()
	 */
	function windowShow(id) {
		$e_parseParameterTypes("windowShow", arguments);
		if (id === undefined) {
			$e_windowSwitch();
		} else {
			$e_windowSwitch(id);
		}
	}

	/**
	 * Changes the active window
	 * @since 1.0
	 * @public
	 * @param {Number} [id] Window id
	 * @example windowUse(2)
	 */
	function windowUse(id) {
		$e_parseParameterTypes("windowUse", arguments);
		$e_windowSwitch(id);
	}

	/**
	 * Returns the layer name
	 * @since 1.0
	 * @public
	 * @param {Number} [id] Layer id
	 * @return {String} Layer name
	 * @example getLayerName(2)
	 */
	function getLayerName(id) {
		$e_parseParameterTypes("getLayerName", arguments);
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $e_getLayer(id);
		}
		var value = canvas.name;
		return value;
	}

	/**
	 * Returns if the specified layer is visible or hidden
	 * @since 1.0
	 * @public
	 * @param {Number|String} [id] Layer id
	 * @return {Boolean} Whether the specified layer is visible or hidden
	 * @example getLayerVisibility(2)
	 */
	function getLayerVisibility(id) {
		$e_parseParameterTypes("getLayerVisibility", arguments);
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $e_getLayer(id);
		}
		var value = (canvas.div.style.display != "none");
		return value;
	}

	/**
	 * Returns as a value the image visible in the specified layer
	 * @since 1.0
	 * @public
	 * @param {Number|String} [id] Layer id
	 * @return {String} Image in the specified layer
	 * @example getLayerImage(2)
	 */
	function getLayerImage(id) {
		$e_parseParameterTypes("getLayerImage", arguments);
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $e_getLayer(id);
		}
		return canvas.canvas.toDataURL();
	}

	/**
	 * Moves the current layer
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} right Pixels to move to the right
	 * @param {Number} down Pixels to move down
	 * @example move(20,50)
	 *
	function move(right, down) {
		$e_parseParameterTypes("move", arguments);
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvasSize;
		tempCanvas.height = canvasSize;
		var tempCtx = tempCanvas.getContext("2d");
		tempCtx.translate(right, down);
		tempCtx.drawImage($_eseecode.currentCanvas.canvas,0,0,canvasSize,canvasSize);
		clean();
		$_eseecode.currentCanvas.context.drawImage(tempCanvas,0,0,canvasSize,canvasSize);
	}
	*/

	/**
	 * Moves the current layer horizontally
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Pixels to move to the right
	 * @example moveRight(20,50)
	 *
	function moveRight(pixels) {
		$e_parseParameterTypes("moveRight", arguments);
		move(pixels, 0);
	}
	*/

	/**
	 * Moves the current layer horizontally
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Pixels to move to the left
	 * @example moveLeft(20,50)
	 *
	function moveLeft(pixels) {
		$e_parseParameterTypes("moveLeft", arguments);
		moveRight(-pixels);
	}
	*/

	/**
	 * Moves the current layer vertically
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Pixels to move down
	 * @example moveDown(20,50)
	 *
	function moveDown(pixels) {
		$e_parseParameterTypes("moveDown", arguments);
		move(0, pixels);
	}
	*/

	/**
	 * Moves the current layer vertically
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Pixels to move up
	 * @example moveUp(20,50)
	 *
	function moveUp(pixels) {
		$e_parseParameterTypes("moveUp", arguments);
		moveDown(-pixels);
	}
	*/

	/**
	 * Rotates the current layer right
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} degrees Amount of degrees to rotate
	 * @param {Number} [axis=0] 0 = center, 1 = upper-left corner, 2 = upper-right corner, 3 = lower-right corner, 4= lower-left corner
	 * @example rotateRight(90)
	 *
	function rotateRight(degrees, axis) {
		$e_parseParameterTypes("rotateRight", arguments);
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvasSize;
		tempCanvas.height = canvasSize;
		var tempCtx = tempCanvas.getContext("2d");
		if (axis == 1) {
		} else if (axis == 2) {
			tempCtx.translate(canvasSize, 0);
		} else if (axis == 3) {
			tempCtx.translate(canvasSize, canvasSize);
		} else if (axis == 4) {
			tempCtx.translate(0, canvasSize);
		} else {
			tempCtx.translate(canvasSize/2, canvasSize/2);
		}
		tempCtx.rotate(degrees*Math.PI/180);
		if (axis == 1) {
			tempCtx.drawImage($_eseecode.currentCanvas.canvas,0,0,canvasSize,canvasSize);
		} else if (axis == 2) {
			tempCtx.drawImage($_eseecode.currentCanvas.canvas,-canvasSize,0,canvasSize,canvasSize);
		} else if (axis == 3) {
			tempCtx.drawImage($_eseecode.currentCanvas.canvas,-canvasSize,-canvasSize,canvasSize,canvasSize);
		} else if (axis == 4) {
			tempCtx.drawImage($_eseecode.currentCanvas.canvas,0,-canvasSize,canvasSize,canvasSize);
		} else {
			tempCtx.drawImage($_eseecode.currentCanvas.canvas,-canvasSize/2,-canvasSize/2,canvasSize,canvasSize);
		}
		clean();
		$_eseecode.currentCanvas.context.drawImage(tempCanvas,0,0,canvasSize,canvasSize);
	}
	*/

	/**
	 * Rotates the current layer left
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} degrees Amount of degrees to rotate
	 * @param {Number} [axis=0] 0 = center, 1 = upper-left corner, 2 = upper-right corner, 3 = lower-right corner, 4= lower-left corner
	 * @example rotateRight(90)
	 *
	function rotateLeft(degrees, axis) {
		$e_parseParameterTypes("rotateLeft", arguments);
		rotateRight(-degrees, axis);
	}
	*/

	/**
	 * Scales the current layer
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} horizontal Horizontal proportion
	 * @param {Number} vertical Vertical proportion
	 * @param {Number} [axis=0] 0 = center, 1 = upper-left corner, 2 = upper-right corner, 3 = lower-right corner, 4= lower-left corner
	 * @example scale(2,2)
	 *
	function scale(horizontal, vertical, axis) {
		$e_parseParameterTypes("scale", arguments);
		var color = $_eseecode.currentCanvas.style.color;
		var size = $_eseecode.currentCanvas.style.size;
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvasSize;
		tempCanvas.height = canvasSize;
		var tempCtx = tempCanvas.getContext("2d");
		if (axis == 1) {
		} else if (axis == 2) {
			tempCtx.translate(canvasSize, 0);
		} else if (axis == 3) {
			tempCtx.translate(canvasSize, canvasSize);
		} else if (axis == 4) {
			tempCtx.translate(0, canvasSize);
		} else {
			tempCtx.translate(canvasSize/2, canvasSize/2);
		}
		tempCtx.scale(horizontal, vertical);
		if (axis == 1) {
			tempCtx.drawImage($_eseecode.currentCanvas.canvas,0,0,canvasSize,canvasSize);
		} else if (axis == 2) {
			tempCtx.drawImage($_eseecode.currentCanvas.canvas,-canvasSize,0,canvasSize,canvasSize);
		} else if (axis == 3) {
			tempCtx.drawImage($_eseecode.currentCanvas.canvas,-canvasSize,-canvasSize,canvasSize,canvasSize);
		} else if (axis == 4) {
			tempCtx.drawImage($_eseecode.currentCanvas.canvas,0,-canvasSize,canvasSize,canvasSize);
		} else {
			tempCtx.drawImage($_eseecode.currentCanvas.canvas,-canvasSize/2,-canvasSize/2,canvasSize,canvasSize);
		}
		clean();
		$_eseecode.currentCanvas.context.drawImage(tempCanvas,0,0,canvasSize,canvasSize);
		// restore canvas color and styles
		setColor(color);
		setSize(size);
	}
	*/

	/**
	 * Flips the current layer horizontally
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @example flipHorizontally()
	 *
	function flipHorizontally() {
		scale(-1, 1);
	}
	*/

	/**
	 * Flips the current layer vertically
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @example flipVertically()
	 *
	function flipVertically() {
		scale(1, -1);
	}
	*/

	/**
	 * Returns a random color
	 * @since 1.0
	 * @public
	 * @return {String} A random color
	 * @example getRandomColor()
	 */
	function getRandomColor() {
		var r = getRandomNumber(256).toString(16);
		if (r.length < 2) {
			r = "0"+r;
		}
		var g = getRandomNumber(256).toString(16);
		if (g.length < 2) {
			g = "0"+g;
		}
		var b = getRandomNumber(256).toString(16);
		if (b.length < 2) {
			b = "0"+b;
		}
		var color = $e_executionTraceIterate("randomColor", "#"+r+g+b);
		return color;
	}

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
		$e_parseParameterTypes("getRandomNumber", arguments);
		if (upperbound < 0) {
			throw new $e_codeError("getRandomNumber",_("Upperbound cannot be lower than 0, received:")+" "+upperbound);
		}
		if (upperbound === undefined) {
			upperbound = Number.MAX_VALUE;
		}
		var number = $e_executionTraceIterate("randomNumber", Math.floor(Math.random()*upperbound)); // [0,upperbound-1]
		return number;
	}

	/**
	 * Returns the sine of an angle
	 * @since 1.0
	 * @public
	 * @param {Number} angle Angle
	 * @return {Number} Sine of an angle
	 * @example getSine(90)
	 */
	function getSine(angle) {
		$e_parseParameterTypes("getSine", arguments);
		var value = Math.sin(angle*Math.PI/180);
		return value;
	}

	/**
	 * Returns the arcsine of an angle
	 * @since 1.0
	 * @public
	 * @param {Number} angle Angle
	 * @return {Number} Arcsine of an angle
	 * @example getArcsine(90)
	 */
	function getArcsine(angle) {
		$e_parseParameterTypes("getArcsine", arguments);
		var value = Math.asin(angle)*180/Math.PI;
		return value;
	}

	/**
	 * Returns the cosine of an angle
	 * @since 1.0
	 * @public
	 * @param {Number} angle Angle
	 * @return {Number}
	 * @example getCosine(90)
	 */
	function getCosine(angle) {
		$e_parseParameterTypes("getCosine", arguments);
		var value = Math.cos(angle*Math.PI/180);
		return value;
	}

	/**
	 * Returns the arccosine of an angle
	 * @since 1.0
	 * @public
	 * @param {Number} angle Angle
	 * @return {Number} Arccosine of an angle
	 * @example getArccosine(90)
	 */
	function getArccosine(angle) {
		$e_parseParameterTypes("getArccosine", arguments);
		var value = Math.acos(angle)*180/Math.PI;
		return value;
	}

	/**
	 * Returns the tangent of an angle
	 * @since 1.0
	 * @public
	 * @param {Number} angle Angle
	 * @return {Number} Tangent of an angle
	 * @example getTangent(90)
	 */
	function getTangent(angle) {
		$e_parseParameterTypes("getTangent", arguments);
		var value = Math.tan(angle*Math.PI/180);
		return value;
	}

	/**
	 * Returns the arctangent of an angle
	 * @since 1.0
	 * @public
	 * @param {Number} angle Angle
	 * @return {Number} Arctangent of an angle
	 * @example getArctangent(90)
	 */
	function getArctangent(angle) {
		$e_parseParameterTypes("getArctangent", arguments);
		var value = Math.atan(angle)*180/Math.PI;
		return value;
	}

	/**
	 * Returns the square root of the number
	 * @since 1.0
	 * @public
	 * @param {Number} number Number
	 * @return {Number} Square root of the number
	 * @example getSquareRoot(9)
	 */
	function getSquareRoot(number) {
		$e_parseParameterTypes("getSquareRoot", arguments);
		var value = Math.sqrt(number);
		return value;
	}

	/**
	 * Returns the width of the layer
	 * @since 1.0
	 * @public
	 * @return {Number} Width of the layer
	 * @example getLayerWidth()
	 */
	function getLayerWidth() {
		var canvasSize = $_eseecode.whiteboard.clientWidth;
		return canvasSize;
	}

	/**
	 * Returns the height of the layer
	 * @since 1.0
	 * @public
	 * @return {Number} Height of the layer
	 * @example getLayerHeight()
	 */
	function getLayerHeight() {
		var canvasSize = $_eseecode.whiteboard.clientHeight;
		return canvasSize;
	}

	/**
	 * Returns whether the layer exists
	 * @since 2.4
	 * @return {String|Number} layerId Layer id of the layer to check
	 * @public
	 * @return {Boolean} Whether a layer with the provided id exists
	 * @example getLayerExists("character")
	 */
	function getLayerExists(layerId) {
		$e_parseParameterTypes("getLayerExists", arguments);
		if ($e_getLayer(layerId)) {
			return true;
		}
		return false;
	}

	/**
	 * Returns the layer's guide's position's X coordinate
	 * @since 1.0
	 * @public
	 * @param {Number|String} [id] Layer id
	 * @return {Number} The layer's guide's position's X coordinate
	 * @example getX()
	 */
	function getX(id) {
		$e_parseParameterTypes("getX", arguments);
		var guide;
		if (typeof id === "undefined") {
			guide = $_eseecode.currentCanvas.guide;
		} else {
			guide = $e_getLayer(id).guide;
		}
		guide = $e_system2userCoords(guide);
		return guide.x;
	}

	/**
	 * Returns the layer's guide's position's Y coordinate
	 * @since 1.0
	 * @public
	 * @param {Number|String} [id] Layer id
	 * @return {Number} The layer's guide's position's Y coordinate
	 * @example getY()
	 */
	function getY(id) {
		$e_parseParameterTypes("getY", arguments);
		var guide;
		if (typeof id === "undefined") {
			guide = $_eseecode.currentCanvas.guide;
		} else {
			guide = $e_getLayer(id).guide;
		}
		guide = $e_system2userCoords(guide);
		return guide.y;
	}

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
		$e_parseParameterTypes("getAngle", arguments);
		var guide;
		if (typeof id === "undefined") {
			guide = $_eseecode.currentCanvas.guide;
		} else {
			guide = $e_getLayer(id).guide;
		}
		return $e_system2userAngle(guide.angle);
	}

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
		$e_parseParameterTypes("lineAt", arguments);
		$e_systemLineAt($e_user2systemCoords({x: originx, y: originy}), $e_user2systemCoords({x: destinationx, y: destinationy}));
	}
	
	/**
	 * Draws a line from current guide position to a specified coodinate
	 * @since 1.0
	 * @public
	 * @param {Number} destinationx X coordinate where the line ends
	 * @param {Number} destinationy Y coordinate where the line ends
	 * @example line(50, 50)
	 */
	function line(destinationx, destinationy) {
		$e_parseParameterTypes("line", arguments);
		var coords = $e_user2systemCoords({x: destinationx, y: destinationy});
		$e_systemLineAt($_eseecode.currentCanvas.guide,coords);
		$e_moveGuide(coords);
	}

	/**
	 * Moves the guide forward
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Amount of pixels to move forward
	 * @example forward(50)
	 */
	function forward(pixels) {
		$e_parseParameterTypes("forward", arguments);
		var pos = {};
		pos.x = $_eseecode.currentCanvas.guide.x+pixels*Math.cos($_eseecode.currentCanvas.guide.angle*Math.PI/180)*Math.abs($_eseecode.coordinates.scale.x);
		pos.y = $_eseecode.currentCanvas.guide.y+pixels*Math.sin($_eseecode.currentCanvas.guide.angle*Math.PI/180)*Math.abs($_eseecode.coordinates.scale.y);
		$e_systemLineAt($_eseecode.currentCanvas.guide, pos);
		$e_moveGuide(pos);
	}

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
		$e_parseParameterTypes("arc", arguments);
		var posx, posy;
		var startradians, endradians;
		var move;
		if (degrees === undefined) {
			degrees = 360;
		}
		if (counterclockwise) {
			degrees = -degrees;
			move = 1;
		} else {
			move = -1;
		}
		if (follow) {
			startradians = ($_eseecode.currentCanvas.guide.angle+90*move)*Math.PI/180;	
			posx = $_eseecode.currentCanvas.guide.x+radius*Math.cos(($_eseecode.currentCanvas.guide.angle-90*move)*Math.PI/180);
			posy = $_eseecode.currentCanvas.guide.y+radius*Math.sin(($_eseecode.currentCanvas.guide.angle-90*move)*Math.PI/180);
		} else {
			startradians = $_eseecode.currentCanvas.guide.angle*Math.PI/180;
			posx = $_eseecode.currentCanvas.guide.x;
			posy = $_eseecode.currentCanvas.guide.y;
		}
		endradians = startradians + degrees*Math.PI/180;
		if (!$_eseecode.currentCanvas.shaping) {
			$_eseecode.currentCanvas.context.beginPath();
		}
		var oldLineWidth;
		if ($_eseecode.currentCanvas.context.lineWidth > radius*2) { // if lineWidth is larger than radius*2 the line is drawn with negative color
			oldLineWidth = $_eseecode.currentCanvas.context.lineWidth;
			$_eseecode.currentCanvas.context.lineWidth = radius + oldLineWidth/2;
			radius = $_eseecode.currentCanvas.context.lineWidth/2;
			
		}
		var shiftPixels = 0;
		if ($_eseecode.currentCanvas.context.lineWidth == 1) {
			// We use half-pixels because otherwise setSize(1) draws lines 2px wide
			shiftPixels = -0.5;
		}
		$_eseecode.currentCanvas.context.arc(posx+shiftPixels,posy+shiftPixels,radius,startradians,endradians,counterclockwise);
		$_eseecode.currentCanvas.context.stroke();
		if (oldLineWidth !== undefined) {
			$_eseecode.currentCanvas.context.lineWidth = oldLineWidth;
		}
		if (!$_eseecode.currentCanvas.shaping) {
			$_eseecode.currentCanvas.context.closePath();
		}

		if (follow) {
			var COx, COy; // vector from center to origin
			COx = $_eseecode.currentCanvas.guide.x-posx;
			COy = $_eseecode.currentCanvas.guide.y-posy;
			var rotateAngle = degrees*Math.PI/180;
			$_eseecode.currentCanvas.guide.x = posx+Math.cos(rotateAngle)*COx-Math.sin(rotateAngle)*COy;
			$_eseecode.currentCanvas.guide.y = posy+Math.sin(rotateAngle)*COx+Math.cos(rotateAngle)*COy;
		}
		$_eseecode.currentCanvas.guide.angle += degrees;
		$e_drawGuide();
	}

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
		$e_parseParameterTypes("writeAt", arguments);
		var coords = $e_user2systemCoords({x: posx, y: posy});
		$e_systemWriteAt(text, coords, $e_user2systemAngle(angle));
	}

	/**
	 * Writes text at guide's position
	 * @since 1.0
	 * @public
	 * @param {String} text Text to write
	 * @example write("Hello!")
	 */
	function write(text) {
		$e_parseParameterTypes("write", arguments);
		$e_systemWriteAt(text, $_eseecode.currentCanvas.guide, $_eseecode.currentCanvas.guide.angle);
	}

	/**
	 * Defines the beginning of a shape definition
	 * @since 1.0
	 * @public
	 * @example beginShape()
	 */
	function beginShape() {
		$_eseecode.currentCanvas.shaping = true;
		$_eseecode.currentCanvas.context.beginPath();
		var pos = $_eseecode.currentCanvas.guide; // necessary to mark the starting point in shapes in case the guide has never been moved before
		$_eseecode.currentCanvas.context.moveTo(pos.x, pos.y);
	}

	/**
	 * Defines the end of a shape definition
	 * @since 1.0
	 * @public
	 * @example endShape()
	 */
	function endShape() {
		$_eseecode.currentCanvas.shaping = false;
		$_eseecode.currentCanvas.context.closePath();
		$_eseecode.currentCanvas.context.fill();
	}

	/**
	 * Turns the guide right
	 * @since 1.0
	 * @public
	 * @param {Number} angle Angle
	 * @example turnRight(90)
	 */
	function turnRight(angle) {
		$e_parseParameterTypes("turnRight", arguments);
		$e_setAngleGuide($_eseecode.currentCanvas.guide.angle+angle);
	}

	/**
	 * Turns the guide left
	 * @since 1.0
	 * @public
	 * @param {Number} angle Angle
	 * @example turnLeft(90)
	 */
	function turnLeft(angle) {
		$e_parseParameterTypes("turnLeft", arguments);
		$e_setAngleGuide($_eseecode.currentCanvas.guide.angle-angle);
	}

	/**
	 * Turns the guide to it's original angle
	 * The original angle is the guide looking horizontally to the right
	 * @since 2.1
	 * @public
	 * @param {Number} [angle=0] Angle to set to
	 * @example turnReset(90)
	 */
	function turnReset(angle) {
		$e_parseParameterTypes("turnReset", arguments);
		if (angle === undefined) {
			angle = 0;
		}
		$e_setAngleGuide($e_user2systemAngle(angle));
	}

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
		$e_parseParameterTypes("image", arguments);
		if (width < 0) {
			throw new $e_codeError("image",_("Width cannot be lower than 0, received:")+" "+width);
		}
		if (height < 0) {
			throw new $e_codeError("image",_("Height cannot be lower than 0, received:")+" "+height);
		}
		var img = new Image();
		var canvas = $_eseecode.currentCanvas;
		var systemPos = $e_user2systemCoords({x: posx, y: posy});
		// We need to save the current canvas in a variable otherwise it will load the image in whatever the currentCanvas is when the image is loaded
		img.onload = function() {
			if (width === undefined) {
				if (height === undefined) {
					width = this.width;
				} else {
					width = this.width*(height/this.height);
				}
			}
			if (height === undefined) {
				if (width === undefined) {
					height = this.height;
				} else {
					height = this.height*(width/this.width);
				}
			}
			var canvasSize = $_eseecode.whiteboard.offsetWidth;
			var tempCanvas = document.createElement("canvas");
			tempCanvas.width = width;
			tempCanvas.height = height;
			var tempCtx = tempCanvas.getContext("2d");
			var scaleX = 1;
			var scaleY = 1;
			if (flipX) {
				scaleX = -1;
			}
			if (flipY) {
				scaleY = -1;
			}
			tempCtx.save();
			tempCtx.scale(scaleX, scaleY);
			tempCtx.drawImage(img, 0, 0, width*scaleX, height*scaleY);
			tempCtx.restore();
			canvas.context.translate(systemPos.x, systemPos.y);
			canvas.context.rotate(rotation*Math.PI/180);
			if (centered) {
				canvas.context.drawImage(tempCanvas, -width/2, -height/2);
			} else {
				canvas.context.drawImage(tempCanvas, 0, 0);
			}
		}
		if (src) {
			img.src = src;
		}
	}

	/**
	 * Moves the guide to a specific position
	 * @since 1.0
	 * @public
	 * @param {Number} posx X coordinate where the guide will be moved
	 * @param {Number} posy Y coordinate where the guide will be moved
	 * @example goTo(50, 50)
	 */
	function goTo(posx, posy) {
		$e_parseParameterTypes("goTo", arguments);
		var pos = $e_user2systemCoords({x: posx, y: posy});
		$e_moveGuide(pos);
	}

	/**
	 * Moves the guide to the center of the whiteboard
	 * @since 1.0
	 * @public
	 * @example goToCenter()
	 */
	function goToCenter() {
		$e_moveGuide({x: getLayerWidth()/2, y: getLayerHeight()/2});
	}

	/**
	 * Moves the guide to the upper-left corner of the whiteboard
	 * @since 1.0
	 * @public
	 * @example goToUpLeft()
	 */
	function goToUpLeft() {
		$e_moveGuide({x: 0, y: 0});
	}

	/**
	 * Moves the guide to the upper-right corner of the whiteboard
	 * @since 1.0
	 * @public
	 * @example goToUpRight()
	 */
	function goToUpRight() {
		$e_moveGuide({x: getLayerWidth(), y: 0});
	}

	/**
	 * Moves the guide to the lower-left of the whiteboard
	 * @since 1.0
	 * @public
	 * @example goToLowLeft()
	 */
	function goToLowLeft() {
		$e_moveGuide({x: 0, y: getLayerHeight()});
	}

	/**
	 * Moves the guide to the lower-right of the whiteboard
	 * @since 1.0
	 * @public
	 * @example goToLowRight()
	 */
	function goToLowRight() {
		$e_moveGuide({x: getLayerWidth(), y: getLayerHeight()});
	}

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
		$e_parseParameterTypes("getRGB", arguments);
		var color = "rgb("+red+","+green+","+blue+")";
		return color;
	}

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
		var layer = $_eseecode.currentCanvas;
		$e_parseParameterTypes("transparency", arguments);
		if (value < 0) {
			throw new $e_codeError("transparency",_("Value cannot be lower than 0, received:")+" "+value);
		}
		if (value > 1) {
			throw new $e_codeError("transparency",_("Value cannot be higher than 1, received:")+" "+value);
		}
		if (id !== undefined) {
			layer = $e_getLayer(id);
		}
		layer.context.globalAlpha = value;
	}

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
		$e_parseParameterTypes("push", arguments);
		if (levels < 0) {
			throw new $e_codeError("push",_("Levels cannot be lower than 0, received:")+" "+levels);
		}
		if (typeof levels === "undefined") {
			levels = 1;
		}
		if (levels < 1) {
			return;
		}
		var layer;
		if (id === undefined) {
			layer = $_eseecode.currentCanvas;
		} else {
			layer = $e_getLayer(id);
		}
		if ($_eseecode.canvasArray["$e_top"] == layer && layer.layerUnder) { // We must check if layer.layerUnder exists because it could just be reduntant push() calls
			$_eseecode.canvasArray["$e_top"] = layer.layerUnder;
		}
		while (layer.layerUnder && levels > 0) {
			var oldLayerOver = layer.layerOver;
			var oldLayerUnder = layer.layerUnder;
			var oldlayerZIndex = layer.div.style.zIndex;
			layer.div.style.zIndex = oldLayerUnder.div.style.zIndex;
			oldLayerUnder.div.style.zIndex = oldlayerZIndex;
			if (oldLayerOver) {
				oldLayerOver.layerUnder = oldLayerUnder;
			}
			if (oldLayerUnder.layerUnder) {
				oldLayerUnder.layerUnder.layerOver = layer;
			}
			layer.layerOver = oldLayerUnder;
			layer.layerUnder = oldLayerUnder.layerUnder;
			oldLayerUnder.layerOver = oldLayerOver;
			oldLayerUnder.layerUnder = layer;
			levels--;
		}
		if (!layer.layerUnder) {
			$_eseecode.canvasArray["$e_bottom"] = layer;
		}
	}

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
		$e_parseParameterTypes("pull", arguments);
		if (levels < 0) {
			throw new $e_codeError("pull",_("Levels cannot be lower than 0, received:")+" "+levels);
		}
		if (typeof levels === "undefined") {
			levels = 1;
		}
		if (levels < 1) {
			return;
		}
		var layer;
		if (id === undefined) {
			layer = $_eseecode.currentCanvas;
		} else {
			layer = $e_getLayer(id);
		}
		if ($_eseecode.canvasArray["$e_bottom"] == layer && layer.layerOver) { // We must check if layer.layerOver exists because it could just be reduntant pull() calls
			$_eseecode.canvasArray["$e_bottom"] = layer.layerOver;
		}
		while (layer.layerOver && levels > 0) {
			var oldLayerOver = layer.layerOver;
			var oldLayerUnder = layer.layerUnder;
			var oldlayerZIndex = layer.div.style.zIndex;
			layer.div.style.zIndex = oldLayerOver.div.style.zIndex;
			oldLayerOver.div.style.zIndex = oldlayerZIndex;
			if (layer.layerUnder) {
				layer.layerUnder.layerOver = oldLayerOver;
			}
			layer.layerOver = oldLayerOver.layerOver;
			layer.layerUnder = oldLayerOver;
			if (layer.layerOver) {
				layer.layerOver.layerUnder = layer;
			}
			oldLayerOver.layerOver = layer;
			oldLayerOver.layerUnder = oldLayerUnder;
			levels--;
		}
		if (!layer.layerOver) {
			$_eseecode.canvasArray["$e_top"] = layer;
		}
	}

	/**
	 * Deletes a layer
	 * @since 2.3
	 * @public
	 * @param {String|Number} [id="$e_top"] Id of the layer to affect
	 * @throws codeError
	 * @example pop(3)
	 */
	function pop(id) {
		$e_parseParameterTypes("pop", arguments);
		var layer;
		if (id === undefined) {
			layer = $_eseecode.canvasArray["$e_top"];
		} else {
			layer = $e_getLayer(id);
		}
		if (!layer.layerUnder && !layer.layerOver) { // We must check if there is only one layer
			throw new $e_codeError("pop",_("There is only one layer, you cannot delete it"));
		}
		$e_removeCanvas(layer.name);
		if (layer.layerOver) {
			layer.layerOver.layerUnder = layer.layerUnder;
		} else {
			$_eseecode.canvasArray["$e_top"] = layer.layerUnder;
		}
		if (layer.layerUnder) {
			layer.layerUnder.layerOver = layer.layerOver;
		} else {
			$_eseecode.canvasArray["$e_bottom"] = layer.layerOver;
		}
		if ($_eseecode.currentCanvas == layer) {
			$_eseecode.currentCanvas = $_eseecode.canvasArray["$e_top"];
		}
	}
	
	/**
	 * Deletes all content in a layer
	 * @since 1.0
	 * @public
	 * @param {Number|String} [id] Layer id. If missing, currently active layer
	 * @example clean()
	 */
	function clean(id) {
		$e_parseParameterTypes("clean", arguments);
		if (id === undefined) {
			id = $_eseecode.currentCanvas.name;
		}
		$e_clearCanvas(id);
	}

	/**
	 * Starts an animation, returns an animation handler
	 * It will run a code on every specified time until the code returns false or an amount of times is specified
	 * @since 2.0
	 * @public
	 * @param {String|Function} command Code to run on every 
	 * @param {Number} [seconds=0.5] Seconds between each code run
	 * @param {Number} [maxTimes] Maximum amount of times to run the animation
	 * @param {Number} [timeoutHandlersIndex] Animation handler to use
	 * @return {Number} Animation handler or false if the animation stopped
	 * @throws Code execution exception
	 * @example animate("stepForward()", 0.25)
	 */
	function animate(command, seconds, maxTimes, timeoutHandlersIndex) {
		$e_parseParameterTypes("animate", arguments);
		if (seconds === undefined) {
			seconds = 0.5;
		}
		return $e_animationControl(command, seconds, maxTimes, timeoutHandlersIndex);
	}
	
	/**
	 * Animate layers by displaying them one at a time
	 * @since 2.1
	 * @public
	 * @param {Number} [delay=0.5]
	 * @example animateLayers(0.1)
	 */
	function animateLayers(delay) {
		$e_parseParameterTypes("animateLayers", arguments);
		if (delay === undefined) {
			delay = 0.5;
		}
		var layer = $_eseecode.canvasArray["$e_bottom"];
		while (layer) {
			hide(layer.name);
			layer = layer.layerOver;
		}
		animate(function(){
			var layer = $_eseecode.canvasArray["$e_bottom"];
			var visibleLayer = layer.name;
			while (layer) {
				if (layer.div.style.display != "none") { /* Find currently displaying layer */
					visibleLayer = layer;
				}
				hide(layer.name);
				layer = layer.layerOver;
			}
			visibleLayer = visibleLayer.layerOver;
			if (!visibleLayer) {
				visibleLayer = $_eseecode.canvasArray["$e_bottom"];
			}
			show(visibleLayer.name);
			$e_resetGuide(false); // Hide the guide
			}, delay);
	}

	/**
	 * Stops an animation
	 * @since 2.0
	 * @public
	 * @param {Number} [timeoutHandlersIndex] Animation handler to stop
	 * @example unanimate(2)
	 */
	function unanimate(timeoutHandlersIndex) {
		$e_parseParameterTypes("unanimate", arguments);
		if (timeoutHandlersIndex === undefined) {
			$e_stopPreviousAnimations();
		} else {
			clearTimeout($_eseecode.execution.timeoutHandlers[timeoutHandlersIndex]);
			$_eseecode.execution.timeoutHandlers.splice(timeoutHandlersIndex, 1);
		}
	}

	/**
	 * Switches the currently active layer, returns the layer name
	 * @since 1.0
	 * @public
	 * @param {Number|String} [id] Layer id. If unset it switches to a new layer
	 * @return {Number} Layer name
	 * @example use()
	 */
	function use(id) {
		$e_parseParameterTypes("use", arguments);
		var canvas = $e_switchCanvas(id);
		return canvas.name;
	}

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
		$e_parseParameterTypes("snapshot", arguments);
		var currentCanvas = $_eseecode.currentCanvas;
		var canvas = $e_switchCanvas(id);
		var imageClone = getLayerImage(currentCanvas.name);
		var img = new Image();
		img.onload = function() {
			canvas.context.drawImage(img, 0, 0);
		}
		canvas.guide = $e_clone(currentCanvas.guide);
		canvas.style = $e_clone(currentCanvas.style);
		canvas.shaping = $e_clone(currentCanvas.shaping);
		$e_switchCanvas(currentCanvas.name);
		img.src = imageClone;
		return canvas.name;
	}

	/**
	 * Sets the size of the future draw lines and text in the currently active layer
	 * @since 1.0
	 * @public
	 * @param {Number} size Size in pixels
	 * @example setSize(2)
	 */
	function setSize(size) {
		$e_parseParameterTypes("setSize", arguments);
		$e_setSizeStyle(size);
	}

	/**
	 * Resets the size of the future draw lines and text in the currently active layer
	 * @since 1.0
	 * @deprecated since version 2.3
	 * @public
	 * @example unsetSize()
	 */
	function unsetSize() {
		setSize(2); // default is 2 because 1 (odd widths) is rendered in half pixels and shows different width in some browsers
	}

	/**
	 * Sets the color of the future draw lines and text in the currently active layer
	 * @since 1.0
	 * @public
	 * @param {String} color Color to use
	 * @example setColor("#FF0000")
	 */
	function setColor(color) {
		$e_parseParameterTypes("setColor", arguments);
		$e_setColorStyle(color);
	}

	/**
	 * Sets the draw color to be transparent in the currently active layer
	 * @since 1.0
	 * @public
	 * @example unsetColor()
	 */
	function unsetColor() { // Sets color to transparent
		setColor("transparent");
	}

	/**
	 * Sets the font to use in future text writes in the currently active layer
	 * @since 1.0
	 * @public
	 * @param {String} font Font to use
	 * @example setFont("Arial")
	 */
	function setFont(font) {
		$e_parseParameterTypes("setFont", arguments);
		$_eseecode.currentCanvas.style.font = font;
		$e_setTextStyle();
	}

	/**
	 * Resets the font to use in future text writes in the currently active layer
	 * @since 1.0
	 * @public
	 * @example unsetFont()
	 */
	function unsetFont() {
		setFont("sans-serif");
	}

	/**
	 * Sets the bold property in future text writes in the currently active layer
	 * @since 1.0
	 * @public
	 * @param {Boolean} [bold=true] Whether to use bold text
	 * @example setBold(true)
	 */
	function setBold(bold) {
		$e_parseParameterTypes("setBold", arguments);
		if (bold === undefined || bold) { // optional parameter
			$_eseecode.currentCanvas.style.bold = true;
		} else {
			$_eseecode.currentCanvas.style.bold = false;
		}
		$e_setTextStyle();
	}

	/**
	 * Unsets the bold property in future text writes in the currently active layer
	 * @since 1.0
	 * @public
	 * @example unsetBold()
	 */
	function unsetBold() {
		setBold(false);
	}

	/**
	 * Sets the italic property in future text writes in the currently active layer
	 * @since 1.0
	 * @public
	 * @param {Boolean} [italic=true] Whether to use italic text
	 * @example setItalic(true)
	 */
	function setItalic(italic) {
		$e_parseParameterTypes("setItalic", arguments);
		if (italic === undefined || italic) { // optional parameter
			$_eseecode.currentCanvas.style.italic = true;
		} else {
			$_eseecode.currentCanvas.style.italic = false;
		}
		$e_setTextStyle();
	}

	/**
	 * Unsets the italic property in future text writes in the currently active layer
	 * @since 1.0
	 * @public
	 * @example unsetItalic()
	 */
	function unsetItalic() {
		setItalic(false);
	}

	/**
	 * Deletes a window button
	 * @since 1.0
	 * @public
	 * @param {String} id Button id
	 * @example windowButtonRemove("b1")
	 */
	function windowButtonRemove(id) {
		$e_parseParameterTypes("windowButtonRemove", arguments);
		return $e_windowElementRemove(id);
	}

	/**
	 * Deletes a window static text
	 * @since 1.0
	 * @public
	 * @param {String} id Static text id
	 * @example windowTextRemove("b1")
	 */
	function windowTextRemove(id) {
		$e_parseParameterTypes("windowTextRemove", arguments);
		return $e_windowElementRemove(id);
	}

	/**
	 * Deletes a window image
	 * @since 1.0
	 * @public
	 * @param {String} id Image id
	 * @example windowImageRemove("b1")
	 */
	function windowImageRemove(id) {
		$e_parseParameterTypes("windowImageRemove", arguments);
		return $e_windowElementRemove(id);
	}

	/**
	 * Deletes a window input box
	 * @since 1.0
	 * @public
	 * @param {String} id Input box id
	 * @example windowInputRemove("b1")
	 */
	function windowInputRemove(id) {
		$e_parseParameterTypes("windowInputRemove", arguments);
		return $e_windowElementRemove(id);
	}

	/**
	 * Hides a window button
	 * @since 1.0
	 * @public
	 * @param {String} id Button id
	 * @example windowButtonHide("b1")
	 */
	function windowButtonHide(id) {
		$e_parseParameterTypes("windowButtonHide", arguments);
		$e_windowElementHide(id);
	}

	/**
	 * Hides a window static text
	 * @since 1.0
	 * @public
	 * @param {String} id Static text id
	 * @example windowTextHide("t1")
	 */
	function windowTextHide(id) {
		$e_parseParameterTypes("windowTextHide", arguments);
		$e_windowElementHide(id);
	}

	/**
	 * Hides a window input box
	 * @since 1.0
	 * @public
	 * @param {String} id Input box id
	 * @example windowInputHide("i1")
	 */
	function windowInputHide(id) {
		$e_parseParameterTypes("windowInputHide", arguments);
		$e_windowElementHide(id);
	}

	/**
	 * Hides a window image
	 * @since 1.0
	 * @public
	 * @param {String} id Image id
	 * @example windowImageHide("img1")
	 */
	function windowImageHide(id) {
		$e_parseParameterTypes("windowImageHide", arguments);
		$e_windowElementHide(id);
	}

	/**
	 * Shows a window button if it was hidden
	 * @since 1.0
	 * @public
	 * @param {String} id Button id
	 * @example windowButtonShow("b1")
	 */
	function windowButtonShow(id) {
		$e_parseParameterTypes("windowButtonShow", arguments);
		$e_windowElementShow(id);
	}

	/**
	 * Shows a window static text if it was hidden
	 * @since 1.0
	 * @public
	 * @param {String} id Static text id
	 * @example windowTextShow("t1")
	 */
	function windowTextShow(id) {
		$e_parseParameterTypes("windowTextShow", arguments);
		$e_windowElementShow(id);
	}

	/**
	 * Shows a window image if it was hidden
	 * @since 1.0
	 * @public
	 * @param {String} id Image id
	 * @example windowImageShow("img1")
	 */
	function windowImageShow(id) {
		$e_parseParameterTypes("windowImageShow", arguments);
		$e_windowElementShow(id);
	}

	/**
	 * Shows a window input box if it was hidden
	 * @since 1.0
	 * @public
	 * @param {String} id Input box id
	 * @example windowInputShow("i1")
	 */
	function windowInputShow(id) {
		$e_parseParameterTypes("windowInputShow", arguments);
		$e_windowElementShow(id);
	}

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
		//$e_parseParameterTypes("changeAxis", arguments);
		if (posx === undefined) {
			posx = 0;
		}
		if (posy === undefined) {
			posy = 0;
		}
		if (xScale === undefined) {
			xScale = 1;
		}
		if (yScale === undefined) {
			yScale = 1;
		}
		$e_changeAxisCoordinates({x: posx, y: posy}, {x: xScale, y: yScale});
	}

	/**
	 * Changes the axis of the whiteboard
	 * @since 2.1
	 * @public
	 * @param {Number} firstX First value in the horizontal axis (left)
	 * @param {Number} lastX Last value in the horizontal axis (right)
	 * @param {Number} firstY First value in the vertical axis (down)
	 * @param {Number} lastY Last value in the vertical axis (up)
	 * @example fixAxis(-200, 200, -200, 200);
	 */
	function setAxis(firstX, lastX, firstY, lastY) {
		$e_parseParameterTypes("setAxis", arguments);
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var posx = -firstX*(canvasSize/(lastX-firstX));
		var posy =  -lastY*(-canvasSize)/(lastY-firstY);
		var xScale = canvasSize/(lastX-firstX);
		var yScale = -canvasSize/(lastY-firstY);
		$e_changeAxisCoordinates({x: posx, y: posy}, {x: xScale, y: yScale});
	}

	/**
	 * Stops the execution of any future code
	 * @since 1.0
	 * @public
	 * @example stop()
	 */
	function stop() {
		$_eseecode.execution.programCounterLimit = true;
	}

	/**
	 * Writes in the output area
	 * @since 2.3
	 * @public
	 * @param {String} [text=""] Static text that will be shown in the output section
	 * @param {Boolean} [newline=true] Whether or not there should be a carriage return
	 * @example output("Hello")
	 */
	function output(text, newline) {
		$e_parseParameterTypes("output", arguments);
		if (text === undefined) {
			text = "";
		}
		if (newline === undefined) {
			newline = true;
		}
		var textarea = document.getElementById("dialog-io-output");
		textarea.value += text;
		if (newline) {
			textarea.value += "\n";
		}
		$e_switchDialogMode("io");
	}

	 /**
	 * Reads from the input area
	 * @since 2.3
	 * @public
	 * @param {String} [type="guess"] How to read the input. Possible values: "char", "word", "number", "integer", "line", "guess"
	 * @throws codeError
	 * @example input("line")
	 */
	function input(type) {
		$e_parseParameterTypes("input", arguments);
		if ($_eseecode.execution.inputPosition >= $_eseecode.execution.inputRaw.length) {
			return undefined;
		}
		if (type === undefined) {
			type = "guess";
		}
		var result;
		if (type == "char") {
			result = $_eseecode.execution.inputRaw[$_eseecode.execution.inputPosition];
			$_eseecode.execution.inputPosition++;
		} else if (type == "word" || type == "number" || type == "integer" || type == "guess") {
			var firstLetter = $_eseecode.execution.inputPosition;
			while ((firstLetter < $_eseecode.execution.inputRaw.length) && ($_eseecode.execution.inputRaw[firstLetter] == " " || $_eseecode.execution.inputRaw[firstLetter] == "\t" || $_eseecode.execution.inputRaw[firstLetter] == "\n")) {
				firstLetter++;
			}
			if (firstLetter >= $_eseecode.execution.inputRaw.length) {
				return undefined;
			}
			var lastLetter = firstLetter;
			while ((lastLetter < $_eseecode.execution.inputRaw.length) && ($_eseecode.execution.inputRaw[lastLetter] != " " && $_eseecode.execution.inputRaw[lastLetter] != "\t" && $_eseecode.execution.inputRaw[lastLetter] != "\n")) {
				lastLetter++;
			}
			var wordAsString = $_eseecode.execution.inputRaw.substring(firstLetter, lastLetter);
			if (type == "word") {
				result = wordAsString;
			} else if (type == "integer" || type == "number") {
				var matchNumber;
				if (type == "integer") {
					matchNumber = wordAsString.match(/^[+-]?[0-9]+/);
				} else {
					matchNumber = wordAsString.match(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?/);
				}
				if (!matchNumber) {
					throw new $e_codeError("input", _("Could not read %s, instead read:", [type])+" "+wordAsString);
				}
				lastLetter = firstLetter+matchNumber[0].length;
				wordAsString = $_eseecode.execution.inputRaw.substring(firstLetter, lastLetter);
				result = parseFloat(wordAsString);
			} else {
				if (isFinite(wordAsString) && wordAsString.length > 0) {
					result = parseFloat(wordAsString);
				} else {
					result = wordAsString;
				}
			}
			$_eseecode.execution.inputPosition = lastLetter;
		} else if (type == "line") {
			var endOfLine = $_eseecode.execution.inputPosition;
			while (endOfLine < $_eseecode.execution.inputRaw.length && $_eseecode.execution.inputRaw[endOfLine] != "\n") {
				endOfLine++;
			}
			result = $_eseecode.execution.inputRaw.substring($_eseecode.execution.inputPosition,endOfLine);
			$_eseecode.execution.inputPosition = endOfLine + 1;
		}
		return result;
	}

	/**
	 * Returns the current input position
	 * @since 2.3
	 * @public
	 * @return {Number} The index position of the input chain
	 * @example getInputPosition()
	 */
	function getInputPosition() {
		return $_eseecode.execution.inputPosition;
	}

	/**
	 * Sets the position of the input pointer to a fixed place
	 * @since 2.3
	 * @public
	 * @param {Number} [position=0] Position to go to
	 * @example inputReset(10)
	 */
	function inputReset(position) {
		$e_parseParameterTypes("inputReset", arguments);
		if (position === undefined) {
			position = 0;
		}
		$_eseecode.execution.inputPosition = position;
	}

	/**
	 * Checks if a key in the keyboard is being pressed
	 * @since 2.4
	 * @public
	 * @return {Boolean} Whether a key os being pressed or not
	 * @example getKeyboardPressed()
	 */
	function getKeyboardPressed() {
		var keyboard = $_eseecode.session.handlers.keyboard;
		return (keyboard && keyboard.key !== undefined);
	}
	
	/**
	 * Returns the value of the key in the keyboard is being pressed
	 * @since 2.4
	 * @public
	 * @return {String|Boolean} Value of the key being pressed, false if none is being pressed
	 * @example getKeyboardKey()
	 */
	function getKeyboardKey() {
		var keyboard = $_eseecode.session.handlers.keyboard;
		if (keyboard) {
			return String.fromCharCode(keyboard.key);
		} else {
			return false;
		}
	}
	
	/**
	 * Returns the code of the key in the keyboard is being pressed
	 * @since 2.4
	 * @public
	 * @return {Number|Boolean} Code of the key being pressed, false if none is being pressed
	 * @example getKeyboardKeycode()
	 */
	function getKeyboardKeycode() {
		var keyboard = $_eseecode.session.handlers.keyboard;
		if (keyboard) {
			return keyboard.key;
		} else {
			return false;
		}
	}
	
	/**
	 * Returns the value of the last key in the keyboard that was being pressed
	 * @since 2.4
	 * @public
	 * @return {String|Boolean} Value of the last key that was pressed, false if none has been pressed yet
	 * @example getKeyboardLastKey()
	 */
	function getKeyboardLastKey() {
		var keyboard = $_eseecode.session.handlers.keyboard;
		if (keyboard) {
			var value = String.fromCharCode(keyboard.lastKeycode);
			$_eseecode.session.handlers.keyboard.lastKeycode = undefined;
			return value;
		} else {
			return false;
		}
	}
	
	/**
	 * Returns the code of the last key in the keyboard that was being pressed and reset
	 * @since 2.4
	 * @public
	 * @return {Number|Boolean} Code of the last key that was pressed, false if none has been pressed yet
	 * @example getKeyboardLastKeycode()
	 */
	function getKeyboardLastKeycode() {
		var keyboard = $_eseecode.session.handlers.keyboard;
		if (keyboard) {
			return keyboard.lastKeycode;
			var value = keyboard.lastKeycode;
			$_eseecode.session.handlers.keyboard.lastKeycode = undefined;
			return value;
		} else {
			return false;
		}
	}
	
	/**
	 * Checks whether the pointer (mouse or touch panel) is being pressed (click if its a mouse, touch if its a tocuh device)
	 * @since 2.4
	 * @public
	 * @return {Boolean} Whether the pointer is being pressed
	 * @example getPointerPressed()
	 */
	function getPointerPressed() {
		var pointer = $_eseecode.session.handlers.pointer;
		return (pointer && pointer.pressed);
	}
	
	/**
	 * Checks whether the pointer (mouse or touch gesture) is over the whiteboard
	 * @since 2.4
	 * @public
	 * @return {Boolean} Whether the pointer is over the whiteboard or not
	 * @example getPointerOver()
	 */
	function getPointerOver() {
		return ($_eseecode.session.handlers.pointer.x !== undefined);
	}
	
	/**
	 * Returns the horitzontal position of the pointer (mouse or touch gesture) in the whiteboard
	 * @since 2.4
	 * @public
	 * @return {Number|Boolean} Horitzontal position of the pointer in the whiteboard, false if its not in the whiteboard
	 * @example getPointerX()
	 */
	function getPointerX() {
		var pointer = $_eseecode.session.handlers.pointer;
		if (pointer && pointer.x) {
			return $e_system2userCoords({x: pointer.x, y: pointer.y}).x;
		} else {
			return false; // Out of scope
		}
	}
	
	/**
	 * Returns the vertical position of the pointer (mouse or touch gesture) in the whiteboard
	 * @since 2.4
	 * @public
	 * @return {Number|Boolean} Vertical position of the pointer in the whiteboard, false if its not in the whiteboard
	 * @example getPointerY()
	 */
	function getPointerY() {
		var pointer = $_eseecode.session.handlers.pointer;
		if (pointer && pointer.y) {
			return $e_system2userCoords({x: pointer.x, y: pointer.y}).y;
		} else {
			return false; // Out of scope
		}
	}
	
	/**
	 * Returns the horitzontal position of the pointer the last time it was clicked (mouse or touch gesture) in the whiteboard
	 * @since 2.4
	 * @public
	 * @return {Number|Boolean} Horitzontal position of the pointer in the whiteboard, false if its not in the whiteboard
	 * @example getPointerLastX()
	 */
	function getPointerLastX() {
		var pointer = $_eseecode.session.handlers.pointer;
		if (pointer && pointer.lastX) {
			var value = $e_system2userCoords({x: pointer.lastX, y: pointer.lastY}).x;
			$_eseecode.session.handlers.pointer.lastX = undefined;
			return value;
		} else {
			return false; // Out of scope
		}
	}
	
	/**
	 * Returns the vertical position of the pointer the last time it was clicked (mouse or touch gesture) in the whiteboard
	 * @since 2.4
	 * @public
	 * @return {Number|Boolean} Vertical position of the pointer in the whiteboard, false if its not in the whiteboard
	 * @example getPointerLastY()
	 */
	function getPointerLastY() {
		var pointer = $_eseecode.session.handlers.pointer;
		if (pointer && pointer.lastY) {
			var value = $e_system2userCoords({x: pointer.lastX, y: pointer.lastY}).y;
			$_eseecode.session.handlers.pointer.lastY = undefined;
			return value;
		} else {
			return false; // Out of scope
		}
	}
	
	/**
	 * Returns the color in a certain coordinate in the current layer
	 * @since 2.4
	 * @public
	 * @param {Number} x Coordinate x of the position to check the color
	 * @param {Number} y Coordinate y of the position to check the color
	 * @param {Number|String} [id] Id of the layer to affect
	 * @return {String} Color in the specified position
	 * @example getPixelColor(100,100)
	 */
	function getPixelColor(x, y, layer) {
		if (id === undefined) {
			layer = $_eseecode.currentCanvas;
		} else {
			layer = $e_getLayer(id);
		}
		var coords = $e_user2systemCoords({x: x, y: y});
	    var p = layer.context.getImageData(coords.x, coords.y, 1, 1).data;
	    var r = p[0], g = p[1], b = p[2];
    	if (r > 255 || g > 255 || b > 255) {
        	// Invalid color component
        	return undefined;
    	}
	    var bytes = ((r << 16) | (g << 8) | b).toString(16);
	    return "#" + ("000000" + bytes).slice(-6);
	}
	
	/**
	 * Returns the character represented by a key code
	 * @since 2.4
	 * @public
	 * @return {Number} Current milliseconds in the current second
	 * @example getMilliseconds()
	 */
	function getMilliseconds() {
		return (new Date()).getMilliseconds()
	}
	
	/**
	 * Returns the character corresponding to a key code
	 * @since 2.4
	 * @public
	 * @param {String} keyCode Key code to convert
	 * @return {Number} The character corresponding to the key code
	 * @example getCharFromCode(110)
	 */
	function getCharFromCode(keyCode) {
		$e_parseParameterTypes("keyCode", arguments);
		return String.fromCharCode(keyCode);
	}
	
	/**
	 * Returns the current second
	 * @since 2.4
	 * @public
	 * @return {Number} Current second
	 * @example getSeconds()
	 */
	function getSeconds() {
		return (new Date()).getSeconds();
	}
	
	/**
	 * Returns the current minute
	 * @since 2.4
	 * @public
	 * @return {Number} Current minute
	 * @example getMinutes()
	 */
	function getMinutes() {
		return (new Date()).getMinutes();
	}
	
	/**
	 * Returns the current hour
	 * @since 2.4
	 * @public
	 * @return {Number} Current hour
	 * @example getHours()
	 */
	function getHours() {
		return (new Date()).getHours();
	}
	
	/**
	 * Returns the current day of the week
	 * @since 2.4
	 * @public
	 * @return {Number} Current day of the week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
	 * @example getWeekDay()
	 */
	function getWeekDay() {
		return (new Date()).getDay();
	}
	
	/**
	 * Returns the current day of the month
	 * @since 2.4
	 * @public
	 * @return {Number} Current day of the month
	 * @example getDay()
	 */
	function getDay() {
		return (new Date()).getDate();
	}
	
	/**
	 * Returns the current month
	 * @since 2.4
	 * @public
	 * @return {Number} Current month
	 * @example getMonth()
	 */
	function getMonth() {
		return (new Date()).getMonth();
	}
	
	/**
	 * Returns the current year
	 * @since 2.4
	 * @public
	 * @return {Number} Current year
	 * @example getYear()
	 */
	function getYear() {
		return (new Date()).getFullYear();
	}
	
	/**
	 * Returns a timestamp of the current hour
	 * @since 2.4
	 * @public
	 * @return {Number} Timestamp of the current hour, in Epoch format (milliseconds since 1970/01/01)
	 * @example getTimestamp()
	 */
	function getTimestamp() {
		return (new Date()).getTime();
	}
	
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