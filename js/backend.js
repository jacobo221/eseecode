"use strict";

	/** Returns a layer in the whiteboard
	 * If needed, layer is created overlapping exactly the whiteboard div element
	 * The created layer can be accessed via $_eseecode.canvasArray[id]
	 * @private
	 * @param {Number} [id] Layer id (if blank it creates a new id)
	 * @return {!Object} Layer in the whiteboard
	 * @example $_eseecode.currentCanvas = $e_getCanvas(id)
	 */
	function $e_getCanvas(id) {
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
			if ($_eseecode.canvasArray["top"]) {
				div.style.zIndex = Number($_eseecode.canvasArray["top"].div.style.zIndex)+1;
			} else if($_eseecode.canvasArray["grid"]) {
				div.style.zIndex = Number($_eseecode.canvasArray["grid"].div.style.zIndex)+1;
			} else {
				// No canvas exist yet, suppose it is grid
				div.style.zIndex = 0;
			}
			var canvas = document.createElement("canvas");
			canvas.name = id;
			canvas.className = "canvas";
			canvas.width = canvasSize;
			canvas.height = canvasSize;
			var context = canvas.getContext("2d");
			var origin = $e_user2systemCoords({x: 0, y: 0});
			$_eseecode.canvasArray[id] = {
				name: id,
				canvas: canvas,
				context: context,
				div: div,
				guide: {x: origin.x, y: origin.y, angle: 0},
				style: {color: "#000000", font: "sans-serif", size: 2, alpha: 1, bold: false, italic: false},
				shaping: false,
				layerOver: null,
				layerUnder: $_eseecode.canvasArray["top"]
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
			if (id >= 0) { // grid/guide canvas don't count as top or bottom
				if ($_eseecode.canvasArray["top"]) {
					$_eseecode.canvasArray["top"].layerOver = $_eseecode.canvasArray[id];
				}
				$_eseecode.canvasArray["top"] = $_eseecode.canvasArray[id]; // newest canvas is always on top
				if (!$_eseecode.canvasArray["bottom"]) {
					$_eseecode.canvasArray["bottom"] = $_eseecode.canvasArray[id];
				}
			}
			div.appendChild(canvas);
			$_eseecode.whiteboard.appendChild(div);
		}
		return $_eseecode.canvasArray[id];
	}

	/** Returns a window and focuses to it if none had focus
	 * @private
	 * @param {Number} [id] Window id (if blank it creates a new id)
	 * @return {!HTMLElement} Div HTML element representing the Window
	 * @example $_eseecode.currentWindow = $e_getWindow(id)
	 */
	function $e_getWindow(id) {
		var windowElement = $e_getOrCreateWindow(id);
		if (!$_eseecode.currentWindow) {
			$e_windowSwitch(id);
		}
		return windowElement;
	}
	
	/** Returns the window
	 * If needed, window is created overlapping exactly the whiteboard div element
	 * The created window can be accessed via $_eseecode.windowsArray[id]
	 * @private
	 * @param {Number} [id] Window id (if blank it creates a new id)
	 * @return {!HTMLElement} Div HTML element representing the Window
	 * @example $_eseecode.currentWindow = $e_getOrCreateWindow(id)
	 */
	function $e_getOrCreateWindow(id) {
		if (typeof id === "undefined") {
			id = $_eseecode.windowsArray.length;
		}
		if (!$_eseecode.windowsArray[id]) {
			var newWindow = document.createElement("div");
			newWindow.id = "window-"+id;
			newWindow.style.left = $_eseecode.ui.dialogWindow.offsetLeft;
			newWindow.style.top = $_eseecode.ui.dialogWindow.offsetTop;
			newWindow.style.display = "none";
			newWindow.className = "dialog-window";
			$_eseecode.windowsArray[id] = newWindow;
			$_eseecode.ui.dialogWindow.appendChild(newWindow);
		}
		return $_eseecode.windowsArray[id];
	}

	/** Deletes a layer from the whiteboard
	 * @private
	 * @param {Number} [id] Layer id
	 * @example $e_removeCanvas(3)
	 */
	function $e_removeCanvas(id) {
		if ($_eseecode.canvasArray[id]) {
			$_eseecode.whiteboard.removeChild($_eseecode.canvasArray[id].div);
			if ($_eseecode.canvasArray["top"] == $_eseecode.canvasArray[id]) {
				$_eseecode.canvasArray["top"] = $_eseecode.canvasArray[id].layerUnder;
			}
			delete $_eseecode.canvasArray[id];
		}
	}

	/** Switches the currently active layer, returns the layer
	 * @private
	 * @param {Number} [id] Layer id
	 * @return {!Object} The layer
	 * @example $e_switchCanvas(3)
	 */
	function $e_switchCanvas(id) {
		$_eseecode.currentCanvas = $e_getCanvas(id);
		$e_resetGuide(); // switch to the apropiate guide
		return $_eseecode.currentCanvas;
	}

	/** Switches the currently active window
	 * @private
	 * @param {Number} [id] Window id
	 * @example $e_windowSwitch(3)
	 */
	function $e_windowSwitch(id) {
		if (id !== undefined) { // 0 is a valid id
			$_eseecode.currentWindow = $e_getOrCreateWindow(id);
		}
		// even if we did $e_getWindow() still do the following, since it fixes rendering issues
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
	 * @example $e_setTextStyle(ctx)
	 */
	function $e_setTextStyle(context) {
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
	 * @example $e_setSizeStyle(2, ctx)
	 */
	function $e_setSizeStyle(size, context) {
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
		$e_setTextStyle();
	}

	/**
	 * Sets the color of the future draw lines and text
	 * @private
	 * @param {String} [color] Color to use. If unset uses currently active layer's color
	 * @param {Number} [context] Canvas context to apply to. If unset applies to currently active layer
	 * @example $e_setColorStyle("#FF0000", ctx)
	 */
	function $e_setColorStyle(color, context) {
		if (color === undefined) {
			color = $_eseecode.currentCanvas.style.color;
		}
		if (context === undefined) {
			context = $_eseecode.currentCanvas.context;
		}
		$_eseecode.currentCanvas.style.color = color;
		context.fillStyle = color;
		context.strokeStyle = color;
		$e_setTextStyle(context);
	}

	/**
	 * Deletes a window element
	 * @private
	 * @param {String} id Element id
	 * @example $e_windowElementRemove("b1")
	 */
	function $e_windowElementRemove(id) {
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
	 * @example $e_windowElementHide("b1")
	 */
	function $e_windowElementHide(id) {
		var obj = document.getElementById("element-"+id);
		obj.style.display = "none";
	}

	/**
	 * Shows a window element if it was hidden
	 * @private
	 * @param {String} id Element id
	 * @example $e_windowElementShow("b1")
	 */
	function $e_windowElementShow(id) {
		var obj = document.getElementById("element-"+id);
		obj.style.display = "inline";
	}

	/**
	 * Removes all content from a layer
	 * @private
	 * @param {Number} id Layer id
	 * @example $e_clearCanvas(2)
	 */
	function $e_clearCanvas(id) {
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
	 * @example $e_pushRepeatCount(repeatCount)
	 */
	function $e_pushRepeatCount(value) {
		$e_executionTracePush("repeatCount",value);
	}
	
	/**
	 * Restores repeatCount state when exiting a repeat() block
	 * @private
	 * @example $e_popRepeatCount()
	 */
	function $e_popRepeatCount() {
		return $e_executionTracePop("repeatCount");
	}
	
	/**
	 * Moves the guide to the specified position
	 * @private
	 * @param {Number} pos Coordinate
	 * @example $e_moveGuide({x: 50, y: 50})
	 */
	function $e_moveGuide(pos) {
		$_eseecode.currentCanvas.guide.x = Math.round(pos.x); // Make sure the value is integer
		$_eseecode.currentCanvas.guide.y = Math.round(pos.y); // Make sure the value is integer
		$e_resetGuide();
	}
	
	/**
	 * Turns the guide to the specified angle
	 * @private
	 * @param {Number} angle Angle
	 * @example $e_setAngleGuide(90)
	 */
	function $e_setAngleGuide(angle) {
		$_eseecode.currentCanvas.guide.angle = angle;
		$_eseecode.currentCanvas.guide.angle %= 360;
		if ($_eseecode.currentCanvas.guide.angle < 0) {
			$_eseecode.currentCanvas.guide.angle += 360;
		}
		$e_resetGuide();
	}
	
	/**
	 * Draws a line from a coordinate to another using system coordinates
	 * @private
	 * @param {Array} origin Coordinates where the line starts
	 * @param {Array} destination Coordinates where the line ends
	 * @example $e_systemLineAt({x: 200, y: 200}, {x: 50, y: 50})
	 */
	function $e_systemLineAt(origin, destination) {
		if (!$_eseecode.currentCanvas.shaping) {
			$_eseecode.currentCanvas.context.beginPath();
			$_eseecode.currentCanvas.context.moveTo(origin.x,origin.y); // shape should use forward() or line()
		}
		$_eseecode.currentCanvas.context.lineTo(destination.x,destination.y);
		if (!$_eseecode.currentCanvas.shaping) {
			$_eseecode.currentCanvas.context.closePath();
		}
		$_eseecode.currentCanvas.context.stroke();
	}
	
	/**
	 * Writes text at a specific position
	 * @private
	 * @param {String} text Text to write
	 * @param {Number} posx X coordinate to start writing
	 * @param {Number} posy Y coordinate to start writing
	 * @param {Number} [angle=0] Angle in which to write
	 * @example $e_systemWriteAt("Hello!", 200, 200, 90)
	 */
	function $e_systemWriteAt(text, pos, angle) {
		if (angle === undefined) {
			angle = 0;
		}
		// We must create a new canvas and merge, otherwise if writeAt was called in the middle of a shape it would break the shape
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvasSize;
		tempCanvas.height = canvasSize;
		var tempCtx = tempCanvas.getContext("2d");
		tempCtx.translate(pos.x, pos.y);
		tempCtx.rotate(angle*Math.PI/180);
		// apply style properties to new canvas
		$e_setColorStyle(undefined,tempCtx);
		$e_setSizeStyle(undefined,tempCtx);
		$e_setTextStyle(tempCtx);
		tempCtx.fillText(text, 0, 0);
		tempCtx.translate(-pos.x, -pos.y);
		$_eseecode.currentCanvas.context.drawImage(tempCanvas,0,0,canvasSize,canvasSize);
	}
	