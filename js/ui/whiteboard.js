"use static";

/**
 * Returns an image of to the current whiteboard
 * @private
 * @param {Boolean} gridVisible Can be use to force toggling the grid
 * @param {Boolean} guideVisible Can be use to force toggling the guide
 * @return {String} Binary of the image
 * @example $e.ide.imagifyWhiteboard(document.body.createElement("a"))
 */
$e.ide.imagifyWhiteboard = (gridVisible, guideVisible) => {
	if (gridVisible === undefined) gridVisible = $e.ui.gridVisible;
	if (guideVisible === undefined) guideVisible = $e.ui.guideVisible;
	const canvas = document.createElement('canvas');
	canvas.width = $e.backend.whiteboard.layers.available["grid"].canvas.width;
	canvas.height = $e.backend.whiteboard.layers.available["grid"].canvas.height;
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	if (gridVisible) ctx.drawImage($e.backend.whiteboard.layers.available["grid"].canvas, 0, 0);
	let layer = $e.backend.whiteboard.layers.bottom;
	while (layer) {
		ctx.drawImage(layer.canvas, 0, 0);
		layer = layer.layerOver;
	}
	if (guideVisible) $e.ui.drawDebugGuide(ctx, $e.backend.whiteboard.layers.current.guide, $e.backend.whiteboard.layers.current.name, undefined, undefined, true);
	return canvas;
};

/**
 * Links an A HTML element to the current whiteboard export drawing
 * @private
 * @param {Boolean} onlyReturn If true, the a file is not downloaded
 * @param {Boolean} gridVisible Can be use to force toggling the grid
 * @param {Boolean} guideVisible Can be use to force toggling the guide
 * @example $e.ide.downloadWhiteboard()
 */
$e.ide.downloadWhiteboard = (onlyReturn, gridVisible, guideVisible) => {
	const canvas = $e.ide.imagifyWhiteboard(gridVisible, guideVisible);
	const dataUrl = canvas.toDataURL();
	const dataTuple = $e.dataURItoB64(dataUrl);
	const data = dataTuple.data;
	const filename = "canvas-" + new Date().getTime() + "." + dataTuple.mimetype.split("/")[1];
	const mimetype = dataTuple.mimetype;
	if (!onlyReturn) $e.ide.saveFile(data, filename, mimetype);
	return { canvas: canvas, dataUrl: dataUrl, binary: data, filename: filename, mimetype: mimetype };
};

/**
 * Downloads the layers as a file, called from the UI
 * @private
 * @param {Boolean} animation Set to true to download as an animation
 * @example $e.ui.downloadLayers()
 */
$e.ui.downloadLayers = (animation) => {
	// Create one layer GIF to measure how long it takes
	const start = new Date().getTime();
	let estimatedTime;
	if (animation) {
		const encoder = new GIFEncoder();
		encoder.setRepeat(0);
		encoder.setDelay(0.1);
		encoder.start();
		encoder.addFrame($e.backend.whiteboard.layers.available["grid"].canvas.getContext("2d"));
		encoder.finish();
	} else {
		const canvasWidth = $e.backend.whiteboard.width;
		const canvasHeight = $e.backend.whiteboard.width;
		const tempCanvas = document.createElement("canvas");
		tempCanvas.width = canvasWidth;
		tempCanvas.height = canvasHeight;
		const tempCtx = tempCanvas.getContext("2d");
		tempCtx.drawImage($e.backend.whiteboard.layers.current.canvas, 0, 0, canvasWidth, canvasHeight);
	}
	const finish = new Date().getTime();
	const secondsPerLayer = (finish - start) / 1000;
	estimatedTime = Math.ceil(secondsPerLayer * $e.backend.whiteboard.layers.available.length);
	if (estimatedTime >= 3) {
		$e.ui.msgBox.open(_("It is estimated that it will take %s seconds to generate the file to download. Do you wish to proceed?\n\nIf you want to proceed %sclick here%s and please be patient and don't switch away from the application.", [ estimatedTime, "<button id=\"downloadLayers-link\" onclick=\"$e.ide.downloadLayers(" + grid + ")\" >", "</button>" ]), { noSubmit: true, cancelAction: $e.ui.msgBox.close });
	} else {
		$e.ide.downloadLayers(animation);
	}
};

/**
 * Pops up a MsgBox to decide which whiteboard image to download
 * @private
 * @example $e.ui.downloadWhiteboard()
 */
$e.ui.downloadWhiteboard = () => {
	let msgBoxContent = "";
	if ($e.session.lastChange > $e.session.lastRun) {
		msgBoxContent += "<div style=\"text-align:center;margin-top:20px;color:#882222;\">" + _("You have made changes to your code but you haven't run it yet.\nTherefore the whiteboard might not reflect your current code.") + "</div>";
	}
	msgBoxContent += "<div style=\"text-align:center;margin-top:20px\"><button id=\"whiteboard-downloadImage\" onclick=\"$e.ide.downloadWhiteboard();$e.ui.msgBox.close();\">" + _("Download whiteboard image") + "</button></div><br /><br />"
	// If there is more than one layer offer to download animation/grid
	let msgClass = "";
	let linkSrc = "";
	let textStyle = "";
	let inputType = "";
	if ($e.backend.whiteboard.layers.bottom.layerOver) {
		msgClass = "tab";
		linkSrc = ["$e.ui.downloadLayers(true)", "$e.ui.downloadLayers(false)"];
		textStyle = "";
		inputType = "";
	} else {
		msgClass = "tab disabled";
		linkSrc = ["", ""];
		textStyle = "text-disabled";
		inputType = "disabled";
	}
	msgBoxContent +=
		"<div style=\"text-align:center\" class=\"" + textStyle + "\">" +
			"<button id=\"whiteboard-downloadLayers-animation\" class=\"" + msgClass + "\" onclick=\"" + linkSrc[0] + "\">" + _("Download layers as animation") + "</button>" + 
			"<div>" +
				_("Animation interval (in msecs)") + ": <input id=\"setup-downloadLayers-interval\" type=\"number\" " + inputType + " value=\"" + $e.ui.downloadLayersInterval + "\" min=\"0\" onchange=\"$e.ui.downloadLayersInterval=this.value\" style=\"width:40px\" />" +
			"</div>" +
		"</div>" +
		"<br />" +
		"<div style=\"text-align:center\" class=\"" + textStyle + "\">" +
			"<button id=\"whiteboard-downloadLayers-grid\" class=\"" + msgClass + "\" onclick=\"" + linkSrc[1] + "\">" + _("Download layers in a grid") + "</button>" +
			"<div>" +
				_("Layers per row") + ": <input id=\"setup-downloadLayers-columns\" type=\"number\" value=\"" + $e.ui.downloadLayersColumns + "\" " + inputType + " min=\"1\" onchange=\"$e.ui.downloadLayersColumns=this.value\" style=\"width:40px\" />" +
			"</div>" +
		"</div>";
	$e.ui.msgBox.open(msgBoxContent, { noSubmit: true, cancelName: _("Close") });
};

/**
 * Returns an image containing all the layers
 * @private
 * @param {Boolean} [animation=false] Set to true to download as an animation
 * @param {Number} [setup] If defined, sets the interval in ms (when animation=true) or the amount of columns (when animation=false). If undefined it gets the value from the UI
 * @return {String} Binary of the image
 * @example $e.ide.imagifyLayers(true, 5)
 */
$e.ide.imagifyLayers = (animation, setup) => {
	if (setup === undefined) {
		if (animation) {
			setup = $e.ui.element.querySelector("#setup-downloadLayers-interval").value;
		} else {
			setup = $e.ui.element.querySelector("#setup-downloadLayers-columns").value;
		}
	}
	let columns = setup;
	if (columns < 1 || !$e.isNumber(columns, true)) {
		columns = 1;
	}
	let imageBinary;
	let encoder;
	if (animation) {
		encoder = new GIFEncoder();
		encoder.setRepeat(0); //0 -> loop forever //1+ -> loop n times then stop
		let interval = setup;
		if (!$e.isNumber(interval, true)) {
			interval = 500;
		}
		encoder.setDelay(interval); //go to next frame every n milliseconds 
		encoder.start();
	}
	let layer = $e.backend.whiteboard.layers.bottom; // We skip first frame which is the grid
	const canvas = document.createElement('canvas');
	if (animation) {
		canvas.width = $e.backend.whiteboard.layers.available["grid"].canvas.width;
		canvas.height = $e.backend.whiteboard.layers.available["grid"].canvas.height;
	} else {
		let count = 0;
		let currentLayer = $e.backend.whiteboard.layers.bottom;
		while (currentLayer) {
			currentLayer = currentLayer.layerOver;
			count++;
		}
		if (count < columns) {
			canvas.width = $e.backend.whiteboard.layers.available["grid"].canvas.width * count;
		} else {
			canvas.width = $e.backend.whiteboard.layers.available["grid"].canvas.width * columns;
		}
		canvas.height = $e.backend.whiteboard.layers.available["grid"].canvas.height * (Math.floor((count - 1) / columns) + 1);
	}
	const whiteboardWidth = $e.backend.whiteboard.layers.available["grid"].canvas.width;
	const whiteboardHeight = $e.backend.whiteboard.layers.available["grid"].canvas.height;
	let count = 0;
	const ctx = canvas.getContext("2d");
	while (layer) {
		let shiftX = 0, shiftY = 0;
		if (!animation) {
			shiftX = whiteboardWidth * (count % columns);
			shiftY = whiteboardHeight * Math.floor(count / columns);
		}
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(shiftX, shiftY, whiteboardWidth, whiteboardHeight);
		if ($e.ui.gridVisible) {
			ctx.drawImage($e.backend.whiteboard.layers.available["grid"].canvas, shiftX, shiftY); // draw grid
		}
		if (layer != $e.backend.whiteboard.layers.available["grid"]) {
			ctx.drawImage(layer.canvas, shiftX, shiftY);
		}
		if ($e.ui.guideVisible) {
			$e.ui.drawDebugGuide(ctx, layer.guide, layer.name, shiftX, shiftY, true);
		}
		if (!animation) {
			ctx.strokeStyle = "#000000";
			ctx.moveTo(shiftX, shiftY);
			ctx.lineTo(shiftX + whiteboardWidth, shiftY);
			ctx.lineTo(shiftX + whiteboardWidth, whiteboardHeight + shiftY);
			ctx.lineTo(whiteboardWidth, whiteboardHeight + shiftY);
			ctx.lineTo(whiteboardWidth, shiftY);
			ctx.stroke();
		}
		// Watermark
		ctx.font = "20px Arial";
		ctx.strokeStyle = "#99AAAAAA";
		if ($e.ui.element.querySelector("#toolbox-debug-command-input").value != "nocaption") {
			ctx.strokeText(_("Made with %s", [ $e.platform.web.text ]), shiftX + whiteboardWidth / 4, shiftY + whiteboardHeight - 20);
		}
		if (animation) {
			encoder.addFrame(ctx);
		}
		layer = layer.layerOver;
		count++;
	}
	let extension;
	if (animation) {
		encoder.finish();
		imageBinary = 'data:image/gif;base64,' + window.btoa(encoder.stream().getData());
		extension = "gif";
	} else {
		imageBinary = canvas.toDataURL();
		extension = "png";
	}
	return imageBinary;
};

/**
 * Links an A HTML element to an image containing all the layers
 * @private
 * @param {Boolean} grid Set to true to download as a grid
 * @example $e.ide.downloadLayers(document.body.createElement("a"))
 */
$e.ide.downloadLayers = (grid) => {
	const image = $e.ide.imagifyLayers(grid);
	let link = $e.ui.element.querySelector("#downloadLayers-link");
	if (!link) {
		if (grid) {
			link = $e.ui.element.querySelector("#whiteboard-downloadLayers-grid");
		} else {
			link = $e.ui.element.querySelector("#whiteboard-downloadLayers-animation");
		}
	}
	const dataTuple = $e.dataURItoB64(image);
	const data = dataTuple.data;
	const filename = "layers-" + new Date().getTime() + "." + dataTuple.mimetype.split("/")[1];
	const mimetype = dataTuple.mimetype;
	$e.ide.saveFile(data, filename, mimetype);
};

/**
 * Initializes or resets the grid modes select
 * @private
 * @example $e.ui.resetGridModeSelect()
 */
$e.ui.resetGridModeSelect = () => {
	const element = $e.ui.element.querySelector("#setup-grid-coordinates");
	// Clean select
	for (let i = element.options.length; i > 0; i--) {
		element.remove(0);
	}
	// Add options
	const gridModes = $e.backend.whiteboard.axis.predefined;
	const currentPredefinedMode = $e.backend.whiteboard.axis.userSelection;
	gridModes.forEach((gridMode, i) => {
		const option = document.createElement("option");
		option.value = i;
		option.text = _(gridMode.name);
		if (i == currentPredefinedMode || (currentPredefinedMode == undefined && gridModes[i].initial)) {
			option.selected = true;
		}
		element.add(option);
	});
	// If we are currently using a custom axis setup (could happen when changing translation) add Custom option
	if ($e.backend.whiteboard.axis.getIndexInPredefined() == -1) {
		const option = document.createElement("option");
		option.value = gridModes.length;
		option.text = _("Custom");
		option.selected = true;
		element.add(option);
	}
};

/**
 * Initializes the guide layer
 * @private
 * @example $e.ui.initGuide()
 */
$e.ui.initGuide = () => {
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	const name = "guide";
	const el = document.createElement("div");
	el.id = "canvas-wrapper-" + name;
	el.classList.add("canvas-wrapper");
	el.style.width = canvasWidth + "px";
	el.style.height = canvasHeight + "px";
	el.style.zIndex = 9999;
	const canvas = document.createElement("canvas");
	canvas.id = "canvas-guide";
	canvas.classList.add("canvas");
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	el.appendChild(canvas);
	$e.backend.whiteboard.element.appendChild(el);
	$e.backend.whiteboard.layers.available[name] = { name: name, canvas: canvas, element: el };
};

/**
 * Hides/Shows the guide layer
 * @private
 * @param {Boolean} [visible=true] Show or hide the guide (default: show)
 * @example $e.ui.resetGuide()
 */
$e.ui.resetGuide = (visible) => {
	const guideCanvas = $e.backend.whiteboard.layers.available["guide"];
	if (visible === false || $e.ui.guideVisible === false) {
		guideCanvas.element.classList.add("hide");
	} else {
		$e.backend.whiteboard.guides.draw(); // Since we weren't drawing it draw it now
		guideCanvas.element.classList.remove("hide");
	}
};

/**
 * Toggles the visibility of the guide
 * @private
 * @example $e.toggleGuideFromUI()
 */
$e.toggleGuideFromUI = () => {
	$e.ui.guideVisible = $e.ui.element.querySelector("#setup-guide-enable").checked;
	$e.ui.resetGuide();
};

/**
 * Shows/Hides a layer
 * @private
 * @param {Number} id Layer id
 * @param {Boolean} [force] True to force switch on, false to force switch off
 * @example $e.ui.toggleCanvas(3)
 */
$e.ui.toggleCanvas = (id, force) => {
	const el = $e.backend.whiteboard.layers.get(id).element;
	if (force === true || el.classList.contains("hide")) {
		el.classList.remove("hide");
	} else {
		el.classList.add("hide");
	}
};

/**
 * Draws a guide
 * @private
 * @param {Object} context Context object where to draw the guide
 * @param {Array} pos Coordinates of the guide
 * @param {Number} id Id of the layer
 * @param {Number} [shiftX=0] Shift X coordinates by this value
 * @param {Number} [shiftY=0] Shift Y coordinates by this value
 * @param {Boolean} [discardOutbound=false] Discard if the guide is out of the whiteboard
 * @example $e.ui.drawDebugGuide(ctx, { x: 200, y: 200 }, id)
 */
$e.ui.drawDebugGuide = (context, pos, id, shiftX, shiftY, discardOutbound) => {
	if (shiftX === undefined) {
		shiftX = 0;
	}
	if (shiftY === undefined) {
		shiftY = 0;
	}
	if (discardOutbound === undefined) {
		discardOutbound = false;
	}
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	if ((pos.x < 0 || pos.x > canvasWidth || pos.y < 0 || pos.y > canvasHeight) && discardOutbound === false) {
		$e.ide.drawOutOfBoundsGuide(context, pos, shiftX, shiftY);
	} else {
		const guideCanvas = document.createElement("canvas");
		guideCanvas.classList.add("canvas");
		guideCanvas.width = canvasWidth;
		guideCanvas.height = canvasHeight;
		$e.backend.whiteboard.guides.draw(id, guideCanvas);
		context.drawImage(guideCanvas, shiftX, shiftY);
	}
};

/**
 * Draws a debug out-of-bounds guide
 * @private
 * @param {Object} context Context object where to draw the guide
 * @param {Array} pos Coordinates of the guide
 * @param {Number} id Id of the layer
 * @param {Number} [shiftX=0] Shift X coordinates by this value
 * @param {Number} [shiftY=0] Shift Y coordinates by this value
 * @param {Boolean} [discardOutbound=false] Discard if the guide is out of the whiteboard
 * @example $e.ui.drawDebugGuide(ctx, { x: 200, y: 200 }, id)
 */
$e.ide.drawOutOfBoundsGuide = (context, pos, shiftX, shiftY) => {
	const markerSize = 20;
	const org = { x: pos.x, y: pos.y };
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
	const modulus = Math.sqrt((pos.x - org.x) * (pos.x - org.x) + (pos.y - org.y) * (pos.y - org.y));
	const posVector = { x: (pos.x - org.x) / modulus, y: (pos.y - org.y) / modulus };
	const angle = Math.atan2(posVector.y, posVector.x);
	const size = 20;
	const frontx = org.x + size * Math.cos(angle);
	const fronty = org.y + size * Math.sin(angle);
	const leftx = org.x + size / 2 * Math.cos(angle + Math.PI / 3);
	const lefty = org.y + size / 2 * Math.sin(angle + Math.PI / 3);
	const rightx = org.x + size / 2 * Math.cos(angle - Math.PI / 3);
	const righty = org.y + size / 2 * Math.sin(angle - Math.PI / 3);
	const ctx = context;
	// draw guide
	ctx.lineWidth = 1;
	ctx.strokeStyle = "#FF5555";
	ctx.fillStyle = "#FF9999";
	ctx.beginPath();
	ctx.moveTo(shiftX + rightx, shiftY + righty);
	ctx.lineTo(shiftX + leftx, shiftY + lefty);
	ctx.lineTo(shiftX + frontx, shiftY + fronty);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(shiftX + org.x, shiftY + org.y, size / 2, 2 * Math.PI, 0, false);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(shiftX + org.x, shiftY + org.y, size / 2 + 2, angle - Math.PI / 1.5, angle + Math.PI / 1.5, true);
	ctx.stroke();
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(shiftX + org.x, shiftY + org.y, size / 2 + 5, angle - Math.PI / 1.4, angle + Math.PI / 1.4, true);
	ctx.stroke();
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(shiftX + org.x, shiftY + org.y, size / 2 + 9, angle - Math.PI / 1.3, angle + Math.PI / 1.3, true);
	ctx.stroke();
};

/**
 * Initializes/Resets the grid layer
 * @private
 * @example $e.ide.resetGrid()
 */
$e.ide.resetGrid = () => {
	const ctx = $e.backend.whiteboard.layers.available["grid"].context;
	$e.backend.whiteboard.layers.clear("grid");
	if ($e.ui.gridVisible) {
		$e.ide.drawGrid(ctx);
	}
};

/**
 * Toggles the visibility of the grid
 * @private
 * @example $e.ui.toggleGrid()
 */
$e.ui.toggleGrid = () => {
	$e.ui.gridVisible = $e.ui.element.querySelector("#setup-grid-enable").checked;
	$e.ide.resetGrid();
};

/**
 * Toggles the visibility of the guide
 * @private
 * @example $e.updateGridStepFromUI()
 */
$e.ui.updateGridDivisions = () => {
	const value = parseInt($e.ui.element.querySelector("#setup-grid-divisions").value);
	if (value > 0 && value < $e.backend.whiteboard.width / 2) {
		$e.ui.gridStep = $e.backend.whiteboard.width / (value + 1);
		$e.ide.resetGrid();
	} else {
		$e.ui.element.querySelector("#setup-grid-divisions").value = Math.round($e.backend.whiteboard.width / $e.ui.gridStep) - 1;
	}
};

/**
 * Draws a grid
 * @private
 * @param {Object} context Context object where to draw the grid
 * @example $e.ide.drawGrid(ctx)
 */
$e.ide.drawGrid = (ctx) => {
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	ctx.font = "bold 10px Arial";
	ctx.fillStyle = "#AAAAAA";
	const margin = 2, fontHeight = 7, fontWidth = 5;
	const coorUpperLeft = $e.backend.whiteboard.axis.system2userCoords({ x: 0, y: 0 });
	const coorLowerRight = $e.backend.whiteboard.axis.system2userCoords({ x: $e.backend.whiteboard.width, y: $e.backend.whiteboard.width });
	const roundXCoords = (Math.abs(coorUpperLeft.x - coorLowerRight.x) > 20);
	const roundYCoords = (Math.abs(coorUpperLeft.y - coorLowerRight.y) > 20);
	ctx.fillText("(" + (roundXCoords ? parseInt(coorUpperLeft.x) : coorUpperLeft.x) + "," + (roundYCoords ? parseInt(coorUpperLeft.y) : coorUpperLeft.y) + ")", margin, fontHeight + margin);
	ctx.fillText("(" + (roundXCoords ? parseInt(coorLowerRight.x) : coorLowerRight.x) + "," + (roundYCoords ? parseInt(coorLowerRight.y) : coorLowerRight.y) + ")", canvasWidth - (canvasWidth.toString().length * 2 + 3) * fontWidth - margin, canvasHeight - 2 - margin);
	let step = parseFloat($e.ui.gridStep);
	if (step < 1) {
		step = 1;
		$e.ui.element.querySelector("#setup-grid-step").value = step;			
	}
	const colorHighlight = "#A0A0A0";
	const colorNormal = "#B0B0B0";
	ctx.fillStyle = colorHighlight;
	ctx.strokeStyle = colorNormal;
	ctx.lineWidth = 1;
	const xUserStep = step / $e.backend.whiteboard.axis.scale.x;
	for (let i = step, text = coorUpperLeft.x + xUserStep; i < canvasWidth; i += step, text += xUserStep) {
		ctx.fillText(roundXCoords ? parseInt(text) : text, i, 7);
		if (text == 0) {
			ctx.strokeStyle = colorHighlight;
		} else {
			ctx.strokeStyle = colorNormal;
		}
		ctx.beginPath();
		// We use half-pixels to be able to draw 1px wide lines
		ctx.moveTo(i - 0.5, 0 - 0.5);
		ctx.lineTo(i - 0.5, canvasHeight - 0.5);
		ctx.closePath();
		ctx.stroke();
	}
	const yUserStep = step / $e.backend.whiteboard.axis.scale.y;
	for (let i = step, text = coorUpperLeft.y + yUserStep; i < canvasHeight; i += step, text += yUserStep) {
		ctx.fillText(roundYCoords ? parseInt(text) : text, 0, i);
		if (text == 0) {
			ctx.strokeStyle = colorHighlight;
		} else {
			ctx.strokeStyle = colorNormal;
		}
		ctx.beginPath();
		// We use half-pixels to be able to draw 1px wide lines
		ctx.moveTo(0 - 0.5, i - 0.5);
		ctx.lineTo(canvasWidth - 0.5, i - 0.5);
		ctx.closePath();
		ctx.stroke();
	}
};

/**
 * Resizes the whiteboard based on the available size
 * @private
 * @example $e.ui.whiteboardResizeHandler()
 */	
$e.ui.whiteboardResizeHandler = () => {
	const whiteboardEl = $e.backend.whiteboard.element;
	if ($e.ui.element.querySelector("#view").classList.contains("maximized")) {
		whiteboardEl.style.transform = "";
		return;
	}
	// Scale value cannot be calculated in CSS directly (because CSS has no way of running parseInt() on distance units), so we have to set it with javascript
	const whiteboardWrapperStyle = getComputedStyle($e.ui.element.querySelector("#whiteboard-wrapper"));
	const availableWidth = parseInt(whiteboardWrapperStyle.width) + parseInt(whiteboardWrapperStyle.marginLeft) + parseInt(whiteboardWrapperStyle.marginRight);
	const whiteboardTabsStyle = getComputedStyle($e.ui.element.querySelector("#whiteboard-tabs"));
	const availableHeight = parseInt(whiteboardWrapperStyle.height) - parseInt(whiteboardTabsStyle.height);
	const scale_width = availableWidth / $e.backend.whiteboard.width;
	const scale_height = availableHeight / $e.backend.whiteboard.width;
	const scale = Math.min(scale_width, scale_height);
	$e.ui.element.style.setProperty("--whiteboard-scale", scale);
};

/**
 * Initializes/Resets all the execution elements
 * @private
 * @example $e.ui.clear()
 */
$e.ui.clear = () => {
	$e.ide.reset();
};

/**
 * Provides whiteboard dimensions from javascript to css
 * @private
 * @example $e.ui.loadWhiteboardSize()
 */
$e.ui.loadWhiteboardSize = () => {
	$e.ui.element.style.setProperty("--whiteboard-width", parseInt($e.backend.whiteboard.width) + "px");
	$e.ui.element.style.setProperty("--whiteboard-height", parseInt($e.backend.whiteboard.width) + "px");
};

/**
 * Change whiteboard axis setup, called by the UI
 * @private
 * @example $e.ui.changeAxis()
 */
$e.ui.changeAxis = async () => {
	$e.backend.whiteboard.axis.userSelection = $e.ui.element.querySelector("#setup-grid-coordinates").value;
	$e.backend.whiteboard.axis.update();
	await $e.backend.whiteboard.reset();
};