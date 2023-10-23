"use strict";

/**
 * @author Jacobo Vilella Vilahur
 * @license GPL-3.0
 */

// Make sure the browser supports the minimum to run the platform
if (!document || !document.getElementById || !document.createElement || !document.addEventListener || !document.appendChild) {
	// Can't event support msgBox()
	alert("Your browser is incompatible with eSeeCode. It is probably too old!");
} else {
	var testCanvas = document.createElement('canvas');
	if (!window.addEventListener || !(testCanvas.getContext && testCanvas.getContext('2d')) || !document.querySelector) {
		alert("Your browser is incompatible with eSeeCode. It is probably too old!!!");
	} else {
		var eseecodePath = (function(){
				var scripts = document.getElementsByTagName("script");
				var scriptPath = scripts[scripts.length-1].src;
				return scriptPath.substring(0,scriptPath.lastIndexOf("/js/"));
			})();
		window.addEventListener("load", function() {
			var eseecodeDiv = document.getElementById("eseecode");
			if (!eseecodeDiv) {
				eseecodeDiv = document.createElement("div");
				eseecodeDiv.id = "eseecode";
				document.body.appendChild(eseecodeDiv);
			}
			eseecodeDiv.style.visibility = "hidden";
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
			// Load files, when order does matter:
			// File batches are divided in arrays to separate dependencies, so all files in same array are loaded in parallel
			// Functions can be called to add more files
			var filesToLoad = [
				[
					"js/defaults.js"
				], [
					// Depends on js/defaults.js
					"js/dom.js",
					"themes/installed.js",
					"css/theme.js",
					"translations/installed.js",
					"js/common.js",
					"js/backend.js",
					"js/execution.js",
					"js/blocks.js",
					"js/levelConvert.js",
					"js/ui.js",
					"js/translate.js",
					"js/api.js",
					"js/instructions/set.js",
					"js/instructions/categories.js",
					"js/instructions/implementation.js",
					"js/instructions/icons.js",
					"js/jison/eseecodeLanguage.js",
					"js/ace/ace.js",
					"js/fontdetect/fontdetect.js",
					"js/jscolor/jscolor.js",
					"js/jsgif/LZWEncoder.js",
					"js/jsgif/NeuQuant.js",
					"js/jsgif/GIFEncoder.js"
				], [
					// Depends on theme.js
					function() { return $_eseecode.ui.theme.files; },
					// Depends on js/ace/ace.js
					"js/debug.js",
					"js/ace/ext-language_tools.js",
					// Depends on js/jison/eseecodeLanguage.js
					"js/jison/makeBlocks.js",
					"js/jison/makeWrite.js"
					]
				];
			var filesLoadedCount = 0;
			var filesLoad = function(filesToLoad, filesIndex) {
				if (filesIndex === undefined) {
					filesIndex = 0;
				}
				var batch = filesToLoad[filesIndex];
				for (var i=0; i < batch.length; i++) {
					if (typeof batch[i] == "function") {
						var newFilesToAdd = batch[i]();
						filesToLoad.push(newFilesToAdd);
						fileLoaded(filesToLoad, filesIndex);
					} else {
    					var headElement = document.getElementsByTagName("head")[0];
						var basename = batch[i];
						var basenameLength = batch[i].indexOf("?");
						if (basenameLength > 0) {
							basename = batch[i].substring(0, basenameLength);
						}
						var fileType = basename.substring(basename.lastIndexOf(".")+1);
						var newElement;
						if (fileType == "js") {
							var filepath = eseecodePath+"/"+batch[i];
							newElement = document.createElement("script");
							newElement.setAttribute("type", "text/javascript");
							newElement.setAttribute("src", filepath + ($_eseecode.cache_token ? '?v=' + $_eseecode.cache_token : ''));
						} else if (fileType == "css") {
							var filepath = eseecodePath+"/css/"+batch[i];
							newElement = document.createElement("link");
							newElement.setAttribute("rel", "stylesheet");
							newElement.setAttribute("type", "text/css");
							newElement.setAttribute("href", filepath + ($_eseecode.cache_token ? '?v=' + $_eseecode.cache_token : ''));
						}
						newElement.onload = function(event) { fileLoaded(filesToLoad, filesIndex); };
						headElement.appendChild(newElement);
					}
				}
			}
			var fileLoaded = function(filesToLoad, filesIndex) {
				filesLoadedCount++;
				// Calculate percentage loaded
				var numFilesToLoad = 0, numFilesLoaded = 0;
				for (var i=0; i < filesToLoad.length; i++) {
					numFilesToLoad += filesToLoad[i].length;
					if (i < filesIndex) {
						numFilesLoaded = numFilesToLoad;
					}
				}
				numFilesLoaded += filesLoadedCount;
				var percentageLoaded = parseInt(numFilesLoaded*100/numFilesToLoad);
				progressDiv.firstChild.nextSibling.innerHTML = (percentageLoaded<10?"0"+percentageLoaded:percentageLoaded)+"%";
				// If all files in this batch have been loaded, move to next level
				if (filesLoadedCount >= filesToLoad[filesIndex].length) {
					filesIndex++;
					if (filesIndex < filesToLoad.length) {
						filesLoadedCount = 0;
						filesLoad(filesToLoad, filesIndex);  // Recursive call
					} else {
						// All files loaded, start application
						$_eseecode.v = v;
						eseecodeDiv.style.visibility = "visible";
						$e_resetUI();
						progressDiv.parentNode.removeChild(progressDiv);
					}
				}
			};
			filesLoad(filesToLoad);
		}, false);

	}
}
