"use strict";

/**
 * Returns the ordinal name of a number
 * @private
 * @param {Number} number Number
 * @return {String} Ordinal name of a number
 * @example $e.ordinal(3)
 */
$e.ordinal = (number) => {
	let value = "";
	if (number == 1) {
		value = _("1st");
	} else if (number == 2) {
		value = _("2nd");
	} else if (number == 3) {
		value = _("3rd");
	} else if (number == 4) {
		value = _("4th");
	} else {
		value = number + _("th");
	}
	return value;
};

/**
 * Returns if a value is a boolean or not
 * @private
 * @param {*} value Value to test
 * @param {Boolean} [parseString=false] If true, will parse string values to see if it contains a boolean
 * @return {Boolean} True if the value is a boolean, false otherwise
 * @example $e.isBoolean(true)
 */
$e.isBoolean = (value, parseString) => {
	if (typeof value === "boolean") {
		return true;
	} else if (parseString === true && (value == "true" || value == "false")) {
		return true;
	}
	return false;
};

/**
 * Returns if a value is a number or not
 * @private
 * @param {*} value Value to test
 * @param {Boolean} [parseString=false] If true, will parse string values to see if it contains a number
 * @return {Boolean} True if the value is a number, false otherwise
 * @example $e.isNumber(5)
 */
$e.isNumber = (value, parseString) => {
	if (parseString !== true && typeof value == "string") return false;
	return !isNaN(parseFloat(value)) && isFinite(value);
	
};

/**
 * Returns if the value is a color or not
 * @private
 * @param {Sring} value Value to test
 * @return {Boolean} True if the value is a color, false otherwise
 * @example $e.isColor("#123123")
 */
$e.isColor = (value) => {
	const colorTexts = [ "transparent", "AliceBlue", "AntiqueWhite", "Aqua", "Aquamarine", "Azure", "Beige", "Bisque", "Black", "BlanchedAlmond", "Blue", "BlueViolet", "Brown", "BurlyWood", "CadetBlue", "Chartreuse", "Chocolate", "Coral", "CornflowerBlue", "Cornsilk", "Crimson", "Cyan", "DarkBlue", "DarkCyan", "DarkGoldenRod", "DarkGray", "DarkGreen", "DarkKhaki", "DarkMagenta", "DarkOliveGreen", "DarkOrange", "DarkOrchid", "DarkRed", "DarkSalmon", "DarkSeaGreen", "DarkSlateBlue", "DarkSlateGray", "DarkTurquoise", "DarkViolet", "DeepPink", "DeepSkyBlue", "DimGray", "DodgerBlue", "FireBrick", "FloralWhite", "ForestGreen", "Fuchsia", "Gainsboro", "GhostWhite", "Gold", "GoldenRod", "Gray", "Green", "GreenYellow", "HoneyDew", "HotPink", "IndianRed", "Indigo", "Ivory", "Khaki", "Lavender", "LavenderBlush", "LawnGreen", "LemonChiffon", "LightBlue", "LightCoral", "LightCyan", "LightGoldenRodYellow", "LightGray", "LightGreen", "LightPink", "LightSalmon", "LightSeaGreen", "LightSkyBlue", "LightSlateGray", "LightSteelBlue", "LightYellow", "Lime", "LimeGreen", "Linen", "Magenta", "Maroon", "MediumAquaMarine", "MediumBlue", "MediumOrchid", "MediumPurple", "MediumSeaGreen", "MediumSlateBlue", "MediumSpringGreen", "MediumTurquoise", "MediumVioletRed", "MidnightBlue", "MintCream", "MistyRose", "Moccasin", "NavajoWhite", "Navy", "OldLace", "Olive", "OliveDrab", "Orange", "OrangeRed", "Orchid", "PaleGoldenRod", "PaleGreen", "PaleTurquoise", "PaleVioletRed", "PapayaWhip", "PeachPuff", "Peru", "Pink", "Plum", "PowderBlue", "Purple", "RebeccaPurple", "Red", "RosyBrown", "RoyalBlue", "SaddleBrown", "Salmon", "SandyBrown", "SeaGreen", "SeaShell", "Sienna", "Silver", "SkyBlue", "SlateBlue", "SlateGray", "Snow", "SpringGreen", "SteelBlue", "Tan", "Teal", "Thistle", "Tomato", "Turquoise", "Violet", "Wheat", "White", "WhiteSmoke", "Yellow", "YellowGreen" ];
	if (value.startsWith("#")) {
		return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
	} else if (value.match(/rgb\((\d{1,3}),[ ]*(\d{1,3}),[ ]*(\d{1,3})\)/)) {
		return true;
	} else {
		return !!colorTexts.some(colorText => {
			if (value.toLowerCase() == colorText.toLocaleLowerCase()) return true;
		});
	}
};

/**
 * Returns a new copy of the object
 * @private
 * @param {*} o Object to copy
 * @return {Object} New copy of o
 * @example $e.clone(arrayObject);
 */
$e.clone = (o) => {
	return Object.entries(o).reduce((acc, [key, v]) => { acc[key] = (typeof v === "object") ? $e.clone(v) : v; return acc; }, Array.isArray(o) ? [] : {});
};

/**
 * Returns if the page is being embedded in an iframe
 * @private
 * @return {Boolean} Whether the page is being embedded in an iframe or not
 * @example $e.ui.isEmbedded()
 */
$e.ui.isEmbedded = () => {
	return window != window.top;
};

/**
 * Returns true if the value looks like an OK, false otherwise
 * @private
 * @paaram {String|Boolean} value Value to check
 * @return {Boolean} Whether the value looks liek an OK
 * @example $e.confirmYes("Yes")
 */
$e.confirmYes = (value) => {
	if (typeof value == "string") {
		value = value.toLowerCase();
	}
	return value === true || value == "true" || value == "1" || value == "yes" || value === 1;
};

/**
 * Returns true if the value looks like an OK, false otherwise
 * @private
 * @param {String|Boolean} value Value to check
 * @return {Boolean} Whether the value looks like an OK
 * @example $e.confirmNo("No")
 */
$e.confirmNo = (value) => {
	if (typeof value == "string") {
		value = value.toLowerCase();
	}
	return value === false || value == "false" || value == "0" || value == "no" || value == "none" || value === 0;
};

/**
 * Returns the position of the reference passed (event, HTMLElement, etc)
 * @private
 * @param {Event|HTMLElement} dataURI JavaScript provided dataURL
 * @return {Object} An object containing the x an y coordinates
 * @example $e.obtainPosition(event)
 */
$e.obtainPosition = (reference) => {
	if (reference instanceof HTMLElement) {
		const element = reference;
		// If we are getting the block as reference, use its middle point
		const elementRect = element.getBoundingClientRect();
		return { x: elementRect.left + elementRect.width / 2, y: elementRect.top + elementRect.height / 2 };
	} else if (reference instanceof Event) {
		const event = reference;
		if (event.type.startsWith("touch")) {
			return { x: event.targetTouches[0].pageX, y: event.targetTouches[0].pageY };
		} else { 
			return { x: event.pageX, y: event.pageY };
		}
	} else {
		console.error("Unknown reference in obtainPosition: ", reference);
	}
};

/**
 * Returns the base64 value of a dataURL
 * @private
 * @param {String} dataURI JavaScript provided dataURL
 * @return {Array<String,String>} The data and mimetype
 * @example $e.dataURItoB64(canvas.toDataURL())
 */
$e.dataURItoB64 = (dataURI) => {
	let data;
	if (dataURI.split(",")[0].includes(";base64")) {
		data = dataURI.split(",")[1];
	} else {
		data = decodeURIComponent(dataURI.split(",")[1]);
		data = window.btoa(data);
	}

	// separate out the mime component
	const mimetype = dataURI.split(",")[0].split(":")[1].split(";")[0];

	return { data: data, mimetype: mimetype };
};