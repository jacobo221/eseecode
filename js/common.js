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
		if (event.type == "touchend") {
			pos.x = event.changedTouches[0].pageX;
			pos.y = event.changedTouches[0].pageY;
		} else if (event.type.indexOf("touch") == 0) {
			pos.x = event.touches[0].pageX;
			pos.y = event.touches[0].pageY;
		} else {
			pos.x = event.pageX;
			pos.y = event.pageY;
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
	 * @param {Boolean} [parseString=false] If true, will parse string values to see if it contains a boolean
	 * @example $e_isBoolean(true)
	 */
	function $e_isBoolean(value, parseString) {
		if ((typeof value).toLowerCase() === "boolean") { // It would be easier to do Number.isFinite() but IE11 doesn't support it
			return true;
		} else if (parseString === true && (value == "true" || value == "false")) {
			return true;
		}
		return false;
	}

	/**
	 * Returns if a value is a number or not
	 * @private
	 * @param {*} value Value to test
	 * @param {Boolean} [parseString=false] If true, will parse string values to see if it contains a number
	 * @example $e_isNumber(5)
	 */
	function $e_isNumber(value, parseString) {
		if (parseString !== true && typeof value == "string") { // It would be easier to do Number.isFinite() but IE11 doesn't support it
			return false;
		}
		return !isNaN(parseFloat(value)) && isFinite(value);
		
	}

	/**
	 * Returns if a layer exists with this id
	 * @private
	 * @param {*} value Value to test
	 * @example $e_isLayer(5)
	 */
	function $e_isLayer(value) {
		var retVal;
		if ($e_isNumber(value, true)) {
			retVal = ($e_getLayer(value) !== undefined);
		} else {
			retVal = ($_eseecode.canvasArray[value] !== undefined);
		}
		return retVal;
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
			return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
		} else if (value.match(/rgb\((\d{1,3}),[ ]*(\d{1,3}),[ ]*(\d{1,3})\)/)) {
			return true;
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

	/**
	 * Returns true if the value looks like an OK, false otherwise
	 * @private
	 * @paaram {String|Boolean} value Value to check
	 * @return {Boolean} Whether the value looks liek an OK
	 * @example $e_confirmYes("Yes")
	 */
	function $e_confirmYes(value) {
		if (typeof value == "string") {
			value = value.toLowerCase();
		}
		return value === true || value == "true" || value == "1" || value == "yes" || value === 1;
	}

	/**
	 * Returns true if the value looks like an OK, false otherwise
	 * @private
	 * @param {String|Boolean} value Value to check
	 * @return {Boolean} Whether the value looks like an OK
	 * @example $e_confirmNo("No")
	 */
	function $e_confirmNo(value) {
		if (typeof value == "string") {
			value = value.toLowerCase();
		}
		return value === false || value == "false" || value == "0" || value == "no" || value == "none" || value === 0;
	}
	
	/**
	 * Returns the binary value of a dataURL
	 * @private
	 * @param {String} dataURI JavaScript provided dataURL
	 * @example $e_dataURItoBlob(canvas.toDataURL())
	 */
	function $e_dataURItoBlob(dataURI) {
	    // convert base64/URLEncoded data component to raw binary data held in a string
	    var byteString;
	    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
	        byteString = atob(dataURI.split(',')[1]);
	    } else {
	        byteString = unescape(dataURI.split(',')[1]);
	    }
	
	    // separate out the mime component
	    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
	
	    // write the bytes of the string to a typed array
	    var ia = new Uint8Array(byteString.length);
	    for (var i = 0; i < byteString.length; i++) {
	        ia[i] = byteString.charCodeAt(i);
	    }
	
	    return ia;
	}

	/**
	 * Saves data into a file
	 * @private
	 * @param data Data to save
	 * @example $e_saveFile("forward(100)", "esee.code")
	 */
	function $e_saveFile(data, filename) {
		if (filename.length > 0 && filename.indexOf(".") < 0) {
			filename += ".esee";
		}
		$_eseecode.ui.codeFilename = filename;
		var mimetype = "text/plain";
		var downloadLink = document.createElement("a");
		// Chrome / Firefox
		var supportDownloadAttribute = 'download' in downloadLink;
		// IE10
		navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob;
		// Safari
		var isSafari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
		if (supportDownloadAttribute) {
			var blob;
			var codeURI;
			try {
				blob = new Blob([data], {type:mimetype});
			} catch(e) {
				// If Blob doesn't exist assume it is an old browser using deprecated BlobBuilder
				var builder = new (window.BlobBuilder || window.MSBlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder)();
				builder.append(data);
				blob = builderbuilder.getBlob(mimetype);
			}
			codeURI = URL.createObjectURL(blob);
			downloadLink.href = codeURI;
			downloadLink.download = (($_eseecode.ui.codeFilename && $_eseecode.ui.codeFilename.length > 0)?$_eseecode.ui.codeFilename:"code.esee");
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			// Just in case that some browser handle the click/window.open asynchronously I don't revoke the object URL immediately
			setTimeout(function () {
				URL.revokeObjectURL(codeURI);
			}, 250);
		} else if (navigator.saveBlob) {
			var blob;
			try {
				blob = new Blob([data], {type:mimetype});
			} catch(e) {
				// If Blob doesn't exist assume it is an old browser using deprecated BlobBuilder
				var builder = new (window.BlobBuilder || window.MSBlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder)();
				builder.append(data);
				blob = builder.getBlob(mimetype);
			}
			if (window.saveAs) {
				window.saveAs(blob, filename);
			} else {
				navigator.saveBlob(blob, filename);
			}
		} else if (isSafari) {
			downloadLink.innerHTML = "Download";
			downloadLink.id = "downloadLinkHTML";
			downloadLink.href = "data:"+mimetype+","+encodeURIComponent(data);
			downloadLink.target = "_blank";
			downloadLink.innerHTML = _("this link");
			var wrap = document.createElement('div');
			wrap.appendChild(downloadLink.cloneNode(true));
			var downloadLinkHTML = wrap.innerHTML;
			$e_msgBox(_("Your browser doesn't support direct download of files, please click on %s and save the page that will open.",[downloadLinkHTML]),{acceptName:_("Close")});
			document.getElementById("downloadLinkHTML").addEventListener("click", $e_msgBoxClose);
		} else {
			var oWin = window.open("about:blank", "_blank");
			oWin.document.write("data:"+mimetype+","+data);
			oWin.document.close();
			// IE<10 & other
			if (document.execCommand) {
				var success = oWin.document.execCommand('SaveAs', true, filename);
				if (success) {
					oWin.close();
				}
			} else {
				// Keep the window open for non-IE browsers, this is the last option
				oWin.close();
			}
		}
		$_eseecode.session.lastSave = new Date().getTime();
	}

	/**
	 * Saves data to a file
	 * @private
	 * @param data Data to save
	 * @example $e_saveFile("forward(100)", "esee.code")
	 */
	function $e_saveFile(data, filename) {
		if (filename.length > 0 && filename.indexOf(".") < 0) {
			filename += ".esee";
		}
		$_eseecode.ui.codeFilename = filename;
		var mimetype = "text/plain";
		var downloadLink = document.createElement("a");
		// Chrome / Firefox
		var supportDownloadAttribute = 'download' in downloadLink;
		// IE10
		navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob;
		// Safari
		var isSafari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
		if (supportDownloadAttribute) {
			var blob;
			var codeURI;
			try {
				blob = new Blob([data], {type:mimetype});
			} catch(e) {
				// If Blob doesn't exist assume it is an old browser using deprecated BlobBuilder
				var builder = new (window.BlobBuilder || window.MSBlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder)();
				builder.append(data);
				blob = builderbuilder.getBlob(mimetype);
			}
			codeURI = URL.createObjectURL(blob);
			downloadLink.href = codeURI;
			downloadLink.download = (($_eseecode.ui.codeFilename && $_eseecode.ui.codeFilename.length > 0)?$_eseecode.ui.codeFilename:"code.esee");
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			// Just in case that some browser handle the click/window.open asynchronously I don't revoke the object URL immediately
			setTimeout(function () {
				URL.revokeObjectURL(codeURI);
			}, 250);
		} else if (navigator.saveBlob) {
			var blob;
			try {
				blob = new Blob([data], {type:mimetype});
			} catch(e) {
				// If Blob doesn't exist assume it is an old browser using deprecated BlobBuilder
				var builder = new (window.BlobBuilder || window.MSBlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder)();
				builder.append(data);
				blob = builder.getBlob(mimetype);
			}
			if (window.saveAs) {
				window.saveAs(blob, filename);
			} else {
				navigator.saveBlob(blob, filename);
			}
		} else if (isSafari) {
			downloadLink.innerHTML = "Download";
			downloadLink.id = "downloadLinkHTML";
			downloadLink.href = "data:"+mimetype+","+encodeURIComponent(data);
			downloadLink.target = "_blank";
			downloadLink.innerHTML = _("this link");
			var wrap = document.createElement('div');
			wrap.appendChild(downloadLink.cloneNode(true));
			var downloadLinkHTML = wrap.innerHTML;
			$e_msgBox(_("Your browser doesn't support direct download of files, please click on %s and save the page that will open.",[downloadLinkHTML]),{acceptName:_("Close")});
			document.getElementById("downloadLinkHTML").addEventListener("click", $e_msgBoxClose);
		} else {
			var oWin = window.open("about:blank", "_blank");
			oWin.document.write("data:"+mimetype+","+data);
			oWin.document.close();
			// IE<10 & other
			if (document.execCommand) {
				var success = oWin.document.execCommand('SaveAs', true, filename);
				if (success) {
					oWin.close();
				}
			} else {
				// Keep the window open for non-IE browsers, this is the last option
				oWin.close();
			}
		}
		$_eseecode.session.lastSave = new Date().getTime();
	}

	/**
	 * Loads data from a file
	 * @private
	 * @param data Data to save
	 * @param filename File name
	 * @param call Function to call
	 * @example $e_loadFile("forward(100)", "esee.code", $e_loadCodeFile)
	 */
	function $e_loadFile(data, filename, call) {
		call(data, filename);
	}
