"use strict";
        
	function _(text) {
		var translated = text;
		if (translations[currentLanguage]) {
		    var lang = translations[currentLanguage];
		    if (lang[text]) {
		    	translated = lang[text];
		    } else {
		        console.warn('"'+text+'": ""');
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
	
	function ttPosition(ttBox, currentGuideStep) {
        var element = currentGuideStep.element;
        var position = currentGuideStep.position;
        var width = currentGuideStep.width;
	    if (element) {
            if (width === undefined) {
                width = Math.max(200,element.getBoundingClientRect().width);
            }
            ttBox.style.width = width + "px";
            ttBox.style.position = "absolute";
            var coordX, coordY;
            var margin = 40;
            coordX = element.getBoundingClientRect().left;
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
                    if (currentGuideStep.width === undefined) {
                        coordX += margin;
                        width = Math.max(200,element.getBoundingClientRect().width-margin*2);
                        ttBox.style.width = width + "px";
                    } else {
                        coordX += margin;
                    }
                }
            } else if (position == "left") {
                coordY = element.getBoundingClientRect().top;
                coordX = element.getBoundingClientRect().left - width;
                coordX += 15; // Magic number, makes it align well in Chrome
                ttBox.style.borderTopRightRadius = "0px";
            } else { // "under"
                coordY = element.getBoundingClientRect().bottom;
                ttBox.style.borderTopLeftRadius = "0px";
            }
            ttBox.style.left = coordX + "px";
            ttBox.style.top = coordY + "px";
        } else {
            if (width === undefined) {
                width = 400;
            }
            ttBox.style.position = "fixed";
            ttBox.style.marginLeft = (width/2*(-1)) + "px";
            ttBox.style.left = "50%";
            ttBox.style.top = "50%";
            ttBox.style.width = width + "px";
        }
	}

    function ttActivate(currentGuideStep) {
        var element = currentGuideStep.element;
        var position = currentGuideStep.position;
        // Create tooltip
        var ttBox = document.createElement("div");
        ttBox.id = "ttBox";
        ttBox.style.borderRadius = "10px";
        ttBox.style.backgroundColor = "#EFEFEF";
        ttBox.style.textAlign = "center";
        ttBox.style.border = "1px solid #000000";
        ttBox.style.zIndex = 100000;
        if (currentGuideStep.text) {
            ttBox.innerHTML = "<b>"+_(currentGuideStep.text)+"</b>";
        }
        if (currentGuideStep.timeout || currentGuideStep.type == "info" || currentGuideStep.action == "clickMessage") {
            doc.body.appendChild(ttBox);
        }
        ttPosition(ttBox, currentGuideStep);
        if (currentGuideStep.runNext === undefined) {
            currentGuideStep.runNext = guideFinishStep;
        }
        if (currentGuideStep.timeout) {
            ttBox.innerHTML += '<br />[ '+_("Waiting")+'... <i id="ttBoxCountdown">'+currentGuideStep.timeout+'</i> ]';
            setTimeout(ttCountdown, 1000);
            timeoutHandler = setTimeout(currentGuideStep.runNext, currentGuideStep.timeout*1000);
        } else if (currentGuideStep.type == "info" || currentGuideStep.action == "clickMessage") {
            ttBox.addEventListener("mousedown", currentGuideStep.runNext, false);
            ttBox.addEventListener("touchstart", currentGuideStep.runNext, false);
            var elements = ttBox.getElementsByTagName("a");
            for (var i=0; i<elements.length; i++) {
                elements[i].addEventListener("mousedown", function(event){event.stopPropagation();}, false);
                elements[i].addEventListener("touchstart", function(event){event.stopPropagation();}, false);
            }
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
        // The following allows to click links in the ttBox
        if (currentGuideStep.type == "info" || currentGuideStep.action == "clickMessage") {
            var elements = ttBox.getElementsByTagName("a");
            for (var i=0; i<elements.length; i++) {
                elements[i].addEventListener("mousedown", function(event){event.stopPropagation();}, false);
                elements[i].addEventListener("touchstart", function(event){event.stopPropagation();}, false);
            } 
        }
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
    
    function verify(system, currentGuideStep) {
        if (currentGuideStep.argument === undefined) {
            console.warn("verify step lacks an argument");
            return;
        }
        var handler;
        switch (system) {
            case "input":
                handler = iframe.contentWindow.API_getInput;
                break;
            case "output":
                handler = iframe.contentWindow.API_getOutput;
                break;
            case "code":
                handler = iframe.contentWindow.API_downloadCode;
                break;
        }
        var validation = (currentGuideStep.argument == encodeURIComponent(handler()));
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
                    timeoutHandler = setTimeout(guideRestart(), 500); // Give it time for eSeeCode to restart
                } });
            } else {
                var floatingBlocks = doc.getElementsByClassName("floatingBlock");
                if (floatingBlocks.length === 0) {
                    var ttBox = doc.getElementById("ttBox");
                    if (ttBox) {
                        ttPosition(ttBox, guideSteps[elementGuideIndex]);
                    }
                }
                timeoutHandler = setTimeout(function() {
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
            doc.body.addEventListener("mouseup", guideDraggingBlockEnd, false);
            doc.body.addEventListener("touchend", guideDraggingBlockEnd, false);
        }
    }
    
    function guideDraggingBlockEnd() {
        doc.body.removeEventListener("mousemove", dragTtBox, false);
        doc.body.removeEventListener("touchmove", dragTtBox, false);
        doc.body.removeEventListener("mouseup", guideDraggingBlockEnd, false);
        doc.body.removeEventListener("touchend", guideDraggingBlockEnd, false);
        guideFinishStep();
    }
    
    function guideGetHumanSteps() {
        var humanSteps = [];
        // First see if the guide programmer has defined manually the human steps
        for (var tempGuideIndex = 0; tempGuideIndex < guideSteps.length; tempGuideIndex++) {
            var tempGuideStep = guideSteps[tempGuideIndex];
            if (tempGuideStep.humanStep) {
                humanSteps[humanSteps.length] = { index: tempGuideIndex, title: tempGuideStep.humanStep };
            }
        }
        // If no human steps have been definedmanually, try to guess them
        if (!humanSteps.length) {
            for (var tempGuideIndex = 0; tempGuideIndex < guideSteps.length; tempGuideIndex++) {
                var tempGuideStep = guideSteps[tempGuideIndex];
                switch (tempGuideStep.type.toLowerCase()) {
                    // Filter which types of guides can be accessible directly
                    case "dialoginstruction":
                    case "consoleblockline":
                    case "info":
                    case "executebutton":
                    case "clearbutton":
                    case "resetbutton":
                    case "touchbutton":
                    case "dragbutton":
                    case "buildbutton":
                    case "codebutton":
                    case "fullscreen":
                    case "dialog":
                    case "dialogs":
                    case "console":
                    case "views":
                    case "whiteboard":
                    case "pieces":
                    case "window":
                    case "io":
                    case "debug":
                        if (tempGuideStep.text) {
                            humanSteps[humanSteps.length] = { index: tempGuideIndex };
                        }
                }
            }
        }
        return humanSteps;
    }
    
    function guideGoToStep(stepNumber) {
        if (stepNumber < 0 || stepNumber >= guideSteps.length) {
            return;
        }
        clearTimeout(timeoutHandler);
        ttDeactivate();
        // Create a mashup of the last state of each type
        var mashupGuide = {};
        for (var tempGuideIndex = 0; tempGuideIndex < stepNumber; tempGuideIndex++) {
            var tempGuideStep = guideSteps[tempGuideIndex];
            var type = tempGuideStep.type.toLowerCase();
            if (type == "restart") {
                mashupGuide = [];
            } else {
                if (type == "verify") {
                    type = "code";
                } else if (type == "verifyInput") {
                    type = "input";
                }
                mashupGuide[type] = tempGuideStep.argument;
            }
        }
        // Reproduce all the steps
        for (var key in mashupGuide) {
            // Only reproduce this type of step
            switch (key) {
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
                case "fullscreenmenu":
                case "instructions":
                case "code":
                case "precode":
                case "input":
                guideNextStep({ type: key, argument: mashupGuide[key] }, true);
                break;
            }
        }
        currentGuideIndex = stepNumber;
        guideNextStep();
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
                    if (guideSteps[i].type == "verify" || guideSteps[i].type == "code") {
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

    function guideNextStep(currentGuideStep, silent) {
        if (currentGuideStep === undefined) {
            if (currentGuideIndex >= guideSteps.length) {
                return;
            }
            currentGuideStep = guideSteps[currentGuideIndex];
            var guideHumanStepButton = document.getElementById("guideHumanStepButton"+currentGuideIndex);
            if (guideHumanStepButton) {
                var activeGuideHumanButtons = document.getElementsByClassName("guideHumanActiveStep");
                for (var i=0; i<activeGuideHumanButtons.length; i++) {
                    activeGuideHumanButtons[i].className = activeGuideHumanButtons[i].className.replace(" guideHumanActiveStep","");
                }
                guideHumanStepButton.className += " guideHumanActiveStep";
            }
        } else {
            currentGuideStep.runNext = null;
        }
        var element = undefined;
        var skipElement = false;
        if (currentGuideStep.runNext === undefined) {
            currentGuideStep.runNext = guideFinishStep;
        }
        currentGuideStep.type = currentGuideStep.type.toLowerCase();
        var parameterCode = currentGuideStep.type.match(/^parameter([1-9][0-9]*)(visual)?$/);
        if (parameterCode) {
            var paramNumber = parameterCode[1];
            var paramVisual = (parameterCode[2]?"Visual":"");
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "setupBlock"+paramNumber+paramVisual;
        }
        switch (currentGuideStep.type) {
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
    				iframe.contentWindow.$e_scrollToBlock(element, dialogDiv);
                    // Inject floatingBlock before going to next step
                    var currentMode = iframe.contentWindow.$_eseecode.modes.console[iframe.contentWindow.$_eseecode.modes.console[0]];
                    if ((currentMode.name.toLowerCase() == "drag" || currentMode.name.toLowerCase() == "build") && currentGuideStep.runNext === guideFinishStep) {
                        currentGuideStep.runNext = guideDraggingBlock;
                    }
                }
                if (currentGuideStep.action === undefined) {
                    currentGuideStep.action = "mousedown";
                }
                break;
            case "consoleblockline":
                var consoleDiv = doc.getElementById("console-blocks");
                var blockTuple = iframe.contentWindow.$e_searchBlockByPosition(consoleDiv.firstChild, currentGuideStep.argument, 0)
                if (blockTuple && blockTuple.element) {
                    element = blockTuple.element;
                    // Scroll to this block
    				iframe.contentWindow.$e_scrollToBlock(element, consoleDiv);
                    // Inject floatingBlock before going to next step
                    var currentMode = iframe.contentWindow.$_eseecode.modes.console[iframe.contentWindow.$_eseecode.modes.console[0]];
                    if ((currentMode.name.toLowerCase() == "drag" || currentMode.name.toLowerCase() == "build") && currentGuideStep.runNext === guideFinishStep) {
                        currentGuideStep.runNext = guideDraggingBlock;
                    }
                }
                if (currentGuideStep.action === undefined) {
                    currentGuideStep.action = "mousedown";
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
            case "fullscreenmenu":
            case "instructions":
                if (currentGuideStep.argument) {
                    iframe.contentWindow.API_loadURLParams(currentGuideStep.type+"="+currentGuideStep.argument);
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
            case "clear":
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
            case "fullscreen":
                iframe.contentWindow.API_fullscreen(currentGuideStep.argument);
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
            case "precode":
                if (currentGuideStep.argument) {
                    iframe.contentWindow.API_uploadPrecode(decodeURI(currentGuideStep.argument));
                }
                element = undefined;
                skipElement = true;
                setTimeout(currentGuideStep.runNext, 120);
                return;
                break;
            case "inject":
                if (currentGuideStep.argument) {
                    iframe.contentWindow.API_runCode(decodeURI(currentGuideStep.argument));
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
                    verify("code", currentGuideStep);
                }, 300); // Wait for the Touch mode animation to be finished
                return;
                break;
            case "output":
                element = undefined;
                skipElement = true;
                setTimeout(function() {
                    verify("output", currentGuideStep);
                }, 300); // Wait for the Touch mode animation to be finished
                return;
                break;
            case "verifyinput":
                element = undefined;
                skipElement = true;
                setTimeout(function() {
                    verify("input", currentGuideStep);
                }, 300); // Wait for the Touch mode animation to be finished
                return;
                break;
            default:
                if (currentGuideStep.type != "htmlelement") {
                    var elementId = translateToHTMLElement(currentGuideStep.type);
                    if (elementId) {
                        currentGuideStep.argument = elementId;
                    } else {
                        currentGuideStep.argument = currentGuideStep.type;
                    }
                    currentGuideStep.type = "htmlelement";
                }
                element = doc.getElementById(currentGuideStep.argument);
                break;
        }
        if (element) {
            currentGuideStep.oldBorder = getComputedStyle(element, '').getPropertyValue('border');
            element.className += " guideBorder";
        } else if (!skipElement) {
            guideStepBack(currentGuideStep);
            return;
        }
        steppingBack = false;
        currentGuideStep.element = element;
        if (silent !== true) {
            ttActivate(currentGuideStep);
            if (element) {
                verifyElement(element, currentGuideIndex);
            }
        }
    }

    function guideFinishStep(event) {
		if (event && event.which > 0 && event.which != 1) {
			// If its a mouse attend only to left button
			return;
		}
        ttDeactivate();
        currentGuideIndex++;
        // We use this timeout so that the UI changes have been made between one step and the next
        setTimeout(guideNextStep, 120);
    }
    
    function translateToHTMLElement(code) {
        var translationTable = {
            "undobutton": "button-undo",
            "redobutton": "button-redo",
            "touchbutton": "console-tabs-level1",
            "dragbutton": "console-tabs-level2",
            "buildbutton": "console-tabs-level3",
            "codebutton": "console-tabs-level4",
            "title": "title",
            "fullscreen": "fullscreen-button",
            "camera": "whiteboard-tabs-download-button",
            "dialog": "dialog-body",
            "dialogs": "dialog-tabs",
            "console": "console-blocks",
            "views": "console-tabs",
            "whiteboard": "whiteboard",
            "cameraimage": "whiteboard-downloadImage",
            "cameraanimation": "whiteboard-downloadLayers-animation",
            "cameraanimationsetup": "setup-downloadLayers-interval",
            "cameragrid": "whiteboard-downloadLayers-grid",
            "cameragridsetup": "setup-downloadLayers-columns",
            "popup": "msgBox0",
            "accept": "msgBoxAccept0",
            "cancel": "msgBoxCancel0",
            "close": "msgBoxCancel0",
            "parametersbasic": "setupBlockTabsBasic",
            "parametersadvanced": "setupBlockTabsAdvanced",
            "executebutton": "button-execute",
            "clearbutton": "button-clear",
            "resetbutton": "button-reset",
            "fullscreenbutton": "fullscreen-button",
            "setup": "dialog-tabs-setup",
            "language": "language-select",
            "load": "loadcode",
            "save": "savecode",
            "gridenable": "setup-grid-enable",
            "gridsetup": "setup-grid-step",
            "coordinates": "setup-grid-coordinates",
            "guideenable": "setup-guide-enable",
            "timeoutfield": "setup-execute-time",
            "pieces": "dialog-tabs-pieces",
            "window": "dialog-tabs-window",
            "io": "dialog-tabs-io",
            "input": "dialog-io-input",
            "output": "dialog-io-output",
            "debug": "dialog-tabs-debug",
            "pauseenable": "dialog-debug-execute-stepped",
            "pausesetup": "dialog-debug-execute-step",
            "debugcommand": "dialog-debug-command-input",
            "debugcommandexecute": "dialog-debug-command-button",
            "breakpointadd": "dialog-debug-breakpoint-add",
            "watchpointadd": "dialog-debug-watchpoint-add"
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
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = guideCSS;
        document.body.appendChild(css);
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
            var guideStepsButtons = document.createElement("div");
            var iframeWidth = iframe.getBoundingClientRect().width;
            if (iframeWidth === undefined) {
                iframeWidth = iframe.style.width;
            }
            if (iframeWidth === undefined) {
                iframeWidth = iframe.style.width.replace("px","");
            }
            if (iframeWidth === undefined) {
                iframeWidth = iframe.width //getAttribute("width");
            }
            if (iframeWidth) {
                guideStepsButtons.style.maxWidth = iframeWidth+"px";
            }
            guideStepsButtons.className = "guideHumanSteps";
            var guideHumanSteps = guideGetHumanSteps();
            for (var i=0; i<guideHumanSteps.length; i++) {
                var guideHumanStep = guideHumanSteps[i];
                var stepButton = document.createElement("span");
                stepButton.innerHTML = (i+1);
                stepButton.id = "guideHumanStepButton"+guideHumanStep.index;
                stepButton.title = guideHumanStep.title?_(guideHumanStep.title):_("Step")+" "+(i+1);
                stepButton.className = "guideHumanStepButton";
                stepButton.setAttribute("onclick", "guideGoToStep("+guideHumanStep.index+")");
                guideStepsButtons.appendChild(stepButton);
            }
            if (iframe.nextSibling) {
                iframe.parentNode.insertBefore(guideStepsButtons, iframe.nextSibling);
            } else {
                iframe.parentNode.appendChild(guideStepsButtons);
            }
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
    		if (event && event.which > 0 && event.which != 1) {
    			// If its a mouse click attend only to left button
    			return;
    		}
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
    var timeoutHandler;
    var iframe, doc;
    
    var guideCSS = "\
            .guideHumanSteps {\
            }\
            .guideHumanStepButton {\
                float: left;\
                margin: 5px;\
                color: #000000;\
                cursor: pointer;\
            }\
            .guideHumanActiveStep {\
                font-weight: bold;\
                background-color: #888888;\
                color: #FFFFFF;\
                padding: 0px 5px 0px 5px;\
            }\
            "