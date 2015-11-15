"use strict";
        
	function _(text) {
		var translated = text;
		if (translations[currentLanguage]) {
		    var lang = translations[currentLanguage];
		    if (lang[text]) {
		    	translated = lang[text];
		    } else {
		        console.log('"'+text+'": ""');
		    }
		}
		return translated;
	}
	
	function ttWrapperActivate() {
        var ttBoxWrapper = document.createElement("div");
        ttBoxWrapper.id = "ttBoxWrapper";
        ttBoxWrapper.style.position = "fixed";
        ttBoxWrapper.style.opacity = 0;
        ttBoxWrapper.style.zIndex = 99999;
        ttBoxWrapper.style.top = 0;
        ttBoxWrapper.style.left = 0;
        ttBoxWrapper.style.width = "100%";
        ttBoxWrapper.style.height = "100%";
        doc.body.appendChild(ttBoxWrapper);
	}

    function ttActivate (currentGuideStep) {
        var element = currentGuideStep.element;
        var position = currentGuideStep.position;
        var width = currentGuideStep.width;
        // Create tooltip
        var ttBox = document.createElement("div");
        ttBox.id = "ttBox";
        ttBox.style.borderRadius = "10px";
        ttBox.style.backgroundColor = "#EFEFEF";
        ttBox.style.textAlign = "center";
        ttBox.style.border = "1px solid #000000";
        ttBox.style.zIndex = 100000;
        ttBox.innerHTML = "<b>"+_(currentGuideStep.text)+"</b>";
        iframe.contentWindow.document.body.appendChild(ttBox);
        if (element && element.getBoundingClientRect().left) {
            ttBox.style.position = "absolute";
            var coordX, coordY;
            var margin = 40;
            coordX = element.getBoundingClientRect().left;
            if (width === undefined && element.getBoundingClientRect().width) {
                coordX += margin;
                width = Math.max(200,element.getBoundingClientRect().width-margin*2);
            } else {
                coordX += margin;
            }
            ttBox.style.width = width + "px";
            coordY = element.getBoundingClientRect().top;
            if (position == "above") {
                if (ttBox.getBoundingClientRect().height) {
                    coordY -= ttBox.getBoundingClientRect().height;
                }
                ttBox.style.borderBottomLeftRadius = "0px";
            } else if (position == "inside") {
                if (element.getBoundingClientRect().height) {
                    coordY += element.getBoundingClientRect().height/2;
                    coordY -= Math.min(margin,element.getBoundingClientRect().height/2);
                }
            } else { // "under"
                coordY = element.getBoundingClientRect().bottom;
                ttBox.style.borderTopLeftRadius = "0px";
            }
            ttBox.style.left = coordX + "px";
            ttBox.style.top = coordY + "px";
            if (width === undefined) {
                width = 200;
            }
        } else {
            if (width === undefined) {
                width = 400;
            }
            ttBox.style.position = "fixed";
            ttBox.style.marginLeft = (width/2*(-1)) + "px";
            ttBox.style.marginTop = (margin*(-1)) + "px";
            ttBox.style.left = "50%";
            ttBox.style.top = "50%";
            ttBox.style.width = width + "px";
        }
        if (currentGuideStep.runNext === undefined) {
            currentGuideStep.runNext = guideFinishStep;
        }
        if (currentGuideStep.timeout) {
            ttBox.innerHTML += '<br />[ '+_("Waiting")+'... <i id="ttBoxCountdown">'+currentGuideStep.timeout+'</i> ]';
            setTimeout(ttCountdown, 1000);
            setTimeout(currentGuideStep.runNext, currentGuideStep.timeout*1000);
        } else if (currentGuideStep.type == "info" || currentGuideStep.action == "clickMessage") {
            ttBox.addEventListener("mousedown", currentGuideStep.runNext, false);
            ttBox.addEventListener("touchstart", currentGuideStep.runNext, false);
            ttBox.innerHTML += "<br />"+_("Click on this message to continue");
        } else if (element && action != "none") {
            if (!currentGuideStep.action) {
                currentGuideStep.action = "mouseup";
            }
            var action = currentGuideStep.action;
            if (action == "mousedown" || action == "touchstart" || action == "click") {
                element.addEventListener("mousedown", currentGuideStep.runNext, false);
                element.addEventListener("touchstart", currentGuideStep.runNext, false);
            } else if (action == "mouseup" || action == "touchend") {
                element.addEventListener("mouseup", currentGuideStep.runNext, false);
                element.addEventListener("touchend", currentGuideStep.runNext, false);
            }
        }
        if (currentGuideStep.type == "info" || currentGuideStep.action == "clickMessage") {
            ttWrapperActivate();
        }
        doc.body.appendChild(ttBox);
    }

    function ttDeactivate(clearBorders) {
        if (currentGuideIndex < 0) {
            console.warn("Got index "+ currentGuideIndex+" in ttDeactivate. Trace:\n"+console.trace());
            return;
        }
        var currentGuideStep = guideSteps[currentGuideIndex];
        var ttBox = doc.getElementById("ttBox");
        if (ttBox) {
            ttBox.parentNode.removeChild(ttBox);
        }
        var ttBoxWrapper = doc.getElementById("ttBoxWrapper");
        if (ttBoxWrapper) {
            ttBoxWrapper.parentNode.removeChild(ttBoxWrapper);
        }
        if (clearBorders !== false) {
            doc.body.removeEventListener("mousemove", dragTtBox, false);
            doc.body.removeEventListener("touchmove", dragTtBox, false);
            doc.body.removeEventListener("mouseup", currentGuideStep.runNext, false);
            doc.body.removeEventListener("touchend", currentGuideStep.runNext, false);
            if (currentGuideStep.element) {
                currentGuideStep.element.removeEventListener("mousedown", currentGuideStep.runNext, false);
                currentGuideStep.element.removeEventListener("touchstart", currentGuideStep.runNext, false);
                currentGuideStep.element.removeEventListener("mousemove", currentGuideStep.runNext, false);
                currentGuideStep.element.removeEventListener("touchmove", currentGuideStep.runNext, false);
                currentGuideStep.element.removeEventListener("mouseup", currentGuideStep.runNext, false);
                currentGuideStep.element.removeEventListener("touchend", currentGuideStep.runNext, false);
                currentGuideStep.element.className = currentGuideStep.element.className.replace(/\bguideBorder\b/,'');
            }
            // Remove console blocks which have been copied with guideBorder
            // For some reason this code doesn't remove the guideBorder from the first block in code BUT using guideSteps[currentGuideIndex].element does... so in the end it works
            var guideElements = doc.getElementsByClassName("guideBorder");
            for (var i=0; i<guideElements.length; i++) {
                var oldElement = guideElements[i];
                oldElement.className = oldElement.className.replace(/\bguideBorder\b/,'');
            }
        }
    }
    
    function ttCountdown() {
        var countdownElement = doc.getElementById("ttBoxCountdown");
        if (countdownElement) {
            var timeLeft = parseFloat(countdownElement.innerHTML);
            if (timeLeft > 0) {
                countdownElement.innerHTML = timeLeft-1;
                setTimeout(ttCountdown, 1000);
            }
        }
    }
    
    function verifyOutput(currentGuideStep) {
        if (currentGuideStep.argument === undefined) {
            console.warn("verify step lacks an argument");
            return;
        }
        var validation = (currentGuideStep.argument == encodeURIComponent(iframe.contentWindow.API_getOutput()));
        if (!validation) {
            guideStepBack(currentGuideStep);
        } else {
            currentGuideStep.action = undefined;
            setTimeout(currentGuideStep.runNext, 0); // Run next step and leave this step to close
        }
    }
    
    function verifyCode(currentGuideStep) {
        if (currentGuideStep.argument === undefined) {
            console.warn("verify step lacks an argument");
            return;
        }
        var validation = (currentGuideStep.argument == encodeURIComponent(iframe.contentWindow.API_downloadCode()));
        if (!validation) {
            guideStepBack(currentGuideStep);
        } else {
            currentGuideStep.action = undefined;
            setTimeout(currentGuideStep.runNext, 0); // Run next step and leave this step to close
        }
    }
    
    // While we stay in the same step from time to time verify that the element still exists, if it doesn't it is because the user did something wrong
    function verifyElement(element, elementGuideIndex) {
        if (elementGuideIndex === currentGuideIndex) {
            if (!element || !doc.getElementById(element.id)) {
                ttDeactivate();
                ttActivate({ text: "You stepped away from the instructions, you have to start the tutorial all over again", action: "clickMessage", runNext: function() {
                    iframe.contentWindow.API_restart();
                    setTimeout(guideRestart(), 500); // Give it time for eSeeCode to restart
                } });
            } else {
                setTimeout(function() {
                    verifyElement(element, elementGuideIndex);
                }, 500);
            }
        }
    }
    
    function dragTtBox() {
        var floatingBlocks = doc.getElementsByClassName("floatingBlock");
        var currentGuideStep = guideSteps[currentGuideIndex];
        ttDeactivate(false);
        ttActivate({ text: currentGuideStep.text, element: floatingBlocks[0], position: currentGuideStep.position, width: currentGuideStep.width, action: "none" });
    }
    
    function guideDraggingBlock() {
        var floatingBlocks = doc.getElementsByClassName("floatingBlock");
        if (floatingBlocks) {
            doc.body.addEventListener("mousemove", dragTtBox, false);
            doc.body.addEventListener("touchmove", dragTtBox, false);
            doc.body.addEventListener("mouseup", guideFinishStep, false);
            doc.body.addEventListener("touchend", guideFinishStep, false);
        }
    }
    
    function guideStepBack(currentGuideStep) {
        var ttBox;
        if (!steppingBack) {
            ttDeactivate();
            ttActivate({ text: ((currentGuideStep.type == "verify" && currentGuideStep.text !== undefined)?currentGuideStep.text:"You didn't follow the step correctly. Please pay attention to the instructions."), action: "clickMessage" });
        }
        if (currentGuideStep.type == "verify") {
            var backupCode = currentGuideStep.correction;
            if (backupCode === undefined) {
                for (var i=currentGuideIndex-1; i>=0; i--) {
                    if (guideSteps[i].type == "verify") {
                        backupCode = guideSteps[i].argument;
                        break;
                    }
                }
            }
            if (backupCode === undefined) {
                backupCode = "";   
            }
            var runNow = (iframe.contentWindow.API_getView() == "touch");
            iframe.contentWindow.API_uploadCode(decodeURI(backupCode), runNow);
        }
        if (currentGuideStep.stepsBack === undefined) {
            currentGuideStep.stepsBack = 2;
        }
        if (currentGuideStep.stepsBack > 0) {
            currentGuideIndex -= (currentGuideStep.stepsBack);
            if (steppingBack) {
                setTimeout(guideFinishStep, 0); // If no ttBox is being displayed (and this no ttBox will be clicked), run next step and leave this step to close
            } else {
                ttBox = doc.getElementById("ttBox");
                ttBox.innerHTML += ", "+_("you are being taken back to the previous step");
            }
        }
        steppingBack = true;
    }

    function guideRestart() {
        currentGuideIndex = 0;
        guideNextStep();
    }

    function guideNextStep() {
        if (currentGuideIndex >= guideSteps.length) {
            return;
        }
        var currentGuideStep = guideSteps[currentGuideIndex];
        var element = undefined;
        var skipElement = false;
        if (currentGuideStep.runNext === undefined) {
            currentGuideStep.runNext = guideFinishStep;
        }
        switch (currentGuideStep.type.toLowerCase()) {
            case "dialoginstruction":
                var instruction = currentGuideStep.argument;
                var dialogDiv = doc.getElementById("dialog-blocks");
                var block = dialogDiv.firstChild;
                //Search for the instruction
                while (block) {
                    if (block.getAttribute("data-instructionsetid") == instruction) {
                        element = block;
                        break;
                    }
                    block = block.nextSibling;
                }
                if (element) {
                    // Scroll to this block
                    var currentMode = iframe.contentWindow.$_eseecode.modes.console[iframe.contentWindow.$_eseecode.modes.console[0]];
					var blockHeight = iframe.contentWindow.$e_blockSize(currentMode.id, element).height;
					if (element.offsetTop < dialogDiv.scrollTop || element.offsetTop+blockHeight/2>dialogDiv.scrollTop+dialogDiv.offsetHeight) {
                        dialogDiv.scrollTop = element.offsetTop;-blockHeight;
					}
                }
                if (currentGuideStep.action === undefined) {
                    currentGuideStep.action = "mousedown";
                }
                // Inject floatingBlock before going to next step
                if ((currentMode.name.toLowerCase() == "drag" || currentMode.name.toLowerCase() == "build") && currentGuideStep.runNext === guideFinishStep) {
                    currentGuideStep.runNext = guideDraggingBlock;
                }
                break;
            case "consoleblockline":
                var consoleDiv = doc.getElementById("console-blocks");
                var blockTuple = iframe.contentWindow.$e_searchBlockByPosition(consoleDiv.firstChild, currentGuideStep.argument, 0)
                if (blockTuple && blockTuple.element) {
                    element = blockTuple.element;
                    // Scroll to this block
                    var currentMode = iframe.contentWindow.$_eseecode.modes.console[iframe.contentWindow.$_eseecode.modes.console[0]];
					var blockHeight = iframe.contentWindow.$e_blockSize(currentMode.id, element).height;
					if (element.offsetTop < consoleDiv.scrollTop || element.offsetTop+blockHeight/2>consoleDiv.scrollTop+consoleDiv.offsetHeight) {
                        consoleDiv.scrollTop = element.offsetTop-blockHeight;
					}
                }
                if (currentGuideStep.action === undefined) {
                    currentGuideStep.action = "mousedown";
                }
                // Inject floatingBlock before going to next step
                if ((currentMode.name.toLowerCase() == "drag" || currentMode.name.toLowerCase() == "build") && currentGuideStep.runNext === guideFinishStep) {
                    currentGuideStep.runNext = guideDraggingBlock;
                }
                break;
            case "info":
                element = undefined;
                skipElement = true;
                break;
            case "api":
                if (currentGuideStep.argument) {
                    iframe.contentWindow.API_loadURLParams(currentGuideStep.argument);
                }
                element = undefined;
                skipElement = true;
                setTimeout(currentGuideStep.runNext, 120);
                return;
                break;
            case "view":
            case "grid":
            case "gridstep":
            case "guide":
            case "filemenu":
            case "lang":
            case "input":
            case "timeout":
            case "axis":
            case "view":
            case "instructions":
                if (currentGuideStep.argument) {
                    iframe.contentWindow.API_loadURLParams(currentGuideStep.type.toLowerCase()+"="+currentGuideStep.argument);
                }
                element = undefined;
                skipElement = true;
                setTimeout(currentGuideStep.runNext, 120);
                return;
                break;
            case "code":
                if (currentGuideStep.argument) {
                    iframe.contentWindow.API_uploadCode(decodeURI(currentGuideStep.argument));
                }
                element = undefined;
                skipElement = true;
                setTimeout(currentGuideStep.runNext, 120);
                return;
                break;
            case "execute":
                iframe.contentWindow.API_execute();
                element = undefined;
                skipElement = true;
                setTimeout(currentGuideStep.runNext, 120);
                return;
                break;
            case "reset":
                iframe.contentWindow.API_reset();
                element = undefined;
                skipElement = true;
                setTimeout(currentGuideStep.runNext, 120);
                return;
                break;
            case "restart":
                iframe.contentWindow.API_restart();
                element = undefined;
                skipElement = true;
                setTimeout(currentGuideStep.runNext, 120);
                return;
                break;
            case "precode":
                if (currentGuideStep.argument) {
                    iframe.contentWindow.API_uploadPrecode(decodeURI(currentGuideStep.argument));
                }
                element = undefined;
                skipElement = true;
                setTimeout(currentGuideStep.runNext, 120);
                return;
                break;
            case "verify":
                element = undefined;
                skipElement = true;
                setTimeout(function() {
                    verifyCode(currentGuideStep);
                }, 300); // Wait for the Touch mode animation to be finished
                return;
                break;
            case "output":
                element = undefined;
                skipElement = true;
                setTimeout(function() {
                    verifyOutput(currentGuideStep);
                }, 300); // Wait for the Touch mode animation to be finished
                return;
                break;
            default:
                if (currentGuideStep.type != "htmlElement") {
                    var elementId = translateToHTMLElement(currentGuideStep.type);
                    if (elementId) {
                        currentGuideStep.type = "htmlElement";
                        currentGuideStep.argument = elementId;
                    }
                }
                if (currentGuideStep.type == "htmlElement") {
                    element = doc.getElementById(currentGuideStep.argument);
                }
                break;
        }
        if (element) {
            currentGuideStep.oldBorder = getComputedStyle(element, '').getPropertyValue('border');
            element.className += " guideBorder";
            verifyElement(element, currentGuideIndex);
        } else if (!skipElement) {
            guideStepBack(currentGuideStep);
            return;
        }
        steppingBack = false;
        currentGuideStep.element = element;
        ttActivate(currentGuideStep);
        var ttBox = doc.getElementById("ttBox");
    }

    function guideFinishStep() {
        ttDeactivate();
        currentGuideIndex++;
        // We use this timeout so that the UI changes have been made between one step and the next
        setTimeout(guideNextStep, 120);
    }
    
    function translateToHTMLElement(code) {
        var translationTable = {
            "undo": "button-undo",
            "redo": "button-redo",
            "touch": "console-tabs-level1",
            "drag": "console-tabs-level2",
            "build": "console-tabs-level3",
            "code": "console-tabs-level4",
            "title": "title",
            "fillscreen": "fullscreen-button",
            "camera": "whiteboard-tabs-download-button",
            "dialog": "dialog-body",
            "dialogTabs": "dialog-tabs",
            "console": "console-blocks",
            "consoleTabs": "console-tabs",
            "whiteboard": "whiteboard",
            "cameraImage": "whiteboard-downloadImage",
            "cameraAnimation": "whiteboard-downloadLayers-animation",
            "cameraAnimationSetup": "setup-downloadLayers-interval",
            "cameraGrid": "whiteboard-downloadLayers-grid",
            "cameraGridSetup": "setup-downloadLayers-columns",
            "popup": "msgBox0",
            "buttonAccept": "msgBoxAccept0",
            "buttonCancel": "msgBoxCancel0",
            "buttonClose": "msgBoxCancel0",
            "parametersBasic": "setupBlockTabsBasic",
            "parametersAdvanced": "setupBlockTabsAdvanced",
            "run": "button-execute",
            "clear": "button-clear",
            "reset": "button-reset",
            "setup": "dialog-tabs-setup",
            "language": "language-select",
            "load": "loadcode",
            "save": "savecode",
            "gridEnable": "setup-grid-enable",
            "gridSetup": "setup-grid-step",
            "coordinates": "setup-grid-coordinates",
            "guideEnable": "setup-guide-enable",
            "setup-execute-time": "setup-execute-time",
            "pieces": "dialog-tabs-pieces",
            "window": "dialog-tabs-window",
            "io": "dialog-tabs-io",
            "input": "dialog-io-input",
            "output": "dialog-io-output",
            "debug": "dialog-tabs-debug",
            "pauseEnable": "dialog-debug-execute-stepped",
            "pauseSetup": "dialog-debug-execute-step",
            "debugCommand": "dialog-debug-command-input",
            "debugCommandRun": "dialog-debug-command-button",
            "breakpointAdd": "dialog-debug-breakpoint-add",
            "watchpointAdd": "dialog-debug-watchpoint-add"
        }
        var elementId = translationTable[code];
        return elementId;
    }
    
    function loadGuide(iframeId, src, lang) {
        currentLanguage = lang?lang:"en";
        if (iframeId === undefined) {
            iframeId = getElementsByTagName("iframe");
            if (iframeId) {
                iframeId = iframeId[0].id;
            }
        }
        iframe = document.getElementById(iframeId);
        if (iframe) {
            window.addEventListener("load", function() {
                iframe.addEventListener("load", function() {
                    doc = iframe.contentWindow.document;
                    var style = doc.createElement('style');
                    style.type = 'text/css';
                    style.innerHTML = '.guideBorder { border: 2px solid red !important; }';
                    doc.getElementsByTagName('head')[0].appendChild(style);
                    doc.getElementsByTagName("html")[0].style.height = "100%";
                    doc.body.style.height = "100%";
                    createMouseClickHandler();
                    guideRestart();
                }, false);
                iframe.src = src; // Reload the iframe so the iframe's onload trigger is run
            }, false);
        }
    }

    function createMouseClickHandler() {
		var animationInterval = 50;
		var animationRepetitions = 8;
		var animationSizeIncrement = 4;
	    var shadowDiv = document.createElement("div");
		shadowDiv.style.display = "none";
		shadowDiv.style.border = "none";
		shadowDiv.style.backgroundColor = "#00FF00";
		shadowDiv.style.opacity = "0.5";
		shadowDiv.style.position = "absolute";
		shadowDiv.style.pointerEvents = "none";
        shadowDiv.style.zIndex = 100001;
        doc.body.appendChild(shadowDiv);
		var shadowMouseClick = function(event) {
		    if (event) {
		        var blockSizeInitial = 4;
		        shadowDiv.style.width = blockSizeInitial+"px";
        		shadowDiv.style.height = blockSizeInitial+"px";
        		shadowDiv.setAttribute("data-downcounter", animationRepetitions);
        		shadowDiv.style.left = event.clientX-blockSizeInitial/2;
        		shadowDiv.style.top = event.clientY-blockSizeInitial/2;
        		shadowDiv.style.borderRadius = (blockSizeInitial/2)+"px";
        		// We don't want to run this code yet because otherwise the new div goes under the pointer and the real element isn't clicked
				setTimeout(shadowMouseClick, animationInterval*3);
		    } else {
    			var downcounter = parseInt(shadowDiv.getAttribute("data-downcounter"));
    			if (downcounter == 0) {
    				shadowDiv.style.display = "none";
    			} else {
    			    shadowDiv.style.display = "block";
    				downcounter--;
    				var blockSize = parseInt(shadowDiv.style.width.replace("px",""))+animationSizeIncrement;
            		shadowDiv.style.borderRadius = (blockSize/2)+"px";
    				shadowDiv.style.height = blockSize+"px";
    				shadowDiv.style.width = blockSize+"px";
            		shadowDiv.style.left = (parseInt(shadowDiv.style.left.replace("px",""))-animationSizeIncrement/2)+"px";
            		shadowDiv.style.top = (parseInt(shadowDiv.style.top.replace("px",""))-animationSizeIncrement/2)+"px";
    				shadowDiv.setAttribute("data-downcounter", downcounter);
    				setTimeout(shadowMouseClick, animationInterval);
    			}
		    }
		}
        doc.body.addEventListener("mousedown", shadowMouseClick, false);
        doc.body.addEventListener("touchstart", shadowMouseClick, false);
	}

    var currentLanguage;
    var currentGuideIndex;
    var steppingBack = false;
    var iframe, doc;