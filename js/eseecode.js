"use strict";
	/**
	 * @author Jacobo Vilella Vilahur
	 * @license GPL-3.0
	 */

	// Make sure the browser supports the minimum to run the platform
	var browserNotSupportedErrorMessage = "Your browser is incompatible with "+$_eseecode.platform.name.text+". It is probably too old!";
	if (!document || !document.getElementById || !document.createElement || !document.addEventListener || !document.appendChild) {
		// Can't event support msgBox()
		alert(browserNotSupportedErrorMessage);
	} else {
		var testCanvas = document.createElement('canvas');
		if (!window.addEventListener || !(testCanvas.getContext && testCanvas.getContext('2d')) || !document.querySelector) {
			alert(browserNotSupportedErrorMessage+"!!");
		} else {
			// Init application
			window.addEventListener("load",function(){$e_resetUI()}, false);
		}
	}

