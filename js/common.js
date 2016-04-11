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
	 * Returns the base64 value of a dataURL
	 * @private
	 * @param {String} dataURI JavaScript provided dataURL
	 * @example $e_dataURItoB64(canvas.toDataURL())
	 */
	function $e_dataURItoB64(dataURI) {
	    var data;
	    if (dataURI.split(',')[0].indexOf(';base64') >= 0) {
	    	data = dataURI.split(',')[1];
	    } else {
	        data = unescape(dataURI.split(',')[1]);
	        data = window.btoa(data);
	    }
	
	    // separate out the mime component
	    var mimetype = dataURI.split(',')[0].split(':')[1].split(';')[0];
	
	    return { data: data, mimetype: mimetype };
	}

	/**
	 * Saves data to a file. This function can be replaced by embedding apps such as Android's webview or iOS's uiwebview
	 * @private
	 * @param data Data to save, encoded in base64 if it is not text
	 * @param filename File name
	 * @param mimetype MIME type
	 * @example $e_saveFile("forward(100)", "esee.code", "text/plain")
	 */
	function $e_saveFile(data64, filename, mimetype) {
		if (mimetype.indexOf("text/") != 0) {
			data = window.atob(data64);
		    var rawLength = data.length;
		    var uInt8Array = new Uint8Array(rawLength);
		    for (var i = 0; i < rawLength; ++i) {
		      uInt8Array[i] = data.charCodeAt(i);
		    }
		    data = uInt8Array;
		} else {
			// It is text, so the data has been passed as a String, not in base64
			data = data64;
		}
		var downloadLink = document.createElement("a");
		// Chrome / Firefox
		var supportDownloadAttribute = 'download' in downloadLink;
		// IE10
		navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob;
		// Safari
		var isSafari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent)
		if (supportDownloadAttribute) {
			var blob;
			try {
				blob = new Blob([data], {type:mimetype});
			} catch(e) {
				// If Blob doesn't exist assume it is an old browser using deprecated BlobBuilder
				var builder = new (window.BlobBuilder || window.MSBlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder)();
				builder.append(data);
				blob = builderbuilder.getBlob(mimetype);
			}
			var codeURI = URL.createObjectURL(blob);
			downloadLink.href = codeURI;
			downloadLink.download = filename;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
			// Just in case that some browser handle the click/window.open asynchronously I don't revoke the object URL immediately
			setTimeout(function () {
				URL.revokeObjectURL(codeURI);
			}, 250);
			$e_msgBoxClose();
		} else if (navigator.saveBlob || window.saveAs) {
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
			$e_msgBoxClose();
		} else if (isSafari) {
			$e_msgBoxClose(); // We cannot close the msgBox later because we would be closing the new msgBox where the link is going to be create it, so close it now
			setTimeout(function() {
				$e_msgBox(_("Your browser doesn't support direct download of files, please click on %s and save the page that will open.",["<a id='msgBoxDw' target='_blank'>"+_("this link")+"</a>"]),{acceptName:_("Close")});
				var downloadLinkElement = document.getElementById("msgBoxDw");
				if (mimetype.indexOf("text/") != 0) {
					downloadLinkElement.href = "data:"+mimetype+";base64,"+data64;
				} else {
					downloadLinkElement.href = "data:"+mimetype+","+encodeURIComponent(data64);
				}
				downloadLinkElement.addEventListener("click", $e_msgBoxClose);
			},100);
		} else {
			var oWin = window.open("about:blank", "_blank");
			if (mimetype.indexOf("text/") != 0) {
				oWin.document.write("data:"+mimetype+";base64,"+data64);
			} else {
				oWin.document.write("data:"+mimetype+","+encodeURIComponent(data64));
			}
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
			$e_msgBoxClose();
		}
		$_eseecode.session.lastSave = new Date().getTime();
	}

	/**
	 * Loads data from a file. This function can be call by embedding apps such as Android's webview or iOS's uiwebview, for example they could replace $e_openCodeFile() and then call $e_loadFile
	 * @private
	 * @param data Data to load
	 * @param filename File name where the data was read from
	 * @param call Function to call
	 * @example $e_loadFile("forward(100)", "esee.code", $e_loadCodeFile)
	 */
	function $e_loadFile(data, filename, call) {
		return call(data, filename);
	}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Base64 class: Base 64 encoding / decoding (c) Chris Veness 2002-2011                          */
/*    note: depends on Utf8 class                                                                 */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/**
 * Encode string into Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
 * (instance method extending String object). As per RFC 4648, no newlines are added.
 *
 * @param {String} str The string to be encoded as base-64
 * @param {Boolean} [utf8encode=false] Flag to indicate whether str is Unicode string to be encoded 
 *   to UTF8 before conversion to base64; otherwise string is assumed to be 8-bit characters
 * @returns {String} Base64-encoded string
 */ 
 if (!window.btoa) {
  window.btoa = function(str, utf8encode) {  // http://tools.ietf.org/html/rfc4648
    utf8encode =  (typeof utf8encode == 'undefined') ? false : utf8encode;
    var o1, o2, o3, bits, h1, h2, h3, h4, e=[], pad = '', c, plain, coded;
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
     
    plain = utf8encode ? Utf8.encode(str) : str;
    
    c = plain.length % 3;  // pad string to length of multiple of 3
    if (c > 0) { while (c++ < 3) { pad += '='; plain += '\0'; } }
    // note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars
     
    for (c=0; c<plain.length; c+=3) {  // pack three octets into four hexets
      o1 = plain.charCodeAt(c);
      o2 = plain.charCodeAt(c+1);
      o3 = plain.charCodeAt(c+2);
        
      bits = o1<<16 | o2<<8 | o3;
        
      h1 = bits>>18 & 0x3f;
      h2 = bits>>12 & 0x3f;
      h3 = bits>>6 & 0x3f;
      h4 = bits & 0x3f;
  
      // use hextets to index into code string
      e[c/3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    }
    coded = e.join('');  // join() is far faster than repeated string concatenation in IE
    
    // replace 'A's from padded nulls with '='s
    coded = coded.slice(0, coded.length-pad.length) + pad;
     
    return coded;
  }
}

/**
 * Decode string from Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
 * (instance method extending String object). As per RFC 4648, newlines are not catered for.
 *
 * @param {String} str The string to be decoded from base-64
 * @param {Boolean} [utf8decode=false] Flag to indicate whether str is Unicode string to be decoded 
 *   from UTF8 after conversion from base64
 * @returns {String} decoded string
 */ 
 if (!window.atob) {
  window.atob = function(str, utf8decode) {
    utf8decode =  (typeof utf8decode == 'undefined') ? false : utf8decode;
    var o1, o2, o3, h1, h2, h3, h4, bits, d=[], plain, coded;
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  
    coded = utf8decode ? Utf8.decode(str) : str;
    
    for (var c=0; c<coded.length; c+=4) {  // unpack four hexets into three octets
      h1 = b64.indexOf(coded.charAt(c));
      h2 = b64.indexOf(coded.charAt(c+1));
      h3 = b64.indexOf(coded.charAt(c+2));
      h4 = b64.indexOf(coded.charAt(c+3));
        
      bits = h1<<18 | h2<<12 | h3<<6 | h4;
        
      o1 = bits>>>16 & 0xff;
      o2 = bits>>>8 & 0xff;
      o3 = bits & 0xff;
      
      d[c/4] = String.fromCharCode(o1, o2, o3);
      // check for padding
      if (h4 == 0x40) d[c/4] = String.fromCharCode(o1, o2);
      if (h3 == 0x40) d[c/4] = String.fromCharCode(o1);
    }
    plain = d.join('');  // join() is far faster than repeated string concatenation in IE
    
    return utf8decode ? Utf8.decode(plain) : plain; 
  }
}
