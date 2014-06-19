	/* getCanvas(id): Returns a canvas in the whiteboard
		id: id number (optional, otherwise creates a new id)
		@returns the canvas object
	   If needed, canvas is created overlapping exactly the whiteboard div element
	   The created canvas can be accessed via canvasArray[id]
	*/
	function getCanvas(id) {
		if (typeof id === "undefined") {
			id = canvasArray.length;
		}
		if (!canvasArray[id]) {
			var canvasSize = whiteboard.offsetWidth;
			var div = document.createElement("div");
			div.id = "canvas-div-"+id;
			div.className = "canvas-div";
			div.style.left = whiteboard.offsetLeft;
			div.style.top = whiteboard.offsetTop;
			div.style.width = canvasSize+"px";
			div.style.height = canvasSize+"px";
			var canvasTopLayer = (canvasArray[0])? canvasArray[0].layerUnder : null;
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
			canvasArray[id] = {
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
			canvasArray[id].context.lineWidth = canvasArray[id].style.size;
			canvasArray[id].context.fillStyle = canvasArray[id].style.color;
			canvasArray[id].context.strokeStyle = canvasArray[id].style.color;
			canvasArray[id].context.strokeStyle = canvasArray[id].style.color;
			var font = "";
			if (canvasArray[id].style.italic) {
				font += "italic ";
			}
			if (canvasArray[id].style.bold) {
				font += "bold ";
			}
			font += (canvasArray[id].style.size+setup.defaultFontSize)+"px ";
			font += canvasArray[id].style.font;
			canvasArray[id].context.font = font;
			canvasArray[id].context.globalAlpha = canvasArray[id].style.alpha;
			if (id > 0) { // canvas-0 (grid) doesn't count as top
				if (canvasTopLayer) {
					canvasTopLayer.layerOver = canvasArray[id];
				}
				canvasArray[0].layerUnder = canvasArray[id]; // newest canvas is always on top
			}
			div.appendChild(canvas);
			whiteboard.appendChild(div);
		}
		return canvasArray[id];
	}

	function getWindow(id) {
		if (typeof id === "undefined") {
			id = windowsArray.length;
		}
		if (!windowsArray[id]) {
			var newWindow = document.createElement("div");
			newWindow.id = "window-"+id;
			newWindow.style.left = dialogWindow.offsetLeft;
			newWindow.style.top = dialogWindow.offsetTop;
			newWindow.style.display = "none";
			newWindow.className = "dialog-window";
			windowsArray[id] = newWindow;
			dialogWindow.appendChild(newWindow);
		}
		return windowsArray[id];
	}

	/* removeCanvas(id): Deletes a canvas from the whiteboard
		id: id number (optional, otherwise creates a new one)
		@returns the id number if the canvas was deleted, otherwise -1
	*/
	function removeCanvas(id) {
		if (canvasArray[id]) {
			whiteboard.removeChild(canvasArray[id].div);
			delete canvasArray[id];
		}
	}

	function switchCanvas(id) {
		currentCanvas = getCanvas(id);
		resetTurtle(); // switch to the apropiate turtle
		return currentCanvas;
	}

	function windowSwitch(id) {
		if (id !== null) { // 0 is a valid id
			currentWindow = getWindow(id);
		}
		// even if we did getWindow() still do the following, since it fixes rendering issues
		for (var i=0;i<windowsArray.length;i++) {
			if (windowsArray[i]) {
				windowsArray[i].style.display = "none";
			}
		}
		currentWindow.style.display = "block";
	}

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function downloadCanvas(link) {
		var canvas = document.createElement('canvas');
		canvas.width = 400;
		canvas.height = 400;
		var ctx = canvas.getContext("2d");
		var layer = canvasArray[0];
		for (var i=0; layer; i++) {
			if (layer != canvasArray[0]) {
				ctx.drawImage(layer.canvas,0,0);
			}
			layer = layer.layerUnder;
		}
		link.href = canvas.toDataURL();
		var d = new Date();
		link.download = "canvas-"+d.getTime()+".png";
	}

	function clearCanvas(id) {
		var canvasSize = whiteboard.offsetWidth;
		var ctx, canvas;
		if (!canvasArray[id]) {
			return;
		}
		if (typeof id === "undefined") {
			ctx = currentCanvas.context;
			canvas = currentCanvas.canvas;
		} else {
			ctx = canvasArray[id].context;
			canvas = canvasArray[id].canvas;
		}
		ctx.clearRect(0,0,canvasSize,canvasSize);
		canvas.width = canvasSize;
	}

	function resizeConsole(restore) {
		var mainWidth = document.getElementById('eseecode').clientWidth;
		var whiteboardWidth = whiteboard.offsetWidth;
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
		if (typeof(ace) !== 'undefined') {
			ace.edit("console-write").resize();
		}
	}

	function msgBox(text, actionAccept, actionCancel) {
		var mainBlock = document.getElementById("eseecode");
		var div = document.createElement("div");
		div.id = "msgBoxWrapper";
		var innerDiv = document.createElement("div");
		innerDiv.id = "msgBox";
		innerDiv.innerHTML = text;
		innerDiv.innerHTML += "<br /"+"><br /"+">";
		innerDiv.innerHTML += "<div align=\"center\" style=\"width: 100%\">";
		if (actionCancel) {
			innerDiv.innerHTML += "<input id=\"msgBoxCancel\" type=\"button\" value=\"Cancel\" /"+">";
		}
		innerDiv.innerHTML += "<input id=\"msgBoxAccept\" type=\"button\" value=\"Accept\" autofocus /"+">";
		innerDiv.innerHTML += "</div>";
		div.appendChild(innerDiv);
		document.getElementById("eseecode").appendChild(div);
		if (actionCancel) {
			document.getElementById("msgBoxCancel").addEventListener(actionCancel);
		}
		if (actionAccept) {
			document.getElementById("msgBoxAccept").addEventListener(actionAccept);
		}
		var closeMsgBox = (function() {
			document.getElementById('eseecode').removeChild(document.getElementById('msgBoxWrapper');
		})
		if (actionCancel) {
			document.getElementById("msgBoxCancel").addEventListener(closeMsgBox);
		}
		document.getElementById("msgBoxAccept").addEventListener(closeMsgBox);
	}

	function switchConsoleMode(id) {
		var oldMode = modes.console[0];
		if (!isNumber(id)) {
			for (var i=1; i<modes.dialog.length; i++) {
				if (modes.dialog[i].name == id) {
					id = i;
					break;
				}
			}
		}
		if (id == oldMode) {
			return; // nothing to do
		}
		var program;
		if (modes.console[oldMode].div == "write" && modes.console[id].div == "blocks") {
			var code;
			if (typeof(ace) !== 'undefined') {
				code = ace.edit("console-write").getValue();
			} else {
				code = document.getElementById("console-write").value;
			}
			if (eseecodeLanguage) {
				try {
					program = eseecodeLanguage.parse(code);
				} catch (exception) {
					msgBox("Can't convert the code to blocks. There is the following problem in your code:\n\n"+exception.name + ":  " + exception.message);
					var lineNumber = exception.message.match(/. (i|o)n line ([0-9]+)/)[2];
					highlight(lineNumber+","+lineNumber,"ace_stack");
					return;
				}
			} else {
				if (!confirm("You don't have the eseecodeLanguage loaded. If you still want to switch to "+modes.console[id].name+" you won't be able to go back to any blocks mode.\nAre you sure you want to switch to "+modes.console[id].name+"?")) {
					return;
				}
			}
		}
		modes.console[0] = id;
		for (var i=1;i<modes.console.length;i++) {
			modes.console[i].tab.className = "tab";
			document.getElementById("console-"+modes.console[i].div).style.display = "none";
		}
		document.getElementById("console-"+modes.console[id].div).style.display = "block";
		var level = modes.console[id].name;
		if (oldMode > 0) { // if we are not booting the app
			if (modes.console[oldMode].div == "blocks") {
				if (modes.console[id].div == "write") {
					if (document.getElementById("console-blocks").firstChild.id == "console-blocks-tip") {
						resetWriteConsole("");
					} else {
						blocks2write();
					}
				} else if (modes.console[id].div == "blocks") {
					blocks2blocks(level);
				}
			} else if (modes.console[oldMode].div == "write") {
				if (modes.console[id].div == "blocks") {
					var consoleDiv = document.getElementById("console-blocks");
					if (changesInCode && changesInCode != "blocks") {
						// Only reset the blocks console if changes were made in the code
						resetUndo();
						resetBlocksConsole(consoleDiv);
						program.makeBlocks(level,consoleDiv);
					}
				}
			}
		}
		if (modes.console[id].name == "level1") { 
			document.getElementById("execute-time-buttons").style.display = "none";
			
		} else {
			document.getElementById("execute-time-buttons").style.display = "block";
		}
		if (modes.console[id].tab.classList) {
			modes.console[id].tab.classList.add("tab-active");
		} else {
			modes.console[id].tab.className += " tab-active";
		}
		switchDialogMode(id);
		// if write mode, focus in the textarea. Do this after switchDialogMode() in case the dialog tries to steal focus
		if (modes.console[id].div == "write") {
			if (typeof(ace) !== 'undefined') {
				ace.edit("console-write").focus();
			} else {
				document.getElementById("console-"+modes.console[id].div).focus();
			}
		} else {
			checkAndAddConsoleTip(); // force to recheck since until now "console-blocks" div had display:none so height:0px and so the tip couldn't define to max height
		}
		if (modes.console[oldMode].div != modes.console[id].div && changesInCode) {
			changesInCode = false;
		}
	}

	function switchDialogMode(id) {
		if (!isNumber(id)) {
			for (var i=1; i<modes.dialog.length; i++) {
				if (modes.dialog[i].name == id) {
					id = i;
					break;
				}
			}
		}
		if (id == modes.dialog[0]) {
			return; // nothing to do
		}
		for (i=1;i<modes.dialog.length;i++) {
			modes.dialog[i].element.style.display = "none";
			modes.dialog[i].tab.className = "tab";
		}
		// window doesn't need inicialization
		modes.dialog[id].element.style.display = "block";
		if (modes.dialog[id].tab.classList) {
			modes.dialog[id].tab.classList.add("tab-active");
		} else {
			modes.dialog[id].tab.className += " tab-active";
		}
		if (modes.dialog[id].div == "blocks") {
			initDialogBlocks(modes.dialog[id].name, modes.dialog[id].element);
		} else if (modes.dialog[id].div == "write") {
			initDialogWrite(modes.dialog[id].name, modes.dialog[id].element);
		}
		if (modes.dialog[id].name == "debug") {
			resetDebug();
			document.getElementById("dialog-command").style.display = "block";
			document.getElementById("dialog-command-cmd").focus();
		} else {
			document.getElementById("dialog-command").style.display = "none";
		}
		modes.dialog[0] = id;
	}

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
		height = div.clientHeight;
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
		div = document.getElementById("dialog-command");
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
	}

	function readableText(backgroundColor) {
		var color = backgroundColor.substring(1);
		var colorR = parseInt(color.substring(0,2), 16);
		var colorG = parseInt(color.substring(2,4), 16);
		var colorB = parseInt(color.substring(4), 16);
		var darkness = (100*colorR/256 + 100*colorG/256 + 100*colorB/256)/3;
		if (darkness < 30) {
			color = "#FFFFFF";
		} else {
			color = "#000000";
		}
		return color;
	}

	function initTurtle() {
		var canvasSize = whiteboard.offsetWidth;
		var name = "turtle";
		var div = document.createElement("div");
		div.id = "canvas-div-"+name;
		div.className = "canvas-div";
		div.style.left = whiteboard.offsetLeft;
		div.style.top = whiteboard.offsetTop;
		div.style.width = canvasSize+"px";
		div.style.height = canvasSize+"px";
		div.style.zIndex = 9999;
		var canvas = document.createElement("canvas");
		canvas.id = "canvas-turtle";
		canvas.className = "canvas";
		canvas.width = canvasSize;
		canvas.height = canvasSize;
		div.appendChild(canvas);
		whiteboard.appendChild(div);
		canvasArray[name] = {name: name, canvas: canvas, div: div, visible: true};
	}

	function toggleTurtle() {
		var turtleCanvas = canvasArray["turtle"];
		if (turtleCanvas.visible) {
			turtleCanvas.visible = false;
			turtleCanvas.div.style.display = "none";
		} else {
			turtleCanvas.visible = true;
			turtleCanvas.div.style.display = "block";
		}
	}

	function resetTurtle(id, ctx) {
		var canvasSize = whiteboard.offsetWidth;
		if (id === undefined) {
			id = currentCanvas.name;
		}
		var targetCanvas = canvasArray[id];
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
			var turtleCanvas = canvasArray["turtle"];
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

	function resetDebug() {
		var debugDiv = document.getElementById("dialog-debug");
		// Clean old debug info
		// Create new debug info
		var list = debugLayers();
		var layersText = "<div id=\"debug-title\">Layers:</div>\n";
		layersText += "<div id=\"debug-layers\">\n";
		for (var i=0;i<list.length;i++) {
			var id = list[i];
			var checked = "";
			if (document.getElementById("canvas-div-"+id).style.display != "none") {
				checked = " checked";
			}
			layersText += "<div><label for=\"toggle-canvas-"+id+"\">Toggle canvas "+id+"</label><input id=\"toggle-canvas-"+id+"\" type=\"checkbox\" title=\"Toggle canvas "+id+"\""+checked+" /"+"><a id=\"link-canvas-"+id+"\" href=\"#\">";
			var showName = "Canvas "+list[i];
			if (currentCanvas.name == list[i]) {
				layersText += "<b>"+showName+"</b>";
			} else {
				layersText += showName;
			}
			layersText += "</a></div>\n";
		}
		layersText += "</div>\n";
		layersText += "<div id=\"debug-help\">Here you can:<ul><li>analyze the order of the layers (they are listed from top to bottom)</li><li>hover over a canvas name to view that canvas alone</li><li>toggle each canvas' visibility</li><li>click a canvas to set it as current canvas</li><li>run a command</li></ul></div>";
		debugDiv.innerHTML = layersText;
		document.getElementById("debug-layers").addEventListener('mouseout', unhighlightCanvas, false);
		for (var i=0;i<list.length;i++) {
			document.getElementById("link-canvas-"+list[i]).addEventListener('mouseover', (function(id){return function (evt) {highlightCanvas(id)}})(list[i]), false);
			document.getElementById("link-canvas-"+list[i]).addEventListener('click', (function(id){return function (evt) {switchCanvas(id);resetDebug()}})(list[i]), false);
			document.getElementById("toggle-canvas-"+list[i]).addEventListener('click', (function(id){return function (evt) {toggleCanvas(id)}})(list[i]), false);
		}
	}

	function debugLayers() {
		var list = new Array();
		var listReverse = new Array();
		var layer = canvasArray[0].layerUnder;
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
			var ret = new Array();
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

	function toggleCanvas(id) {
		var div = canvasArray[id].div;
		if (div.style.display == "none") {
			div.style.display = "block";
		} else {
			div.style.display = "none";
		}
	}

	function highlightCanvas(id) {
		unhighlightCanvas(); // Make sure we never have more than one highlighted canvas
		// Since we destroy it and create it again every time it should always be on top of the canvas stack
		var canvasSize = whiteboard.offsetWidth;
		var div = document.createElement("div");
		div.id = "canvas-div-highlight";
		div.className = "canvas-div";
		div.style.left = whiteboard.offsetLeft;
		div.style.top = whiteboard.offsetTop;
		div.style.width = canvasSize+"px";
		div.style.height = canvasSize+"px";
		div.style.zIndex = Number(canvasArray["turtle"].div.style.zIndex)+1;
		div.style.backgroundColor = "#FFFFFF";
		var canvas = document.createElement("canvas");
		canvas.className = "canvas";
		canvas.width = canvasSize;
		canvas.height = canvasSize;
		var context = canvas.getContext("2d");
		var targetCanvas = canvasArray[id];
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
		whiteboard.appendChild(div);
	}

	function unhighlightCanvas() {
		var div = document.getElementById("canvas-div-highlight");
		if (div) {
			div.parentNode.removeChild(div);
		}
	}

	function resetGrid() {
		var canvasSize = window.getComputedStyle(document.querySelector('#whiteboard')).getPropertyValue('width').replace("px","");
		var ctx = canvasArray[0].context;
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

	// If key === true it just checks if the counter is over
	// If forceIncrement === true increment the counter (used by iterations and functions to prevent infinite loops)
	function checkProgramCounter(key) {
		if (key === undefined) {
			key = Math.random()*1000000000;
		}
		// first we check the programCounterLock because even if the execution is unlimited we still want to count the amount of instructions executed
		if (!programCounterLock && key !== true) { // if the programCounter is locked, skip. This is used to avoid a single instruction advancing several times in the prograCounter because it uses other instructions. Otherwise lock it
			programCounterLock = key; // lock the programCounter with a unique key so if this instruction uses other instructions these don't increment the counter
		}
		var executionTime = new Date().getTime();
		if (executionTime >= executionEndLimit) {
			return false;
		}
		if (!limitProgramCounter) {
			// we want to run the whole code at a time
			return key;
		} else if (limitProgramCounter === true) {
			// we want to stop the execution immediately
			return false;
		}
		if (programCounter >= limitProgramCounter) {
			// we arrived at the step where we want to stop
			return false;
		}
		return key;
	}

	function freeProgramCounterLock(key) {
		if (key == programCounterLock)	{ // check that it is the very same function that is trying to free the programCounter
			programCounterLock = false;
			programCounter++; // we have finished running the instruction, so increment the counter
		}
	}

	function initProgramCounter(resetStep) {
		programCounterLock = false;
		programCounter = 0;
		unhighlight();
		if (resetStep || limitProgramCounter === true) {
			limitProgramCounter = 0;
		} else {
			var step = parseInt(document.getElementById("setup-execute-step").value);
			if (step < 1) {
				step = 1;
				document.getElementById("setup-execute-step").value = step;			
			}
			limitProgramCounter = limitProgramCounter + step;
		}
	}

	function printEvalError(err) {
		var lineNumber = 0;
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
		if (modes.console[modes.console[0]].div == "write" && lineNumber && lineNumber > 0) {
			highlight(lineNumber+","+lineNumber,"ace_stack");
		}
		var message;
		if (err.name) {
			message = err.name+(lineNumber?" in line "+lineNumber:"")+": "+err.message;
		} else if (err.stack) {
			message = err.stack;
		} else {
			message = "Runtime error!";
		}
		if (message) {
			msgBox(message);
		}
	}
	
	/* execute(): Runs code
	*/
	function execute(forceNoStep, code) {
		programCounter = false; // Abort previous execution
		var withStep;
		if (forceNoStep) {
			withStep = false;
		} else {
			withStep = document.getElementById("setup-execute-stepped").checked;
		}
		if (code) {
			withStep = false; // Code from events run without stepping
			initProgramCounter(true);
		} else {
			unhighlight();
			var mode = modes.console[modes.console[0]].div;
			var writeCode;
			if (mode == "blocks") {
				var consoleDiv = document.getElementById("console-blocks");
				code = blocks2code(consoleDiv.firstChild, true);
			} else if (mode == "write") {
				if (typeof(ace) !== 'undefined') {
					writeCode = ace.edit("console-write").getValue();
				} else {
					writeCode = document.getElementById("console-write").value;
				}
				// Check and clean code before parsing
				if (eseecodeLanguage) {
					try {
						var program = eseecodeLanguage.parse(writeCode);
						var level;
						for (var i=0;i<modes.console.length;i++) {
							if (modes.console[i].div == "write") {
								level = modes.console[i].name;
							}
						}
						writeCode = program.makeWrite("level4","","\t");
					} catch (exception) {
						msgBox("Can't parse the code. There is the following problem in your code:\n\n"+exception.name + ":  " + exception.message);
						var lineNumber = exception.message.match(/. (i|o)n line ([0-9]+)/)[2];
						highlight(lineNumber+","+lineNumber,"ace_stack");
						return;
					}
					resetWriteConsole(writeCode);
				}
				code = write2code(writeCode, true);
			}
			resetCanvas(!withStep); // This also does the programCounter initialization
		}
		code = code2run(code);
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.id = "executeScript";
		code = /* "\"use strict\";\n\ */ "\
			try { "+code+"\nexecuteSuccessful = true;\
			} catch(err) {\n\
				printEvalError(err);\
			}";
		script.innerHTML = code;
		var oldScript = document.getElementById("executeScript");
		if (oldScript) {
			oldScript.parentNode.removeChild(oldScript);
		}
		executeSuccessful = false;
		var executionStart = new Date().getTime();
		var time = document.getElementById("setup-execute-time").value;
		if (time <= 0) {
			time = 3;
			document.getElementById("setup-execute-time").value = time;
		}
		executionEndLimit = executionStart+time*1000;
		document.getElementById("eseecode").appendChild(script);
		var executionEnd = new Date().getTime();
		if (executionEnd >= executionEndLimit && !executeSuccessful) {
			// If it was paused because of an alert we don't want to show this message, so check executeSuccessful
			msgBox("The execution is being aborted because it is taking too long.\nIf you want to allow it to run longer increase the value in 'Stop execution after'");
		}
		var executionTime = (executionEnd-executionStart)/1000;
		if (withStep) { // only highlight if we are running in step execution mode
			highlight(highlightReference);
		}
		document.getElementById("execute-notes").innerHTML = "Instructions executed: "+programCounter+" ("+executionTime+" secs)";
		lastCode = code;
		// if debug is open refresh it
		if (modes.dialog[modes.dialog[0]].name == "debug") {
			resetDebug();
		}
	}

	function selectTextareaLine(textarea,lineStart,lineEnd, style) {
		lineStart--; // array starts at 0, we leave lineEnd as is beacuse we'll select until the beginning of the next line
		if (typeof(ace) !== 'undefined') {
			var Range = require('ace/range').Range;
			if (!style) {
				style = "ace_step";
			}
			return ace.edit("console-write").session.addMarker(new Range(lineStart,0,lineEnd-1,ace.edit("console-write").session.getLine(lineEnd-1).length), style, "fullLine");
		} else {
			var lines = document.getElementById("console-write").value.split("\n");
			// calculate start/end
			var startPos = 0, endPos = 0;
			for (var x=0; x<lines.length; x++) {
				if (x < lineStart) {
					startPos += (lines[x].length+1);
				}
				if (x < lineEnd) {
					endPos += (lines[x].length+1);
				} else {
					break;
				}
			}
			// do selection
			if (typeof(textarea.selectionStart) != "undefined") { // Chrome/Firefox
				textarea.focus();
				textarea.selectionStart = startPos;
				textarea.selectionEnd = endPos;
				return true;
			} else if (document.selection && document.selection.createRange) { // IE
				textarea.focus();
				textarea.select();
				var range = document.selection.createRange();
				range.collapse(true);
				range.moveEnd("character", endPos);
				range.moveStart("character", startPos);
				range.select();
				return true;
			}
			return false;
		}
	}

	/* highlight(reference): Higlights canvas 
		reference: id of the div or line to affect
	*/
	function highlight(reference, style) {
		unhighlight();
		var level = modes.console[modes.console[0]].div;
		var mode = modes.console[modes.console[0]].div;
		if (mode == "blocks") {
			var consoleDiv = document.getElementById("console-blocks");
			var r = ("0" + Math.floor((Math.random()*256)).toString(16)).slice(-2);
			var g = ("0" + Math.floor((Math.random()*256)).toString(16)).slice(-2);
			var b = ("0" + Math.floor((Math.random()*256)).toString(16)).slice(-2);
			var div = document.getElementById(reference);
			if (!style) {
				style = r.toString()+g.toString()+b.toString();
			}
			div.style.border = "2px solid #"+style;
			div.style.boxShadow = "5px 5px 5px #"+style;
			smoothScroll(consoleDiv, div.offsetTop-consoleDiv.offsetTop-consoleDiv.clientHeight/2+blockSize(level,consoleDiv.firstChild).height/2);
		} else if (mode == "write") {
			var lineNumbers = reference.split(',');
			var value = selectTextareaLine(document.getElementById("console-write"),lineNumbers[0],lineNumbers[1], style);
			if (typeof(ace) !== 'undefined') {
				ace.edit("console-write").scrollToLine(lineNumbers[0], true, true)
				highlightReference = value;
			}
		}
	}

	/* unhighlight(): Removes highlight from a canvas
	*/
	function unhighlight() {
		var div = document.getElementById(highlightReference);
		if (div) { // by the time we have to unhighlight it the div might not exist anymore
			div.style.border = ""; // accesses the canvas
			div.style.boxShadow = ""
		} else if (highlightReference && typeof(ace) !== 'undefined') {
			var Range = require('ace/range').Range;
			ace.edit("console-write").session.removeMarker(highlightReference);
		} else if (highlightReference && highlightReference.length == 2) {
			selectTextareaLine(document.getElementById("console-write"),highlightReference[1],highlightReference[1]);
		}
	}

	function setHighlight(reference) {
		if (checkProgramCounter(true)) { // only update while the counter limit hasn't been reached
			highlightReference = reference;
		}
	}

	function getInstructionSetIdFromName(instructionName,startId) {
		if (startId == null) { // By default search from the beginning
			startId = 0;
		}
		for (var i=startId; i<instructionSet.length; i++) {
			if (instructionName == instructionSet[i].name) {
				return i;
			}
		}
		return -1;
	}

	function blocks2write() {
		var level = modes.console[modes.console[0]].name;
		var code = blocks2code(document.getElementById("console-blocks").firstChild,false);
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
	
	// This function generates the pseudocode visible in level4 or the real code that eval() will run (if highlight = true)
	function blocks2code(blockDiv,highlight,indentation) {
		if (!indentation) { // We assume this is the main call
			indentation = "";
			code = ""; // erase all written code content
		}
		while (blockDiv && blockDiv.id != "console-blocks-tip") { // Check that there really is code in the block code area, otherwise there's nothing to convert
			if (highlight) {
				code += "setHighlight('"+blockDiv.id+"');"; // we highlight the block before running it. That is because we can always run a function call before another call, but instead for whiles/fors/ifs we cannot run a call right after their call (before the "{"). Also, if it was highlited after it would be left highlighting the previous instruction because the code stops running during the execution of the instruction
			}
			var instruction = instructionSet[blockDiv.getAttribute("instructionSetId")];
			var thisIndentation = indentation;
			if (instruction.code && instruction.code.unindent) {
				thisIndentation = thisIndentation.substr(0,thisIndentation.length-1);
			}
			code += thisIndentation + loadParameters("level4",blockDiv).text + "\n";
			if (blockDiv.firstChild.nextSibling) { // if it has a child it is a nested div/block
				blocks2code(blockDiv.firstChild.nextSibling,highlight,indentation+"\t");
			}
			blockDiv = blockDiv.nextSibling;
		}
		return code;
	}

	function blocks2blocks(level) {
		var width = setup.blockWidth[level];
		var height = setup.blockHeight[level];
		var divs = document.getElementById("console-blocks").getElementsByTagName("div");
		for (var i=divs.length-1; i>=0; i--) { // We parse it bottom-up because we need to redraw the children before begin able to accurately redraw the parents
			var div = divs[i];
			if (div.id == "console-blocks-tip") {
				continue;
			}
			createBlock(level,div);
		}
	}

	function write2code(pseudoCode, highlight) {
		var code = "";
		var lines = pseudoCode.replace(/\r\n/g,"\n").split("\n");
		var highlightStart = 0; // the first line is always ready to hace a higlight prefixing it
		var tempCode = ""; // this will store the code that is being generate between tempCode and highlightEnd
		for (var lineNumber=0; lineNumber<lines.length; lineNumber++) {
			var line = lines[lineNumber];
			if (highlight) {
				if (!line || line.trim().length == 0) {
					if (highlightStart == lineNumber) { // if the line is empty and selection starts here, postpone selection to next line
						highlightStart++;
					}
					continue;
				}
				if (/[a-zA-Z0-9);\{\}]/.test(line.trim().slice(-1)) || lineNumber == lines.length-1) { // Check if last char is alphanumeric, ; or )
					code += "setHighlight('"+(highlightStart+1)+","+(lineNumber+1)+"');"+tempCode+" ; "+line+"\n"; // we count textarea lines starting with 1
					tempCode = "";
					highlightStart = lineNumber+1;
				} else {
					tempCode += line+"\n";
				}
			} else {
				code += line+"\n";
			}
		}
		return code;
	}

	function code2run(pseudoCode) {
		var code = "";
		var lines = pseudoCode.replace(/\r\n/g,"\n").split("\n");
		for (var lineNumber=0; lineNumber<lines.length; lineNumber++) {
			code += line2code(lines[lineNumber])+"\n";
		}
		return code;
	}

	function saveCode() {
		if (navigator.userAgent.match(/MSIE/)) {
			msgBox("Sorry, your browser doesn't support downloading the code directly. Switch to level4, copy the code and paste it into a file in your computer.");
			return;
		}
		var codeURI = "data:application/octet-stream," + encodeURIComponent(downloadCode());
		var downloadLink = document.createElement("a");
		downloadLink.href = codeURI;
		downloadLink.download = ((filename && filename.length > 0)?filename:"code.esee");
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	}

	function downloadCode() {
		var level = modes.console[modes.console[0]].name;
		var mode = modes.console[modes.console[0]].div;
		var code;
		if (mode == "blocks") {
			code = blocks2code(document.getElementById("console-blocks").firstChild);
		} else if (mode == "write") {
			var code;
			if (typeof(ace) !== 'undefined') {
				code = ace.edit("console-write").getValue();
			} else {
				code = document.getElementById("console-write").value;
			}
		}
		return code;
	}

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
			msgBox("Sorry, your browser doesn't support uploading files directly. Paste your code into level4 and then switch to the level you wish to code with.");
		}
	}

	function loadCodeFile(event) {
		if (!event.target.files.length) {
			return;
		}
		var file = event.target.files[0];
		if (!file) {
        		msgBox("Failed to upload the file!");
			return;
		} else if (file.type && !file.type.match('text.*')) {
			msgBox(file.name + " is not a valid eSee file!"+file.type);
			return;
		}
      		var reader = new FileReader();
		reader.onload = function(event) {
			uploadCode(event.target.result)
			filename = file.name;
		}
		reader.readAsText(file);
	}

	function uploadCode(code) {
		var level = modes.console[modes.console[0]].name;
		var mode = modes.console[modes.console[0]].div;
		resetCanvas();
		// Always start by trying to load the code into the current level
		var switchToMode;
		if (mode == "blocks") {
			if (eseecodeLanguage) {
				try {
					var program = eseecodeLanguage.parse(code);
					program.makeBlocks(level,document.getElementById("console-blocks"));
				} catch (exception) {
					msgBox("Can't open the code in "+level+" mode because there are erros in the code. Please open the file in level4 mode and fix the following errors:\n\n"+exception.name + ":  " + exception.message);
				}
			} else {
				msgBox("Can't open the code in "+level+" mode because you don't have the eseecodeLanguage script loaded. Please open the file in level4 mode");
			}
		} else if (mode == "write") {
			resetWriteConsole(code);
		}
	}

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

	function resetUI(ask) {		
		whiteboard = document.getElementById("whiteboard");
		dialogWindow = document.getElementById("dialog-window");
		if (ask === true && !confirm("Do you really want to start over?")) {
			return;
		}
		initUIElements();
		resetUndo();
		// init modes array with div objects
		for (var i=1;i<modes.console.length;i++) {
			var modeName = modes.console[i].name;
			modes.console[i].tab = document.getElementById("console-tabs-"+modeName);
		}
		for (var i=1;i<modes.dialog.length;i++) {
			var modeName = modes.dialog[i].div;
			modes.dialog[i].element = document.getElementById("dialog-"+modeName);
			if (i < modes.console.length) {
				modes.dialog[i].tab = document.getElementById("dialog-tabs-pieces");
			} else {
				modes.dialog[i].tab = document.getElementById("dialog-tabs-"+modeName);
			}
		}
		resizeConsole(true);
		initConsole();
		if (modes.console[0] > 0) {
			switchConsoleMode(modes.console[0]);
		} else {
			// leave switchConsoleMode() to update modes.console[0] so that it knows that we are booting the application
			switchConsoleMode(1); // default console mode
		}
		resetCanvas(true);
		resetDebug();
		document.body.removeEventListener("keydown", keyboardShortcuts, false);
		document.body.addEventListener("keydown", keyboardShortcuts, false);
	}

	function initConsole() {
		resetBlocksConsole(document.getElementById("console-blocks"));
		resetWriteConsole();
	}

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

	function cancelFloatingBlock(event) {
		if (event && event.type == "keydown") {
			if (event.keyCode != 27) {
				return;
			}
		}
		if (floatingBlock.div) {
			if (floatingBlock.div.parentNode == document.body) { // it could be that the div has been reassigned to the console
				deleteBlock(floatingBlock.div);
			}
			if (floatingBlock.fromDiv) {
				floatingBlock.fromDiv.style.opacity = 1;
			}
		}
		floatingBlock.div = null;
		floatingBlock.fromDiv = null;
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
			blocksUndo.pop(); // Sice the edition was cancelled, pop the half-written undo element
		}
	}

	function keyboardShortcuts(event) {
		var mode = modes.console[modes.console[0]].div;
		if (mode == "blocks") {
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

	function clickBlock(event) {
//TODO
document.getElementById("execute-notes").innerHTML = " ("+event.type+" "+event.target+" "+event.currentTarget+" "+event.timeStamp+")";
		var level = modes.console[modes.console[0]].name;
		var div = event.target;
		if (div.tagName !== "DIV") {
			if (div.id.match(/^div-blankspan-/)) {
				// TODO: Call setup dialog
				event.stopPropagation();
				return;
			} else {
				while (div.tagName !== "DIV") {
					div = div.parentNode;
				}
			}
		}
		var instructionSetId = div.getAttribute("instructionSetId");
		var instruction = instructionSet[instructionSetId];
		while (div && instruction.dummy) {
			div = div.parentNode;
			instructionSetId = div.getAttribute("instructionSetId");
			instruction = instructionSet[instructionSetId];
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
		blocksUndoIndex = blocksUndo[0]+1;
		if (blocksUndoIndex > setup.undoDepth) { // never remember more than 20 actions (which means the array has 21 elements, since the first one is the index)
			blocksUndoIndex--;
			blocksUndo.shift();
			blocksUndo[0] = blocksUndoIndex-1;
		}
		blocksUndo[blocksUndoIndex] = { fromDiv: null, fromDivPosition: false, div: null, divPosition: false };
		if (!dialog) {
			floatingBlock.fromDiv = div;
			blocksUndo[blocksUndoIndex].fromDiv = floatingBlock.fromDiv;
			var count = 0;
			var element = document.getElementById("console-blocks").firstChild;
			blocksUndo[blocksUndoIndex].fromDivPosition = recursiveCount(element, div).count;
		}
		floatingBlock.div = div.cloneNode(true);
		// Copy parameters
		for (var i=1; div.getAttribute("param"+i) !== null; i++) {
			floatingBlock.div.setAttribute("param"+i,div.getAttribute("param"+i));
		}
		if (!dialog) {
			floatingBlock.fromDiv.style.opacity = 0.4;
		}
		floatingBlock.div.style.position = "absolute";
		document.body.appendChild(floatingBlock.div);
		floatingBlock.div.id = newDivId();
		if (floatingBlock.div.classList) {
			floatingBlock.div.classList.add("floatingBlock");
		} else {			
			floatingBlock.div.className += " floatingBlock";
		}
		paintBlock(floatingBlock.div);
		moveBlock();
		var handler;
		if (!isTouchDevice()) {
			handler = "click";
		} else {
			handler = "touchstart";
		}
		floatingBlock.div.removeEventListener(handler,clickBlock);
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

	function unclickBlock(event) {
		var blocksUndoIndex = blocksUndo[0]+1;
		var consoleDiv = document.getElementById("console-blocks");
		var div = floatingBlock.div;
		divId = div.id;
		var action;
		var level = modes.console[modes.console[0]].name;
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
				blocksUndo[blocksUndoIndex].divPosition = consoleDiv.childNodes.length-1;
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
				blocksUndo[blocksUndoIndex].divPosition = position;
				if ((blocksUndo[blocksUndoIndex].divPosition === blocksUndo[blocksUndoIndex].fromDivPosition) || (isNumber(blocksUndo[blocksUndoIndex].fromDivPosition) && isNumber(blocksUndo[blocksUndoIndex].divPosition) && blocksUndo[blocksUndoIndex].divPosition-1 == blocksUndo[blocksUndoIndex].fromDivPosition)) { // Nothing changed: Note that moving a block right below has no effect
					action = "setup";
					// We aren't using the floating block
					div = floatingBlock.fromDiv;
					divId = div.id;
				} else if (floatingBlock.fromDiv && positionInBlock(consoleDiv, floatingBlock.fromDiv, position)) {
					action = "cancel";
				} else {
					addBlock(div,position); // first we add the block, then we delete the old one, otherwise the positioning fails
					if (floatingBlock.fromDiv) { // if the block doesn't come from the Dialog
						action = "move";
						floatingBlock.fromDiv.parentNode.removeChild(floatingBlock.fromDiv);
					} else {
						action = "add";
						if (level == "level2" || level == "level3") {
							setupBlock(div);
						}
						paintBlock(div);
					}
					setTimeout(function() {
						var blockHeight = blockSize(modes.console[modes.console[0]].name, div).height;
						if (position*blockHeight < consoleDiv.scrollTop) {
							smoothScroll(consoleDiv, position*blockHeight-10);
						} else if ((position+1)*blockHeight > consoleDiv.scrollTop+consoleDiv.clientHeight) {
							smoothScroll(consoleDiv, (position+1)*blockHeight-consoleDiv.clientHeight+10);
						}
					}, 100); // Scroll appropiately to see the new block. Do it after timeout, since the div scroll size isn't updated until this event is complete
				}
			}
			blocksUndo[blocksUndoIndex].div = div;
		} else { // The block is dropped
			if (floatingBlock.fromDiv) { // if the block doesn't come from the Dialog	
				floatingBlock.fromDiv.parentNode.removeChild(floatingBlock.fromDiv);
				blocksUndo[blocksUndoIndex].divPosition = false;
			} else {
				action = "cancel";
			}
		}
		if (floatingBlock.div.classList) {
			floatingBlock.div.classList.remove("floatingBlock");
		} else {			
			floatingBlock.div.className = floatingBlock.div.className.replace(/\s+floatingBlock/,"");
		}
		cancelFloatingBlock();
		if (action == "cancel" || action == "setup") {
			blocksUndo.pop();
		} else {
			changesInCode = "blocks";
			blocksUndo[0] = blocksUndoIndex;
			blocksUndo.splice(blocksUndoIndex+1,blocksUndo.length); // Remove the redo queue
			if (level == "level1") {
				execute(true);
			}
		}
	}

	function positionInBlock(consoleDiv, div, position) {
		var startPos = searchBlockPosition(consoleDiv.firstChild,div).count-1;
		var endPos = searchPositionBlock(div.firstChild.nextSibling,-1,startPos).count;
		return (position >= startPos && position <= endPos);
	}

	function recursiveAddEventListener(div, handler, callPointer) {
		if (!div) {
			return;
		}
		if (div.tagName !== "SPAN" && div.tagName !== "DIV") {
			return;
		}
		if (div.tagName === "DIV") {
			if (!instructionSet[div.getAttribute("instructionSetId")].dummy) {
				div.addEventListener(handler,callPointer);
			}
		}
		recursiveAddEventListener(div.firstChild,handler,callPointer);
		recursiveAddEventListener(div.nextSibling,handler,callPointer);
	}

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
		return { count: count, found: output.found };
	}

	function moveBlock(event) {
		event = event ? event : window.event;
		if (!event) {  // firefox doesn't know window.event
			return;
		}
		var level = modes.console[modes.console[0]].name;
		var div = floatingBlock.div;
		var pos = eventPosition(event);
		div.style.left = pos.x*1 - setup.blockWidth[level]/2 +"px";
		div.style.top = pos.y*1 - setup.blockHeight[level]/2 +"px";
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
			var output = searchPositionBlock(parentDiv.firstChild,position,0);
			if (output.element) {
				nextDiv = output.element;
				parentDiv = nextDiv.parentNode;
			} else {
				nextDiv = null;
			}
		} else if (parent) {
			var instructionSetId = parentDiv.getAttribute("instructionSetId");
			if (instructionSetId && instructionSet[instructionSetId].block) { // Append child inside the block, before closure
				nextDiv = parentDiv.lastChild;
			}
		}
		var instruction = instructionSet[blockDiv.getAttribute("instructionSetId")];
		if (instruction.block && !blockDiv.firstChild.nextSibling && !instruction.text) { // If we are adding a block to the console for the first time, create its children
			var level = modes.console[modes.console[0]].name;
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

	function searchBlockPosition(currentDiv, searchDiv) {
		var count = 0;
		var found = false;
		while (currentDiv && !found) {
			found = (currentDiv == searchDiv);
			if (!found && currentDiv.firstChild.nextSibling) {
				var output = searchBlockPosition(currentDiv.firstChild.nextSibling, searchDiv);
				count += output.count;
				found = output.found
			}
			count++;
			currentDiv = currentDiv.nextSibling;
		}
		return { count: count, found: found };
	}

	function searchPositionBlock(element, position, count) {
		while (element && count != position) { // if the code is almost empty position could be far ahead of the last block
			var instruction = instructionSet[element.getAttribute("instructionSetId")];
			if (instruction.block) {	
				var output = searchPositionBlock(element.firstChild.nextSibling, position, count+1);
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

	function deleteBlock(div) {
		var consoleDiv = document.getElementById("console-blocks");
		div.parentNode.removeChild(div);
		if (!consoleDiv.firstChild) {
			resetBlocksConsole(consoleDiv);
		}
	}

	function checkAndAddConsoleTip() {
		var consoleDiv = document.getElementById("console-blocks");
		if (!consoleDiv.firstChild || consoleDiv.firstChild.id == 'console-blocks-tip') {
			consoleDiv.innerHTML = "<div id='console-blocks-tip' style='border-width:0px;box-shadow:none;float:none;display:table-cell;text-align:center;vertical-align:middle;color:#FF5555;text-shadow:1px 1px 2px #000000;font-weight:bold;height:"+(consoleDiv.clientHeight)+"px'>Drop some blocks here to start programming!</div>";
		}
	}

	function newDivId() {
		var d = new Date();
		var id = d.getTime()*10000+Math.floor((Math.random()*10000));
		return "div-"+id;
	}

	function ordinal(num) {
		var value = "";
		if (num == 1) {
			value = num+"st";
		} else if (num == 2) {
			value = num+"nd";
		} else if (num == 3) {
			value = num+"rd";
		} else {
			value = num+"th";
		}
		return value;
	}

	function setupBlock(div) {
		var level = modes.console[modes.console[0]].name;
		var instruction = instructionSet[div.getAttribute("instructionSetId")];
		var instructionName = instruction.name;
		var setupChanges = new Array();
		var paramNumber = 1; // parameters[0] is usually "param1"
		for (var i=0; i<instruction.parameters.length; i++) {
			var parameter = instruction.parameters[i];
			var parameterName = parameter.name;
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
				var text = "Enter a text to use as "+parameterName+". The "+parameterName+" should easily relate to the use you are going to give to the block:<br /><input id=\"msgBoxSetupBlockInput\" value=\""+defaultValue+"\" type=\"text\" width=\"100\"/>";
				msgBox(text,function(text,defaultValue,validate){
					var value = document.getElementById("msgBoxSetupBlockInput");
					if (validate(value)) {
						// TODO
					} else {
						msgBox("The value you entered is invalid!");
					}
				}(text,defaultValue,instruction.validate));
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
			var helpText = ordinal(paramNumber)+" enter the value for "+instructionName+"()'s parameter \""+parameterName+"\"";
			if (div.getAttribute("param"+paramNumber) !== undefined) {
				defaultValue = div.getAttribute("param"+paramNumber);
			}
			if (defaultValue === undefined || defaultValue === null) {
				defaultValue = "";
			}
			if (level == "level2" && parameter.tip) {
				helpText += ".\n"+parameter.tip;
			}
			helpText += ":";
			if (level == "level2" || level == "level3") {
				value = window.prompt(ordinal(paramNumber)+" enter the value for "+instructionName+"()'s parameter \""+parameterName+"\":", defaultValue);
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
		var setupChanges = setupBlock(div);
		if (setupChanges.length > 0) {
		// Update undo array
		blocksUndo[blocksUndoIndex].parameters = setupChanges;
		// Update the block icon
			paintBlock(div);
		} else {
			action = "cancel";
		}
	}

	function setupBlockOk(div) {
		// Update undo array
		blocksUndo[blocksUndoIndex].parameters = setupChanges;
		// Update the block icon
			paintBlock(div);
		} else {
			action = "cancel";
		}
	}

/*
	function setupParameterLevel3(divId, parameterNum, instructionName, parameterName, parameterDefault, parameterType) {
		var mainBlock = document.getElementById("eseecode");
		var div = document.createElement("div");
		div.className = "inputBox";
		div.style.top = mainBlock.offsetTop+mainBlock.offsetHeight/4+"px";
		div.style.left = mainBlock.offsetLeft+mainBlock.offsetWidth/4+"px";
		div.style.width = mainBlock.offsetWidth/2+"px";
		div.style.height = mainBlock.offsetHeight/2+"px";
		div.innerHTML = "Parameter <i>"+parameterName+"</i> for instruction <b>"+instructionName+"</b>:<br /"+"><br /"+">";
		div.innerHTML += "";
		div.innerHTML += "<div align=\"center\"><input id=\"value\" type=\"hidden\" value=\""+parameterDefault+"\" /"+"><input type=\"button\" value=\"OK\" onclick=\"setupParameterLevel3Accept("+divId+","+parameterNum+")\" /"+"></div>";
		document.body.appendChild(div);
	}

	function setupParameterLevel3Accept(divId,parameterNum) {
		applyParameters(divId,parameter);
		document.body.removeChild(document.getElementById('msgBox'));
	}
*/
	
	function getVariables(div) {
		var consoleDiv = document.getElementById("console-blocks");
		var values = new Array();
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
	
	function getFunctions(type) {
		var values = new Array();
		for (var i=0; i<instructionSet.length; i++) {
			if (instructionSet[i].return === type) {
				values.push(instructionSet);
			}
		}
		return values;
	}

	// Load parameters or default parameters
	function loadParameters(level, div, dialog) {
		var instructionSetId = div.getAttribute("instructionSetId");
		var instruction = instructionSet[instructionSetId];
		var parameters = new Array();
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

	// div must already be created
	function createBlock(level,div,instructionSetId,dialog) {
		var codeId;
		if (instructionSetId == null) { // If no instructionSetId is passed we just want to update the block
			instructionSetId = div.getAttribute("instructionSetId");
			codeId = div.id;
		} else { // This is a block that didn't exist before
			codeId = newDivId();
			div.setAttribute("id", codeId);
			div.setAttribute("instructionSetId", instructionSetId);
		}
		var instruction = instructionSet[instructionSetId];
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

	function paintBlock(div,dialog,skipRepaint) {
		var level = modes.console[modes.console[0]].name;
		var instruction = instructionSet[div.getAttribute("instructionSetId")];
		var color = "transparent"; // default color
		var searchCategoryForColor = instruction.category;
		if (instruction.category == "internal" && div.parentNode) {
			var parentInstruction = instructionSet[div.parentNode.getAttribute("instructionSetId")];
			if (parentInstruction && parentInstruction.block) {
				searchCategoryForColor = parentInstruction.category;
			}
		}
		for (var i=0; i<instructionCategories.length; i++) {
			if (searchCategoryForColor == instructionCategories[i].name) {
				color = instructionCategories[i].color;
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
		span.style.minHeight = setup.blockHeight[level]+"px";
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
		div.style.minWidth = setup.blockWidth[level]+"px";
		div.style.minHeight = setup.blockHeight[level]+"px";
		div.setAttribute("title", text+((dialog && instruction.tip)?": "+instruction.tip:"")); // help for blind people
		if (!instruction.dummy) {
			var bgWidth = div.clientWidth;
			var bgHeight = div.clientHeight;
			var bgCanvas = document.createElement("canvas");
			bgCanvas.setAttribute("width", bgWidth);
			bgCanvas.setAttribute("height", bgHeight);
			var bgCtx = bgCanvas.getContext("2d");
			if (color.charAt(0) == "#") {
				var r = color.substr(1,2);
				var g = color.substr(3,5);
				var b = color.substr(5,7);
				// We can't just use transparent gradient because IE11 fails horribly with them
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
			var height = parseInt(div.style.minHeight.replace("px",""));
			var width = parseInt(div.style.minWidth.replace("px",""));
			if ((level == "level1" || level == "level2") && icons[instruction.name]) {
				icons[instruction.name](bgCtx, width, height, output.parameters);
			}
/*
			bgCtx.font="bold 10px Arial";
			bgCtx.fillStyle = readableText(color);
			bgCtx.fillText(text,1,12);
*/
			div.style.backgroundImage = "url("+bgCanvas.toDataURL()+")";
		}
		if (!skipRepaint) {
			while (div.parentNode && div.parentNode.getAttribute("instructionSetId")) {
				div = div.parentNode;
				paintBlock(div,dialog,true);
			}
		}
	}

	function initDialogBlocks(level,dialog) {
		resetDialog(dialog);
		var instructions = instructionSet;
		var width = setup.blockWidth[level];
		var height = setup.blockHeight[level];
		var clearNext = false;
		for (var n=0;n<instructionCategories.length;n++) {
			var category = instructionCategories[n].name;
			var firstInCategory = true;
			for (var i=0;i<instructionSet.length;i++) {
				// Only show instructions in the current category
				if (category != instructionSet[i].category) {
					continue;
				}
				// See if this instruction is shown in this level
				var show = false;
				for (var j=0; j<instructionSet[i].show.length; j++) {
					if (instructionSet[i].show[j] == level) {
						show = true;
						break;
					}
				}
				if (show) {
					var codeId = instructionSet[i].name;
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

	function initDialogWrite(level,dialog) {
		resetDialog(dialog);
		for (var i=0; i<instructionSet.length; i++) {
			instructionSet[i].index = i;
		}
		var instructions = instructionSet.concat().sort(function(a,b) { if (a.name<b.name) return -1; if (a.name>b.name) return 1; return 0; });
		for (var n=0;n<instructionCategories.length;n++) {
			var category = instructionCategories[n].name;
			var color = instructionCategories[n].color;
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
						div.setAttribute("title", instruction.tip);
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
								div.innerHTML += instruction.parameters[j].name;
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
							div.innerHTML = instruction.parameters[firstParam].name+" <b>"+instruction.name+"</b>";
							firstParam++;
							if (instruction.parameters[firstParam]) {
								div.innerHTML += " "+instruction.parameters[firstParam].name;
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

	function writeText(event) {
		var level = modes.console[modes.console[0]].name;
		var div = event.target;
		while (div && !div.getAttribute("instructionSetId")) { // Target could be a span in the div, so let's fetch the parent div
			div = div.parentNode;
		}
		var instruction = instructionSet[div.getAttribute("instructionSetId")];
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
		if (typeof(ace) !== 'undefined') {
			ace.edit("console-write").insert(text);
		} else {
			var el = document.getElementById("console-write");
			var val = el.value;
			if (typeof el.selectionStart != "undefined" && typeof el.selectionEnd != "undefined") {
				var endIndex = el.selectionEnd;
				el.value = val.slice(0, el.selectionStart) + text + val.slice(endIndex);
				el.selectionStart = el.selectionEnd = endIndex + text.length;
			} else if (typeof document.selection != "undefined" && typeof document.selection.createRange != "undefined") {
				el.focus();
				var range = document.selection.createRange();
				range.collapse(false);
				range.text = text;
				range.select();
			}
		}
	}

	function isTouchDevice() {
		var touchscreen = (('ontouchstart' in window) ||
     		    (navigator.maxTouchPoints > 0) ||
		    (navigator.msMaxTouchPoints > 0));
		return touchscreen;
	}

	function undo(redo) {
		var mode = modes.console[modes.console[0]].div;
		var action = redo ? "redo" : "undo";
		if (mode == "blocks") {
			var blocksUndoIndex = blocksUndo[0];
			var undo, oldDiv, newDiv, oldPosition, newPosition, newIndex;
			if (redo) {
				undo = blocksUndo[blocksUndoIndex+1];
			} else {
				undo = blocksUndo[blocksUndoIndex];
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
				blocksUndo[0]++;
			} else {
				blocksUndo[0]--;
			}
			if (modes.console[modes.console[0]].name == "level1") {
				execute();
			}
		} else if (mode == "write") {
			if (typeof(ace) !== 'undefined') {
				ace.edit("console-write").execCommand(action, false, null);
			} else {
				document.execCommand(action, false, null);
			}
		}
	}

	/* resetCanvas(): Resets all canvas
	*/
	function resetCanvas(resetStep) {
		unhighlight();
		document.getElementById("execute-notes").innerHTML = "";
		initProgramCounter(resetStep);
		var turtle = canvasArray["turtle"]; // must check this before removing canvasArray
		// reset canvas
  		for(var i=0;i<canvasArray.length;i++) {
			removeCanvas(i);
		}
		delete canvasArray;
		canvasArray = new Array();
		if (!turtle) {
			initTurtle();
		} else {
			canvasArray["turtle"] = turtle;
		}
		getCanvas(0).canvas.style.zIndex = -1; // canvas-0 is special
		resetGrid();
		switchCanvas(1); // canvas-1 is the default
		// reset turtle	
		resetTurtle();
		// reset windows
  		for(var i=0;i<windowsArray.length;i++) {
			if (windowsArray[i]) {
				dialogWindow.removeChild(windowsArray[i]);
				delete windowsArray[i];
			}
		}
		delete windowsArray;
		windowsArray = new Array();
		windowSwitch(0); // window-0 is special
		windowSwitch(1); // window-1 is the default
	}

	function resetDialog(dialog) {
		while (dialog.hasChildNodes()) {
			dialog.removeChild(dialog.lastChild);
		}
	}

	function resetBlocksConsole(console) {
		while (console.hasChildNodes()) {
		    console.removeChild(console.lastChild);
		}
		cancelFloatingBlock();
		checkAndAddConsoleTip();
	}

	function resetWriteConsole(code) {
		if (!code) {
			code = "";
		}
		document.getElementById('console-write').style.fontSize=setup.blockHeight.level3+"px";
		if (typeof(ace) !== 'undefined') {
			var editor = ace.edit("console-write");
			editor.setTheme("ace/theme/chrome");
			editor.getSession().setMode("ace/mode/javascript");
			editor.renderer.setShowGutter(false);
			// Only update code if it changed, to avoid adding empty changes into the ACE undo queue
			if (code != ace.edit("console-write").getValue()) {
				editor.setValue(code);
			}
			editor.gotoLine(0,0);
			editor.session.on("change",function() {changesInCode="write";});
		} else {
			var consoleDiv = document.getElementById("console-write");
			// Only update code if it changed, to avoid uselessly changing the editor undo queue
			if (code != consoleDiv.value) {
				var parentDiv = consoleDiv.parentNode;
				var newConsoleDiv = document.createElement("textarea");
				newConsoleDiv.id = "console-write";
				newConsoleDiv.className = "program";
				newConsoleDiv.value = code;
				parentDiv.removeChild(consoleDiv);
				parentDiv.appendChild(newConsoleDiv);
			}
			document.getElementById("console-write").addEventListener("change",function() {changesInCode="write";});
		}
	}

	function resetUndo() {
		blocksUndo = new Array(0, null);
	}

	// Main initialization
	var filename = "";
	var programCounter, limitProgramCounter = 0, programCounterLock, highlightReference, executionEndLimit, lastCode;
	var floatingBlock = { div: null, frombDiv: null };
	var changesInCode = false, executeSuccessful = false;
	var blocksUndo = null;
	var whiteboard = null;
	var dialogWindow = null;
	var canvasArray = new Array();
	var windowsArray = new Array();
	var currentCanvas = null;
	var currentWindow = null;
	// set setup.defaultFontSize to size-1
	var setup = {
		blockWidth : { "level1" : 68, "level2" : 68, "level3" : 45 },
		blockHeight : { "level1" : 68, "level2" : 68, "level3" : 15 },
		defaultFontSize : 9,
		defaultFontWidth : 6,
		undoDepth: 20
	};
	var modes = {
	  console: new Array(0,
		{name: "level1", div: "blocks", tab: null},
		{name: "level2", div: "blocks", tab: null},
		{name: "level3", div: "blocks", tab: null},
		{name: "level4", div: "write", tab: null}),
	  dialog: new Array(0,
		{name: "level1", div: "blocks", element: null, tab: null},
		{name: "level2", div: "blocks", element: null, tab: null},
		{name: "level3", div: "blocks", element: null, tab: null},
		{name: "level4", div: "write", element: null, tab: null},
		{name: "window", div: "window", element: null, tab: null},
		{name: "debug", div: "debug", element: null, tab: null})
	};
