"use strict";

/**
 * Checks the layers list and returns the debug layers list content
 * @private
 * @return {String} Debug layers list content
 * @example $e.debug.debugLayers()
 */
$e.debug.debugLayers = () => {
	const list = [];
	let oldLayer = null;
	let layer = $e.backend.whiteboard.layers.bottom;
	for (let i = 0; layer; i++) {
		list.push({ name: layer.name, position: i });
		oldLayer = layer;
		layer = layer.layerOver;
	}
	return list;
};

/**
 * Resets the layers list in debug window
 * @private
 * @example $e.ui.debug.resetLayers()
 */
$e.ui.debug.resetLayers = () => {
	let debugLayersEl = $e.ui.element.querySelector("#toolbox-debug-layers");
	debugLayersEl.textContent = "";
	const layers = $e.debug.debugLayers();
	$e.ui.debug.addOrUpdateLayers(layers);
	$e.ui.element.querySelector("#toolbox-debug-layers").addEventListener("pointerout", $e.ui.debug.unhighlightCanvas);
	$e.ui.debug.highlightCurrentLayer();
};

$e.ui.debug.addOrUpdateLayers = (layers) => {
	layers.forEach(layer => $e.ui.debug.addOrUpdateLayer(layer));
};

/**
 * Adds or updates a layer in debug window
 * @private
 * @param {String|Object} layer Layer object or its ID, to add or update in the debug toolbox
 * @example $e.ui.debug.addOrUpdateLayer("1", "toolbox-debug-layers")
 */
$e.ui.debug.addOrUpdateLayer = (layer) => {
	if (typeof layer == "string") layer = Object.values($e.backend.whiteboard.layers.available).find(v => v.name == layer);
	const debugLayersEl = $e.ui.element.querySelector("#toolbox-debug-layers");
	const id = layer.name;
	// Only set name to the layer if it has been explicitly set
	let checked = "";
	if (!$e.ui.element.querySelector("#canvas-wrapper-" + id).classList.contains("hide")) checked = " checked";
	const debugLayerElId = "toolbox-debug-layer-" + id;
	let debugLayerEl = $e.ui.element.querySelector("#" + debugLayerElId);
	if (!debugLayerEl) {
		debugLayerEl = document.createElement("div");
		debugLayerEl.id = debugLayerElId;
		debugLayersEl.appendChild(debugLayerEl);
	}
	let name = id;
	if (typeof id == "string" && id.startsWith("canvas-")) name = layer.position;
	debugLayerEl.innerHTML = "<span id=\"toolbox-debug-layer-" + id + "-position\" class=\"toolbox-debug-layers-position\">" + layer.position + ": </span>";
	debugLayerEl.innerHTML += "<input id=\"toolbox-debug-layer-" + id + "-toggle\" type=\"checkbox\" title=\"" + _("Toggle layer") + " " + id + "\"" + checked + " /" + ">";
	debugLayerEl.innerHTML += "<label id=\"toolbox-debug-layer-" + id + "-title\" for=\"toolbox-debug-layer-" + id + "-toggle\">" + _("Layer") + " " + name + "</label>";;
	$e.ui.element.querySelector("#toolbox-debug-layer-" + layer.name + "-title").addEventListener("pointerover", (id => { return (event) => { $e.ui.debug.highlightCanvas(id); }})(layer.name));
	$e.ui.element.querySelector("#toolbox-debug-layer-" + layer.name + "-toggle").addEventListener("change", (id => { return (event) => { $e.ui.toggleCanvas(id); }})(layer.name));

};

/**
 * Highlight the current layer in debug toolbox and unhighlights the others
 * @private
 * @example $e.ui.debug.highlightCurrentLayer()
 */
$e.ui.debug.highlightCurrentLayer = () => {
	Object.values($e.backend.whiteboard.layers.available).forEach(layer => $e.ui.debug.highlightLayer(layer.name, layer == $e.backend.whiteboard.layers.current ? true : false));
};

/**
 * Highlight the layer in debug toolbox
 * @private
 * @param {String} layer_name Layer name of the layer to highlight or unhighlight
 * @param {Boolean} highlight Whether to highlight or unhighlight the layer
 * @example $e.ui.debug.highlightLayer("1")
 */
$e.ui.debug.highlightLayer = (layer_name, highlight) => {
	const el = $e.ui.element.querySelector("#toolbox-debug-layer-" + layer_name);
	if (!el) return; // Some layers are not included in the debug toolbox, such as the background and the guide
	if (highlight) el.classList.add("highlight");
	else el.classList.remove("highlight");
};

/**
 * Select all/none of the debug layer checkboxes
 * @private
 * @example $e.ui.debug.selectAllNoneLayers()
 */
$e.ui.debug.selectAllNoneLayers = () => {
	const checkboxEl = $e.ui.element.querySelector("#toolbox-debug-layers-title-toggles-checkbox");
	const visibility = checkboxEl.checked;
	$e.ui.element.querySelectorAll("#toolbox-debug-layers input[type=checkbox]").forEach((el, i) => {
		el.checked = visibility;
		$e.ui.toggleCanvas(i, visibility);
	});
};

/**
 * Shows only a layer (hides the others)
 * @private
 * @param {Number} id Layer id
 * @example $e.ui.debug.highlightCanvas(3)
 */
$e.ui.debug.highlightCanvas = (id) => {
	$e.ui.debug.unhighlightCanvas(); // Make sure we never have more than one highlighted canvas
	// Since we destroy it and create it again every time it should always be on top of the canvas stack
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	const wrapperEl = document.createElement("div");
	wrapperEl.id = "canvas-wrapper-highlight";
	wrapperEl.classList.add("canvas-wrapper");
	wrapperEl.style.left = $e.backend.whiteboard.element.offsetLeft;
	wrapperEl.style.top = $e.backend.whiteboard.element.offsetTop;
	wrapperEl.style.width = canvasWidth + "px";
	wrapperEl.style.height = canvasHeight + "px";
	wrapperEl.style.zIndex = Number($e.backend.whiteboard.layers.available["guide"].element.style.zIndex) + 1;
	wrapperEl.classList.add("highlight");
	const canvas = document.createElement("canvas");
	canvas.classList.add("canvas");
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	const context = canvas.getContext("2d");
	if ($e.ui.gridVisible) {
		context.drawImage($e.backend.whiteboard.layers.available["grid"].canvas, 0, 0);
	}
	const targetCanvas = $e.backend.whiteboard.layers.get(id);
	context.drawImage(targetCanvas.canvas, 0, 0);
	$e.ui.drawDebugGuide(context, targetCanvas.guide, id);
	wrapperEl.appendChild(canvas);
	$e.backend.whiteboard.element.appendChild(wrapperEl);
};

/**
 * Resets the layers visibility back to normal after a highlightCanvas() call
 * @private
 * @example $e.ui.debug.unhighlightCanvas()
 */
$e.ui.debug.unhighlightCanvas = () => {
	const canvasEl = $e.ui.element.querySelector("#canvas-wrapper-highlight");
	if (canvasEl) canvasEl.remove();
};