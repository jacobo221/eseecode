"use strict;"

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
	 * @param {String|HTMLElement} text Message to show in the message box
	 * @param {{acceptName:String,acceptAction:function(),cancel:Boolean,cancelName:String,cancelAction:function(),focus:String}} config Configuration parameters for the message box
	 * @example msgBox("Alert!")
	 */
	function msgBox(text, config) {
		var mainBlock = document.getElementById("eseecode");
		var div = document.createElement("div");
		div.id = "msgBoxWrapper";
		var innerDiv = document.createElement("div");
		innerDiv.id = "msgBox";
		var textDiv;
		if (typeof text === "string") {
			textDiv = document.createElement("div");
			textDiv.innerHTML = text;
		} else {
			textDiv = text;
		}
		textDiv.style.overflowY = "auto";
		textDiv.style.width = "auto";
		var buttonDiv = document.createElement("div");
		buttonDiv.setAttribute("align","center");
		buttonDiv.style.width = "100%"
		buttonDiv.style.margin = "5px 0px 5px 0px";
		var input = document.createElement("input");
		input.type = "submit";
		if (config && config.acceptName) {
			input.value = config.acceptName;
		} else {
			input.value = _("Accept");
		}
		if (!config || !config.focus) {
			input.autofocus = true;
		}
		if (config && config.acceptAction) {
			input.addEventListener("click",config.acceptAction);
		} else {
			input.addEventListener("click",msgBoxClose);
		}
		buttonDiv.appendChild(input);
		if (config && (config.cancel || config.cancelName || config.cancelAction)) {
			input = document.createElement("input");
			input.type = "button";
			if (config && config.cancelName) {
				input.value = config.cancelName;
			} else {
				input.value = _("Cancel");
			}
			if (config.cancelAction) {
				input.addEventListener("click",config.cancelAction);
			} else {
				input.addEventListener("click",msgBoxClose);
			}
			buttonDiv.appendChild(input);
		}
		var form = document.createElement("form");
		form.addEventListener("submit",function(e) { e.preventDefault(); return false; });
		form.appendChild(textDiv);
		form.appendChild(buttonDiv);
		innerDiv.appendChild(form);
		div.appendChild(innerDiv);
		document.getElementById("eseecode").appendChild(div);
		textDiv.style.height = (innerDiv.offsetHeight-buttonDiv.offsetHeight-40)+"px";
		if (config && config.focus) {
			document.getElementById(config.focus).focus();
		}
	}

	/**
	 * Closes the msgBox dialog
	 * @see msgBox
	 * @private
	 * @example msgBoxClose()
	 */
	function msgBoxClose() {
		document.getElementById("eseecode").removeChild(document.getElementById("msgBoxWrapper"));
		if ($_eseecode.modes.console[$_eseecode.modes.console[0]].div == "write") {
			ace.edit("console-write").focus();
		}
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
					resetUndoBlocks();
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
		resetUndoBlocks();
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
	 * Keyboard shortcuts listener. It listenes for all keyboard presses and calls functions when shurtcut combinations happen
	 * @private
	 * @param {Object} event Event
	 * @example document.body.addEventListener("keydown",keyboardShortcuts,false)
	 */
	function keyboardShortcuts(event) {
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		if (event && event.type == "keydown" && event.keyCode == 27) {
			if ($_eseecode.session.breakpointHandler) {
				addBreakpointEventCancel();
			}
			if ($_eseecode.session.floatingBlock.div) {
				cancelFloatingBlock(event);
			}
			if (document.getElementById("msgBoxWrapper")) {
				if (document.getElementById("msgBoxParametersDiv")) {
					msgBoxParametersCancel();
				} else {
					msgBoxClose();
				}
			}
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
	 * Undoes/Redoes the last action in the current level
	 * @private
	 * @param {Boolean} [redo] Whether we want to redo or undo
	 * @example undo()
	 */
	function undo(redo) {
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		if (mode == "blocks") {
			undoBlocks(redo);
		} else if (mode == "write") {
			ace.edit("console-write").execCommand(redo?"redo":"undo", false, null);
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

