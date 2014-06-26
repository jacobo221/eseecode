"use strict";

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