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
	 * @example $e_isNumber(5)
	 */
	function $e_isNumber(value) {
		return !isNaN(parseFloat(value)) && isFinite(value);
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