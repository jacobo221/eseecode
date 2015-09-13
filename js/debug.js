"use strict";

	/**
	 * Checks the layers list and returns the debug layers list content
	 * @private
	 * @return {String} Debug layers list content
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
	 * Enables/disables a breakpoint
	 * @private
	 * @param {String} line Breakpoint to disable/enable
	 * @param {!HTMLElement} element HTML checkbox that triggered the function
	 * @example toggleBreakpoint(12, this)
	 */
	function toggleBreakpoint(line, element) {
		$_eseecode.session.breakpointsStatus[line] = element.checked;
	}

	/**
	 * Deletes a breakpoint
	 * @private
	 * @param {String} line Line to remove breakpoint from
	 * @example removeBreakpoint(12)
	 */
	function removeBreakpoint(line) {
		delete $_eseecode.session.breakpoints[line];
		delete $_eseecode.session.breakpointsStatus[line];
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
		tabdiv.removeEventListener("mousedown", addBreakpointEventEnd, false);
		tabdiv.removeEventListener("touchstart", addBreakpointEventEnd, false);
		document.body.removeEventListener("mousedown", addBreakpointEventCancel, false);
		document.body.removeEventListener("touchstart", addBreakpointEventCancel, false);
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
		tabdiv.addEventListener("mousedown", addBreakpointEventEnd, false);
		tabdiv.addEventListener("touchstart", addBreakpointEventEnd, false);
		document.body.addEventListener("mousedown", addBreakpointEventCancel, false);
		document.body.addEventListener("touchstart", addBreakpointEventCancel, false);
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
				$_eseecode.session.breakpointsStatus[line] = true;
			}
			var div = document.createElement("div");
			div.id = "dialog-debug-analyzer-line"+line;
			div.className = "dialog-debug-analyzer-breakpoint";
			div.innerHTML = "<input type=\"checkbox\" onchange=\"toggleBreakpoint("+line+", this)\" "+($_eseecode.session.breakpointsStatus[line]?"checked":"")+" /><span class=\"link\" onclick=\"updateBreakpoint("+line+")\" onmouseover=\"highlight("+line+",'breakpoint')\" onmouseover=\"unhighlight()\">"+_("Line")+" "+line+"</span>: <input type=\"button\" value=\"+ "+_("Watch")+"\" onclick=\"addBreakpointWatch("+line+")\" /><span class=\"dialog-debug-analyzer-breakpoint-trash link\" onclick=\"removeBreakpoint("+line+")\">("+_("Delete")+")</span><br><div id=\"dialog-debug-analyzer-line"+line+"-watches\"></div>";
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
			if ($_eseecode.session.highlight.lineNumber == line) {
				document.getElementById("dialog-debug-analyzer-line"+line).style.fontWeight = "bold";
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
				$_eseecode.session.breakpointsStatus[line] = $_eseecode.session.breakpointsStatus[oldLine];
				delete $_eseecode.session.breakpoints[oldLine];
				delete $_eseecode.session.breakpointsStatus[oldLine];
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
	 * Adds a watch in a breakpoint, its only a wrapper to call the dialog or directly the function
	 * @private
	 * @param {String} line Breakpoint (line) to add the watch to
	 * @param {String} [watch] Name of the variable to watch. If unset it calls for the user to set it up via the UI
	 * @example addBreakpointWatch(12, "count")
	 */
	function addBreakpointWatch(line, watch) {
		if (!watch) {
			var div = _("Enter the name of the variable you want to watch in line %s",[line])+"<br /> <input id=\"addBreakpointLine\" type=\"hidden\" value=\""+line+"\" /><input id=\"addBreakpointWatch\" type=\"text\" />";
			msgBox(div,{acceptAction:addBreakpointWatchFromDialog,cancelAction:msgBoxClose,focus:"addBreakpointWatch"});
		} else {
			addBreakpointWatch2(line, watch);
		}
	}

	/**
	 * Adds a watch in a breakpoint, called from dialog
	 * @private
	 * @example addBreakpointWatchFromDialog()
	 */
	function addBreakpointWatchFromDialog() {
		var line = document.getElementById("addBreakpointLine").value;
		var watch = document.getElementById("addBreakpointWatch").value;
		if (watch && watch.match(/^[A-Za-z][A-Za-z_0-9]*$/) !== null) {
			msgBoxClose();
			addBreakpointWatch2(line, watch);
		} else {
			msgBox(_("Invalid name of variable!"));
		}
	}

	/**
	 * Adds a watch in a breakpoint
	 * @private
	 * @param {String} line Breakpoint (line) to add the watch to
	 * @param {String} [watch] Name of the variable to watch. If unset it calls for the user to set it up via the UI
	 * @example addBreakpointWatch2(12, "count")
	 */
	function addBreakpointWatch2(line, watch) {
		if (watch !== null && !document.getElementById("dialog-debug-analyzer-line"+line+"-"+watch)) {
			var watchText = "<div id=\"dialog-debug-analyzer-line"+line+"-"+watch+"\">"+watch+": ";
			if ($_eseecode.session.breakpoints[line][watch] === undefined) {
				$_eseecode.session.breakpoints[line][watch] = "";
			} else {
				watchText += $_eseecode.session.breakpoints[line][watch];
			}
			watchText += "<span class=\"dialog-debug-analyzer-breakpoint-trash link\" onclick=\"removeBreakpointWatch("+line+",'"+watch+"')\">("+_("Delete")+")</span></div>";
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
			layersText += "<div><label for=\"toggle-canvas-"+id+"\">"+_("Toggle layer")+" "+id+"</label><input id=\"toggle-canvas-"+id+"\" type=\"checkbox\" title=\""+_("Toggle layer")+" "+id+"\""+checked+" /"+"><span id=\"link-canvas-"+id+"\" class=\"link\">";
			var showName = _("Layer")+" "+list[i];
			if ($_eseecode.currentCanvas.name == list[i]) {
				layersText += "<b>"+showName+"</b>";
			} else {
				layersText += showName;
			}
			layersText += "</span></div>\n";
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
	 * Keeps track of the breakpoints in the level4 code. This function is to be called by Ace's change event
	 * @private
	 * @param {!Object} event Ace editor change event object
	 * @example editor.on("change",updateWriteBreakpoints);
	 */
	function updateWriteBreakpoints(event) {
		for (var breakpointLine in $_eseecode.session.breakpoints) {
			breakpointLine = parseInt(breakpointLine);
			if (event.data.action === "insertText") {
				if (event.data.range.start.row === breakpointLine && event.data.range.start.row !== event.data.range.end.row) {
					// The breakpoint line has been split, update breakpoint
					updateBreakpoint(breakpointLine, breakpointLine + event.data.range.end.row - event.data.range.start.row);
				} else if (event.data.range.start.row < breakpointLine && event.data.range.start.row !== event.data.range.end.row) {
					// A line was added before the breakpoint, update breakpoint
					updateBreakpoint(breakpointLine, breakpointLine + event.data.range.end.row - event.data.range.start.row);
				}
			} else if (event.data.action === "removeText" || event.data.action === "removeLines") {
				if (event.data.range.start.row === breakpointLine && event.data.range.start.row !== event.data.range.end.row) {
					// The breakpoint line has been merged, update breakpoint
					updateBreakpoint(breakpointLine, event.data.range.end.row);
				} else if (event.data.range.start.row < breakpointLine && event.data.range.start.row !== event.data.range.end.row) {
					// A line was removed before the breakpoint, update breakpoint
					updateBreakpoint(breakpointLine, breakpointLine - (event.data.range.end.row - event.data.range.start.row));
				}
			}
		}
	}

	/**
	 * Keeps track of the breakpoints in the blocks code. This function is to be called by addBlock() and deleteBlock()
	 * @private
	 * @param {!Object} div Div of a block
	 * @example updateBlocksBreakpoints(blockDiv);
	 */
	function updateBlocksBreakpoints(blockDiv, action) {
		var consoleDiv = document.getElementById("console-blocks");
		for (var breakpointLine in $_eseecode.session.breakpoints) {
			breakpointLine = parseInt(breakpointLine);
			var line = searchBlockPosition(consoleDiv.firstChild, blockDiv).count;
			if (line <= breakpointLine) {
				if (action === "addBlock") {
					updateBreakpoint(breakpointLine, breakpointLine + 1);
				} else if (action === "deleteBlock") {
					updateBreakpoint(breakpointLine, breakpointLine - 1);
				}
			}
		}
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

	/**
	 * Select All/None of the debug layer checkboxes
	 * @private
	 * @param {!Object} checkbox Checkbox element
	 * @example debugSelectAllNoneLayers(checkbox)
	 */
	function debugSelectAllNoneLayers(checkbox) {
		if (checkbox.checked) {
			for (var i=1; document.getElementById("toggle-canvas-"+i); i++) {
				document.getElementById("toggle-canvas-"+i).checked = true;
			}
		} else {
			for (var i=1; document.getElementById("toggle-canvas-"+i); i++) {
				document.getElementById("toggle-canvas-"+i).checked = false;
			}
		}
	}

	/**
	 * Shows only a layer (hides the others)
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
		if (document.getElementById("setup-grid-enable").checked) {
			drawGrid(context);
		}
		var targetCanvas = $_eseecode.canvasArray[id];
		context.drawImage(targetCanvas.canvas, 0, 0);
		var xScale = $_eseecode.coordinates.xScale;
		if (xScale < 0) {
			xScale *= -1;
		}
		if (yScale < 0) {
			yScale *= -1;
		}
		var yScale = $_eseecode.coordinates.yScale;
		var posX = targetCanvas.turtle.x;
		var posY = targetCanvas.turtle.y;
		drawCursor(context, posX, posY, id);
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
