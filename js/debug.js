"use strict";

	/**
	 * Checks the layers list and returns the debug layers list content
	 * @private
	 * @return {String} Debug layers list content
	 * @example $e_debugLayers()
	 */
	function $e_debugLayers() {
		var list = [];
		var listReverse = [];
		var layer = $_eseecode.canvasArray["$e_top"];
		var oldLayer = null;
		for (var i=0; layer; i++) {
			listReverse[i] = {name: layer.name, position: i};
			oldLayer = layer;
			layer = layer.layerUnder;
		}
		// Check that the list is equal downwards and upwards
		var layer = $_eseecode.canvasArray["$e_bottom"];
		for (var i=0; layer; i++) {
			list[i] = {name: layer.name, position: i};
			oldLayer = layer;
			layer = layer.layerOver;
		}
		var valid = true;
		if (list.length != listReverse.length) {
			valid = false;
		} else {
			for (var i=0; i<list.length; i++) {
				if (list[i].name != listReverse[listReverse.length-i-1].name) {
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
				ret[0] += list[i].name+" ";
			}
			ret[0] += "<br /"+">";
			ret[0] += "Bottom to top:<br /"+">";
			for (var i=0; i<listReverse.length; i++) {
				ret[0] += listReverse[i].name+" ";
			}
			list = ret;
		}
		return list;
	}

	/**
	 * Enables/disables a watchpoint
	 * @private
	 * @param {String} line Watchpoint to disable/enable
	 * @param {!HTMLElement} element HTML checkbox that triggered the function
	 * @example $e_toggleWatchpoint("num", this)
	 */
	function $e_toggleWatchpoint(watch, element) {
		$_eseecode.session.watchpoints[watch].status = element.checked;
	}

	/**
	 * Enables/disables a breakpoint
	 * @private
	 * @param {String} line Breakpoint to disable/enable
	 * @param {!HTMLElement} element HTML checkbox that triggered the function
	 * @example $e_toggleBreakpoint(12, this)
	 */
	function $e_toggleBreakpoint(line, element) {
		$_eseecode.session.breakpoints[line].status = element.checked;
		if ($_eseecode.modes.console[$_eseecode.modes.console[0]].div == "write") {
			if ($_eseecode.session.breakpoints[line].status) {
				ace.edit("console-write").session.setBreakpoint(line-1,"ace-breakpoint");
			} else {
				ace.edit("console-write").session.clearBreakpoint(line-1);
			}
		} else {
			var consoleDiv = document.getElementById("console-blocks");
			var div = $e_searchBlockByPosition(consoleDiv.firstChild,line,1).element;
			if ($_eseecode.session.breakpoints[line].status) {
				if (div && div.id != "console-blocks-tip") {
					div.style.boxShadow = "5px 5px 5px #FF0000";
				}
			} else {
				if (div && div.id != "console-blocks-tip") {
					div.style.boxShadow = "";
				}
			}
		}
	}

	/**
	 * Highlights a watchpoint
	 * @private
	 * @param {Array<String>} watches Watchpoints to highlight
	 * @example $e_highlightWatchpoint("num")
	 */
	function $e_highlightWatchpoint(watches) {
		var div = document.getElementById("dialog-debug-analyzer-watches").firstChild;
		while (div !== null) {
			div.style.fontWeight = "normal";
			for (var i = 0; i < watches.length; i++) {
				if (div.id == "dialog-debug-analyzer-watch-"+watches[i]) {
					div.style.fontWeight = "bold";
				}
			}
			div = div.nextSibling;
		}
	}

	/**
	 * Deletes a watchpoint
	 * @private
	 * @param {String} watch Watchpoint to remove
	 * @example $e_removeWatchpoint("num")
	 */
	function $e_removeWatchpoint(watch) {
		delete $_eseecode.session.watchpoints[watch];
		var div = document.getElementById("dialog-debug-analyzer-watch-"+watch);
		div.parentNode.removeChild(div);
	}

	/**
	 * Deletes a breakpoint
	 * @private
	 * @param {String} line Line to remove breakpoint from
	 * @example $e_removeBreakpoint(12)
	 */
	function $e_removeBreakpoint(line) {
		delete $_eseecode.session.breakpoints[line];
		if ($_eseecode.modes.console[$_eseecode.modes.console[0]].div == "write") {
			ace.edit("console-write").session.clearBreakpoint(line-1);
		} else {
			var blockDiv = $e_searchBlockByPosition(document.getElementById("console-blocks").firstChild, line-1, 0).element;
			if (blockDiv) {
				blockDiv.style.boxShadow = "";
			}
		}
		var div = document.getElementById("dialog-debug-analyzer-line"+line);
		div.parentNode.removeChild(div);
	}

	/**
	 * Completes an asynchronous watchpoint addition event
	 * @private
	 * @param {Object} event Event
	 * @example $e_addWatchpointEventEnd()
	 */
	function $e_addWatchpointEventEnd(event) {
		if (event && event.which > 0 && event.which != 1) {
			// If its a mouse click attend only to left button
			return;
		}
		var watch = document.getElementById("watchpointAddInput").value;
		if (watch.match(/^[A-Za-z][A-Za-z_0-9]*$/)) {
			$e_addOrUpdateWatchpoint(watch);
			$e_msgBoxClose();
		} else {
			$e_msgBox(_("The variable name you entered is invalid!"));
		}
		event.stopPropagation();
	}

	/**
	 * Completes or cancels an asynchronous breakpoint addition event
	 * @private
	 * @param {Object} event Event. If unset and in blocks mode it will cancel the breakpoint event
	 * @example $e_addBreakpointEventEnd()
	 */
	function $e_addBreakpointEventEnd(event) {
		if (event && event.which > 0 && event.which != 1) {
			// If its a mouse click attend only to left button
			return;
		}
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
				line = $e_searchBlockPosition(document.getElementById("console-blocks").firstChild,target).count;
			}
		}
		if (line) {
			if ($e_isNumber($_eseecode.session.breakpointHandler,true)) {
				$e_updateBreakpoint($_eseecode.session.breakpointHandler,line)
			} else {
				$e_addOrUpdateBreakpoint(line);
			}
		}
		$e_addBreakpointEventCancel();
		event.stopPropagation();
	}

	/**
	 * Cancels an asynchronous breakpoint addition event
	 * @private
	 * @example $e_addBreakpointEventCancel()
	 */
	function $e_addBreakpointEventCancel(event) {
		if (event && event.which > 0 && event.which != 1) {
			// If its a mouse click attend only to left button
			return;
		}
		$_eseecode.session.breakpointHandler = false;
		var tabdiv = document.getElementById("console-tabdiv");
		tabdiv.style.webkitFilter = "";
		tabdiv.style.filter = "";
		tabdiv.removeEventListener("mousedown", $e_addBreakpointEventEnd, false);
		tabdiv.removeEventListener("touchstart", $e_addBreakpointEventEnd, false);
		document.body.removeEventListener("mousedown", $e_addBreakpointEventCancel, false);
		document.body.removeEventListener("touchstart", $e_addBreakpointEventCancel, false);
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
	 * Starts an asynchronous watchpoint addition event
	 * @private
	 * @example $e_addWatchpointEventStart()
	 */
	function $e_addWatchpointEventStart() {
		var msgDiv = document.createElement("div");
		var div = document.createElement("div");
		div.innerHTML = _("Enter the name of the variable you want to control")+":";
		msgDiv.appendChild(div);
		var input = document.createElement("input");
		input.id = "watchpointAddInput";
		msgDiv.appendChild(input);
		$e_msgBox(msgDiv, {acceptAction:$e_addWatchpointEventEnd,cancelAction:$e_msgBoxClose,focus:"watchpointAddInput"});
	}

	/**
	 * Starts an asynchronous breakpoint addition event
	 * @private
	 * @param {String} [oldLine] Breakpoint handler. Use only when editting an existing breakpoint
	 * @example $e_addBreakpointEventStart()
	 */
	function $e_addBreakpointEventStart(oldLine) {
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
		tabdiv.addEventListener("mousedown", $e_addBreakpointEventEnd, false);
		tabdiv.addEventListener("touchstart", $e_addBreakpointEventEnd, false);
		document.body.addEventListener("mousedown", $e_addBreakpointEventCancel, false);
		document.body.addEventListener("touchstart", $e_addBreakpointEventCancel, false);
	}

	/**
	 * Synchronous part of a watchpoint addition
	 * @private
	 * @param {String} watch Variable to control
	 * @param {Boolean} [showChange] If true the text will display the old value too
	 * @param {Boolean} [pause] If true execution will not pause when reached
	 * @example $e_addOrUpdateWatchpoint("num")
	 */
	function $e_addOrUpdateWatchpoint(watch, showChange, pause) {
		if (!watch) {
			$e_addWatchpointEventStart();
		} else if (watch !== null) {
			let div = document.getElementById("dialog-debug-analyzer-watch-"+watch);
			if (!div) {
				if ($_eseecode.session.watchpoints[watch] === undefined) {
					$_eseecode.session.watchpoints[watch] = { value: undefined, oldValue: undefined, status: !!pause };
				}
				div = document.createElement("div");
				div.id = "dialog-debug-analyzer-watch-"+watch;
				div.className = "dialog-debug-analyzer-watch";
				var divAnalyzer = document.getElementById("dialog-debug-analyzer-watches");
				if (divAnalyzer.hasChildNodes()) {
					var child = divAnalyzer.firstChild;
					// Find the right alphabetical order place for the watchpoint
					while (child !== null) {
						var watchName = child.id.match(/^dialog-debug-analyzer-watch-([A-Za-z0-9]+)$/);
						if (watchName !== null) {
							watchName = watchName[1];
							if (watchName > watch) {
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
			var watchObject = $e_analyzeVariable($_eseecode.session.watchpoints[watch].value, $_eseecode.session.watchpoints[watch].oldValue);
			var watchText = "<input type=\"checkbox\" onchange=\"$e_toggleWatchpoint(\'"+watch+"\', this)\" "+($_eseecode.session.watchpoints[watch].status?"checked":"")+" />"+watch+": ";
			if (showChange) {
				watchText += watchObject.old.text+" <span style=\"font-size:smaller;\">["+watchObject.old.type+"]</span>"+" → "+watchObject.new.text+" <span style=\"font-size:smaller;\">["+watchObject.new.type+"]</span>";
			} else {
				watchText += watchObject.new.text+" <span style=\"font-size:smaller;\">["+watchObject.new.type+"]</span>";
			}
			watchText += "<span class=\"dialog-debug-analyzer-watch-trash link\" onclick=\"$e_removeWatchpoint('"+watch+"')\">❌</span></div>";
			div.innerHTML = watchText;
		}
	}

	/**
	 * Synchronous part of a breakpoint addition
	 * @private
	 * @param {String} [line] Line in code to add the breakpoint to. If unset it calls for the user to set it up via the UI
	 * @example $e_addOrUpdateBreakpoint(12)
	 */
	function $e_addOrUpdateBreakpoint(line) {
		if (!line) {
			$e_addBreakpointEventStart();
		} else if (!document.getElementById("dialog-debug-analyzer-line"+line)) {
			if ($_eseecode.session.breakpoints[line] === undefined) {
				$_eseecode.session.breakpoints[line] = { status: true, count: 0};
			}
			var div = document.createElement("div");
			div.id = "dialog-debug-analyzer-line"+line;
			div.className = "dialog-debug-analyzer-breakpoint";
			div.innerHTML = "<input type=\"checkbox\" onchange=\"$e_toggleBreakpoint("+line+", this)\" "+($_eseecode.session.breakpoints[line].status?"checked":"")+" /><span class=\"link\" onclick=\"$e_updateBreakpoint("+line+")\" onmouseover=\"$e_highlight("+line+",'breakpoint')\" onmouseout=\"$e_unhighlight()\">"+_("Line")+" "+line+"</span>: <span id=\"dialog-debug-analyzer-line"+line+"-count\">"+_("Count")+": "+$_eseecode.session.breakpoints[line].count+"</span><span class=\"dialog-debug-analyzer-breakpoint-trash link\" onclick=\"$e_removeBreakpoint("+line+")\">❌</span><br /><div id=\"dialog-debug-analyzer-line"+line+"-watches\"></div>";
			var divAnalyzer = document.getElementById("dialog-debug-analyzer-breakpoints");
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
			if ($_eseecode.session.breakpoints[line].status) {
				if ($_eseecode.modes.console[$_eseecode.modes.console[0]].div == "write") {
					ace.edit("console-write").session.setBreakpoint(line-1,"ace-breakpoint");
				} else {
					var consoleDiv = document.getElementById("console-blocks");
					var div = $e_searchBlockByPosition(consoleDiv.firstChild,line,1).element;
					if (div && div.id != "console-blocks-tip") {
						div.style.boxShadow = "5px 5px 5px #FF0000";
					}
				}
			}
		}
	}

	/**
	 * Edit breakpoint
	 * @private
	 * @param {String} oldLine Line where the breakpoint was
	 * @param {String} [line] Line where the breakpoint will be. If unset just add the breakpoint
	 * @example $e_updateBreakpoint(12, 17)
	 */
	function $e_updateBreakpoint(oldLine, line) {
		if (!line) {
			$e_addBreakpointEventStart(oldLine);
		} else {
			if (oldLine != line) {
				if ($_eseecode.session.breakpoints[line]) {
					return;
				}
				$_eseecode.session.breakpoints[line] = $_eseecode.session.breakpoints[oldLine];
				delete $_eseecode.session.breakpoints[oldLine];
				if ($_eseecode.modes.console[$_eseecode.modes.console[0]].div == "write") {
					if ($_eseecode.session.breakpoints[line].status) {
						ace.edit("console-write").session.setBreakpoint(line-1,"ace-breakpoint");
					}
					ace.edit("console-write").session.clearBreakpoint(oldLine-1);
				} else {
					var consoleDiv = document.getElementById("console-blocks");
					var div;
					if ($_eseecode.session.breakpoints[line].status) {
						div = $e_searchBlockByPosition(consoleDiv.firstChild,line,1).element;
						if (div && div.id != "console-blocks-tip") {
							div.style.boxShadow = "5px 5px 5px #FF0000";
						}
					}
					div = $e_searchBlockByPosition(consoleDiv.firstChild,oldLine,1).element;
					if (div && div.id != "console-blocks-tip") {
						div.style.boxShadow = "";
					}
				}
				var div = document.getElementById("dialog-debug-analyzer-line"+oldLine);
				if (div) {
					div.parentNode.removeChild(div);
				}
			}
			$e_addOrUpdateBreakpoint(line);
		}
	}

	/**
	 * Resets the layers list in debug window
	 * @private
	 * @example $e_resetDebugLayers()
	 */
	function $e_resetDebugLayers() {
		var list = $e_debugLayers();
		var layersText = ""
		for (var i=list.length-1;i>=0;i--) {
			var id = list[i].name;
			var name = id;
			// Only set name to the layer if it has been explicitly set
			if (typeof id == "string" && id.indexOf("canvas-") === 0) {
				name = list[i].position;
			}
			var checked = "";
			if (document.getElementById("canvas-div-"+id).style.display != "none") {
				checked = " checked";
			}
			layersText += "<div><span id=\"layer-position-"+id+"\" class=\"dialog-debug-layers-position\">"+list[i].position+": </span><label for=\"toggle-canvas-"+id+"\">"+_("Toggle layer")+" "+id+"</label><input id=\"toggle-canvas-"+id+"\" type=\"checkbox\" title=\""+_("Toggle layer")+" "+id+"\""+checked+" /"+"><span id=\"link-canvas-"+id+"\" class=\"link\">";
			var showName = _("Layer")+" "+name;
			if ($_eseecode.currentCanvas.name == id) {
				layersText += "<b>"+showName+"</b>";
			} else {
				layersText += showName;
			}
			layersText += "</span></div>\n";
		}
		document.getElementById("dialog-debug-layers").innerHTML = layersText;
		document.getElementById("dialog-debug-layers").addEventListener('mouseout', $e_unhighlightCanvas, false);
		for (var i=0;i<list.length;i++) {
			document.getElementById("link-canvas-"+list[i].name).addEventListener('mouseover', (function(id){return function (evt) {$e_highlightCanvas(id)}})(list[i].name), false);
			document.getElementById("link-canvas-"+list[i].name).addEventListener('click', (function(id){return function (evt) {$e_switchCanvas(id);$e_resetDebug()}})(list[i].name), false);
			document.getElementById("toggle-canvas-"+list[i].name).addEventListener('click', (function(id){return function (evt) {$e_toggleCanvas(id)}})(list[i].name), false);
		}
	}

	/**
	 * Resets the debug window
	 * @private
	 * @param {Boolean} [clearBreakAndWatchpoints] If true breakpoints and watchpoints will be cleared
	 * @example $e_resetDebug()
	 */
	function $e_resetDebug(clearBreakAndWatchpoints) {
		// Clean old debug info and create new debug info
		$e_resetDebugLayers();
		document.getElementById("dialog-debug-analyzer-toolbar").innerHTML = "<div><input id=\"dialog-debug-breakpoint-add\" type=\"button\" value=\"+ "+_("Breakpoint")+"\" onclick=\"$e_addOrUpdateBreakpoint()\" /><input id=\"dialog-debug-watchpoint-add\" type=\"button\" value=\"+ "+_("Watch")+"\" onclick=\"$e_addOrUpdateWatchpoint()\" />";
		if (clearBreakAndWatchpoints) {
			document.getElementById("dialog-debug-analyzer-breakpoints").innerHTML = "";
			document.getElementById("dialog-debug-analyzer-watches").innerHTML = "";
		}
	}

	/**
	 * Resets the debug window
	 * @private
	 * @param {Boolean} [showChange] If true the text will display the old value too
	 * @example $e_updateDebugBreakAndWatchpoints()
	 */
	function $e_updateDebugBreakAndWatchpoints(showChange) {
		for (var breakpoint in $_eseecode.session.breakpoints) {
			$e_updateBreakpoint(breakpoint, breakpoint, false);
		}
		for (var watch in $_eseecode.session.watchpoints) {
			$e_addOrUpdateWatchpoint(watch, showChange && $_eseecode.execution.watchpointsChanged.includes(watch));
		}
	}

	/**
	 * Keeps track of the breakpoints in the Code view code. This function is to be called by Ace's change event
	 * @private
	 * @param {!Object} event Ace editor change event object
	 * @example editor.on("change",$e_updateWriteBreakpoints);
	 */
	function $e_updateWriteBreakpoints(event) {
		for (var breakpointLine in $_eseecode.session.breakpoints) {
			breakpointLine = parseInt(breakpointLine);
			if (event.data.action === "insertText") {
				if (event.data.range.start.row === breakpointLine-1 && event.data.range.start.row !== event.data.range.end.row) {
					// The breakpoint line has been split, update breakpoint
					if (!ace.edit("console-write").session.getLine(breakpointLine-1).replace(/\s/g, '').length) {
						// Only move breakpoint if we are moving the instruction line down, not if we are splitting it
						$e_updateBreakpoint(breakpointLine, breakpointLine + event.data.range.end.row - event.data.range.start.row);
					}
				} else if (event.data.range.start.row < breakpointLine-1 && event.data.range.start.row !== event.data.range.end.row) {
					// A line was added before the breakpoint, update breakpoint
					$e_updateBreakpoint(breakpointLine, breakpointLine + event.data.range.end.row - event.data.range.start.row);
				}
			} else if (event.data.action === "removeText" || event.data.action === "removeLines") {
				if (event.data.range.start.row === breakpointLine-1 && event.data.range.start.row !== event.data.range.end.row) {
					// The breakpoint line has been merged, update breakpoint
					$e_updateBreakpoint(breakpointLine, event.data.range.end.row);
				} else if (event.data.range.start.row < breakpointLine-1 && event.data.range.end.row > breakpointLine-1) {
					// Several lines where removed and this breakpoint was in the middle of those
					$e_removeBreakpoint(breakpointLine);
				} else if (event.data.range.start.row < breakpointLine-1 && event.data.range.start.row !== event.data.range.end.row) {
					// A line was removed before the breakpoint, update breakpoint
					$e_updateBreakpoint(breakpointLine, breakpointLine - (event.data.range.end.row - event.data.range.start.row));
				}
			}
		}
	}

	/**
	 * Keeps track of the breakpoints in the blocks code. This function is to be called by $e_addBlock() and $e_deleteBlock()
	 * @private
	 * @param {!Object} div Div of a block
	 * @example $e_updateBlocksBreakpoints(blockDiv);
	 */
	function $e_updateBlocksBreakpoints(blockDiv, action) {
		var consoleDiv = document.getElementById("console-blocks");
		for (var breakpointLine in $_eseecode.session.breakpoints) {
			breakpointLine = parseInt(breakpointLine);
			var line = $e_searchBlockPosition(consoleDiv.firstChild, blockDiv).count;
			if (line <= breakpointLine) {
				if (action === "addBlock") {
					$e_updateBreakpoint(breakpointLine, breakpointLine + 1);
				} else if (action === "deleteBlock") {
					$e_updateBreakpoint(breakpointLine, breakpointLine - 1);
				}
			}
		}
	}

	/**
	 * Initializes/Resets the watchpoints array in $_eseecode.session.watchpoints
	 * @private
	 * @param {Boolean} full Whether to completely delete the list of watchpoints (true) or just its stored values (false)
	 * @example $e_resetWatchpoints()
	 */
	function $e_resetWatchpoints(full) {
		if (full) {
			$_eseecode.session.watchpoints = {};
			$e_setInitialBreakAndWatchpoints();
		} else {
			for (var watch in $_eseecode.session.watchpoints) {
				$_eseecode.session.watchpoints[watch].oldValue = undefined;
				$_eseecode.session.watchpoints[watch].value = undefined;
			}
		}
	}

	/**
	 * Initializes/Resets the breakpoints array in $_eseecode.session.breakpoints
	 * @private
	 * @example $e_resetBreakpoints()
	 */
	function $e_resetBreakpoints() {
		ace.edit("console-write").session.clearBreakpoints();
		for (var breakpoint in $_eseecode.session.breakpoints) {
			var consoleDiv = document.getElementById("console-blocks");
			var div = $e_searchBlockByPosition(consoleDiv.firstChild,breakpoint,1).element;
			if (div && div.id != "console-blocks-tip") {
				div.style.boxShadow = "";
			}
		}
		$_eseecode.session.breakpoints = {};
	}

	/**
	 * Initializes the breakpoints and watches
	 * @private
	 * @example $e_setInitialBreakAndWatchpoints()
	 */
	function $e_setInitialBreakAndWatchpoints() {
		const list = $_eseecode.execution.breakpoints.map(v => [ v, true ]).concat($_eseecode.execution.observers.map(v => [ v, false ]));
                for (var descr of list) {
			let [ breakpoint, pause ] = descr;
                        if ($e_isNumber(breakpoint) && breakpoint >= 1 && pause === true) {
                                $e_addOrUpdateBreakpoint(breakpoint);
                        } else if (typeof breakpoint == "string" && !$e_isNumber(parseInt(breakpoint))) {
                                $e_addOrUpdateWatchpoint(breakpoint, false, pause);
                        } else {
                                console.error("Invalid breakpoint", breakpoint);
                        }
                }
	}

	/**
	 * Select All/None of the debug layer checkboxes
	 * @private
	 * @param {!Object} checkbox Checkbox element
	 * @example $e_debugSelectAllNoneLayers(checkbox)
	 */
	function $e_debugSelectAllNoneLayers(checkbox) {
		const visibility = checkbox.checked;
		document.querySelectorAll("#dialog-debug-layers input[type=checkbox]").forEach((el, i) => {
			el.checked = visibility;
			$e_toggleCanvas(i, visibility);
		});
	}

	/**
	 * Shows only a layer (hides the others)
	 * @private
	 * @param {Number} id Layer id
	 * @example $e_highlightCanvas(3)
	 */
	function $e_highlightCanvas(id) {
		$e_unhighlightCanvas(); // Make sure we never have more than one highlighted canvas
		// Since we destroy it and create it again every time it should always be on top of the canvas stack
		var canvasSize = $_eseecode.whiteboard.offsetWidth;
		var div = document.createElement("div");
		div.id = "canvas-div-highlight";
		div.className = "canvas-div";
		div.style.left = $_eseecode.whiteboard.offsetLeft;
		div.style.top = $_eseecode.whiteboard.offsetTop;
		div.style.width = canvasSize+"px";
		div.style.height = canvasSize+"px";
		div.style.zIndex = Number($_eseecode.canvasArray["guide"].div.style.zIndex)+1;
		div.style.backgroundColor = "#FFFFFF";
		var canvas = document.createElement("canvas");
		canvas.className = "canvas";
		canvas.width = canvasSize;
		canvas.height = canvasSize;
		var context = canvas.getContext("2d");
		if ($_eseecode.ui.gridVisible) {
			context.drawImage($_eseecode.canvasArray["grid"].canvas, 0, 0);
		}
		var targetCanvas = $e_getLayer(id);
		context.drawImage(targetCanvas.canvas, 0, 0);
		$e_drawDebugGuide(context, targetCanvas.guide, id);
		div.appendChild(canvas);
		$_eseecode.whiteboard.appendChild(div);
	}

	/**
	 * Resets the layers visibility back to normal after a highlightCanvas() call
	 * @private
	 * @example $e_unhighlightCanvas()
	 */
	function $e_unhighlightCanvas() {
		var div = document.getElementById("canvas-div-highlight");
		if (div) {
			div.parentNode.removeChild(div);
		}
	}

	/**
	 * Reset execution tracing platform
	 * @private
	 * @param {String} [type] Type of trace to reset its iterator. If none is passed all the platform is reset
	 * @example $e_executionTraceReset("randomNumber")
	 */
	function $e_executionTraceReset(type) {
		if (type === undefined) {
			$_eseecode.execution.trace = [];
		} else {
			if (!$_eseecode.execution.trace[type]) {
				$_eseecode.execution.trace[type] = [];
			}
			$_eseecode.execution.trace[type][0] = 1;
		}
	}
	
	/**
	 * Push a value into the trace platform
	 * @private
	 * @param {String} type Type of trace to modify
	 * @param {String} value Value to add to the trace
	 * @example $e_executionTracePush("randomNumber", 213)
	 */
	function $e_executionTracePush(type, value) {
		var traceType = $_eseecode.execution.trace[type];
		if (!traceType) {
			$e_executionTraceReset(type);
			traceType = $_eseecode.execution.trace[type];
		}
		traceType.push(value);
	}
	
	/**
	 * Get and remove a value from the platform
	 * @private
	 * @param {String} type Type of trace to reset its iterator. If none is passed all the platform is reset
	 * @return Latest value stored
	 * @example $e_executionTracePop("randomNumber")
	 */
	function $e_executionTracePop(type) {
		var traceType = $_eseecode.execution.trace[type];
		var value = undefined;
		if (traceType.length > 1) {
			value = traceType.pop();
		}
		traceType[0]--;
		return value;
	}
	
	/**
	 * Analyzes the type of a variable
	 * @private
	 * @param {*} value Value to analyze
	 * @param {*} oldValue Value to analyze
	 * @return {Object<type:String,text:String>} Type of object and its value as in text if possible
	 * @example $e_analyzeVariable(num)
	 */
	function $e_analyzeVariable(value, oldValue) {
		function analyzeValue(retValue) {
			if (retValue.type === "undefined") {
				retValue.text = "";
			} else if (retValue.type === "object") {
				if (value === null) {
					retValue.text = "null";
				} else if (Array.isArray(value)) {
					retValue.type = "array";
				}
			} else if (retValue.type === "number") {
				if (value === Infinity) {
					retValue.text = "Infinity";
				} else if (value === NaN) {
					retValue.text = "NaN";
				}
			} else if (retValue.type === "function") {
				retValue.text = "";
			}
			return retValue;
		}
		let retNewValue = analyzeValue({
			type: typeof value,
			text: value
		});
		let retOldValue = analyzeValue({
			type: typeof oldValue,
			text: oldValue
		});
		return { old: retOldValue, new: retNewValue };
	}
	
	/**
	 * Updates the debug UI with watchpoints' status
	 * @private
	 * @param {Number} lineNumber Line of code being executed
	 * @param {Array<String>} watchpointsChanged List of watchpoints that have changed value
	 * @param {Boolean} [noDialog] If true, dialog UI is not switched to debug
	 * @param {Boolean} [noPause] If true, it will not pause execution
	 * @return {Object<type:String,text:String>} Type of object and its value as in text if possible
	 * @example $e_debugBreakpointReached(115, [ "firstname" ])
	 */
	async function $e_debugBreakpointReached(lineNumber, watchpointsChanged, noDialog, noPause) {
		$e_highlight(lineNumber);
                if (!noDialog && !noPause) $e_switchDialogMode("debug");
                if (watchpointsChanged) $e_highlightWatchpoint(watchpointsChanged);
		if (!noPause) {
			$e_updateDebugBreakAndWatchpoints(true);
			$e_updateExecutionStatus("breakpoint");
                	await new Promise(r => {
				setInterval(() => {
					if ($_eseecode.session.kill || $_eseecode.session.running != "breakpoint") r();
				}, 1);
			});
			$e_updateExecutionStatus(true);
		}
		$e_updateDebugBreakAndWatchpoints(false);
		if ($_eseecode.session.kill) throw "executionKilled";
	}

