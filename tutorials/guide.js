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

    function ttActivate () {
        var currentGuideStep = guideSteps[currentGuideIndex];
        var element = currentGuideStep.element;
        var position = currentGuideStep.position;
        var width = currentGuideStep.width;
        // create tooltip element.
        ttBox = document.createElement("div");
        ttBox.id = "ttBox";
        ttBox.style.borderRadius = "10px";
        ttBox.style.backgroundColor = "#EFEFEF";
        ttBox.style.textAlign = "center";
        ttBox.style.border = "1px solid #000000";
        ttBox.style.zIndex = 100000;
        ttBox.innerHTML = _(currentGuideStep.text);
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
            } else if (position == "inside") {
                if (element.getBoundingClientRect().height) {
                    coordY += element.getBoundingClientRect().height/2;
                    coordY -= Math.min(margin,element.getBoundingClientRect().height/2);
                }
            } else { // "under"
                coordY = element.getBoundingClientRect().bottom;
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
    }

    function ttDeactivate(clearBorders) {
        var currentGuideStep = guideSteps[currentGuideIndex];
        var doc = iframe.contentWindow.document;
        if (ttBox && ttBox.parentNode) {
            ttBox.parentNode.removeChild(ttBox);
        }
        if (clearBorders !== false) {
            if (currentGuideStep.element) {
                currentGuideStep.element.removeEventListener("mousemove", dragTtBox, false);
                currentGuideStep.element.removeEventListener("touchmove", dragTtBox, false);
                currentGuideStep.element.removeEventListener("mousedown", guideFinishStep, false);
                currentGuideStep.element.removeEventListener("touchstart", guideFinishStep, false);
                currentGuideStep.element.removeEventListener("mousemove", guideFinishStep, false);
                currentGuideStep.element.removeEventListener("touchmove", guideFinishStep, false);
                currentGuideStep.element.removeEventListener("mouseup", guideFinishStep, false);
                currentGuideStep.element.removeEventListener("touchend", guideFinishStep, false);
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
    
    function dragTtBox() {
        ttDeactivate(false);
        ttActivate();
    }
    
    function ttCountdown() {
        var doc = iframe.contentWindow.document;
        var countdownElement = doc.getElementById("ttBoxCountdown");
        if (countdownElement) {
            var timeLeft = parseFloat(countdownElement.innerHTML);
            if (timeLeft > 0) {
                countdownElement.innerHTML = timeLeft-1;
                setTimeout(ttCountdown, 1000);
            }
        }
    }

    function guideInit() {
        var doc = iframe.contentWindow.document;
        currentGuideIndex = 0;
        var style = doc.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '.guideBorder { border: 2px solid red !important; }';
        doc.getElementsByTagName('head')[0].appendChild(style);
        guideNextStep();
    }

    function guideNextStep() {
        if (currentGuideIndex >= guideSteps.length) {
            return;
        }
        var doc = iframe.contentWindow.document;
        var currentGuideStep = guideSteps[currentGuideIndex];
        var element = undefined;
        switch (currentGuideStep.type) {
            case "dialogInstructionName":
                var instructionSet = iframe.contentWindow.$_eseecode.instructions.set;
                var instruction = currentGuideStep.id;
                var id;
                for (var key in instructionSet) {
                    if (instructionSet[key].name == instruction) {
                        currentGuideStep.id = key;
                        break;
                    }
                }
                if (currentGuideStep.id !== undefined) {
                    currentGuideStep.type = "dialogInstructionId";
                }
                // We just searched for the id given the name, now search for the block given the id, so don't break
            case "dialogInstructionId":
                var instruction = currentGuideStep.id;
                var block = doc.getElementById("dialog-blocks").firstChild;
                //Search for the instruction
                while (block) {
                    if (block.getAttribute("data-instructionsetid") == instruction) {
                        element = block;
                        break;
                    }
                    block = block.nextSibling;
                }
                break;
            case "floatingBlock":
                var floatingBlocks = doc.getElementsByClassName("floatingBlock");
                if (floatingBlocks) {
                    element = floatingBlocks[0];
                    element.addEventListener("mousemove", dragTtBox, false);
                    element.addEventListener("touchmove", dragTtBox, false);
                }
                break;
            case "consoleBlockLine":
                var consoleDiv = doc.getElementById("console-blocks");
                var blockTuple = iframe.contentWindow.$e_searchBlockByPosition(consoleDiv.firstChild, currentGuideStep.id, 0)
                if (blockTuple && blockTuple.element) {
                    element = blockTuple.element;
                    // Scroll to this block
					var blockHeight = iframe.contentWindow.$e_blockSize(iframe.contentWindow.$_eseecode.modes.console[iframe.contentWindow.$_eseecode.modes.console[0]].id, element).height;
                    consoleDiv.scrollTop = id*blockHeight-10;
                }
                break;
            case "htmlElement":
                element = doc.getElementById(currentGuideStep.id);
                break;
            case "info":
                element = undefined;
                break;
            case "api":
                if (currentGuideStep.command) {
                    iframe.contentWindow.$e_loadURLParams(currentGuideStep.command);
                }
                element = undefined;
                setTimeout(guideFinishStep, 100);
                return;
                break;
        }
        currentGuideStep.element = element;
        currentGuideStep.text = "<b>"+currentGuideStep.text+"</b>";
        ttActivate(element, currentGuideStep);
        if (element) {
            currentGuideStep.oldBorder = getComputedStyle(element, '').getPropertyValue('border');
            element.className += " guideBorder";
        }
        if (currentGuideStep.timeout) {
            ttBox.innerHTML += '<br />[ '+_("Waiting")+'... <i id="ttBoxCountdown">'+currentGuideStep.timeout+'</i> ]';
            setTimeout(ttCountdown, 1000);
            setTimeout(guideFinishStep, currentGuideStep.timeout*1000);
        } else if (element && currentGuideStep.action != "clickMessage") {
            if (!currentGuideStep.action) {
                currentGuideStep.action = "mousedown";
            }
            var action = currentGuideStep.action;
            if (action == "mousedown" || action == "tocuhstart") {
                element.addEventListener("mousedown", guideFinishStep, false);
                element.addEventListener("touchstart", guideFinishStep, false);
            } else if (action == "mouseup" || action == "touchend") {
                element.addEventListener("mouseup", guideFinishStep, false);
                element.addEventListener("touchend", guideFinishStep, false);
            }
        } else { // type=="info" with no timeout, or action=="clickMessage"
            ttBox.addEventListener("mousedown", guideFinishStep, false);
            ttBox.addEventListener("touchstart", guideFinishStep, false);
            ttBox.innerHTML += "<br />Click on this message to continue";
        }
    }

    function guideFinishStep() {
        ttDeactivate();
        currentGuideIndex++;
        // We use this timeout so that the UI changes have been made between one step and the next
        setTimeout(guideNextStep, 100);
    }
    
    function loadGuide(iframeId, lang) {
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
                iframe.addEventListener("load", guideInit, false);
                iframe.src = iframe.src; // Reload the iframe so the iframe's onload trigger is run
            }, false);
        }
    }

    var currentLanguage;
    var currentGuideIndex;
    var ttBox;
    var iframe;