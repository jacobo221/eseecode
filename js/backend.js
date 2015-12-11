"use strict";

	/** Returns a layer in the whiteboard
	 * If needed, layer is created overlapping exactly the whiteboard div element
	 * The created layer can be accessed via $_eseecode.canvasArray[id]
	 * @private
	 * @param {Number|String} [id] Layer id (if blank it creates a new id)
	 * @return {!Object} Layer in the whiteboard
	 * @throws $e_codeError
	 * @example $_eseecode.currentCanvas = $e_getCanvas(id)
	 */
	function $e_getCanvas(id) {
		var layer = undefined;
		if (typeof id === "undefined") {
			var d = new Date();
			id = "canvas-"+(d.getTime()*10000+Math.floor((Math.random()*10000)));
		} else {
			layer = $e_getLayer(id);
		}
		if (!layer) {
			if ($e_isNumber(id, true)) {
				throw new $e_codeError("use", _("No layer exists in this position")+": "+id);
			}
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
			} else if ($_eseecode.canvasArray["grid"]) {
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
			layer = $_eseecode.canvasArray[id];
			layer.context.lineWidth = layer.style.size;
			layer.context.fillStyle = layer.style.color;
			layer.context.strokeStyle = layer.style.color;
			layer.context.strokeStyle = layer.style.color;
			var font = "";
			if (layer.style.italic) {
				font += "italic ";
			}
			if (layer.style.bold) {
				font += "bold ";
			}
			font += (layer.style.size+$_eseecode.setup.defaultFontSize)+"px ";
			font += layer.style.font;
			layer.context.font = font;
			layer.context.globalAlpha = layer.style.alpha;
			if (id != "grid" && id != "guide") { // grid/guide canvas don't count as top or bottom
				if ($_eseecode.canvasArray["top"]) {
					$_eseecode.canvasArray["top"].layerOver = layer;
				}
				$_eseecode.canvasArray["top"] = layer; // newest canvas is always on top
				if (!$_eseecode.canvasArray["bottom"]) {
					$_eseecode.canvasArray["bottom"] = layer;
				}
			}
			div.appendChild(canvas);
			$_eseecode.whiteboard.appendChild(div);
		}
		return layer;
	}

	/** Returns the layer
	 * @private
	 * @param {Number|String} id Layer id (can be the name or the position in the layers stack)
	 * @return {Array<*>} The desired layer
	 * @example var layer = $e_getLayer("guide")
	 */
	function $e_getLayer(layerId) {
		var layer = undefined;
		if ($e_isNumber(layerId, true)) {
			layer = $_eseecode.canvasArray["bottom"];
			for (var count=0; count < parseInt(layerId) && layer; count++) {
				layer = layer.layerOver;
			}
		} else {
			layer = $_eseecode.canvasArray[layerId];
		}
		return layer;
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
		var layer = $e_getLayer(id);
		if (layer) {
			$_eseecode.whiteboard.removeChild(layer.div);
			if ($_eseecode.canvasArray["top"] == layer) {
				$_eseecode.canvasArray["top"] = layer.layerUnder;
			}
			delete $_eseecode.canvasArray[layer.name];
		}
	}

	/** Switches the currently active layer, returns the layer
	 * @private
	 * @param {Number|String} [id] Layer id
	 * @return {!Object} The layer
	 * @example $e_switchCanvas(3)
	 */
	function $e_switchCanvas(id) {
		$_eseecode.currentCanvas = $e_getCanvas(id);
		$e_drawGuide(); // switch to the apropiate guide
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
		for (var key in $_eseecode.windowsArray) {
			if ($_eseecode.windowsArray[key]) {
				$_eseecode.windowsArray[key].style.display = "none";
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
		if (typeof id === "undefined") {
			ctx = $_eseecode.currentCanvas.context;
			canvas = $_eseecode.currentCanvas.canvas;
		} else {
			var layer = $e_getLayer(id);
			ctx = layer.context;
			canvas = layer.canvas;
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
		$_eseecode.currentCanvas.guide.x = pos.x; // Make sure the value is integer
		$_eseecode.currentCanvas.guide.y = pos.y; // Make sure the value is integer
		$e_drawGuide();
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
		$e_drawGuide();
	}
	
	/**
	 * Draws a line from a coordinate to another using system coordinates
	 * @private
	 * @param {Array} origin Coordinates where the line starts
	 * @param {Array} destination Coordinates where the line ends
	 * @example $e_systemLineAt({x: 200, y: 200}, {x: 50, y: 50})
	 */
	function $e_systemLineAt(origin, destination) {
		var shiftPixels = 0;
		if ($_eseecode.currentCanvas.context.lineWidth == 1) {
			// We use half-pixels because otherwise setSize(1) draws lines 2px wide
			shiftPixels = 0.5;
		}
		if (!$_eseecode.currentCanvas.shaping) {
			// shape should use forward() or line()
			$_eseecode.currentCanvas.context.beginPath();
			$_eseecode.currentCanvas.context.moveTo(origin.x+shiftPixels,origin.y+shiftPixels);
		}
		$_eseecode.currentCanvas.context.lineTo(destination.x+shiftPixels,destination.y+shiftPixels);
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

	/**
	 * Loads code into the console
	 * @private
	 * @param {String} code Code to upload
	 * @param {Boolean} [run=false] If true, it runs the code immediately
	 * @param {Boolean} [preload=false] If true, it stores the code to be also run before every execution of user code
	 * @example $e_uploadCode("repeat(4){forward(100)}",false)
	 */
	function $e_uploadCode(code,run,preload) {
		if (code === undefined) {
			return;
		}
		//$e_resetUI(true);
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id;
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		var program;
		// Always start by trying to load the code into the current level
		var switchToMode;
		var codeParseable = true;
		if (eseecodeLanguage) {
			try {
				program = eseecodeLanguage.parse(code);
			} catch (exception) {
				codeParseable = false;
				$e_msgBox(_("Can't open the code in %s mode because there are erros in the code. Please open the file in Code view mode and fix the following errors",[level])+":\n\n"+exception.name + ":  " + exception.message);
			}
		} else {
			codeParseable = false;
			$e_msgBox(_("Can't open the code in %s mode because you don't have the eseecodeLanguage script loaded. Please open the file in Code view mode",[level]));
		}
		if (preload === true) {
			$_eseecode.execution.precode.code = code;
			$_eseecode.execution.precode.standby = !run;
		} else {
			$_eseecode.session.changesInCode = true; // Mark the code as changed, otherwise if starting in Code mode and changing to blocks console all code would be lost
			if (codeParseable) {
		        if (mode == "blocks") {
			        program.makeBlocks(level,document.getElementById("console-blocks"));
		        } else if (mode == "write") {
			        $e_resetWriteConsole(program.makeWrite(level,"","\t"));
		        }
			} else {
				$e_switchConsoleMode("code");
				$e_resetWriteConsole(code);
			}
		}
		if (run) {
		    $e_resetCanvas();
			$e_execute();
		}
	}
	