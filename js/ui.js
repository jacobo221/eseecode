"use strict;"

	/** Returns a layer in the whiteboard
	 * If needed, layer is created overlapping exactly the whiteboard div element
	 * The created layer can be accessed via $_eseecode.canvasArray[id]
	 * @private
	 * @param {Number} [id] Layer id (if blank it creates a new id)
	 * @returns {!Object}
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
	 * @returns {!HTMLElement}
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
	 * @return {!Object}
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
			color = $_eseecode.currentCanvas.style.size;
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
	 * Returns if a value is a number or not
	 * @private
	 * @param {*} value Value to test
	 * @example isNumber(5)
	 */
	function isNumber(value) {
		return !isNaN(parseFloat(value)) && isFinite(value);
	}

	/**
	 * Links an A HTML element to the current whiteboard export drawing
	 * @private
	 * @param {!HTMLElement} link HTML A element to add the link to
	 * @example downloadCanvas(document.body.createElement("a"))
	 */
	function downloadCanvas(link) {
		var canvas = document.createElement('canvas');
		canvas.width = 400;
		canvas.height = 400;
		var ctx = canvas.getContext("2d");
		var layer = $_eseecode.canvasArray[0];
		for (var i=0; layer; i++) {
			if (layer != $_eseecode.canvasArray[0]) {
				ctx.drawImage(layer.canvas,0,0);
			}
			layer = layer.layerUnder;
		}
		link.href = canvas.toDataURL();
		var d = new Date();
		link.download = "canvas-"+d.getTime()+".png";
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
	 * Resizes the console window
	 * @private
	 * @param {Boolean} [restore=false] If false it maximizes the console window taking up the dialog window, otherwise it restores its size to the initial size
	 * @example resizeConsole(true)
	 */
	function resizeConsole(restore) {
		var mainWidth = document.getElementById('eseecode').clientWidth;
		var whiteboardWidth = $_eseecode.whiteboard.offsetWidth;
		var consoleColumn = document.getElementById("console");
		var dialogColumn = document.getElementById("dialog");
		var widthLeft = mainWidth-whiteboardWidth;
		var marginWidth = 3;
		if (restore || dialogColumn.style.display == "none") { // we asume console has by default same width as dialog
			dialogColumn.style.display = "block";
			var margin = marginWidth*(3+1);
			var consoleWidth = Math.ceil((widthLeft-margin)/100/2)*100;
			consoleColumn.style.width = consoleWidth+"px";
			dialogColumn.style.width = (widthLeft-consoleWidth-margin)+"px";
		} else {
			dialogColumn.style.display = "none";
			var margin = marginWidth*(2+1);
			consoleColumn.style.width = (widthLeft-margin)+"px";
		}
		switchDialogMode();
		ace.edit("console-write").resize();
	}

	/**
	 * Shows a message box overlapping all the platform's user interface
	 * @private
	 * @param {String} text Message to show in the message box
	 * @param {function()} actionOk Function to run when the user clicks the OK button in the message box 
	 * @example msgBox("Alert!")
	 */
	function msgBox(text, actionOk) {
		var mainBlock = document.getElementById("eseecode");
		var div = document.createElement("div");
		div.id = "msgBoxWrapper";
		var innerDiv = document.createElement("div");
		innerDiv.id = "msgBox";
		innerDiv.innerHTML = text+"<br /"+"><br /"+">";
		var buttonDiv = document.createElement("div");
		buttonDiv.setAttribute("align","center");
		buttonDiv.style.width = "100%";
		var input = document.createElement("input");
		input.type = "button";
		input.value = "OK";
		input.autofocus = true;
		buttonDiv.appendChild(input);
		innerDiv.appendChild(buttonDiv);
		div.appendChild(innerDiv);
		document.getElementById("eseecode").appendChild(div);
		if (actionOk) {
			input.addEventListener("click",actionOk);
		}
		input.addEventListener("click",function() {
			document.getElementById("eseecode").removeChild(document.getElementById("msgBoxWrapper"));
			if ($_eseecode.modes.console[$_eseecode.modes.console[0]].div == "write") {
				ace.edit("console-write").focus();
			}
		})
	}

	/**
	 * Switches the user interface to the specified level
	 * @private
	 * @param {Number|String} [id] Can refer to a level number or to a level name. If unset it checks the "level" parameter in the browser's URL. If it can't determine the new level, it keeps the current level
	 * @example switchConsoleMode(2)
	 */
	function switchConsoleMode(id) {
		var oldMode = $_eseecode.modes.console[0];
		if (!id) {
			var urlParts = window.location.href.match(/(\?|&)level=([^&#]+)/);
			if (urlParts !== null) {
				// Check that the level exists
				var newLevel = urlParts[2].toLowerCase();
				if (isNumber(newLevel) && $_eseecode.modes.console[newLevel]) {
					id = newLevel;
				} else {
					for (var i=1; i<$_eseecode.modes.console.length; i++) {
						var levelName = $_eseecode.modes.console[i].name.toLowerCase();
						if (levelName == newLevel ||
						    _(levelName.substr(0,1).toUpperCase()+levelName.substr(1)).toLowerCase() == newLevel) {
							id = i;
							break;
						}
					}
				}
			}
		}
		if (!id) {
			id = oldMode;
		}
		if (!isNumber(id)) {
			for (var i=1; i<$_eseecode.modes.console.length; i++) {
				if ($_eseecode.modes.console[i].name == id) {
					id = i;
					break;
				}
			}
		}
		var program;
		if ($_eseecode.modes.console[oldMode].div == "write" && $_eseecode.modes.console[id].div == "blocks") {
			var code;
			code = ace.edit("console-write").getValue();
			if (eseecodeLanguage) {
				try {
					program = eseecodeLanguage.parse(code);
				} catch (exception) {
					msgBox(_("Can't convert the code to blocks. There is the following problem in your code")+":\n\n"+exception.name + ":  " + exception.message);
					var lineNumber = exception.message.match(/. (i|o)n line ([0-9]+)/)[2];
					highlight(lineNumber,"error");
					ace.edit("console-write").gotoLine(lineNumber,0,true);
					return;
				}
			} else {
				if (!confirm(_("You don't have the eseecodeLanguage loaded. If you still want to switch to %s you won't be able to go back to any blocks mode.\nAre you sure you want to switch to %s?",[$_eseecode.modes.console[id].name,$_eseecode.modes.console[id].name]))) {
					return;
				}
			}
		}
		// Save scroll position
		var oldHeight = $_eseecode.setup.blockHeight[$_eseecode.modes.console[oldMode].name];
		var oldConsoleDiv = document.getElementById("console-"+$_eseecode.modes.console[oldMode].div);
		var oldScrollTop;
		if ($_eseecode.modes.console[oldMode].div == "write") {
			oldScrollTop = ace.edit("console-write").session.getScrollTop();
		} else {
			oldScrollTop = oldConsoleDiv.scrollTop;
		}
		// Show only active console
		$_eseecode.modes.console[0] = id;
		for (var i=1;i<$_eseecode.modes.console.length;i++) {
			$_eseecode.modes.console[i].tab.className = "tab";
			document.getElementById("console-"+$_eseecode.modes.console[i].div).style.display = "none";
		}
		document.getElementById("console-"+$_eseecode.modes.console[id].div).style.display = "block";
		// Continue switching console
		var level = $_eseecode.modes.console[id].name;
		if ($_eseecode.modes.console[oldMode].div == "blocks") {
			if ($_eseecode.modes.console[id].div == "write") {
				if (document.getElementById("console-blocks").firstChild.id == "console-blocks-tip") {
					resetWriteConsole("");
				} else {
					blocks2write();
				}
			} else if ($_eseecode.modes.console[id].div == "blocks") {
				blocks2blocks(level);
			}
		} else if ($_eseecode.modes.console[oldMode].div == "write") {
			if ($_eseecode.modes.console[id].div == "blocks") {
				var consoleDiv = document.getElementById("console-blocks");
				if ($_eseecode.session.changesInCode && $_eseecode.session.changesInCode != "blocks") {
					// Only reset the blocks console if changes were made in the code, this preserves the undo's
					resetUndo();
					resetBlocksConsole(consoleDiv);
					program.makeBlocks(level,consoleDiv);
				} else {
					// Just update the blocks style to the appropiate level
					blocks2blocks(level);
				}
			}
		}
		// Scroll to the same position in new console
		var newHeight = $_eseecode.setup.blockHeight[$_eseecode.modes.console[id].name];
		var newConsoleDiv = document.getElementById("console-"+$_eseecode.modes.console[id].div);
		var scrollTop = oldScrollTop * newHeight/oldHeight;
		if ($_eseecode.modes.console[id].div == "write") {
			ace.edit("console-write").session.setScrollTop(scrollTop);
		} else {
			newConsoleDiv.scrollTop = oldScrollTop * newHeight/oldHeight;
		}
		// Update tabs
		if ($_eseecode.modes.console[id].tab.classList) {
			$_eseecode.modes.console[id].tab.classList.add("tab-active");
		} else {
			$_eseecode.modes.console[id].tab.className += " tab-active";
		}
		switchDialogMode(id);
		// if write mode, focus in the textarea. Do this after switchDialogMode() in case the dialog tries to steal focus
		if ($_eseecode.modes.console[id].div == "write") {
			ace.edit("console-write").focus();
		} else {
			checkAndAddConsoleTip(); // force to recheck since until now "console-blocks" div had display:none so height:0px and so the tip couldn't define to max height
		}
		if ($_eseecode.modes.console[oldMode].div != $_eseecode.modes.console[id].div && $_eseecode.session.changesInCode) {
			$_eseecode.session.changesInCode = false;
		}
		highlight();
	}

	/**
	 * Switches the dialog window
	 * @private
	 * @param {Number|String} [id] Can refer to a dialog index or to a dialog name. If unset it keeps the current dialog window
	 * @example switchDialogMode("debug")
	 */
	function switchDialogMode(id) {
		if (!id) {
			id = $_eseecode.modes.dialog[0];
		}
		if (!isNumber(id)) {
			for (var i=1; i<$_eseecode.modes.dialog.length; i++) {
				if ($_eseecode.modes.dialog[i].name == id) {
					id = i;
					break;
				}
			}
		}
		for (i=1;i<$_eseecode.modes.dialog.length;i++) {
			$_eseecode.modes.dialog[i].element.style.display = "none";
			$_eseecode.modes.dialog[i].tab.className = "tab";
		}
		// window doesn't need inicialization
		$_eseecode.modes.dialog[id].element.style.display = "block";
		if ($_eseecode.modes.dialog[id].tab.classList) {
			$_eseecode.modes.dialog[id].tab.classList.add("tab-active");
		} else {
			$_eseecode.modes.dialog[id].tab.className += " tab-active";
		}
		if ($_eseecode.modes.dialog[id].div == "blocks") {
			initDialogBlocks($_eseecode.modes.dialog[id].name, $_eseecode.modes.dialog[id].element);
		} else if ($_eseecode.modes.dialog[id].div == "write") {
			initDialogWrite($_eseecode.modes.dialog[id].name, $_eseecode.modes.dialog[id].element);
		}
		if ($_eseecode.modes.dialog[id].name == "debug") {
			resetDebug();
			var debugCommand = document.getElementById("dialog-debug-command");
			debugCommand.style.display = "block";
			var debugCommandInput = document.getElementById("dialog-debug-command-input");
			debugCommandInput.style.width = (debugCommand.offsetWidth - document.getElementById("dialog-debug-command-button").offsetWidth - 15) +"px";
			debugCommandInput.focus();
		} else {
			document.getElementById("dialog-debug-command").style.display = "none";
		}
		// Paint setup tab image
		var margin = 3;
		var canvas = document.getElementById("dialog-tabs-setup").firstChild;
		var ctx = canvas.getContext("2d");
		var width = canvas.width;
		var height = canvas.height;
		ctx.lineWidth = 3;
		if ($_eseecode.modes.dialog[id].name == "setup") {
			ctx.strokeStyle = "#000000";
		} else {
			ctx.strokeStyle = "#FFFFFF";
		}
		var radio = (height-margin*2)/2;
		ctx.beginPath();
		ctx.arc(width/2,height/2,(height-margin*2)/2,0,360*Math.PI/180,false);
		ctx.closePath();
		ctx.stroke();
		ctx.save();
		ctx.beginPath();
		ctx.translate(width/2,height/2);
		ctx.moveTo(0,0-radio);
		var numLines = 6;
		for (var i = 0; i < numLines; i++)
		{
			ctx.rotate(Math.PI / numLines);
			ctx.lineTo(0, 0 - (radio*1.4));
			ctx.rotate(Math.PI / numLines);
			ctx.lineTo(0, 0 - radio);
		}
		ctx.stroke();
		ctx.restore();
		// Update current dialog
		$_eseecode.modes.dialog[0] = id;
	}

	/**
	 * Initializes or resets custom UI elements
	 * Such elements include the console and dialog buttons and the console and dialog backgrounds
	 * @private
	 * @example initUIElements()
	 */
	function initUIElements() {
		var canvas, ctx, div, width, height, src;
		// Main background
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
		div = document.getElementById("eseecode");
		width = div.clientWidth;
		height = div.clientHeight;
		canvas.width = width;
		canvas.height = height;
		var border = document.getElementById("header").clientHeight/2;
		var gradient = ctx.createLinearGradient(0,border,0,0);
		gradient.addColorStop(0,"#123456");
		gradient.addColorStop(1,"transparent");
		ctx.fillStyle = gradient;
		ctx.fillRect(0,0,width,border);
		gradient = ctx.createLinearGradient(0,height-border,0,height);
		gradient.addColorStop(0,"#123456");
		gradient.addColorStop(1,"transparent");
		ctx.fillStyle = gradient;
		ctx.fillRect(0,height-border,width,height);
		ctx.fillStyle = "#123456";
		ctx.fillRect(0,border,width,height-border*2);
		src = canvas.toDataURL();
		div.style.backgroundImage = "url("+src+")";
		div.style.backgroundColor = "transparent";
		// Console background
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
		div = document.getElementById("console-blocks");
		width = div.parentNode.clientWidth; // Use parent in case it had display:none at this moment
		height = div.parentNode.clientHeight;
		canvas.width = width;
		canvas.height = height;
		var rBackground ="D5";
		var gBackground = "DF";
		var bBackground = "DA";
		ctx.fillStyle = "#"+rBackground+gBackground+bBackground;
		ctx.fillRect(0,0,width,height);
		var colorDifferMax = 30;
		var widthMax = 30;
		rBackground = parseInt(rBackground,16);
		gBackground = parseInt(gBackground,16);
		bBackground = parseInt(bBackground,16);
		for (var i=0; i<75; i++) {
			var randomValue = Math.floor(Math.random()*colorDifferMax-colorDifferMax/2);
			var r = (randomValue+rBackground).toString(16).slice(-2);
			var g = (randomValue+gBackground).toString(16).slice(-2);
			var b = (randomValue+bBackground).toString(16).slice(-2);
			ctx.fillStyle = "#"+r+g+b;
			var x = Math.floor(Math.random()*width);
			var y = Math.floor(Math.random()*height);
			var size = Math.floor(Math.random()*widthMax);
			ctx.beginPath()
			ctx.arc(x,y,size,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();
		}
		src = canvas.toDataURL();
		div.style.backgroundImage = "url("+src+")";
		div.style.backgroundRepeat = "repeat";
		// Console buttons background
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
		div = document.getElementById("console-buttons");
		width = div.clientWidth;
		height = div.clientHeight+3;
		canvas.width = width;
		canvas.height = height;
		var rBackground ="D5";
		var gBackground = "DF";
		var bBackground = "DA";
		ctx.fillStyle = "#"+rBackground+gBackground+bBackground;
		ctx.fillRect(0,0,width,height);
		gradient = ctx.createLinearGradient(0,0,0,height);	
		gradient.addColorStop(0.0,'rgba(0,0,0,0)');
		gradient.addColorStop(1,'rgba(0,0,0,0.5)');
		ctx.fillStyle = gradient;
		ctx.fillRect(0,-height*2,width,height*3);
		src = canvas.toDataURL();
		div.style.backgroundImage = "url("+src+")";
		div.style.backgroundRepeat = "repeat";
		// Debug command background
		div = document.getElementById("dialog-debug-command");
		div.style.backgroundImage = "url("+src+")";
		div.style.backgroundRepeat = "repeat";
		// Dialog background
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
		div = document.getElementById("dialog-blocks");
		width = div.parentNode.clientWidth; // Use parent in case it had display:none at this moment
		height = div.parentNode.clientHeight;
		canvas.width = width;
		canvas.height = height;
		rBackground = "FF";
		gBackground = "FA";
		bBackground = "CD";
		ctx.fillStyle = "#"+rBackground+gBackground+bBackground;
		ctx.fillRect(0,0,width,height);
		widthMax = 20;
		for (var i=0; i<10; i++) {
			ctx.strokeStyle = "#EAEAEA";
			var x = Math.floor(Math.random()*width);
			var y = Math.floor(Math.random()*height);
			var sideStart = Math.floor(Math.random()*2);
			var sideEnd = Math.floor(Math.random()*2);
			var size = Math.floor(Math.random()*widthMax);
			ctx.lineWidth = size;
			ctx.beginPath();
			if (sideStart == 0) {
				ctx.moveTo(0,x);
			} else {
				ctx.moveTo(x,0);
			}
			if (sideEnd == 0) {
				ctx.lineTo(width,y);
			} else {
				ctx.lineTo(y,height);
			}
			ctx.stroke();
		}
		src = canvas.toDataURL();
		div.style.backgroundImage = "url("+src+")";
		div.style.backgroundRepeat = "repeat";
		// Undo button
		canvas = document.getElementById("button-undo").firstChild;
		ctx = canvas.getContext("2d");
		width = canvas.width;
		height = canvas.height;
		var margin = 2;
		var marginX = (width-margin*2)/3;
		ctx.strokeStyle = "#997700";
		ctx.beginPath();
		ctx.lineWidth = 10;
		ctx.arc(width-marginX*2,height-margin,(height-margin*2)/2,0,-90*Math.PI/180,true);
		ctx.lineTo(marginX,height/2);
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle = "#997700";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.lineTo(margin,height/2);
		ctx.lineTo(marginX,margin);
		ctx.lineTo(marginX,height-margin);
		ctx.fill();
		ctx.closePath();
		// Execute console button
		var margin = 2;
		canvas = document.getElementById("button-execute").firstChild;
		ctx = canvas.getContext("2d");
		width = canvas.width;
		height = canvas.height;
		ctx.fillStyle = "#00FF00";
		ctx.strokeStyle = "#006600";
		ctx.beginPath();
		ctx.moveTo(margin,margin);
		ctx.lineTo(width-margin,height/2);
		ctx.lineTo(margin,height-margin);
		ctx.lineTo(margin,margin);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		gradient = ctx.createLinearGradient(0,(height-margin)/2,0,-margin);	
		gradient.addColorStop(0.0,'rgba(0,0,0,0)');
		gradient.addColorStop(1.0,'rgba(0,0,0,1)');
		ctx.fillStyle = gradient;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(margin,margin);
		ctx.lineTo(width-margin,height/2);
		ctx.lineTo(margin,height/2);
		ctx.lineTo(margin,margin);
		ctx.fill();
		ctx.closePath();
		gradient = ctx.createLinearGradient(0,(height-margin)/2,0,height+margin);	
		gradient.addColorStop(0.0,'rgba(0,0,0,0)');
		gradient.addColorStop(1.0,'rgba(0,0,0,1)');
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.moveTo(margin,height/2);
		ctx.lineTo(width-margin,height/2);
		ctx.lineTo(margin,height-margin);
		ctx.lineTo(margin,height/2);
		ctx.fill();
		ctx.closePath();
		// Clear console button
		canvas = document.getElementById("button-clear").firstChild;
		ctx = canvas.getContext("2d");
		width = canvas.width;
		height = canvas.height;
		lineWidth = width/8;
		margin = width/8;
		ctx.fillStyle = "#FF0000";
		ctx.beginPath();
		ctx.arc(width/2,height/2+margin/8,height/2-margin/2,0,270*Math.PI/180);
		ctx.arc(width/2,height/2+margin/8,(height-margin)/2-lineWidth,270*Math.PI/180,0,true);
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.moveTo(width/2,margin/4);
		ctx.lineTo(width/2+lineWidth*1.3,(margin+lineWidth)/1.7);
		ctx.lineTo(width/2,lineWidth+margin);
		ctx.fill();
		ctx.closePath();
		// Reset console button
		canvas = document.getElementById("button-reset").firstChild;
		ctx = canvas.getContext("2d");
		var lineWidth = width / 8;
		width = canvas.width;
		height = canvas.height;
		ctx.strokeStyle = "#000088";
		ctx.lineWidth = lineWidth;
		ctx.moveTo(margin,margin);
		ctx.lineTo(width-margin,height-margin);
		ctx.moveTo(width-margin,margin);
		ctx.lineTo(margin,height-margin);
		ctx.stroke();
		// Redo button
		canvas = document.getElementById("button-redo").firstChild;
		ctx = canvas.getContext("2d");
		width = canvas.width;
		height = canvas.height;
		var margin = 2;
		var marginX = (width-margin*2)/3;
		ctx.strokeStyle = "#997700";
		ctx.beginPath();
		ctx.lineWidth = 10;
		ctx.arc(marginX*2,height-margin,(height-margin*2)/2,180*Math.PI/180,-90*Math.PI/180,false);
		ctx.lineTo(width-marginX,height/2);
		ctx.stroke();
		ctx.closePath();
		ctx.fillStyle = "#997700";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.lineTo(width-margin,height/2);
		ctx.lineTo(width-marginX,margin);
		ctx.lineTo(width-marginX,height-margin);
		ctx.fill();
		ctx.closePath();
		// Debug run button
		canvas = document.getElementById("dialog-debug-command-button").firstChild;
		ctx = canvas.getContext("2d");
		width = canvas.width;
		height = canvas.height;
		ctx.fillStyle = "#000000";
		ctx.strokeStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.moveTo(margin,margin);
		ctx.lineTo(width-margin,height/2);
		ctx.lineTo(margin,height-margin);
		ctx.lineTo(margin,margin);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	}

	/**
	 * Returns a readable text color given a background color
	 * @private
	 * @param {String} backgroundColor Background color
	 * @return {String}
	 * @example readableText("#123456")
	 */
	function readableText(backgroundColor) {
		var color = backgroundColor.substring(1);
		var colorR = parseInt(color.substring(0,2), 16);
		var colorG = parseInt(color.substring(2,4), 16);
		var colorB = parseInt(color.substring(4), 16);
		var darkness = ((colorR*299) + (colorG*587) + (colorB*114)) / 1000;
		if (darkness < 150) {
			color = "#FFFFFF";
		} else {
			color = "#000000";
		}
		return color;
	}

	/**
	 * Initializes the cursor layer
	 * @private
	 * @example initTurtle()
	 */
	function initTurtle() {
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var name = "turtle";
		var div = document.createElement("div");
		div.id = "canvas-div-"+name;
		div.className = "canvas-div";
		div.style.left = $_eseecode.whiteboard.offsetLeft;
		div.style.top = $_eseecode.whiteboard.offsetTop;
		div.style.width = canvasSize+"px";
		div.style.height = canvasSize+"px";
		div.style.zIndex = 9999;
		var canvas = document.createElement("canvas");
		canvas.id = "canvas-turtle";
		canvas.className = "canvas";
		canvas.width = canvasSize;
		canvas.height = canvasSize;
		div.appendChild(canvas);
		$_eseecode.whiteboard.appendChild(div);
		$_eseecode.canvasArray[name] = {name: name, canvas: canvas, div: div, visible: true};
	}

	/**
	 * Hides/Shows the cursor layer
	 * @private
	 * @example toggleTurtle()
	 */
	function toggleTurtle() {
		var turtleCanvas = $_eseecode.canvasArray["turtle"];
		if (turtleCanvas.visible) {
			turtleCanvas.visible = false;
			turtleCanvas.div.style.display = "none";
		} else {
			turtleCanvas.visible = true;
			turtleCanvas.div.style.display = "block";
		}
	}

	/**
	 * Resets the cursor in a layer
	 * @private
	 * @param {Number} [id] Layer id. If unset use the currently active layer
	 * @param {Number} [ctx] Canvas context. If unset use the "turtle" layer
	 * @example resetTurtle()
	 */
	function resetTurtle(id, ctx) {
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		if (id === undefined) {
			id = $_eseecode.currentCanvas.name;
		}
		var targetCanvas = $_eseecode.canvasArray[id];
		var size = 20;
		var orgx = targetCanvas.turtle.x;
		var orgy = targetCanvas.turtle.y;
		var angle = targetCanvas.turtle.angle;
		var frontx = targetCanvas.turtle.x+size*Math.cos(angle*Math.PI/180);
		var fronty = targetCanvas.turtle.y+size*Math.sin(angle*Math.PI/180);
		var leftx = targetCanvas.turtle.x+size/2*Math.sin(angle*Math.PI/180);
		var lefty = targetCanvas.turtle.y-size/2*Math.cos(angle*Math.PI/180);
		var rightx = targetCanvas.turtle.x-size/2*Math.sin(angle*Math.PI/180);
		var righty = targetCanvas.turtle.y+size/2*Math.cos(angle*Math.PI/180);
		if (ctx === undefined) {
			var turtleCanvas = $_eseecode.canvasArray["turtle"];
			if (!turtleCanvas.visible) {
				return;
			}
			ctx = turtleCanvas.canvas.getContext("2d");
			turtleCanvas.width = canvasSize;
		}
		// clear turtle
		ctx.clearRect(0,0,canvasSize,canvasSize);
		// draw turtle
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#888888";
		var gradient = ctx.createRadialGradient(frontx,fronty,size/1.2,frontx,fronty,size/10);
		gradient.addColorStop(0,'rgb(100,100,100)');
		gradient.addColorStop(1,'rgb(215,215,0)');
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.moveTo(rightx, righty);
		ctx.lineTo(leftx, lefty);
		ctx.lineTo(frontx, fronty);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		gradient = ctx.createRadialGradient(orgx,orgy,size,orgx,orgy,size/10);
		gradient.addColorStop(0,'rgb(0,0,0)');
		gradient.addColorStop(1,'rgb(103,137,171)');
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(orgx,orgy,size/2,2*Math.PI,0,false);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	/**
	 * Deletes a breakpoint
	 * @private
	 * @param {String} line Line to remove breakpoint from
	 * @example removeBreakpoint(12)
	 */
	function removeBreakpoint(line) {
		delete $_eseecode.session.breakpoints[line];
		var div = document.getElementById("dialog-debug-analyzer-line"+line);
		div.parentNode.removeChild(div);
	}

	/**
	 * Completes or cancels an asynchronous breakpoint addition event
	 * @private
	 * @param {Object} event Event. If unset and in blocks mode it will cancel the breakpoint event
	 * @example addBreakpointEventEnd()
	 */
	function addBreakpointEventEnd(event) {
		var line;
		if ($_eseecode.modes.console[$_eseecode.modes.console[0]].div == "write") {
			line = ace.edit("console-write").selection.getCursor()["row"]+1;
		} else {
			var target = event.target;
			while (target !== null && target.id.match(/^div-[0-9]+$/) === null) {
				if (target.id === "console-tabdiv") {
					target = null;
				} else {
					target = target.parentNode;
				}
			}
			if (target !== null) {
				line = searchBlockPosition(document.getElementById("console-blocks").firstChild,target).count;
			}
		}
		if (line) {
			if (isNumber($_eseecode.session.breakpointHandler)) {
				updateBreakpoint($_eseecode.session.breakpointHandler,line)
			} else {
				addBreakpoint(line);
			}
		}
		addBreakpointEventCancel();
		event.stopPropagation();
	}

	/**
	 * Cancels an asynchronous breakpoint addition event
	 * @private
	 * @example addBreakpointEventCancel()
	 */
	function addBreakpointEventCancel() {
		$_eseecode.session.breakpointHandler = false;
		var tabdiv = document.getElementById("console-tabdiv");
		tabdiv.style.webkitFilter = "";
		tabdiv.style.filter = "";
		tabdiv.removeEventListener("mousedown",addBreakpointEventEnd);
		tabdiv.removeEventListener("touchstart",addBreakpointEventEnd);
		document.body.removeEventListener("mousedown",addBreakpointEventCancel);
		document.body.removeEventListener("touchstart",addBreakpointEventCancel);
		document.body.style.cursor = "auto";
		var consoleDiv = document.getElementById("console-blocks");
		var consoleDiv2 = document.getElementById("console-write");
		if (consoleDiv.classList) {
			consoleDiv.classList.remove("breakpointHandler");
			consoleDiv2.classList.remove("breakpointHandler");
		} else {			
			consoleDiv.className = consoleDiv.className.replace(/\s+breakpointHandler/,"");	
			consoleDiv2.className = consoleDiv.className.replace(/\s+breakpointHandler/,"");
		}
	}

	/**
	 * Starts an asynchronous breakpoint addition event
	 * @private
	 * @param {String} [oldLine] Breakpoint handler. Use only when editting an existing breakpoint
	 * @example addBreakpointEventStart()
	 */
	function addBreakpointEventStart(oldLine) {
		if (!oldLine) {
			oldLine = true;
		}
		document.body.style.cursor = "crosshair";
		var consoleDiv = document.getElementById("console-blocks");
		var consoleDiv2 = document.getElementById("console-write");
		if (consoleDiv.classList) {
			consoleDiv.classList.add("breakpointHandler");
			consoleDiv2.classList.add("breakpointHandler");
		} else {			
			consoleDiv.className += " breakpointHandler";
			consoleDiv2.className += " breakpointHandler";
		}
		$_eseecode.session.breakpointHandler = oldLine;
		var tabdiv = document.getElementById("console-tabdiv");
		tabdiv.style.webkitFilter = "invert(0.9)";
		tabdiv.style.filter = "invert(90%)";
		tabdiv.addEventListener("mousedown",addBreakpointEventEnd,false);
		tabdiv.addEventListener("touchstart",addBreakpointEventEnd,false);
		document.body.addEventListener("mousedown",addBreakpointEventCancel,false);
		document.body.addEventListener("touchstart",addBreakpointEventCancel,false);
		document.body.addEventListener("keydown",keyboardShortcuts,false);
	}

	/**
	 * Synchronous part of a breakpoint addition
	 * @private
	 * @param {String} [line] Line in code to add the breakpoint to. If unset it calls for the user to set it up via the UI
	 * @example addBreakpoint(12)
	 */
	function addBreakpoint(line) {
		if (!line) {
			addBreakpointEventStart();
		} else if (!document.getElementById("dialog-debug-analyzer-line"+line)) {
			if ($_eseecode.session.breakpoints[line] === undefined) {
				$_eseecode.session.breakpoints[line] = {};
			}
			var div = document.createElement("div");
			div.id = "dialog-debug-analyzer-line"+line;
			div.className = "dialog-debug-analyzer-breakpoint";
			div.innerHTML = "<input type=\"checkbox\" onchange=\"removeBreakpoint("+line+")\" checked /><b><a href=\"#\" onclick=\"updateBreakpoint("+line+")\">"+_("Line")+" "+line+"</a>:</b> <input type=\"button\" value=\"+ "+_("Watch")+"\" onclick=\"addBreakpointWatch("+line+")\" /><br><div id=\"dialog-debug-analyzer-line"+line+"-watches\"></div>";
			var divAnalyzer = document.getElementById("dialog-debug-analyzer");
			if (divAnalyzer.hasChildNodes()) {
				var child = divAnalyzer.firstChild;
				while (child !== null) {
					var number = child.id.match(/^dialog-debug-analyzer-line([0-9]+)$/);
					if (number !== null) {
						number = number[1];
						if (parseInt(number) > parseInt(line)) {
							break;
						}
					}
					child = child.nextSibling;
				}
				if (child !== null) {
					divAnalyzer.insertBefore(div, child);
				} else {
					divAnalyzer.appendChild(div);
				}
			} else {
				divAnalyzer.appendChild(div);
			}
		}
	}

	/**
	 * Edit breakpoint
	 * @private
	 * @param {String} oldLine Line where the breakpoint was
	 * @param {String} [line] Line where the breakpoint will be. If unset just add the breakpoint
	 * @example updateBreakpoint(12, 17)
	 */
	function updateBreakpoint(oldLine, line) {
		if (!line) {
			addBreakpointEventStart(oldLine);
		} else {
			if (oldLine != line) {
				if ($_eseecode.session.breakpoints[line]) {
					return;
				}
				$_eseecode.session.breakpoints[line] = $_eseecode.session.breakpoints[oldLine];
				delete $_eseecode.session.breakpoints[oldLine];
				var div = document.getElementById("dialog-debug-analyzer-line"+oldLine);
				if (div) {
					div.parentNode.removeChild(div);
				}
			}
			addBreakpoint(line);
			for (var watch in $_eseecode.session.breakpoints[line]) {
				addBreakpointWatch(line, watch);
			}
		}
		
	}

	/**
	 * Adds a watch in a breakpoint
	 * @private
	 * @param {String} line Breakpoint (line) to add the watch to
	 * @param {String} [watch] Name of the variable to watch. If unset it calls for the user to set it up via the UI
	 * @example addBreakpointWatch(12, "count")
	 */
	function addBreakpointWatch(line, watch) {
		if (!watch) {
			do {
				watch = window.prompt(_("Enter the name of the variable you want to watch in line %s",[line])+":");
			} while (watch && watch.match(/^[A-Za-z][A-Za-z_0-9]*$/) === null);
		}
		if (watch !== null && !document.getElementById("dialog-debug-analyzer-line"+line+"-"+watch)) {
			var watchText = "<div id=\"dialog-debug-analyzer-line"+line+"-"+watch+"\"><input type=\"checkbox\" onchange=\"removeBreakpointWatch("+line+",'"+watch+"')\" checked />"+watch+": ";
			if ($_eseecode.session.breakpoints[line][watch] === undefined) {
				$_eseecode.session.breakpoints[line][watch] = "";
			} else {
				watchText += $_eseecode.session.breakpoints[line][watch];
			}
			watchText += "</div>";
			document.getElementById("dialog-debug-analyzer-line"+line+"-watches").innerHTML += watchText;
		}
	}

	/**
	 * Deletes a watch from a breakpoint
	 * @private
	 * @param {String} line Breakpoint (line) to remove the watch from
	 * @param {String} watch Name of the variable to stop watching
	 * @example removeBreakpointWatch(12, "count")
	 */
	function removeBreakpointWatch(line, watch) {
		delete $_eseecode.session.breakpoints[line][watch];
		var div = document.getElementById("dialog-debug-analyzer-line"+line+"-"+watch);
		div.parentNode.removeChild(div);
	}

	/**
	 * Resets the debug window
	 * @private
	 * @example resetDebug()
	 */
	function resetDebug() {
		var debugDiv = document.getElementById("dialog-debug");
		// Clean old debug info and create new debug info
		var list = debugLayers();
		var layersText = ""
		for (var i=0;i<list.length;i++) {
			var id = list[i];
			var checked = "";
			if (document.getElementById("canvas-div-"+id).style.display != "none") {
				checked = " checked";
			}
			layersText += "<div><label for=\"toggle-canvas-"+id+"\">"+_("Toggle layer")+" "+id+"</label><input id=\"toggle-canvas-"+id+"\" type=\"checkbox\" title=\""+_("Toggle layer")+" "+id+"\""+checked+" /"+"><a id=\"link-canvas-"+id+"\" href=\"#\">";
			var showName = _("Layer")+" "+list[i];
			if ($_eseecode.currentCanvas.name == list[i]) {
				layersText += "<b>"+showName+"</b>";
			} else {
				layersText += showName;
			}
			layersText += "</a></div>\n";
		}
		document.getElementById("dialog-debug-layers").innerHTML = layersText;
		document.getElementById("dialog-debug-layers").addEventListener('mouseout', unhighlightCanvas, false);
		for (var i=0;i<list.length;i++) {
			document.getElementById("link-canvas-"+list[i]).addEventListener('mouseover', (function(id){return function (evt) {highlightCanvas(id)}})(list[i]), false);
			document.getElementById("link-canvas-"+list[i]).addEventListener('click', (function(id){return function (evt) {switchCanvas(id);resetDebug()}})(list[i]), false);
			document.getElementById("toggle-canvas-"+list[i]).addEventListener('click', (function(id){return function (evt) {toggleCanvas(id)}})(list[i]), false);
		}
		document.getElementById("dialog-debug-analyzer").innerHTML = "<div><input type=\"button\" value=\"+ "+_("Breakpoint")+"\" onclick=\"addBreakpoint()\" />";
		for (var breakpoint in $_eseecode.session.breakpoints) {
			updateBreakpoint(breakpoint, breakpoint);
		}
	}

	/**
	 * Gets the execution step value from the setup and updates in the $_eseecode class
	 * @private
	 * @example updateExecutionStep()
	 */
	function updateExecutionStep() {
		$_eseecode.execution.step = parseInt(document.getElementById("setup-execute-step").value);
	}

	/**
	 * Gets the execution stepped value from the setup and updates in the $_eseecode class
	 * @private
	 * @example updateExecutionStepped()
	 */
	function updateExecutionStepped() {
		$_eseecode.execution.stepped = document.getElementById("setup-execute-stepped").checked;
	}

	/**
	 * Gets the execution time limit value from the setup and updates in the $_eseecode class
	 * @private
	 * @example updateExecutionTime()
	 */
	function updateExecutionTime() {
		$_eseecode.execution.timeLimit = parseInt(document.getElementById("setup-execute-time").value);
	}

	/**
	 * Initiates/Resets the setup window
	 * @private
	 * @example initSetup()
	 */
	function initSetup() {
		var debugDiv = document.getElementById("dialog-setup");
		document.getElementById("setup-execute-step").value = $_eseecode.execution.step;
		if ($_eseecode.execution.stepped) {
			document.getElementById("setup-execute-stepped").checked = true;
		} else {
			document.getElementById("setup-execute-stepped").checked = false;
		}
		document.getElementById("setup-execute-time").value = $_eseecode.execution.timeLimit;
	}

	/**
	 * Checks the layers list and returns the debug layers list content
	 * @private
	 * @return {String}
	 * @example debugLayers()
	 */
	function debugLayers() {
		var list = [];
		var listReverse = [];
		var layer = $_eseecode.canvasArray[0].layerUnder;
		var oldLayer = null;
		for (var i=0; layer; i++) {
			list[i] = layer.name;
			oldLayer = layer;
			layer = layer.layerUnder;
		}
		// Check that the list is equal downwards and upwards
		var layer = oldLayer;
		for (var i=0; layer; i++) {
			listReverse[i] = layer.name;
			oldLayer = layer;
			layer = layer.layerOver;
		}
		var valid = true;
		if (list.length != listReverse.length) {
			valid = false;
		} else {
			for (var i=0; i<list.length; i++) {
				if (list[i] != listReverse[listReverse.length-i-1]) {
					valid = false;
					break;
				}
			}
		}
		if (!valid) {
			var ret = [];
			ret[0] = "Inconsistent layer list!<br /"+">";
			ret[0] += "Top to bottom:<br /"+">";
			for (var i=0; i<list.length; i++) {
				ret[0] += list[i]+" ";
			}
			ret[0] += "<br /"+">";
			ret[0] += "Bottom to top:<br /"+">";
			for (var i=0; i<listReverse.length; i++) {
				ret[0] += listReverse[i]+" ";
			}
			list = ret;
		}
		return list;
	}

	/**
	 * Shows/Hides a layer
	 * @private
	 * @param {Number} id Layer id
	 * @example toggleCanvas(3)
	 */
	function toggleCanvas(id) {
		var div = $_eseecode.canvasArray[id].div;
		if (div.style.display == "none") {
			div.style.display = "block";
		} else {
			div.style.display = "none";
		}
	}

	/**
	 * Shows only a layer (hodes the others)
	 * @private
	 * @param {Number} id Layer id
	 * @example highlightCanvas(3)
	 */
	function highlightCanvas(id) {
		unhighlightCanvas(); // Make sure we never have more than one highlighted canvas
		// Since we destroy it and create it again every time it should always be on top of the canvas stack
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var div = document.createElement("div");
		div.id = "canvas-div-highlight";
		div.className = "canvas-div";
		div.style.left = $_eseecode.whiteboard.offsetLeft;
		div.style.top = $_eseecode.whiteboard.offsetTop;
		div.style.width = canvasSize+"px";
		div.style.height = canvasSize+"px";
		div.style.zIndex = Number($_eseecode.canvasArray["turtle"].div.style.zIndex)+1;
		div.style.backgroundColor = "#FFFFFF";
		var canvas = document.createElement("canvas");
		canvas.className = "canvas";
		canvas.width = canvasSize;
		canvas.height = canvasSize;
		var context = canvas.getContext("2d");
		var targetCanvas = $_eseecode.canvasArray[id];
		context.drawImage(targetCanvas.canvas, 0, 0);
		var posX = targetCanvas.turtle.x;
		var posY = targetCanvas.turtle.y;
		if (posX < 0 || posX > canvasSize || posY < 0 || posY > canvasSize) {
			var markerSize = 20;
			var orgx = posX;
			var orgy = posY;
			if (orgx < markerSize) {
				orgx = markerSize;
			} else if (orgx > canvasSize-markerSize) {
				orgx = canvasSize-markerSize;
			}
			if (orgy < markerSize) {
				orgy = markerSize;
			} else if (orgy > canvasSize-markerSize) {
				orgy = canvasSize-markerSize;
			}
			var modulus = Math.sqrt(posX*posX+posY*posY);
			var posVectorX = (posX-orgx)/modulus;
			var posVectorY = (posY-orgy)/modulus;
			var angle = -Math.acos((1*posVectorX + 0*posVectorY)/(Math.sqrt(1*1+0*0)*Math.sqrt(posVectorX*posVectorX+posVectorY*posVectorY)));
			var size = 20;
			var frontx = orgx+size*Math.cos(angle);
			var fronty = orgy+size*Math.sin(angle);
			var leftx = orgx+size/2*Math.sin(angle);
			var lefty = orgy-size/2*Math.cos(angle);
			var rightx = orgx-size/2*Math.sin(angle);
			var righty = orgy+size/2*Math.cos(angle);
			var ctx = context;
			// draw turtle
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#FF5555";
			ctx.fillStyle = "#FF9999";
			ctx.beginPath();
			ctx.moveTo(rightx, righty);
			ctx.lineTo(leftx, lefty);
			ctx.lineTo(frontx, fronty);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(orgx,orgy,size/2,2*Math.PI,0,false);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(orgx,orgy,size/2+2,angle-Math.PI/1.5,angle+Math.PI/1.5,true);
			ctx.stroke();
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(orgx,orgy,size/2+5,angle-Math.PI/1.4,angle+Math.PI/1.4,true);
			ctx.stroke();
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(orgx,orgy,size/2+9,angle-Math.PI/1.3,angle+Math.PI/1.3,true);
			ctx.stroke();
		} else {
			var turtleCanvas = document.createElement("canvas");
			turtleCanvas.className = "canvas";
			turtleCanvas.width = canvasSize;
			turtleCanvas.height = canvasSize;
			var turtleContext = turtleCanvas.getContext("2d");
			resetTurtle(id, turtleContext);
			context.drawImage(turtleCanvas, 0, 0);
		}
		div.appendChild(canvas);
		$_eseecode.whiteboard.appendChild(div);
	}

	/**
	 * Resets the layers visibility back to normal after a highlightCanvas() call
	 * @private
	 * @example unhighlightCanvas()
	 */
	function unhighlightCanvas() {
		var div = document.getElementById("canvas-div-highlight");
		if (div) {
			div.parentNode.removeChild(div);
		}
	}

	/**
	 * Initializes/Resets the grid layer
	 * @private
	 * @example resetGrid(3)
	 */
	function resetGrid() {
		var canvasSize = window.getComputedStyle(document.querySelector('#whiteboard')).getPropertyValue('width').replace("px","");
		var ctx = $_eseecode.canvasArray[0].context;
		clearCanvas(0);
		if (!document.getElementById("setup-grid-enable").checked) {
			return;
		}
		ctx.font = "bold 10px Arial";
		ctx.fillStyle = "#AAAAAA";
		var margin=2, fontHeight=7, fontWidth=5;
		ctx.fillText("(0,0)",margin,fontHeight+margin);
		ctx.fillText("("+canvasSize+","+canvasSize+")",canvasSize-(canvasSize.toString().length*2+3)*fontWidth-margin,canvasSize-2-margin);
		var step = parseInt(document.getElementById("setup-grid-step").value);
		if (step < 25) {
			step = 25;
			document.getElementById("setup-grid-step").value = step;			
		}
		ctx.fillStyle = "#DDDDDD";
		ctx.strokeStyle = "#EEEEEE";
		ctx.lineWidth = 1;
		for (var i=step; i<canvasSize; i+=step) {
			ctx.fillText(i,i,7);
			ctx.moveTo(i,0);
			ctx.lineTo(i,canvasSize);
			ctx.stroke();
		}
		for (var i=step; i<canvasSize; i+=step) {
			ctx.fillText(i,0,i);
			ctx.moveTo(0,i);
			ctx.lineTo(canvasSize,i);
			ctx.stroke();
		}
	}

	/**
	 * Check the execution control limits
	 * @private
	 * @param {Number} lineNumber Code line number currently running
	 * @example checkExecutionLimits(31)
	 */
	function checkExecutionLimits(lineNumber) {
		// If $_eseecode.execution.programCounterLimit === false the step limit is ignored
		var executionTime = new Date().getTime();
		$_eseecode.execution.programCounter++;
		setHighlight(lineNumber);
		if ($_eseecode.session.breakpoints[lineNumber]) {
			$_eseecode.execution.breakpointCounter++;
			if ($_eseecode.execution.breakpointCounter >= $_eseecode.execution.breakpointCounterLimit) {
				throw "executionBreakpointed";
			}
		}
		if (executionTime > $_eseecode.execution.endLimit) {
			throw "executionTimeout";
		}
		if ($_eseecode.execution.programCounterLimit && $_eseecode.execution.programCounter >= $_eseecode.execution.programCounterLimit) {
			throw "executionStepped";
		}
	}

	/**
	 * Show execution results
	 * @private
	 * @param {String|Object} [err] Caught exception
	 * @example showExecutionResults()
	 */
	function showExecutionResults(err) {
		if (err === undefined) {
			if ($_eseecode.execution.programCounterLimit !== false) {
				// If in step by step, highlight last line
				highlight($_eseecode.session.highlight.lineNumber);
			} else {
				unhighlight();
			}
		} else if (err === "executionTimeout") {
			highlight($_eseecode.session.highlight.lineNumber,"error");
			msgBox(_("The execution is being aborted because it is taking too long.\nIf you want to allow it to run longer increase the value in 'Stop execution after'"));
		} else if (err === "executionStepped") {
			highlight($_eseecode.session.highlight.lineNumber);
		} else if (err === "executionBreakpointed") {
			highlight($_eseecode.session.highlight.lineNumber);
			switchDialogMode("debug");
		} else {
			// The code didn't finish running and there is no known reason
			printExecutionError(err);
		}
		var executionTime = ((new Date().getTime())-$_eseecode.execution.startTime)/1000;
		document.getElementById("execute-notes").innerHTML = _("Instructions executed")+": "+$_eseecode.execution.programCounter+" ("+executionTime+" "+_("secs")+")";
	}

	/**
	 * Resets and sets up internal configuration for a new cod execution
	 * @private
	 * @param {Boolean|String} [resetStepLimit] true = restart the stepping, false = update the stepping, "disabled" = ignore the stepping
	 * @example initProgramCounter()
	 */
	function initProgramCounter(resetStepLimit) {
		// Stop previous execution remaining animations
		for (var i=0; i<$_eseecode.session.timeoutHandlers.length; i++) {
			clearTimeout($_eseecode.session.timeoutHandlers[i]);
		}
		var withStep = $_eseecode.execution.stepped;
		if (resetStepLimit === "disabled") {
			withStep = false;
		}
		$_eseecode.execution.startTime = new Date().getTime();
		var time = $_eseecode.execution.timeLimit;
		if (time <= 0) {
			time = 3;
			$_eseecode.execution.timeLimit = time;
			initSetup();
		}
		$_eseecode.execution.endLimit = $_eseecode.execution.startTime+time*1000;
		$_eseecode.execution.programCounter = 0;
		$_eseecode.execution.breakpointCounter = 0;
		if (resetStepLimit) {
			$_eseecode.execution.programCounterLimit = 0;
			$_eseecode.execution.breakpointCounterLimit = 0;
		} else {			
			$_eseecode.execution.breakpointCounterLimit++;
		}
		if (withStep) {
			if (!resetStepLimit) {
				var step = $_eseecode.execution.step;
				if (step < 1) {
					step = 1;
					$_eseecode.execution.step = step;
					initSetup();			
				}
				$_eseecode.execution.programCounterLimit = ($_eseecode.execution.programCounterLimit?$_eseecode.execution.programCounterLimit:0) + step;
			}
		} else {
			$_eseecode.execution.programCounterLimit = false;
		}
	}

	/**
	 * Displays execution error
	 * @private
	 * @param {!Object} [err] Caught exception
	 * @example printExecutionError(err)
	 */
	function printExecutionError(err) {
		var lineNumber;
		if (err.lineNumber) { // Firefox
			lineNumber = err.lineNumber;
			lineNumber++; // Firefox starts lines at 0
		} else if (err.stack) { // Chrome
			var lines = err.stack.split("\n");
			var i;
			for (i=0;i<lines.length;i++) {
				if (lines[i].indexOf("at <anonymous>:") >= 0) {
					lineNumber = lines[i].split(":")[1];
				}
			}
		}
		var message, action;
		if (lineNumber) {
			var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
			highlight(lineNumber,"error");
			if (mode == "write") {
				ace.edit("console-write").gotoLine(lineNumber,0);
			}
			message = _("Error '%s' in line %s",[err.name,lineNumber])+": "+err.message;
		} else if (err.stack) {
			message = err.name+": "+err.message+"\n"+err.stack;
		} else {
			message = _("Runtime error!");
		}
		msgBox(message);
	}

	/**
	 * Setup execution sandboxing
	 * It deletes or resets variables created in the last execution
	 * @private
	 * @example resetSandbox()
	 */
	function resetSandbox() {
		if (!$_eseecode.execution.sandboxProperties) {
			$_eseecode.execution.sandboxProperties = [];
		}
		for (var i=0; i<$_eseecode.execution.sandboxProperties.length; i++) {
			 this[$_eseecode.execution.sandboxProperties[i]] = undefined;
		}
	}

	/**
	 * Checks and takes note of which variables where created during the last execution
	 * The list of changes is pushed into $_eseecode.execution.sandboxProperties
	 * @private
	 * @param {Array<String>} oldKeys List of variables existing before the last execution
	 * @param {Array<String>} newKeys List of variables existing after the last execution
	 * @example updateSandboxChanges(oldKeys, newKeys)
	 */
	function updateSandboxChanges(oldKeys, newKeys) {
		for (var i=0; i<newKeys.length; i++) {
			var keyNameNew = newKeys[i];
			var found = false;
			for (var j=0; j<oldKeys.length; j++) {
				var keyNameOld = oldKeys[j];
				if (keyNameOld == keyNameNew) {
					found = true;
					break;
				}
			}
			if (!found) {
				$_eseecode.execution.sandboxProperties.push(keyNameNew);
			}
			found = false;
		}
	}

	/**
	 * Runs code
	 * @private
	 * @param {Boolean} [forceNoStep] Whether or not to force to ignore the stepping
	 * @param {String} [code] Code to run. If unset run the code in the console window
	 * @example execute()
	 */
	function execute(forceNoStep, code) {
		if (!code) {
			resetSandbox();
		}
		var withStep;
		if (forceNoStep || code) { // Code from events run without stepping
			withStep = "disabled";
		}
		unhighlight();
		initProgramCounter(withStep);
		if (code === undefined) {
			var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
			if (mode == "blocks") {
				var consoleDiv = document.getElementById("console-blocks");
				code = blocks2code(consoleDiv.firstChild);
			} else if (mode == "write") {
				code = ace.edit("console-write").getValue();
				// Check and clean code before parsing
				if (eseecodeLanguage) {
					try {
						var program = eseecodeLanguage.parse(code);
						var level;
						for (var i=0;i<$_eseecode.modes.console.length;i++) {
							if ($_eseecode.modes.console[i].div == "write") {
								level = $_eseecode.modes.console[i].name;
							}
						}
						code = program.makeWrite(level,"","\t");
					} catch (exception) {
						msgBox(_("Can't parse the code. There is the following problem in your code")+":\n\n"+exception.name + ":  " + exception.message);
						var lineNumber = exception.message.match(/. (i|o)n line ([0-9]+)/);
						if (lineNumber[2]) {
							lineNumber = lineNumber[2];
							highlight(lineNumber,"error");
							ace.edit("console-write").gotoLine(lineNumber,0,true);
						}
						return;
					}
					resetWriteConsole(code);
				}
			}
			resetCanvas();
			resetBreakpointWatches();
		}
		code = code2run(code, !withStep);
		var script = document.createElement("script");
		script.id = "executionCode";
		script.type = "text/javascript";
		script.innerHTML = code;
		var oldWindowProperties;
		if (Object.getOwnPropertyNames) {
			oldWindowProperties = Object.getOwnPropertyNames(window);
		}
		document.getElementById("eseecode").appendChild(script);
		var newWindowProperties;
		if (Object.getOwnPropertyNames) {
			newWindowProperties = Object.getOwnPropertyNames(window);
			updateSandboxChanges(oldWindowProperties,newWindowProperties);
		}
		document.getElementById("eseecode").removeChild(script);
		// if debug is open refresh it
		if ($_eseecode.modes.dialog[$_eseecode.modes.dialog[0]].name == "debug") {
			resetDebug();
		}
	}

	/**
	 * Select text in ace
	 * @private
	 * @param {Number} lineStart Line where the selection starts
	 * @param {Number} lineEnd Line where the selection ends
	 * @param {String} style Ace style to use for highlighting
	 * @example selectTextareaLine(12, 12, "ace_step")
	 */
	function selectTextareaLine(lineStart, lineEnd, style) {
		lineStart--; // array starts at 0, we leave lineEnd as is beacuse we'll select until the beginning of the next line
		var Range = require('ace/range').Range;
		return ace.edit("console-write").session.addMarker(new Range(lineStart,0,lineEnd-1,ace.edit("console-write").session.getLine(lineEnd-1).length), style, "fullLine");
	}

	/**
	 * Highlight code
	 * @private
	 * @param {Number} [lineNumber] Line to highlight. If unset it highlights the last line marked with setHighlight()
	 * @param {String} [reason=step] Reason for highlighting. Available reasons are: "step", "error"
	 * @example highlight(12, "error")
	 */
	function highlight(lineNumber, reason) {
		reason = reason?reason:"step";
		if (!lineNumber) {
			if ($_eseecode.session.highlight.lineNumber) {
				lineNumber = $_eseecode.session.highlight.lineNumber;
			} else {
				return;
			}
			reason = $_eseecode.session.highlight.reason;
		}
		unhighlight();
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		if (mode == "blocks") {
			var consoleDiv = document.getElementById("console-blocks");
			var div = searchBlockByPosition(consoleDiv.firstChild,lineNumber,1).element;
			var style;
			if (reason === "error") {
				style = "#FF0000";
			} else {
				var r = ("0" + Math.floor((Math.random()*256)).toString(16)).slice(-2);
				var g = ("0" + Math.floor((Math.random()*256)).toString(16)).slice(-2);
				var b = ("0" + Math.floor((Math.random()*256)).toString(16)).slice(-2);
				style = "#"+ r.toString()+g.toString()+b.toString();
			}
			div.style.border = "2px solid "+style;
			div.style.boxShadow = "5px 5px 5px "+style;
			smoothScroll(consoleDiv, div.offsetTop-consoleDiv.offsetTop-consoleDiv.clientHeight/2+blockSize(level,consoleDiv.firstChild).height/2);
		} else if (mode == "write") {
			var style;
			if (reason == "error") {
				style = "ace_stack";
			} else {
				style = "ace_step";
			}
			selectTextareaLine(lineNumber,lineNumber, style);
			ace.edit("console-write").scrollToLine(lineNumber, true, true);
		}
		$_eseecode.session.highlight.lineNumber = lineNumber;
		$_eseecode.session.highlight.reason = reason;
	}

	/**
	 * Removes code highlight
	 * @private
	 * @example unhighlight()
	 */
	function unhighlight() {
		if (!$_eseecode.session.highlight.lineNumber) {
			return;
		}
		var consoleDiv = document.getElementById("console-blocks");
		if (consoleDiv.firstChild && consoleDiv.firstChild.id !== "console-blocks-tip") {
			var div = searchBlockByPosition(consoleDiv.firstChild,$_eseecode.session.highlight.lineNumber,1).element;
			if (div) { // by the time we have to unhighlight it the div might not exist anymore
				div.style.border = ""; // accesses the canvas
				div.style.boxShadow = ""
			}
		}
		var markers = ace.edit("console-write").session.getMarkers(false);
		for (var key in markers) {
			var marker = markers[key];
			ace.edit("console-write").session.removeMarker(marker.id);
		}
		$_eseecode.session.highlight.lineNumber = undefined;
		$_eseecode.session.highlight.reason = undefined;
	}

	/**
	 * Mark a line to highlight
	 * @private
	 * @param lineNumber Line to mark to highlight
	 * @example setHighlight(12)
	 */
	function setHighlight(lineNumber) {
		$_eseecode.session.highlight.lineNumber = lineNumber;
		
	}

	/**
	 * Returns the index where the given instruction is in $_eseecode.instructions.set, or -1 if it didn't find it
	 * @private
	 * @param instructionName Name of the instruction to search
	 * @param startId Index to start from. Useful when an instruction appears several times in the set and we want to skip the ones we've seen
	 * @return {Number}
	 * @example getInstructionSetIdFromName("forward")
	 */
	function getInstructionSetIdFromName(instructionName, startId) {
		if (startId == null) { // By default search from the beginning
			startId = 0;
		}
		for (var i=startId; i<$_eseecode.instructions.set.length; i++) {
			if (instructionName == $_eseecode.instructions.set[i].name) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * Converts all blocks into code and puts the code in the write console
	 * @private
	 * @example blocks2write()
	 */
	function blocks2write() {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var code = blocks2code(document.getElementById("console-blocks").firstChild);
		var cleanCode;
		if (eseecodeLanguage) {
			try {
				var program = eseecodeLanguage.parse(code);
				cleanCode = program.makeWrite(level,"","\t");
			} catch (exception) {
				// This should never happen
				cleanCode = code;
			}
		}
		resetWriteConsole(cleanCode);
	}
	
	/**
	 * Returns in text the code from the blocks console
	 * This function generates the pseudocode visible in level4
	 * @private
	 * @param {!HTMLElement} blockDiv Blocks console element
	 * @param {String} [indentation=""] Initial indentation
	 * @return {String}
	 * @example blocks2code(document.getElementById("console-blocks").firstChild)
	 */
	function blocks2code(blockDiv,indentation) {
		if (!indentation) { // We assume this is the main call
			indentation = "";
		}
		var code = "";
		while (blockDiv && blockDiv.id != "console-blocks-tip") { // Check that there really is code in the block code area, otherwise there's nothing to convert
			var instruction = $_eseecode.instructions.set[blockDiv.getAttribute("instructionSetId")];
			var thisIndentation = indentation;
			if (instruction.code && instruction.code.unindent) {
				thisIndentation = thisIndentation.substr(0,thisIndentation.length-1);
			}
			code += thisIndentation + loadParameters("level4",blockDiv).text + "\n";
			if (blockDiv.firstChild.nextSibling) { // if it has a child it is a nested div/block
				code += blocks2code(blockDiv.firstChild.nextSibling,indentation+"\t");
			}
			blockDiv = blockDiv.nextSibling;
		}
		return code;
	}

	/**
	 * Converts blocks in blocks console to a level
	 * @private
	 * @param {String} level Level to convert blocks to
	 * @example blocks2blocks("level2")
	 */
	function blocks2blocks(level) {
		var divs = document.getElementById("console-blocks").getElementsByTagName("div");
		for (var i=divs.length-1; i>=0; i--) { // We parse it bottom-up because we need to redraw the children before begin able to accurately redraw the parents
			var div = divs[i];
			if (div.id == "console-blocks-tip") {
				continue;
			}
			createBlock(level,div);
		}
	}

	/**
	 * Converts user code to executable code and returns it
	 * @private
	 * @param {String} pseudoCode User code to convert
	 * @return {String}
	 * @example eval(code2run("repeat(4){forward(100)}"))
	 */
	function code2run(pseudoCode) {
		var program = eseecodeLanguage.parse(pseudoCode);
		var level;
		for (var i=0;i<$_eseecode.modes.console.length;i++) {
			if ($_eseecode.modes.console[i].div == "write") {
				level = $_eseecode.modes.console[i].name;
			}
		}
		var code = program.makeWrite(level,"","\t",true);
		code = "\"use strict\";try {"+code+";\n\
				showExecutionResults();\n\
			} catch(err) {\n\
				showExecutionResults(err);\n\
			}";
		return code;
	}

	/**
	 * Downloads the user code as a file to the user's device
	 * @private
	 * @example saveCode()
	 */
	function saveCode() {
		if (navigator.userAgent.match(/MSIE/)) {
			msgBox(_("Sorry, your browser doesn't support downloading the code directly. Switch to level4, copy the code and paste it into a file in your computer."));
			return;
		}
		var codeURI = "data:application/octet-stream," + encodeURIComponent(downloadCode());
		var downloadLink = document.createElement("a");
		downloadLink.href = codeURI;
		downloadLink.download = (($_eseecode.codeFilename && $_eseecode.codeFilename.length > 0)?$_eseecode.codeFilename:"code.esee");
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}

	/**
	 * Returns the user's code
	 * @public
	 * @return {String}
	 * @example downloadCode()
	 */
	function downloadCode() {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		var code;
		if (mode == "blocks") {
			code = blocks2code(document.getElementById("console-blocks").firstChild);
		} else if (mode == "write") {
			var code;
			code = ace.edit("console-write").getValue();
		}
		return code;
	}

	/**
	 * Asks the user via the UI to upload a file which will then trigger loadCodFile()
	 * @private
	 * @example loadCode()
	 */
	function loadCode() {
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			var uploadButton = document.createElement("input");
			uploadButton.type = "file";
			uploadButton.addEventListener('change', loadCodeFile, false);
			uploadButton.style.display = "none";
			document.body.appendChild(uploadButton);
			uploadButton.click();
			document.body.removeChild(uploadButton);
		} else {
			msgBox(_("Sorry, your browser doesn't support uploading files directly. Paste your code into level4 and then switch to the level you wish to code with."));
		}
	}

	/**
	 * Completes or cancels the loadCode() asynchronous event by loading the code into the console if possible
	 * @private
	 * @param {!Object} event Event
	 * @example loadCodeFile(event)
	 */
	function loadCodeFile(event) {
		if (!event.target.files.length) {
			return;
		}
		var file = event.target.files[0];
		if (!file) {
        		msgBox(_("Failed to upload the file!"));
			return;
		} else if (file.type && !file.type.match('text.*')) {
			msgBox(_("%s is not a valid eSee file! (Invalid file type %s)",[file.name,file.type]));
			return;
		}
      		var reader = new FileReader();
		reader.onload = function(event) {
			uploadCode(event.target.result)
			$_eseecode.codeFilename = file.name;
		}
		reader.readAsText(file);
	}

	/**
	 * Loads code into the console
	 * @public
	 * @param {String} code Code to upload
	 * @example uploadCode("repeat(4){forward(100)}")
	 */
	function uploadCode(code) {
		if (!code) {
			return;
		}
		if (!resetUI(true)) {
			return;
		}
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		var program;
		// Always start by trying to load the code into the current level
		var switchToMode;
		if (eseecodeLanguage) {
			try {
				program = eseecodeLanguage.parse(code);
			} catch (exception) {
				msgBox(_("Can't open the code in %s mode because there are erros in the code. Please open the file in level4 mode and fix the following errors",[level])+":\n\n"+exception.name + ":  " + exception.message);
			}
		} else {
			msgBox(_("Can't open the code in %s mode because you don't have the eseecodeLanguage script loaded. Please open the file in level4 mode",[level]));
		}
		if (mode == "blocks") {
			program.makeBlocks(level,document.getElementById("console-blocks"));
		} else if (mode == "write") {
			resetWriteConsole(program.makeWrite(level,"","\t"));
		}
		resetCanvas();
	}

	/**
	 * Scrolls to a position in the div, it scrolls smoothly
	 * @private
	 * @param {!HTMLElement} div Div to scroll
	 * @param {Number} height Pixels from top to scroll to
	 * @param {Number} [startTop] Offset from the start. If unset it takes the current div's scroll offset
	 * @example smoothScroll()
	 */
	function smoothScroll(div, height, startTop) {
		if (!startTop) {
			startTop = div.scrollTop;
		}
		if  ((startTop < height && (div.scrollTop >= div.scrollHeight-div.clientHeight || div.scrollTop > height)) ||
		     (startTop > height && (div.scrollTop <= 0 || div.scrollTop < height))) { // This is to prevent infinite loop if height is out of div's height bounds
			return;
		}
		var increment = 1;
		if ((height > div.scrollTop && height-div.scrollTop > div.clientHeight*0.3) ||
		    (height < div.scrollTop && div.scrollTop-height > div.clientHeight*0.3)) {
			increment *= 10;
		}
		if (div.scrollTop > height) {
			increment *= -1;
		}
		div.scrollTop += increment;
		if (div.scrollTop != height) {
			setTimeout(function() { smoothScroll(div, height, startTop) }, 1);
		}
	}

	/**
	 * Translate the string
	 * Translation strings must be available at $_eseecode.i18n.available[language_code][text]
	 * @private
	 * @param {String} text Text to translate
	 * @param {Array<String>} [params] Parameters to instert into the text replacing '%s'
	 * @return {String}
	 * @example _("text")
	 */
	function _(text, params) {
		var langCurrent = $_eseecode.i18n.current;
		var lang = $_eseecode.i18n.available[langCurrent];
		if (!lang) {
			lang = $_eseecode.i18n.available["default"];
		}
		var translated;
		if (lang[text]) {
			translated = lang[text];
		} else {
			translated = text;
			//console.log("\""+text+"\": \"\",");
		}
		if (params) {
			for (var i=0; i<params.length; i++) {
				translated = translated.replace(/%s/,params[i]);
			}
		}
		return translated;
	}

	/**
	 * Switch translation
	 * @private
	 * @param {String} [lang] Language code to translate to. If unset it checks the "lang" parameter in the browser's URL. If it can't determine the new langauge, it takes "default"
	 * @param {Boolean} [force] Forces the language switch even if it is the same as the current language. If the language doens't exist it falls back to "default"
	 * @example switchLanguage("ca")
	 */
	function switchLanguage(lang, force) {
		if (!lang) {
			if (!lang) {
				var urlParts = window.location.href.match(/(\?|&)lang=([^&#]+)/);
				if (urlParts !== null) {
					lang = urlParts[2];
				}
			}
			if (!lang) {
				lang = "default";
			}
		}
		lang = lang.toLowerCase();
		// Only switch if necessary
		if (lang === $_eseecode.i18n.current && !force) {
			return;
		}
		// Check the translation is available
		if (!$_eseecode.i18n.available[lang]) {
			if (force) {
				lang = "default";
			} else {
				return;
			}
		}
		$_eseecode.i18n.current = lang;
		addStaticText();
		switchDialogMode();
		switchConsoleMode();
		document.getElementById("language-select").value = lang;
		var translator = "";
		if ($_eseecode.i18n.available[lang].translator) {
			translator = $_eseecode.i18n.available[lang].translator;
			if ($_eseecode.i18n.available[lang].translatorLink) {
				translator = "<a href=\""+$_eseecode.i18n.available[lang].translatorLink+"\" target=\"_blank\">"+translator+"</a>";
			}
			translator = _("Translated to %s by %s",[$_eseecode.i18n.available[lang].name,translator]);
		}
		document.getElementById("language-translator").innerHTML = translator;
	}

	/**
	 * Initializes/Resets static text translations
	 * @private
	 * @example addStaticText()
	 */
	function addStaticText() {
		for (var i=1; i<$_eseecode.modes.console.length; i++) {
			var levelName = $_eseecode.modes.console[i].name;
			var levelText = levelName.substr(0,1).toUpperCase()+levelName.substr(1);
			document.getElementById("console-tabs-level"+i).innerHTML = "<a href=\"#\">"+_(levelText)+"</a>";
			document.getElementById("console-tabs-level"+i).title = _("Double click to maximize/restore");
		}
		document.getElementById("language-title").innerHTML = _("Select language")+": ";
		document.getElementById("language-select").title = _("Select language");
		document.getElementById("title").innerHTML = _($_eseecode.platform.name.text);
		document.getElementById("author").innerHTML = _("v")+"<a href=\""+_($_eseecode.platform.version.link)+"\" target=\"_blank\">"+_($_eseecode.platform.version.text)+"</a><br />\
		"+_("Author")+": "+"<a href=\""+_($_eseecode.platform.author.link)+"\" target=\"_blank\">"+_($_eseecode.platform.author.text)+"</a><br />\
		"+_("Licensed under the")+" "+"<a href=\""+_($_eseecode.platform.license.link)+"\" target=\"_blank\">"+_($_eseecode.platform.license.text)+"</a></div>";
		document.getElementById("loadcode").value = _("Load code");
		document.getElementById("savecode").value = _("Save code");
		document.getElementById("whiteboard").title = _("Whiteboard");
		document.getElementById("console-blocks").title = _("Console Blocks");
		document.getElementById("console-write").title = _("Console Write");
		document.getElementById("button-undo").title = _("Undo");
		document.getElementById("button-execute").title = _("Run");
		document.getElementById("button-clear").title = _("Clear");
		document.getElementById("button-reset").title = _("Reset");
		document.getElementById("button-redo").title = _("Redo");
		document.getElementById("dialog-tabs-setup").title = _("Setup");
		document.getElementById("dialog-tabs-debug").innerHTML = "<a href=\"#\">"+_("Debug")+"</a>";
		document.getElementById("dialog-tabs-window").innerHTML = "<a href=\"#\">"+_("Window")+"</a>";
		document.getElementById("dialog-tabs-pieces").innerHTML = "<a href=\"#\">"+_("Pieces")+"</a>";
		document.getElementById("dialog-blocks").title = _("Blocks available");
		document.getElementById("dialog-write").title = _("Instructions available");
		document.getElementById("dialog-window").title = _("Interactive window");
		document.getElementById("dialog-debug").title = _("Debug dialog");
		document.getElementById("dialog-debug-layers-title").innerHTML = _("Layers")+":";
		document.getElementById("dialog-debug-layers-help").title = _("Here you can:\n * analyze the order of layers\n * view a layer alone and its cursor\n * toggle layer visibility\n * set the active layer\n * run commands");
		document.getElementById("dialog-debug-analyzer-title").innerHTML = _("Analyzer")+":";
		document.getElementById("dialog-debug-analyzer-help").title = _("Here you can:\n * mark a line to stop the program at that point\n * watch values of variables at those stops");
		document.getElementById("dialog-debug-command-label").innerHTML = _("Command");
		document.getElementById("dialog-debug-command-input").title = _("Command");
		document.getElementById("dialog-debug-command-button").title = _("Run");
		document.getElementById("dialog-setup").title = _("Setup dialog");
		document.getElementById("setup-grid-enable-label").innerHTML = _("Toggle grid");
		document.getElementById("setup-grid-enable").title = _("Toggle grid");
		document.getElementById("setup-grid-step-title").innerHTML = _("Grid")+": ";
		document.getElementById("setup-grid-step").title = _("Grid inter-line space");
		document.getElementById("setup-turtle-enable-title").innerHTML = _("Cursor")+":";
		document.getElementById("setup-turtle-enable-label").innerHTML = _("Toggle cursor");
		document.getElementById("setup-turtle-enable").title = _("Toggle cursor");
		document.getElementById("downloadImage").innerHTML = "<b>"+_("Download whiteboard image")+"</b>";
		document.getElementById("setup-execute-step-title").innerHTML = _("Pause every")+" ";
		document.getElementById("setup-execute-step").title = _("Number of instructions until pause");
		document.getElementById("setup-execute-step-title2").innerHTML = " "+_("instructions")+" ";
		document.getElementById("setup-execute-stepped").title = _("Run stepped");
		document.getElementById("setup-execute-time-title").innerHTML = _("Stop execution after")+" ";
		document.getElementById("setup-execute-time").title = _("Number of seconds to run");
		document.getElementById("setup-execute-time-title2").innerHTML = " "+_("seconds");
	}

	/**
	 * Initializes/Resets the language selection element to provide all available translations
	 * @private
	 * @example resetLanguageSelect("ca")
	 */
	function resetLanguageSelect() {
		var select = document.getElementById("language-select");
		// Reset languages in dropdown menu
		select.options.length = 0;
		// Get available translations
		var languages = [];
		for (var langKey in $_eseecode.i18n.available) {
			languages.push([langKey, $_eseecode.i18n.available[langKey].name]);
		}
		// Sort by name
		languages = languages.sort(function(a,b) {
			return a[1] > b[1];
		});
		// Add languages to dropdown menu
		for (var i=0; i<languages.length; i++) {
			var langKey = languages[i][0];
			var option = document.createElement("option");
			option.text = $_eseecode.i18n.available[langKey].name;
			option.value = langKey;
			select.add(option);
		}
	}

	/**
	 * Check if the code in the console is empty
	 * @private
	 * @return {Boolean}
	 * @example codeIsEmpty("ca")
	 */
	function codeIsEmpty() {
		if (ace.edit("console-write").getValue()) {
			return false;
		}
		if (document.getElementById("console-blocks").firstChild.id !== "console-blocks-tip") {
			return false;
		}
		return true;
	}

	/**
	 * Initializes/Resets all UI elements
	 * @private
	 * @param {Boolean} nonInitial If set to true it asks for confirmation if code would be lost
	 * @example resetUI()
	 */
	function resetUI(notInitial) {
		$_eseecode.whiteboard = document.getElementById("whiteboard");
		$_eseecode.dialogWindow = document.getElementById("dialog-window");
		if (notInitial === true && !codeIsEmpty() && !confirm(_("Do you really want to start over?"))) {
			return false;
		}
		initUIElements();
		resetUndo();
		resetBreakpoints();
		// Hide filemenu if asked to do so (to integrate with other platforms)
		var urlParts = window.location.href.match(/(\?|&)filemenu=([^&#]+)/);
		if (urlParts !== null) {
			if (urlParts[2] == "false" || urlParts[2] == "0" || urlParts[2] == "no" || urlParts[2] == "none") {
				document.getElementById("filemenu").style.display = "none";
			}
		}
		// init $_eseecode.modes array with div objects
		for (var i=1;i<$_eseecode.modes.console.length;i++) {
			var modeName = $_eseecode.modes.console[i].name;
			$_eseecode.modes.console[i].tab = document.getElementById("console-tabs-"+modeName);
		}
		for (var i=1;i<$_eseecode.modes.dialog.length;i++) {
			var modeName = $_eseecode.modes.dialog[i].div;
			$_eseecode.modes.dialog[i].element = document.getElementById("dialog-"+modeName);
			if (i < $_eseecode.modes.console.length) {
				$_eseecode.modes.dialog[i].tab = document.getElementById("dialog-tabs-pieces");
			} else {
				$_eseecode.modes.dialog[i].tab = document.getElementById("dialog-tabs-"+modeName);
			}
		}
		resizeConsole(true);
		initConsole();
		resetCanvas();
		resetDebug();
		initSetup();
		resetLanguageSelect();
		switchLanguage(undefined, true);
		document.body.removeEventListener("keydown", keyboardShortcuts, false);
		document.body.addEventListener("keydown", keyboardShortcuts, false);
		return true;
	}

	/**
	 * Initializes/Resets the Console
	 * @private
	 * @example initConsole()
	 */
	function initConsole() {
		resetBlocksConsole(document.getElementById("console-blocks"));
		resetWriteConsole();
	}

	/**
	 * Returns the block's height in the given level
	 * This takes into account space between blocks, border heights, etc
	 * @private
	 * @param {String} level Level name
	 * @param {!HTMLElement} div Div element
	 * @return {{width:Number, height:Number}}
	 * @example blockSize("level2", document.getElementById("div-123213213"))
	 */
	function blockSize(level, div) {
		var size = { width: div.clientWidth, height: div.clientHeight };
		if (div.lastChild && div.lastChild.tagName === "DIV") {
			// div is a block, check size based on the last child which is always a single element			
			size = { width: div.lastChild.clientWidth, height: div.lastChild.clientHeight };
		}
		if (level == "level1") {
			size.height += 7+1+1; // add border and margin
		} else if (level == "level2" || level == "level3") {
			size.height += 1; // add border and margin
		}
		return size;
	}

	/**
	 * Cancels a block movement or edition
	 * @private
	 * @param {Object} event Event
	 * @example cancelFloatingBlock()
	 */
	function cancelFloatingBlock(event) {
		if (event && event.type == "keydown") {
			if (event.keyCode != 27) {
				return;
			}
		}
		if ($_eseecode.session.floatingBlock.div) {
			if ($_eseecode.session.floatingBlock.div.parentNode == document.body) { // it could be that the div has been reassigned to the console
				deleteBlock($_eseecode.session.floatingBlock.div);
			}
			if ($_eseecode.session.floatingBlock.fromDiv) {
				$_eseecode.session.floatingBlock.fromDiv.style.opacity = 1;
			}
		}
		$_eseecode.session.floatingBlock.div = null;
		$_eseecode.session.floatingBlock.fromDiv = null;
		if (!isTouchDevice()) {
			document.body.removeEventListener("mouseup", unclickBlock, false);
			document.body.removeEventListener("mousemove", moveBlock, false);
			document.body.removeEventListener("keydown", cancelFloatingBlock, false);
		} else {
			document.body.removeEventListener("touchend", unclickBlock, false);
			document.body.removeEventListener("touchmove", moveBlock, false);
			document.body.removeEventListener("touchcancel", cancelFloatingBlock, false);
		}
		if (event) { // Only do this if it was tiggered by an event
			$_eseecode.session.blocksUndo.pop(); // Sice the edition was cancelled, pop the half-written undo element
		}
	}

	/**
	 * Keyboard shortcuts listener. It listenes for all keyboard presses and calls functions when shurtcut combinations happen
	 * @private
	 * @param {Object} event Event
	 * @example document.body.addEventListener("keydown",keyboardShortcuts,false)
	 */
	function keyboardShortcuts(event) {
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		if ($_eseecode.session.breakpointHandler && event && event.type == "keydown" && event.keyCode == 27) {
			addBreakpointEventCancel();
		} else if (mode == "blocks") {
			if (event && event.type == "keydown") {
				if (event.which === 90 && event.ctrlKey && !event.shiftKey) { // CTRL+Z
					undo(false);
				} else if (event.which === 90 && event.ctrlKey && event.shiftKey) { // CTRL+SHIFT+Z
					undo(true);
				} else if (event.which === 89 && event.ctrlKey) { // CTRL+Y
					undo(true);
				}
			}
		}
	}

	/**
	 * Block clicked listener. It listenes for clicks on blocks and acts accordingly
	 * @private
	 * @param {Object} event Event
	 * @example div.addEventListener(handler,clickBlock)
	 */
	function clickBlock(event) {
		if ($_eseecode.session.breakpointHandler) {
			addBreakpointEvent(event);
			return;
		}
		unhighlight();
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var div = event.target;
		if (div.tagName !== "DIV") {
			if (div.id.match(/^div-blankspan-/)) {
				event.stopPropagation();
				return;
			} else {
				while (div.tagName !== "DIV") {
					div = div.parentNode;
				}
			}
		}
		var instructionSetId = div.getAttribute("instructionSetId");
		var instruction = $_eseecode.instructions.set[instructionSetId];
		while (div && instruction.dummy) {
			div = div.parentNode;
			instructionSetId = div.getAttribute("instructionSetId");
			instruction = $_eseecode.instructions.set[instructionSetId];
		}
		if (!div) {
			// This should never happen
			event.stopPropagation();
			return;
		}
		var dialog = false;
		if (div.parentNode.id.match(/^dialog-/)) {
			dialog = true;
		}
		cancelFloatingBlock();
		var blocksUndoIndex = $_eseecode.session.blocksUndo[0]+1;
		if (blocksUndoIndex > $_eseecode.setup.undoDepth) { // never remember more than 20 actions (which means the array has 21 elements, since the first one is the index)
			blocksUndoIndex--;
			$_eseecode.session.blocksUndo.shift();
			$_eseecode.session.blocksUndo[0] = blocksUndoIndex-1;
		}
		$_eseecode.session.blocksUndo[blocksUndoIndex] = { fromDiv: null, fromDivPosition: false, div: null, divPosition: false };
		if (!dialog) {
			$_eseecode.session.floatingBlock.fromDiv = div;
			$_eseecode.session.blocksUndo[blocksUndoIndex].fromDiv = $_eseecode.session.floatingBlock.fromDiv;
			var count = 0;
			var element = document.getElementById("console-blocks").firstChild;
			$_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition = recursiveCount(element, div).count;
		}
		$_eseecode.session.floatingBlock.div = div.cloneNode(true);
		// Copy parameters
		for (var i=1; div.getAttribute("param"+i) !== null; i++) {
			$_eseecode.session.floatingBlock.div.setAttribute("param"+i,div.getAttribute("param"+i));
		}
		if (!dialog) {
			$_eseecode.session.floatingBlock.fromDiv.style.opacity = 0.4;
		}
		$_eseecode.session.floatingBlock.div.style.position = "absolute";
		document.body.appendChild($_eseecode.session.floatingBlock.div);
		$_eseecode.session.floatingBlock.div.id = newDivId();
		if ($_eseecode.session.floatingBlock.div.classList) {
			$_eseecode.session.floatingBlock.div.classList.add("floatingBlock");
		} else {			
			$_eseecode.session.floatingBlock.div.className += " floatingBlock";
		}
		paintBlock($_eseecode.session.floatingBlock.div);
		moveBlock();
		var handler;
		if (!isTouchDevice()) {
			handler = "click";
		} else {
			handler = "touchstart";
		}
		$_eseecode.session.floatingBlock.div.removeEventListener(handler,clickBlock);
		if (level != "level1") {
			// firefox is unable to use the mouse event handler if it is called from HTML handlers, so here we go
			if (!isTouchDevice()) {
				document.body.addEventListener("mouseup", unclickBlock, false);
				document.body.addEventListener("mousemove", moveBlock, false);
				document.body.addEventListener("keydown", cancelFloatingBlock, false);
			} else {
				document.body.addEventListener("touchend", unclickBlock, false);
				document.body.addEventListener("touchmove", moveBlock, false);
				document.body.addEventListener("touchcancel", cancelFloatingBlock, false);
			}
		} else { // In level1 we stick the block immediately
			unclickBlock();
		}
		event.stopPropagation();
	}

	/**
	 * Block unclicked listener. It listenes for unclicks on blocks and acts accordingly
	 * @private
	 * @param {Object} event Event
	 * @example div.addEventListener(handler,unclickBlock)
	 */
	function unclickBlock(event) {
		var blocksUndoIndex = $_eseecode.session.blocksUndo[0]+1;
		var consoleDiv = document.getElementById("console-blocks");
		var div = $_eseecode.session.floatingBlock.div;
		divId = div.id;
		var action;
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var pos = eventPosition(event);
		if (level == "level1" ||
		    (pos.x > consoleDiv.offsetLeft &&
		     pos.x < consoleDiv.offsetLeft+consoleDiv.offsetWidth &&
		     pos.y > consoleDiv.offsetTop &&
		     pos.y < consoleDiv.offsetTop+consoleDiv.offsetHeight)) {
			div.style.position = "static";
			if (level == "level1") {
				action = "add";
				addBlock(div,true);
				$_eseecode.session.blocksUndo[blocksUndoIndex].divPosition = consoleDiv.childNodes.length-1;
				setTimeout(function() {
					smoothScroll(consoleDiv, consoleDiv.scrollHeight);
				}, 100); // Scroll down to see the new block. Do it after timeout, since the div scroll size isn't updated until this event is complete
			} else {
				var handler;
				if (!isTouchDevice()) {
					handler = "mousedown";
				} else {
					handler = "touchstart";
				}
				recursiveAddEventListener(div,handler,clickBlock);
				// The block was dropped in the code so we must add it
				// Detect where in the code we must insert the div
				var blockHeight = blockSize(level, div).height;
				var position = (pos.y-consoleDiv.offsetTop+consoleDiv.scrollTop)/blockHeight;
				position += 0.5; // +0.5 to allow click upper half of block to insert above, lower half of block to insert below
				position = Math.floor(position);
				$_eseecode.session.blocksUndo[blocksUndoIndex].divPosition = position;
				if (($_eseecode.session.blocksUndo[blocksUndoIndex].divPosition === $_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition) || (isNumber($_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition) && isNumber($_eseecode.session.blocksUndo[blocksUndoIndex].divPosition) && $_eseecode.session.blocksUndo[blocksUndoIndex].divPosition-1 == $_eseecode.session.blocksUndo[blocksUndoIndex].fromDivPosition)) { // Nothing changed: Note that moving a block right below has no effect
					action = "setup";
					// We aren't using the floating block
					div = $_eseecode.session.floatingBlock.fromDiv;
					divId = div.id;
					var setupChanges = setupBlock(div);
					if (setupChanges.length > 0) {
						// Update undo array
						$_eseecode.session.blocksUndo[blocksUndoIndex].parameters = setupChanges;
						// Update the block icon
						paintBlock(div);
					} else {
						action = "cancel";
					}
				} else if ($_eseecode.session.floatingBlock.fromDiv && positionIsInBlock(consoleDiv, $_eseecode.session.floatingBlock.fromDiv, position)) {
					action = "cancel";
				} else {
					addBlock(div,position); // first we add the block, then we delete the old one, otherwise the positioning fails
					if ($_eseecode.session.floatingBlock.fromDiv) { // if the block doesn't come from the Dialog
						action = "move";
						$_eseecode.session.floatingBlock.fromDiv.parentNode.removeChild($_eseecode.session.floatingBlock.fromDiv);
					} else {
						action = "add";
						if (level == "level2" || level == "level3") {
							setupBlock(div);
						}
						paintBlock(div);
					}
					setTimeout(function() {
						var blockHeight = blockSize($_eseecode.modes.console[$_eseecode.modes.console[0]].name, div).height;
						if (position*blockHeight < consoleDiv.scrollTop) {
							smoothScroll(consoleDiv, position*blockHeight-10);
						} else if ((position+1)*blockHeight > consoleDiv.scrollTop+consoleDiv.clientHeight) {
							smoothScroll(consoleDiv, (position+1)*blockHeight-consoleDiv.clientHeight+10);
						}
					}, 100); // Scroll appropiately to see the new block. Do it after timeout, since the div scroll size isn't updated until this event is complete
				}
			}
			$_eseecode.session.blocksUndo[blocksUndoIndex].div = div;
		} else { // The block is dropped
			if ($_eseecode.session.floatingBlock.fromDiv) { // if the block doesn't come from the Dialog	
				$_eseecode.session.floatingBlock.fromDiv.parentNode.removeChild($_eseecode.session.floatingBlock.fromDiv);
				$_eseecode.session.blocksUndo[blocksUndoIndex].divPosition = false;
			} else {
				action = "cancel";
			}
		}
		if ($_eseecode.session.floatingBlock.div.classList) {
			$_eseecode.session.floatingBlock.div.classList.remove("floatingBlock");
		} else {			
			$_eseecode.session.floatingBlock.div.className = $_eseecode.session.floatingBlock.div.className.replace(/\s+floatingBlock/,"");
		}
		cancelFloatingBlock();
		if (action == "cancel") {
			$_eseecode.session.blocksUndo.pop();
		} else {
			$_eseecode.session.changesInCode = "blocks";
			$_eseecode.session.blocksUndo[0] = blocksUndoIndex;
			$_eseecode.session.blocksUndo.splice(blocksUndoIndex+1,$_eseecode.session.blocksUndo.length); // Remove the redo queue
			if (level == "level1") {
				execute(true);
			}
		}
	}

	/**
	 * Returns true if the position-th position in the code is inside div
	 * @private
	 * @param {!HTMLElement} consoleDiv Blocks console div
	 * @param {!HTMLElement} div Block div
	 * @param {Number} position Position to check if it is inside div
	 * @return {Boolean}
	 * @example positionIsInBlock(document.getElementById("console-blocks"), document.getElementById("div-1231231231"), 34)
	 */
	function positionIsInBlock(consoleDiv, div, position) {
		var startPos = searchBlockPosition(consoleDiv.firstChild,div).count-1;
		var endPos = searchBlockByPosition(div.firstChild.nextSibling,-1,startPos).count;
		return (position >= startPos && position <= endPos);
	}

	/**
	 * Add a listener to a handler in a div and its children recursively
	 * @private
	 * @param {!HTMLElement} div Div to add the listener to
	 * @param {String} handler Event handler to add the listener to
	 * @param {function()} callPointer Function to add the the listener
	 * @example recursiveAddEventListener(document.getElementById("div-1231231231"), "click", clickBlock)
	 */
	function recursiveAddEventListener(div, handler, callPointer) {
		if (!div) {
			return;
		}
		if (div.tagName !== "SPAN" && div.tagName !== "DIV") {
			return;
		}
		if (div.tagName === "DIV") {
			if (!$_eseecode.instructions.set[div.getAttribute("instructionSetId")].dummy) {
				div.addEventListener(handler,callPointer);
			}
		}
		recursiveAddEventListener(div.firstChild,handler,callPointer);
		recursiveAddEventListener(div.nextSibling,handler,callPointer);
	}

	/**
	 * Returns in found if targetDiv was found in div and in count the position of targetDiv in div
	 * @private
	 * @param {!HTMLElement} div Block in which to search for targetDiv
	 * @param {!HTMLElement} targetDiv Block to search for in div
	 * @return {{found:Boolean, count:Number}}
	 * @example recursiveCount(document.getElementById("console-blocks"), document.getElementById("div-1231231231"))
	 */
	function recursiveCount(div, targetDiv) {
		if (!div || (div == targetDiv)) {
			return { count: 0, found: (div == targetDiv) };
		} else if (div.tagName !== "DIV") {
			return recursiveCount(div.nextSibling,targetDiv);
		}
		var count = 1;
		var output = recursiveCount(div.firstChild,targetDiv);
		count += output.count;
		if (!output.found) {
			output = recursiveCount(div.nextSibling,targetDiv);
			count += output.count;
		}
		return { found: output.found, count: count };
	}

	/**
	 * Moves a block with the mouse movemement
	 * @private
	 * @param {Object} event Event
	 * @example document.body.removeEventListener("mousemove", moveBlock, false)
	 */
	function moveBlock(event) {
		event = event ? event : window.event;
		if (!event) {  // firefox doesn't know window.event
			return;
		}
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var div = $_eseecode.session.floatingBlock.div;
		var pos = eventPosition(event);
		div.style.left = pos.x*1 - $_eseecode.setup.blockWidth[level]/2 +"px";
		div.style.top = pos.y*1 - $_eseecode.setup.blockHeight[level]/2 +"px";
		// if mouse is above the console or under the console, scroll. Don't use smoothScroll since it uses a timeout and it will queue up in the events to launch
		var consoleDiv = document.getElementById("console-blocks");
		if (pos.y < consoleDiv.offsetTop) {
			consoleDiv.scrollTop -= 2;
		} else if (pos.y > consoleDiv.offsetTop+consoleDiv.clientHeight) {
			consoleDiv.scrollTop += 2;
		}
		if (isTouchDevice() && event) { // default action in touch devices is scroll
			if (event.preventDefault) {
				event.preventDefault();
			} else {
				return false;
			}
		}
	}

	/**
	 * Returns the absolute position where a mouse event has been triggered
	 * @private
	 * @param {!Object} event Event
	 * @return {{x:Number, y:Number}}
	 * @example alert(eventPosition(event))
	 */
	function eventPosition(event) {
		var pos = {x: 0, y: 0};
		event = event ? event : window.event;
		if (!event) { // firefox doesn't know window.event
			return pos;
		}
		if (!isTouchDevice()) {
			pos.x = event.pageX;
			pos.y = event.pageY;
		} else {
			if (event.type == "touchend") {
				pos.x = event.changedTouches[0].pageX;
				pos.y = event.changedTouches[0].pageY;
			} else {
				pos.x = event.touches[0].pageX;
				pos.y = event.touches[0].pageY;
			}
		}
		return pos;
	}

	/**
	 * Adds a block in a position in the blocks console
	 * @private
	 * @param {!HTMLElement} blockDiv Block to add
	 * @param {Boolean|Number} position Position to add the block at. If set to true it adds it at the end
	 * @param {HTMLElement} [parent] If set, blockDiv must be a child of parent. In this case position counts from the parent's position
	 * @example addBlock(block, true)
	 */
	function addBlock(blockDiv, position, parent) {
		var consoleDiv = document.getElementById("console-blocks");
		// Before adding first block delete console tip
		if (consoleDiv.firstChild && consoleDiv.firstChild.id == "console-blocks-tip") {
			consoleDiv.innerHTML = "";
		}
		var parentDiv = consoleDiv;
		if (parent) {
			parentDiv = parent;
		}
		var nextDiv = null;
		if (position !== true) {
			// Insert the blockDiv in the appropiate position in the code
			var output = searchBlockByPosition(parentDiv.firstChild,position,0);
			if (output.element) {
				nextDiv = output.element;
				parentDiv = nextDiv.parentNode;
			} else {
				nextDiv = null;
			}
		} else if (parent) {
			var instructionSetId = parentDiv.getAttribute("instructionSetId");
			if (instructionSetId && $_eseecode.instructions.set[instructionSetId].block) { // Append child inside the block, before closure
				nextDiv = parentDiv.lastChild;
			}
		}
		var instruction = $_eseecode.instructions.set[blockDiv.getAttribute("instructionSetId")];
		if (instruction.block && !blockDiv.firstChild.nextSibling && !instruction.text) { // If we are adding a block to the console for the first time, create its children
			var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
			for (var i=0; i<instruction.block.length; i++) {
				var instructionName = instruction.block[i];
				var childDiv = document.createElement("div");
				childDiv.id = newDivId();
				childDiv.setAttribute("instructionSetId",getInstructionSetIdFromName(instructionName));
				blockDiv.appendChild(childDiv);
				createBlock(level,childDiv);
			}
		}
		parentDiv.insertBefore(blockDiv, nextDiv); // if it's the last child nextSibling is null so it'll be added at the end of the list
		paintBlock(blockDiv);
	}

	/**
	 * Returns in found if targetDiv was found in currentDiv or its siblings and in count its position
	 * @private
	 * @param {!HTMLElement} currentDiv Block in which to search for targetDiv
	 * @param {!HTMLElement} targetDiv Block to search for in div
	 * @return {{found:Boolean, count:Number}}
	 * @example searchBlockPosition(document.getElementById("console-blocks"), document.getElementById("div-1231231231"))
	 */
	function searchBlockPosition(currentDiv, targetDiv) {
		var count = 0;
		var found = false;
		while (currentDiv && !found) {
			found = (currentDiv == targetDiv);
			if (!found && currentDiv.firstChild.nextSibling) {
				var output = searchBlockPosition(currentDiv.firstChild.nextSibling, targetDiv);
				count += output.count;
				found = output.found
			}
			count++;
			currentDiv = currentDiv.nextSibling;
		}
		return { found: found, count: count };
	}

	/**
	 * Returns the position-th element in element or its siblings. In count it returns the amount of blocks parsed in case the element wasn't found. If position == -1 the size of the element block and its siblings is returned in count
	 * @private
	 * @param {!HTMLElement} element Block in which to search for
	 * @param {Number} position Position to return the block from
	 * @param {Number} count Initial counter (position of element)
	 * @return {{element:HTMLElement, count:Number}}
	 * @example searchBlockByPosition(document.getElementById("console-blocks").firstChild, 12, 1)
	 */
	function searchBlockByPosition(element, position, count) {
		while (element && count != position) { // if the code is almost empty position could be far ahead of the last block
			var instruction = $_eseecode.instructions.set[element.getAttribute("instructionSetId")];
			if (instruction.block) {
				var output = searchBlockByPosition(element.firstChild.nextSibling, position, count+1);
				count = output.count-1;
				if (output.element) {
					element = output.element;
				} else {
					element = element.nextSibling;
				}
			} else {
				element = element.nextSibling;
			}
			count++;
		}
		return { element: element, count: count };
	}

	/**
	 * Removes a block from the console and deletes it
	 * @private
	 * @param {!HTMLElement} div Block to delete
	 * @example deleteBlock(document.getElementById("div-123123123"))
	 */
	function deleteBlock(div) {
		var consoleDiv = document.getElementById("console-blocks");
		div.parentNode.removeChild(div);
		if (!consoleDiv.firstChild) {
			resetBlocksConsole(consoleDiv);
		}
	}

	/**
	 * Adds the console tip if no code exists
	 * @private
	 * @example checkAndAddConsoleTip()
	 */
	function checkAndAddConsoleTip() {
		var consoleDiv = document.getElementById("console-blocks");
		if (!consoleDiv.firstChild || consoleDiv.firstChild.id == 'console-blocks-tip') {
			consoleDiv.innerHTML = "<div id='console-blocks-tip' style='border-width:0px;box-shadow:none;float:none;display:table-cell;text-align:center;vertical-align:middle;padding:0px 10px 0px 10px;color:#FF5555;text-shadow:1px 1px 2px #000000;font-weight:bold;height:"+(consoleDiv.clientHeight)+"px'>"+_("Drop some blocks here to start programming!")+"</div>";
		}
	}

	/**
	 * Returns a new valid and unique block id
	 * @private
	 * @return {String}
	 * @example var id = newDivId()
	 */
	function newDivId() {
		var d = new Date();
		var id = d.getTime()*10000+Math.floor((Math.random()*10000));
		return "div-"+id;
	}

	/**
	 * Returns the ordinal name of a number
	 * @private
	 * @param {Number} number Number
	 * @return {String}
	 * @example var text = ordinal(3)
	 */
	function ordinal(number) {
		var value = "";
		if (number == 1) {
			value = _("1st");
		} else if (number == 2) {
			value = _("2nd");
		} else if (number == 3) {
			value = _("3rd");
		} else if (number == 4) {
			value = _("4th");
		} else {
			value = number+_("th");
		}
		return value;
	}

	/**
	 * Asks the user to setup the parameters of the instruction associated with the block. Returns a list of parameter changes in an array with the format ["param"+paramNumber, old_value, new_value]
	 * @private
	 * @param {!HTMLElement} div Block div
	 * @return {Array<String, String, String>}
	 * @example setupBlock(document.getElementById("div-123123123"))
	 */
	function setupBlock(div) {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var instruction = $_eseecode.instructions.set[div.getAttribute("instructionSetId")];
		var instructionName = instruction.name;
		var setupChanges = [];
		var paramNumber = 1; // parameters[0] is usually "param1"
		for (var i=0; i<instruction.parameters.length; i++) {
			var parameter = instruction.parameters[i];
			var parameterName = _(parameter.name);
			var defaultValue = parameter.default;
			var value = undefined;
			if (i==0 && instruction.validate) {
				paramNumber = 0;
				// This instruction requires an identifier
				if (div.getAttribute("param"+paramNumber)) {
					defaultValue = div.getAttribute("param"+paramNumber);
				} else {
					// Do not offer any default for identifiers
					defaultValue = "";
				}
				do {
					value = window.prompt(_("Enter a text to use as %s. The %s should easily relate to the use you are going to give to the block",[parameterName,parameterName])+":",defaultValue);
					if (value === null) {
						if (defaultValue) {
							value = defaultValue;
						} else {
							var d = new Date();
							value = instructionName+"_"+(d.getTime()*100+Math.floor(Math.random()*100)).toString(26);
						}
					}
				} while (!instruction.validate(value));
				div.setAttribute("param"+paramNumber,value);
				if (value !== defaultValue) {
					setupChanges.push([ "param"+paramNumber, defaultValue, value ]);
				}
				paramNumber++;
				continue;
			}
			var helpText = ordinal(paramNumber)+" "+_("enter the value for %s's parameter",[instructionName+"()"])+" \""+parameterName+"\"";
			if (div.getAttribute("param"+paramNumber) !== undefined) {
				defaultValue = div.getAttribute("param"+paramNumber);
			}
			if (defaultValue === undefined || defaultValue === null) {
				defaultValue = "";
			}
			if (level == "level2" && parameter.tip) {
				helpText += ".\n"+_(parameter.tip);
			}
			helpText += ":";
			if (level == "level2" || level == "level3") {
				value = window.prompt(helpText, defaultValue);
				//var value = setupParameterLevel3(div.id, paramNumber, instructionName, parameterName, defaultValue, parameter.type);
			}
			// If user clicked "cancel" use default parameter
			if (value === null) {
				value = defaultValue;
			} else if (value === undefined) {
				value = "";
			}
			div.setAttribute("param"+paramNumber, value);
			if (value !== defaultValue) {
				setupChanges.push([ "param"+paramNumber, defaultValue, value ]);
			}
			paramNumber++;
		}
		return setupChanges;
	}

	/**
	 * Returns a list of all variables declared before and in the scope of div
	 * @private
	 * @param {!HTMLElement} div Block div
	 * @return {Array<String>}
	 * @example getVariables(document.getElementById("div-123123123"))
	 */
	function getVariables(div) {
		var consoleDiv = document.getElementById("console-blocks");
		var values = [];
		var div = div.parentNode;
		while (div != consoleDiv) {
			if (div.getAttribute("param0") !== undefined) {
				values.push(div.getAttribute("param0"));
			}
			if (div.previousSibling) {
				div = div.previousSibling;
			} else {
				div = div.parentNode;
			}
		}
		return values;
	}

	/**
	 * Returns a list of all eSeeCode functions declared in the code that return a specific type of value
	 * @private
	 * @param {!HTMLElement} div Block div
	 * @return {Array<String>}
	 * @example getFunctions("int"))
	 */
	function getFunctions(type) {
		var values = [];
		for (var i=0; i<$_eseecode.instructions.set.length; i++) {
			if ($_eseecode.instructions.set[i].return === type) {
				values.push($_eseecode.instructions.set[i].name);
			}
		}
		return values;
	}

	/**
	 * Returns the parameters of a block, or the default parameters if none were set
	 * In parameters it returns the parameters in an array, in text it returns the parameters ready to insert them in code
	 * @private
	 * @param {String} level Current level name
	 * @param {!HTMLElement} div Block div
	 * @param {Boolean} [dialog=false] Whether or not the block is in the dialog window
	 * @return {{parameters:Array<String>, text:String}
	 * @example loadParameters("level2", document.getElementById("div-123123123"))
	 */
	function loadParameters(level, div, dialog) {
		var instructionSetId = div.getAttribute("instructionSetId");
		var instruction = $_eseecode.instructions.set[instructionSetId];
		var parameters = [];
		if (instruction.validate) {
			parameters[0] = div.getAttribute("param0");
		}
		if (instruction.parameters !== null) {
			var i;
			for (i=0; i<instruction.parameters.length; i++) {
				if (instruction.validate && i == instruction.parameters.length-1) {
					// If the instruction requieres an identifier it was already asked, skip last parameter because it doesn't exist
					continue;
				}
				var param = undefined;
				if (div.getAttribute("param"+(i+1)) !== null) {
					param = div.getAttribute("param"+(i+1));
				} else if (instruction.parameters[i].default !== undefined) {
					param = instruction.parameters[i].default;
					//if (typeof param == "string") {
					//	param = '"'+param+'"';
					//}
					div.setAttribute("param"+(i+1),param);
				}
				if (param) {
					parameters.push(param);
				}
			}
			for (; div.getAttribute("param"+(i+1)) !== null; i++) {
				var param = div.getAttribute("param"+(i+1));
				if (param) {
					parameters.push(param);
				}
			}
		}
		var text = "";
		if (!instruction.code || !instruction.code.noName) {
			if (instruction.nameRewrite && !dialog &&
			    instruction.nameRewrite[level] !== undefined &&
			    instruction.nameRewrite[level] !== null) {
				text += instruction.nameRewrite[level];
			} else {
				text += instruction.name;
			}
		}
		if (dialog && level != "level1" && level != "level2" && !instruction.validate) {
			if (instruction.parameters !== null && (!instruction.code || !instruction.code.noBrackets)) {
				if (instruction.code && instruction.code.space) {
					text += " ";
				}
				text += "()";
			}
		}
		if (dialog || (level != "level3" && level != "level4" && instruction.name != "unknownFunction")) {
			return { parameters: parameters, text: text };
		}
		if (instruction.validate) {
			if (!(instruction.code && (instruction.code.noName || instruction.code.noInSpace))) {
				text += " ";
			}
			var param0 = div.getAttribute("param0");
			if (param0 === null) {
				div.setAttribute("param0","");
			} else {
				text += param0;
			}
		} else if (instruction.code && instruction.code.noName && div.getAttribute("param0")) {
			text += div.getAttribute("param0");
		}
		if (instruction.parameters !== null && (!instruction.validate || instruction.parameters.length > 1)) {
			if (instruction.code && instruction.code.space) {
				text += " ";
			}
			if (!instruction.code || !instruction.code.noBrackets) {
				text += "(";
			}
			for (i=0; i<parameters.length; i++) {
				if (i==0 && instruction.validate) {
					continue;
				}
				if ((i !== 0 && !instruction.validate) || (i>1 && instruction.validate)) {
					text += ", ";
				}
				text += parameters[i];
			}
			if (!instruction.code || !instruction.code.noBrackets) {
				text += ")";
			}
		}
		if (instruction.code && instruction.code.prefix) {
			text = instruction.code.prefix + text;
		}
		if (instruction.code && instruction.code.suffix) {
			text += instruction.code.suffix;
		}
		// This overwrites all the "text" set above. It's specifically done for =,+,-,...
		if (instruction.inorder) {
			var firstParam = 0;
			if (!instruction.validate) {
				firstParam++;
			}
			text = div.getAttribute("param"+firstParam)+" "+instruction.name;
			firstParam++;
			if (div.getAttribute("param"+firstParam)) {
				text += " "+div.getAttribute("param"+firstParam);
			}
		}
		return { parameters: parameters, text: text };
	}

	/**
	 * Given a block and an instruction it sets up the block
	 * @private
	 * @param {String} level Current level name
	 * @param {!HTMLElement} div Block div
	 * @param {Number} instructionSetId Id of the instruction in $_eseecode.instructions.set
	 * @param {Boolean} [dialog=false] Whether or not the block is in the dialog window
	 * @example createBlock("level2", document.body.createElement("div"), 3)
	 */
	function createBlock(level, div, instructionSetId, dialog) {
		var codeId;
		if (instructionSetId == null) { // If no instructionSetId is passed we just want to update the block
			instructionSetId = div.getAttribute("instructionSetId");
			codeId = div.id;
		} else { // This is a block that didn't exist before
			codeId = newDivId();
			div.setAttribute("id", codeId);
			div.setAttribute("instructionSetId", instructionSetId);
		}
		var instruction = $_eseecode.instructions.set[instructionSetId];
		div.className = "block "+level+" "+instruction.name;
		paintBlock(div,dialog);
		if (instruction.dummy) {
			return;
		}
		if (dialog) {
			var handler;
			if (!isTouchDevice()) {
				handler = "mousedown";
			} else {
				handler = "touchstart";
			}
			div.addEventListener(handler,clickBlock);
		} else {
			if (level == "level1") {
				var handler;
				if (!isTouchDevice()) {
					handler = "mousedown";
				} else {
					handler = "touchstart";
				}
				div.removeEventListener(handler,clickBlock);
			} else if (level == "level2" || level == "level3") {
				var handler;
				if (!isTouchDevice()) {
					handler = "mousedown";
				} else {
					handler = "touchstart";
				}
				div.addEventListener(handler,clickBlock);
			}
		}
	}

	/**
	 * Sets up the shape, color and icon of a block
	 * @private
	 * @param {!HTMLElement} div Block div
	 * @param {Boolean} [dialog=false] Whether or not the block is in the dialog window
	 * @param {Boolean} [skipRecursiveRepaint=false] Whether or not skip the repainting of the blocks' children
	 * @example paintBlock(document.getElementById("div-123123123"), false, true)
	 */
	function paintBlock(div, dialog, skipRecursiveRepaint) {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var instruction = $_eseecode.instructions.set[div.getAttribute("instructionSetId")];
		var color = "transparent"; // default color
		var searchCategoryForColor = instruction.category;
		if (instruction.category == "internal" && div.parentNode) {
			var parentInstruction = $_eseecode.instructions.set[div.parentNode.getAttribute("instructionSetId")];
			if (parentInstruction && parentInstruction.block) {
				searchCategoryForColor = parentInstruction.category;
			}
		}
		for (var i=0; i<$_eseecode.instructions.categories.length; i++) {
			if (searchCategoryForColor == $_eseecode.instructions.categories[i].name) {
				color = $_eseecode.instructions.categories[i].color;
				break;
			}
		}
		if (instruction.dummy) {
			if (div.classList) {
				div.classList.add("dummyBlock");
			} else {
				div.className += " dummyBlock";
			}
		}
		if (instruction.code && instruction.code.unindent) {
			div.style.marginLeft = "0px";
		}
		var output = loadParameters(level, div, dialog);
		var text = output.text;
		// We must first creat the inner text so the div expands its width if necessary
		var span = document.createElement("span");
		span.style.color = readableText(color);
		span.style.minHeight = $_eseecode.setup.blockHeight[level]+"px";
		span.style.fontFamily = "Arial";
		span.style.fontSize = "10px";
		span.style.fontWeight = "bold";
		span.className = "blockTitle";
		span.innerHTML = text;
		if (div.firstChild) {
			var firstChild = div.firstChild;
			div.insertBefore(span,firstChild);
			if (firstChild.tagName === "SPAN") {
				div.removeChild(firstChild);
			}
		} else {
			div.appendChild(span);
		}
		// Disable text selection on the span
		span.addEventListener("mousedown",function(e){e.preventDefault();},false);
		div.style.minWidth = $_eseecode.setup.blockWidth[level]+"px";
		div.style.minHeight = $_eseecode.setup.blockHeight[level]+"px";
		div.setAttribute("title", text+((dialog && instruction.tip)?": "+_(instruction.tip):"")); // help for blind people
		if (!instruction.dummy) {
			var bgWidth = div.clientWidth;
			var bgHeight = div.clientHeight;
			var bgCanvas = document.createElement("canvas");
			bgCanvas.setAttribute("width", bgWidth);
			bgCanvas.setAttribute("height", bgHeight);
			var bgCtx = bgCanvas.getContext("2d");
			bgCtx.fillStyle = color;
			bgCtx.fillRect(0,0,bgWidth,bgHeight);
			if (!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)) {
				// There is a bug in IE11 where it fails to show transparent gradients on canvas. See https://connect.microsoft.com/IE/feedback/details/828441 . This hack works around the bug
				if (color.charAt(0) == "#") {
					var r = color.substr(1,2);
					var g = color.substr(3,5);
					var b = color.substr(5,7);
					if (level == "level1" || level == "level2") {
						var gradient = bgCtx.createRadialGradient(bgWidth/2,bgHeight/2,bgHeight,bgWidth/3,bgHeight/3,bgHeight/4);
						gradient.addColorStop(0,'rgb(150,150,150)');
						gradient.addColorStop(1,'rgb('+parseInt(r,16)+','+parseInt(g,16)+','+parseInt(b,16)+')');
						bgCtx.fillStyle = gradient;
						bgCtx.beginPath();
						bgCtx.fillRect(0,0,bgWidth,bgHeight);
						bgCtx.closePath();
						bgCtx.fill();
					} else if (level == "level3") {
						var gradient = bgCtx.createLinearGradient(0,0,0,bgHeight);
						gradient.addColorStop(0,'rgb(120,120,120)');
						gradient.addColorStop(0.5,'rgb('+parseInt(r,16)+','+parseInt(g,16)+','+parseInt(b,16)+')');
						gradient.addColorStop(1,'rgb(120,120,120)');
						bgCtx.fillStyle = gradient;
						bgCtx.fillRect(0,0,bgWidth,bgHeight);
					}
				} else {
						bgCtx.fillStyle = color;
						bgCtx.fillRect(0,0,bgWidth,bgHeight);
				}
			} else {
				if (level == "level1" || level == "level2") {
					var gradient = bgCtx.createRadialGradient(bgWidth/2,bgHeight/2,bgHeight*1.5,bgWidth/3,bgHeight/3,bgHeight/4);
					gradient.addColorStop(0.0,'rgba(0,0,0,1)');
					gradient.addColorStop(1.0,'rgba(0,0,0,0)');
					bgCtx.fillStyle = gradient;
					bgCtx.beginPath();
					bgCtx.arc(bgWidth/2,bgHeight/2,bgHeight,2*Math.PI,0,false);
					bgCtx.closePath();
					bgCtx.fill();
				} else if (level == "level3") {
					var gradient = bgCtx.createLinearGradient(0,0,0,bgHeight);	
					gradient.addColorStop(0.0,'rgba(0,0,0,0.25)');
					gradient.addColorStop(0.5,'rgba(0,0,0,0)');
					gradient.addColorStop(1.0,'rgba(0,0,0,0.25)');
					bgCtx.fillStyle = gradient;
					bgCtx.fillRect(0,-bgHeight*2,bgWidth,bgHeight*3);
				}
			}
			var height = parseInt(div.style.minHeight.replace("px",""));
			var width = parseInt(div.style.minWidth.replace("px",""));
			if ((level == "level1" || level == "level2") && $_eseecode.instructions.icons[instruction.name]) {
				$_eseecode.instructions.icons[instruction.name](bgCtx, width, height, output.parameters);
			}
/*
			bgCtx.font="bold 10px Arial";
			bgCtx.fillStyle = readableText(color);
			bgCtx.fillText(text,1,12);
*/
			div.style.backgroundImage = "url("+bgCanvas.toDataURL()+")";
		}
		if (!skipRecursiveRepaint) {
			while (div.parentNode && div.parentNode.getAttribute("instructionSetId")) {
				div = div.parentNode;
				paintBlock(div,dialog,true);
			}
		}
	}

	/**
	 * Initializes/Resets the blocks in the dialog window
	 * @private
	 * @param {String} level Level name
	 * @param {!HTMLElement} dialog Dialog window element
	 * @example initDialogBlocks("level2", document.getElementById("dialog-window"))
	 */
	function initDialogBlocks(level, dialog) {
		resetDialog(dialog);
		var instructions = $_eseecode.instructions.set;
		var width = $_eseecode.setup.blockWidth[level];
		var height = $_eseecode.setup.blockHeight[level];
		var clearNext = false;
		for (var n=0;n<$_eseecode.instructions.categories.length;n++) {
			var category = $_eseecode.instructions.categories[n].name;
			var firstInCategory = true;
			for (var i=0;i<$_eseecode.instructions.set.length;i++) {
				// Only show instructions in the current category
				if (category != $_eseecode.instructions.set[i].category) {
					continue;
				}
				// See if this instruction is shown in this level
				var show = false;
				for (var j=0; j<$_eseecode.instructions.set[i].show.length; j++) {
					if ($_eseecode.instructions.set[i].show[j] == level) {
						show = true;
						break;
					}
				}
				if (show) {
					var codeId = $_eseecode.instructions.set[i].name;
					if (codeId == "blank") {
						clearNext = true;
						continue;
					}
					var div = document.createElement('div');
					if (firstInCategory || clearNext) {
						div.style.clear = "left";
						firstInCategory = false;
						clearNext = false;
					}
					dialog.appendChild(div);
					createBlock(level,div,i,true);
				}
			}
		}
	}

	/**
	 * Initializes/Resets the write dialog window
	 * @private
	 * @param {String} level Level name
	 * @param {!HTMLElement} dialog Dialog window element
	 * @example initDialogWrite("level2", document.getElementById("dialog-window"))
	 */
	function initDialogWrite(level, dialog) {
		resetDialog(dialog);
		for (var i=0; i<$_eseecode.instructions.set.length; i++) {
			$_eseecode.instructions.set[i].index = i;
		}
		var instructions = $_eseecode.instructions.set.concat().sort(function(a,b) { if (a.name<b.name) return -1; if (a.name>b.name) return 1; return 0; });
		for (var n=0;n<$_eseecode.instructions.categories.length;n++) {
			var category = $_eseecode.instructions.categories[n].name;
			var color = $_eseecode.instructions.categories[n].color;
			var firstInCategory = true;
			for (var i=0;i<instructions.length;i++) {
				var instruction = instructions[i];
				if (category == instruction.category) {
					var show = false;
					for (var j=0; j<instruction.show.length; j++) {
						if (instruction.show[j] == level) {
							show = true;
							break;
						}
					}
					if (show) {
						// write mode can use all available instructions
						var title = instruction.name;
						var div = document.createElement('div');
						div.setAttribute("id", "div-"+title);
						div.className = "";
						div.style.backgroundColor = color;
						div.style.border = "1px solid #AAAAAA";
						div.style.color = readableText(color);
						div.setAttribute("title", _(instruction.tip));
						div.setAttribute("instructionSetId", instruction.index);
						div.addEventListener("click", writeText, false);
						if (firstInCategory) {
							div.style.marginTop = "5px";
							firstInCategory = false;
						}
						if (instruction.nameRewrite && instruction.nameRewrite[level]) {
							title = instruction.nameRewrite[level];
						}
						div.innerHTML = '<b>'+title+'</b>';
						if (instruction.parameters !== null && instruction.code && instruction.code.space) {
							div.innerHTML += " ";
						}
						if (instruction.parameters !== null) {
							if (instruction.parameters !== null && (!instruction.code || !instruction.code.noBrackets)) {
								div.innerHTML += '<b>(</b>';
							}
							for (var j=0;j<instruction.parameters.length;j++) {
								if (j!==0) {
									div.innerHTML += ", ";
								}
								div.innerHTML += _(instruction.parameters[j].name);
							}
							if (instruction.parameters !== null && (!instruction.code || !instruction.code.noBrackets)) {
								div.innerHTML += '<b>)</b>';
							}
						}
						// This overwrites all the "text" set above. It's specifically done for =,+,-,...
						if (instruction.inorder) {
							var firstParam = 0;
							if (!instruction.validate) {
								firstParam++;
							}
							div.innerHTML = _(instruction.parameters[firstParam].name)+" <b>"+instruction.name+"</b>";
							firstParam++;
							if (instruction.parameters[firstParam]) {
								div.innerHTML += " "+_(instruction.parameters[firstParam].name);
							}
						}
						if (instruction.block) {
							div.innerHTML += ' <b>{</b> ... <b>}</b>';
						}
						dialog.appendChild(div);
					}
				}
			}
		}
	}

	/**
	 * Writes in the write console at the position where the cursor is the instruction clicked in the dialgo window
	 * @private
	 * @param {!Object} event Event
	 * @example div.addEventListener("click", writeText, false)
	 */
	function writeText(event) {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].name;
		var div = event.target;
		while (div && !div.getAttribute("instructionSetId")) { // Target could be a span in the div, so let's fetch the parent div
			div = div.parentNode;
		}
		var instruction = $_eseecode.instructions.set[div.getAttribute("instructionSetId")];
		var text = "";
		if (instruction.inorder) {
			text += " ";
		}
		text += instruction.name;
		if (instruction.nameRewrite && instruction.nameRewrite.level4) {
			text = instruction.nameRewrite.level4;
		}
		if (instruction.code && instruction.code.prefix) {
			text = instruction.code.prefix + text;
		}
		if (instruction.inorder || (instruction.parameters !== null && instruction.code && instruction.code.space)) {
			text += " ";
		}
		if (!instruction.inorder && instruction.parameters !== null && (!instruction.code || !instruction.code.noBrackets)) {
			text += "()";
		}
		if (instruction.block) {
			text += " {\n}"
		} else if (instruction.code && instruction.code.suffix) {
			text += instruction.code.suffix;
		}
		ace.edit("console-write").insert(text);
	}

	/**
	 * Returns if the device is a touch device or not
	 * @private
	 * @return {Boolean}
	 * @example isTouchDevice()
	 */
	function isTouchDevice() {
		var touchscreen = (('ontouchstart' in window) ||
     		    (navigator.maxTouchPoints > 0) ||
		    (navigator.msMaxTouchPoints > 0));
		return touchscreen;
	}

	/**
	 * Undoes/Redoes the last action in the block undo pile
	 * @private
	 * @param {Boolean} [redo] Whether we want to redo or undo
	 * @example undo()
	 */
	function undo(redo) {
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		var action = redo ? "redo" : "undo";
		if (mode == "blocks") {
			var blocksUndoIndex = $_eseecode.session.blocksUndo[0];
			var undo, oldDiv, newDiv, oldPosition, newPosition, newIndex;
			if (redo) {
				undo = $_eseecode.session.blocksUndo[blocksUndoIndex+1];
			} else {
				undo = $_eseecode.session.blocksUndo[blocksUndoIndex];
			}
			if (!undo) {
				return;
			}
			if (undo.parameters) {
				var div = undo.div;
				var newParm;
				if (redo) {
					newParm = 2;
				} else {
					newParm = 1;
				}
				for (var i=0; i<undo.parameters.length; i++) {
					var parameter = undo.parameters[i];
					div.setAttribute(parameter[0],parameter[newParm]);
				}
				paintBlock(div);
			} else {
				if (redo) {
					newDiv = undo.div;
					oldDiv = undo.fromDiv;
					newPosition = undo.divPosition;
					oldPosition = undo.fromDivPosition;
				} else {
					newDiv = undo.fromDiv;
					oldDiv = undo.div;
					newPosition = undo.fromDivPosition;
					oldPosition = undo.divPosition;
				}
				if (oldDiv) {
					deleteBlock(oldDiv);
				}
				if (newDiv) {
					addBlock(newDiv,newPosition);
				}
			}
			if (redo) {
				$_eseecode.session.blocksUndo[0]++;
			} else {
				$_eseecode.session.blocksUndo[0]--;
			}
			if ($_eseecode.modes.console[$_eseecode.modes.console[0]].name == "level1") {
				execute();
			}
		} else if (mode == "write") {
			ace.edit("console-write").execCommand(action, false, null);
		}
	}

	/**
	 * Initializes/Resets all the drawing elements including execution
	 * @private
	 * @example resetDraw()
	 */
	function resetDraw() {
		resetCanvas();
		initProgramCounter(true);
		unhighlight();
	}

	/**
	 * Initializes/Resets the whiteboard
	 * @private
	 * @example resetCanvas()
	 */
	function resetCanvas() {
		document.getElementById("execute-notes").innerHTML = "";
		var turtle = $_eseecode.canvasArray["turtle"]; // must check this before removing $_eseecode.canvasArray
		// reset canvas
  		for(var i=0;i<$_eseecode.canvasArray.length;i++) {
			removeCanvas(i);
		}
		delete $_eseecode.canvasArray;
		$_eseecode.canvasArray = [];
		if (!turtle) {
			initTurtle();
		} else {
			$_eseecode.canvasArray["turtle"] = turtle;
		}
		getCanvas(0).canvas.style.zIndex = -1; // canvas-0 is special
		resetGrid();
		switchCanvas(1); // canvas-1 is the default
		// reset turtle	
		resetTurtle();
		// reset windows
  		for(var i=0;i<$_eseecode.windowsArray.length;i++) {
			if ($_eseecode.windowsArray[i]) {
				$_eseecode.dialogWindow.removeChild($_eseecode.windowsArray[i]);
				delete $_eseecode.windowsArray[i];
			}
		}
		delete $_eseecode.windowsArray;
		$_eseecode.windowsArray = [];
		windowSwitch(0); // window-0 is special
		windowSwitch(1); // window-1 is the default
	}

	/**
	 * Initializes/Resets the dialog window
	 * @private
	 * @param {!HTMLElement} dialog Dialog div element
	 * @example resetDialog(document.getElementById("dialog-window"))
	 */
	function resetDialog(dialog) {
		while (dialog.hasChildNodes()) {
			dialog.removeChild(dialog.lastChild);
		}
	}

	/**
	 * Initializes/Resets the blocks console window
	 * @private
	 * @param {!HTMLElement} dialog Console div element
	 * @example resetBlocksConsole(document.getElementById("console-blocks"))
	 */
	function resetBlocksConsole(console) {
		while (console.hasChildNodes()) {
		    console.removeChild(console.lastChild);
		}
		cancelFloatingBlock();
		checkAndAddConsoleTip();
	}

	/**
	 * Initializes/Resets the write console window
	 * @private
	 * @param {!HTMLElement} dialog Console div element
	 * @example resetWriteConsole(document.getElementById("console-write"))
	 */
	function resetWriteConsole(code) {
		if (!code) {
			code = "";
		}
		document.getElementById('console-write').style.fontSize = $_eseecode.setup.blockHeight.level3+"px";
		var editor = ace.edit("console-write");
		editor.setTheme("ace/theme/chrome");
		editor.getSession().setMode("ace/mode/javascript");
		editor.renderer.setShowGutter(false);
		// Only update code if it changed, to avoid adding empty changes into the ACE undo queue
		if (code != ace.edit("console-write").getValue()) {
			// We must unset writeChanged call on ace change event otherwise it unhighlights the code
			editor.session.off("change",writeChanged);
			editor.setValue(code);
		}
		editor.gotoLine(0,0);
		editor.session.on("change",writeChanged);
	}

	/**
	 * Added as a listener it informs $_eseecode.session.changesInCode that the code in write console changed
	 * @private
	 * @example writeChanged()
	 */
	function writeChanged() {
		$_eseecode.session.changesInCode = "write";
		unhighlight();
	}

	/**
	 * Initializes/Resets the blocks undo pile in $_eseecode.session.blocksUndo
	 * @private
	 * @example resetUndo()
	 */
	function resetUndo() {
		$_eseecode.session.blocksUndo = [0, null];
	}

	/**
	 * Initializes/Resets the breakpoints array in $_eseecode.session.breakpoints
	 * @private
	 * @example resetBreakpoints()
	 */
	function resetBreakpoints() {
		$_eseecode.session.breakpoints = {};
	}

	/**
	 * Initializes/Resets the breakpoint watches values in $_eseecode.session.breakpoints[breakpoint]
	 * @private
	 * @example resetBreakpointWatches()
	 */
	function resetBreakpointWatches() {
		for (var breakpoint in $_eseecode.session.breakpoints) {
			for (var watch in $_eseecode.session.breakpoints[breakpoint]) {
				$_eseecode.session.breakpoints[breakpoint][watch] = ""
			}
		}
	}

	// Main initialization
	/**
	 * @author Jacobo Vilella Vilahur
	 * @type Array<{platform:{name:{text:String,link:String},version:{text:String,link:String},author:{text:String,link:String},license:{text:String,link:String}},i18n:{available:Array<{*}>,current:String},instructions:{set:Array<{*}>,categories:Array{*},icons:Array{*}},execution:{reakpointCounter:Number,breakpointCounterLimit:Number,step:Number,stepped:Boolean,timeLimit:Number,programCounter:Number,programCounterLimit:Number,endLimit:Number,startTime:Number,sandboxProperties:Array<String>},codeFileName:String,session:{highlight:{lineNumber:Number,reason:String},changesInCode:Boolean,floatingBlock:{div:HTMLElement,fromDiv:HTMLElement},blocksUndo:Array<{*}>,breakpoints:Array<{*}>,breakpointHandler:Boolean|Number,timeoutHandlers:Array<{*}>},whiteboard:HTMLElement,dialogWindow:HTMLElement,canvasArray:Array<{*}>,windowsArray:Array<{*}>,currentCanvas:Object,currentWindow:HTMLElement,setup:{blockWidth:Array<{String, String},blockheight:Array<{String, String}>,defaultFontSize:Number,defaultFontWidth:Number,undoDepth:Number},modes:{console:Array<{*}>,dialog:Array<{*}>}}>
	 */
	var $_eseecode = {
		platform: {
			name: {
				text: "eSeeCode",
				link: undefined
			},
			version: {
				text: "1.7",
				link: "changelog.txt"
			},
			author: {
				text: "Jacobo Vilella Vilahur",
				link: "http://www.eseecode.com"
			},
			license: {
				text: "GPLv3 or later",
				link: "https://gnu.org/licenses/gpl.html"
			}
		},
		i18n: {
			available: {
				default: { name: "English" }
			},
			current: "default"
		},
		instructions: {
			set: {},
			categories: {},
			icons: {}
		},
		execution: {
			breakpointCounter: 0,
			breakpointCounterLimit: 0,
			step: 1,
			stepped: false,
			timeLimit: 3,
			programCounter: 0,
			programCounterLimit: 0,
			endLimit: undefined,
			startTime: undefined,
			sandboxProperties: []
		},
		codeFilename: "",
		session: {
			highlight: {
				lineNumber: 0,
				reason: undefined
			},
			changesInCode: false,
			floatingBlock: { div: null, fromDiv: null },
			blocksUndo: null,
			breakpoints: {},
			breakpointHandler: false,
			timeoutHandlers: []

		},
		whiteboard: null,
		dialogWindow: null,
		canvasArray: [],
		windowsArray: [],
		currentCanvas: null,
		currentWindow: null,
		setup: {
			blockWidth: { level1: 68, level2: 68, level3: 45, level4: undefined },
			blockHeight: { level1: 68, level2: 68, level3: 15, level4: 15 },
			defaultFontSize: 9,
			defaultFontWidth: 6,
			undoDepth: 20
		},
		modes: {
			console: [
				1,
				{name: "level1", div: "blocks", tab: null},
				{name: "level2", div: "blocks", tab: null},
				{name: "level3", div: "blocks", tab: null},
				{name: "level4", div: "write", tab: null}
			],
		  	dialog: [
				1,
				{name: "level1", div: "blocks", element: null, tab: null},
				{name: "level2", div: "blocks", element: null, tab: null},
				{name: "level3", div: "blocks", element: null, tab: null},
				{name: "level4", div: "write", element: null, tab: null},
				{name: "window", div: "window", element: null, tab: null},
				{name: "debug", div: "debug", element: null, tab: null},
				{name: "setup", div: "setup", element: null, tab: null}
			]
		}
	};
