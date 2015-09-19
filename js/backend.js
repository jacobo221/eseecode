"use strict";

	/** Returns a layer in the whiteboard
	 * If needed, layer is created overlapping exactly the whiteboard div element
	 * The created layer can be accessed via $_eseecode.canvasArray[id]
	 * @private
	 * @param {Number} [id] Layer id (if blank it creates a new id)
	 * @return {!Object} Layer in the whiteboard
	 * @example $_eseecode.currentCanvas = getCanvas(id)
	 */
	function getCanvas(id) {
		if (typeof id === "undefined") {
			id = $_eseecode.canvasArray.length;
		}
		if (!$_eseecode.canvasArray[id]) {
			var canvasSize = $_eseecode.whiteboard.offsetWidth;
			var div = document.createElement("div");
			div.id = "canvas-div-"+id;
			div.className = "canvas-div";
			div.style.left = $_eseecode.whiteboard.offsetLeft;
			div.style.top = $_eseecode.whiteboard.offsetTop;
			div.style.width = canvasSize+"px";
			div.style.height = canvasSize+"px";
			var canvasTopLayer = ($_eseecode.canvasArray[0])? $_eseecode.canvasArray[0].layerUnder : null;
			if (canvasTopLayer) {
				div.style.zIndex = Number(canvasTopLayer.div.style.zIndex)+1;
			} else {
				div.style.zIndex = id;
			}
			var canvas = document.createElement("canvas");
			canvas.name = id;
			canvas.className = "canvas";
			canvas.width = canvasSize;
			canvas.height = canvasSize;
			var context = canvas.getContext("2d");
			$_eseecode.canvasArray[id] = {
				name: id,
				canvas: canvas,
				context: context,
				div: div,
				turtle: {x: 0, y: 0, angle: 0},
				style: {color: "#000000", font: "sans-serif", size: 2, alpha: 1, bold: false, italic: false},
				shaping: false,
				layerOver: null,
				layerUnder: canvasTopLayer
			};
			$_eseecode.canvasArray[id].context.lineWidth = $_eseecode.canvasArray[id].style.size;
			$_eseecode.canvasArray[id].context.fillStyle = $_eseecode.canvasArray[id].style.color;
			$_eseecode.canvasArray[id].context.strokeStyle = $_eseecode.canvasArray[id].style.color;
			$_eseecode.canvasArray[id].context.strokeStyle = $_eseecode.canvasArray[id].style.color;
			var font = "";
			if ($_eseecode.canvasArray[id].style.italic) {
				font += "italic ";
			}
			if ($_eseecode.canvasArray[id].style.bold) {
				font += "bold ";
			}
			font += ($_eseecode.canvasArray[id].style.size+$_eseecode.setup.defaultFontSize)+"px ";
			font += $_eseecode.canvasArray[id].style.font;
			$_eseecode.canvasArray[id].context.font = font;
			$_eseecode.canvasArray[id].context.globalAlpha = $_eseecode.canvasArray[id].style.alpha;
			if (id > 0) { // canvas-0 (grid) doesn't count as top
				if (canvasTopLayer) {
					canvasTopLayer.layerOver = $_eseecode.canvasArray[id];
				}
				$_eseecode.canvasArray[0].layerUnder = $_eseecode.canvasArray[id]; // newest canvas is always on top
			}
			div.appendChild(canvas);
			$_eseecode.whiteboard.appendChild(div);
		}
		return $_eseecode.canvasArray[id];
	}

	/** Returns a window
	 * If needed, window is created overlapping exactly the whiteboard div element
	 * The created window can be accessed via $_eseecode.windowsArray[id]
	 * @private
	 * @param {Number} [id] Window id (if blank it creates a new id)
	 * @return {!HTMLElement} Div HTML element representing the Window
	 * @example $_eseecode.currentWiundow = getWindow(id)
	 */
	function getWindow(id) {
		if (typeof id === "undefined") {
			id = $_eseecode.windowsArray.length;
		}
		if (!$_eseecode.windowsArray[id]) {
			var newWindow = document.createElement("div");
			newWindow.id = "window-"+id;
			newWindow.style.left = $_eseecode.dialogWindow.offsetLeft;
			newWindow.style.top = $_eseecode.dialogWindow.offsetTop;
			newWindow.style.display = "none";
			newWindow.className = "dialog-window";
			$_eseecode.windowsArray[id] = newWindow;
			$_eseecode.dialogWindow.appendChild(newWindow);
		}
		return $_eseecode.windowsArray[id];
	}

	/** Deletes a layer from the whiteboard
	 * @private
	 * @param {Number} [id] Layer id
	 * @example removeCanvas(3)
	 */
	function removeCanvas(id) {
		if ($_eseecode.canvasArray[id]) {
			$_eseecode.whiteboard.removeChild($_eseecode.canvasArray[id].div);
			delete $_eseecode.canvasArray[id];
		}
	}

	/** Switches the currently active layer, returns the layer
	 * @private
	 * @param {Number} [id] Layer id
	 * @return {!Object} The layer
	 * @example switchCanvas(3)
	 */
	function switchCanvas(id) {
		$_eseecode.currentCanvas = getCanvas(id);
		resetTurtle(); // switch to the apropiate turtle
		return $_eseecode.currentCanvas;
	}

	/** Switches the currently active window
	 * @private
	 * @param {Number} [id] Window id
	 * @example windowSwitch(3)
	 */
	function windowSwitch(id) {
		if (id !== undefined) { // 0 is a valid id
			$_eseecode.currentWindow = getWindow(id);
		}
		// even if we did getWindow() still do the following, since it fixes rendering issues
		for (var i=0;i<$_eseecode.windowsArray.length;i++) {
			if ($_eseecode.windowsArray[i]) {
				$_eseecode.windowsArray[i].style.display = "none";
			}
		}
		$_eseecode.currentWindow.style.display = "block";
		document.getElementById("dialog-tabs-window").style.display = "block";
	}

	/**
	 * Sets the font properties on the currently active layer context
	 * @private
	 * @param {!HTMLElement} [context] Canvas context to take style difinitions from. If unset, currently active layer
	 * @example setTextStyle(ctx)
	 */
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

	/**
	 * Sets the size of the future draw lines and text
	 * @private
	 * @param {Number} [size] Size in pixels. If unset uses currently active layer's size
	 * @param {Number} [context] Canvas context to apply to. If unset applies to currently active layer
	 * @example setSizeStyle(2, ctx)
	 */
	function setSizeStyle(size, context) {
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

	/**
	 * Sets the color of the future draw lines and text
	 * @private
	 * @param {String} [color] Color to use. If unset uses currently active layer's color
	 * @param {Number} [context] Canvas context to apply to. If unset applies to currently active layer
	 * @example setColor("#FF0000", ctx)
	 */
	function setColorStyle(color, context) {
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

	/**
	 * Deletes a window element
	 * @private
	 * @param {String} id Element id
	 * @example windowElementRemove("b1")
	 */
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

	/**
	 * Hides a window element
	 * @private
	 * @param {String} id Element id
	 * @example windowElementHide("b1")
	 */
	function windowElementHide(id) {
		var obj = document.getElementById("element-"+id);
		obj.style.display = "none";
	}

	/**
	 * Shows a window element if it was hidden
	 * @private
	 * @param {String} id Element id
	 * @example windowElementShow("b1")
	 */
	function windowElementShow(id) {
		var obj = document.getElementById("element-"+id);
		obj.style.display = "inline";
	}

	/**
	 * Removes all content from a layer
	 * @private
	 * @param {Number} id Layer id
	 * @example clearCanvas(2)
	 */
	function clearCanvas(id) {
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var ctx, canvas;
		if (!$_eseecode.canvasArray[id]) {
			return;
		}
		if (typeof id === "undefined") {
			ctx = $_eseecode.currentCanvas.context;
			canvas = $_eseecode.currentCanvas.canvas;
		} else {
			ctx = $_eseecode.canvasArray[id].context;
			canvas = $_eseecode.canvasArray[id].canvas;
		}
		ctx.clearRect(0,0,canvasSize,canvasSize);
		canvas.width = canvasSize;
	}
	
	/**
	 * Stores repeatCount state when entering a repeat() block
	 * @private
	 * @example pushRepeatCount(repeatCount)
	 */
	function pushRepeatCount(value) {
		executionTracePush("repeatCount",value);
	}
	
	/**
	 * Restores repeatCount state when exiting a repeat() block
	 * @private
	 * @example popRepeatCount()
	 */
	function popRepeatCount() {
		return executionTracePop("repeatCount");
	}
	
	/**
	 * Moves the turtle to the specified position
	 * @private
	 * @param {Number} posx X coordinate
	 * @param [NUmber] posy Y coordinate
	 * @example moveTurtle(50,50)
	 */
	function moveTurtle(posx, posy) {
		$_eseecode.currentCanvas.turtle.x = Math.round(posx); // Make sure the value is integer
		$_eseecode.currentCanvas.turtle.y = Math.round(posy); // Make sure the value is integer
		resetTurtle(); 	
	}