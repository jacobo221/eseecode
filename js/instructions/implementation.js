"use strict";

	/**
	 * Edits an existing window button
	 * @since 1.0
	 * @public
	 * @param {String} id Button id
	 * @param {String} [text] Text to show in the button
	 * @param {Number} [posx] X coordinate to place the button in the window
	 * @param {Number} [posy] Y coordinate to place the button in the window
	 * @param {String} [action] Code to run on button click
	 * @example windowButtonCreate("b2", "turn", 170, 90, "turnRight(15)")
	 */
	function windowButtonEdit(id, text, posx, posy, action) {
		var id = "element-"+id;
    		var button = document.getElementById(id);
		resizeConsole(true); // We need this to calculate the offset of the dialog window
		switchDialogMode("window"); // We need to display it order to get its coordinates, but we also want to display it since we are doing something with it so we want to display the window after execution is done
		button.style.position = "absolute";
		if (text) {
	    		button.value = text;
		}
		if (posx) {
			button.style.left = ($_eseecode.dialogWindow.offsetLeft+posx)+"px";
		}
		if (posy) {
			button.style.top = ($_eseecode.dialogWindow.offsetTop+posy)+"px";
		}
		if (action) {
			var oldButton = button;
			button = oldButton.cloneNode(true); // Clone to remove handlers
 			oldButton.parentNode.replaceChild(button, oldButton);
			if (action !== true) {
				if (!isTouchDevice()) {
		    			button.addEventListener("click", function() { execute(true,action); }, false);
				} else {
		    			button.addEventListener("touchstart", function() { execute(true,action); }, false);
				}
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
		var id = "element-"+id;
    		var div = document.getElementById(id);
		resizeConsole(true); // We need this to calculate the offset of the dialog window
		switchDialogMode("window");
		div.style.position = "absolute";
		if (text !== false) {
	    		div.innerHTML = text;
		}
		if (posx !== undefined) {
			div.style.left = ($_eseecode.dialogWindow.offsetLeft+posx)+"px";
		}
		if (posy !== undefined) {
			div.style.top = ($_eseecode.dialogWindow.offsetTop+posy)+"px";
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
	 * @param {String} canvasId Layer id that will be used as image
	 * @param {Number} [posx] X coordinate to place the image in the window
	 * @param {Number} [posy] Y coordinate to place the image in the window
	 * @param {Number} [width] Width to resize the image to
	 * @param {Number} [height] height to resize the image to
	 * @param {String} [onclick] Code to run when the image is clicked
	 * @param {String} [onmouseover] Code to run when the mouse is over the image
	 * @param {String} [onmouseout] Code to run when the mouse is moved away from being over the image
	 * @example windowImageEdit("img1", "3", 100, 100, 60, 15)
	 */
	function windowImageEdit(id, canvasId, posx, posy, width, height, onclick, onmouseover, onmouseout) {
		var id = "element-"+id;
    		var div = document.getElementById(id);
		resizeConsole(true); // We need this to calculate the offset of the dialog window
		switchDialogMode("window");
		img.style.position = "absolute";
		if (canvasId) {
			img.src = $_eseecode.canvasArray[canvasId].canvas.toDataURL();
		}
		if (posx !== undefined) {
			img.style.left = ($_eseecode.dialogWindow.offsetLeft+posx)+"px";
		}
		if (posy !== undefined) {
			img.style.top = ($_eseecode.dialogWindow.offsetTop+posy)+"px";
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
			if (onmouseover && onmouseover !== true) {
				if (onmouseover) {
					if (!isTouchDevice()) {
				    		img.addEventListener("mouseover",function() { execute(true,onmouseover); }, false);
					} else {
				    		img.addEventListener("touchstart",function() { execute(true,onmouseover); }, false);
					}
				}
			}
			if (onclick && onclick !== true) {
				if (onclick) {
					if (!isTouchDevice()) {
				    		img.addEventListener("click",function() { execute(true,onclick); }, false);
					} else {
		   	 			img.addEventListener("touchstart",function() { execute(true,onclick); }, false);
					}
				}
			}
			if (onmouseout && onmouseout !== true) {
				if (onmouseout) {
					if (!isTouchDevice()) {
				    		img.addEventListener("mouseout",function() { execute(true,onmouseout); }, false);
					} else {
		    			img.addEventListener("touchend",function() { execute(true,onmouseout); }, false);
					}
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
		var id = "element-"+id;
    		var input = document.getElementById(id);
		resizeConsole(true); // We need this to calculate the offset of the dialog window
		switchDialogMode("window");
		input.style.position = "absolute";
		if (width) {
			input.style.width = width+"px";
		}
		if (height) {
			input.style.height = height+"px";
		}
		input.style.left = ($_eseecode.dialogWindow.offsetLeft+posx)+"px";
		input.style.top = ($_eseecode.dialogWindow.offsetTop+posy)+"px";
		if (type) {
    			input.type = type;
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
		var id = "element-"+id;
    		var input = document.getElementById(id);
		switchDialogMode("window");
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
	 * @param {String} [action] Code to run on button click
	 * @example windowButtonCreate(1, "b2", "turn", 170, 90, "turnRight(15)")
	 */
	function windowButtonCreate(windowId, id, text, posx, posy, action) {
		var window = getWindow(windowId);
    		var button = document.createElement("input");
		button.id = "element-"+id;
    		button.type = "button";
		window.appendChild(button);
		windowButtonEdit(id, text, posx, posy, action);
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
		var window = getWindow(windowId);
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
	 * @param {String} canvasId Layer id that will be used as image
	 * @param {Number} [posx] X coordinate to place the image in the window
	 * @param {Number} [posy] Y coordinate to place the image in the window
	 * @param {Number} [width] Width to resize the image to
	 * @param {Number} [height] height to resize the image to
	 * @param {String} [onclick] Code to run when the image is clicked
	 * @param {String} [onmouseover] Code to run when the mouse is over the image
	 * @param {String} [onmouseout] Code to run when the mouse is moved away from being over the image
	 * @example windowImageCreate(1, "img1", "3", 100, 100, 60, 15)
	 */
	function windowImageCreate(windowId, id, canvasId, posx, posy, width, height, onclick, onmouseover, onmouseout) {
		var window = getWindow(windowId);
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
		var window = getWindow(windowId);
    		var input = document.createElement("input");
		input.id = "element-"+id;
		window.appendChild(input);
		windowInputEdit(id, posx, posy, width, height, type);
	}

	/**
	 * Removes a window and all of its child elements
	 * @since 1.0
	 * @public
	 * @param {Number} windowId Window id
	 * @example windowRemove(2)
	 */
	function windowRemove(id) {
		$_eseecode.dialogWindow.removeChild($_eseecode.windowsArray[id]);
	}

	/**
	 * Hides a layer
	 * @since 1.0
	 * @public
	 * @param {Number} id Layer id
	 * @example hide(2)
	 */
	function hide(id) {
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $_eseecode.canvasArray[id];
		}
		canvas.div.style.display = "none";
	}

	/**
	 * Hides the current window
	 * @since 1.0
	 * @public
	 * @example windowHide()
	 */
	function windowHide() {
		$_eseecode.currentWindow.style.display = "none";
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
		var value = undefined;
		if (document.getElementById("element-"+id) !== null) {
			value = document.getElementById("element-"+id).value;
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
	 * @param {Number} id Layer id
	 * @example show(2)
	 */
	function show(id) {
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $_eseecode.canvasArray[id];
		}
		canvas.div.style.display = "inline";
	}

	/**
	 * Shows the current window
	 * @since 1.0
	 * @public
	 * @example windowShow()
	 */
	function windowShow() {
		windowSwitch();
	}

	/**
	 * Changes the active window
	 * @since 1.0
	 * @public
	 * @param {Number} id Window id
	 * @example windowUse(2)
	 */
	function windowUse(id) {
		windowSwitch(id);
	}

	/**
	 * Returns the layer name
	 * @since 1.0
	 * @public
	 * @param {Number} id Layer id
	 * @return {String} Layer name
	 * @example getLayerName(2)
	 */
	function getLayerName(id) {
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $_eseecode.canvasArray[id];
		}
		var value = canvas.name;
		return value;
	}

	/**
	 * Returns if the specified layer is visible or hidden
	 * @since 1.0
	 * @public
	 * @param {Number} id Layer id
	 * @return {Boolean} Whether the specified layer is visible or hidden
	 * @example getLayerVisibility(2)
	 */
	function getLayerVisibility(id) {
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $_eseecode.canvasArray[id];
		}
		var value = (canvas.div.style.display != "none");
		return value;
	}

	/**
	 * Returns as a value the image visible in the specified layer
	 * @since 1.0
	 * @public
	 * @param {Number} id Layer id
	 * @return {String} Image in the specified layer
	 * @example getLayerImage(2)
	 */
	function getLayerImage(id) {
		if (typeof id === "undefined") {
			id = $_eseecode.canvasArray.length;
		}
		var value = null;
		if ($_eseecode.canvasArray[id]) {
			value = $_eseecode.canvasArray[id].canvas.toDataURL();
		}
		return value;
	}

	/**
	 * Moves the current layer
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} right Pixels to move to the right
	 * @param {Number} down Pixels to move down
	 * @example move(20,50)
	 */
	function move(right, down) {
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

	/**
	 * Moves the current layer horizontally
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Pixels to move to the right
	 * @example moveRight(20,50)
	 */
	function moveRight(pixels) {
		move(pixels, 0);
	}

	/**
	 * Moves the current layer horizontally
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Pixels to move to the left
	 * @example moveLeft(20,50)
	 */
	function moveLeft(pixels) {
		moveRight(-pixels);
	}

	/**
	 * Moves the current layer vertically
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Pixels to move down
	 * @example moveDown(20,50)
	 */
	function moveDown(pixels) {
		move(0, pixels);
	}

	/**
	 * Moves the current layer vertically
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Pixels to move up
	 * @example moveUp(20,50)
	 */
	function moveUp(pixels) {
		moveDown(-pixels);
	}

	/**
	 * Rotates the current layer
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} degrees Amount of degrees to rotate
	 * @param {Number} [axis=0] 0 = center, 1 = upper-left corner, 2 = upper-right corner, 3 = lower-right corner, 4= lower-left corner
	 * @example rotateRight(90)
	 */
	function rotateRight(degrees, axis) {
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
	function rotateLeft(degrees, axis) {
		rotateRight(-degrees, axis);
	}

	/**
	 * Scales the current layer
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @param {Number} horizontal Horizontal proportion
	 * @param {Number} vertical Vertical proportion
	 * @param {Number} [axis=0] 0 = center, 1 = upper-left corner, 2 = upper-right corner, 3 = lower-right corner, 4= lower-left corner
	 * @example scale(2,2)
	 */
	function scale(horizontal, vertical, axis) {
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

	/**
	 * Flips the current layer horizontally
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @example flipHorizontally()
	 */
	function flipHorizontally() {
		scale(-1, 1);
	}

	/**
	 * Flips the current layer vertically
	 * Any part of the image left outside the whiteboard will be lost
	 * @since 1.0
	 * @public
	 * @example flipVertically()
	 */
	function flipVertically() {
		scale(-1, -1);
	}

	/**
	 * Returns a random color
	 * @since 1.0
	 * @public
	 * @return {String} A random color
	 * @example getRandomColor()
	 */
	function getRandomColor() {
		var color = "#"+getRandomNumber(256).toString(16)+getRandomNumber(256).toString(16)+getRandomNumber(256).toString(16);
		return color;
	}

	/**
	 * Returns a positive random integer number
	 * @since 1.0
	 * @public
	 * @param {Number} number The highest number desired
	 * @return {Number} A positive random integer number
	 * @example getRandomNumber(100)
	 */
	function getRandomNumber(number) {
		var number = Math.floor(Math.random()*number); // [0,random-1]
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
		var value = Math.asin(angle*Math.PI/180);
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
		var value = Math.acos(angle*Math.PI/180);
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
		var value = Math.atan(angle*Math.PI/180);
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
	 * Returns the layer's cursor's position's X coordinate
	 * @since 1.0
	 * @public
	 * @param {Number} [id] Layer id
	 * @return {Number} The layer's cursor's position's X coordinate
	 * @example getX()
	 */
	function getX(id) {
		var turtle;
		if (typeof id === "undefined") {
			turtle = $_eseecode.currentCanvas.turtle;
		} else {
			turtle = $_eseecode.canvasArray[id].turtle;
		}
		return turtle.x;
	}

	/**
	 * Returns the layer's cursor's position's Y coordinate
	 * @since 1.0
	 * @public
	 * @param {Number} [id] Layer id
	 * @return {Number} The layer's cursor's position's Y coordinate
	 * @example getY()
	 */
	function getY(id) {
		var turtle;
		if (typeof id === "undefined") {
			turtle = $_eseecode.currentCanvas.turtle;
		} else {
			turtle = $_eseecode.canvasArray[id].turtle;
		}
		return turtle.y;
	}

	/**
	 * Returns the layer's cursor's position's angle
	 * Angle 0 is when the cursor is looking horizontally right
	 * @since 1.0
	 * @public
	 * @param {Number} [id] Layer id
	 * @return {Number} The layer's cursor's position's angle
	 * @example getAngle()
	 */
	function getAngle(id) {
		var turtle;
		if (typeof id === "undefined") {
			turtle = $_eseecode.currentCanvas.turtle;
		} else {
			turtle = $_eseecode.canvasArray[id].turtle;
		}
		return turtle.angle;
	}

	/**
	 * Draws a line from a coordinate to another
	 * @since 1.0
	 * @public
	 * @param {Number} originx X coordinate where the line starts
	 * @param {Number} originy Y coordinate where the line starts
	 * @param {Number} destinationx X coordinate where the line ends
	 * @param {Number} destinationy Y coordinate where the line ends
	 * @example lineAt(200, 200, 50, 50)
	 */
	function lineAt(originx, originy, destinationx, destinationy) {

		if (!$_eseecode.currentCanvas.shaping) {
			$_eseecode.currentCanvas.context.beginPath();
			$_eseecode.currentCanvas.context.moveTo(originx,originy); // shape should use forward() or line()
		}
		$_eseecode.currentCanvas.context.lineTo(destinationx,destinationy);
		if (!$_eseecode.currentCanvas.shaping) {
			$_eseecode.currentCanvas.context.closePath();
		}
		$_eseecode.currentCanvas.context.stroke();
	}

	/**
	 * Draws a line from current cursor position to a specified coodinate
	 * @since 1.0
	 * @public
	 * @param {Number} destinationx X coordinate where the line ends
	 * @param {Number} destinationy Y coordinate where the line ends
	 * @example line(50, 50)
	 */
	function line(destinationx, destinationy) {
		lineAt($_eseecode.currentCanvas.turtle.x,$_eseecode.currentCanvas.turtle.y,destinationx,destinationy,true);
		$_eseecode.currentCanvas.turtle.x = destinationx;
		$_eseecode.currentCanvas.turtle.y = destinationy;
		resetTurtle();
	}

	/**
	 * Moves the cursor forward
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Amount of pixels to move forward
	 * @example forward(50)
	 */
	function forward(pixels) {
		var posx = $_eseecode.currentCanvas.turtle.x+pixels*Math.cos($_eseecode.currentCanvas.turtle.angle*Math.PI/180);
		var posy = $_eseecode.currentCanvas.turtle.y+pixels*Math.sin($_eseecode.currentCanvas.turtle.angle*Math.PI/180);
		line(posx,posy); // line() sets the turtle
	}

	/**
	 * Moves the cursor backwards
	 * @since 1.0
	 * @public
	 * @param {Number} pixels Amount of pixels to move backwards
	 * @example back(50)
	 */
	function back(pixels) {
		forward(-pixels);
	}

	/**
	 * Draws an arc
	 * @since 1.0
	 * @public
	 * @param {Number} radius Radius of the arc
	 * @param {Number} degrees Amount of degrees to arc
	 * @param {Number} [axis=0] 0 = arc around the cursor, 1 = arc following the cursor's position and angle and move the cursor to the end of the arc
	 * @param {Boolean} [counterclockwise=false] Move clockwise or counterclockwise
	 * @example arc(50, 270)
	 */
	function arc(radius, degrees, axis, counterclockwise) {
		var posx, posy;
		var startradians, endradians;
		var move;
		if (counterclockwise) {
			degrees = -degrees;
			move = 1;
		} else {
			move = -1;
		}
		if (axis == 1) {
			startradians = ($_eseecode.currentCanvas.turtle.angle+90*move)*Math.PI/180;	
			posx = $_eseecode.currentCanvas.turtle.x+radius*Math.cos(($_eseecode.currentCanvas.turtle.angle-90*move)*Math.PI/180);
			posy = $_eseecode.currentCanvas.turtle.y+radius*Math.sin(($_eseecode.currentCanvas.turtle.angle-90*move)*Math.PI/180);
		} else {
			startradians = $_eseecode.currentCanvas.turtle.angle*Math.PI/180;
			posx = $_eseecode.currentCanvas.turtle.x;
			posy = $_eseecode.currentCanvas.turtle.y;
		}
		endradians = startradians + degrees*Math.PI/180;
		if (!$_eseecode.currentCanvas.shaping) {
			$_eseecode.currentCanvas.context.beginPath();
		}
		$_eseecode.currentCanvas.context.arc(posx,posy,radius,startradians,endradians,counterclockwise);
		$_eseecode.currentCanvas.context.stroke();
		if (!$_eseecode.currentCanvas.shaping) {
			$_eseecode.currentCanvas.context.closePath();
		}

		if (axis == 1) {
			var COx, COy; // vector from center to origin
			COx = $_eseecode.currentCanvas.turtle.x-posx;
			COy = $_eseecode.currentCanvas.turtle.y-posy;
			var rotateAngle = degrees*Math.PI/180;
			$_eseecode.currentCanvas.turtle.x = posx+Math.cos(rotateAngle)*COx-Math.sin(rotateAngle)*COy;
			$_eseecode.currentCanvas.turtle.y = posy+Math.sin(rotateAngle)*COx+Math.cos(rotateAngle)*COy;
		}
		$_eseecode.currentCanvas.turtle.angle += degrees;
		resetTurtle();
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
		if (angle === undefined) {
			angle = 0;
		}
		// We must create a new canvas and merge, otherwise if writeAt was called in the middle of a shape it would break the shape
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvasSize;
		tempCanvas.height = canvasSize;
		var tempCtx = tempCanvas.getContext("2d");
		tempCtx.translate(posx, posy);
		tempCtx.rotate(angle*Math.PI/180);
		// apply style properties to new canvas
		setColorStyle(undefined,tempCtx);
		setSizeStyle(undefined,tempCtx);
		setTextStyle(tempCtx);
		tempCtx.fillText(text, 0, 0);
		tempCtx.translate(-posx, -posy);
		$_eseecode.currentCanvas.context.drawImage(tempCanvas,0,0,canvasSize,canvasSize);
	}

	/**
	 * Writes text at cursor's position
	 * @since 1.0
	 * @public
	 * @param {String} text Text to write
	 * @example write("Hello!")
	 */
	function write(text) {
		writeAt(text, $_eseecode.currentCanvas.turtle.x, $_eseecode.currentCanvas.turtle.y, $_eseecode.currentCanvas.turtle.angle);
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
		$_eseecode.currentCanvas.context.moveTo($_eseecode.currentCanvas.turtle.x,$_eseecode.currentCanvas.turtle.y); // necessary to mark the starting point in shapes in case the turtle has never been moved before
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
	 * Turns the cursor right
	 * @since 1.0
	 * @public
	 * @param {Number} angle Angle
	 * @example turnRight(90)
	 */
	function turnRight(angle) {
		$_eseecode.currentCanvas.turtle.angle += angle;
		resetTurtle();
	}

	/**
	 * Turns the cursor left
	 * @since 1.0
	 * @public
	 * @param {Number} angle Angle
	 * @example turnLeft(90)
	 */
	function turnLeft(angle) {
		turnRight(-angle);
	}

	/**
	 * Turns the cursor to it's original angle
	 * The original angle is the cursor looking horizontally to the right
	 * @since 1.0
	 * @public
	 * @example turnReset()
	 */
	function turnReset() {
		$_eseecode.currentCanvas.turtle.angle = 0;		
		resetTurtle();
	}

	/**
	 * Turns the cursor right
	 * @since 1.0
	 * @public
	 * @param {String} src image source. Can be an external http:// image or an image from getLayerImage()
	 * @param {Number} posx X coordinate where the image will be placed
	 * @param {Number} posy Y coordinate where the image will be placed
	 * @param {Number} width Image width
	 * @param {Number} height Image height
	 * @example image(getLayerImage(3), 50, 50, 200, 150)
	 */
	function image(src, posx, posy, width, height) {
		var img = new Image();
		if (src) {
			img.src = src;
		}
		if (typeof height === "undefined") {
			$_eseecode.currentCanvas.context.drawImage(img, posx, posy);
		} else {
			$_eseecode.currentCanvas.context.drawImage(img, posx, posy, width, height);
		}
	}

	/**
	 * Moves the cursor to a specific position
	 * @since 1.0
	 * @public
	 * @param {Number} posx X coordinate where the cursor will be moved
	 * @param {Number} posy Y coordinate where the cursor will be moved
	 * @example goTo(50, 50)
	 */
	function goTo(posx, posy) {
		$_eseecode.currentCanvas.turtle.x = posx;
		$_eseecode.currentCanvas.turtle.y = posy;
		resetTurtle();
	}

	/**
	 * Moves the cursor to the center of the whiteboard
	 * @since 1.0
	 * @public
	 * @example goToCenter()
	 */
	function goToCenter() {
		goTo(getLayerWidth()/2,getLayerWidth()/2);
	}

	/**
	 * Moves the cursor to the upper-left corner of the whiteboard
	 * @since 1.0
	 * @public
	 * @example goToUpLeft()
	 */
	function goToUpLeft() {
		goTo(0,0);
	}

	/**
	 * Moves the cursor to the upper-right corner of the whiteboard
	 * @since 1.0
	 * @public
	 * @example goToUpRight()
	 */
	function goToUpRight() {
		goTo(getLayerWidth(),0);
	}

	/**
	 * Moves the cursor to the lower-left of the whiteboard
	 * @since 1.0
	 * @public
	 * @example goToLowLeft()
	 */
	function goToLowLeft() {
		goTo(0,getLayerWidth());
	}

	/**
	 * Moves the cursor to the lower-right of the whiteboard
	 * @since 1.0
	 * @public
	 * @example goToLowRight()
	 */
	function goToLowRight() {
		goTo(getLayerWidth(),getLayerWidth());
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
		var color = "rgb("+red+","+green+","+blue+")";
		return color;
	}

	/**
	 * Sets the layer transparency
	 * @since 1.0
	 * @public
	 * @param {Number} index Transparency index in the range [0,1]
	 * @example setInvisible(0.5)
	 */
	function setInvisible(index) {
		$_eseecode.currentCanvas.style.alpha = index;
		$_eseecode.currentCanvas.context.globalAlpha = index;
	}

	/**
	 * Unsets the layer transparency, back to opaque
	 * @since 1.0
	 * @public
	 * @example unsetInvisible()
	 */
	function unsetInvisible() {
		setInvisible(1);
	}

	/**
	 * Pushes a layer down in the layers order
	 * Upper layers overlap lower layers
	 * @since 1.0
	 * @public
	 * @param {Number} [levels=1] Amount of steps to push the layer down
	 * @example push(3)
	 */
	function push(levels) {
		if (typeof levels === "undefined") {
			levels = 1;
		}
		if (levels == 0) {
			return;
		}
		if ($_eseecode.canvasArray[0].layerUnder == $_eseecode.currentCanvas) {
			$_eseecode.canvasArray[0].layerUnder = $_eseecode.currentCanvas.layerUnder;
		}
		var layer = $_eseecode.currentCanvas;
		while (layer.layerUnder && levels != 0) { // this works also for levels=-1 meaning push to background
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
	}

	/**
	 * Pulls a layer up in the layers order
	 * Upper layers overlap lower layers
	 * @since 1.0
	 * @public
	 * @param {Number} [levels=1] Amount of steps to pull the layer up
	 * @example pull(3)
	 */
	function pull(levels) {
		if (typeof levels === "undefined") {
			levels = 1;
		}
		if (levels == 0) {
			return;
		}
		var layer = $_eseecode.currentCanvas;
		while (layer.layerOver && levels != 0) { // this works also for levels=-1 meaning push to background
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
			if ($_eseecode.canvasArray[0].layerUnder == oldLayerOver) {
				$_eseecode.canvasArray[0].layerUnder = $_eseecode.currentCanvas;
			}
			levels--;
		}
	}

	/**
	 * Deletes all content in a layer
	 * @since 1.0
	 * @public
	 * @param {Number} [id] Layer id. If missing, currently active layer
	 * @example clean()
	 */
	function clean(id) {
		if (id === undefined) {
			id = $_eseecode.currentCanvas.name;
		}
		clearCanvas(id);
	}

	/**
	 * Starts an animation, returns an animation handler
	 * It will run a code on every specified time until the code returns false or an amount of times is specified
	 * @since 2.0
	 * @public
	 * @param {String} command Code to run on every 
	 * @param {Number} seconds Seconds between each code run
	 * @param {Number} [count] Maximum amount of times to run the animation
	 * @param {Number} [timeoutHandlersIndex] Animation handler to use
	 * @return {Number} Animation handler
	 * @example animate(0.25, "stepForward()")
	 */
	function animate(command, seconds, count, timeoutHandlersIndex) {
		var returnValue;
		try {
			returnValue = eval(command);
		} catch(event) {
			// TODO: delays should reset timeout timestamp to avoid infinite loops but don't stop the animation with general timeout
			if (event !== "executionTimeout") {
				throw event;
			}
		}
		if (timeoutHandlersIndex === undefined) {
			timeoutHandlersIndex = $_eseecode.session.timeoutHandlers.length;
		} else {			
			clearTimeout($_eseecode.session.timeoutHandlers[timeoutHandlersIndex]);
		}
		if (count > 1 || (count === undefined && returnValue !== false)) {
			$_eseecode.session.timeoutHandlers[timeoutHandlersIndex] = setTimeout(function() { animate(command, seconds, (count !== undefined)?count-1:count, timeoutHandlersIndex); },seconds*1000);
		}
		return timeoutHandlersIndex;
	}

	/**
	 * Stops an animation
	 * @since 2.0
	 * @public
	 * @param {Number} [timeoutHandlersIndex] Animation handler to stop
	 * @example unanimate(2)
	 */
	function unanimate(timeoutHandlersIndex) {
		clearTimeout($_eseecode.session.timeoutHandlers[timeoutHandlersIndex]);
		delete $_eseecode.session.timeoutHandlers[timeoutHandlersIndex];
	}

	/**
	 * Switches the currently active layer, returns the layer name
	 * @since 1.0
	 * @public
	 * @param {Number} [id] Layer id. If unset it switches to a new layer
	 * @return {Number} Layer name
	 * @example use()
	 */
	function use(id) {
		var canvas = switchCanvas(id);
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
		setSizeStyle(size);
	}

	/**
	 * Resets the size of the future draw lines and text in the currently active layer
	 * @since 1.0
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
		setColorStyle(color);
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
		$_eseecode.currentCanvas.style.font = font;
		setTextStyle();
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
		if (bold === undefined || bold) { // optional parameter
			$_eseecode.currentCanvas.style.bold = true;
		} else {
			$_eseecode.currentCanvas.style.bold = false;
		}
		setTextStyle();
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
		if (italic === undefined || italic) { // optional parameter
			$_eseecode.currentCanvas.style.italic = true;
		} else {
			$_eseecode.currentCanvas.style.italic = false;
		}
		setTextStyle();
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
		return windowElementRemove(id);
	}

	/**
	 * Deletes a window static text
	 * @since 1.0
	 * @public
	 * @param {String} id Static text id
	 * @example windowTextRemove("b1")
	 */
	function windowTextRemove(id) {
		return windowElementRemove(id);
	}

	/**
	 * Deletes a window image
	 * @since 1.0
	 * @public
	 * @param {String} id Image id
	 * @example windowImageRemove("b1")
	 */
	function windowImageRemove(id) {
		return windowElementRemove(id);
	}

	/**
	 * Deletes a window input box
	 * @since 1.0
	 * @public
	 * @param {String} id Input box id
	 * @example windowInputRemove("b1")
	 */
	function windowInputRemove(id) {
		return windowElementRemove(id);
	}

	/**
	 * Hides a window button
	 * @since 1.0
	 * @public
	 * @param {String} id Button id
	 * @example windowButtonHide("b1")
	 */
	function windowButtonHide(id) {
		windowElementHide(id);
	}

	/**
	 * Hides a window static text
	 * @since 1.0
	 * @public
	 * @param {String} id Static text id
	 * @example windowTextHide("t1")
	 */
	function windowTextHide(id) {
		windowElementHide(id);
	}

	/**
	 * Hides a window input box
	 * @since 1.0
	 * @public
	 * @param {String} id Input box id
	 * @example windowInputHide("i1")
	 */
	function windowInputHide(id) {
		windowElementHide(id);
	}

	/**
	 * Hides a window image
	 * @since 1.0
	 * @public
	 * @param {String} id Image id
	 * @example windowImageHide("img1")
	 */
	function windowImageHide(id) {
		windowElementHide(id);
	}

	/**
	 * Shows a window button if it was hidden
	 * @since 1.0
	 * @public
	 * @param {String} id Button id
	 * @example windowButtonShow("b1")
	 */
	function windowButtonShow(id) {
		windowElementShow(id);
	}

	/**
	 * Shows a window static text if it was hidden
	 * @since 1.0
	 * @public
	 * @param {String} id Static text id
	 * @example windowTextShow("t1")
	 */
	function windowTextShow(id) {
		windowElementShow(id);
	}

	/**
	 * Shows a window image if it was hidden
	 * @since 1.0
	 * @public
	 * @param {String} id Image id
	 * @example windowImageShow("img1")
	 */
	function windowImageShow(id) {
		windowElementShow(id);
	}

	/**
	 * Shows a window input box if it was hidden
	 * @since 1.0
	 * @public
	 * @param {String} id Input box id
	 * @example windowInputShow("i1")
	 */
	function windowInputShow(id) {
		windowElementShow(id);
	}

	/**
	 * Stops the execution of any future code
	 * @since 1.0
	 * @public
	 * @example stop()
	 */
	function stop() {
		limitProgramCounter = true;
	}
