"use strict";
	
	if (!$_eseecode) {
		var $_eseecode = {};
	}
	if (!$_eseecode.instructions) {
		$_eseecode.instructions = {};
	}
	if (!$_eseecode.ui) {
		$_eseecode.ui = {};
	}
	if (!$_eseecode.ui.translations) {
		$_eseecode.ui.translations = {};
	}
	if (!$_eseecode.ui.themes) {
		$_eseecode.ui.themes = {};
	}
	var handle;
	$_eseecode.instructions._set = $_eseecode.instructions.set;
	$_eseecode.instructions.set = Object.assign({}, $_eseecode.instructions._set);
	var mainURL;
	var setupItems = {
		"Introduction": {
			"introduction": { type: "html", html: "Using this tool you can create your own custom eSeeCode platform to fit exactly your needs for each exercise.<br><br>Use the preview panel below to see and test live how eSeeCode will look like with your settings.<br>Once you are done setting it up, copy the URL and share it.", skipParameterInURL: true }
		},
		"Application settings": {
			lang: { title: "Language", type: "select", options: $_eseecode.ui.translations, sort: true, initial: "default", help: "Set the language you want for eSeeCode's user interface." },
			translations: { title: "Display translations menu?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the translations should be visible or hidden." },
			theme: { title: "Theme", type: "select", options: $_eseecode.ui.themes, initial: "default", sort: true, help: "Set the theme you want for eSeeCode's user interface." },
			themes: { title: "Display themes menu?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the themes should be visible or hidden." },
			filemenu: { title: "Display file menu?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the buttons \"Load\" and \"Save\" should be visible or hidden." },
			fullscreenmenu: { title: "Display fullscreen button?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the fullscreen button should be visible or hidden." },
			preventexit: { title: "Warn on exit if used has entered code?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether or not eSeeCode should require confirmation before being closed (or before changing the webpage)." }
		},
		"Programming environment": {
			view: { title: "Initial view", type: "select", options: ["Touch", "Drag", "Build", "Code"], initial: "Touch", help: "Select the view which will be displayed initially." },
			viewtabs: { title: "View tabs to display", type: "multiple", options: ["Touch", "Drag", "Build", "Code"], initial: "Touch;Drag;Build;Code", help: "Select which views will be available." },
			forceblocksetup: { title: "Force block setup", type: "checkbox", initial: "true", help: "Force block setup when adding instructions in Drag mode." },
			blocksetup: { title: "Block setup style", type: "select", options: ["Visual", "Text"], initial: "Text", help: "Select how to view the setup of blocks. In Drag view blocks are always setup in visually by default, but in Build view you can decide whether to display the text setup by default or the visual interface by default." },
			maximize: { title: "Display code console maximized?", type: "select", options: ["Yes", "No"], initial: "No", help: "Decide whether the code console should be maximized initially." },
			pause: { title: "Milliseconds of delay between instructions", type: "number", initial: "500", help: "Set the amount of milliseconds to delay every time an instruction is executed." },
			step: { title: "Pause on every instruction", type: "checkbox", initial: "false", help: "Pause execution every time an instruction is run, to help debugging." },
			observe: { title: "List of variables to observe", type: "text", initial: "", help: "Comma-separated list variables to observe.<br>Example: index,question,answer" },
			breakpoints: { title: "List of breakpoints and watchpoints", type: "text", initial: "", help: "Comma-separated list of breakpoints (line number) and/or watchpoints (break when variable's value changes).<br>Example: index,4,10,question,answer,25" },
		},
		"Whiteboard": {
			background: { title: "Whiteboard background", type: "text", help: "Display an image as background in all whiteboard layers. The image can be a public URL or an image name (which must be uploaded)" },
			guide: { title: "Display guide?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the guide (the cursor in the whiteboard) will be visible or hidden." },
			guideimage: { title: "Custom image for guide?", type: "text", help: "Display a custom image instead of the default guide. The image can be a public URL or an image name (which must be uploaded)" },
			guidesize: { title: "Size of the guide", type: "number", initial: "20", help: "Size of the guide in pixels (size is used for both width and height)" },
			grid: { title: "Display grid?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the grid (the lines in the whiteboard) will be visible or hidden." },
			griddivisions: { title: "Amount of grid lines?", type: "number", initial: "15", help: "Set the amount of lines in the grid." },
			axis: { title: "Axis", type: "select", options: ["Computer console", "Mathematical simple", "Mathematical centered"], initial: "Mathematical centered", help: "Select which coordinates you want:<br /><ul><li>Computer console: Origin is at upper left corner, increments right and downwards</li><li>Mathematical simple: Origin is at lower left corner, increments right and upwards</li><li>Mathematical centered: Origin is centered, increments right and upwards</li></ul>" }
		},
		"Instructions": {
			custominstructions: { title: "Additional instructions' specifications", type: "custominstructions", initial: "", help: "Additional instructions to add to the programming environment, available to the users. The icon can be a public URL or an image name (which must be uploaded)" },
			instructions: { title: "Do you want to use a subset of instructions? If so, select which instructions to make available", type: "instructions", options: function() { return $_eseecode.instructions.set; }, initial: "", help: "Here you can choose a subset of intructions to be available to the user (all others will be disabled).<ul style=\"text-align:justify;\"></li><li>Add them by selecting an instruction in the first column and clicking the \"Add\" button. You can add an instruction several times.</li><li>Double-click any instruction in the buttom column to set up its parameters, the amount of times the instruction can be used and whether or not the user can set up its parameters. Remember to click \"Apply\" to apply after you finish setting up every instruction.</li><li>Move up and down any instruction in the bottom column by selecting it and clicking the \"Up\" or \"Down\" buttons.</li><li>You can remove an instruction from the right column by selecting it and clicking the \"Remove\"button.</li><li>Click the \"Add spacer\" button to add a separator to the instructions in the bottom column. The separator will be added at the end, remember to move it up with the \"Up\" button.</li></ul>" }, // Use function for options since the set it is pointing to changes every time custominstructions is updated
			basepath: { title: "Base path for media", type: "text", initial: "", help: "Base path to prefix to relative paths for the sources of image() and sound() instructions" },
		},
		"Code": {
			precode: { title: "Code to preload (hidden to the user)", type: "textarea", initial: "", help: "The code you write here will be hidden to the user but will be run immediately after loading eSeeCode and everytime before the user code." },
			code: { title: "Code to load as user code (displayed to the user)", type: "textarea", initial: "", help: "The code you write here will be shown as part of the solution, so the user can view it and modify it." },
			execute: { title: "Execute the user code", type: "checkbox", initial: "false", help: "Decide whether or not to run the user code immediately after loading eSeeCode." },
			postcode: { title: "Code to postload (hidden to the user)", type: "textarea", initial: "", help: "The code you write here will be hidden to the user but will be run everytime after the user code." },
			input: { title: "Input", type: "textarea", initial: "", help: "Set the input that will appear in the I/O dialog." }
		},
		"Share": {
			links: { type: "html", skipParameterInURL: true }
		}
		
	}
	var parametersCalledFromAPI;

	function encodeExerciseURL(url) {
		if (url.includes('code=') || url.includes('custominstructions=')) { // code=, precode=, postcode=, custominstructions=
			let [ mainURL, restURL ] = url.split('?');
			let [ params, target ] = restURL.split('#');
			url = mainURL;
			if (params) url += '?e=' + btoa(params);
			if (target) url += '#' + target;
		}
		return url;
	}

	function createExerciseTool(divId, createExerciseHandle, src, skipURL, mergeSteps, postRun) {
		handle = createExerciseHandle;
		if (!handle) handle = function(url) {
			url = encodeExerciseURL(url);
			document.getElementById("links").innerHTML = "Use this code to embed the exercise in your website:<br /><br />&lt;iframe width=\"1000\" height=\"600\" src=\""+url+"\" allowfullscreen=\"true\">&lt;/iframe>" + (url.length >= 2000 ? "The resulting URL has 2000 characters or more. This URL might not load correctly on Internet Explorer browsers!" : "");
		};
		mainURL = src;
		if (!mainURL) {
			mainURL = "https://play.eseecode.com";
		}
		parametersCalledFromAPI = skipURL;
		var assistant = document.getElementById(divId);
	
		if (!mergeSteps) mergeSteps = {};
		setupItems = Object.assign(setupItems, mergeSteps);
		var stepNumber = 1;
		var divSwitch = document.createElement("div");
		divSwitch.id = "switch";
		var element = document.createElement("span");
		//element.innerHTML = "Switch to: ";
		divSwitch.appendChild(element);
		element = document.createElement("input");
		element.id = "switchMode";
		element.setAttribute("type", "button");
		element.setAttribute("value", "Full view");
		element.setAttribute("data-switchTo", "full");
		element.addEventListener("click", switchMode);
		divSwitch.appendChild(element);
		assistant.appendChild(divSwitch);
		var divSteps = document.createElement("div");
		divSteps.id = "steps";
		divSteps.class = "steps";
		Object.entries(setupItems).forEach(([page, setupPage]) => {
			var div = document.createElement("div");
			div.id = "step-"+stepNumber;
			div.class = "step";
			var divTitle = document.createElement("div");
			divTitle.className = "pageTitle";
			divTitle.innerHTML = page;
			div.appendChild(divTitle);
			Object.keys(setupPage).forEach(key => createSetupItem(setupPage, key, div));
			div.style.clear = "left";
			divSteps.appendChild(div);
			stepNumber++;
		});
		assistant.appendChild(divSteps);
		element = document.createElement("input");
		element.id = "stepNumber";
		element.setAttribute("type", "hidden");
		element.setAttribute("value", "1");
		assistant.appendChild(element);
		var divNavigator = document.createElement("div");
		divNavigator.id = "controls";
		divNavigator.class = "controls";
		var divButtons = document.createElement("div");
		divButtons.id = "controls-navigator";
		element = document.createElement("input");
		element.id = "prev";
		element.setAttribute("type", "button");
		element.setAttribute("value", "< Back");
		element.addEventListener("click",goToPrevStep);
		divButtons.appendChild(element);
		var element = document.createElement("select");
		element.id = "jump";
		stepNumber = 1;
		var options = "";
		for (var page in setupItems) {
			options += "<option value=\""+stepNumber+"\">"+stepNumber+": "+page+"</option>"; 
			stepNumber++;
		}
		element.innerHTML = options;
		element.addEventListener("change", jump);
		divButtons.appendChild(element);
		element = document.createElement("input");
		element.id = "next";
		element.setAttribute("type", "button");
		element.setAttribute("value", "Next >");
		element.addEventListener("click",goToNextStep);
		divButtons.appendChild(element);
		divNavigator.appendChild(divButtons);
		assistant.appendChild(divNavigator);
		if (postRun) postRun();
		goToStep();
		buildURL();
	}

	function createSetupItem(setupPage, key, parentDiv) {
		let div = document.createElement("DIV");
		div.className = "page_field";
		parentDiv.appendChild(div);
		if (setupPage[key].category) div.setAttribute("data-category", setupPage[key].category);
		if (setupPage[key].title) {
			var title = document.createElement("DIV");
			title.className = "title";
			title.innerHTML = setupPage[key].title;
			title.innerHTML += " ";
			div.appendChild(title);
		}
		if (setupPage[key].help) {
			var divHelp = document.createElement("div");
			divHelp.className = "help";
			divHelp.innerHTML = setupPage[key].help;
			if (setupPage[key].initial || setupPage[key].userValue) {
				divHelp.innerHTML += "<br />";
				if (setupPage[key].initial) {
					divHelp.innerHTML += "<br /><u>Default:</u> <i>"+decodeURIComponent(setupPage[key].initial)+"</i>";
				}
				if (setupPage[key].userValue) {
					divHelp.innerHTML += "<br /><u>Your saved value:</u> <i>"+decodeURIComponent(setupPage[key].userValue)+"</i>";
				}
			}
			div.appendChild(divHelp);
		}
		if (setupPage[key].title && setupPage[key].type != "button") {
			var title = document.createElement("label");
			title.innerHTML = setupPage[key].title;
			if (setupPage[key].title.substring(setupPage[key].title.length-1) != "?") {
				title.innerHTML += ":";
			}
			title.innerHTML += " ";
			div.appendChild(title);
		}
		var defaultValue = (setupPage[key].userValue?setupPage[key].userValue:setupPage[key].initial);
		if (setupPage[key].type == "select") {
			var select = document.createElement("select");
			select.id = key;
			var options = setupPage[key].options;
			// Sort the items alphabetically
			if (setupPage[key].sort && options) {
				if ((typeof options[0]) === "object") {
					options = options.sort(function(a,b) {
						return a.name > b.name;
					});
				} else {
					options.sort();
				}
			}
			var selectOptions = "";
			for (var optionsKey in options) {
				var selected = "", selectId = "";
				var id, value;
				if ((typeof options[optionsKey]) === "object") {
					id = options[optionsKey].id;
					value = options[optionsKey].name;
					selectId = " value=\""+id+"\"";
				} else {
					value = options[optionsKey];
					id = value;
				}
				if (defaultValue && (id.toLowerCase() === defaultValue.toLowerCase())) {
					selected = " selected";
				}
				selectOptions += "<option"+selectId+selected+">"+value+"</option>";
			}
			select.innerHTML = selectOptions;
			if (setupPage[key].events) Object.entries(setupPage[key].events).forEach(([ event, callback ]) => select.addEventListener(event, callback));
			if (!setupPage[key].skipParameterInURL) select.addEventListener("change", buildURL);
			div.appendChild(select);
		} else if (setupPage[key].type == "multiple") {
			var br = document.createElement("br");
			div.appendChild(br);
			var select = document.createElement("select");
			select.id = key;
			select.setAttribute("multiple", true);
			var options = setupPage[key].options;
			var selectOptions = "";
			for (var id in options) {
				var selected = "";
				if (defaultValue) {
					var defaultOptions = defaultValue.split(";");
					for (var defaultOption in defaultOptions) {
						if (options[id].toLowerCase() === defaultOptions[defaultOption].toLowerCase()) {
							selected = " selected";
						}
					}
				}
				selectOptions += "<option"+selected+">"+options[id]+"</option>";
			}
			select.innerHTML = selectOptions;
			if (setupPage[key].events) Object.entries(setupPage[key].events).forEach(([ event, callback ]) => select.addEventListener(event, callback));
			if (!setupPage[key].skipParameterInURL) select.addEventListener("change", buildURL);
			div.appendChild(select);
		} else if (setupPage[key].type == "instructions") {
			var br = document.createElement("br");
			div.appendChild(br);
			var defaultsSpan = document.createElement("span");
			defaultsSpan.innerHTML = "Load defaults: ";
			div.appendChild(defaultsSpan);
			var defaultsButton1 = document.createElement("input");
			defaultsButton1.type = "button";
			defaultsButton1.value = "Touch";
			div.appendChild(defaultsButton1);
			var defaultsButton2 = document.createElement("input");
			defaultsButton2.type = "button";
			defaultsButton2.value = "Drag";
			div.appendChild(defaultsButton2);
			var defaultsButton3 = document.createElement("input");
			defaultsButton3.type = "button";
			defaultsButton3.value = "Build";
			div.appendChild(defaultsButton3);
			var defaultsButton4 = document.createElement("input");
			defaultsButton4.type = "button";
			defaultsButton4.value = "Code";
			div.appendChild(defaultsButton4);
			var defaultsButton5 = document.createElement("input");
			defaultsButton5.type = "button";
			defaultsButton5.value = "Restore";
			defaultsButton5.style.display = "none";
			div.appendChild(defaultsButton5);
			var br = document.createElement("br");
			div.appendChild(br);
			var innerDiv = document.createElement("div");
			innerDiv.id = "instructionsbody";
			var elementId = key;
			var instructionsoriginDiv = document.createElement("div");
			instructionsoriginDiv.id = "instructionsorigindiv";
			innerDiv.appendChild(instructionsoriginDiv);
			var instructionsoriginfilterDiv = document.createElement("div");
			var instructionsoriginfilterSpan = document.createElement("span");
			instructionsoriginfilterSpan.innerHTML = "Filter: ";
			instructionsoriginfilterDiv.appendChild(instructionsoriginfilterSpan);
			var selectfilter = document.createElement("input");
			selectfilter.id = elementId+"originsearch";
			if (!setupPage[key].skipParameterInURL) selectfilter.addEventListener("keyup",function(e) {Array.from(document.getElementById(elementId+"origin").children).forEach(o => { if (o.innerHTML.startsWith(e.target.value)) o.removeAttribute("hidden"); else o.setAttribute("hidden", "hidden"); });});
			instructionsoriginfilterDiv.appendChild(selectfilter);
			instructionsoriginDiv.appendChild(instructionsoriginfilterDiv);
			var instructionsoriginaddDiv = document.createElement("div");
			var select = document.createElement("select");
			select.id = elementId+"origin";
			select.style.height = "150px";	
			select.setAttribute("multiple", true);
			instructionsoriginaddDiv.appendChild(select);
			var instructionsoriginspaceSpan = document.createElement("span");
			instructionsoriginspaceSpan.innerHTML = " ";
			instructionsoriginaddDiv.appendChild(instructionsoriginspaceSpan);
			var rightButton = document.createElement("input");
			rightButton.type = "button";
			rightButton.value = "Add";
			rightButton.setAttribute('disabled', 'disabled');
			if (!setupPage[key].skipParameterInURL) rightButton.addEventListener("click",function() {selectOrderMove("right",elementId);buildURL();});
			instructionsoriginaddDiv.appendChild(rightButton);
			instructionsoriginDiv.appendChild(instructionsoriginaddDiv);
			var instructionsdestDiv = document.createElement("div");
			instructionsdestDiv.id = "instructionsdestdiv";
			instructionsdestDiv.style.display = "none";
			innerDiv.appendChild(instructionsoriginDiv);
			var instructionsdestSpan = document.createElement("span");
			instructionsdestSpan.innerHTML = "Selected instructions:";
			instructionsdestSpan.style.display = "block";
			instructionsdestDiv.appendChild(instructionsdestSpan);
			var select2 = document.createElement("select");
			select2.id = elementId;
			select2.style.height = "150px";
			select2.style.minWidth = "100px";
			select2.setAttribute("multiple", true);
			instructionsdestDiv.appendChild(select2);
			const observer = new MutationObserver((mutationList, observer) => {
				mutationList[0].target.parentNode.style.display = mutationList[0].target.children.length === 0 ? "none" : "block";
			});
			observer.observe(select2, { childList: true });
			var buttonsDiv = document.createElement("div");
			buttonsDiv.id = "instructionsbuttons";
			buttonsDiv.style.height = "150px";
			buttonsDiv.style.display = "inline-block";
			var upButton = document.createElement("input");
			upButton.type = "button";
			upButton.style.marginBottom = "0px";
			upButton.value = " Up ";
			upButton.setAttribute('disabled', 'disabled');
			if (!setupPage[key].skipParameterInURL) upButton.addEventListener("click",function() {selectOrderMove("up",elementId);buildURL();});
			buttonsDiv.appendChild(upButton);
			br = document.createElement("br");
			buttonsDiv.appendChild(br);
			var downButton = document.createElement("input");
			downButton.type = "button";
			downButton.style.marginTop = "0px";
			downButton.value = "Down";
			downButton.setAttribute('disabled', 'disabled');
			if (!setupPage[key].skipParameterInURL) downButton.addEventListener("click",function() {selectOrderMove("down",elementId);buildURL();});
			buttonsDiv.appendChild(downButton);
			br = document.createElement("br");
			buttonsDiv.appendChild(br);
			var setupButton = document.createElement("input");
			setupButton.type = "button";
			setupButton.style.marginTop = "1px";
			setupButton.value = "Customize";
			setupButton.setAttribute('disabled', 'disabled');
			setupButton.setAttribute("data-elementId", elementId);
			setupButton.addEventListener("click", changeParameters);
			buttonsDiv.appendChild(setupButton);
			br = document.createElement("br");
			buttonsDiv.appendChild(br);
			var blankButton = document.createElement("input");
			blankButton.type = "button";
			blankButton.style.marginBottom = "1px";
			blankButton.value = "Add spacer";
			if (!setupPage[key].skipParameterInURL) blankButton.addEventListener("click",function() {var option = document.createElement("option");option.value="blank;";option.innerHTML="-----";document.getElementById(elementId).appendChild(option);buildURL();});
			buttonsDiv.appendChild(blankButton);
			br = document.createElement("br");
			buttonsDiv.appendChild(br);
			var leftButton = document.createElement("input");
			leftButton.type = "button";
			leftButton.value = "Remove";
			leftButton.setAttribute('disabled', 'disabled');
			if (!setupPage[key].skipParameterInURL) leftButton.addEventListener("click",function() {selectOrderMove("left",elementId);buildURL();});
			buttonsDiv.appendChild(leftButton);
			instructionsdestDiv.appendChild(buttonsDiv);
			innerDiv.appendChild(instructionsdestDiv);
			var selectOrder = {};
			var selectOptions = {};
			// Read default values
			if (defaultValue) {
				defaultValue = defaultValue.split(";");
				for (var j=0; j<defaultValue.length; j++) {
					var instructionName = defaultValue[j].trim();
					if ($_eseecode.instructions.set[instructionName]) {
						var defaultInstruction = instructionName+";"
						var k = 0;
						while (j+1+k < defaultValue.length && (
						  $e_isNumber(defaultValue[j+1+k],true) ||
						  $e_isBoolean(defaultValue[j+1+k],true) ||
						  decodeURIComponent(defaultValue[j+1+k]).charAt(0) == '"' ||
						  decodeURIComponent(defaultValue[j+1+k]).charAt(0) == "'" ||
						  defaultValue[j+1+k] == "showParams" ||
						  defaultValue[j+1+k] == "noChange" ||
						  defaultValue[j+1+k].indexOf("param:") == 0 ||
						  defaultValue[j+1+k].indexOf("count:") == 0)) {
		                    if (defaultValue[j+1+k] == "showParams") {
		                    	defaultInstruction += "showParams;";
		                    } else if (defaultValue[j+1+k] == "noChange") {
		                    	defaultInstruction += "noChange;";
		                    } else if (defaultValue[j+1+k].indexOf("count:") == 0) {
		                    	var maxCount = parseInt(defaultValue[j+1+k].split(":")[1]);
		                    	defaultInstruction += "count:"+maxCount+";";
		                    } else if ($_eseecode.instructions.set[instructionName].parameters[k]) {
				            	var param = defaultValue[j+1+k];
		                    	if (param.indexOf("param:") == 0) {
		                    		param = param.split(":")[1];
		                    	}
		                    	defaultInstruction += "param:"+param+";";
					        } else {
								console.warn("Error while loading instructions from URL: There is no "+$e_ordinal(k+1)+" parameter for instruction "+defaultValue[j]+". You tried to set it to: "+defaultValue[j+1+k]);
					        }
					        k++;
						}
						j += k;
						if (!selectOrder["lastSave"]) {
							selectOrder["lastSave"] = "";
						}
						selectOrder["lastSave"] += "<option ondblclick=\"changeParameters({target:this})\" value=\""+defaultInstruction+"\">"+instructionName+"</option>";
					} else {
						console.warn("Error while loading instructions from URL: Instruction "+instructionName+" doesn't exist");
					}
				}
			}
			// Create options
			createSortOptions(setupPage[key], select, selectOptions, selectOrder, elementId);
			select.addEventListener('change', e => {
				const disable = e.target.selectedOptions.length === 0;
				[ rightButton ].forEach(el => {
					if (disable) el.setAttribute('disabled', 'disabled');
					else el.removeAttribute('disabled');
				});
			});
			select2.addEventListener('change', e => {
				const disable = e.target.selectedOptions.length === 0;
				[ leftButton, upButton, downButton, setupButton ].forEach(el => {
					if (disable) el.setAttribute('disabled', 'disabled');
					else el.removeAttribute('disabled');
				});
			});
			if (!setupPage[key].skipParameterInURL) defaultsButton1.addEventListener("click",function() {select2.innerHTML = selectOrder["level1"];changeParametersClose();buildURL();});
			if (!setupPage[key].skipParameterInURL) defaultsButton2.addEventListener("click",function() {select2.innerHTML = selectOrder["level2"];changeParametersClose();buildURL();});
			if (!setupPage[key].skipParameterInURL) defaultsButton3.addEventListener("click",function() {select2.innerHTML = selectOrder["level3"];changeParametersClose();buildURL();});
			if (!setupPage[key].skipParameterInURL) defaultsButton4.addEventListener("click",function() {select2.innerHTML = selectOrder["level4"];changeParametersClose();buildURL();});
			if (selectOrder["lastSave"]) {
				select2.innerHTML = selectOrder["lastSave"];
				if (!setupPage[key].skipParameterInURL) defaultsButton5.addEventListener("click",function() {select2.innerHTML = selectOrder["lastSave"];changeParametersClose();buildURL();});
				defaultsButton5.style.display = "inline-block";
			}
			div.appendChild(innerDiv);
		} else if (setupPage[key].type == "custominstructions") {
			div.appendChild(createCustomInstructionsUI(defaultValue));
		} else if (setupPage[key].type == "textarea") {
			var br = document.createElement("br");
			div.appendChild(br);
			var input = document.createElement("textarea");
			input.id = key;
			if (defaultValue) {
				input.innerHTML = defaultValue;
			}
			if (setupPage[key].events) Object.entries(setupPage[key].events).forEach(([ event, callback ]) => input.addEventListener(event, callback));
			if (!setupPage[key].skipParameterInURL) input.addEventListener("change", buildURL);
			div.appendChild(input);
		} else if (setupPage[key].type == "html") {
			var innerDiv = document.createElement("div");
			if (setupPage[key].html) innerDiv.innerHTML = setupPage[key].html;
			innerDiv.id = key;
			div.appendChild(innerDiv);
		} else if (setupPage[key].type == "button") {
			var button = document.createElement("button");
			if (setupPage[key].html) button.innerHTML = setupPage[key].html;
			button.id = key;
			div.appendChild(button);
		} else {
			var input = document.createElement("input");
			input.id = key;
			if (setupPage[key].type) {
				input.type = setupPage[key].type;
				if (setupPage[key].min !== undefined) input.setAttribute("min", setupPage[key].min);
				if (setupPage[key].max !== undefined) input.setAttribute("max", setupPage[key].max);
				if (setupPage[key].step !== undefined) input.setAttribute("step", setupPage[key].step);
			}
			if (defaultValue) {
				if (setupPage[key].type == "checkbox") {
					input.checked = (defaultValue=="true"?true:false);
				} else {
					input.value = defaultValue;
				}
			}
			if (setupPage[key].events) Object.entries(setupPage[key].events).forEach(([ event, callback ]) => input.addEventListener(event, callback));
			if (!setupPage[key].skipParameterInURL) input.addEventListener("change", buildURL);
			div.appendChild(input);
		}
	}

	function createSortOptions(setupItem, select, selectOptions, selectOrder, elementId) {
		var options = setupItem.options;
		if (typeof options == "function") options = options();
		for (var n=0; n<$_eseecode.instructions.categories.length; n++) {
			var category = $_eseecode.instructions.categories[n].name;
			for (var id in options) {
				// Only show instructions in the current category
				if (category != $_eseecode.instructions.set[id].category) {
					continue;
				}
				if (!id.match(/blank[0-9]*/)) {
					selectOptions[options[id].name] = true;
				}
				var instructionName = options[id].name;
				if (instructionName === "blank") {
					instructionName = "-----";
				}
				var instruction = options[id].name+";";
				for (var param in options[id].parameters) {
					var value = options[id].parameters[param].initial;
					value = encodeURIComponent($e_parsePredefinedConstants(value));
					instruction += "param:"+value+";";
				}
				for (var view in options[id].show) {
					var level = options[id].show[view];
					if (!selectOrder[level]) {
						selectOrder[level] = "";
					}
					selectOrder[level] += "<option ondblclick=\"changeParameters({target:this})\" value=\""+instruction+"\">"+instructionName+"</option>";
				}
			}
		}
		var selectOptionsKeys = [];
		for (var id in selectOptions) {
			selectOptionsKeys.push(id);
		}
		selectOptionsKeys.sort();
		var selectOptionsText = "";
		for (var id in selectOptionsKeys) {
			selectOptionsText += "<option ondblclick=\"selectOrderMove('right','"+elementId+"');buildURL()\" value=\""+selectOptionsKeys[id]+";\">"+selectOptionsKeys[id]+"</option>";
		}
		select.innerHTML = selectOptionsText;
	}

	function createCustomInstructionsUI(descr) {

		if (!descr) descr = "{}";

		var div = document.createElement("div");
		div.className = "custominstructions";

		var customInstructionsSetEl = document.createElement("textarea");
		customInstructionsSetEl.id = "custominstructions";
		customInstructionsSetEl.name = "custominstructions";
		customInstructionsSetEl.style.display = "none";
		customInstructionsSetEl.value = descr;
		div.appendChild(customInstructionsSetEl);

		var instructionsDiv = document.createElement("div");
		var instructionsSetDiv = document.createElement("div");
		instructionsDiv.appendChild(instructionsSetDiv);
		var instructionsNewDiv = document.createElement("div");
		var instructionsNewButton = document.createElement("button");
		instructionsNewButton.innerHTML = "+ Add instruction";
		instructionsNewButton.addEventListener("click", () => addOrUpdateCustomInstruction({}, instructionsSetDiv));
		instructionsNewDiv.appendChild(instructionsNewButton);
		instructionsDiv.appendChild(instructionsNewDiv);
		div.appendChild(instructionsDiv);

		return div;

	}
	
	function addOrUpdateCustomInstruction(instructionDescr, instructionsSetDiv) {

		if (instructionDescr && instructionDescr.id) {
			const row = document.querySelector("[data-id="+instructionDescr.id+"]");
			if (row) row.style.display = "none";
		}

		var instructionForm = document.createElement("form");
		instructionForm.className = "instructionWrapper";

		var instructionsIdEl = document.createElement("input");
		instructionsIdEl.id = "instructionId";
		instructionsIdEl.name = "id";
		instructionsIdEl.value = instructionDescr.id ? instructionDescr.id : "custom_" + Date.now() + "_" + Math.floor(Math.random() * 100000000);
		instructionsIdEl.style.display = "none";
		instructionForm.appendChild(instructionsIdEl);

		var instructionNameDiv = document.createElement("div");
		var instructionNameLabel = document.createElement("label");
		instructionNameLabel.innerHTML = "Name: ";
		instructionNameDiv.appendChild(instructionNameLabel);
		var instructionNameEl = document.createElement("input");
		instructionNameEl.id = "instructionName";
		instructionNameEl.name = "name";
		instructionNameEl.setAttribute("pattern", "[$a-zA-Z_][0-9a-zA-Z_$]*");
		instructionNameEl.value = instructionDescr.name ? instructionDescr.name : "";
		instructionNameEl.setAttribute("required", "required");
		instructionNameDiv.appendChild(instructionNameEl);
		instructionNameEl.addEventListener("keyup", updateCustomInstructionWrappers);
		instructionNameEl.addEventListener("change", updateCustomInstructionWrappers);
		instructionForm.appendChild(instructionNameDiv);

		var instructionCategoryDiv = document.createElement("div");
		var instructionCategoryLabel = document.createElement("label");
		instructionCategoryLabel.innerHTML = "Category: ";
		instructionCategoryDiv.appendChild(instructionCategoryLabel);
		var instructionCategorySelect = document.createElement("select");
		instructionCategorySelect.name = "category";
		instructionCategorySelect.setAttribute("required", "required");
		[ "", "guide", "canvas", "value", "draw", "window", "objects", "other" ].forEach(c => {
			var instructionCategoryOptionEl = document.createElement("option");
			instructionCategoryOptionEl.innerHTML = c;
			instructionCategoryOptionEl.value = c;
			instructionCategorySelect.appendChild(instructionCategoryOptionEl);
		});
		instructionCategoryDiv.appendChild(instructionCategorySelect);
		instructionForm.appendChild(instructionCategoryDiv);

		var instructionTypeDiv = document.createElement("div");
		var instructionTypeLabel = document.createElement("label");
		instructionTypeLabel.innerHTML = "Type: ";
		instructionTypeDiv.appendChild(instructionTypeLabel);
		var instructionTypeSelect = document.createElement("select");
		instructionTypeSelect.name = "type";
		[ "text", "number", "bool", "layer", "object", "window" ].forEach(c => {
			var instructionTypeOptionEl = document.createElement("option");
			instructionTypeOptionEl.innerHTML = c;
			instructionTypeOptionEl.value = c;
			instructionTypeSelect.appendChild(instructionTypeOptionEl);
		});
		instructionTypeDiv.appendChild(instructionTypeSelect);
		instructionForm.appendChild(instructionTypeDiv);

		var instructionLevelDiv = document.createElement("div");
		var instructionLevelLabel = document.createElement("label");
		instructionLevelLabel.innerHTML = "Show in: ";
		instructionLevelDiv.appendChild(instructionLevelLabel);
		var instructionLevelSelect = document.createElement("select");
		instructionLevelSelect.name = "show";
		instructionLevelSelect.setAttribute("multiple", "multiple");
		[ "level1", "level2", "level3", "level4" ].forEach(c => {
			var instructionLevelOptionEl = document.createElement("option");
			instructionLevelOptionEl.innerHTML = c;
			instructionLevelOptionEl.value = c;
			instructionLevelOptionEl.setAttribute("selected", "selected");
			instructionLevelSelect.appendChild(instructionLevelOptionEl);
		});
		instructionLevelDiv.appendChild(instructionLevelSelect);
		instructionForm.appendChild(instructionLevelDiv);

		var instructionIconDiv = document.createElement("div");
		var instructionIconLabel = document.createElement("label");
		instructionIconLabel.innerHTML = "Icon: ";
		instructionIconDiv.appendChild(instructionIconLabel);
		var instructionIconEl = document.createElement("input");
		instructionIconEl.id = "instructionIcon";
		instructionIconEl.name = "icon";
		instructionIconEl.setAttribute("placeholder", "URL or image name");
		instructionIconDiv.appendChild(instructionIconEl);
		instructionForm.appendChild(instructionIconDiv);

		var instructionTipDiv = document.createElement("div");
		var instructionTipLabel = document.createElement("label");
		instructionTipLabel.innerHTML = "Description: ";
		instructionTipDiv.appendChild(instructionTipLabel);
		var instructionTipEl = document.createElement("input");
		instructionTipEl.name = "tip";
		instructionTipDiv.appendChild(instructionTipEl);
		
		var instructionParamsDiv = document.createElement("div");
		instructionForm.appendChild(instructionParamsDiv);

		var instructionParamsNewDiv = document.createElement("div");
		var instructionParamsNewEl = document.createElement("button");
		instructionParamsNewEl.innerHTML = "+ Add parameter";
		instructionParamsNewEl.addEventListener("click", e => addOrUpdateCustomInstructionParam({}, instructionParamsDiv, e));
		instructionParamsNewDiv.appendChild(instructionParamsNewEl);
		instructionForm.appendChild(instructionParamsNewDiv);

		var instructionCodeDiv = document.createElement("div");
		instructionCodeDiv.className = "instructionCodeDiv";
		instructionCodeDiv.style.display = "none";
		var instructionCodeLabel = document.createElement("label");
		instructionCodeLabel.innerHTML = "Implement the instruction: ";
		instructionCodeDiv.appendChild(instructionCodeLabel);
		var instructionCodeFirstLabel = document.createElement("div");
		instructionCodeFirstLabel.id = "instructionCodeFirstLabel";
		instructionCodeFirstLabel.innerHTML = "{";
		instructionCodeDiv.appendChild(instructionCodeFirstLabel);
		var instructionCodeEl = document.createElement("textarea");
		instructionCodeEl.name = "run";
		instructionCodeDiv.appendChild(instructionCodeEl);
		var instructionCodeLastLabel = document.createElement("div");
		instructionCodeLastLabel.innerHTML = "}";
		instructionCodeDiv.appendChild(instructionCodeLastLabel);
		instructionForm.appendChild(instructionCodeDiv);

		var instructionApplyDiv = document.createElement("div");
		var instructionApplyButton = document.createElement("input");
		instructionApplyButton.type = "submit";
		instructionApplyButton.value = "Apply";
		instructionApplyDiv.appendChild(instructionApplyButton);
		var instructionCancelButton = document.createElement("button");
		instructionCancelButton.innerHTML = "Cancel";
		instructionCancelButton.addEventListener("click", e => {
			if (instructionDescr && instructionDescr.id) {
				const row = document.querySelector("[data-id="+instructionDescr.id+"]");
				if (row) row.style.display = "block";
			}
			e.target.closest(".instructionWrapper").parentNode.removeChild(e.target.closest(".instructionWrapper"));
		});
		instructionApplyDiv.appendChild(instructionCancelButton);
		instructionForm.appendChild(instructionApplyDiv);

		instructionForm.addEventListener("submit", e => applyCustomInstruction(instructionForm, instructionsSetDiv, e));
		instructionsSetDiv.appendChild(instructionForm);

		updateCustomInstructionFields(instructionDescr, instructionForm);
		if (instructionDescr.parameters) instructionDescr.parameters.forEach(d => addOrUpdateCustomInstructionParam(d, instructionParamsDiv));
		updateCustomInstructionWrappers();

	}

	function getCustomInstructionFields(form, processParameters) {

		const descr = {};

		Object.values(form.querySelectorAll("input, select, textarea")).forEach(el => {

			if (!processParameters && el.closest(".paramWrapper")) return;

			let value;
			if (el.tagName == "SELECT") {
				if (el.getAttribute("multiple")) value = Array.from(el.selectedOptions).reduce((acc, o) => acc.concat(o.value), []);
				else value = el.value;
			} else if (el.type == "checkbox") {
				value = el.checked;
			} else {
				value = el.value;
			}

			const key = el.name;
			descr[key] = value;

		});

		return descr;

	}

	function updateCustomInstructionFields(instructionDescr, form) {

		Object.keys(instructionDescr).forEach(key => {

			if (!key) return;

			const value = instructionDescr[key];
			if (!value) return;

			const el = form.querySelector("[name=" + key + "]");
			if (!el) return;

			if (el.tagName == "SELECT") {
				Array.from(el.children).forEach(o => o.selected = value.includes(o.value));
			} else if (el.type == "checkbox") {
				el.checked = value;
			} else {
				el.value = value;
			}

		});

	}

	function applyCustomInstruction(form, instructionsSetDiv, e) {

		if (e) e.preventDefault();

		const instructionId = form.querySelector("#instructionId").value;
		const instructionName = form.querySelector("#instructionName").value;

		const customInstructionsSetEl = document.getElementById("custominstructions");
		const customInstructionsSet = JSON.parse(customInstructionsSetEl.value);
		customInstructionsSet[instructionId] = getCustomInstructionFields(form, false);
		customInstructionsSet[instructionId].parameters = Array.from(form.querySelectorAll(".paramWrapper")).reduce((acc, el) => acc.concat(getCustomInstructionFields(el, true)), []);
		customInstructionsSetEl.value = JSON.stringify(customInstructionsSet);

		var instructionDiv = document.createElement("div");
		instructionDiv.dataset.id = instructionId;
		instructionDiv.className = "instructionRowWrapper";
		var instructionSpan = document.createElement("span");
		instructionSpan.innerHTML = instructionName;
		instructionDiv.appendChild(instructionSpan);
		var instructionEditButton = document.createElement("button");
		instructionEditButton.innerHTML = "Edit";
		instructionEditButton.addEventListener("click", () => addOrUpdateCustomInstruction(JSON.parse(document.getElementById("custominstructions").value)[instructionId], instructionsSetDiv));
		instructionDiv.appendChild(instructionEditButton);
		var instructionRemoveButton = document.createElement("button");
		instructionRemoveButton.innerHTML = "Remove";
		instructionRemoveButton.addEventListener("click", e => e.target.closest(".instructionRowWrapper").parentNode.removeChild(e.target.closest(".instructionRowWrapper")));
		instructionDiv.appendChild(instructionRemoveButton);
		const previousInstructionDiv = document.querySelector("[data-id="+instructionId+"]");
		if (previousInstructionDiv) {
			previousInstructionDiv.parentNode.insertBefore(instructionDiv, previousInstructionDiv);
			previousInstructionDiv.parentNode.removeChild(previousInstructionDiv);
		} else {
			instructionsSetDiv.appendChild(instructionDiv);
		}
		form.parentNode.removeChild(form);

		updateInstructions();
		buildURL();

		return false;

	}

	function addOrUpdateCustomInstructionParam(instructionParamDescr, instructionParamsDiv, e) {

		if (e) e.preventDefault();

		var instructionParamDiv = document.createElement("div");
		instructionParamDiv.className = "paramWrapper";

		var instructionParamNameLabel = document.createElement("label");
		instructionParamNameLabel.innerHTML = "Name: ";
		instructionParamDiv.appendChild(instructionParamNameLabel);
		var instructionParamNameEl = document.createElement("input");
		instructionParamNameEl.name = "name";
		instructionParamNameEl.setAttribute("pattern", "[$a-zA-Z_][0-9a-zA-Z_$]*");
		instructionParamNameEl.className = "paramName";
		instructionParamNameEl.setAttribute("required", "required");
		instructionParamNameEl.addEventListener("keyup", updateCustomInstructionWrappers);
		instructionParamNameEl.addEventListener("change", updateCustomInstructionWrappers);
		instructionParamDiv.appendChild(instructionParamNameEl);

		var instructionParamTypeDiv = document.createElement("div");
		var instructionParamTypeLabel = document.createElement("label");
		instructionParamTypeLabel.innerHTML = "Type: ";
		instructionParamTypeDiv.appendChild(instructionParamTypeLabel);
		var instructionParamTypeSelect = document.createElement("select");
		instructionParamTypeSelect.name = "type";
		[ "text", "number", "bool", "layer", "object", "window" ].forEach(c => {
			var instructionParamTypeOptionEl = document.createElement("option");
			instructionParamTypeOptionEl.innerHTML = c;
			instructionParamTypeOptionEl.value = c;
			instructionParamTypeSelect.appendChild(instructionParamTypeOptionEl);
		});
		instructionParamTypeDiv.appendChild(instructionParamTypeSelect);
		instructionParamDiv.appendChild(instructionParamTypeDiv);

		var instructionParamTipDiv = document.createElement("div");
		var instructionParamTipLabel = document.createElement("label");
		instructionParamTipLabel.innerHTML = "Description: ";
		instructionParamTipDiv.appendChild(instructionParamTipLabel);
		var instructionParamTipEl = document.createElement("input");
		instructionParamTipEl.name = "tip";
		instructionParamTipDiv.appendChild(instructionParamTipEl);
		instructionParamDiv.appendChild(instructionParamTipDiv);

		var instructionParamOptionalDiv = document.createElement("div");
		var instructionParamOptionalLabel = document.createElement("label");
		instructionParamOptionalLabel.innerHTML = "Is optional: ";
		instructionParamOptionalDiv.appendChild(instructionParamOptionalLabel);
		var instructionParamOptionalEl = document.createElement("input");
		instructionParamOptionalEl.type = "checkbox";
		instructionParamOptionalEl.name = "optional";
		instructionParamOptionalDiv.appendChild(instructionParamOptionalEl);
		instructionParamDiv.appendChild(instructionParamOptionalDiv);

		var instructionParamInitialDiv = document.createElement("div");
		var instructionParamInitialLabel = document.createElement("label");
		instructionParamInitialLabel.innerHTML = "Default value: ";
		instructionParamInitialDiv.appendChild(instructionParamInitialLabel);
		var instructionParamInitialEl = document.createElement("input");
		instructionParamInitialEl.name = "initial";
		instructionParamInitialDiv.appendChild(instructionParamInitialEl);
		instructionParamDiv.appendChild(instructionParamInitialDiv);

		var instructionParamRemoveDiv = document.createElement("div");
		var instructionParamRemoveEl = document.createElement("button");
		instructionParamRemoveEl.innerHTML = "Remove parameter";
		instructionParamRemoveEl.addEventListener("click", e => { e.target.closest(".paramWrapper").parentNode.removeChild(e.target.closest(".paramWrapper")); updateCustomInstructionWrappers(); });
		instructionParamRemoveDiv.appendChild(instructionParamRemoveEl);
		instructionParamDiv.appendChild(instructionParamRemoveDiv);

		instructionParamsDiv.appendChild(instructionParamDiv);

		updateCustomInstructionFields(instructionParamDescr, instructionParamDiv);

		return false;

	}

	function updateCustomInstructionWrappers() {
		var readyName = !!document.getElementById("instructionName").value;
		Array.from(document.querySelectorAll(".instructionCodeDiv")).forEach(el => el.style.display = readyName ? "block" : "none");
		if (!readyName) return;
		var name = document.getElementById("instructionName").value;
		var params = Array.from(document.querySelectorAll(".paramName")).reduce((acc, el) => acc + (acc ? ", " : "") + el.value, "");

		document.getElementById("instructionCodeFirstLabel").innerHTML = "function "+name+"("+params+") {";
	}

	function updateInstructions() {
		let custominstructions = document.getElementById("custominstructions").value;
		try {
			custominstructions = JSON.parse(custominstructions);
		} catch(e) { console.error("Invalid custominstructions update JSON: " + custominstructions); }
		if (!custominstructions) {
			alert("Custom instructions' descriptions has invalid synthax");
			return;
		}
		$_eseecode.instructions.set = Object.assign({}, $_eseecode.instructions._set, custominstructions);
		let setupItem = setupItems["Instructions"]["instructions"];
		let elementId = "instructionsorigin";
		createSortOptions(setupItem, document.getElementById(elementId), {}, {}, elementId);
	}

	function goToNextStep() {
		var step = document.getElementById("stepNumber").getAttribute("value");
		step++;
		goToStep(step);
	}

	function goToPrevStep() {
		var step = document.getElementById("stepNumber").getAttribute("value");
		step--;
		goToStep(step);
	}

	function goToStep(step) {
		if (step === undefined || typeof step === "object") { //goToStep is also called as a listener, so make sure step is not a event
			step = document.getElementById("stepNumber").getAttribute("value");
		}
		step = parseInt(step);
		hideAll();
		document.getElementById("steps").scrollTop = 0;
		document.getElementById("step-"+step).style.display = "block";
		document.getElementById("stepNumber").setAttribute("value", step);
		if (step === 1) {
			document.getElementById("prev").setAttribute("disabled", "true");
		} else {
			document.getElementById("prev").removeAttribute("disabled");
		}
		if (!document.getElementById("step-"+(step+1))) {
			document.getElementById("next").setAttribute("disabled", "true");
		} else {
			document.getElementById("next").removeAttribute("disabled");
		}
		document.getElementById("jump").value = step;
	}

	function hideAll(step) {
		for (var i=1,element=null; element = document.getElementById("step-"+i); i++) {
			element.style.display = "none";
		}
	}

	function showAll() {
		for (var i=1,element=null; element = document.getElementById("step-"+i); i++) {
			element.style.display = "block";
		}
	}

	function jump() {
		var step = document.getElementById("jump").value;
		goToStep(step);
	}

	function switchMode() {
		var button = document.getElementById("switchMode");
		var switchTo = button.getAttribute("data-switchTo");
		if (switchTo === "full") {
			showAll();
			document.getElementById("controls-navigator").style.display = "none";
			button.setAttribute("value", "Wizard view");
			button.setAttribute("data-switchTo", "wizard");
		} else {
			goToStep();
			document.getElementById("controls-navigator").style.display = "block";
			button.setAttribute("value", "Full view");
			button.setAttribute("data-switchTo", "full");
		}
	}
	
	function buildURL(event) {
		var url = mainURL;
		var components = [];
		var paramsText = "";
		Object.entries(setupItems).forEach(([page, setupPage]) => {
			Object.entries(setupPage).forEach(([key, setupPageItem]) => {
				if (setupPageItem.type == "html") {
					return;
				}
				var paramValue = "";
				var element = document.getElementById(key);
				if (setupPageItem.type == "checkbox") {
					paramValue = element.checked === true;
				} else if (setupPageItem.type == "order" || setupPageItem.type == "instructions") {
					paramValue = "";
					let options = element.options;
					if (typeof options == "function") options = options();
					for (var optionId in options) {
						if (optionId.match(/^[0-9]+$/)) { // IE add some options so skip them
							var option = options[optionId];
							if (option.value) {
								paramValue += option.value;
							}
						}
					}
					if (paramValue) {
						paramValue = paramValue.substring(0,paramValue.length-1); // Remove last ";"
					}
				} else if (setupPageItem.type == "multiple") {
					paramValue = "";
					let options = element.options;
					if (typeof options == "function") options = options();
					for (var optionId in options) {
						if (optionId.match(/^[0-9]+$/)) { // IE add some options so skip them
							var option = options[optionId];
							if (option.selected) {
								paramValue += option.value+";";
							}	
						}
					}
					if (paramValue) {
						paramValue = paramValue.substring(0,paramValue.length-1); // Remove last ";"
					}
				} else {
					paramValue = element.value;
				}
				if ((setupPageItem.type !== "order" || setupPageItem.type !== "instructions") && setupPageItem.type !== "multiple" && setupPageItem.type !== "select") {
					paramValue = encodeURIComponent(paramValue);
				}
				if (!setupPageItem.skipParameterInURL && paramValue != setupPageItem.initial && paramValue.toString().length > 0) {
					var component = key+"="+paramValue;
					components.push(component);
					var skipParameterInURL = false;
					for (var j in parametersCalledFromAPI) {
                        if (component.indexOf(parametersCalledFromAPI[j]+"=") == 0) {
                            skipParameterInURL = true;
                        }
					}
					if (!skipParameterInURL) {
						paramsText += "&"+component;
					}
				}
			});
		});
		if (paramsText.length > 0) {
			paramsText = paramsText.substring(1); // Remove the first "&" from the URL
			url += "?"+paramsText;
		}
		handle(url, components);
	}

	function selectOrderMove(sens, id) {
		var sourceSel, targetSel; 
		if (sens == "right") {
			sourceSel = document.getElementById(id+"origin"); 
			targetSel = document.getElementById(id);
		} else {
			sourceSel = document.getElementById(id); 
			targetSel = document.getElementById(id+"origin");
		}
		if (sens == "up") {
			for (var i = 0; i<sourceSel.options.length; i++) {
				if (sourceSel.options[i].selected) {
					var moveOption = sourceSel.options[i];
					var above = moveOption.previousSibling;
					sourceSel.removeChild(moveOption);
					if (above) {
						sourceSel.insertBefore(moveOption, above);
					} else {
						sourceSel.insertBefore(moveOption, sourceSel.firstChild);
					}
				}
			}
		} else {
			for (var i = sourceSel.options.length-1; i>=0; i--) {
				if (sourceSel.options[i].selected) { 
					if (sens == "right") {
						var option = document.createElement("option");
						option.innerHTML = sourceSel.options[i].innerHTML;
						option.value = sourceSel.options[i].value;
						targetSel.appendChild(option);
						option.addEventListener("dblclick",changeParameters);
					} else if (sens == "left") {
						sourceSel.removeChild(sourceSel.options[i]);
					} else if (sens == "down") {
						var moveOption = sourceSel.options[i];
						var under = moveOption.nextSibling;
						if (under) {
							under = under.nextSibling;
						}
						sourceSel.removeChild(moveOption);
						if (under) {
							sourceSel.insertBefore(moveOption, under);
						} else {
							sourceSel.appendChild(moveOption);
						}
					}
				}
			}
		}
	}

	function changeParameters(event) {
		var target = undefined;
		if (event.target.getAttribute("data-elementId")) {
			// Calling from button
			var select = document.getElementById(event.target.getAttribute("data-elementId"));
			for (var i = select.options.length-1; i>=0; i--) {
				if (select.options[i].selected) {
					target = select.options[i];
				} 
			}
		} else {
			// Calling from select option
			target = event.target;
		}
		if (!target) {
			return;
		}
		var instructionName = target.innerHTML;
		if (instructionName == "-----") return;
		var setupDiv = document.createElement("div");
		setupDiv.innerHTML = "<div id=\"setupDivTitle\">Setup for '"+instructionName+"':</div>" +
			"<input id=\"setupDivIndex\" type=\"hidden\" />" +
			"<input id=\"setupDivName\" type=\"hidden\" />" +
			"<div id=\"setupDivParams\"></div>" +
			"Max amount of instances: <input id=\"setupDivCount\" type=\"number\" min=\"0\" /><br />" +
			"Show parameters in Drag mode blocks: <input id=\"setupDivShowParams\" type=\"checkbox\" /><br />" +
			"Disable setup: <input id=\"setupDivNoChange\" type=\"checkbox\" /><br />" +
			"<input type=\"button\" value=\"Apply\" onclick=\"changeParametersApply('instructions')\" />";
		setupDiv.id = "setupDiv";
		var instructionParameters = $_eseecode.instructions.set[instructionName].parameters;
		for (var i=0; i<instructionParameters.length; i++) {
			var initialHelper = ((!instructionParameters[i].optional || instructionParameters[i].optional === false) && instructionParameters[i].initial)?" Default: "+instructionParameters[i].initial:"";
			setupDiv.querySelector("#setupDivParams").innerHTML += $e_ordinal(i+1)+" parameter '"+instructionParameters[i].name +"' ("+instructionParameters[i].type+"): <input id=\"setupDivParam"+(i+1)+"\" />"+initialHelper+"<br />";
		}
		var countParams = 1;
		var values = target.value.split(";");
		for (var i=0; i<values.length; i++) {
			var value = values[i];
			if (i == 0) {
				setupDiv.querySelector("#setupDivName").value = values[i];
			} else if (value == "showParams") {
				setupDiv.querySelector("#setupDivShowParams").checked = true;
			} else if (value == "noChange") {
				setupDiv.querySelector("#setupDivNoChange").checked = true;
			} else if (value.match(/^count:/)) {
				setupDiv.querySelector("#setupDivCount").value = value.split(":")[1];
			} else if (value.match(/^param:/)) {
				setupDiv.querySelector("#setupDivParam"+countParams).value = decodeURIComponent(value.split(":")[1]);
				countParams++;
			} else if (setupDiv.querySelector("#setupDivParam"+countParams)) {
				setupDiv.querySelector("#setupDivParam"+countParams).value = decodeURIComponent(value);
				countParams++;
			}
		}
		var optionIndex = target.index;
		setupDiv.querySelector("#setupDivIndex").value = optionIndex;
		dialog(setupDiv);
	}

	function changeParametersApply(selectId) {
		var setupDiv = document.getElementById("setupDiv");
		var select = document.getElementById(selectId);
		var optionIndex = document.getElementById("setupDivIndex").value;
		var option = select.options[optionIndex];
		var name = option.innerHTML;
		var optionText = "";
		var inputs = setupDiv.getElementsByTagName("input");
		var foundNonUndefined = false;
		for (var i = inputs.length-1; i>=0; i--) {
			var input = inputs[i];
			if (input.type == "hidden") {
				continue;
			} else if (input.type == "number") {
				if (input.value) {
					optionText += "count:"+input.value+";";
				}
			} else if (input.type == "checkbox"){
				if (input.checked) {
					optionText += input.id == "setupDivNoChange" ? "noChange;" : "showParams;";
				}
			} else if (input.type == "button") {
				continue;
			} else {
				if (!input.value && !foundNonUndefined) {
					continue;
				}
				optionText = "param:"+encodeURIComponent(input.value)+";"+optionText; // Prefix
				foundNonUndefined = true;
			}
		}
		var optionText = name+";"+optionText;
		select.options[optionIndex].innerHTML = name;
		select.options[optionIndex].value = optionText;
		changeParametersClose();
		buildURL();
		setupDiv.parentNode.close();
	}
	
	function changeParametersClose() {
		document.getElementById("instructionsbody").style.display = "";
		var setupDiv = document.getElementById("setupDiv").style.display = "none";
	}
