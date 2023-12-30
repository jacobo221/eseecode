"use strict";

/**
 * Returns if a layer exists with this id
 * @private
 * @param {String} value Value to test
 * @return {Boolean} True if a layer exists with this id, false otherwise
 * @example $e.backend.whiteboard.layers.isLayer(5)
 */
$e.backend.whiteboard.layers.isLayer = (value) => {
	let retVal;
	if ($e.isNumber(value, true)) {
		retVal = ($e.backend.whiteboard.layers.get(value) !== undefined);
	} else {
		retVal = ($e.backend.whiteboard.layers.available[value] !== undefined);
	}
	return retVal;
};

/**
 * Initializes/Resets the whiteboard
 * @private
 * @param {Boolean} [runPrecode=true] If false precode is not executed
 * @example $e.backend.whiteboard.reset()
 */
$e.backend.whiteboard.reset = async (runPrecode = true) => {
	$e.ui.element.querySelector("#toolbox-debug-execute-stats").textContent = "";
	$e.backend.whiteboard.layers.bottom = null;
	$e.backend.whiteboard.layers.top = null;
	// reset canvas
	Object.keys($e.backend.whiteboard.layers.available).forEach((id) => $e.backend.whiteboard.layers.remove(id)); // Use Object.keys() because for..in will give also Array.prototype polyfills in Safari 13
	$e.execution.stop();
	$e.debug.resetMonitors();
	$e.ui.debug.updateMonitors();
	$e.backend.events.reset();
	delete $e.backend.whiteboard.layers.available;
	$e.backend.whiteboard.layers.available = {};
	$e.backend.whiteboard.element.width = $e.backend.whiteboard.width + "px";
	$e.backend.whiteboard.element.height = $e.backend.whiteboard.width + "px";
	$e.ui.initGuide();
	$e.backend.whiteboard.layers.getOrCreate("grid").canvas.style.zIndex = -1; // canvas-0 is special
	$e.backend.whiteboard.layers.switch(); // canvas-0 is the default
	$e.backend.whiteboard.axis.update();
	// reset guide	
	$e.backend.whiteboard.guides.setAngleAndMove($e.backend.whiteboard.axis.user2systemAngle(0), $e.backend.whiteboard.axis.user2systemCoords({ x: 0, y: 0 }));
	// reset windows
	Object.keys($e.backend.windows.available).forEach((id) => { // Use Object.keys() because for..in will give also Array.prototype polyfills in Safari 13
		if ($e.backend.windows.available[id]) {
			$e.ui.toolboxWindow.removeChild($e.backend.windows.available[id]);
			delete $e.backend.windows.available[id];
		}
	});
	$e.backend.windows.current = undefined;
	delete $e.backend.windows.available;
	$e.backend.windows.available = [];
	$e.backend.windows.getOrCreate(0);
	$e.ui.element.querySelector("#toolbox-tabs-window").classList.add("hide");
	if (runPrecode && !$e.execution.current.precode.standby) {
		$e.session.runFrom = "reset_canvas";
		await $e.execution.execute(true, undefined, true);
	}
	$e.execution.current.layersChanged = [];
	$e.execution.updateStatus("clean");
};

/** Returns a layer in the whiteboard
 * If needed, layer is created overlapping exactly the whiteboard element
 * The created layer can be accessed via $e.backend.whiteboard.layers.available[id]
 * @private
 * @param {Number|String} [id] Layer id (if blank it creates a new id)
 * @return {!Object} Layer in the whiteboard
 * @throws $e.execution.codeError
 * @example $e.backend.whiteboard.layers.current = $e.backend.whiteboard.layers.getOrCreate(id)
 */
$e.backend.whiteboard.layers.getOrCreate = (id) => {
	let layer = undefined;
	if (typeof id === "undefined") id = "canvas-" + $e.backend.newblockId();
	else layer = $e.backend.whiteboard.layers.get(id);

	if (layer) return layer;

	if ($e.isNumber(id, true)) throw $e.execution.codeError("use", _("No layer exists in this position") + ": " + id);
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	const wrapperEl = document.createElement("div");
	wrapperEl.id = "canvas-wrapper-" + id;
	wrapperEl.classList.add("canvas-wrapper");
	if ($e.backend.whiteboard.layers.top) wrapperEl.style.zIndex = Number($e.backend.whiteboard.layers.top.element.style.zIndex) + 1;
	else if ($e.backend.whiteboard.layers.available["grid"]) wrapperEl.style.zIndex = Number($e.backend.whiteboard.layers.available["grid"].element.style.zIndex) + 1;
	else wrapperEl.style.zIndex = 0; // No canvas exist yet, suppose it is grid
	const canvas = document.createElement("canvas");
	canvas.name = id;
	canvas.classList.add("canvas");
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	const context = canvas.getContext("2d");
	const origin = $e.backend.whiteboard.axis.user2systemCoords({ x: 0, y: 0 });
	if ($e.execution.background) {
		const img = new Image();
		img.onload = () => {
			const ctx = canvas.getContext("2d");
			ctx.save();
			ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
			ctx.restore();
			ctx.translate(canvasWidth / 2, canvasHeight / 2);
			// Restore the canvas position and orientation for future image() calls
			ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
		}
		img.src = $e.execution.background;
	}
	$e.backend.whiteboard.layers.available[id] = {
		name: id,
		canvas: canvas,
		context: context,
		element: wrapperEl,
		guide: { x: origin.x, y: origin.y, angle: 0 },
		style: { color: "#000000", font: "sans-serif", size: 2, alpha: 1, bold: false, italic: false },
		shaping: false,
		layerOver: null,
		layerUnder: $e.backend.whiteboard.layers.top,
		position: undefined,
	};
	layer = $e.backend.whiteboard.layers.available[id];
	layer.context.lineWidth = layer.style.size;
	layer.context.fillStyle = layer.style.color;
	layer.context.strokeStyle = layer.style.color;
	layer.context.strokeStyle = layer.style.color;
	let font = "";
	if (layer.style.italic) font += "italic ";
	if (layer.style.bold) font += "bold ";
	font += (layer.style.size + $e.setup.defaultFontSize) + "px ";
	font += layer.style.font;
	layer.context.font = font;
	layer.context.globalAlpha = layer.style.alpha;
	wrapperEl.appendChild(canvas);

	if (id != "grid" && id != "guide") { // grid/guide canvas don't count as top or bottom
		if ($e.backend.whiteboard.layers.top) $e.backend.whiteboard.layers.top.layerOver = layer;
		$e.backend.whiteboard.layers.top = layer; // newest canvas is always on top
		if (!$e.backend.whiteboard.layers.bottom) $e.backend.whiteboard.layers.bottom = layer;
	}

	layer.position = layer.element.style.zIndex;
	
	$e.backend.whiteboard.element.appendChild(wrapperEl);
	if ($e.execution.current.layersChanged !== true) $e.execution.current.layersChanged.push(id);

	return layer;
};

/** Returns the layer
 * @private
 * @param {Number|String} id Layer id (can be the name or the position in the layers stack)
 * @return {Array<*>} The desired layer
 * @example $e.backend.whiteboard.layers.get("guide")
 */
$e.backend.whiteboard.layers.get = (layerId) => {
	let layer = undefined;
	if ($e.isNumber(layerId, true)) {
		if (layerId >= 0) {
			layer = $e.backend.whiteboard.layers.bottom;
			for (let count=0; count < parseInt(layerId) && layer; count++) {
				layer = layer.layerOver;
			}
		} else return undefined;
	} else layer = $e.backend.whiteboard.layers.available[layerId];
	return layer;
};

/** Pushes a layer down in the layers order
 * @public
 * @param {Number} [levels=1] Amount of steps to push the layer down
 * @param {Number|String} [id] Id of the layer to affect
 * @throws codeError
 * @example $e.backend.whiteboard.layers.push(3)
 */
$e.backend.whiteboard.layers.push = (levels, id) => {

	let layer;
	if (id === undefined) layer = $e.backend.whiteboard.layers.current;
	else layer = $e.backend.whiteboard.layers.get(id);

	if ($e.backend.whiteboard.layers.top == layer && layer.layerUnder) { // We must check if layer.layerUnder exists because it could just be reduntant push() calls
		$e.backend.whiteboard.layers.top = layer.layerUnder;
	}
	for (let oldLayerOver = layer.layerOver, oldLayerUnder = layer.layerUnder, oldlayerZIndex = layer.element.style.zIndex; layer.layerUnder && levels > 0; levels--) {
		layer.element.style.zIndex = oldLayerUnder.element.style.zIndex;
		oldLayerUnder.element.style.zIndex = oldlayerZIndex;
		if (oldLayerOver) oldLayerOver.layerUnder = oldLayerUnder;
		if (oldLayerUnder.layerUnder) oldLayerUnder.layerUnder.layerOver = layer;
		layer.layerOver = oldLayerUnder;
		layer.layerUnder = oldLayerUnder.layerUnder;
		oldLayerUnder.layerOver = oldLayerOver;
		oldLayerUnder.layerUnder = layer;

		layer.position = layer.element.style.zIndex;
		oldLayerUnder.position = oldLayerUnder.element.style.zIndex;
	}

	if (!layer.layerUnder) $e.backend.whiteboard.layers.bottom = layer;

	$e.execution.current.layersChanged = true; // Mark layers to be fully refreshed in debug toolbox
};

/** Pulls a layer up in the layers order
 * @public
 * @param {Number} [levels=1] Amount of steps to pull the layer up
 * @param {Number|String} [id] Id of the layer to affect
 * @throws codeError
 * @example $e.backend.whiteboard.layers.pull(3)
 */
$e.backend.whiteboard.layers.pull = (levels, id) => {

	let layer;
	if (id === undefined) layer = $e.backend.whiteboard.layers.current;
	else layer = $e.backend.whiteboard.layers.get(id);

	if ($e.backend.whiteboard.layers.top == layer && layer.layerUnder) { // We must check if layer.layerUnder exists because it could just be reduntant push() calls
		$e.backend.whiteboard.layers.top = layer.layerUnder;
	}
	for (let oldLayerOver = layer.layerOver, oldLayerUnder = layer.layerUnder, oldlayerZIndex = layer.element.style.zIndex; layer.layerUnder && levels > 0; levels--) {
		layer.element.style.zIndex = oldLayerUnder.element.style.zIndex;
		oldLayerUnder.element.style.zIndex = oldlayerZIndex;
		if (oldLayerOver) oldLayerOver.layerUnder = oldLayerUnder;
		if (oldLayerUnder.layerUnder) oldLayerUnder.layerUnder.layerOver = layer;
		layer.layerOver = oldLayerUnder;
		layer.layerUnder = oldLayerUnder.layerUnder;
		oldLayerUnder.layerOver = oldLayerOver;
		oldLayerUnder.layerUnder = layer;

		layer.position = layer.element.style.zIndex;
		oldLayerUnder.position = oldLayerUnder.element.style.zIndex;
	}

	if (!layer.layerUnder) $e.backend.whiteboard.layers.bottom = layer;

	$e.execution.current.layersChanged = true; // Mark layers to be fully refreshed in debug toolbox
};

/** Deletes a layer from the whiteboard
 * @private
 * @param {Number} [id] Layer id
 * @example $e.backend.whiteboard.layers.remove(3)
 */
$e.backend.whiteboard.layers.remove = (id) => {
	const layer = $e.backend.whiteboard.layers.get(id);
	if (layer) {
		$e.backend.whiteboard.element.removeChild(layer.element);
		if ($e.backend.whiteboard.layers.top == layer) {
			$e.backend.whiteboard.layers.top = layer.layerUnder;
		}
		delete $e.backend.whiteboard.layers.available[layer.name];
	}
};

/** Switches the currently active layer, returns the layer
 * @private
 * @param {Number|String} [id] Layer id
 * @return {!Object} The layer
 * @example $e.backend.whiteboard.layers.switch(3)
 */
$e.backend.whiteboard.layers.switch = (id) => {
	$e.backend.whiteboard.layers.current = $e.backend.whiteboard.layers.getOrCreate(id);
	$e.backend.whiteboard.guides.draw(); // switch to the apropiate guide
	return $e.backend.whiteboard.layers.current;
};

/**
 * Sets the font properties on the currently active layer context
 * @private
 * @param {!HTMLElement} [context] Canvas context to take style difinitions from. If unset, currently active layer
 * @example $e.backend.whiteboard.layers.applyTextStyle(ctx)
 */
$e.backend.whiteboard.layers.applyTextStyle = (context) => {
	if (context === undefined) context = $e.backend.whiteboard.layers.current.context;
	const style = $e.backend.whiteboard.layers.current.style;
	let font = "";
	if (style.italic) font += "italic ";
	if (style.bold) font += "bold ";
	font += (style.size + $e.setup.defaultFontSize) + "px ";
	font += style.font.startsWith("\"") ? style.font : "\"" + style.font + "\""; // Always wrap in quotes tu support multi-word font names
	context.font = font;
};

/**
 * Sets the size of the future draw lines and text
 * @private
 * @param {Number} [size] Size in pixels. If unset uses currently active layer's size
 * @param {Number} [context] Canvas context to apply to. If unset applies to currently active layer
 * @example $e.backend.whiteboard.layers.setSize(2, ctx)
 */
$e.backend.whiteboard.layers.setSize = (size, context) => {
	if (size === undefined) size = $e.backend.whiteboard.layers.current.style.size;
	if (context === undefined) context = $e.backend.whiteboard.layers.current.context;
	$e.backend.whiteboard.layers.current.style.size = size;
	if (size < 1) context.lineWidth = 1;
	else context.lineWidth = size;
	$e.backend.whiteboard.layers.applyTextStyle();
};

/**
 * Sets the color of the future draw lines and text
 * @private
 * @param {String} [color] Color to use. If unset uses currently active layer's color
 * @param {Number} [context] Canvas context to apply to. If unset applies to currently active layer
 * @example $e.backend.whiteboard.layers.setColor("#FF0000", ctx)
 */
$e.backend.whiteboard.layers.setColor = (color, context) => {
	if (color === undefined) color = $e.backend.whiteboard.layers.current.style.color;
	if (context === undefined) context = $e.backend.whiteboard.layers.current.context;
	$e.backend.whiteboard.layers.current.style.color = color;
	context.fillStyle = color;
	context.strokeStyle = color;
	$e.backend.whiteboard.layers.applyTextStyle(context);
};

/**
 * Draws a line from a coordinate to another using system coordinates
 * @private
 * @param {Array} origin Coordinates where the line starts
 * @param {Array} destination Coordinates where the line ends
 * @example $e.backend.whiteboard.layers.systemLineAt({x: 200, y: 200}, {x: 50, y: 50})
 */
$e.backend.whiteboard.layers.systemLineAt = async (origin, destination) => {
	const org = { x: origin.x, y: origin.y };
	const pos = { x: destination.x, y: destination.y };
	let shiftPixels = 0;
	if ($e.backend.whiteboard.layers.current.context.lineWidth == 1) {
		// We use half-pixels because otherwise setSize(1) draws lines 2px wide
		shiftPixels = 0.5;
	}
	if (!$e.backend.whiteboard.layers.current.shaping) {
		// Shape should use forward() or line()
		$e.backend.whiteboard.layers.current.context.beginPath();
		org.x += shiftPixels;
		org.y += shiftPixels;
		$e.backend.whiteboard.layers.current.context.moveTo(org.x, org.y);
	}
	pos.x += shiftPixels;
	pos.y += shiftPixels;

	await $e.backend.whiteboard.animate((countup, count) => {
		const xInc = (pos.x - org.x) / count;
		const yInc = (pos.y - org.y) / count;
		const x = org.x + xInc * countup;
		const y = org.y + yInc * countup;
		$e.backend.whiteboard.layers.current.context.lineTo(x, y);
		$e.backend.whiteboard.layers.current.context.stroke();
	});

	$e.backend.whiteboard.layers.current.context.lineTo(pos.x, pos.y);
	if (!$e.backend.whiteboard.layers.current.shaping) {
		$e.backend.whiteboard.layers.current.context.closePath();
	}
	$e.backend.whiteboard.layers.current.context.stroke();
};

/**
 * Writes text at a specific position
 * @private
 * @param {String} text Text to write
 * @param {Number} posx X coordinate to start writing
 * @param {Number} posy Y coordinate to start writing
 * @param {Number} [angle=0] Angle in which to write
 * @example $e.backend.whiteboard.layers.systemWriteAt("Hello!", 200, 200, 90)
 */
$e.backend.whiteboard.layers.systemWriteAt = (text, pos, angle) => {
	if (angle === undefined) angle = 0;
	// We must create a new canvas and merge, otherwise if writeAt was called in the middle of a shape it would break the shape
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	const tempCanvas = document.createElement("canvas");
	tempCanvas.width = canvasWidth;
	tempCanvas.height = canvasHeight;
	const tempCtx = tempCanvas.getContext("2d");
	tempCtx.translate(pos.x, pos.y);
	tempCtx.rotate(angle * Math.PI/180);
	// apply style properties to new canvas
	$e.backend.whiteboard.layers.setColor(undefined, tempCtx);
	$e.backend.whiteboard.layers.setSize(undefined, tempCtx);
	$e.backend.whiteboard.layers.applyTextStyle(tempCtx);
	tempCtx.fillText(text, 0, 0);
	tempCtx.translate(-pos.x, -pos.y);
	$e.backend.whiteboard.layers.current.context.drawImage(tempCanvas, 0, 0, canvasWidth, canvasHeight);
};

/**
 * Removes all content from a layer
 * @private
 * @param {Number} id Layer id
 * @example $e.backend.whiteboard.layers.clear(2)
 */
$e.backend.whiteboard.layers.clear = (id) => {
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	let ctx, canvas;
	if (typeof id === "undefined") {
		ctx = $e.backend.whiteboard.layers.current.context;
		canvas = $e.backend.whiteboard.layers.current.canvas;
	} else {
		const layer = $e.backend.whiteboard.layers.get(id);
		ctx = layer.context;
		canvas = layer.canvas;
	}
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
};
	
/**
 * Resets the guide icon in a layer
 * @private
 * @param {Number} [id] Layer id. If unset use the currently active layer
 * @param {Number} [canvas] Canvas to use. If unset use the "guide" layer
 * @param {Number} [forceOrg] Overwrite the guide's coordinates
 * @param {Number} [forceAngle] Overwrite the guide's angle
 * @example $e.backend.whiteboard.guides.draw()
 */
$e.backend.whiteboard.guides.draw = (id, canvas, forceOrg, forceAngle) => {
	if (id === undefined) id = $e.backend.whiteboard.layers.current.name;
	const targetCanvas = $e.backend.whiteboard.layers.get(id);
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	let size = $e.execution.guide.size;
	if (size < 0) size = 0;
	const org = forceOrg !== undefined ? forceOrg : targetCanvas.guide;
	const angle = forceAngle !== undefined ? forceAngle : targetCanvas.guide.angle;
	if (canvas === undefined) {
		if (!$e.ui.guideVisible) {
			return;
		}
		canvas = $e.backend.whiteboard.layers.available["guide"].canvas;
	}
	const ctx = canvas.getContext("2d");
	canvas.width = canvasWidth;
	// clear guide
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	const drawDefaultGuide = (ctx, org, angle, size) => {
		const frontx = org.x + size * Math.cos(angle * Math.PI / 180);
		const fronty = org.y + size * Math.sin(angle * Math.PI / 180);
		const leftx = org.x + size / 2 * Math.cos(angle * Math.PI / 180 + Math.PI / 3);
		const lefty = org.y + size / 2 * Math.sin(angle * Math.PI / 180 + Math.PI / 3);
		const rightx = org.x + size / 2 * Math.cos(angle * Math.PI / 180 - Math.PI / 3);
		const righty = org.y + size / 2 * Math.sin(angle * Math.PI / 180 - Math.PI / 3);
		// draw guide
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#888888";
		let gradient = ctx.createRadialGradient(frontx, fronty, size / 1.2, frontx, fronty, size / 10);
		gradient.addColorStop(0, 'rgb(100,100,100)');
		gradient.addColorStop(1, 'rgb(215,215,170)');
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.moveTo(rightx, righty);
		ctx.lineTo(leftx, lefty);
		ctx.lineTo(frontx, fronty);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		gradient = ctx.createRadialGradient(org.x, org.y, size, org.x, org.y, size / 10);
		gradient.addColorStop(0, 'rgb(0,0,0)');
		gradient.addColorStop(1, 'rgb(153,177,201)');
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(org.x, org.y, size / 2, 2 * Math.PI, 0, false);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
	const drawCustomGuide = (ctx, org, angle, size, targetCanvas, img) => {
		ctx.save();
		ctx.translate(org.x, org.y);
		ctx.rotate(targetCanvas.guide.angle*Math.PI/180);
		ctx.drawImage(img, -size, -size, size*2, size*2);
		ctx.restore();
	}
	if ($e.execution.guide.imageUrl) {
		if ($e.execution.current.guideCache.imageUrl != $e.execution.guide.imageUrl) {
			const src = $e.execution.guide.imageUrl;
			if (!src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("file://")) src = $e.execution.basepath + src;
			const img = new Image();
			img.onload = () => {
				drawCustomGuide(ctx, org, angle, size, targetCanvas, img);
				$e.execution.current.guideCache = {
					imageUrl: $e.execution.guide.imageUrl,
					imageObj: img,
				};
			};
			img.onerror = () => drawDefaultGuide(ctx, org, angle, size);
			img.src = src;
		} else {
			drawCustomGuide(ctx, org, angle, size, targetCanvas, $e.execution.current.guideCache.imageObj);
		}
	} else {
		drawDefaultGuide(ctx, org, angle, size);
	}
};

/**
 * Turns and moves the guide to the specified angle and position
 * @private
 * @param {Number} [angle] Angle
 * @param {Aeeay<Number, Number>} [pos] Position
 * @example $e.backend.whiteboard.guides.setAngleAndMove(90, { x: 50, y: 50 })
 */
$e.backend.whiteboard.guides.setAngleAndMove = async (angle = $e.backend.whiteboard.layers.current.guide.angle, pos = $e.backend.whiteboard.layers.current.guide) => {

	// We give the backend gthe final values so if the next instruction is run while the animation is still running, it uses the real final values
	const orgAngle = $e.backend.whiteboard.layers.current.guide.angle;
	$e.backend.whiteboard.layers.current.guide.angle = angle;
	$e.backend.whiteboard.layers.current.guide.angle %= 360;
	if ($e.backend.whiteboard.layers.current.guide.angle < 0) $e.backend.whiteboard.layers.current.guide.angle += 360;
	const org = { x: $e.backend.whiteboard.layers.current.guide.x, y: $e.backend.whiteboard.layers.current.guide.y };
	$e.backend.whiteboard.layers.current.guide.x = pos.x; // Make sure the value is integer
	$e.backend.whiteboard.layers.current.guide.y = pos.y; // Make sure the value is integer

	await $e.backend.whiteboard.animate((countup, count) => {
		const angleInc = (angle - orgAngle) / count;
		const forceAngle = orgAngle + angleInc * countup;
		const xInc = (pos.x - org.x) / count;
		const yInc = (pos.y - org.y) / count;
		const x = org.x + xInc * countup;
		const y = org.y + yInc * countup;
		$e.backend.whiteboard.guides.draw(undefined, undefined, { x, y }, forceAngle);
	});

	$e.backend.whiteboard.guides.draw();
};

/**
 * Controls a whiteboard animation
 * @private
 * @param {Function} callback Function to run on every frame, receives countup (number of iteration, beginning with 1), count (total number of iterations expected) and transitionTime (total time the animation takes)
 * @example $e.backend.whiteboard.animate((countup, count) => console.log(countup + "/" + count)))
 */
$e.backend.whiteboard.animate = async (callback) => {
	const currentInstruction = $e.execution.getProgramCounter(); // We'll use this to abort mid-animation if the code has moved on
	const transitionTime = $e.execution.instructionsPause - $e.execution.instructionsMinimumPause;
	if ($e.execution.current.animate && $e.execution.instructionsRefresh < transitionTime) {
		const count = transitionTime / $e.execution.instructionsRefresh;
		let countdown = count;
		await new Promise(r => {
			const transitionHandler = setInterval(() => {
				if (countdown-- && currentInstruction === $e.execution.getProgramCounter()) {
					callback(count - countdown, count, transitionTime);
				} else {
					clearInterval(transitionHandler);
					r();
				}
			}, $e.execution.instructionsRefresh);
		});
	}
	$e.execution.current.animatedTime = transitionTime; // Report that the instructionsPause time has taken up part of the instructionsPause time
};