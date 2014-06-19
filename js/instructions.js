"use strict";

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

	$_eseecode.instructions.set = [
		{ name: "null", category: "internal", parameters: [{name: "text", type: "string"}], show: [], code: { noName: true, noBrackets: true } },
		{ name: "nullChild", category: "internal", parameters: null, show: [], dummy: true, code: { noName: true, noBrackets: true, unindent: true }, validate: true },
		{ name: "unknownFunction", category: "internal", parameters: [{name: "parameters...", type: "string"}], show: [], code: { noName: true } },
		{ name: "object", category: "other", parameters: null, return: "object", show: [], block: ["endObject"], nameRewrite: { level3: "", level4: "" }, code: { prefix: "{ " } },
		{ name: "comment", category: "other", parameters: [{name: "comment", type: "string"}], tip: "Comment text, ignored during execution", show: ["level3","level4"], nameRewrite: { level1: "Comment:", level2: "Comment:", level3: "//", level4: "//" }, code: { space: true, noBrackets: true }, validate: function() { return true } },
		{ name: "commentmultiline", category: "other", parameters: [{name: "comment", type: "string"}], tip: "Comment text, ignored during execution", show: [], block: ["endComment"], nameRewrite: { level1: "Comment:", level2: "Comment:", level3: "/*", level4: "/*" }, code: { space: true, noBrackets: true }, validate: true },
		{ name: "commentmultilinesingle", category: "other", parameters: [{name: "comment", type: "string"}], tip: "Comment text, ignored during execution", show: [], nameRewrite: { level1: "Comment:", level2: "Comment:", level3: "/*", level4: "/*" }, code: { space: true, noBrackets: true, suffix: " */" }, validate: function() { return true } },
		{ name: "beginShape", category: "turtle", parameters: [], tip: "Begins a shape definition", show: ["level2","level3","level4"] },
		{ name: "endShape", category: "turtle", parameters: [], tip: "Ends a shape definition", show: ["level2","level3","level4"] },
		{ name: "clean", category: "canvas", parameters: [{ name: "id", type: "int" }], tip: "Wipes the canvas", show: ["level3", "level4"] },
		{ name: "flipHorizontally", category: "canvas", parameters: [], tip: "Flips the canvas horizontally", show: ["level2","level3","level4"] },
		{ name: "flipVertically", category: "canvas", parameters: [], tip: "Flips the canvas vertically", show: ["level2","level3","level4"] },
		{ name: "blank", category: "turtle", show: ["level1","level2"] },
		{ name: "forward", category: "turtle", parameters: [{name: "pixels",default: 100, type: "int", tip: "How many pixels do you want to move forward?"}], tip: "Moves forward", show: ["level2","level3","level4"] },
		{ name: "forward", category: "turtle", parameters: [{name: "pixels",default: 100, type: "int", tip: "How many pixels do you want to move forward?"}], tip: "Moves 100 steps forward", show: ["level1"] },
		{ name: "forward", category: "turtle", parameters: [{name: "pixels", default: 50, type: "int"}], tip: "Moves 50 steps forward", show: ["level1"] },
		{ name: "forward", category: "turtle", parameters: [{name: "pixels", default: 25, type: "int"}], tip: "Moves 25 step forward", show: ["level1"] },
		{ name: "arc", category: "turtle", parameters: [{name: "radius", default: 50, type: "int" }, { name: "degrees", default: 15 }, { name: "axis", default: 0 }, { name: "counterclockwise", default: false }], tip: "Draws an arc", show: ["level3","level4"] },
		{ name: "blank", category: "turtle", show: ["level1"] },
		{ name: "turnLeft", category: "turtle", parameters: [{name: "degrees", default: 90, type: "int", tip: "How many degrees do you want to turn?"}], tip: "Turns left", show: ["level2","level3","level4"] },
		{ name: "turnLeft", category: "turtle", parameters: [{name: "degrees", default: 90, type: "int", tip: "How many degrees do you want to turn?"}], tip: "Turns 90 degrees left", show: ["level1"] },
		{ name: "turnLeft", category: "turtle", parameters: [{name: "degrees", default: 45, type: "int"}], tip: "Turns 45 degrees left", show: ["level1"] },
		{ name: "turnLeft", category: "turtle", parameters: [{name: "degrees", default: 15, type: "int"}], tip: "Turns 15 degrees left", show: ["level1"] },
		{ name: "blank", category: "turtle", show: ["level1"] },
		{ name: "turnRight", category: "turtle", parameters: [{name: "degrees", default: 90, type: "int", tip: "How many degrees do you want to turn?"}], tip: "Turns right", show: ["level2","level3","level4"] },
		{ name: "turnRight", category: "turtle", parameters: [{name: "degrees", default: 90, type: "int", tip: "How many degrees do you want to turn?"}], tip: "Turns 90 degrees right", show: ["level1"] },
		{ name: "turnRight", category: "turtle", parameters: [{name: "degrees", default: 45, type: "int"}], tip: "Turns 45 degrees right", show: ["level1"] },
		{ name: "turnRight", category: "turtle", parameters: [{name: "degrees", default: 15, type: "int"}], tip: "Turns 15 degrees right", show: ["level1"] },
		{ name: "turnReset", category: "turtle", parameters: [], tip: "Resets the angle to initial rotation", show: ["level3","level4"] },
		{ name: "blank", category: "turtle", show: ["level1","level2"] },
		{ name: "=", category: "value", parameters: [{name: "variable", type: "var"},{name: "value", default: undefined, type: "var"}], return: "var", tip: "Assigns a value to a variable", show: ["level3","level4"], validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); }, inorder: true },
		{ name: "getArccosine", category: "value", parameters: [{name: "degrees", default: 90, type: "int"}], return: "int", tip: "Returns the arccosine", show: ["level3","level4"] },
		{ name: "getArcsine", category: "value", parameters: [{name: "degrees", default: 90, type: "int"}], return: "int", tip: "Returns the arcsine", show: ["level3","level4"] },
		{ name: "getArctangent", category: "value", parameters: [{name: "degrees", default: 90, type: "int"}], return: "int", tip: "Returns the arctangent", show: ["level3","level4"] },
		{ name: "getCanvasHeight", category: "value", parameters: [], return: "int", tip: "Returns the canvas height", show: ["level3","level4"] },
		{ name: "getCanvasWidth", category: "value", parameters: [], return: "int", tip: "Returns the canvas width", show: ["level3","level4"] },
		{ name: "getCanvasLayerName", category: "value", parameters: [], return: "string", tip: "Returns the current canvas' name", show: ["level3","level4"] },
		{ name: "getCanvasLayerVisibility", category: "value", parameters: [{name: "canvasId", default: undefined, type: "int"}], return: "bool", tip: "Returns if the layer is visible", show: ["level3","level4"] },
		{ name: "getCosine", category: "value", parameters: [{name: "degrees", default: 90, type: "int"}], return: "int", tip: "Returns the cosine", show: ["level3","level4"] },
		{ name: "getRandomColor", category: "value", parameters: [], return: "color", tip: "Returns a random color", show: ["level3","level4"] },
		{ name: "getRandomNumber", category: "value", parameters: [{name: "number", default: 100, type: "int"}], return: "int", tip: "Returns a random number", show: ["level3","level4"] },
		{ name: "getRGB", category: "value", parameters: [{name: "red", default: 0},{name: "green", default: 0, type: "int"},{name: "blue", default: 0}], return: "int", tip: "Returns a color from and RGB definition", show: ["level3","level4"] },
		{ name: "getSine", category: "value", parameters: [{name: "degrees", default: 90, type: "int"}], return: "int", tip: "Returns the sine", show: ["level3","level4"] },
		{ name: "getTangent", category: "value", parameters: [{name: "degrees", default: 90, type: "int"}], return: "int", tip: "Returns the tangent", show: ["level3","level4"] },
		{ name: "getAngle", category: "value", parameters: [{name: "id", type: "int"}], return: "int", tip: "Returns the current angle", show: ["level3","level4"] },
		{ name: "getX", category: "value", parameters: [{name: "id", type: "int"}], return: "int", tip: "Returns the X coordinate", show: ["level3","level4"] },
		{ name: "getY", category: "value", parameters: [{name: "id", type: "int"}], return: "int", tip: "Returns the Y coordinate", show: ["level3","level4"] },
		{ name: "getCanvasLayerImage", category: "value", parameters: [{name: "id", type: "int"}], return: "string", tip: "Returns the image in the canvas", show: ["level4"] },
		{ name: "setColor", category: "turtle", parameters: [{name: "color", default: "\"#FF0000\"", type: "color", tip: "Which color do you want to use?"}], tip: "Sets the drawing color", show: ["level2","level3","level4"] },
		{ name: "unsetColor", category: "turtle", parameters: [], tip: "Resets the drawing color", show: ["level1","level2","level3","level4"] },
		{ name: "unsetSize", category: "turtle", parameters: [], tip: "Unsets the drawing size", show: ["level1"] },
		{ name: "blank", category: "turtle", show: ["level1","level2"] },
		{ name: "goToUpLeft", category: "turtle", parameters: [], tip: "Moves to the upper left of the canvas", show: ["level1","level2","level3","level4"] },
		{ name: "goToUpRight", category: "turtle", parameters: [], tip: "Moves to the upper right of the canvas", show: ["level1","level2","level3","level4"] },
		{ name: "goToCenter", category: "turtle", parameters: [], tip: "Moves to the center of the canvas", show: ["level1","level2","level3","level4"] },
		{ name: "goToLowLeft", category: "turtle", parameters: [], tip: "Moves to the lower left of the canvas", show: ["level1","level2","level3","level4"] },
		{ name: "goToLowRight", category: "turtle", parameters: [], tip: "Moves to the lower right of the canvas", show: ["level1","level2","level3","level4"] },
		{ name: "goTo", category: "turtle", parameters: [{name: "posx", default: 0, type: "int", tip: "Set X coordinate to go to"},{name: "posy",default: 0, type: "int", tip: "Set Y coordinate to go to"}], tip: "Moves to the specified coordinates in the canvas", show: ["level2","level3","level4"] },
		{ name: "blank", category: "turtle", show: ["level1","level2"] },
		{ name: "setSize", category: "turtle", parameters: [{name: "size", default: 16, type: "int"}], tip: "Sets the drawing size to very thick", show: ["level1"] },
		{ name: "setSize", category: "turtle", parameters: [{name: "size", default: 9, type: "int"}], tip: "Sets the drawing size to thicker", show: ["level1"]},
		{ name: "setSize", category: "turtle", parameters: [{name: "size", default: 4, type: "int"}], tip: "Sets the drawing size to thick", show: ["level1"]},
		{ name: "blank", category: "turtle", show: ["level1"] },
		{ name: "unsetSize", category: "turtle", parameters: [], tip: "Unsets the drawing size", show: ["level3","level4"] },
		{ name: "hide", category: "canvas", parameters: [{name: "canvasId",default: undefined, type: "int"}], tip: "Hides the canvas", show: ["level3","level4"] },
		{ name: "image", category: "draw", parameters: [{name: "src", default: "\"\"", type: "string", tip: "URL of an image"},{name: "posx", default: 0, type: "int", tip: "X coordinate where the image will be painted"},{name: "posy", default: 0, type: "int", tip: "Y coordinate where the image will be painted"},{name: "width", type: "int"},{name: "height", type: "int"}], tip: "Sticks an external image", show: ["level2","level3","level4"] },
		{ name: "lineAt", category: "draw", parameters: [{name: "originx", default: 0, type: "int", tip: "Where should the line begin? Set the X coordinate"},{name: "originy", default: 0, type: "int", tip: "Where should the line begin? Set the Y coordinate"},{name: "destinationx", default: 100, type: "int", tip: "Where should the line end? Set the X coordinate"},{name: "destinationy", default: 100, type: "int", tip: "Where should the line end? Set the Y coordinate"}], tip: "Draws a line from coordinate position to coordinate position", show: ["level2","level3","level4"] },
		{ name: "move", category: "canvas", parameters: [{name: "right", default: 50, type: "int"},{name: "down", default: 50, type: "int"}], tip: "Moves the canvas (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "moveDown", category: "canvas", parameters: [{name: "pixels", default: 50, type: "int"}], tip: "Moves the canvas down (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "moveLeft", category: "canvas", parameters: [{name: "pixels", default: 50, type: "int"}], tip: "Moves the canvas left (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "moveRight", category: "canvas", parameters: [{name: "pixels", default: 50, type: "int"}], tip: "Moves the canvas right (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "moveUp", category: "canvas", parameters: [{name: "pixels", default: 50, type: "int"}], tip: "Moves the canvas up (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "pull", category: "canvas", parameters: [{name: "levels", default: 1, type: "int"}], tip: "Pulls up a canvas layer", show: ["level3","level4"] },
		{ name: "push", category: "canvas", parameters: [{name: "levels", default: 1, type: "int"}], tip: "Pushes down a canvas layer", show: ["level3","level4"] },
		{ name: "rotateLeft", category: "canvas", parameters: [{name: "degrees", default: 90, type: "int"},{name: "axis", type: "int"}], tip: "Rotates the canvas left (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "rotateRight", category: "canvas", parameters: [{name: "degrees", default: 90, type: "int"},{name: "axis", type: "int"}], tip: "Rotates the canvas right (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "scale", category: "canvas", parameters: [{name: "horizontal", default: 0.5, type: "int"},{name: "vertical", default: 0.5, type: "int"},{name: "axis", type: "int"}], tip: "Scales the canvas (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "setSize", category: "turtle", parameters: [{name: "size", default: 16, type: "int", tip: "Which size in pixels do you want to set?"}], tip: "Sets the drawing size", show: ["level2","level3","level4"] },
		{ name: "blank", category: "turtle", show: ["level2"] },
		{ name: "setInvisible", category: "turtle", parameters: [{name: "index", default: 0.5, type: "int", tip: "From 0 (invisible] to 1 (opaque), how invisible do you want to draw?"}], tip: "Sets the drawing transparency value", show: ["level2","level3","level4"] },
		{ name: "unsetInvisible", category: "turtle", parameters: [], top: "Sets the drawing transparency to opaque", show: ["level2","level3","level4"] },
		{ name: "blank", category: "turtle", show: ["level1","level2"] },
		{ name: "setColor", category: "turtle", parameters: [{name: "color", default: "\"#FF0000\"", type: "color"}], tip: "Sets the drawing color to red", show: ["level1"] },
		{ name: "setColor", category: "turtle", parameters: [{name: "color", default: "\"#00FF00\"", type: "color"}], tip: "Sets the drawing color to green", show: ["level1"] },
		{ name: "setColor", category: "turtle", parameters: [{name: "color", default: "\"#0000FF\"", type: "color"}], tip: "Sets the drawing color to blue", show: ["level1"] },
		{ name: "setColor", category: "turtle", parameters: [{name: "color", default: "\"#FFFF00\"", type: "color"}], tip: "Sets the drawing color to yellow", show: ["level1"] },
		{ name: "setColor", category: "turtle", parameters: [{name: "color", default: "\"#00FFFF\"", type: "color"}], tip: "Sets the drawing color to light blue", show: ["level1"] },
		{ name: "setColor", category: "turtle", parameters: [{name: "color", default: "\"#FFFFFF\"", type: "color"}], tip: "Sets the drawing color to white", show: ["level1"] },
		{ name: "setColor", category: "turtle", parameters: [{name: "color", default: "\"#000000\"", type: "color"}], tip: "Sets the drawing color to black", show: ["level1"] },
		{ name: "setColor", category: "turtle", parameters: [{name: "color", default: "\"#555555\"", type: "color"}], tip: "Sets the drawing color to grey", show: ["level1"] },
		{ name: "setColor", category: "turtle", parameters: [{name: "color", default: "\"#AAAAAA\"", type: "color"}], tip: "Sets the drawing color to light grey", show: ["level1"] },
		{ name: "blank", category: "turtle", show: ["level1"] },
		{ name: "setBold", category: "turtle", parameters: [{name: "bool", default: true, type: "bool"}], tip: "Sets the bold property for future text", show: ["level2","level3","level4"] },
		{ name: "unsetBold", category: "turtle", parameters: [], tip: "Unsets the bold property for future text", show: ["level2","level3","level4"] },
		{ name: "line", category: "turtle", parameters: [{name: "destinationx", default: 0, type: "int", tip: "Set X coordinate to go to"},{name: "destinationy", default: 0, tip: "Set Y coordinate to go to"}], tip: "Draws a line from current position to specified coordinates", show: ["level2","level3","level4"] },
		{ name: "blank", category: "turtle", show: ["level2"] },
		{ name: "setFont", category: "turtle", parameters: [{name: "font", default: "\"Comic Sans MS\"", type: "string"}], tip: "Sets the font for future text", show: ["level2","level3","level4"] },
		{ name: "unsetFont", category: "turtle", parameters: [], tip: "Resets the font for future text", show: ["level2","level3","level4"] },
		{ name: "write", category: "turtle", parameters: [{name: "text", default: "\"Hello!\"", type: "string", tip: "Which text do you want to write?"}], tip: "Draws text", show: ["level2","level3","level4"] },
		{ name: "blank", category: "turtle", show: ["level2"] },
		{ name: "setItalic", category: "turtle", parameters: [{name: "bool", default: true, type: "bool"}], tip: "Sets the italic property for future text", show: ["level2","level3","level4"] },
		{ name: "unsetItalic", category: "turtle", parameters: [], tip: "Resets the italic property for future text", show: ["level2","level3","level4"] },
		{ name: "show", category: "canvas", parameters: [{name: "canvasId",default: undefined, type: "int"}], tip: "Shows the canvas", show: ["level3","level4"] },
		{ name: "blank", category: "turtle", show: ["level1"] },
		{ name: "use", category: "canvas", parameters: [{name: "id", default: 1, type: "int"}], return: "string", tip: "Switches the active canvas, returns the name of the new current canvas", show: ["level3","level4"] },
		{ name: "animate", category: "canvas", parameters: [{name: "seconds", default: 1, type: "int"},{name: "action", default: "", type: "string"},{name: "maxTimes", default: 1, type: "int"}], tip: "Runs the action every seconds seconds up to maxTimes", show: ["level3","level4"] },
		{ name: "unanimate", category: "canvas", parameters: [{name: "handlerId", default: 0, type: "int"}], tip: "Stops an animation", show: ["level3","level4"] },
		{ name: "if", category: "flow", parameters: [{name: "condition", default: true, type: "bool", tip: "When should the code be triggered?"}], tip: "Conditional execution", show: ["level2","level3","level4"], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "ifelse", category: "flow", parameters: [{name: "condition", default: true, type: "bool"}], tip: "Conditional execution", show: ["level3"], block: ["else","end"], nameRewrite: { level1: "if", level2: "if", level3: "if", level4: "if" }, code: { space: true, suffix: " {" } },
		{ name: "switch", category: "flow", parameters: [{name: "identifier", default: true, type: "bool"}], tip: "Value based execution", show: [], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "case", category: "flow", parameters: [{name: "value", default: false, type: "bool"}], show: [], block: [], dummy: true, code: { space: true, noBrackets: true, suffix: " :" } },
		{ name: "default", category: "flow", parameters: null, show: [], dummy: true, code: { suffix: " :" } },
		{ name: "try", category: "flow", parameters: null, show: [], block: ["end"], code: { suffix: " {" } },
		{ name: "with", category: "flow", parameters: [{name: "object", default: [], type: "object"}], show: [], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "do", category: "flow", parameters: null, show: [], block: ["endDo"], code: { suffix: " {" } },
		{ name: "endDo", category: "flow", parameters: [{name: "condition", default: false, type: "bool"}], show: [], nameRewrite: { level1: "while", level2: "while", level3: "while", level4: "while" }, block: ["end"], dummy: true, code: { prefix: "} ", unindent: true } },
		{ name: "while", category: "flow", parameters: [{name: "condition", default: true, type: "bool", tip: "The code will be triggered as long as the following condition remains true"}], tip: "Conditional loop", show: ["level2","level3","level4"], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "repeat", category: "flow", parameters: [{name: "number", default: 1, type: "bool", tip: "The code will be run the amount of times defined"}], tip: "Repeating loop", show: ["level2","level3","level4"], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "for", category: "flow", parameters: [{name: "initialization;condition;update", default: ";false;", type: "string"}], show: [], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "forIn", category: "flow", parameters: [{name: "iteration", default: "x in []", type: "string"}], show: [], block: ["end"], nameRewrite: { level1: "for", level2: "for", level3: "for", level4: "for" }, code: { space: true, suffix: " {" } },
		{ name: "elseIf", category: "flow", parameters: [{name: "condition", default: false, type: "bool"}], tip: "Alternative branch to conditional execution", show: ["level4"], dummy: true, nameRewrite: { level1: "else if", level2: "else if", level3: "else if", level4: "else if" }, code: { prefix: "} ", space: true, suffix: " {", unindent: true } },
		{ name: "catch", category: "flow", parameters: [{name: "identifier", default: "e", type: "string"}], show: [], dummy: true, code: { space: true, prefix: "} ", suffix: " {", unindent: true } },
		{ name: "finally", category: "flow", parameters: null, show: [], dummy: true, code: { space: true, prefix: "} ", suffix: " {", unindent: true } },
		{ name: "else", category: "flow", parameters: null, tip: "Alternative branch to conditional execution", show: ["level4"], dummy: true, code: { space: true, prefix: "} ", suffix: " {", unindent: true } },
		{ name: "end", category: "internal", parameters: null, tip: "End flow break", show: [], dummy: true, nameRewrite: { level1: "", level2: "", level3: "}", level4: "}" }, code: { unindent: true } },
		{ name: "endObject", category: "internal", parameters: null, tip: "End object definition", show: [], dummy: true, nameRewrite: { level1: "", level2: "", level3: "}", level4: "}" }, code: { unindent: true } },
		{ name: "endComment", category: "internal", parameters: null, tip: "End flow break", show: [], dummy: true, nameRewrite: { level1: "", level2: "", level3: "*/", level4: "*/" }, code: { unindent: true } },
		{ name: "wait", category: "flow", parameters: [{name: "milliseconds", default: 1000, type: "int"}], tip: "Stops execution for the specified time (in milliseconds)", show: [] },
		{ name: "stop", category: "flow", parameters: [], tip: "Stop the execution", show: ["level2","level3","level4"] },
		{ name: "label", category: "flow", parameters: null, tip: "Label a spot in the code", show: [], code: { noName: true, suffix: ":" }, validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); } },
		{ name: "return", category: "flow", parameters: [{name: "value", type: "string"}], tip: "Return to calling function", show: ["level3","level4"], code: { space: true, noBrackets: true } },
		{ name: "call", category: "flow", parameters: [{name: "identifier", type: "string"},{name: "parameters...", type: "string"}], tip: "Call a custom function", show: ["level3"], nameRewrite: { level1: "", level2: "Comment:", level3: "", level4: "" }, code: { noInSpace: true }, validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); } },
		{ name: "break", category: "flow", parameters: [{name: "value", type: "string"}], tip: "End loop execution", show: [], code: { space: true, noBrackets: true } },
		{ name: "continue", category: "flow", parameters: [{name: "value", type: "string"}], tip: "Skip to next loop iteration", show: [], code: { space: true, noBrackets: true } },
		{ name: "var", category: "objects", parameters: [{name: "identifier", type: "string"}], tip: "Declare a new variable", show: ["level3","level4"], code: { space: true, noBrackets: true }, validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); } },
		{ name: "array", category: "objects", parameters: [{name: "identifier", type: "string"}], tip: "Declare a new array", show: ["level3","level4"], code: { space: true, noBrackets: true }, validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); } },
		{ name: "function", category: "objects", parameters: [{name: "identifier", type: "string"},{name: "parameters...", type: "string"}], tip: "Declares a new function", show: ["level3","level4"], block: ["end"], validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); }, code: { suffix: " {" } },
		{ name: "windowButtonCreate", category: "window", parameters: [{name: "window",default: 1, type: "int"},{name: "id",default: 1, type: "int"},{name: "text",default: "\"Click me!\"", type: "string"},{name: "posx",default: 0, type: "int"},{name: "posy",default: 0, type: "int"},{name: "action", type: "string"}], tip: "Creates a button in a window", show: ["level3","level4"] },
		{ name: "windowButtonEdit", category: "window", parameters: [{name: "id",default: 1, type: "int"},{name: "text",default: "Click me!", type: "string"},{name: "posx",default: 0, type: "int"},{name: "posy",default: 0, type: "int"},{name: "action", type: "string"}], tip: "Modifies a button in a window", show: ["level3","level4"] },
		{ name: "windowButtonHide", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Hides a button in a window", show: ["level3","level4"] },
		{ name: "windowButtonRemove", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Deletes a button in a window", show: ["level3","level4"] },
		{ name: "windowButtonShow", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Shows a button in a window", show: ["level3","level4"] },
		{ name: "windowHide", category: "window", parameters: [], tip: "Hides a window", show: ["level3","level4"] },
		{ name: "windowImageCreate", category: "window", parameters: [{name: "window",default: 1, type: "int"},{name: "id",default: 1, type: "int"},{name: "canvasId",default: 1, type: "int"},{name: "posx",default: 0, type: "int"},{name: "posy",default: 0, type: "int"},{name: "width",default: 50, type: "int"},{name: "height",default: 50, type: "int"},{name:"onclick", type: "string"},{name:"onmouseover", type: "string"},{name:"onmouseout", type: "string"}], tip: "Creates an image in a window", show: ["level3","level4"] },
		{ name: "windowImageEdit", category: "window", parameters: [{name: "id",default: 1, type: "int"},{name: "canvasId",default: 1, type: "int"},{name: "posx",default: 0, type: "int"},{name: "posy",default: 0, type: "int"},{name: "width",default: 50, type: "int"},{name: "height",default: 50, type: "int"},{name:"onclick", type: "string"},{name:"onmouseover", type: "string"},{name:"onmouseout", type: "string"}], tip: "Modifies a button in a window", show: ["level3","level4"] },
		{ name: "windowImageHide", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Hides an image in a window", show: ["level3","level4"] },
		{ name: "windowImageRemove", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Deletes an image in a window", show: ["level3","level4"] },
		{ name: "windowImageShow", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Shows an image in a window", show: ["level3","level4"] },
		{ name: "windowInputCreate", category: "window", parameters: [{name: "window",default: 1, type: "int"},{name: "id",default: 1, type: "int"},{name: "posx",default: 0, type: "int"},{name: "posy",default: 0, type: "int"},{name: "width",default:50, type: "int"},{name: "height",default: 12, type: "int"},{name:"type", type: "string"}], tip: "Creates an input box in a window", show: ["level3","level4"] },
		{ name: "windowInputEdit", category: "window", parameters: [{name: "id",default: 1, type: "int"},{name: "posx",default: 0, type: "int"},{name: "posy",default: 0, type: "int"},{name: "width",default: 50, type: "int"},{name: "height",default: 12, type: "int"},{name:"type", type: "string"}], tip: "Modifies an input box in a window", show: ["level3","level4"] },
		{ name: "windowInputGet", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Gets the value in an input box in a window", show: ["level3","level4"] },
		{ name: "windowInputHide", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Hides an input box in a window", show: ["level3","level4"] },
		{ name: "windowInputRemove", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Deletes an input box in a window", show: ["level3","level4"] },
		{ name: "windowInputSet", category: "window", parameters: [{name: "id",default: 1, type: "int"},{name: "text",default: "0", type: "text"}], tip: "Sets the value in the input box", show: ["level3","level4"] },
		{ name: "windowInputShow", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Shows an input box in a window", show: ["level3","level4"] },
		{ name: "windowRemove", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Deletes a window", show: ["level3","level4"] },
		{ name: "windowShow", category: "window", parameters: [], tip: "Shows a window", show: ["level3","level4"] },
		{ name: "windowTextCreate", category: "window", parameters: [{name: "window",default: 1, type: "int"},{name: "id",default: 1, type: "int"},{name: "text",default: "\"Hello!\"", type: "string"},{name: "posx",default: 0, type: "int"},{name: "posy",default: 0, type: "int"},{name: "width", type: "int"},{name: "bold", type: "bool"},{name:"italic", type: "bool"},{name:"size", type: "int"},{name:"color", type: "color"},{name:"family", type: "string"}], tip: "Creates text in a window", show: ["level3","level4"] },
		{ name: "windowTextEdit", category: "window", parameters: [{name: "id",default: 1, type: "int"},{name: "text",default: "\"Hello!\"", type: "string"},{name: "posx", type: "int"},{name: "posy", type: "int"},{name: "width", type: "int"},{name: "bold", type: "bool"},{name:"italic", type: "bool"},{name:"size", type: "int"},{name:"color", type: "color"},{name:"family", type: "string"}], tip: "Modifies text in a window", show: ["level3","level4"] },
		{ name: "windowTextGet", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Gets the value in a text box in a window", show: ["level3","level4"] },
		{ name: "windowTextHide", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Hides text in a window", show: ["level3","level4"] },
		{ name: "windowTextRemove", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Deletes text in a window", show: ["level3","level4"] },
		{ name: "windowTextShow", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Shows text in a window", show: ["level3","level4"] },
		{ name: "windowUse", category: "window", parameters: [{name: "id",default: 1, type: "int"}], tip: "Switches the active window", show: ["level3","level4"] },
		{ name: "writeAt", category: "draw", parameters: [{name: "text",default: "\"Hello!\"", type: "string", tip: "Which text would you like to show?"},{name: "posx",default: 0, type: "int", tip: "Where do you want to show it? X coordinate"},{name: "posy",default: 0, type: "int", tip: "Where do you want to show it? Y coordinate"}], tip: "Draws text at specified coodinates", show: ["level2","level3","level4"] }
	];