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
	var mainURL;
	var setupItems = [
			{
				id: "Application settings",
				items: [
					{ id: "lang", title: "Language", type: "select", options: $_eseecode.ui.translations, sort: true, initial: "default", help: "Set the language you want for eSeeCode's user interface." },
					{ id: "translations", title: "Display translations menu?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the translations should be visible or hidden." },
					{ id: "theme", title: "Theme", type: "select", options: $_eseecode.ui.themes, initial: "default", sort: true, help: "Set the theme you want for eSeeCode's user interface." },
					{ id: "themes", title: "Display themes menu?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the themes should be visible or hidden." },
					{ id: "filemenu", title: "Display file menu?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the buttons \"Load\" and \"Save\" should be visible or hidden." },
					{ id: "fullscreenmenu", title: "Display fullscreen button?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the fullscreen button should be visible or hidden." },
					{ id: "preventexit", title: "Warn on exit if used has entered code?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether or not eSeeCode should require confirmation before being closed (or before changing the webpage)." }
				]
			},
			{
				id: "Programming environment",
				items: [
					{ id: "view", title: "Initial view", type: "select", options: ["Touch", "Drag", "Build", "Code"], initial: "Touch", help: "Select the view which will be displayed initially." },
					{ id: "viewtabs", title: "View tabs to display", type: "multiple", options: ["Touch", "Drag", "Build", "Code"], initial: "Touch;Drag;Build;Code", help: "Select which views will be available." },
					{ id: "blocksetup", title: "Block setup", type: "select", options: ["Visual", "Text"], initial: "Text", help: "Select how to view the setup of blocks. In Drag view blocks are always setup in visually by default, but in Build view you can decide whether to display the text setup by default or the visual interface by default." },
					{ id: "maximize", title: "Display code console maximized?", type: "select", options: ["Yes", "No"], initial: "No", help: "Decide whether the code console should be maximized initially." },
					{ id: "timeout", title: "How long before the execution of a program is stopped?", type: "number", initial: "10", help: "Set the amount of seconds programs are aloud to run before stopping them." }
				]
			},
			{
				id: "Whiteboard",
				items: [
					{ id: "guide", title: "Display guide?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the guide (the cursor in the whiteboard) will be visible or hidden." },
					{ id: "grid", title: "Display grid?", type: "select", options: ["Yes", "No"], initial: "Yes", help: "Decide whether the grid (the lines in the whiteboard) will be visible or hidden." },
					{ id: "griddivisions", title: "Amount of grid lines?", type: "number", initial: "15", help: "Set the amount of lines in the grid." },
					{ id: "axis", title: "Axis", type: "select", options: ["Computer console", "Mathematical simple", "Mathematical centered"], initial: "Mathematical centered", help: "Select which coordinates you want:<br /><ul><li>Computer console: Origin is at upper left corner, increments right and downwards</li><li>Mathematical simple: Origin is at lower left corner, increments right and upwards</li><li>Mathematical centered: Origin is centered, increments right and upwards</li></ul>" }
				]
			},
			{
				id: "Instructions",
				items: [
					{ id: "instructions", title: "Instructions to show (leave blank to use default)", type: "order", options: $_eseecode.instructions.set, initial: "", help: "Here you can choose a subset of intructions to be available to the user (all others will be disabled).<ul style=\"text-align:justify;\"></li><li>Move them from the left to the right column by selecting an intruction in the left column and clicking the \">\" button. You can add an instruction several times.</li><li>Double-click any instruction in the right column to set up its parameters, the amount of times the instruction can be used and whether or not the user can set up its parameters. Remember to click \"Apply\" to apply after you finish setting up every instruction.</li><li>Move up and down any instruction in the right column by selecting it and clicking the \"^\" or \"v\" buttons.</li><li>You can remove an instruction from the right column by selecting it and clicking the \"&lt;\"button.</li><li>Click the \"-----\" button to add a separator to the instructions in the right column. The separator will be added at the end, remember to move it up with the \"^\" button.</li></ul>" }
				]
			},
			{
				id: "Precode",
				items: [
					{ id: "precode", title: "Code to preload (hidden to the user)", type: "textarea", initial: "", help: "The code you write here will be hidden to the user but will be run immediately after loading eSeeCode and everytime before the user code." }
				]
			},
			{
				id: "User code",
				items: [
					{ id: "code", title: "Code to load (displayed to the user)", type: "textarea", initial: "", help: "The code you write here will be shown as part of the solution, so the user can view it and modify it." },
					{ id: "execute", title: "Execute the code", type: "checkbox", initial: "false", help: "Decide whether or not to run the user code immediately after loading eSeeCode." }
				]
			},
			{
				id: "Postcode",
				items: [
					{ id: "postcode", title: "Code to postload (hidden to the user)", type: "textarea", initial: "", help: "The code you write here will be hidden to the user but will be run everytime after the user code." }
				]
			},
			{
				id: "Input",
				items: [
					{ id: "input", title: "Input", type: "textarea", initial: "", help: "Set the input that will appear in the I/O dialog." }
				]
			},
			{
				id: "Done!",
				items: [
					{ id: "conclusion", title: "Your exercise is set up", type: "html" }
				]
			}
		];
	var parametersCalledFromAPI;

	function createExerciseTool(divId, createExerciseHandle, src, skipURL) {
		handle = createExerciseHandle;
		if (!handle) {
			// default handle is to display url in alert
			handle = alert;
		}
		mainURL = src;
		if (!mainURL) {
			// default handle is to display url in alert
			mainURL = "https://play.eseecode.com";
		}
		parametersCalledFromAPI = skipURL;
		var assistant = document.getElementById(divId);
	
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
		for (var page=0; page<setupItems.length; page++) {
			var setupPage = setupItems[page].items;
			var div = document.createElement("div");
			div.id = "step-"+stepNumber;
			div.class = "step";
			var divTitle = document.createElement("div");
			divTitle.className = "pageTitle";
			divTitle.innerHTML = setupItems[page].id;
			div.appendChild(divTitle);
			for (var key=0; key<setupPage.length; key++) {
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
				var title = document.createElement("span");
				title.innerHTML = setupPage[key].title;
				if (setupPage[key].title.substring(setupPage[key].title.length-1) != "?") {
					title.innerHTML += ":";
				}
				title.innerHTML += " ";
				div.appendChild(title);
				var defaultValue = (setupPage[key].userValue?setupPage[key].userValue:setupPage[key].initial);
				if (setupPage[key].type == "select") {
					var select = document.createElement("select");
					select.id = setupPage[key].id;
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
					select.addEventListener("change", buildURL);
					div.appendChild(select);
				} else if (setupPage[key].type == "multiple") {
					var br = document.createElement("br");
					div.appendChild(br);
					var select = document.createElement("select");
					select.id = setupPage[key].id;
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
					select.addEventListener("change", buildURL);
					div.appendChild(select);
				} else if (setupPage[key].type == "order") {
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
					var defaultsSpan = document.createElement("span");
					defaultsSpan.innerHTML = "(Double-click on the right pane to configure the instructions)";
					div.appendChild(defaultsSpan);
					var br = document.createElement("br");
					div.appendChild(br);
					var innerDiv = document.createElement("div");
					innerDiv.id = "instructionsbody";
					var elementId = setupPage[key].id;
					var select = document.createElement("select");
					select.id = elementId+"origin";
					select.style.height = "150px";
					select.style.float = "left";
					select.setAttribute("multiple", true);
					innerDiv.appendChild(select);
					var buttonsDiv = document.createElement("div");
					buttonsDiv.id = "instructionsbuttons";
					buttonsDiv.style.height = "150px";
					buttonsDiv.style.float = "left";
					var rightButton = document.createElement("input");
					rightButton.type = "button";
					rightButton.value = ">";
					rightButton.addEventListener("click",function() {selectOrderMove("right",elementId);buildURL();});
					buttonsDiv.appendChild(rightButton);
					var leftButton = document.createElement("input");
					leftButton.type = "button";
					leftButton.value = "<";
					leftButton.addEventListener("click",function() {selectOrderMove("left",elementId);buildURL();});
					buttonsDiv.appendChild(leftButton);
					innerDiv.appendChild(buttonsDiv);
					br = document.createElement("br");
					buttonsDiv.appendChild(br);
					var upButton = document.createElement("input");
					upButton.type = "button";
					upButton.style.marginBottom = "0px";
					upButton.value = "^";
					upButton.addEventListener("click",function() {selectOrderMove("up",elementId);buildURL();});
					buttonsDiv.appendChild(upButton);
					br = document.createElement("br");
					buttonsDiv.appendChild(br);
					var downButton = document.createElement("input");
					downButton.type = "button";
					downButton.style.marginTop = "0px";
					downButton.value = "v";
					downButton.addEventListener("click",function() {selectOrderMove("down",elementId);buildURL();});
					buttonsDiv.appendChild(downButton);
					br = document.createElement("br");
					buttonsDiv.appendChild(br);
					var blankButton = document.createElement("input");
					blankButton.type = "button";
					blankButton.style.marginBottom = "1px";
					blankButton.value = "-----";
					blankButton.addEventListener("click",function() {var option = document.createElement("option");option.value="blank;";option.innerHTML="-----";document.getElementById(elementId).appendChild(option);buildURL();});
					buttonsDiv.appendChild(blankButton);
					br = document.createElement("br");
					buttonsDiv.appendChild(br);
					var setupButton = document.createElement("input");
					setupButton.type = "button";
					setupButton.style.marginTop = "1px";
					setupButton.value = "Set up";
					setupButton.setAttribute("data-elementId", elementId);
					setupButton.addEventListener("click", changeParameters);
					buttonsDiv.appendChild(setupButton);
					innerDiv.appendChild(buttonsDiv);
					var select2 = document.createElement("select");
					select2.id = elementId;
					select2.style.float = "left";
					select2.style.height = "150px";
					select2.style.minWidth = "100px";
					select2.setAttribute("multiple", true);
					innerDiv.appendChild(select2);
					var selectOrder = {};
					var selectOptions = {};
					// Read default values
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
							  defaultValue[j+1+k] == "noChange" ||
							  defaultValue[j+1+k].indexOf("param:") == 0 ||
							  defaultValue[j+1+k].indexOf("count:") == 0)) {
			                    if (defaultValue[j+1+k] == "noChange") {
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
									console.warn("Error while loading instructions from URL: There is no "+$e_ordinal(k+1)+" parameter for instruction "+defaultValue[j]+". You tried to set it to: "+defaultValue[j+1+k])
						        }
						        k++;
							}
							j += k;
							if (!selectOrder["lastSave"]) {
								selectOrder["lastSave"] = "";
							}
							selectOrder["lastSave"] += "<option ondblclick=\"changeParameters({target:this})\" value=\""+defaultInstruction+"\">"+instructionName+"</option>";
						} else {
							console.warn("Error while loading instructions from URL: Instruction "+instructionName+" doesn't exist")
						}
					}
					// Create options
					var options = setupPage[key].options;
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
					defaultsButton1.addEventListener("click",function() {select2.innerHTML = selectOrder["level1"];changeParametersClose();buildURL();});
					defaultsButton2.addEventListener("click",function() {select2.innerHTML = selectOrder["level2"];changeParametersClose();buildURL();});
					defaultsButton3.addEventListener("click",function() {select2.innerHTML = selectOrder["level3"];changeParametersClose();buildURL();});
					defaultsButton4.addEventListener("click",function() {select2.innerHTML = selectOrder["level4"];changeParametersClose();buildURL();});
					if (selectOrder["lastSave"]) {
						select2.innerHTML = selectOrder["lastSave"];
						defaultsButton5.addEventListener("click",function() {select2.innerHTML = selectOrder["lastSave"];changeParametersClose();buildURL();});
						defaultsButton5.style.display = "inline-block";
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
					div.appendChild(innerDiv);
					var setupDiv = document.createElement("div");
					setupDiv.id = "setupDiv";
					setupDiv.style.display = "none";
					setupDiv.innerHTML = "<div id=\"setupDivTitle\"></div>";
					setupDiv.innerHTML += "<input id=\"setupDivIndex\" type=\"hidden\" />"
					setupDiv.innerHTML += "<input id=\"setupDivName\" type=\"hidden\" />"
					setupDiv.innerHTML += "<div id=\"setupDivParams\"></div>";
					setupDiv.innerHTML += "Max amount of instances: <input id=\"setupDivCount\" type=\"number\" min=\"0\" /><br />";
					setupDiv.innerHTML += "Disable setup: <input id=\"setupDivNoChange\" type=\"checkbox\" /><br />";
					setupDiv.innerHTML += "<input type=\"button\" value=\"Apply\" onclick=\"changeParametersApply('"+elementId+"')\" />";
					setupDiv.innerHTML += "<input type=\"button\" value=\"Cancel\" onclick=\"changeParametersClose()\" />";
					div.appendChild(setupDiv);
				} else if (setupPage[key].type == "textarea") {
					var br = document.createElement("br");
					div.appendChild(br);
					var input = document.createElement("textarea");
					input.id = setupPage[key].id;
					if (defaultValue) {
						input.innerHTML = defaultValue;
					}
					input.addEventListener("change", buildURL);
					div.appendChild(input);
				} else if (setupPage[key].type == "html") {
					var innerDiv = document.createElement("div");
					innerDiv.id = setupPage[key].id;
					div.appendChild(innerDiv);
				} else {
					var input = document.createElement("input");
					input.id = setupPage[key].id;
					if (setupPage[key].type) {
						input.type = setupPage[key].type;
						if (setupPage[key].type == "number") {
							input.style.width = "50px";
						}
					}
					if (defaultValue) {
						if (setupPage[key].type == "checkbox") {
							input.checked = (defaultValue=="true"?true:false);
						} else {
							input.value = defaultValue;
						}
					}
					input.addEventListener("change", buildURL);
					div.appendChild(input);
				}
			}
			div.style.clear = "left";
			divSteps.appendChild(div);
			stepNumber++;
		}
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
			options += "<option value=\""+stepNumber+"\">"+stepNumber+"/"+setupItems.length+": "+setupItems[page].id+"</option>"; 
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
		goToStep();
		buildURL();
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
		for (var page in setupItems) {
			var setupPage = setupItems[page].items;
			for (var i in setupPage) {
				if (setupPage[i].type == "html") {
					continue;
				}
				var paramValue = "";
				var element = document.getElementById(setupPage[i].id);
				if (setupPage[i].type == "checkbox") {
					if (element.checked === true) {
						paramValue = element.checked;
					}
				} else if (setupPage[i].type == "order") {
					paramValue = "";
					for (var optionId in element.options) {
						if (optionId.match(/^[0-9]+$/)) { // IE add some options so skip them
							var option = element.options[optionId];
							if (option.value) {
								paramValue += option.value;
							}
						}
					}
					if (paramValue) {
						paramValue = paramValue.substring(0,paramValue.length-1); // Remove last ";"
					}
				} else if (setupPage[i].type == "multiple") {
					paramValue = "";
					for (var optionId in element.options) {
						if (optionId.match(/^[0-9]+$/)) { // IE add some options so skip them
							var option = element.options[optionId];
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
				if (setupPage[i].type !== "order" && setupPage[i].type !== "multiple" && setupPage[i].type !== "select") {
					paramValue = encodeURIComponent(paramValue);
				}
				if (paramValue != setupPage[i].initial && paramValue.toString().length > 0) {
					var component = setupPage[i].id+"="+paramValue;
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
			}
		}
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
		document.getElementById("setupDivNoChange").checked = false;
		document.getElementById("setupDivCount").value = "";
		document.getElementById("setupDivTitle").innerHTML = "Setup for '"+instructionName+"':";
		document.getElementById("setupDivParams").innerHTML = "";
		var instructionParameters = $_eseecode.instructions.set[instructionName].parameters;
		for (var i=0; i<instructionParameters.length; i++) {
			var initialHelper = ((!instructionParameters[i].optional || instructionParameters[i].optional === false) && instructionParameters[i].initial)?" Default: "+instructionParameters[i].initial:"";
			document.getElementById("setupDivParams").innerHTML += $e_ordinal(i+1)+" parameter '"+instructionParameters[i].name +"' ("+instructionParameters[i].type+"): <input id=\"setupDivParam"+(i+1)+"\" />"+initialHelper+"<br />";
		}
		var countParams = 1;
		var values = target.value.split(";");
		for (var i=0; i<values.length; i++) {
			var value = values[i];
			if (i == 0) {
				document.getElementById("setupDivName").value = values[i];
			} else if (value == "noChange") {
				document.getElementById("setupDivNoChange").checked = true;
			} else if (value.match(/^count:/)) {
				document.getElementById("setupDivCount").value = value.split(":")[1];
			} else if (value.match(/^param:/)) {
				document.getElementById("setupDivParam"+countParams).value = decodeURIComponent(value.split(":")[1]);
				countParams++;
			} else if (document.getElementById("setupDivParam"+countParams)) {
				document.getElementById("setupDivParam"+countParams).value = decodeURIComponent(value);
				countParams++;
			}
		}
		var optionIndex = target.index;
		document.getElementById("setupDivIndex").value = optionIndex;
		document.getElementById("instructionsbody").style.display = "none";
		document.getElementById("setupDiv").style.display = "block";
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
					optionText += "noChange;";
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
	}
	
	function changeParametersClose() {
		var setupDiv = document.getElementById("setupDiv");
		document.getElementById("instructionsbody").style.display = "block";
		setupDiv.style.display = "none";
	}
