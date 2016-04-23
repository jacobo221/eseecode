"use strict";
	/**
	 * @author Jacobo Vilella Vilahur
	 * @license GPL-3.0
	 */

	var scripts = document.getElementsByTagName("script");
	var scriptPath = scripts[scripts.length-1].src
	var eseecodePath = scriptPath.substring(0,scriptPath.lastIndexOf("/"));
	scripts = undefined, scriptPath = undefined;
	// Make sure the browser supports the minimum to run the platform
	var browserNotSupportedErrorMessage = "Your browser is incompatible with eSeeCode. It is probably too old!";
	if (!document || !document.getElementById || !document.createElement || !document.addEventListener || !document.appendChild) {
		// Can't event support msgBox()
		alert(browserNotSupportedErrorMessage);
	} else {
		var testCanvas = document.createElement('canvas');
		if (!window.addEventListener || !(testCanvas.getContext && testCanvas.getContext('2d')) || !document.querySelector) {
			alert(browserNotSupportedErrorMessage+"!!");
		} else {
			window.addEventListener("load", function() {
				var eseecodeDiv = document.getElementById("eseecode");
				if (!eseecodeDiv) {
					eseecodeDiv = document.createElement("div");
					eseecodeDiv.id = "eseecode";
					document.body.appendChild(eseecodeDiv);
				}
				eseecode.style.visibility = "hidden";
				var progressDiv = document.createElement("div");
				progressDiv.style.textAlign = "center";
				progressDiv.style.fontWeight = "center";
				progressDiv.style.fontSize = "20px";
				progressDiv.style.backgroundColor = "#ffffff";
				progressDiv.style.color = "#000000";
				progressDiv.style.position = "absolute";
				progressDiv.style.top = eseecodeDiv.getBoundingClientRect().top+"px";
				progressDiv.style.left = eseecodeDiv.getBoundingClientRect().left+"px";
				progressDiv.style.width = eseecodeDiv.offsetWidth+"px";
				progressDiv.style.height = eseecodeDiv.offsetHeight+"px";
				progressDiv.innerHTML = "<span>Loading... </span><span></span>";
				eseecodeDiv.parentNode.insertBefore(progressDiv, eseecodeDiv);
				// Load files, in this order
				var jsFiles = [
					"js/dom.js",
					"js/defaults.js",
					"themes/installed.js",
					"css/theme.js",
					"translations/installed.js",
					"js/common.js",
					"js/backend.js",
					"js/execution.js",
					"js/blocks.js",
					"js/levelConvert.js",
					"js/debug.js",
					"js/ui.js",
					"js/translate.js",
					"js/api.js",
					"js/instructions/set.js",
					"js/instructions/categories.js",
					"js/instructions/implementation.js",
					"js/instructions/icons.js",
					"js/jison/eseecodeLanguage.js",
					"js/jison/makeBlocks.js",
					"js/jison/makeWrite.js",
					"js/ace/ace.js",
					"js/ace/ext-language_tools.js",
					"js/fontdetect/fontdetect.js",
					"js/jscolor/jscolor.js",
					"js/jsgif/LZWEncoder.js",
					"js/jsgif/NeuQuant.js",
					"js/jsgif/GIFEncoder.js" ];
				var jsFilesLoadedCount = 0;
	    			var headElement = document.getElementsByTagName("head")[0];
				var jsFilesLoad = function(jsFilesLoadedCount) {
					progressDiv.firstChild.nextSibling.innerHTML = jsFilesLoadedCount+"/"+jsFiles.length;
					if (jsFilesLoadedCount < jsFiles.length) {
						var filepath = eseecodePath+"/"+jsFiles[jsFilesLoadedCount];
						var elementJS = document.createElement("script");
						elementJS.setAttribute("type", "text/javascript");
						elementJS.setAttribute("src", filepath);
						elementJS.onload = function() { jsFilesLoad(jsFilesLoadedCount+1); };
						headElement.appendChild(elementJS);
					} else {
						// Now load CSS files
						var defaultThemePath = "css"
						var cssFiles = $_eseecode.ui.theme.files;
						var cssFilesLoadedCount = 0;
						var cssFilesLoad = function(cssFilesLoadedCount) {
							progressDiv.firstChild.nextSibling.innerHTML = (jsFilesLoadedCount+cssFilesLoadedCount)+"/"+(jsFiles.length+cssFiles.length);
							if (cssFilesLoadedCount < cssFiles.length) {
								var filepath = eseecodePath+"/"+defaultThemePath+"/"+cssFiles[cssFilesLoadedCount];
								var elementCSS = document.createElement("link");
								elementCSS.setAttribute("rel", "stylesheet");
								elementCSS.setAttribute("type", "text/css");
								elementCSS.setAttribute("href", filepath);
								elementCSS.onload = function() { cssFilesLoad(cssFilesLoadedCount+1); };
								headElement.appendChild(elementCSS);
							} else {
								eseecode.style.visibility = "visible";
								// Init application
								$e_resetUI();
								progressDiv.parentNode.removeChild(progressDiv);
							}
						};
						cssFilesLoad(0);
					}
				}
				jsFilesLoad(0);
			}, false);
		}
	}

