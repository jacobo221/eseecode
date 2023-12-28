"use strict";

var currentLanguage = (new URLSearchParams(window.location.search)).get("lang");
if (!currentLanguage && document.referrer) {
    const oldUrl = new URL(document.referrer);
    const oldParams = new URLSearchParams(oldUrl.search);
    currentLanguage = oldParams.get("lang");
    if (currentLanguage) {
        let urlParams = new URLSearchParams(window.location.search);
        urlParams.append("lang", currentLanguage);
        window.history.replaceState(null, null, '?' + urlParams); // So the next tutorial can see the lang in the referrer url
    }
}
if (!currentLanguage) currentLanguage = navigator.language.substring(0, 2);
var translations = {};
function add_translations(more_translations) {
    for (let key in more_translations) {
    if (!translations[key]) translations[key] = {};
    Object.assign(translations[key], more_translations[key]);
    }
}
function _(text, args) {
    if (!args) args = [];
    else if (!Array.isArray(args)) args = [ args ];
    var translated = text;
    if (currentLanguage && translations[currentLanguage]) {
    var lang = translations[currentLanguage];
    if (lang[text]) {
        translated = lang[text];
        args.forEach(v => translated = translated.replace("%s", v));
    } else {
        console.error('"'+text+'": ""');
    }
    }
    return translated;
}
add_translations({
    ca: {
        "Waiting": "Espera",
        "You didn't follow the step correctly. Please pay attention to the instructions.": "No has seguit les instruccions correctament. Si us plau para atenció a les instruccions.",
        "Click on this message to end": "Clica a aquest missatge per finalitzar",
        "Click on this message to continue": "Clica en aquest missatge per continuar",
        "you are being taken back to the previous step": "se t'està portant al pas anterior",
        "Step": "Paso",
        "You stepped away from the instructions, you have to back up in the tutorial": "No has seguit correctament les instruccions, has de tornar enrere al tutorial",
        "Due to security limitations on most modern browsers this guide does not work running it directly from the disk": "Degut a limitacions de seguretat a la majoria de navegadors moderns aquesta guia no funcionarà obrint-la directament des del disc dur",
    },
    es: {
        "Waiting": "Espera",
        "You didn't follow the step correctly. Please pay attention to the instructions.": "No has seguido las instrucciones correctamente. Por favor presta atención a las instrucciones.",
        "Click on this message to end": "Clica en este mensaje para acabar",
        "Click on this message to continue": "Clica en este mensaje para continuar",
        "you are being taken back to the previous step": "se te está llevando al paso anterior",
        "Step": "Paso",
        "You stepped away from the instructions, you have to back up in the tutorial": "No has seguido correctamente las instrucciones, debes volver atrás en el tutorial",
        "Due to security limitations on most modern browsers this guide does not work running it directly from the disk": "Debido a limitaciones de seguridad en la mayoría de navegadores modernos esta guóa no funcionará abriéndola directamente desde el disco duro",
    }
});

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
        } else if (position == "right") {
            coordY = element.getBoundingClientRect().top;
            coordX = element.getBoundingClientRect().right;
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

function redirectTutorial(url) {
    iframe.contentWindow.$e.setPreventExit(false);
    // Have to manually set realtive urls because in Firefox 118 it is using the iframe's location to calculate the parent frame's relative destination
    if (url.match(/(https?|file):\/\//)) {
        location.href = url;
    } else {
        location.href = location.origin + location.pathname.split('/').slice(0, -1).join('/') + '/' + url;
    }
}

function replaceLinks(text) {
    return text.replace(/ href="([^#"][^"]+)"/g, ' href="#" onclick="window.parent.redirectTutorial(\'$1\');return false;"');
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
        ttBox.innerHTML = "<b>"+replaceLinks(_(currentGuideStep.text))+"</b>";
    }
    if (currentGuideStep.text || currentGuideStep.timeout || currentGuideStep.type == "info" || currentGuideStep.action == "clickMessage") {
        doc.body.appendChild(ttBox);
    }
    ttPosition(ttBox, currentGuideStep);
    if (currentGuideStep.runNext === undefined) {
        currentGuideStep.runNext = guideFinishStep;
    }
    if (currentGuideStep.timeout) {
        ttBox.innerHTML += '<br />[ '+_("Waiting")+'... <i id="ttBoxCountdown">'+Math.round(currentGuideStep.timeout)+'</i> ]';
        setTimeout(ttCountdown, 1000);
        timeoutHandler = setTimeout(currentGuideStep.runNext, currentGuideStep.timeout*1000);
    } else if (currentGuideStep.type == "info" || currentGuideStep.action == "clickMessage") {
        ttBox.addEventListener("click", () => { currentGuideStep.runNext(); if (currentGuideStep.run) window.parent[currentGuideStep.run](); });
        var elements = ttBox.getElementsByTagName("a");
        for (var i=0; i<elements.length; i++) {
            elements[i].addEventListener("pointerdown", function(event){event.stopPropagation();});
        }
        if (currentGuideStep.embed) ttBox.innerHTML += "<br />" + "<p>" + replaceLinks(_(currentGuideStep.embed)) + "</p>";
        ttBox.innerHTML += "<br />"+_(currentGuideIndex === guideSteps.length - 1 ? "Click on this message to end" : "Click on this message to continue");
    } else if (typeof currentGuideStep.action == "function") {
        var actionListener = function() {
            if (currentGuideStep.action()) currentGuideStep.runNext();
            else timeoutHandler = setTimeout(actionListener, 100);
        };
        actionListener();
    } else if (element && currentGuideStep.action != "none") {
        var action = currentGuideStep.action;
        if (!action) {
            action = currentGuideStep.action = "pointerup";
        }
        if (currentGuideStep.timeout) {
            ttBox.innerHTML += '<br />[ '+_("Waiting")+'... <i id="ttBoxCountdown">'+currentGuideStep.timeout+'</i> ]';
            setTimeout(ttCountdown, 1000);
            timeoutHandler = setTimeout(currentGuideStep.runNext, currentGuideStep.timeout*1000);
        }
        if (action == "mousedown" || action == "touchstart" || action == "pointerdown") {
            element.addEventListener("pointerdown", currentGuideStep.runNext);
        } else if (action == "mouseup" || action == "touchend" || action == "click" || action == "pointerup") {
            if (element.nodeName == "BUTTON"  || (element.nodeName == "INPUT" && element.type == "button")) {
                element.addEventListener("keydown", function (event) {
                    if (event.key === "Enter") currentGuideStep.runNext(event);
                });
                element.addEventListener("keyup", function (event) {
                    if (event.key == " ") currentGuideStep.runNext(event);
                });
                element.addEventListener("pointerup", currentGuideStep.runNext);
            } else if ((element.nodeName == "INPUT") && element.type == "submit") {
                element.form.addEventListener("submit", currentGuideStep.runNext);
            } else if (element.nodeName == "INPUT") {
                [ "keypress", "paste", "input", "change", "pointerup" ].forEach(type => element.addEventListener(type, currentGuideStep.runNext));
            } else { // div, span, a, ...
                element.addEventListener("pointerup", currentGuideStep.runNext);
            }
        }
    }
    if (currentGuideStep.wrapper || ((currentGuideStep.type == "info" || currentGuideStep.action == "clickMessage") && currentGuideStep.wrapper !== false)) {
        ttWrapperActivate();
    }
    // The following allows to click links in the ttBox
    if (currentGuideStep.type == "info" || currentGuideStep.action == "clickMessage") {
        var elements = ttBox.getElementsByTagName("a");
        for (var i=0; i<elements.length; i++) {
            elements[i].addEventListener("pointerdown", function(event){event.stopPropagation();});
        } 
    }
}

function ttDeactivate(clearBorders) {
    clearTimeout(timeoutHandler);
    if (currentGuideIndex < 0) {
        console.error("Got index "+ currentGuideIndex+" in ttDeactivate. Trace:\n"+console.trace());
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
        if (currentGuideStep && currentGuideStep.element) {
            [ "pointerdown", "pointermove", "pointerup", "keydown", "keyup", "keypress", "paste", "input", "change", "submit" ].forEach(type => currentGuideStep.element.removeEventListener(type, currentGuideStep.runNext));
            currentGuideStep.element.className = currentGuideStep.element.className.replace(/\bguideBorder\b/,'');
        }
        // Remove view blocks which have been copied with guideBorder
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

function normalizeCode(code) { // Remove all spaces, tabs, newlines, always have exactly one semicolor between instructions, always have an ending semicolon
    code = code.replace(/[\r\n]*{+[\r\n]*/g, '{;').replace(/[\r\n]*}[\r\n]*/g, ';};').replace(/[\r\n;]+/g, ';').replace(/\s/g, '').replace(/'/g, '\"');
    if (code[code.length - 1] != ';') code += ';';
    return code;
}

function verify(system, currentGuideStep) {
    if (currentGuideStep.argument === undefined) {
        console.error("verify step lacks an argument");
        return;
    }
    if (system == "auto") {
        if (typeof currentGuideStep.argument == "function") system = "call";
        else system = "code";
    }
    var handler;
    switch (system) {
        case "code":
            handler = () => normalizeCode(iframe.contentWindow.$e.downloadCode());
            break;
        case "input":
            handler = iframe.contentWindow.$e.getInput;
            break;
        case "output":
            handler = iframe.contentWindow.$e.getOutput;
            break;
        case "breakpoints":
            handler = iframe.contentWindow.$e.getBreakpoints;
            break;
        case "watches":
            handler = iframe.contentWindow.$e.setWatches;
            break;
        case "call":
            handler = currentGuideStep.argument;
            break;
    }
    var validation = (system == "code" ? normalizeCode(currentGuideStep.argument) : currentGuideStep.argument) == handler();
    if (!validation) {
        guideStepBack(currentGuideStep);
    } else {
        currentGuideStep.action = undefined;
        setTimeout(currentGuideStep.runNext, 0); // Run next step and leave this step to close
    }
}

// While we stay in the same step from time to time verify that the element still exists, if it doesn't it is because the user did something wrong
function verifyElement(element, elementGuideIndex) {
    if (elementGuideIndex !== currentGuideIndex) return;
    if (!element || !doc.getElementById(element.id)) {
        ttDeactivate();
        ttActivate({ text: "You stepped away from the instructions, you have to back up in the tutorial", action: "clickMessage", runNext: function() {
            iframe.contentWindow.$e.restart();
            timeoutHandler = setTimeout(guideRestart(), 500); // Give it time for eSeeCode to restart
        } });
    } else {
        var floatingBlocks = doc.getElementsByClassName(".floating");
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

function dragTtBox(event) {
    var floatingBlocks = doc.getElementsByClassName(".floating");
    var currentGuideStep = guideSteps[currentGuideIndex];
    ttDeactivate(false);
    ttActivate({ text: currentGuideStep.text, element: floatingBlocks[0], position: currentGuideStep.position, width: currentGuideStep.width, action: "none" });
}

function guideDraggingBlock() {
    var floatingBlocks = doc.getElementsByClassName(".floating");
    if (floatingBlocks) {
        doc.body.addEventListener("pointermove", dragTtBox);
        doc.body.addEventListener("pointerup", guideDraggingBlockEnd);
    }
}

function guideDraggingBlockEnd() {
    doc.body.removeEventListener("pointermove", dragTtBox);
    doc.body.removeEventListener("pointerup", guideDraggingBlockEnd);
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
    // If no human steps have been defined manually, try to guess them
    if (!humanSteps.length) {
        for (var tempGuideIndex = 0; tempGuideIndex < guideSteps.length; tempGuideIndex++) {
            var tempGuideStep = guideSteps[tempGuideIndex];
            switch (tempGuideStep.type.toLowerCase()) {
                // Filter which types of guides can be accessible directly
                case "toolboxinstruction":
                case "viewblockline":
                case "info":
                case "executebutton":
                case "clearbutton":
                case "resetbutton":
                case "touchbutton":
                case "dragbutton":
                case "buildbutton":
                case "codebutton":
                case "fullscreen":
                case "toolbox":
                case "toolboxes":
                case "view":
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

async function guideGoToStep(stepNumber) {
    if (stepNumber < 0 || stepNumber >= guideSteps.length) {
        return;
    }
    ttDeactivate();
    iframe.contentWindow.$e.ui.msgBox.close();
    // Create a mashup of the last state of each type
    var mashupGuide = {};
    mashupGuide.code = ""; // By default, reset code, so if we go back to the first step it is blank
    for (var tempGuideIndex = 0; tempGuideIndex < stepNumber; tempGuideIndex++) {
        var tempGuideStep = guideSteps[tempGuideIndex];
        var type = tempGuideStep.type.toLowerCase();
        if (type == "restart") {
            mashupGuide = {};
        } else if ([ "touchbutton", "dragbutton", "buildbutton", "codebutton" ].includes(type) && tempGuideStep.action != "clickMessage" && !tempGuideStep.timeout) {
            mashupGuide.view = type.replace("button", "");
        } else if ([ "setup", "pieces", "window", "io", "debug" ].includes(type) && tempGuideStep.action != "clickMessage" && !tempGuideStep.timeout) {
            mashupGuide.toolbox = type;
        } else {
            if (type.startsWith("verify")) {
                if (type == "verify") type = "code";
                else type = type.substring("verify".length);
            }
            mashupGuide[type] = tempGuideStep.argument;
        }
    }
    // Reproduce all the steps
    // Only reproduce this types of step, and in this order
    [ "view", "toolbox", "grid", "gridstep", "guide", "filemenu", "lang", "input", "axis", "fullscreenmenu", "instructions", "precode", "code", "breakpoints", "watches" ].forEach(async function(key) {
        await guideNextStep({ type: key, argument: mashupGuide[key] }, true);
    });
    if (iframe.contentWindow.$e.getView() == "touch") {
        iframe.contentWindow.$e.execution.execute();
    }
    currentGuideIndex = stepNumber;
    guideNextStep();
}

function guideStepBack(currentGuideStep) {
    var ttBox;
    if (!steppingBack) {
        iframe.contentWindow.$e.stop();
        iframe.contentWindow.$e.ui.msgBox.close();
        ttDeactivate();
        ttActivate({ text: ((currentGuideStep.type == "verify" && currentGuideStep.text !== undefined)?currentGuideStep.text:"You didn't follow the step correctly. Please pay attention to the instructions."), action: "clickMessage" });
    }
    if (currentGuideStep.type == "verify") {
        var backupCode = currentGuideStep.correction;
        if (backupCode === undefined) {
            for (var i=currentGuideIndex-1; i>=0; i--) {
                if ((guideSteps[i].type == "verify" || guideSteps[i].type == "code") && !guideSteps[i].skipBackwards) {
                    backupCode = guideSteps[i].argument;
                    break;
                }
            }
        }
        if (backupCode === undefined) {
            backupCode = "";   
        }
        var runNow = (iframe.contentWindow.$e.getView() == "touch");
        iframe.contentWindow.$e.ide.uploadCode(backupCode, runNow);
    }
    if (currentGuideStep.stepsBack === undefined) {
        currentGuideStep.stepsBack = 2;
    }
    if (currentGuideStep.stepsBack > 0) {
        currentGuideIndex -= (currentGuideStep.stepsBack);
        if (steppingBack) {
            setTimeout(guideFinishStep, 0); // If no ttBox is being displayed (and thus no ttBox will be clicked), run next step and leave this step to close
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

async function guideNextStep(currentGuideStep, silent) {
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
    if (currentGuideStep.skipIf) {
        let value = currentGuideStep.skipIf;
        if (typeof value == "function") value = value();
        const runningStatus = iframe.contentWindow.$e.getStatus();
        if (value == "running") value = runningStatus == "running";
        else if (value == "not running") value = runningStatus != "running";
        else if (value == "killed") value = runningStatus == "clean" || runningStatus == "finished" || runningStatus == "stopped";
        else if (value == "not killed") value = runningStatus != "clean" && runningStatus != "finished" && runningStatus != "stopped";
        else if (value == "resetted") value = runningStatus == "clean";
        else if (value == "not resetted") value = runningStatus != "clean";
        else if (value == "finished") value = runningStatus == "finished";
        else if (value == "not finished") value = runningStatus != "finished";
        else if (value == "stopped") value = runningStatus == "stopped";
        else if (value == "not stopped") value = runningStatus != "stopped";
        else if (value == "frozen") value = runningStatus == "paused" || runningStatus == "breakpointed" || runningStatus == "stepped";
        else if (value == "not frozen") value = runningStatus != "paused" && runningStatus != "breakpointed" && runningStatus != "stepped";
        else if (value == "breakpointed") value = runningStatus == "breakpointed";
        else if (value == "not breakpointed") value = runningStatus != "breakpointed";
        else if (value == "paused") value = runningStatus == "paused";
        else if (value == "not paused") value = runningStatus != "paused";
        else if (value == "stepped") value = runningStatus == "stepped";
        else if (value == "not stepped") value = runningStatus != "stepped";
        if (value) return;
    }
    var element = undefined;
    var skipElement = false;
    if (currentGuideStep.runNext === undefined) {
        currentGuideStep.runNext = guideFinishStep;
    }
    currentGuideStep.type = currentGuideStep.type.toLowerCase();
    if (currentGuideStep.wait) await new Promise(r => setTimeout(r, currentGuideStep.wait !== true ? currentGuideStep.wait : 200))
    switch (currentGuideStep.type) {
        case "toolboxinstruction":
            var instruction = currentGuideStep.argument;
            var toolboxEl = doc.getElementById("toolbox-blocks");
            var block = toolboxEl.firstChild;
            //Search for the instruction
            while (block) {
                if (block.dataset.instructionSetId == instruction) {
                    element = block;
                    break;
                }
                block = block.nextSibling;
            }
            if (element) {
                iframe.contentWindow.$e.ui.blocks.scrollToBlock(element, toolboxEl);
                // Inject floatingBlock before going to next step
                var currentMode = iframe.contentWindow.$e.modes.views.current;
                if ((currentMode.name.toLowerCase() == "drag" || currentMode.name.toLowerCase() == "build") && currentGuideStep.runNext === guideFinishStep) {
                    currentGuideStep.runNext = guideDraggingBlock;
                }
            }
            if (currentGuideStep.action === undefined) {
                currentGuideStep.action = "pointerdown";
            }
            break;
        case "viewblockline":
            var viewEl = doc.getElementById("view-blocks");
            var blockEl = iframe.contentWindow.$e.ide.blocks.getByPosition(viewEl, currentGuideStep.argument)
            if (blockEl) {
                // Scroll to this block
                iframe.contentWindow.$e.ui.blocks.scrollToBlock(blockEl);
                // Inject floatingBlock before going to next step
                var currentMode = iframe.contentWindow.$e.modes.views.current;
                if ((currentMode.name.toLowerCase() == "drag" || currentMode.name.toLowerCase() == "build") && currentGuideStep.runNext === guideFinishStep) {
                    currentGuideStep.runNext = guideDraggingBlock;
                }
            }
            if (currentGuideStep.action === undefined) {
                currentGuideStep.action = "pointerdown";
            }
            break;
        case "parametervisual":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "setupBlock"+currentGuideStep.argument+"VisualInput";
            break;
        case "parametertext":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "setupBlock"+currentGuideStep.argument;
            break;
        case "info":
            element = undefined;
            skipElement = true;
            break;
        case "api":
            if (currentGuideStep.argument) {
                iframe.contentWindow.$e.api.loadURLParams(currentGuideStep.argument);
            }
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "view":
        case "toolbox":
        case "grid":
        case "gridstep":
        case "guide":
        case "filemenu":
        case "lang":
        case "input":
        case "axis":
        case "fullscreenmenu":
        case "instructions":
            if (currentGuideStep.argument) {
                iframe.contentWindow.$e.api.loadURLParams(currentGuideStep.type + "=" + currentGuideStep.argument);
                await new Promise(r => setTimeout(r, 100)); // Leave time for the API to do its work, otherwise the next UI might not be ready when the next step is processed
            }
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "execute":
            iframe.contentWindow.$e.api.execute();
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "pause":
            iframe.contentWindow.$e.api.pause();
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "resume":
            iframe.contentWindow.$e.api.resume();
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "stop":
            iframe.contentWindow.$e.api.stop();
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "clear":
            iframe.contentWindow.$e.api.reset();
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "restart":
            iframe.contentWindow.$e.api.restart();
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "fullscreen":
            iframe.contentWindow.$e.api.fullscreen(currentGuideStep.argument);
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "preventexit":
            iframe.contentWindow.$e.api.setPreventExit(currentGuideStep.argument);
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "code":
            if (currentGuideStep.argument || currentGuideStep.argument === "") {
                iframe.contentWindow.$e.api.uploadCode(currentGuideStep.argument);
            }
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "precode":
            if (currentGuideStep.argument || currentGuideStep.argument === "") {
                iframe.contentWindow.$e.api.uploadPrecode(currentGuideStep.argument);
            }
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "inject":
            if (currentGuideStep.argument) {
                iframe.contentWindow.$e.api.runCode(currentGuideStep.argument);
            }
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "breakpointadd":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "toolbox-debug-breakpoint-add";
            break;
        case "watchadd":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "toolbox-debug-watch-add";
            break;
        case "watchaddinput":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "watchAddInput";
            break;
        case "breakpoint":
        case "watch":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "toolbox-debug-analyzer-" + ($e.isNumber(currentGuideStep.argument, true) ? "line" : "watch") + "-" + currentGuideStep.argument;
            break;
        case "breakpointtoggle":
        case "watchtoggle":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "toolbox-debug-analyzer-" + ($e.isNumber(currentGuideStep.argument, true) ? "line" : "watch") + "-" + currentGuideStep.argument + "-break";
            break;
        case "breakpointremove":
        case "watchremove":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "toolbox-debug-analyzer-" + ($e.isNumber(currentGuideStep.argument, true) ? "line" : "watch") + "-" + currentGuideStep.argument + "-remove";
            break;
        case "breakpointupdate":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "toolbox-debug-analyzer-breakpoint-" + currentGuideStep.argument + "-edit";
            break;
        case "breakpointcount":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "toolbox-debug-analyzer-breakpoint-" + currentGuideStep.argument + "-count";
            break;
        case "executespeed":
            currentGuideStep.type = "htmlelement";
            currentGuideStep.argument = "toolbox-debug-execute-instructionsPause-input";
            break;
        case "breakpoints":
            if (currentGuideStep.argument || currentGuideStep.argument === "") {
                iframe.contentWindow.$e.setBreakpoints(currentGuideStep.argument, true);
            }
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 120);
            return;
            break;
        case "watches":
            if (currentGuideStep.argument || currentGuideStep.argument === "") {
                iframe.contentWindow.$e.setWatches(currentGuideStep.argument, true);
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
                verify("auto", currentGuideStep);
            }, 300); // Wait for the Touch mode animation to be finished
            return;
            break;
        case "verifycode":
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
        case "verifybreakpoints":
            element = undefined;
            skipElement = true;
            setTimeout(function() {
                verify("breakpoints", currentGuideStep);
            }, 300); // Wait for the Touch mode animation to be finished
            return;
            break;
        case "verifywatches":
            element = undefined;
            skipElement = true;
            setTimeout(function() {
                verify("watches", currentGuideStep);
            }, 300); // Wait for the Touch mode animation to be finished
            return;
            break;
        case "pagetitle":
            document.title = _(currentGuideStep.text);
            element = undefined;
            skipElement = true;
            setTimeout(currentGuideStep.runNext, 1);
            return;
            break;
        case "sleep":
            await new Promise(r => setTimeout(r, currentGuideStep.argument ? currentGuideStep.argument : 200));
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
            if (typeof currentGuideStep.argument == "string") {
                element = doc.getElementById(currentGuideStep.argument);
            } else if (typeof currentGuideStep.argument == "object") {
                element = currentGuideStep.argument;
            } else if (typeof currentGuideStep.argument == "function") {
                element = currentGuideStep.argument();
            }
            if (!element) {
                console.error("Invalid step type", currentGuideStep.type);
            }
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
    if (event && event.clientX /* to check it is a Mouse event */ && event.which > 0 && event.which != 1) {
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
        "touchbutton": "view-tabs-level1",
        "dragbutton": "view-tabs-level2",
        "buildbutton": "view-tabs-level3",
        "codebutton": "view-tabs-level4",
        "title": "title",
        "fullscreen": "fullscreen-button",
        "camera": "whiteboard-tabs-download-button",
        "toolbox": "toolbox-body",
        "dialogs": "toolbox-tabs",
        "views": "view-tabs",
        "view": "view-tabdiv",
        "viewmaximize": "view-tabs-resize",
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
        "parametersvisual": "setupBlockTabsVisual",
        "parameterstext": "setupBlockTabsText",
        "executebutton": "button-execute",
        "clearbutton": "button-clear",
        "pausebutton": "button-pause",
        "resetbutton": "button-reset",
        "fullscreenbutton": "fullscreen-button",
        "setup": "toolbox-tabs-setup",
        "language": "translations-select",
        "load": "loadcode",
        "save": "savecode",
        "gridenable": "setup-grid-enable",
        "gridsetup": "setup-grid-divisions",
        "coordinates": "setup-grid-coordinates",
        "guideenable": "setup-guide-enable",
        "pieces": "toolbox-tabs-pieces",
        "window": "toolbox-tabs-window",
        "io": "toolbox-tabs-io",
        "input": "toolbox-io-input",
        "output": "toolbox-io-output",
        "debug": "toolbox-tabs-debug",
        "pausesetup": "toolbox-debug-execute-step",
        "debugcommand": "toolbox-debug-command-input",
        "debugcommandexecute": "toolbox-debug-command-button",
        "breakpointadd": "toolbox-debug-breakpoint-add",
        "watchpointadd": "toolbox-debug-watchpoint-add"
    }
    var elementId = translationTable[code];
    return elementId;
}

function loadGuide(iframeId, src, lang) {

    if (location.href.startsWith('file://')) alert(_("Due to security limitations on most modern browsers this guide does not work running it directly from the disk"));
    if (!lang) lang = currentLanguage;
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
    if (!iframe) {
        console.error("Failed to laod the iframe");
        return;
    }
    window.addEventListener("load", function() {
        iframe.addEventListener("load", async function() {

            async function waitForAPIReady() {
                while (!iframe.contentWindow.$e.isReady || !iframe.contentWindow.$e.isReady()) await new Promise(r => setTimeout(r, 200));
                guideRestart();
            }

            doc = iframe.contentWindow.document;
            var style = doc.createElement('style');
            style.type = 'text/css';
            style.innerHTML = '.guideBorder { outline: 2px solid red !important; }';
            doc.getElementsByTagName('head')[0].appendChild(style);
            doc.getElementsByTagName("html")[0].style.height = "100%";
            doc.body.style.height = "100%";
            createMouseClickHandler();

            // Wait for the API to be ready
            await waitForAPIReady();
            
            // Now that the iframe is ready we can display the steps (otherwise if the used clicked on a step it would break)
            var guideStepsButtons = document.createElement("div");
            var iframeWidth = iframe.getBoundingClientRect().width;
            if (iframeWidth === undefined) {
                iframeWidth = iframe.style.width;
            }
            if (iframeWidth === undefined) {
                iframeWidth = iframe.style.width.replace("px","");
            }
            if (iframeWidth === undefined) {
                iframeWidth = iframe.width; //getAttribute("width");
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
                stepButton.onclick = "guideGoToStep("+guideHumanStep.index+")";
                guideStepsButtons.appendChild(stepButton);
            }
            if (iframe.nextSibling) {
                iframe.parentNode.insertBefore(guideStepsButtons, iframe.nextSibling);
            } else {
                iframe.parentNode.appendChild(guideStepsButtons);
            }
        });
        let calculatedSrc = src;
        if (!src.match(/(https?|file):\/\//)) calculatedSrc = (location.origin && location.origin != "null" ? location.origin : '') + location.pathname.split('/').slice(0, -1).join('/') + '/' + src;
        if (location.href.startsWith('file://') && !calculatedSrc.startsWith('file://')) calculatedSrc = 'file://' + calculatedSrc;
        const srcUrl = new URL(calculatedSrc);
        const srcParams = new URLSearchParams(srcUrl.search);
        const srcLang = srcParams.get("lang");
        if (!srcLang) {
            srcParams.append("lang", lang);
            src = (srcUrl.origin && srcUrl.origin != "null" ? srcUrl.origin : '')  + srcUrl.pathname + '?' + srcParams + (srcUrl.hash ? '#' + srcUrl.hash : '');
        }
        iframe.src = src; // Reload the iframe so the iframe's onload trigger is run
        if ((window.performance.navigation && window.performance.navigation.type === 1) || window.performance.getEntriesByType('navigation').map(nav => nav.type).includes('reload')) iframe.contentWindow.location.reload(); // This is to force triggering event "load" when page is refreshed
    });
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
        if (event && event.button !== undefined && event.button !== 0) {
            // If its a mouse click attend only to left button
            return;
        }
        if (event) {
            var blockSizeInitial = 4;
            shadowDiv.style.width = blockSizeInitial+"px";
            shadowDiv.style.height = blockSizeInitial+"px";
            shadowDiv.dataset.downcounter = animationRepetitions;
            shadowDiv.style.left = event.clientX-blockSizeInitial/2;
            shadowDiv.style.top = event.clientY-blockSizeInitial/2;
            shadowDiv.style.borderRadius = (blockSizeInitial/2)+"px";
            // We don't want to run this code yet because otherwise the new div goes under the pointer and the real element isn't clicked
            setTimeout(shadowMouseClick, animationInterval*3);
        } else {
            var downcounter = parseInt(shadowDiv.dataset.downcounter);
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
                shadowDiv.dataset.downcounter = downcounter;
                setTimeout(shadowMouseClick, animationInterval);
            }
        }
    }
    doc.body.addEventListener("click", shadowMouseClick); // click is also triggered by touchstart
}

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
            padding: 0 5px;\
        }\
        ";