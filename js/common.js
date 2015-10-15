"use strict;"

	/**
	 * Returns the absolute position where a mouse event has been triggered
	 * @private
	 * @param {!Object} event Event
	 * @return {{x:Number, y:Number}} Absolute position where a mouse event has been triggered
	 * @example var posX = $e_eventPosition(event);
	 */
	function $e_eventPosition(event) {
		var pos = {x: 0, y: 0};
		event = event ? event : window.event;
		if (!event) { // firefox doesn't know window.event
			return pos;
		}
		if (!$e_isTouchDevice()) {
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

	/**
	 * Returns the ordinal name of a number
	 * @private
	 * @param {Number} number Number
	 * @return {String} Ordinal name of a number
	 * @example var text = $e_ordinal(3)
	 */
	function $e_ordinal(number) {
		var value = "";
		if (number == 1) {
			value = _("1st");
		} else if (number == 2) {
			value = _("2nd");
		} else if (number == 3) {
			value = _("3rd");
		} else if (number == 4) {
			value = _("4th");
		} else {
			value = number+_("th");
		}
		return value;
	}

	/**
	 * Returns if a value is a boolean or not
	 * @private
	 * @param {*} value Value to test
	 * @example $e_isBoolean(true)
	 */
	function $e_isBoolean(value) {
		return (typeof value).toLowerCase() === "boolean";
	}

	/**
	 * Returns if a value is a number or not
	 * @private
	 * @param {*} value Value to test
	 * @param {Boolean} [parseString=false] If true, will parse string values to see if it contains a number
	 * @example $e_isNumber(5)
	 */
	function $e_isNumber(value, parseString) {
		if (parseString === true) {
			return !isNaN(parseFloat(value)) && isFinite(value);	
		} else {
			return !isNaN(parseFloat(value)) && Number.isFinite(value);
		}
	}

	/**
	 * Returns if a layer exists with this id
	 * @private
	 * @param {*} value Value to test
	 * @example $e_isLayer(5)
	 */
	function $e_isLayer(value) {
		return $_eseecode.canvasArray[value] !== undefined;
	}

	/**
	 * Returns if a window exists with this id
	 * @private
	 * @param {*} value Value to test
	 * @example $e_isWindow(5)
	 */
	function $e_isWindow(value) {
		return $_eseecode.windowsArray[value] !== undefined;
	}

	/**
	 * Returns if a value is a color or not
	 * @private
	 * @param {*} value Value to test
	 * @example $e_isColor("#123123")
	 */
	function $e_isColor(value) {
		var colorTexts = ["transparent","AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","RebeccaPurple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
		if (value.charAt(0) == "#") {
			return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value)
		} else {
			for (var key in colorTexts) {
				if (value.toLowerCase() == colorTexts[key].toLocaleLowerCase()) {
					return true;
				}
			}
			return false;
		}
	}
	
	/**
	 * Returns a new copy of the object
	 * @private
	 * @param {*} o Object to copy
	 * @example var newObject = $e_clone(arrayObject);
	 */
        function $e_clone(o) {
                var out, v, key;
                out = Array.isArray(o) ? [] : {};
                for (key in o) {
                        v = o[key];
                        out[key] = (typeof v === "object") ? $e_clone(v) : v;
                }
                return out;
        }

	/**
	 * Returns if the device is a touch device or not
	 * @private
	 * @return {Boolean} Whether the device is a touch device or not
	 * @example $e_isTouchDevice()
	 */
	function $e_isTouchDevice() {
		var touchscreen = (('ontouchstart' in window) ||
     		    (navigator.maxTouchPoints > 0) ||
		    (navigator.msMaxTouchPoints > 0));
		return touchscreen;
	}

	/**
	 * Returns if the page is being embedded in an iframe
	 * @private
	 * @return {Boolean} Whether the page is being embedded in an iframe or not
	 * @example $e_isEmbedded()
	 */
	function $e_isEmbedded() {
		return window != window.top;
	}