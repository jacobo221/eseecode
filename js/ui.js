"use strict;"
	/**
	 * Links an A HTML element to the current whiteboard export drawing
	 * @private
	 * @param {!HTMLElement} link HTML A element to add the link to
	 * @example $e_downloadCanvas(document.body.createElement("a"))
	 */
	function $e_downloadCanvas(link) {
		var canvas = document.createElement('canvas');
		canvas.width = $_eseecode.canvasArray["grid"].canvas.width;
		canvas.height = $_eseecode.canvasArray["grid"].canvas.height;
		var ctx = canvas.getContext("2d");
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(0,0,canvas.width,canvas.height);
		if (document.getElementById("setup-grid-enable").checked) {
			ctx.drawImage($_eseecode.canvasArray["grid"].canvas,0,0);
		}
		var layer = $_eseecode.canvasArray["bottom"];
		while (layer) {
			ctx.drawImage(layer.canvas,0,0);
			layer = layer.layerOver;
		}
		if (document.getElementById("setup-guide-enable").checked) {
			var id = $_eseecode.currentCanvas.name;
			$e_drawGuide(ctx, $_eseecode.canvasArray[id].guide, id);
		}
		link.href = canvas.toDataURL();
		var d = new Date();
		link.download = "canvas-"+d.getTime()+".png";
	}

	/**
	 * Downloads the layers as a file, called from the UI
	 * @private
	 * @param {Boolean} grid Set to true to download as a grid
	 * @example $e_downloadLayersFromUI()
	 */
	function $e_downloadLayersFromUI(grid) {
		// Create one layer GIF to measure how long it takes
		var start = new Date().getTime();
		var encoder = new GIFEncoder();
		encoder.setRepeat(0);
		encoder.setDelay(0.1);
		encoder.start();
		encoder.addFrame($_eseecode.canvasArray["grid"].canvas.getContext("2d"));
		encoder.finish();
		var finish = new Date().getTime();
		var secondsPerLayer = (finish - start) / 1000;
		var estimatedTime = Math.ceil(secondsPerLayer*$_eseecode.canvasArray.length);
		if (estimatedTime >= 3) {
			$e_msgBox(_("It is estimated that it will take %s seconds to generate the file to download. Do you wish to proceed?\n\nIf you want to proceed %sclick here%s and please be patient and don't switch away from the application.",[estimatedTime,"<a id=\"downloadLayers-link\" onclick=\"$e_downloadLayers("+grid+")\" href=\"\">","</a>"]), {noSubmit:true,cancelAction:$e_msgBoxClose});
		} else {
			$e_downloadLayers(grid);
		}
	}

	/**
	 * Pops up a MsgBox to decide which whiteboard image to download
	 * @private
	 * @example $e_downloadWhiteboardMsgBox()
	 */
	function $e_downloadWhiteboardMsgBox() {
		var msgBoxContent = "";
		if ($_eseecode.session.lastChange > $_eseecode.session.lastRun) {
			msgBoxContent += "<div style=\"text-align:center;margin-top:20px;color:#882222;\">"+_("You have made changes to your code but you haven't run it yet.\nTherefore the whiteboard might not reflect your current code.")+"</div>";
		}
		msgBoxContent += "<div style=\"text-align:center;margin-top:20px\"><a id=\"whiteboard-downloadImage\" class=\"tab-button\" onclick=\"$e_downloadCanvas(this)\">"+_("Download whiteboard image")+"</a></div><br /><br />"
		// If there is more than one layer offer to download animation/grid
		var msgClass = "";
		var linkSrc = "";
		var textStyle = "";
		var inputType = "";
		if ($_eseecode.canvasArray["bottom"].layerOver) {
			msgClass = "tab-button";
			linkSrc = ["$e_downloadLayersFromUI(true)", "$e_downloadLayersFromUI(false)"];
			textStyle = "";
			inputType = "";
		} else {
			msgClass = "tab-button-disabled";
			linkSrc = ["", ""];
			textStyle = "text-disabled";
			inputType = "disabled";
		}
		msgBoxContent += "<div style=\"text-align:center\" class=\""+textStyle+"\"><a id=\"whiteboard-downloadLayers-animation\" class=\""+msgClass+"\" onclick=\""+linkSrc[0]+"\">"+_("Download layers as animation")+"</a><div>"+_("Animation interval (in msecs)")+": <input id=\"setup-downloadLayers-interval\" type=\"number\" "+inputType+" value=\"500\" min=\"0\" style=\"width:40px\" /></div></div><br /><div style=\"text-align:center\" class=\""+textStyle+"\"><a id=\"whiteboard-downloadLayers-grid\" class=\""+msgClass+"\" onclick=\""+linkSrc[1]+"\">"+_("Download layers in a grid")+"</a><div>"+_("Layers per row")+": <input id=\"setup-downloadLayers-columns\" type=\"number\" value=\"3\" "+inputType+" min=\"1\" style=\"width:40px\" /></div></div>"
		$e_msgBox(msgBoxContent,{noSubmit:true,cancelName:_("Close")});
	}

	/**
	 * Links an A HTML element to an image containing all the layers
	 * @private
	 * @param {Boolean} grid Set to true to download as a grid
	 * @example $e_downloadLayers(document.body.createElement("a"))
	 */
	function $e_downloadLayers(grid) {
		var link = document.getElementById("downloadLayers-link");
		if (!link) {
			if (grid) {
				link = document.getElementById("whiteboard-downloadLayers-grid");
			} else {
				link = document.getElementById("whiteboard-downloadLayers-animation");
			}
		}
		var columns = document.getElementById("setup-downloadLayers-columns").value
		if (columns < 1 || !$e_isNumber(columns)) {
			columns = 1;
		}
		var imageBinary;
		if (!grid) {
			var encoder = new GIFEncoder();
			encoder.setRepeat(0); //0 -> loop forever //1+ -> loop n times then stop
			var interval = document.getElementById("setup-downloadLayers-interval").value;
			if (!$e_isNumber(interval)) {
				interval = 500;
			}
			encoder.setDelay(interval); //go to next frame every n milliseconds 
			encoder.start();
		}
		var layer = $_eseecode.canvasArray["bottom"]; // We skip first frame which is the grid
		var canvas = document.createElement('canvas');
		if (!grid) {
			canvas.width = $_eseecode.canvasArray["grid"].canvas.width;
			canvas.height = $_eseecode.canvasArray["grid"].canvas.height;
		} else {
			var count = 0;
			var currentLayer = $_eseecode.canvasArray["bottom"];
			while (currentLayer) {
				currentLayer = currentLayer.layerOver;
				count++;
			}
			if (count < columns) {
				canvas.width = $_eseecode.canvasArray["grid"].canvas.width*count;
			} else {
				canvas.width = $_eseecode.canvasArray["grid"].canvas.width*columns;
			}
			canvas.height = $_eseecode.canvasArray["grid"].canvas.height*(Math.floor((count-1)/columns)+1);
		}
		var whiteboardWidth = $_eseecode.canvasArray["grid"].canvas.width;
		var whiteboardHeight = $_eseecode.canvasArray["grid"].canvas.height;
		var count = 0;
		var ctx = canvas.getContext("2d");
		while (layer) {
			var shiftX = 0, shiftY = 0;
			if (grid) {
				shiftX = whiteboardWidth*(count%columns);
				shiftY = whiteboardHeight*Math.floor(count/columns);
			}
			ctx.fillStyle="#FFFFFF";
			ctx.fillRect(shiftX,shiftY,whiteboardWidth,whiteboardHeight);
			if (document.getElementById("setup-grid-enable").checked) {
				ctx.drawImage($_eseecode.canvasArray["grid"].canvas,shiftX,shiftY); // draw grid
			}
			if (layer != $_eseecode.canvasArray["grid"]) {
				ctx.drawImage(layer.canvas,shiftX,shiftY);
			}
			if (document.getElementById("setup-guide-enable").checked) {
				$e_drawGuide(ctx, layer.guide, layer.name, shiftX, shiftY);
			}
			if (grid) {
				ctx.strokeStyle="#000000";
				ctx.moveTo(shiftX,shiftY);
				ctx.lineTo(shiftX+whiteboardWidth,shiftY);
				ctx.lineTo(shiftX+whiteboardWidth,whiteboardHeight+shiftY);
				ctx.lineTo(whiteboardWidth,whiteboardHeight+shiftY);
				ctx.lineTo(whiteboardWidth,shiftY);
				ctx.stroke();
			}
			// Watermark
			ctx.font = "20px Arial";
			ctx.strokeStyle="#99AAAAAA";
			ctx.strokeText(_("Made with %s",[$_eseecode.platform.web.text]),shiftX+whiteboardWidth/4,shiftY+whiteboardHeight-20);
			if (!grid) {
				encoder.addFrame(ctx);
			}
			layer = layer.layerOver;
			count++;
		}
		var extension;
		if (!grid) {
			encoder.finish();
			imageBinary = 'data:image/gif;base64,'+encode64(encoder.stream().getData());
			extension = "gif"
		} else {
			imageBinary = canvas.toDataURL();
			extension = "png"
		}
		var data_url = imageBinary;
		link.href = data_url;
		var d = new Date();
		link.download = "layers-"+d.getTime()+"."+extension;
		$e_msgBoxClose(); // It might have been called from a msgBox confirmation message
	}

	/**
	 * Resizes the console window
	 * @private
	 * @param {Boolean} [restore=false] If false it maximizes the console window taking up the dialog window, otherwise it restores its size to the initial size
	 * @example $e_resizeConsole(true)
	 */
	function $e_resizeConsole(restore) {
		var mainWidth = document.getElementById('eseecode').clientWidth;
		var whiteboardWidth = $_eseecode.whiteboard.offsetWidth;
		var consoleColumn = document.getElementById("console");
		var dialogColumn = document.getElementById("dialog");
		var widthLeft = mainWidth-whiteboardWidth;
		var iconMargin = 4;
		var setupTab = document.getElementById("dialog-tabs-setup");
		if (restore || dialogColumn.style.display == "none") { // we asume console has by default same width as dialog
			if (consoleColumn.classList) {
				consoleColumn.classList.remove("maximized");
			} else {
				consoleColumn.div.className = consoleColumn.className.replace(/\s+maximized/,"");
			}
			setupTab.parentNode.removeChild(setupTab);
			document.getElementById("dialog-tabs").appendChild(setupTab);
			dialogColumn.style.display = "block";
			iconMargin = 3;
		} else {
			if (consoleColumn.classList) {
				consoleColumn.classList.add("maximized");
			} else {
				consoleColumn.div.className += " maximized";
			}
			setupTab.parentNode.removeChild(setupTab);
			document.getElementById("console-tabs").insertBefore(setupTab,document.getElementById("console-tabs").firstChild);
			dialogColumn.style.display = "none";
			iconMargin = 5;
		}
		$e_switchDialogMode($_eseecode.modes.console[0]);
		ace.edit("console-write").resize();
		// Console resize tab
		var canvas = document.getElementById("console-tabs-resize").firstChild;
		var ctx = canvas.getContext("2d");
		var width = canvas.width;
		var height = canvas.height;
		canvas.width = width;
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.moveTo(iconMargin,iconMargin);
		ctx.lineTo(width-iconMargin,iconMargin);
		ctx.lineTo(width-iconMargin,height-iconMargin);
		ctx.lineTo(iconMargin,height-iconMargin);
		ctx.closePath();
		ctx.stroke();
	}

	/**
	 * Shows a message box overlapping all the platform's user interface
	 * @private
	 * @param {String|HTMLElement} text Message to show in the message box
	 * @param {acceptName:String,acceptAction:function(),cancel:Boolean,cancelName:String,cancelAction:function(),focus:String,noSubmit:Boolean} config Configuration parameters for the message box
	 * @example $e_msgBox("Alert!")
	 */
	function $e_msgBox(text, config) {
		var id = 0;
		for (id=0; document.getElementById("msgBoxWrapper"+id); id++);
		var mainBlock = document.getElementById("eseecode");
		var div = document.createElement("div");
		div.id = "msgBoxWrapper"+id;
		div.className = "msgBoxWrapper";
		var innerDiv = document.createElement("div");
		innerDiv.id = "msgBox"+id;
		innerDiv.className = "msgBox";
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
		var focusElement = div;
		if (!config || config.noSubmit !== true) {
			focusElement = input;
			if (!config || !config.focus) {
				input.autofocus = true;
			}
			if (config && config.acceptAction) {
				input.addEventListener("click", config.acceptAction, false);
			} else {
				input.addEventListener("click", $e_msgBoxClose, false);
			}
			buttonDiv.appendChild(input);
		}
		if (config && (config.cancel || config.cancelName || config.cancelAction)) {
			input = document.createElement("input");
			if (config.noSubmit === true) {
				focusElement = input;
			}
			input.type = "button";
			if (config && config.cancelName) {
				input.value = config.cancelName;
			} else {
				input.value = _("Cancel");
			}
			if (config.cancelAction) {
				input.addEventListener("click", config.cancelAction, false);
			} else {
				input.addEventListener("click", $e_msgBoxClose, false);
			}
			buttonDiv.appendChild(input);
		}
		var form = document.createElement("form");
		form.addEventListener("submit", function(e) { e.preventDefault(); return false; }, false);
		form.appendChild(textDiv);
		form.appendChild(buttonDiv);
		innerDiv.appendChild(form);
		div.appendChild(innerDiv);
		document.getElementById("eseecode").appendChild(div);
		textDiv.style.height = (innerDiv.offsetHeight-buttonDiv.offsetHeight-40)+"px";
		if (config && config.focus) {
			document.getElementById(config.focus).focus();
		} else {
			// We must give focus to something in the msgBox otherwise the focus could be on a previous msgBox's button and pressing ENTER would affect to that other msgBox
			focusElement.focus();
		}
	}

	/**
	 * Closes the msgBox dialog
	 * @see $e_msgBox
	 * @private
	 * @example $e_msgBoxClose()
	 */
	function $e_msgBoxClose() {
		var id=0;
		for (id=0; document.getElementById("msgBoxWrapper"+id); id++);
		id--;
		var msgBoxElement = document.getElementById("msgBoxWrapper"+id);
		if (msgBoxElement) {
			document.getElementById("eseecode").removeChild(msgBoxElement);
			if (id>0) {
				document.getElementById("msgBoxWrapper"+(id-1)).focus();
			} else if ($_eseecode.modes.console[$_eseecode.modes.console[0]].div === "write") {
				ace.edit("console-write").focus();
			}
		}
	}

	/**
	 * Switches the user interface to the specified view
	 * @private
	 * @param {Number|String} [id] Can refer to a view number or to a view name. If unset it checks the "view" parameter in the browser's URL. If it can't determine the new view, it keeps the current view
	 * @example $e_switchConsoleMode(2)
	 */
	function $e_switchConsoleMode(id) {
		var oldMode = $_eseecode.modes.console[0];
		if (!id) {
			var urlParts = window.location.href.match(/(\?|&)view=([^&#]+)/);
			if (urlParts !== null) {
				// Check that the level exists
				var newLevel = urlParts[2].toLowerCase();
				if ($e_isNumber(newLevel) && $_eseecode.modes.console[newLevel]) {
					id = newLevel;
				} else {
					for (var i=1; i<$_eseecode.modes.console.length; i++) {
						var levelName = $_eseecode.modes.console[i].name.toLowerCase();
						var levelId = $_eseecode.modes.console[i].id.toLowerCase();
						if (levelName == newLevel || levelId == newLevel) {
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
		if (!$e_isNumber(id)) {
			for (var i=1; i<$_eseecode.modes.console.length; i++) {
				if ($_eseecode.modes.console[i].id == id) {
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
					$e_msgBox(_("Can't convert the code to blocks. There is the following problem in your code")+":\n\n"+exception.name + ":  " + exception.message);
					var lineNumber = exception.message.match(/. (i|o)n line ([0-9]+)/)[2];
					$e_highlight(lineNumber,"error");
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
		var oldHeight = $_eseecode.setup.blockHeight[$_eseecode.modes.console[oldMode].id];
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
		var level = $_eseecode.modes.console[id].id;
		if ($_eseecode.modes.console[oldMode].div == "blocks") {
			if ($_eseecode.modes.console[id].div == "write") {
				if ($_eseecode.session.changesInCode && $_eseecode.session.changesInCode !== "write") {
					// Only reset the write console if changes were made in the blocks, this preserves the undo's
					if (document.getElementById("console-blocks").firstChild.id == "console-blocks-tip") {
						$e_resetWriteConsole("");
					} else {
						$e_blocks2write();
					}
					$e_resetUndoWrite();
				}
				ace.edit("console-write").session.clearBreakpoints(); // Even if we haven't changed the code in blocks mode, we could have changed the breakponts
			} else if ($_eseecode.modes.console[id].div == "blocks") {
				$e_blocks2blocks(level);
			}
		} else if ($_eseecode.modes.console[oldMode].div == "write") {
			if ($_eseecode.modes.console[id].div == "blocks") {
				var consoleDiv = document.getElementById("console-blocks");
				if ($_eseecode.session.changesInCode && $_eseecode.session.changesInCode != "blocks") {
					// Only reset the blocks console if changes were made in the code, this preserves the undo's
					$e_resetUndoBlocks();
					$e_resetBlocksConsole(consoleDiv);
					program.makeBlocks(level,consoleDiv);
				} else {
					// Just update the blocks style to the appropiate level
					$e_blocks2blocks(level);
				}
			}
		}
		// Scroll to the same position in new console
		var newHeight = $_eseecode.setup.blockHeight[$_eseecode.modes.console[id].id];
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
		/*
		// Only change the dialog window if it is set to the blocks/code tab (not if it is windows, debug or setup)
		if ($_eseecode.modes.dialog[$_eseecode.modes.dialog[0]].id.indexOf("level") == 0) {
			$e_switchDialogMode(id);
		}
		*/
		$e_switchDialogMode(id);
		// if write mode, focus in the textarea. Do this after $e_switchDialogMode() in case the dialog tries to steal focus
		if ($_eseecode.modes.console[id].div == "write") {
			ace.edit("console-write").focus();
			document.getElementById("console-tabs-resize").style.display = "block";
		} else {
			$e_resizeConsole(true);
			document.getElementById("console-tabs-resize").style.display = "none";
			$e_checkAndAddBlocksTips(); // force to recheck since until now "console-blocks" div had display:none so height:0px and so the tip couldn't define to max height
		}
		if ($_eseecode.modes.console[oldMode].div != $_eseecode.modes.console[id].div && $_eseecode.session.changesInCode) {
			$_eseecode.session.changesInCode = false;
		}
		if (level == "level1") {
			document.getElementById("button-execute").style.display = "none";
			document.getElementById("button-clear").style.display = "none";
		} else {
			document.getElementById("button-execute").style.display = "inline";
			document.getElementById("button-clear").style.display = "inline";
		}
		$e_refreshUndoUI();
		$e_highlight();
	}

	/**
	 * Switches the dialog window
	 * @private
	 * @param {Number|String} [id] Can refer to a dialog index or to a dialog name. If unset it keeps the current dialog window
	 * @example $e_switchDialogMode("debug")
	 */
	function $e_switchDialogMode(id) {
		if (!id) {
			id = $_eseecode.modes.dialog[0];
		}
		if (id == "setup") {
			$e_resizeConsole(true);
		}
		if (id == "window") {
			document.getElementById("dialog-tabs-window").style.display = "block";
		}
		if (!$e_isNumber(id)) {
			for (var i=1; i<$_eseecode.modes.dialog.length; i++) {
				if ($_eseecode.modes.dialog[i].id == id) {
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
			$e_initDialogBlocks($_eseecode.modes.dialog[id].id, $_eseecode.modes.dialog[id].element);
		} else if ($_eseecode.modes.dialog[id].div == "write") {
			$e_initDialogWrite($_eseecode.modes.dialog[id].id, $_eseecode.modes.dialog[id].element);
		}
		var debugCommand = document.getElementById("dialog-debug-command-form");
		if ($_eseecode.modes.dialog[id].id == "debug") {
			$e_resetDebug();
			debugCommand.style.visibility = "visible";
			var debugCommandInput = document.getElementById("dialog-debug-command-input");
			debugCommandInput.style.width = (debugCommand.offsetWidth - document.getElementById("dialog-debug-command-button").offsetWidth - 15) +"px";
			//debugCommandInput.focus();
		} else {
			debugCommand.style.visibility = "hidden";
		}
		// Paint setup tab image
		var margin = 2;
		var canvas = document.getElementById("dialog-tabs-setup").firstChild;
		var ctx = canvas.getContext("2d");
		var width = canvas.width;
		var height = canvas.height;
		canvas.width = width;
		if ($_eseecode.modes.dialog[id].id == "setup") {
			ctx.strokeStyle = "#000000";
		} else {
			ctx.strokeStyle = "#FFFFFF";
		}
		var radio = (height-margin*2-4)/2;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.arc(width/2, height/2, radio, 0, 360*Math.PI/180, false);
		ctx.closePath();
		ctx.stroke();
		ctx.lineWidth = 2;
		ctx.translate(width/2,height/2);
		ctx.moveTo(0,0-radio);
		var numLines = 8;
		for (var i = 0; i < numLines; i++)
		{
			ctx.beginPath();
			ctx.rotate(Math.PI*2 / numLines);
			ctx.moveTo(0, 0 - (radio*2));
			ctx.lineTo(0, 0 - radio);
			ctx.closePath();
			ctx.stroke();
		}
		// Update current dialog
		$_eseecode.modes.dialog[0] = id;
	}

	/**
	 * Initializes or resets custom UI elements
	 * Such elements include the console and dialog buttons and the console and dialog backgrounds
	 * @private
	 * @example $e_initUIElements()
	 */
	function $e_initUIElements() {
		var canvas, ctx, div, width, height, src;
		// Main background
		div = document.getElementById("eseecode");
		/*
		// Gradient background
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
		width = div.clientWidth;
		height = div.clientHeight;
		canvas.width = width;
		canvas.height = height;
		var border = document.getElementById("header").clientHeight/2;
		var gradient = ctx.createLinearGradient(0,border,0,0);
		gradient.addColorStop(0,"#123456");
		gradient.addColorStop(1, "rgba(0,0,0,0)");
		ctx.fillStyle = gradient;
		ctx.fillRect(0,0,width,border);
		gradient = ctx.createLinearGradient(0,height-border,0,height);
		gradient.addColorStop(0,"#123456");
		gradient.addColorStop(1,"rgba(0,0,0,0)");
		ctx.fillStyle = gradient;
		ctx.fillRect(0,height-border,width,height);
		ctx.fillStyle = "#123456";
		ctx.fillRect(0,border,width,height-border*2);
		src = canvas.toDataURL();
		div.style.backgroundImage = "url("+src+")";
		div.style.backgroundColor = "rgba(0,0,0,0)";
		*/
		// Console background
		canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d");
		div = document.getElementById("console-blocks");
		width = div.parentNode.offsetWidth; // Use parent in case it had display:none at this moment
		height = div.parentNode.offsetHeight;
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
			ctx.arc(x, y, size, 0, 2*Math.PI, false);
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
		ctx.arc(width-marginX*2, height-margin, (height-margin*2)/2, 0, -90*Math.PI/180, true);
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
		ctx.arc(width/2, height/2+margin/8, height/2-margin/2, 0, 270*Math.PI/180, false);
		ctx.arc(width/2, height/2+margin/8, (height-margin)/2-lineWidth, 270*Math.PI/180, 0, true);
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
		ctx.arc(marginX*2, height-margin, (height-margin*2)/2, 180*Math.PI/180, -90*Math.PI/180, false);
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
		// Download whiteboard button
		canvas = document.getElementById("whiteboard-tabs-download-button").firstChild;
		ctx = canvas.getContext("2d");
		width = canvas.width;
		height = canvas.height;
		var margin = 2;
		ctx.fillStyle = "#000000";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(margin,1*height/3);
		ctx.lineTo(width-margin,1*height/3);
		ctx.lineTo(width-margin,height-margin);
		ctx.lineTo(margin,height-margin);
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.moveTo(width/4,1*height/3);
		ctx.lineTo(3*width/4,1*height/3);
		ctx.lineTo(3*width/4-margin,margin);
		ctx.lineTo(1*width/4+margin,margin);
		ctx.fill();
		ctx.closePath();
		ctx.strokeStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.arc(width/2, 2*height/3-margin, height/5, 0, 360*Math.PI/180, true);
		ctx.lineTo(marginX,height/2);
		ctx.stroke();
		ctx.closePath();
		ctx.beginPath();
		ctx.moveTo(width-margin,1*height/3+margin);
		ctx.lineTo(width-2*margin,1*height/3+margin);
		ctx.stroke();
		ctx.closePath();
	}

	/**
	 * Initializes or resets the grid modes select
	 * @private
	 * @example $e_resetGridModeSelect()
	 */
	function $e_resetGridModeSelect() {
		var element = document.getElementById("setup-grid-coordinates");
		// Clean select
		for (var i=element.options.length; i>0; i--) {
			element.remove(0);
		}
		// Add options
		var gridModes = $_eseecode.coordinates.predefined;
		var gridSelectOptions = "";
		var currentPredefinedMode = $_eseecode.coordinates.userSelection;
		for (var i=0; i<gridModes.length; i++) {
			var option = document.createElement("option");
			option.value = i;
			option.text = _(gridModes[i].name);
			if (i == currentPredefinedMode || (currentPredefinedMode == undefined && gridModes[i].default)) {
				option.selected = true;
			}
			element.add(option);
		}
		// If we are currently using a custom axis setup (could happen when changing translation) add Custom option
		if ($e_getGridPredefined() == -1) {
			var option = document.createElement("option");
			option.value = gridModes.length;
			option.text = _("Custom");
			option.selected = true;
			element.add(option);
		}
	}

	/**
	 * Returns a readable text color given a background color
	 * @private
	 * @param {String} backgroundColor Background color
	 * @return {String} Readable text
	 * @example $e_readableText("#123456")
	 */
	function $e_readableText(backgroundColor) {
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
		// In IE11, because of the bug in its initial versions, we don't do shadowing, just plain color
		if (!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)) {
			if (darkness < 128) {
				color = "#FFFFFF";
			} else {
				color = "#000000";
			}
		}
		return color;
	}

	/**
	 * Initializes the guide layer
	 * @private
	 * @example $e_initGuide()
	 */
	function $e_initGuide() {
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var name = "guide";
		var div = document.createElement("div");
		div.id = "canvas-div-"+name;
		div.className = "canvas-div";
		div.style.left = $_eseecode.whiteboard.offsetLeft;
		div.style.top = $_eseecode.whiteboard.offsetTop;
		div.style.width = canvasSize+"px";
		div.style.height = canvasSize+"px";
		div.style.zIndex = 9999;
		var canvas = document.createElement("canvas");
		canvas.id = "canvas-guide";
		canvas.className = "canvas";
		canvas.width = canvasSize;
		canvas.height = canvasSize;
		div.appendChild(canvas);
		$_eseecode.whiteboard.appendChild(div);
		$_eseecode.canvasArray[name] = {name: name, canvas: canvas, div: div};
	}

	/**
	 * Hides/Shows the guide layer
	 * @private
	 * @example $e_toggleGuide()
	 */
	function $e_toggleGuide() {
		var guideCanvas = $_eseecode.canvasArray["guide"];
		if ($_eseecode.ui.guideVisible) {
			$_eseecode.ui.guideVisible = false;
			guideCanvas.div.style.display = "none";
		} else {
			$_eseecode.ui.guideVisible = true;
			$e_resetGuide(); // Since we weren't drawing it draw it now
			guideCanvas.div.style.display = "block";
		}
	}
	
	/**
	 * Converts user coordinates to system coordinates
	 * @private
	 * @param {Array} pos System coordinates with Array elements x and y
	 * @return System value which refers to the same user position
	 * @example $e_user2systemCoords({x: 150, y: 250})
	 */
	function $e_user2systemCoords(pos) {
		var value = {};
		value.x = pos.x*$_eseecode.coordinates.scale.x+$_eseecode.coordinates.position.x;
		value.y = pos.y*$_eseecode.coordinates.scale.y+$_eseecode.coordinates.position.y;
		return value;
	}
	
	/**
	 * Converts system coordinates to user coordinates
	 * @private
	 * @param {Array} pos System coordinates with Array elements x and y
	 * @return User value which refers to the same system position
	 * @example $e_system2userCoords({x: 100, y: 200})
	 */
	function $e_system2userCoords(pos) {
		var value = {};
		value.x = (pos.x-$_eseecode.coordinates.position.x)/$_eseecode.coordinates.scale.x;
		value.y = (pos.y-$_eseecode.coordinates.position.y)/$_eseecode.coordinates.scale.y;
		return value;
	}
	
	/**
	 * Converts user angle to system angle
	 * @private
	 * @param {Number} angle User angle
	 * @return System value which refers to the same user angle
	 * @example user2systemAngle(90)
	 */
	function $e_user2systemAngle(angle) {
		return $e_system2userAngle(angle);
	}
	
	/**
	 * Converts system angle to user angle
	 * @private
	 * @param {Number} angle System angle
	 * @return User value which refers to the same system position
	 * @example $e_system2userAngle(90)
	 */
	function $e_system2userAngle(angle) {
		if ($_eseecode.coordinates.scale.x < 0) {
			angle = 180 - angle;
		}
		if ($_eseecode.coordinates.scale.y < 0) {
			angle = angle * -1;
		}
		if (angle < 0) {
			angle += 360;
		}
		return angle;
	}

	/**
	 * Resets the guide in a layer
	 * @private
	 * @param {Number} [id] Layer id. If unset use the currently active layer
	 * @param {Number} [canvas] Canvas to use. If unset use the "guide" layer
	 * @example $e_resetGuide()
	 */
	function $e_resetGuide(id, canvas) {
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		if (id === undefined) {
			id = $_eseecode.currentCanvas.name;
		}
		var targetCanvas = $_eseecode.canvasArray[id];
		var size = 20;
		var org = targetCanvas.guide;
		var angle = targetCanvas.guide.angle;
		var frontx = org.x+size*Math.cos(angle*Math.PI/180);
		var fronty = org.y+size*Math.sin(angle*Math.PI/180);
		var leftx = org.x+size/2*Math.cos(angle*Math.PI/180+Math.PI/3);
		var lefty = org.y+size/2*Math.sin(angle*Math.PI/180+Math.PI/3);
		var rightx = org.x+size/2*Math.cos(angle*Math.PI/180-Math.PI/3);
		var righty = org.y+size/2*Math.sin(angle*Math.PI/180-Math.PI/3);
		if (canvas === undefined) {
			if (!$_eseecode.ui.guideVisible) {
				return;
			}
			canvas = $_eseecode.canvasArray["guide"].canvas;
		}
		var ctx = canvas.getContext("2d");
		canvas.width = canvasSize;
		// clear guide
		ctx.clearRect(0,0,canvasSize,canvasSize);
		// draw guide
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
		gradient = ctx.createRadialGradient(org.x,org.y,size,org.x,org.y,size/10);
		gradient.addColorStop(0,'rgb(0,0,0)');
		gradient.addColorStop(1,'rgb(103,137,171)');
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(org.x, org.y, size/2, 2*Math.PI, 0, false);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	/**
	 * Initiates/Resets the setup window
	 * @private
	 * @example $e_initSetup()
	 */
	function $e_initSetup() {
		var debugDiv = document.getElementById("dialog-setup");
		document.getElementById("dialog-debug-execute-step").value = $_eseecode.execution.step;
		if ($_eseecode.execution.stepped) {
			document.getElementById("dialog-debug-execute-stepped").checked = true;
		} else {
			document.getElementById("dialog-debug-execute-stepped").checked = false;
		}
		document.getElementById("setup-execute-time").value = $_eseecode.execution.timeLimit;
	}

	/**
	 * Shows/Hides a layer
	 * @private
	 * @param {Number} id Layer id
	 * @param {Boolean} [force] True to force switch on, false to force switch off
	 * @example $e_toggleCanvas(3)
	 */
	function $e_toggleCanvas(id, force) {
		var div = $_eseecode.canvasArray[id].div;
		if (force === true || div.style.display == "none") {
			div.style.display = "block";
		} else {
			div.style.display = "none";
		}
	}

	/**
	 * Draws a guide
	 * @private
	 * @param {Object} context Context object where to draw the guide
	 * @param {Array} pos Coordinates of the guide
	 * @param {Number} id Id of the layer
	 * @param {Number} [shiftX=0] Shift X coordinates by this value
	 * @param {Number} [shiftY=0] Shift Y coordinates by this value
	 * @example $e_drawGuide(ctx, {x: 200, y: 200}, id)
	 */
	function $e_drawGuide(context, pos, id, shiftX, shiftY) {
		if (shiftX === undefined) {
			shiftX = 0;
		}
		if (shiftY === undefined) {
			shiftY = 0;
		}
		var canvasWidth = $_eseecode.whiteboard.offsetWidth;
		var canvasHeight = $_eseecode.whiteboard.offsetHeight;
		if (pos.x < 0 || pos.x > canvasWidth || pos.y < 0 || pos.y > canvasHeight) {
			var markerSize = 20;
			var org = {x: pos.x, y: pos.y};
			if (org.x < markerSize) {
				org.x = markerSize;
			} else if (org.x > canvasWidth-markerSize) {
				org.x = canvasWidth-markerSize;
			}
			if (org.y < markerSize) {
				org.y = markerSize;
			} else if (org.y > canvasHeight-markerSize) {
				org.y = canvasHeight-markerSize;
			}
			var modulus = Math.sqrt((pos.x-org.x)*(pos.x-org.x)+(pos.y-org.y)*(pos.y-org.y));
			var posVector = {x: (pos.x-org.x)/modulus, y: (pos.y-org.y)/modulus};
			var angle = Math.atan2(posVector.y, posVector.x);
			var size = 20;
			var frontx = org.x+size*Math.cos(angle);
			var fronty = org.y+size*Math.sin(angle);
			var leftx = org.x+size/2*Math.cos(angle+Math.PI/3);
			var lefty = org.y+size/2*Math.sin(angle+Math.PI/3);
			var rightx = org.x+size/2*Math.cos(angle-Math.PI/3);
			var righty = org.y+size/2*Math.sin(angle-Math.PI/3);
			var ctx = context;
			// draw guide
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#FF5555";
			ctx.fillStyle = "#FF9999";
			ctx.beginPath();
			ctx.moveTo(shiftX+rightx, shiftY+righty);
			ctx.lineTo(shiftX+leftx, shiftY+lefty);
			ctx.lineTo(shiftX+frontx, shiftY+fronty);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(shiftX+org.x, shiftY+org.y, size/2, 2*Math.PI, 0, false);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(shiftX+org.x, shiftY+org.y, size/2+2, angle-Math.PI/1.5, angle+Math.PI/1.5, true);
			ctx.stroke();
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(shiftX+org.x, shiftY+org.y, size/2+5, angle-Math.PI/1.4, angle+Math.PI/1.4, true);
			ctx.stroke();
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(shiftX+org.x, shiftY+org.y, size/2+9, angle-Math.PI/1.3, angle+Math.PI/1.3, true);
			ctx.stroke();
		} else {
			var guideCanvas = document.createElement("canvas");
			guideCanvas.className = "canvas";
			guideCanvas.width = canvasWidth;
			guideCanvas.height = canvasHeight;
			$e_resetGuide(id, guideCanvas);
			context.drawImage(guideCanvas, shiftX, shiftY);
		}
	}

	/**
	 * Initializes/Resets the grid layer
	 * @private
	 * @example $e_resetGrid()
	 */
	function $e_resetGrid() {
		var ctx = $_eseecode.canvasArray["grid"].context;
		$e_clearCanvas("grid");
		if (document.getElementById("setup-grid-enable").checked) {
			$e_drawGrid(ctx);
		}
	}

	/**
	 * Draws a grid
	 * @private
	 * @param {Object} context Context object where to draw the grid
	 * @example $e_drawGrid(ctx)
	 */
	function $e_drawGrid(ctx) {
		var canvasSize = window.getComputedStyle(document.querySelector('#whiteboard')).getPropertyValue('width').replace("px","");
		ctx.font = "bold 10px Arial";
		ctx.fillStyle = "#AAAAAA";
		var margin=2, fontHeight=7, fontWidth=5;
		var coorUpperLeft = $e_system2userCoords({x: 0, y: 0});
		var coorLowerRight = $e_system2userCoords({x: getLayerWidth(), y: getLayerHeight()});
		ctx.fillText("("+coorUpperLeft.x+","+coorUpperLeft.y+")",margin,fontHeight+margin);
		ctx.fillText("("+coorLowerRight.x+","+coorLowerRight.y+")",canvasSize-(canvasSize.toString().length*2+3)*fontWidth-margin,canvasSize-2-margin);
		var step = parseInt(document.getElementById("setup-grid-step").value);
		if (step < 25) {
			step = 25;
			document.getElementById("setup-grid-step").value = step;			
		}
		var colorHighlight = "#DDDDDD";
		var colorNormal = "#EEEEEE";
		ctx.fillStyle = colorHighlight;
		ctx.strokeStyle = colorNormal;
		ctx.lineWidth = 1;
		var xUserStep = step/$_eseecode.coordinates.scale.x;
		for (var i=step, text=coorUpperLeft.x+xUserStep; i<canvasSize; i+=step, text+=xUserStep) {
			ctx.fillText(text,i,7);
			if (text == 0) {
				ctx.strokeStyle = colorHighlight;
			} else {
				ctx.strokeStyle = colorNormal;
			}
			ctx.beginPath();
			ctx.moveTo(i,0);
			ctx.lineTo(i,canvasSize);
			ctx.closePath();
			ctx.stroke();
		}
		var yUserStep = step/$_eseecode.coordinates.scale.y;
		for (var i=step, text=coorUpperLeft.y+yUserStep; i<canvasSize; i+=step, text+=yUserStep) {
			ctx.fillText(text,0,i);
			if (text == 0) {
				ctx.strokeStyle = colorHighlight;
			} else {
				ctx.strokeStyle = colorNormal;
			}
			ctx.beginPath();
			ctx.moveTo(0,i);
			ctx.lineTo(canvasSize,i);
			ctx.closePath();
			ctx.stroke();
		}
	}

	/**
	 * Select text in ace
	 * @private
	 * @param {Number} lineStart Line where the selection starts
	 * @param {Number} lineEnd Line where the selection ends
	 * @param {String} style Ace style to use for highlighting
	 * @example $e_selectTextareaLine(12, 12, "ace_step")
	 */
	function $e_selectTextareaLine(lineStart, lineEnd, style) {
		lineStart--; // array starts at 0, we leave lineEnd as is beacuse we'll select until the beginning of the next line
		var Range = require('ace/range').Range;
		ace.edit("console-write").session.addMarker(new Range(lineStart,0,lineEnd-1,ace.edit("console-write").session.getLine(lineEnd-1).length-1), style, "fullLine");
	}

	/**
	 * Highlight code
	 * @private
	 * @param {Number} [lineNumber] Line to highlight. If unset it highlights the last line marked with setHighlight()
	 * @param {String} [reason=step] Reason for highlighting. Available reasons are: "step", "error"
	 * @example $e_highlight(12, "error")
	 */
	function $e_highlight(lineNumber, reason) {
		reason = reason?reason:"step";
		if (!lineNumber) {
			if ($_eseecode.session.highlight.lineNumber) {
				lineNumber = $_eseecode.session.highlight.lineNumber;
			} else {
				return;
			}
			reason = $_eseecode.session.highlight.reason;
		}
		$e_unhighlight();
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		if (mode == "blocks") {
			var consoleDiv = document.getElementById("console-blocks");
			var div = $e_searchBlockByPosition(consoleDiv.firstChild,lineNumber,1).element;
			if (div && div.id != "console-blocks-tip") { // after last instruction in code there is no block (execution finished) so we must check if the block exists
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
				if (reason != "breakpoint") {
					div.style.boxShadow = "5px 5px 5px "+style;
				}
				$e_smoothScroll(consoleDiv, div.offsetTop-consoleDiv.offsetTop-consoleDiv.clientHeight/2+$e_blockSize(level,consoleDiv.firstChild).height/2);
			}
		} else if (mode == "write") {
			var style;
			if (reason == "error") {
				style = "ace_stack";
			} else if (reason == "breakpoint") {
				style = "ace_breakpoint";
			} else {
				style = "ace_step";
			}
			$e_selectTextareaLine(lineNumber,lineNumber, style);
			ace.edit("console-write").scrollToLine(lineNumber, true, true);
		}
		$_eseecode.session.highlight.lineNumber = lineNumber;
		$_eseecode.session.highlight.reason = reason;
	}

	/**
	 * Removes code highlight
	 * @private
	 * @example $e_unhighlight()
	 */
	function $e_unhighlight() {
		var line = $_eseecode.session.highlight.lineNumber;
		if (!line) {
			return;
		}
		var consoleDiv = document.getElementById("console-blocks");
		if (consoleDiv.firstChild && consoleDiv.firstChild.id !== "console-blocks-tip") {
			var div = $e_searchBlockByPosition(consoleDiv.firstChild,line,1).element;
			if (div) { // by the time we have to unhighlight it the div might not exist anymore
				div.style.border = ""; // accesses the canvas
				if (!$_eseecode.session.breakpoints[line] || !$_eseecode.session.breakpoints[line].status) {
					div.style.boxShadow = "";
				}
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
	 * @example $e_setHighlight(12)
	 */
	function $e_setHighlight(lineNumber) {
		$_eseecode.session.highlight.lineNumber = lineNumber;
		
	}

	/**
	 * Returns the index where the given instruction is in $_eseecode.instructions.set, or -1 if it didn't find it
	 * @private
	 * @param instructionName Name of the instruction to search
	 * @param startId Index to start from. Useful when an instruction appears several times in the set and we want to skip the ones we've seen
	 * @return {Number} Index of the given instruction
	 * @example $e_getInstructionSetIdFromName("forward")
	 */
	function $e_getInstructionSetIdFromName(instructionName, startId) {
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
	 * @example $e_saveCode()
	 */
	function $e_saveCode() {
		if (navigator.userAgent.match(/MSIE/)) {
			$e_msgBox(_("Sorry, your browser doesn't support downloading the code directly. Switch to Code view, copy the code and paste it into a file in your computer."));
			return;
		}
		var codeURI = "data:application/octet-stream," + encodeURIComponent(API_downloadCode());
		var downloadLink = document.createElement("a");
		downloadLink.href = codeURI;
		downloadLink.download = (($_eseecode.ui.codeFilename && $_eseecode.ui.codeFilename.length > 0)?$_eseecode.ui.codeFilename:"code.esee");
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
		$_eseecode.session.lastSave = new Date().getTime();
	}

	/**
	 * Asks the user via the UI to upload a file which will then trigger loadCodFile()
	 * @private
	 * @example $e_loadCode()
	 */
	function $e_loadCode() {
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			var uploadButton = document.createElement("input");
			uploadButton.type = "file";
			uploadButton.addEventListener("change", $e_loadCodeFile, false);
			uploadButton.style.display = "none";
			document.body.appendChild(uploadButton);
			uploadButton.click();
			document.body.removeChild(uploadButton);
		} else {
			$e_msgBox(_("Sorry, your browser doesn't support uploading files directly. Paste your code into Code view and then switch to the view you wish to code with."));
		}
	}

	/**
	 * Completes or cancels the $e_loadCode() asynchronous event by loading the code into the console if possible
	 * @private
	 * @param {!Object} event Event
	 * @example $e_loadCodeFile(event)
	 */
	function $e_loadCodeFile(event) {
		if (!event.target.files.length) {
			return;
		}
		var file = event.target.files[0];
		if (!file) {
        		$e_msgBox(_("Failed to upload the file!"));
			return;
		} else if (file.type && !file.type.match('text.*')) {
			$e_msgBox(_("%s is not a valid eSee file! (Invalid file type %s)",[file.name,file.type]));
			return;
		}
      		var reader = new FileReader();
		reader.onload = function(event) {
			API_uploadCode(event.target.result)
			$_eseecode.ui.codeFilename = file.name;
		}
		reader.readAsText(file);
	}

	/**
	 * Scrolls to a position in the div, it scrolls smoothly
	 * @private
	 * @param {!HTMLElement} div Div to scroll
	 * @param {Number} height Pixels from top to scroll to
	 * @param {Number} [startTop] Offset from the start. If unset it takes the current div's scroll offset
	 * @example $e_smoothScroll()
	 */
	function $e_smoothScroll(div, height, startTop) {
		clearTimeout($_eseecode.ui.scrollTimeout); // This is to prevent two scroll timeouts tunning at the same time
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
			$_eseecode.ui.scrollTimeout = setTimeout(function() { $e_smoothScroll(div, height, startTop) }, 1);
		}
	}

	/**
	 * Check if the code in the console is empty
	 * @private
	 * @return {Boolean} Whether the console is empty of code
	 * @example $e_codeIsEmpty("ca")
	 */
	function $e_codeIsEmpty() {
		if (ace.edit("console-write").getValue()) {
			return false;
		}
		if (document.getElementById("console-blocks").firstChild.id !== "console-blocks-tip") {
			return false;
		}
		return true;
	}

	/**
	 * Initializes/Resets all UI elements, called by the user
	 * @private
	 * @example $e_resetUIFromUI()
	 */
	function $e_resetUIFromUI() {
		if (!$e_codeIsEmpty()) {
			$e_msgBox(_("Do you really want to start over?"), {acceptAction:$e_resetUIForced,cancelAction:$e_msgBoxClose});
			return false;
		}
	}

	/**
	 * Initializes/Resets all UI elements
	 * @private
	 * @param {Boolean} notInitial If set to true it asks for confirmation if code would be lost
	 * @example $e_resetUI()
	 */
	function $e_resetUI(notInitial) {
		$_eseecode.whiteboard = document.getElementById("whiteboard");
		$_eseecode.ui.dialogWindow = document.getElementById("dialog-window");
		$e_initUIElements();
		document.getElementById("title").innerHTML = '<a href="'+$_eseecode.platform.logo.link+'" target="_blank"><img id="title-logo" src="'+$_eseecode.platform.logo.text+'" title="" /></a>';
		$e_resetGridModeSelect();
		$e_resetUndoBlocks();
		$e_resetBreakpoints();
		$e_resetWatchpoints(true);
		// Hide filemenu if asked to do so (to integrate with other platforms)
		var urlParts = window.location.href.match(/(\?|&)filemenu=([^&#]+)/);
		if (urlParts !== null) {
			if (urlParts[2] == "false" || urlParts[2] == "0" || urlParts[2] == "no" || urlParts[2] == "none") {
				document.getElementById("filemenu").style.display = "none";
			}
		}
		// init $_eseecode.modes array with div objects
		for (var i=1;i<$_eseecode.modes.console.length;i++) {
			var modeId = $_eseecode.modes.console[i].id;
			$_eseecode.modes.console[i].tab = document.getElementById("console-tabs-"+modeId);
		}
		for (var i=1;i<$_eseecode.modes.dialog.length;i++) {
			var modeId = $_eseecode.modes.dialog[i].div;
			$_eseecode.modes.dialog[i].element = document.getElementById("dialog-"+modeId);
			if (i < $_eseecode.modes.console.length) {
				$_eseecode.modes.dialog[i].tab = document.getElementById("dialog-tabs-pieces");
			} else {
				$_eseecode.modes.dialog[i].tab = document.getElementById("dialog-tabs-"+modeId);
			}
		}
		$e_resizeConsole(true);
		$e_initConsole();
		urlParts = window.location.href.match(/(\?|&)axis=([^&#]+)/);
		if (urlParts !== null) {
			var grid = $_eseecode.coordinates.predefined[urlParts[2]];
			$e_changeAxisCoordinates(grid.position, grid.scale);
		}
		$e_resetCanvas();
		$e_resetDebug();
		$e_resetUndo();
		$e_refreshUndoUI();
		document.getElementById("dialog-tabs-window").style.display = "none";
		$e_initSetup();
		$e_resetLanguageSelect();
		$e_switchLanguage($_eseecode.i18n.current, true);
		document.body.removeEventListener("keydown", $e_keyboardShortcuts, false);
		document.body.addEventListener("keydown", $e_keyboardShortcuts, false);
		window.removeEventListener("beforeunload", $e_windowRefresh, false);
		window.addEventListener("beforeunload", $e_windowRefresh, false);
		if (!notInitial) {
			window.addEventListener('resize', $e_windowResizeHandler);
			var orientation = "landscape";
			if (screen.orientation && screen.orientation.lock) {
				screen.orientation.lock(orientation).catch(function() {});
			} else if (screen.lockOrientation) {
				screen.lockOrientation(orientation);
			} else if (screen.mzLockOrientation) {
				screen.mzLockOrientation(orientation);
			} else if (screen.msLockOrientation) {
				screen.msLockOrientation(orientation);
			} else if (screen.webkitLockOrientation) {
				screen.webkitLockOrientation(orientation);
			}
			var eventListeners = ["webkitfullscreenchange","mozfullscreenchange","msfullscreenchange","fullscreenchange"];
			for (var i=0; i<eventListeners.length; i++) {
				document.addEventListener(eventListeners[i], function(e) {
					if (!$e_isFullscreen()) {
						$e_toggleFullscreenIcon(false);
					} else {
						$e_toggleFullscreenIcon(true);
					}
				}, false);
			}
			$e_toggleFullscreenIcon();
		}
		$e_windowResizeHandler();
		return true;
	}

	/**
	 * Detects whether the site is in fullscreen mode or not
	 * @return {Boolean} True if the page is in fullscreen mode
	 * @example $e_isFullscreen();
	 */
	function $e_isFullscreen() {
		return (window.navigator.standalone || (document.fullScreenElement && document.fullScreenElement !== null) || (document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement));
	}

	/**
	 * Redraws the maximize/restore fullscreen icon
	 * @example $e_toggleFullscreenIcon();
	 */
	function $e_toggleFullscreenIcon(maximize) {
		var fullscreenButton = document.getElementById("fullscreen-button");
		// Do not show this button if the page is embedded
		if ($e_isEmbedded()) {
			fullscreenButton.style.display = "none";
		}
		var iconMargin = 2;
		if (!$e_isFullscreen()) {
			iconMargin = 4;
		} else {
			iconMargin = 2;
		}
		// Console resize tab
		var canvas = fullscreenButton.firstChild;
		var ctx = canvas.getContext("2d");
		var width = canvas.width;
		var height = canvas.height;
		canvas.width = width;
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.moveTo(iconMargin,iconMargin);
		ctx.lineTo(width-iconMargin,iconMargin);
		ctx.lineTo(width-iconMargin,height-iconMargin);
		ctx.lineTo(iconMargin,height-iconMargin);
		ctx.closePath();
		ctx.stroke();
	}

	/**
	 * Set/unsets fullscreen view
	 * @example $e_toggleFullscreen();
	 */
	function $e_toggleFullscreen() {
		if (!$e_isFullscreen()) {
			//var element = document.getElementById("eseecode");
			var element = document.documentElement;
			if(element.requestFullscreen) {
				element.requestFullscreen();
			} else if(element.mozRequestFullScreen) {
				element.mozRequestFullScreen();
			} else if(element.webkitRequestFullscreen) {
				element.webkitRequestFullscreen();
			} else if(element.msRequestFullscreen) {
				element.msRequestFullscreen();
			}
		} else {
			if(document.exitFullscreen) {
				document.exitFullscreen();
			} else if(document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if(document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			} else if(document.msExitFullscreen) {
				document.msExitFullscreen();
			}
		}
	}

	/**
	 * Resets all UI elements even if code is already loaded
	 * @private
	 * @example $e_resetUIForced()
	 */
	function $e_resetUIForced() {
		$e_resetUI(true);
		$e_msgBoxClose();
	}

	/**
	 * Resizes the console height based on the window's size
	 * @private
	 * @example $e_windowResizeHandler()
	 */
	function $e_windowResizeHandler() {
		var height = document.getElementById("eseecode").clientHeight - document.getElementById("header").offsetHeight - document.getElementById("footer").offsetHeight - document.getElementById("console-tabs").offsetHeight - document.getElementById("console-buttons").offsetHeight;
		var programElements = document.getElementsByClassName("program");
		for (var i=0; i<programElements.length; i++) {
			programElements[i].style.height = height+"px";
		}
		ace.edit("console-write").resize();
	}

	/**
	 * Initializes/Resets the Console
	 * @private
	 * @example $e_initConsole()
	 */
	function $e_initConsole() {
		$e_resetBlocksConsole(document.getElementById("console-blocks"));
		$e_resetWriteConsole();
	}

	/**
	 * Window refresh handler
	 * @private
	 * @example $e_windowRefresh()
	 */
	function $e_windowRefresh(event) {
		if ($_eseecode.session.lastSave < $_eseecode.session.lastChange) {
                event.returnValue = _("Careful, any code you haven't saved will be lost if you leave this page!");
		}
	}

	/**
	 * Keyboard shortcuts listener. It listenes for all keyboard presses and calls functions when shurtcut combinations happen
	 * @private
	 * @param {Object} event Event
	 * @example document.body.addEventListener("keydown",$e_keyboardShortcuts,false)
	 */
	function $e_keyboardShortcuts(event) {
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		if (event && event.type == "keydown" && event.keyCode == 27) {
			if ($_eseecode.session.breakpointHandler) {
				$e_addBreakpointEventCancel();
			}
			if ($_eseecode.session.floatingBlock.div) {
				$e_cancelFloatingBlock(event);
			}
			if (document.getElementById("msgBoxWrapper0")) {
				var id=0;
				for (id=0; document.getElementById("msgBoxWrapper"+id); id++);
				id--;
				var isSetupBlockDialog = false;
				var element = document.getElementById("setupBlockDiv");
				while (element) {
					if (element.id && element.id.indexOf("msgBoxWrapper") === 0) {
						var setupBlockMsgBoxId = parseInt(element.id.substring("msgBoxWrapper".length));
						if (setupBlockMsgBoxId === id) {
							isSetupBlockDialog = true;
						}
						break;
					}
					element = element.parentNode;
				}
				if (isSetupBlockDialog) {
					$e_setupBlockCancel();
				} else {
					$e_msgBoxClose();
				}
			}
		} else if (event.which === 82 && event.ctrlKey && !event.shiftKey) { // CTRL+R
			$e_execute();
			event.preventDefault();
		} else if (mode == "blocks") {
			if (event && event.type == "keydown") {
				if (event.which === 90 && event.ctrlKey && !event.shiftKey) { // CTRL+Z
					$e_undo(false);
				} else if (event.which === 90 && event.ctrlKey && event.shiftKey) { // CTRL+SHIFT+Z
					$e_undo(true);
				} else if (event.which === 89 && event.ctrlKey) { // CTRL+Y
					$e_undo(true);
				}
			}
		}
	}

	/**
	 * Adds the console and dialog tips for blocks if no code exists
	 * @private
	 * @example $e_checkAndAddBlocksTips()
	 */
	function $e_checkAndAddBlocksTips() {
		var consoleDiv = document.getElementById("console-blocks");
		if (!consoleDiv.firstChild || consoleDiv.firstChild.id == "console-blocks-tip") {
			var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id;
			// Console tip
			var text = "";
			if (level === "level1") {
				text = _("Click some blocks to start programming!");
			} else {
				text = _("Drop some blocks here to start programming!");
			}
			consoleDiv.innerHTML = "<div id='console-blocks-tip' style='border-width:0px;box-shadow:none;float:none;text-align:center;color:#FF5555;text-shadow:1px 1px 2px #000000;font-weight:bold;padding:"+(consoleDiv.clientHeight/2-10)+"px 10px 0px 10px'>"+text+"</div>";
/*
			// Dialog highlight first block to use
			if (level === "level1") {
				var startInstructionId = $e_getInstructionSetIdFromName("goToCenter");
				var startInstructionDiv = document.getElementById("dialog-blocks").firstChild;
				while (startInstructionDiv !== null) {
					if (startInstructionDiv.getAttribute("instructionSetId") == startInstructionId) {
						break;
					}
					startInstructionDiv = startInstructionDiv.nextSibling;
				}
				if (startInstructionDiv !== null && startInstructionDiv.offsetTop > 0) {
					var style = "3px solid #FF5555";
					$_eseecode.ui.tipInterval = setInterval(function() {
							if (startInstructionDiv.style.border === "") {
								startInstructionDiv.style.border = style;
								startInstructionDiv.style.marginBottom = "";
							} else {
								startInstructionDiv.style.border = "";
								startInstructionDiv.style.marginBottom = "6px";
							}
						},350);
					// Arrow
					var tipDiv = document.getElementById("console-blocks-tip");
					var canvas = document.createElement("canvas");
					canvas.width = consoleDiv.clientWidth;
					canvas.height = consoleDiv.clientHeight-tipDiv.offsetHeight-5;
					var arrowHeight = startInstructionDiv.offsetTop-tipDiv.offsetTop+startInstructionDiv.offsetHeight/2-185;
					if (arrowHeight > canvas.height) {
						arrowHeight = canvas.height;
					}
					var ctx = canvas.getContext("2d");
					var margin = 10;
					ctx.strokeStyle = "#FF5555";
					ctx.fillStyle = "#FF5555";
					ctx.lineWidth = '10';
					ctx.moveTo(consoleDiv.clientWidth/2, margin);
					ctx.lineTo(consoleDiv.clientWidth/2, arrowHeight-margin);
					ctx.lineTo(margin*2, arrowHeight-margin);
					ctx.stroke();
					ctx.beginPath();
					ctx.moveTo(margin, arrowHeight-margin);
					ctx.lineTo(margin*2, arrowHeight);
					ctx.lineTo(margin*2, arrowHeight-margin*2);
					ctx.closePath();
					ctx.fill();
					consoleDiv.appendChild(canvas);
				}
			}
*/
			// Arrow
			var tipDiv = document.getElementById("console-blocks-tip");
			var canvas = document.createElement("canvas");
			canvas.width = consoleDiv.clientWidth;
			var arrowHeight = 50;
			canvas.height = arrowHeight;
			var ctx = canvas.getContext("2d");
			var margin = 10;
			ctx.strokeStyle = "#FF5555";
			ctx.fillStyle = "#FF5555";
			ctx.lineWidth = '10';
			ctx.moveTo(consoleDiv.clientWidth/2, margin);
			ctx.lineTo(consoleDiv.clientWidth/2, arrowHeight-margin);
			ctx.lineTo(margin*2, arrowHeight-margin);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(margin, arrowHeight-margin);
			ctx.lineTo(margin*2, arrowHeight);
			ctx.lineTo(margin*2, arrowHeight-margin*2);
			ctx.closePath();
			ctx.fill();
			consoleDiv.appendChild(canvas);
		}
	}

	/**
	 * Removes the console and dialog tips for blocks
	 * @private
	 * @example $e_removeBlocksTips()
	 */
	function $e_removeBlocksTips() {
		// Remove console tip
		var consoleDiv = document.getElementById("console-blocks");
		consoleDiv.innerHTML = "";
		// Remove dialog highlight
		if ($_eseecode.ui.tipInterval) {
			clearInterval($_eseecode.ui.tipInterval);
		}
		var startInstructionId = $e_getInstructionSetIdFromName("goToCenter");
		var startInstructionDiv = document.getElementById("dialog-blocks").firstChild;
		while (startInstructionDiv !== null) {
			if (startInstructionDiv.getAttribute("instructionSetId") == startInstructionId) {
				break;
			}
			startInstructionDiv = startInstructionDiv.nextSibling;
		}
		if (startInstructionDiv !== null) {
			startInstructionDiv.style.border = "";
			startInstructionDiv.style.marginBottom = "";
		}
	}

	/**
	 * Returns a list of all variables declared before and in the scope of div
	 * @private
	 * @param {!HTMLElement} div Block div
	 * @return {Array<String>} List of all variables declared before and in the scope of div
	 * @example $e_getVariables(document.getElementById("div-123123123"))
	 */
	function $e_getVariables(div) {
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
	 * @return {Array<String>} List of all eSeeCode functions declared in the code that return a specific type of value
	 * @example $e_getFunctions("number"))
	 */
	function $e_getFunctions(type) {
		var values = [];
		for (var i=0; i<$_eseecode.instructions.set.length; i++) {
			if ($_eseecode.instructions.set[i].type === type) {
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
	 * @return {parameters:Array<String>, text:String} Parameters of a block, or the default parameters if none were set
	 * @example $e_loadParameters("level2", document.getElementById("div-123123123"))
	 */
	function $e_loadParameters(level, div, dialog) {
		var instructionSetId = div.getAttribute("instructionSetId");
		var instruction = $_eseecode.instructions.set[instructionSetId];
		var parameters = [];
		if (instruction.parameters !== null) {
			var i;
			for (i=0; i<instruction.parameters.length; i++) {
				var param = undefined;
				if (div.getAttribute("param"+(i+1)) !== null) {
					param = div.getAttribute("param"+(i+1));
				} else if (instruction.parameters[i].initial !== undefined) {
					param = instruction.parameters[i].initial;
					if (instruction.parameters[i].type == "number") {
						param = $e_parsePredefinedConstants(param);
					}
					div.setAttribute("param"+(i+1),param);
				}
				if (param !== undefined) {
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
			} else if (div.getAttribute("instructionName") !== null) {
				text += div.getAttribute("instructionName");
			} else {
				text += instruction.name;
			}
		}
		if (instruction.code && instruction.code.space) {
			text += " ";
		}
		if (dialog && level != "level1" && level != "level2") {
			if (instruction.parameters !== null && (!instruction.code || !instruction.code.noBrackets)) {
				text += "()";
			}
		}
		if (dialog || (level != "level3" && level != "level4" && instruction.name != "unknownFunction")) {
			return { parameters: parameters, text: text };
		}
		if (instruction.parameters !== null) {
			var bracketsStatus = null; // null indicates we haven't started yet
			var bracketsExist = false;
			for (i=0; i<parameters.length; i++) {
				if (!bracketsStatus && !instruction.parameters[i].noBrackets) {
					if (instruction.code && instruction.code.space && text[text.length-1] !== " ") {
						text += " ";
					}
					text += "(";
					bracketsStatus = true;
					bracketsExist = true;
				} else if (bracketsStatus && parameters[i].noBrackets) {
					text += ") ";
					bracketsStatus = false;
				} else if (bracketsStatus !== null) {
					text += ", ";
				} else if (bracketsStatus === null) {
					if (instruction.code && instruction.code.space && text[text.length-1] !== " ") {
						text += " ";
					}
				}
				if (parameters[i] == "" && i < parameters.length-1) { // if there are more parameters left to parse use "undefined" instead of leaving blank
					text += "undefined";
				} else {
					text += parameters[i];
				}
			}
			if (bracketsStatus) {
				text += ")";
			} else if (!bracketsExist && (!instruction.code || !instruction.code.noBrackets)) {
				text += "()";
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
			text = div.getAttribute("param1");
			if (instruction.code && instruction.code.space) {
				text += " ";
			}
			text += instruction.name;
			if (div.getAttribute("param2")) {
				if (instruction.code && instruction.code.space) {
					text += " ";
				}
				text += div.getAttribute("param2");
			}
		}
		return { parameters: parameters, text: text };
	}

	/**
	 * Initializes/Resets the blocks in the dialog window
	 * @private
	 * @param {String} level Level name
	 * @param {!HTMLElement} dialog Dialog window element
	 * @example $e_initDialogBlocks("level2", document.getElementById("dialog-window"))
	 */
	function $e_initDialogBlocks(level, dialog) {
		$e_resetDialog(dialog);
		var instructions = $_eseecode.instructions.set;
		var width = $_eseecode.setup.blockWidth[level];
		var height = $_eseecode.setup.blockHeight[level];
		var urlParts = window.location.href.match(/(\?|&)instructions=([^&#]+)/);
		var clearNext = false;
		if (urlParts !== null) {
        	// Check that there is an explicit instruction set
            var instructions = urlParts[2].split(";");
            for (var i=0;i<instructions.length;i++) {	
                codeId = instructions[i];
                if (codeId == "blank") {
                    clearNext = true;
                    continue;
                }
                var div = document.createElement('div');
                if (clearNext) {
                    clearNext = false;
                    div.style.clear = "left";
                }
                dialog.appendChild(div);
				var newInstructionId;
				if ($_eseecode.instructions.custom.length > 0) { // Custom instructions are already loaded in the instructionSet
					newInstructionId = $_eseecode.instructions.custom[i];
				} else {
			        var instruction = $_eseecode.instructions.set[$e_getInstructionSetIdFromName(codeId)];
			        newInstructionId = $_eseecode.instructions.set.length;
			        $_eseecode.instructions.set[newInstructionId] = $e_clone(instruction);
			        $_eseecode.instructions.set[newInstructionId].show = [];
					$_eseecode.instructions.custom[$_eseecode.instructions.custom.length-1] = newInstructionId;
				}
				var j = 0;
				while (i+1+j < instructions.length && ($e_isNumber(instructions[i+1+j]) || decodeURIComponent(instructions[i+1+j]).charAt(0) == '"' || decodeURIComponent(instructions[i+1+j]).charAt(0) == "'")) {
                    // Doing this when custom instructions have been previously created is redundant but doesn't hurt and allows us to increase variable i skipping the parameters without duplicating code
			        $_eseecode.instructions.set[newInstructionId].parameters[j].initial = decodeURIComponent(instructions[i+1+j]);
			        j++;
				}
				i += j;
                $e_createBlock(level,div,newInstructionId,true);
            }
		} else {
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
					        $e_createBlock(level,div,i,true);
				        }
				}
			}
		}
	}

	/**
	 * Initializes/Resets the write dialog window
	 * @private
	 * @param {String} level Level name
	 * @param {!HTMLElement} dialog Dialog window element
	 * @example $e_initDialogWrite("level2", document.getElementById("dialog-window"))
	 */
	function $e_initDialogWrite(level, dialog) {
		$e_resetDialog(dialog);
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
						div.style.color = $e_readableText(color);
						div.setAttribute("title", _(instruction.tip));
						div.setAttribute("instructionSetId", instruction.index);
						div.addEventListener("click", $e_writeText, false);
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
							div.innerHTML = _(instruction.parameters[0].name)+" <b>"+instruction.name+"</b>";
							if (instruction.parameters[1]) {
								div.innerHTML += " "+_(instruction.parameters[1].name);
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
	 * Writes in the write console at the position where the guide is the instruction clicked in the dialgo window
	 * @private
	 * @param {!Object} event Event
	 * @example div.addEventListener("click", $e_writeText, false)
	 */
	function $e_writeText(event) {
		var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id;
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
		ace.edit("console-write").focus();
	}

	/**
	 * Undoes/Redoes the last action in the current level
	 * @private
	 * @param {Boolean} [redo] Whether we want to redo or undo
	 * @example $e_undo()
	 */
	function $e_undo(redo) {
		var mode = $_eseecode.modes.console[$_eseecode.modes.console[0]].div;
		if (mode == "blocks") {
			$e_undoBlocks(redo);
		} else if (mode == "write") {
			if (redo) {
				ace.edit("console-write").session.getUndoManager().redo();
			} else {
				ace.edit("console-write").session.getUndoManager().undo();
			}
		}
	}

	/**
	 * Undoes the last action in the current level, called by the user
	 * @private
	 * @example $e_undoFromUI()
	 */
	function $e_undoFromUI() {
		$e_undo(false);
		$e_refreshUndoUI();
	}

	/**
	 * Redoes the last action in the current level, called by the user
	 * @private
	 * @example $e_undoFromUI()
	 */
	function $e_redoFromUI() {
		$e_undo(true);
		$e_refreshUndoUI();
	}

	/**
	 * Initializes/Resets all the drawing elements including execution
	 * @private
	 * @example $e_resetCanvasFromUI()
	 */
	function $e_resetCanvasFromUI() {
		$e_resetCanvas();
		$e_switchDialogMode($_eseecode.modes.console[0]); // Switch to current console's "pieces" dialog
		$e_endExecution();
		$e_initProgramCounter();
	}

	/**
	 * Initializes/Resets the whiteboard
	 * @private
	 * @param {Boolean} noPrecode If true precode is not executed
	 * @example $e_resetCanvas()
	 */
	function $e_resetCanvas(noPrecode) {
		document.getElementById("dialog-debug-execute-stats").innerHTML = "";
		// First delete bottom and top references so their layers aren't deleted twice in the for()
		delete $_eseecode.canvasArray["bottom"];
		delete $_eseecode.canvasArray["top"];
		// reset canvas
  		for(key in $_eseecode.canvasArray) {
			$e_removeCanvas(key);
		}
		$e_resetBreakpointWatches();
		$e_resetWatchpoints();
		delete $_eseecode.canvasArray;
		$_eseecode.canvasArray = [];
		$e_initGuide();
		$e_getCanvas("grid").canvas.style.zIndex = -1; // canvas-0 is special
		$e_switchCanvas(0); // canvas-0 is the default
		$e_changeAxisBasedOnUISettings();
		// reset guide	
		$e_moveGuide($e_user2systemCoords({x: 0, y: 0}));
		$e_setAngleGuide($e_user2systemAngle(0));
		// reset windows
  		for(var i=0;i<$_eseecode.windowsArray.length;i++) {
			if ($_eseecode.windowsArray[i]) {
				$_eseecode.ui.dialogWindow.removeChild($_eseecode.windowsArray[i]);
				delete $_eseecode.windowsArray[i];
			}
		}
		$_eseecode.currentWindow = undefined;
		delete $_eseecode.windowsArray;
		$_eseecode.windowsArray = [];
		document.getElementById("dialog-tabs-window").style.display = "none";
		if (!noPrecode && !$_eseecode.execution.precode.standby) {
			$e_execute("disabled", null, true);
		}
	}

	/**
	 * Initializes/Resets the dialog window
	 * @private
	 * @param {!HTMLElement} dialog Dialog div element
	 * @example $e_resetDialog(document.getElementById("dialog-window"))
	 */
	function $e_resetDialog(dialog) {
		while (dialog.hasChildNodes()) {
			dialog.removeChild(dialog.lastChild);
		}
	}

	/**
	 * Initializes/Resets the blocks console window
	 * @private
	 * @param {!HTMLElement} dialog Console div element
	 * @example $e_resetBlocksConsole(document.getElementById("console-blocks"))
	 */
	function $e_resetBlocksConsole(console) {
		while (console.hasChildNodes()) {
		    console.removeChild(console.lastChild);
		}
		$e_cancelFloatingBlock();
		$e_checkAndAddBlocksTips();
	}

	/**
	 * Initializes/Resets the write console window
	 * @private
	 * @param {!HTMLElement} dialog Console div element
	 * @example $e_resetWriteConsole(document.getElementById("console-write"))
	 */
	function $e_resetWriteConsole(code) {
		if (!code) {
			code = "";
		}
		document.getElementById('console-write').style.fontSize = $_eseecode.setup.blockHeight.level3+"px";
		var editor = ace.edit("console-write");
		ace.require("ace/ext/language_tools");
		editor.setTheme("ace/theme/chrome");
		editor.getSession().setMode("ace/mode/eseecode");
		editor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: true
		});
		editor.setHighlightActiveLine(true);
		// Only update code if it changed, to avoid adding empty changes into the ACE undo queue
		if (code != ace.edit("console-write").getValue()) {
			// We must unset $e_writeChanged call on ace change event otherwise it unhighlights the code
			editor.session.off("change",$e_writeChanged);
			editor.setValue(code);
		}
		editor.gotoLine(0,0);
		editor.session.on("change",$e_writeChanged);
		ace.edit("console-write").session.setUseWrapMode(false);
	}

	/**
	 * Added as a listener it informs $_eseecode.session.changesInCode that the code in write console changed
	 * @private
	 * @param {!Object} event Ace editor change event object
	 * @example $e_writeChanged()
	 */
	function $e_writeChanged(event) {
		$_eseecode.session.changesInCode = "write";
		$_eseecode.session.lastChange = new Date().getTime();
		$e_unhighlight();
		$e_updateWriteBreakpoints(event);
		$e_refreshUndoUI();
	}

	/**
	 * Returns the $_eseecode.coordinates.predefined index of the axis setup
	 * If no parameters are passed it assumes current coordinates
	 * @private
	 * @param {Number} pos Position of the axis, origin us upperleft corner
	 * @param {Number} scale Scale by which to multiply the x coordinates, originaly increasing from left to right
	 * @return The index if it is found, -1 otherwise
	 * @example $e_getGridPredefined(200, 200, 1, -1)
	 */
	function $e_getGridPredefined(pos, scale) {
		if (pos === undefined) {
			pos = $_eseecode.coordinates.position;
			scale = $_eseecode.coordinates.scale;
		}
		var gridModes = $_eseecode.coordinates.predefined;
		var foundPredefined = false;
		var i = 0;
		for (i=0; i<gridModes.length; i++) {
			if (pos.x == gridModes[i].position.x && pos.y == gridModes[i].position.y && scale.x == gridModes[i].scale.x && scale.y == gridModes[i].scale.y) {
				foundPredefined = true;
				break;
			}
		}
		if (!foundPredefined) {
			i = -1;
		}
		return i;
	}

	/**
	 * Change whiteboard axis setup
	 * @private
	 * @param {Number} pos Position of the axis, origin us upperleft corner
	 * @param {Number} scale Scale by which to multiply the coordinates, originaly increasing downwards
	 * @example $e_changeAxisCoordinates({x: 200, y: 200}, {x: 1, y: -1})
	 */
	function $e_changeAxisCoordinates(pos, scale) {
		$_eseecode.coordinates.position = pos;
		$_eseecode.coordinates.scale = scale;
		$e_resetGrid();
		var element = document.getElementById("setup-grid-coordinates");
		var gridModes = $_eseecode.coordinates.predefined;
		var gridIsPredefined = $e_getGridPredefined(pos, scale);
		if (gridIsPredefined >= 0) {
			// Only change if it is not the one already selected, otherwise we enter a infinite loop
			if (element.value != gridIsPredefined) {
				element.value = gridIsPredefined;
			}
			if (element.options.length > gridModes.length) {
				// Remove the Custom option
				element.remove(gridModes.length);
			}
		} else {
			if (element.options.length == gridModes.length) {
				var option = document.createElement("option");
				option.value = gridModes.length;
				option.text = _("Custom");
				element.add(option);
			}
			element.value = gridModes.length;
		}
	}
	
	/**
	 * Change whiteboard axis setup, called by the UI
	 * @private
	 * @example $e_changeAxisFromUI()
	 */
	function $e_changeAxisFromUI() {
		$e_changeAxisBasedOnUISettings();
		$e_resetCanvas();
	}

	/**
	 * Change whiteboard axis based on UI settings
	 * @private
	 * @example $e_changeAxisBasedOnUISettings()
	 */
	function $e_changeAxisBasedOnUISettings() {
		var element = document.getElementById("setup-grid-coordinates");
		var gridModes = $_eseecode.coordinates.predefined;
		var selectValue = element.value;
		if (selectValue == gridModes.length) { // It was set as Custom
			selectValue = 0;
			for (var i=0; i<gridModes.length; i++) {
				if (gridModes[i].default) {
					selectValue = i;
					break;
				}
			}
		}
		$_eseecode.coordinates.userSelection = selectValue;
		$e_changeAxisCoordinates(gridModes[selectValue].position, gridModes[selectValue].scale);
	}
	
	/**
	 * Shows/Hide unro/redo buttons
	 * @private
	 * @example $e_refreshUndoUI()
	 */
	function $e_refreshUndoUI() {
		var hasUndo = true, hasRedo = true;
		if ($_eseecode.modes.console[$_eseecode.modes.console[0]].div === "write") {
			var aceUndoManager =  ace.edit("console-write").session.getUndoManager();
			hasUndo = aceUndoManager.hasUndo();
			hasRedo = aceUndoManager.hasRedo();
		} else {
			var undoBlocksIndex = $_eseecode.session.blocksUndo[0];
			if (undoBlocksIndex == 0) {
				hasUndo = false;
			}
			if (undoBlocksIndex == $_eseecode.session.blocksUndo.length-1) {
				hasRedo = false;
			}
		}
		if (hasUndo) {
			document.getElementById("button-undo").style.visibility = "visible";
		} else {
			document.getElementById("button-undo").style.visibility = "hidden";
		}
		if (hasRedo) {
			document.getElementById("button-redo").style.visibility = "visible";
		} else {
			document.getElementById("button-redo").style.visibility = "hidden";
		}
	}

	/**
	 * Resets the undo stacks
	 * @private
	 * @example $e_resetUndo()
	 */
	function $e_resetUndo() {
		$e_resetUndoBlocks();
		$e_resetUndoWrite();
	}

	/**
	 * Initializes/Resets the write undo stack in ace
	 * @private
	 * @example $e_resetUndoWrite()
	 */
	function $e_resetUndoWrite() {
		var UndoManager = require("ace/undomanager").UndoManager; 
		ace.edit("console-write").session.setUndoManager(new UndoManager());
	}
