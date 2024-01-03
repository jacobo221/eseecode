"use static";

/**
 * Shows a loading animation overlapping all the platform's user interface
 * @private
 * @example $e.ui.loading.open()
 */
$e.ui.loading.open = () => {
	const wrapperEl = document.createElement("div");
	wrapperEl.id ="loadingWrapper";
	wrapperEl.classList.add("loadingWrapper");
	const innerEl = document.createElement("div");
	innerEl.classList.add("loading");
	wrapperEl.appendChild(innerEl);
	$e.ui.element.appendChild(wrapperEl);
};

/**
 * Closes the loading animation
 * @private
 * @example $e.ui.loading.close()
 */
$e.ui.loading.close = () => {
	const wrapperEl = $e.ui.element.querySelector("#loadingWrapper");
	if (wrapperEl) wrapperEl.parentNode.removeChild(wrapperEl);
};

/**
 * Shows a message box overlapping all the platform's user interface
 * @private
 * @param {String|HTMLElement} text Message to show in the message box
 * @param {acceptName:String,acceptAction:function(),cancel:Boolean,cancelName:String,cancelAction:function(),focus:String,noSubmit:Boolean,classes:String|Array<String>} [config] Configuration parameters for the message box
 * @example $e.ui.msgBox.open("This is a message!")
 */
$e.ui.msgBox.open = (text, config) => {
	if (!config) config = {};
	let id;
	for (id = 0; $e.ui.element.querySelector("#msgBoxWrapper" + id); id++);
	const wrapperEl = document.createElement("div");
	wrapperEl.id = "msgBoxWrapper" + id;
	wrapperEl.classList.add("msgBoxWrapper");
	const innerEl = document.createElement("div");
	innerEl.id = "msgBox" + id;
	innerEl.classList.add("msgBox");
	if (config.classes) {
		if (typeof config.classes == "string") config.classes = [ config.classes ];
		config.classes.forEach(classname => innerEl.classList.add(classname));
	}
	let textEl;
	if (typeof text === "string") {
		textEl = document.createElement("div");
		textEl.innerHTML = text;
	} else {
		textEl = text;
	}
	const buttonEl = document.createElement("div");
	buttonEl.classList.add("submit-wrapper");
	let input = document.createElement("input");
	input.id = "msgBoxAccept" + id;
	input.type = "submit";
	if (config && config.acceptName) {
		input.value = config.acceptName;
	} else {
		input.value = _("Accept");
	}
	let focusElement = wrapperEl;
	if (!config || config.noSubmit !== true) {
		focusElement = input;
		if (!config || !config.focus) {
			input.autofocus = true;
		}
		if (config && config.acceptAction) {
			input.addEventListener("click", config.acceptAction);
		} else {
			input.addEventListener("click", $e.ui.msgBox.close);
		}
		buttonEl.appendChild(input);
	}
	if (config && (config.cancel || config.cancelName || config.cancelAction)) {
		input = document.createElement("input");
		input.id = "msgBoxCancel" + id;
		if (config.noSubmit === true) {
			focusElement = input;
		}
		input.type = "button";
		if (config && config.cancelName) {
			input.value = config.cancelName;
		} else {
			input.value = _("Cancel");
		}
		if (config.cancelAction) {
			input.addEventListener("click", config.cancelAction);
		} else {	
			input.addEventListener("click", $e.ui.msgBox.close);
		}
		buttonEl.appendChild(input);
	}
	const form = document.createElement("form");
	form.addEventListener("submit", (event) => { event.preventDefault(); return false; });
	form.appendChild(textEl);
	form.appendChild(buttonEl);
	innerEl.appendChild(form);
	wrapperEl.appendChild(innerEl);
	$e.ui.element.querySelector("#body").appendChild(wrapperEl);
	if (config && config.focus) {
		if (typeof config.focus == "string") {
			$e.ui.element.querySelector("#" + config.focus).focus();
		} else {
			config.focus.focus();
		}
	} else {
		// We must give focus to something in the msgBox otherwise the focus could be on a previous msgBox's button and pressing ENTER would affect to that other msgBox
		focusElement.focus();
	}
};

/**
 * Closes the msgBox dialog
 * @see $e.ui.msgBox.open
 * @private
 * @example $e.ui.msgBox.close()
 */
$e.ui.msgBox.close = () => {
	let id;
	for (id = 0; $e.ui.element.querySelector("#msgBoxWrapper" + id); id++);
	id--;
	const msgBoxElement = $e.ui.element.querySelector("#msgBoxWrapper" + id);
	if (msgBoxElement) {
		msgBoxElement.parentNode.removeChild(msgBoxElement);
		if (id > 0) {
			$e.ui.element.querySelector("#msgBoxWrapper" + (id - 1)).focus();
		} else if ($e.modes.views.current.type === "write") {
			$e.session.editor.focus();
		}
	}
};