"use strict";

/**
 * Asks the user to setup the parameters of the instruction associated with the block
 * @private
 * @param {!HTMLElement} blockEl Block element
 * @param {Boolean} [isBlockAdd=false] Whether the block is being added or modified
 * @return {Boolean} True if the setup dialog was successful, false otherwise
 * @example $e.ui.blocks.setup.open($e.ui.element.querySelector("#block-123123123"))
 */
$e.ui.blocks.setup.open = (blockEl, isBlockAdd = false) => {

	const instructionSetId = blockEl.dataset.instructionSetId;
	const instruction = $e.instructions.set[instructionSetId];
	const parentBlock = blockEl.parentNode;
	const { containerDefinitions, containerSubblockDefinition } = $e.ide.blocks.getContainerSubblockDefinition(blockEl, parentBlock, true);
	const isSubblock = !!containerSubblockDefinition;
	if (instruction.noChange || (!instruction.parameters && (!containerSubblockDefinition || !containerSubblockDefinition.optional))) return false;
	if (instruction.parameters && instruction.parameters.length === 0) return isBlockAdd;

	$e.ui.disableKeyboardShortcuts = true;
	const msgEl = document.createElement("div");
	const setupData = $e.ui.blocks.setup.current = {
		element: undefined,
		isAdd: isBlockAdd,
		blockEl: blockEl,
		parameters: [],
		element: msgEl,
	};

	msgEl.classList.add("content");
	const msgTab = document.createElement("div");
	msgTab.classList.add("tabs");
	const tabVisualEl = document.createElement("button");
	tabVisualEl.type = "button"; // By default BUTTON in FORM is type=submit, so when pressing enter this button would be triggered
	tabVisualEl.classList.add("tab", "style");
	tabVisualEl.addEventListener("click", $e.ui.blocks.setup.toggleStyleFromUI);
	tabVisualEl.title = _("Switch between visual and text setup");
	msgTab.appendChild(tabVisualEl);
	if (!isBlockAdd) {
		if (isSubblock) {
			containerDefinitions.forEach((subblockDefinition, i) => {
				if (!subblockDefinition.multiple && (!subblockDefinition.optional || Array.from(parentBlock.children).filter(subblockEl => subblockEl.dataset.instructionSetId == subblockDefinition.instruction).length > 0)) return;
				const buttonEl = document.createElement("button");
				buttonEl.type = "button"; // By default BUTTON in FORM is type=submit, so when pressing enter this button would be triggered
				buttonEl.classList.add("tab", "setupBlockSubblockAction");
				const containerDefinitionsSubblockIndex = i;
				buttonEl.addEventListener("click", () => {
					if ($e.ui.blocks.setup.changes().length > 0) {
						if (!confirm(_("The changes you have set up will be discarted. Do you wish to proceed?"))) return;
					}
					let subblockNextSibling = null;
					for (let i = containerDefinitionsSubblockIndex + 1; i < containerDefinitions.length && !subblockNextSibling; i++) {
						const containerSubblockDefinition = containerDefinitions[i];
						subblockNextSibling = Array.from(parentBlock.children).find(subblockEl => containerSubblockDefinition.instruction == subblockEl.dataset.instructionSetId);
					}
					$e.ui.blocks.addIntoCodeFromUI(subblockDefinition.instruction, parentBlock, subblockNextSibling);
					$e.ui.blocks.setup.cancel();
				});
				const subinstruction = $e.instructions.set[subblockDefinition.instruction];
				buttonEl.title = _("Add new '%s' to the block", "'" + subblockDefinition.instruction + "'");
				buttonEl.textContent = subinstruction.nameRewrite && subinstruction.nameRewrite.name ? subinstruction.nameRewrite.name : subinstruction.name;
				msgTab.appendChild(buttonEl);
			});
		}
		if (!containerSubblockDefinition || containerSubblockDefinition.multiple) {
			const buttonEl = document.createElement("button");
			buttonEl.type = "button"; // By default BUTTON in FORM is type=submit, so when pressing enter this button would be triggered
			buttonEl.classList.add("tab", "duplicateBlock");
			buttonEl.addEventListener("click", () => {
				if ($e.ui.blocks.setup.changes().length > 0) {
					if (!confirm(_("The changes you have set up will be discarted. Do you wish to proceed?"))) return;
				}
				$e.ui.blocks.duplicateInCodeFromUI(blockEl);
				$e.ui.blocks.setup.cancel();
			});
			buttonEl.title = !isSubblock ? _("Duplicate this block") : _("Duplicate this %s block", "'" + instruction.name + "'");
			msgTab.appendChild(buttonEl);
		}
		if (isSubblock) {
			const buttonEl = document.createElement("button");
			buttonEl.type = "button"; // By default BUTTON in FORM is type=submit, so when pressing enter this button would be triggered
			buttonEl.classList.add("tab", "duplicateContainer");
			buttonEl.addEventListener("click", () => {
				if ($e.ui.blocks.setup.changes().length > 0) {
					if (!confirm(_("The changes you have set up will be discarted. Do you wish to proceed?"))) return;
				}
				$e.ui.blocks.duplicateInCodeFromUI(parentBlock);
				$e.ui.blocks.setup.cancel();
			});
			const containerInstruction = $e.instructions.set[parentBlock.dataset.instructionSetId];
			buttonEl.title = _("Duplicate the full %s block", "'" + (containerInstruction.nameRewrite && containerInstruction.nameRewrite.name ? containerInstruction.nameRewrite.name : containerInstruction.name) + "'");
			msgTab.appendChild(buttonEl);
		}
		if (!containerSubblockDefinition || containerSubblockDefinition.optional || Array.from(parentBlock.children).filter(subblockEl => subblockEl.dataset.instructionSetId == instruction.name).length > 1) {
			const buttonEl = document.createElement("button");
			buttonEl.type = "button"; // By default BUTTON in FORM is type=submit, so when pressing enter this button would be triggered
			buttonEl.classList.add("tab", "remove");
			buttonEl.addEventListener("click", () => {
				if ($e.ui.blocks.setup.changes().length > 0) {
					if (!confirm(_("The changes you have set up will be discarted. Do you wish to proceed?"))) return;
				}
				$e.ui.blocks.deleteFromCodeFromUI(blockEl);
				$e.ui.blocks.setup.cancel();
			});
			buttonEl.title = !isSubblock ? _("Remove this block") : _("Remove this %s block", "'" + instruction.name + "'");
			msgTab.appendChild(buttonEl);
		}
	}
	msgEl.appendChild(msgTab);
	const setupIconBlockEl = document.createElement("div");
	const level = $e.modes.views.current.id;
	setupIconBlockEl.classList.add("setupBlockIcon", "block");
	setupIconBlockEl.dataset.instructionSetId = instructionSetId;
	const icon = document.createElement("canvas");
	$e.ui.blocks.paint(setupIconBlockEl);
	setupIconBlockEl.appendChild(icon);
	msgEl.appendChild(setupIconBlockEl);

	const parametersEl = document.createElement("div");
	parametersEl.classList.add("parameters");
	if (instruction.parameters) instruction.parameters.forEach((instructionParameter, i) => {

		const parameterInputDescr = Object.assign({
			name: _(instructionParameter.name),
			oldInputValue: blockEl.dataset["param" + i],
		}, instructionParameter);
		
		const parameterEl = document.createElement("div");
		parameterEl.dataset.parameterId = i;
		parameterEl.classList.add("parameter");
		let helpText = "";
		if (level != "level2") {
			if (instruction.name == "unknownFunction") {
				helpText += _("Enter the values for %s's parameters", [ blockEl.dataset.instructionName + "()" ]) + "<br />";
			} else {
				helpText += _("Enter the value for %s's %s parameter", [ instruction.name + (parameterInputDescr.noBrackets ? "" : "()"), $e.ordinal(i + 1) ]) + " \"" + _(parameterInputDescr.name) + "\"<br />";
			}
		}
		if (parameterInputDescr.tip) {
			const tipTranslation = _(parameterInputDescr.tip);
			helpText += "<b>" + tipTranslation + "</b>";
			if (!tipTranslation.trim().endsWith("?")) helpText += ":";
			helpText += "<br />";
		}
		const helpEl = document.createElement("span");
		helpEl.classList.add("description");
		helpEl.innerHTML += helpText;
		parameterEl.appendChild(helpEl);
		const setupTextualEl = document.createElement("div");
		setupTextualEl.classList.add("textual");
		const inputEl = document.createElement("input");
		inputEl.classList.add("setupInput");
		inputEl.type = "text";
		inputEl.value = parameterInputDescr.oldInputValue;
		const changeHandler = (event) => {
			const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
			const setupDataParameter = setupData.parameters[parameterIndex];
			const inputValue = event.target.value;
			setupDataParameter.value.new = inputValue;
			setupDataParameter.visual.containerEl.closest(".parameter").classList[instructionParameter.type != "other" && $e.ide.blocks.blockParameterIsComplex(inputValue) ? "add" : "remove"]("complexValue");
			$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
		};
		inputEl.addEventListener("change", changeHandler);
		inputEl.addEventListener("keyup", changeHandler);
		setupTextualEl.appendChild(inputEl);
		parameterEl.appendChild(setupTextualEl);
		const setupVisualEl = document.createElement("div");
		setupVisualEl.classList.add("visual");
		parameterEl.appendChild(setupVisualEl);
		parametersEl.appendChild(parameterEl);
		inputEl.closest(".parameter").classList[instructionParameter.type != "other" && $e.ide.blocks.blockParameterIsComplex(parameterInputDescr.oldInputValue) ? "add" : "remove"]("complexValue");

		setupData.parameters.push({
			value: {
				initial: $e.instructions.parsePredefinedConstants(parameterInputDescr.initial), // Only check predefined values if coming from programmer instruction set initializations // We need the parameter's default initial value to provide it to the icon drawing if the parameter is optional and has no user provided value
				old: parameterInputDescr.oldInputValue, // We need the old value to check if the parameter was changed when the setup is accepted
				new: parameterInputDescr.oldInputValue,
			},
			visual: {
				containerEl: setupVisualEl,
				inputEl: undefined,
			},
			textual: {
				containerEl: setupTextualEl,
				inputEl: inputEl,
			},
			subparameters: undefined,
		});
		
	});
	msgEl.appendChild(parametersEl);

	const isVisual = level === "level2" || $e.ui.setupType == "visual";
	$e.ui.msgBox.open(msgEl, {
		classes: "setupBlock",
		acceptAction: $e.ui.blocks.setup.accept,
		cancelAction: $e.ui.blocks.setup.cancel,
		focus: !isVisual ? setupData.parameters[0].textual.inputEl : undefined,
	});
	if (isVisual) {
		$e.ui.blocks.setup.style(true);
	} else {
		$e.ui.blocks.setup.style(false);
	}

	return true;
};

/**
 * Toggles the block setup between visual and text parameters setup
 * @private
 * @param {String} [style] Setup style to toggle to
 * @example $e.ui.blocks.setup.toggleStyleFromUI()
 */
$e.ui.blocks.setup.toggleStyleFromUI = () => {
	$e.ui.setupType = $e.ui.setupType == "visual" || ($e.ui.setupType === undefined && $e.modes.views.current.id != "level3") ? "text" : "visual";
	$e.ui.blocks.setup.style($e.ui.setupType == "visual");
};

/**
 * Updates the setupBlock icon
 * @private
 * @param {HTMLElement} setupIconBlockEl SetupBlockIcon element
 * @example $e.ui.blocks.setup.updateIcon(setupIconBlockEl)
 */
$e.ui.blocks.setup.updateIcon = (setupIconBlockEl) => {
	const setupData = $e.ui.blocks.setup.current;
	setupIconBlockEl.textContent = "";	
	setupData.parameters.forEach((setupDataParameter, i) => setupIconBlockEl.dataset["param" + i] = setupDataParameter.value.new !== "" ? setupDataParameter.value.new : (setupDataParameter.initial !== undefined ? JSON.stringify(setupDataParameter.initial) : ""));
	$e.ui.blocks.paint(setupIconBlockEl);
};

/**
 * Adds or removes the visual parameters setup in parameters setup dialog
 * @private
 * @param {Boolean} visual Whether to show visual setup or not. Default is true
 * @example $e.ui.blocks.setup.style(true)
 */
$e.ui.blocks.setup.style = (visual = true) => {
	
	const setupData = $e.ui.blocks.setup.current;
	const setupIconBlockEl = setupData.element.querySelector(".setupBlockIcon");
	$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
	if (visual) {
		setupData.element.classList.add("visualMode");
		setupData.element.classList.remove("textualMode");
	} else {
		setupData.element.classList.add("textualMode");
		setupData.element.classList.remove("visualMode");
	}

	if (!visual) return;
	
	const blockEl = setupData.blockEl;
	const instruction = $e.instructions.set[blockEl.dataset.instructionSetId];
	const instructionParameters = instruction.parameters;
	if (!instructionParameters || instructionParameters.length === 0) return; // This could be the "else" instruciton
	setupData.parameters.forEach((setupDataParameter, i) => {
		let value = setupDataParameter.value.new;
		if (value === "" || value === "undefined" || value === undefined) {
			value = undefined; // The parameter has no value, the parameter is explicitly set as undefined by the user, or the parameter does not exist in the block
		} else if (!$e.ide.blocks.blockParameterIsComplex(value)) {
			value = JSON.parse(value); // Convert to native type
		}
		const textualInput = setupDataParameter.textual.inputEl;
		const instructionParameter = instructionParameters[i];
		const setupVisualEl = setupDataParameter.visual.containerEl;
		setupVisualEl.textContent = "";
		const wrapperEl = document.createElement("div");
		wrapperEl.classList.add("wizard");
		let inputEl;
		if (instructionParameter.type === "text" || instructionParameter.type === "layer") {
			const inputEl = document.createElement("input");
			inputEl.type = "text";
			inputEl.value = value;
			const changeHandler = (event) => {
				const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
				const setupDataParameter = setupData.parameters[parameterIndex];
				const value = event.target.value;
				setupDataParameter.value.new = value;
				textualInput.value = value;
				$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
			};
			inputEl.addEventListener("change", changeHandler);
			inputEl.addEventListener("keyup", changeHandler);
			wrapperEl.appendChild(inputEl);
		} else if (instructionParameter.type === "font") {
			const fonts = [ "monospace", "serif", "sans-serif", "fantasy", "Arial", "Arial Black", "Arial Narrow", "Arial Rounded MT Bold", "Bookman Old Style", "Bradley Hand ITC", "Century", "Century Gothic", "Comic Sans MS", "Courier", "Courier New", "Georgia", "Gentium", "Impact", "King", "Lucida Console", "Lalit", "Modena", "Monotype Corsiva", "Papyrus", "Tahoma", "TeX", "Times", "Times New Roman", "Trebuchet MS", "Verdana", "Verona" ];
			inputEl = document.createElement("select");
			if (fonts.some((font) => {
				const wrappedFont = "\"" + font + "\"";
				if (!document.fonts.check("16px " + wrappedFont)) {
					if (wrappedFont == value) return true; // The font defined in the instruction is missing in this browser
					return false; // Skip this font in the select
				}
				const optionEl = document.createElement("option");
				optionEl.value = wrappedFont;
				optionEl.textContent = font;
				inputEl.appendChild(optionEl);
			})) {
				setupDataParameter.visual.containerEl.closest(".parameter").classList.add("complexValue");
			} else {
				setupDataParameter.visual.containerEl.closest(".parameter").classList.remove("complexValue");
			}
			inputEl.value = value;
			inputEl.addEventListener("change", (event) => {
				const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
				const setupDataParameter = setupData.parameters[parameterIndex];
				let value = event.target.value;
				if (value !== "") value = JSON.stringify(value);
				setupDataParameter.value.new = value;
				textualInput.value = value;
				$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
			});
			wrapperEl.appendChild(inputEl);
		} else if (instructionParameter.type === "number") {
			let minValue = $e.instructions.parsePredefinedConstants(instructionParameter.minValue);
			let maxValue = $e.instructions.parsePredefinedConstants(instructionParameter.maxValue);
			if ($e.isNumber(minValue) && $e.isNumber(maxValue) && minValue > maxValue) [ minValue, maxValue ] = [ maxValue, minValue ];
			const useSlider = minValue !== undefined && maxValue !== undefined;
			let stepValue = 1;
			if (instructionParameter.stepValue !== undefined) stepValue = instructionParameter.stepValue;
			let valueEscalation = 1;
			if (stepValue < 1) valueEscalation = 1 / stepValue;	// Number inputs only accept integers, so escalate
			const minusEl = document.createElement("input");
			minusEl.classList.add("operator");
			minusEl.type = "button";
			minusEl.value = "-";
			minusEl.dataset.valueescalation = valueEscalation;
			minusEl.addEventListener("click", (event) => {
				const valueEscalation = parseFloat(event.target.dataset.valueescalation);
				const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
				const setupDataParameter = setupData.parameters[parameterIndex];
				const inputEl = setupDataParameter.visual.inputEl;
				const min = $e.isNumber(inputEl.min, true) ? parseFloat(inputEl.min) : undefined;
				const max = $e.isNumber(inputEl.max, true) ? parseFloat(inputEl.max) : undefined;
				let value = $e.isNumber(inputEl.value, true) ? parseFloat(inputEl.value) : undefined;
				if (!$e.isNumber(value) && value !== undefined) return;
				if (value === undefined) {
					if (min !== undefined && max !== undefined) {
						value = (min + max) / 2;
					} else if (min !== undefined) {
						value = min;
					} else if (max !== undefined) {
						value = max;
					} else {
						value = 0;
					}
				}
				const step = $e.isNumber(inputEl.step, true) ? parseFloat(inputEl.step) : undefined;
				if (step === undefined) step =  1;
				value = (value * valueEscalation - step * valueEscalation) / valueEscalation; // This calculation (using valueEscalation) avoids javascript's float imprecision with calculations
				if (min !== undefined && value < min) value = min;
				if (max !== undefined && value > max) value = max;
				inputEl.value = value;
				setupDataParameter.value.new = value;
				inputEl.dispatchEvent(new Event("change"));
			});
			wrapperEl.appendChild(minusEl);
			inputEl = document.createElement("input");
			if (minValue !== undefined) inputEl.min = minValue * valueEscalation;
			if (maxValue !== undefined) inputEl.max = maxValue * valueEscalation;
			inputEl.dataset.valueescalation = valueEscalation;
			if (useSlider) {
				const textMinEl = document.createElement("span");
				textMinEl.classList.add("helpNote");
				textMinEl.textContent = minValue;
				wrapperEl.appendChild(textMinEl);
				inputEl.type = "range";
				inputEl.step = stepValue * valueEscalation;
				inputEl.value = value !== undefined ? value * valueEscalation : value;
				inputEl.addEventListener("change", (event) => {
					const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
					const setupDataParameter = setupData.parameters[parameterIndex];
					let value = $e.isNumber(event.target.value, true) ? parseFloat(event.target.value) / event.target.dataset.valueescalation : undefined;
					if (value === undefined) value = "";
					setupDataParameter.visual.readerEl.textContent = value;
					setupDataParameter.value.new = value;
					textualInput.value = value;
					$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
				});
				wrapperEl.appendChild(inputEl);
				const textMaxEl = document.createElement("span");
				textMaxEl.classList.add("helpNote");
				textMaxEl.textContent = maxValue;
				wrapperEl.appendChild(textMaxEl);
			} else {
				inputEl.type = "number";
				inputEl.value = value;
				inputEl.step = stepValue;
				inputEl.addEventListener("change", (event) => {
					const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
					const setupDataParameter = setupData.parameters[parameterIndex];
					const value = event.target.value;
					setupDataParameter.value.new = value;
					textualInput.value = value;
					$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
				});
				wrapperEl.appendChild(inputEl);
			}
			const plusEl = document.createElement("input");
			minusEl.classList.add("operator");
			plusEl.type = "button";
			plusEl.value = "+";
			plusEl.dataset.valueescalation = valueEscalation;
			plusEl.addEventListener("click", (event) => {
				const valueEscalation = parseFloat(event.target.dataset.valueescalation);
				const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
				const setupDataParameter = setupData.parameters[parameterIndex];
				const inputEl = setupDataParameter.visual.inputEl;
				const min = $e.isNumber(inputEl.min, true) ? parseFloat(inputEl.min) : undefined;
				const max = $e.isNumber(inputEl.max, true) ? parseFloat(inputEl.max) : undefined;
				let value = $e.isNumber(inputEl.value, true) ? parseFloat(inputEl.value) : undefined;
				if (!$e.isNumber(value) && value !== undefined) return;
				if (value === undefined) {
					if (min !== undefined && max !== undefined) {
						value = (min + max) / 2;
					} else if (min !== undefined) {
						value = min;
					} else if (max !== undefined) {
						value = max;
					} else {
						value = 0;
					}
				}
				const step = $e.isNumber(inputEl.step, true) ? parseFloat(inputEl.step) : undefined;
				if (step === undefined) step =  1;
				value = (value * valueEscalation + step * valueEscalation) / valueEscalation; // This calculation (using valueEscalation) avoids javascript's float imprecision with calculations
				if (min !== undefined && value < min) value = min;
				if (max !== undefined && value > max) value = max;
				inputEl.value = value;
				setupDataParameter.value.new = value;
				textualInput.value = value;
				inputEl.dispatchEvent(new Event("change"));
			});
			wrapperEl.appendChild(plusEl);
			if (useSlider) {
				const readerEl = document.createElement("label");
				readerEl.classList.add("reader");
				readerEl.textContent = value;
				wrapperEl.appendChild(readerEl);
				setupDataParameter.visual.readerEl = readerEl;
			}
		} else if (instructionParameter.type === "bool") {
			inputEl = document.createElement("select");
			[ true, false ].forEach(value => {
				const optionEl = document.createElement("option");
				optionEl.value = value.toString();
				optionEl.textContent = _(value.toString());
				inputEl.appendChild(optionEl);
			});
			inputEl.value = value;
			inputEl.addEventListener("change", (event) => {
				const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
				const setupDataParameter = setupData.parameters[parameterIndex];
				const value = event.target.value;
				setupDataParameter.value.new = value;
				textualInput.value = value;
				$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
			});
			wrapperEl.appendChild(inputEl);
		} else if (instructionParameter.type === "color") {
			inputEl = document.createElement("input");
			inputEl.type = "color";
			inputEl.value = value;
			inputEl.addEventListener("change", (event) => {
				const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
				const setupDataParameter = setupData.parameters[parameterIndex];
				const value = "\"" + event.target.value + "\"";
				setupDataParameter.value.new = value;
				textualInput.value = value;
				$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
			});
			wrapperEl.appendChild(inputEl);
		} else if (instructionParameter.type == "parameters") {
			inputEl = document.createElement("input");
			inputEl.classList.add("hide");
			wrapperEl.appendChild(inputEl);
			setupDataParameter.subparameters = [];
			const addHandler = (setupDataParameterOrEvent, subparameterInputValue) => { // This function is called when generating the block and also when clicking the Add button
				const setupDataParameter = setupDataParameterOrEvent instanceof Event ? subparameterInputValueOrEvent.target.closest(".subparameter").data.parameterData : setupDataParameterOrEvent; // When it is called from an event setupDataParameterOrEvent contains the event
				const subparameterContainerEl = document.createElement("div");
				subparameterContainerEl.classList.add("subparameter");
				const subinputEl = document.createElement("input");
				subinputEl.value = subparameterInputValue;
				const updateHandler = (setupDataParameter) => {
					const value = setupDataParameter.subparameters.reduce((acc, setupDataSubparameter) => acc.concat(setupDataSubparameter.value), []);
					setupDataParameter.value.new = value;
					textualInput.value = value;
					$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
				};
				const changeHandler = (event) => {
					const subinputEl = event.target;
					const setupDataSubparameter = subinputEl.closest(".subparameter").data;
					const setupDataParameter = setupDataSubparameter.parameterData;
					const value = setupDataSubparameter.inputEl.value;
					setupDataSubparameter.value.new = value;
					textualInput.value = value;
					const enableAddButton = setupDataParameter.subparameters.every(paramValue => paramValue != "");
					setupDataParameter.visual.containerEl.querySelector("add").classList[enableAddButton ? "remove" : "add"]("invisible");
					updateHandler(setupDataParameter);
				};
				const removeHandler = (event) => {
					const removeSubparameterEl = event.target;
					const subparameterContainerEl = removeSubparameterEl.closest(".subparameter");
					const setupDataSubparameter = subparameterContainerEl.data;
					const setupDataParameter = setupDataSubparameter.parameterData;
					subparameterContainerEl.removeChild(subparameterContainerEl);
					const value = setupDataSubparameter.inputEl.value;
					setupDataSubparameter.value.new = value;
					textualInput.value = value;
					const subparameterIndex = setupDataParameter.subparameters.findIndex(subparameter => subparameter.containerEl == subparameterContainerEl);
					setupDataParameter.subparameters.splice(subparameterIndex, 1);
					setupDataParameter.subparameters[0].querySelector(".remove").classList.add("invisible");
					const enableAddButton = setupDataParameter.subparameters.every(paramValue => paramValue != "");
					setupDataParameter.visual.containerEl.querySelector("add").classList[enableAddButton ? "remove" : "add"]("invisible");
					updateHandler(setupDataParameter);
				};
				subinputEl.addEventListener("change", changeHandler);
				subinputEl.addEventListener("keyup", changeHandler);
				subparameterContainerEl.appendChild(subinputEl);
				const setupDataSubparameter = {
					value: subparameterInputValue,
					containerEl: subparameterContainerEl,
					inputEl: subinputEl,
					parameterData: setupDataParameter,
				};
				setupDataParameter.subparameters.push(setupDataSubparameter);
				subparameterContainerEl.data = setupDataSubparameter; // Attach it to the HTMLElement so it is easy to obtain from inner HTMLElements, also avoids having to update all parameter and subparameter ids in elements' dataset when a subparameter is removed
				const removeButtonEl = document.createElement("button");
				removeButtonEl.type = "button"; // By default BUTTON in FORM is type=submit, so when pressing enter this button would be triggered
				removeButtonEl.textContent = "-";
				removeButtonEl.classList.add("remove");
				removeButtonEl.addEventListener("click", removeHandler); // click is also triggered by touchstart
				subparameterContainerEl.appendChild(removeButtonEl);
				wrapperEl.appendChild(subparameterContainerEl);
				enableRemoveButton = setupDataParameter.subparameters.length > 1; // There are two or more parameters so the first parameter can be removed
				setupDataParameter.visual.containerEl.querySelector("remove").classList[enableRemoveButton ? "remove" : "add"]("invisible");
				setupDataParameter.visual.containerEl.querySelector("add").classList[subparameterInputValue != "" ? "remove" : "add"]("invisible");
				updateHandler(setupDataParameter);
			};
			// Generate parameter inputs from value
			inputEl.value = value;
			JSON.parse("[ " + value + " ]").forEach(subparameterInputValue => addHandler(setupDataParameter, subparameterInputValue));
			// Create the Add button
			addButtonContainerEl = document.createElement("div");
			const subinputEl = document.createElement("input"); // This input is just to add up the space to align the Remove and the Add icons
			subinputEl.classList.add("invisible");
			addButtonContainerEl.appendChild(subinputEl);
			const addButtonEl = document.createElement("button");
			addButtonEl.type = "button"; // By default BUTTON in FORM is type=submit, so when pressing enter this button would be triggered
			addButtonEl.textContent = "+";
			addButtonEl.classList.add("add", "invisible"); // Use visibility:hidden instead of display:none so it will position correctly when shown
			addButtonEl.addEventListener("click", addHandler); // click is also triggered by touchstart
			addButtonContainerEl.appendChild(addButtonEl);
			setupVisualEl.appendChild(addButtonContainerEl);
		} else if (instructionParameter.type == "var") {
			inputEl = document.createElement("input");
			inputEl.type = "text";
			inputEl.value = value;
			const changeHandler = (event) => {
				const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
				const setupDataParameter = setupData.parameters[parameterIndex];
				const value = event.target.value;
				setupDataParameter.value.new = value;
				textualInput.value = value;
				$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
			};
			inputEl.addEventListener("change", changeHandler);
			inputEl.addEventListener("keyup", changeHandler);
			wrapperEl.appendChild(inputEl);
		} else {
			if (instructionParameter.type != "other") console.error("Unknown parameter type in $e.ui.blocks.setup.style(): " + instructionParameter.type);
			inputEl = document.createElement("input");
			inputEl.value = value === undefined ? "" : value;
			inputEl.classList.add("unsupported");
			inputEl.addEventListener("change", (event) => {
				const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
				const setupDataParameter = setupData.parameters[parameterIndex];
				const value = event.target.value;
				setupDataParameter.value.new = value;
				textualInput.value = value;
				$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
			});
			wrapperEl.appendChild(inputEl);
		}
		setupVisualEl.appendChild(wrapperEl);
		setupDataParameter.visual.inputEl = inputEl;
		if (instructionParameter.optional) {
			const wrapperEl = document.createElement("div");
			const inputEl = document.createElement("input");
			inputEl.id = "setup-parameter-" + $e.backend.unique();
			inputEl.type = "checkbox";
			inputEl.addEventListener("change", (event) => {
				const parameterIndex = $e.ui.blocks.setup.getParameterIndex(event.target);
				const setupDataParameter = setupData.parameters[parameterIndex];
				if (event.target.checked) {
					const value = "";
					setupDataParameter.value.new = value;
					textualInput.value = value;
					setupDataParameter.visual.containerEl.closest(".parameter").classList.add("undefined");
				} else {
					const value = setupDataParameter.visual.inputEl.value;
					setupDataParameter.value.new = value;
					textualInput.value = value;
					setupDataParameter.visual.containerEl.closest(".parameter").classList.remove("undefined");
				}
				$e.ui.blocks.setup.updateIcon(setupIconBlockEl);
			});
			wrapperEl.appendChild(inputEl);
			const labelEl = document.createElement("label");
			labelEl.textContent = _("Leave without value");
			labelEl.htmlFor = inputEl.id;
			wrapperEl.appendChild(labelEl);
			setupVisualEl.appendChild(wrapperEl);
			if (setupDataParameter.value.new === "") {
				inputEl.checked = true;
				setupDataParameter.visual.containerEl.closest(".parameter").classList.add("undefined");
			} else {
				setupDataParameter.visual.containerEl.closest(".parameter").classList.remove("undefined");
			}
		}
	});
};

$e.ui.blocks.setup.getParameterIndex = (el) => {
	return el.closest(".parameter").dataset.parameterId;
};

/**
 * Takes the parameters from a msgBox and applies them in the block. You probably want to call msgBoxClose() here
 * @see setupBlock
 * @see $e.ui.msgBox.close
 * @private
 * @example $e.ui.blocks.setup.accept()
 */
$e.ui.blocks.setup.accept = () => {
	const setupData = $e.ui.blocks.setup.current;
	$e.ui.blocks.cancelFloatingBlock();
	let blockEl = setupData.blockEl;
	const instructionId = blockEl.dataset.instructionSetId;
	const instruction = $e.instructions.set[instructionId];
	if (instruction.parameters) {
		const failedParameterIndex = setupData.parameters.findIndex((setupDataParameter, i) => {
			const instructionParameter = instruction.parameters[i];
			if (instructionParameter.validate && !instructionParameter.validate(setupDataParameter.value.new)) return true;
		});
		if (failedParameterIndex >= 0) return $e.ui.msgBox.open(_("The value for parameter \"%s\" is invalid!", [ _(instruction.parameters[failedParameterIndex]	.name) ]));
	}
	const setupChanges = $e.ui.blocks.setup.changes (true);
	const hasChanges = setupData.isAdd || setupChanges.length > 0;
	if (setupData.isAdd) {
		// Undo stack does not need to be updated, the block was already pushed to the stack when the setup dialog was opened
	} else if (setupChanges.length > 0) { // Update undo array if it is a "setup" action (not an "add" action)
		$e.ide.blocks.changes.push({
			action: "setup",
			blockEl: blockEl,
			parameters: setupChanges,
		});
	}
	if (hasChanges) $e.ide.blocks.changed();
	// Update the block icon
	$e.ui.blocks.paint(blockEl);
	$e.ui.blocks.setup.current = undefined;
	setTimeout($e.ui.msgBox.close, 50); // Allow event listeners on form submit to be triggered before removing the form
	$e.ui.disableKeyboardShortcuts = true;
};

/**
 * Cancels a setupBlock. You probably want to call $e.ui.msgBox.close() here
 * @see setupBlock
 * @see $e.ui.msgBox.close
 * @private
 * @param {Object} event Event
 * @example $e.ui.blocks.setup.cancel()
 */
$e.ui.blocks.setup.cancel = (event) => {
	const setupData = $e.ui.blocks.setup.current;
	if (event !== undefined && !setupData.isAdd && $e.ui.blocks.setup.changes().length > 0) {
		if (!confirm(_("The changes you have set up will be discarted. Do you wish to proceed?"))) return;
	}
	$e.ui.blocks.cancelFloatingBlock();
	if (setupData.isAdd) {
		const blockEl = setupData.blockEl;
		const targetEl = blockEl.classList.contains("subblock") ? blockEl.parentNode : blockEl;
		$e.ui.blocks.removeFromCode(targetEl);
		$e.ide.blocks.changes.pop();
		$e.ui.refreshUndo(); // If this is the first block added we must remove the undo button
	}
	$e.ui.blocks.setup.current = undefined;
	$e.ui.msgBox.close();
	$e.ui.disableKeyboardShortcuts = false;
};

/**
 * Returns an array with the changes setup in the instruction
 * @private
 * @param {Boolean} [applyChanges=false] If true, the changes will be applied to the block in the code
 * @return Array<{Number, oldValue, newValue}>
 * @example $e.ui.blocks.setup.changes()
 */
$e.ui.blocks.setup.changes = (applyChanges=false) => {
	const setupData = $e.ui.blocks.setup.current;
	return setupData.parameters.reduce((acc, setupDataParameter, i) => {
		const { new: newInputValue, old: oldInputValue } = setupDataParameter.value;
		if (applyChanges) setupData.blockEl.dataset["param" + i] = newInputValue;
		if (oldInputValue !== newInputValue) acc.push([ i, oldInputValue, newInputValue ]);
		return acc;
	}, []);
}