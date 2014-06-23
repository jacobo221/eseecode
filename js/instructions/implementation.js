"use strict";

	/**
	 * Edits a window button
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
	 * Edits a window static text
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
	 * Edits a window embedded image
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
	 * Edits a window input box
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
	 * Edits a window input box
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

	function windowButtonCreate(windowId, id, text, posx, posy, action) {
		var window = getWindow(windowId);
    		var button = document.createElement("input");
		button.id = "element-"+id;
    		button.type = "button";
		window.appendChild(button);
		windowButtonEdit(id, text, posx, posy, action);
	}

	function windowTextCreate(windowId, id, text, posx, posy, width, bold, italic, size, color, family) {
		var window = getWindow(windowId);
    		var div = document.createElement("div");
		div.id = "element-"+id;
		window.appendChild(div);
		windowTextEdit(id, text, posx, posy, width, bold, italic, size, color, family);
	}

	function windowImageCreate(windowId, id, canvasId, posx, posy, width, height, onclick, onmouseover, onmouseout) {
		var window = getWindow(windowId);
    		var img = document.createElement("img");
		img.id = "element-"+id;
		window.appendChild(img);
		windowImageEdit(id, canvasId, posx, posy, width, height, onclick, onmouseover, onmouseout);
	}

	function windowInputCreate(windowId, id, posx, posy, width, height, type) {
		var window = getWindow(windowId);
    		var input = document.createElement("input");
		input.id = "element-"+id;
		window.appendChild(input);
		windowInputEdit(id, posx, posy, width, height, type);
	}

	function windowRemove(id) {
		$_eseecode.dialogWindow.removeChild($_eseecode.windowsArray[id]);
	}

	/* hide(id): Hides canvas
	*/
	function hide(id) {
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $_eseecode.canvasArray[id];
		}
		canvas.div.style.display = "none";
	}

	function windowHide() {
		$_eseecode.currentWindow.style.display = "none";
	}

	function windowInputGet(id) {
		var value = undefined;
		if (document.getElementById("element-"+id) !== null) {
			value = document.getElementById("element-"+id).value;
		}
		return value;
	}

	function windowTextGet(id) {
		var value = undefined;
		if (document.getElementById("element-"+id) !== null) {
			value = document.getElementById("element-"+id).innerHTML;
		}
		return value;
	}

	/* show(id): Shows canvas
	*/
	function show(id) {
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $_eseecode.canvasArray[id];
		}
		canvas.div.style.display = "inline";
	}

	function windowShow() {
		windowSwitch();
	}
	function windowUse(id) {
		windowSwitch(id);
	}

	function getCanvasLayerName(id) {
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $_eseecode.canvasArray[id];
		}
		var value = canvas.name;
		return value;
	}

	function getCanvasLayerVisibility(id) {
		var canvas = $_eseecode.currentCanvas;
		if (id !== undefined) {
			canvas = $_eseecode.canvasArray[id];
		}
		var value = (canvas.div.style.display != "none");
		return value;
	}

	function getCanvasLayerImage(id) {
		if (typeof id === "undefined") {
			id = $_eseecode.canvasArray.length;
		}
		var value = null;
		if ($_eseecode.canvasArray[id]) {
			value = $_eseecode.canvasArray[id].canvas.toDataURL();
		}
		return value;
	}

	/* move(id, right, down): Moves canvas to a specific position in the whiteboard
		right: amount of pixels to move to the right
		down: amount of pixels to move to the down
	*/
	function move(right, down) {
		var canvasSize = whiteboard.offsetWidth;
		var tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvasSize;
		tempCanvas.height = canvasSize;
		var tempCtx = tempCanvas.getContext("2d");
		tempCtx.translate(right, down);
		tempCtx.drawImage($_eseecode.currentCanvas.canvas,0,0,canvasSize,canvasSize);
		clean();
		$_eseecode.currentCanvas.context.drawImage(tempCanvas,0,0,canvasSize,canvasSize);
	}
	function moveRight(pixels) {
		move(pixels, 0);
	}
	function moveLeft(pixels) {
		moveRight(-pixels);
	}
	function moveDown(pixels) {
		move(0, pixels);
	}
	function moveUp(pixels) {
		moveDown(-pixels);
	}

	/* rotateRight(id, degrees): Rotate canvas to the right
		degrees: amount of degrees to rotate
		axis: 0 = center, 1 = upper-left corner (optional, default: 0)
	*/
	function rotateRight(degrees, axis) {
		var canvasSize = whiteboard.offsetWidth;
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

	/* scale(id, horizontal, vertical, center): Scale canvas
		horizontal: horizontal proportion
		vertical: vertical proportion
		axis: 0 = center, 1 = upper-left corner (optional, default: 0)
	*/
	function scale(horizontal, vertical, axis) {
		var color = $_eseecode.currentCanvas.style.color;
		var size = $_eseecode.currentCanvas.style.size;
		var canvasSize = whiteboard.offsetWidth;
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
	function flipHorizontally() {
		scale(-1, 1);
	}
	function flipVertically() {
		scale(-1, -1);
	}

	function getRandomColor() {
		var color = "#"+getRandomNumber(256).toString(16)+getRandomNumber(256).toString(16)+getRandomNumber(256).toString(16);
		return color;
	}

	function getRandomNumber(number) {
		var number = Math.floor(Math.random()*number); // [0,random-1]
		return number;
	}

	function getSine(angle) {
		var value = Math.sin(angle*Math.PI/180);
		return value;
	}

	function getArcsine(angle) {
		var value = Math.asin(angle*Math.PI/180);
		return value;
	}

	function getCosine(angle) {
		var value = Math.cos(angle*Math.PI/180);
		return value;
	}

	function getArccosine(angle) {
		var value = Math.acos(angle*Math.PI/180);
		return value;
	}

	function getTangent(angle) {
		var value = Math.tan(angle*Math.PI/180);
		return value;
	}

	function getArctangent(angle) {
		var value = Math.atan(angle*Math.PI/180);
		return value;
	}

	function getSum(number1, number2) {
		var value = number1 + number2;
		return value;
	}

	function getSubstraction(number1, number2) {
		var value = number1 - number2;
		return value;
	}

	function getMultiplication(number1, number2) {
		var value = number1 * number2;
		return value;
	}

	function getDivision(number1, number2) {
		var value = number1 / number2;
		return value;
	}

	function getRemainder(number1, number2) {
		var value = number1 % number2;
		return value;
	}

	function getSquareRoot(number) {
		var value = Math.sqrt(number);
		return value;
	}

	function getCanvasWidth() {
		var canvasSize = whiteboard.clientWidth;
		return canvasSize;
	}

	function getCanvasHeight() {
		var canvasSize = whiteboard.clientHeight;
		return canvasSize;
	}

	function getX(id) {
		var turtle;
		if (typeof id === "undefined") {
			turtle = $_eseecode.currentCanvas.turtle;
		} else {
			turtle = $_eseecode.canvasArray[id].turtle;
		}
		return turtle.x;
	}

	function getY(id) {
		var turtle;
		if (typeof id === "undefined") {
			turtle = $_eseecode.currentCanvas.turtle;
		} else {
			turtle = $_eseecode.canvasArray[id].turtle;
		}
		return turtle.y;
	}

	function getAngle(id) {
		var turtle;
		if (typeof id === "undefined") {
			turtle = $_eseecode.currentCanvas.turtle;
		} else {
			turtle = $_eseecode.canvasArray[id].turtle;
		}
		return turtle.angle;
	}

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

	function line(destinationx, destinationy) {
		lineAt($_eseecode.currentCanvas.turtle.x,$_eseecode.currentCanvas.turtle.y,destinationx,destinationy,true);
		$_eseecode.currentCanvas.turtle.x = destinationx;
		$_eseecode.currentCanvas.turtle.y = destinationy;
		resetTurtle();
	}
	function forward(pixels) {
		var posx = $_eseecode.currentCanvas.turtle.x+pixels*Math.cos($_eseecode.currentCanvas.turtle.angle*Math.PI/180);
		var posy = $_eseecode.currentCanvas.turtle.y+pixels*Math.sin($_eseecode.currentCanvas.turtle.angle*Math.PI/180);
		line(posx,posy); // line() sets the turtle
	}
	function back(pixels) {
		forward(-pixels);
	}

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

	function writeAt(text, posx, posy) {
		// We must create a new canvas and merge, otherwise if writeAt was called in the middle of a shape it would break the shape
		var canvasSize = whiteboard.offsetWidth;
		var tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvasSize;
		tempCanvas.height = canvasSize;
		var tempCtx = tempCanvas.getContext("2d");
		tempCtx.translate(posx, posy);
		tempCtx.rotate($_eseecode.currentCanvas.turtle.angle*Math.PI/180);
		// apply style properties to new canvas
		setColor(undefined,tempCtx);
		setSize(undefined,tempCtx);
		setTextStyle(tempCtx);
		tempCtx.fillText(text, 0, 0);
		tempCtx.translate(-posx, -posy);
		$_eseecode.currentCanvas.context.drawImage(tempCanvas,0,0,canvasSize,canvasSize);
	}
	function write(text) {
		writeAt(text, $_eseecode.currentCanvas.turtle.x, $_eseecode.currentCanvas.turtle.y);
	}

	function beginShape() {
		$_eseecode.currentCanvas.shaping = true;
		$_eseecode.currentCanvas.context.beginPath();
		$_eseecode.currentCanvas.context.moveTo($_eseecode.currentCanvas.turtle.x,$_eseecode.currentCanvas.turtle.y); // necessary to mark the starting point in shapes in case the turtle has never been moved before
	}

	function endShape() {
		$_eseecode.currentCanvas.shaping = false;
		$_eseecode.currentCanvas.context.closePath();
		$_eseecode.currentCanvas.context.fill();
	}

	function turnRight(angle) {
		$_eseecode.currentCanvas.turtle.angle += angle;
		resetTurtle();
	}
	function turnLeft(angle) {
		turnRight(-angle);
	}

	function turnReset() {
		$_eseecode.currentCanvas.turtle.angle = 0;		
		resetTurtle();
	}

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

	function goTo(posx, posy) {
		$_eseecode.currentCanvas.turtle.x = posx;
		$_eseecode.currentCanvas.turtle.y = posy;
		resetTurtle();
	}
	function goToCenter() {
		goTo(getCanvasWidth()/2,getCanvasWidth()/2);
	}
	function goToUpLeft() {
		goTo(0,0);
	}
	function goToUpRight() {
		goTo(getCanvasWidth(),0);
	}
	function goToLowLeft() {
		goTo(0,getCanvasWidth());
	}
	function goToLowRight() {
		goTo(getCanvasWidth(),getCanvasWidth());
	}

	function getRGB(red, green, blue) {
		var color = "rgb("+red+","+green+","+blue+")";
		return color;
	}

	function setInvisible(index) {
		$_eseecode.currentCanvas.style.alpha = index;
		$_eseecode.currentCanvas.context.globalAlpha = index;
	}
	function unsetInvisible() {
		setInvisible(1);
	}

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

	function clean(id) {
		if (id === undefined) {
			id = $_eseecode.currentCanvas.name;
		}
		clearCanvas(id);
	}

	/**
	 * @since 2.0
	function animate(seconds, command, count, timeoutHandlersIndex) {
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
		}
		if (count > 1 || (count === undefined && returnValue !== false)) {
			$_eseecode.session.timeoutHandlers[timeoutHandlersIndex] = setTimeout(function() { animate(seconds, command, (count !== undefined)?count-1:count, timeoutHandlersIndex); },seconds*1000);
		}
		return timeoutHandlersIndex;
	}

	function unanimate(timeoutHandlersIndex) {
		clearTimeout($_eseecode.session.timeoutHandlers[timeoutHandlersIndex]);
		delete $_eseecode.session.timeoutHandlers[timeoutHandlersIndex];
	}

	function use(id) {
		var canvas = switchCanvas(id);
		return canvas.name;
	}

	function setTextStyle(context) {
		if (context === undefined) {
			context = $_eseecode.currentCanvas.context;
		}
		var style = $_eseecode.currentCanvas.style;
		var font = "";
		if (style.italic) {
			font += "italic ";
		}
		if (style.bold) {
			font += "bold ";
		}
		font += (style.size+$_eseecode.setup.defaultFontSize)+"px ";
		font += style.font;
		context.font = font;
	}
	function setSize(size, context) {
		if (size === undefined) {
			size = $_eseecode.currentCanvas.style.size;
		}
		if (context === undefined) {
			context = $_eseecode.currentCanvas.context;
		}
		$_eseecode.currentCanvas.style.size = size;
		if (size < 1) {
			context.lineWidth = 1;
		} else {
			context.lineWidth = size;
		}
		setTextStyle();
	}
	function unsetSize() {
		setSize(2); // default is 2 because 1 (odd widths) is rendered in half pixels and shows different width in some browsers
	}
	function setColor(color, context) {
		if (color === undefined) {
			color = $_eseecode.currentCanvas.style.color;
		}
		if (context === undefined) {
			context = $_eseecode.currentCanvas.context;
		}
		$_eseecode.currentCanvas.style.color = color;
		context.fillStyle = color;
		context.strokeStyle = color;
		setTextStyle(context);
	}
	function unsetColor() { // Sets color to transparent
		setColor("transparent");
	}
	function setFont(font) {
		$_eseecode.currentCanvas.style.font = font;
		setTextStyle();
	}
	function unsetFont() {
		setFont("sans-serif");
	}
	function setBold(bool) {
		if (!bool) { // optional parameter
			$_eseecode.currentCanvas.style.bold = false;
		} else {
			$_eseecode.currentCanvas.style.bold = true;
		}
		setTextStyle();
	}
	function unsetBold() {
		setBold(false);
	}
	function setItalic(bool) {
		if (!bool) { // optional parameter
			$_eseecode.currentCanvas.style.italic = false;
		} else {
			$_eseecode.currentCanvas.style.italic = true;
		}
		setTextStyle();
	}
	function unsetItalic() {
		setItalic(false);
	}

	function windowElementRemove(id) {
		var obj = document.getElementById("element-"+id);
		if (!obj) {
			return false;
		}
		var objParent = obj.parentNode;
		if (!objParent) {
			return false;
		}
		return objParent.removeChild(obj);
	}
	function windowButtonRemove(id) {
		return windowElementRemove(id);
	}
	function windowTextRemove(id) {
		return windowElementRemove(id);
	}
	function windowImageRemove(id) {
		return windowElementRemove(id);
	}
	function windowInputRemove(id) {
		return windowElementRemove(id);
	}

	function windowElementHide(id) {
		var obj = document.getElementById("element-"+id);
		obj.style.display = "none";
	}
	function windowButtonHide(id) {
		windowElementHide(id);
	}
	function windowTextHide(id) {
		windowElementHide(id);
	}
	function windowInputHide(id) {
		windowElementHide(id);
	}
	function windowImageHide(id) {
		windowElementHide(id);
	}

	function windowElementShow(id) {
		var obj = document.getElementById("element-"+id);
		obj.style.display = "inline";
	}
	function windowButtonShow(id) {
		windowElementShow(id);
	}
	function windowTextShow(id) {
		windowElementShow(id);
	}
	function windowImageShow(id) {
		windowElementShow(id);
	}
	function windowInputShow(id) {
		windowElementShow(id);
	}

	function stop() {
		limitProgramCounter = true;
	}
