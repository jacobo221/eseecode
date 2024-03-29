"use strict";

$e.ui.init = () =>  {
	$e.ui.element.innerHTML = '\
		<div id="header">\
			<h1 id="title"></h1>\
			<span id="fullscreen-button" class="button"></span>\
		</div>\
		<div id="body">\
			<div id="toolbox" class="panel toolbox-panel">\
				<div id="toolbox-tabs" class="tabs">\
					<button id="toolbox-tabs-setup" class="tab"></button>\
					<button id="toolbox-tabs-pieces" class="tab"></button>\
					<button id="toolbox-tabs-io" class="tab"></button>\
					<button id="toolbox-tabs-window" class="tab"></button>\
					<button id="toolbox-tabs-debug" class="tab"></button>\
				</div>\
				<div id="toolbox-content">\
					<div id="toolbox-blocks" class="panel-column"></div>\
					<div id="toolbox-write" class="panel-column"></div>\
					<div id="toolbox-window" class="panel-column"></div>\
					<div id="toolbox-io" class="panel-column">\
						<div id="toolbox-io-input-title" class="toolbox-title"></div>\
						<textarea id="toolbox-io-input"></textarea>\
						<div id="toolbox-io-output-title" class="toolbox-title"></div>\
						<div id="toolbox-io-output"></div>\
					</div>\
					<div id="toolbox-debug" class="panel-column">\
						<div id="toolbox-debug-layers-title" class="toolbox-title"><span id="toolbox-debug-layers-title-toggles" class="toolbox-title-column-name"><input id="toolbox-debug-layers-title-toggles-checkbox" type=\"checkbox\" checked /><label id="toolbox-debug-layers-title-toggles-name" for="toolbox-debug-layers-title-toggles-checkbox"></label></span></span><span id="toolbox-debug-layers-title-name" class="toolbox-title-name"></span><span id="toolbox-debug-layers-help" class="toolbox-help"></span></div>\
						<div id="toolbox-debug-layers" class="toolbox-cell"></div>\
						<div class="separator"></div>\
						<div id="toolbox-debug-analyzer-title" class="toolbox-title"><span id="toolbox-debug-analyzer-title-toggles" class="toolbox-title-column-name"><input id="toolbox-debug-analyzer-title-toggles-checkbox" type=\"checkbox\" checked /><label id="toolbox-debug-analyzer-title-toggles-name" for="toolbox-debug-analyzer-title-toggles-checkbox"></label></span></span><span id="toolbox-debug-analyzer-title-name" class="toolbox-title-name"></span><span id="toolbox-debug-analyzer-help" class="toolbox-help"></span></div>\
						<div id="toolbox-debug-analyzer-toolbar" class="toolbox-cell">\
							<button id=\"toolbox-debug-breakpoint-add\" type=\"button\" class=\"button\"></button>\
							<button id=\"toolbox-debug-watch-add\" type=\"button\" class=\"button\"></button>\
						</div>\
						<div id="toolbox-debug-analyzer-breakpoints" class="toolbox-cell toolbox-debug-analyzer-breakpoint-block"></div>\
						<div id="toolbox-debug-analyzer-watches" class="toolbox-cell toolbox-debug-analyzer-breakpoint-block"></div>\
						<div class="separator"></div>\
						<div id="toolbox-debug-execute-execution-title" class="toolbox-title"><span id="toolbox-debug-execute-execution-title-name" class="toolbox-title-name"></span><span id="toolbox-debug-execute-execution-help" class="toolbox-help"></span></div>\
						<div id="toolbox-debug-execute-step-buttons" class="toolbox-cell">\
							<div id="toolbox-debug-execute-instructionsDelay">\
								<span id="toolbox-debug-execute-instructionsDelay-before"></span><input id="toolbox-debug-execute-instructionsDelay-input" type="range" min="1" max="1000" value="' + $e.execution.instructionsDelay + '" /><span id="toolbox-debug-execute-instructionsDelay-after"></span>\
							</div>\
							<div id="toolbox-debug-execute-step">\
								<button id="toolbox-debug-execute-step-backwards" class="button"></button>\
								<button id="toolbox-debug-execute-step-forward" class="button"></button>\
							</div>\
						</div>\
						<div id="toolbox-debug-execute-stats" class="toolbox-cell"></div>\
					</div>\
					<div id="toolbox-setup" class="panel-column">\
						<div id="translations">\
							<div id="translations-switch">\
								<span id="translations-title"></span>\
								<select id="translations-select"></select>\
							</div>\
							<div id="translations-translator"></div>\
						</div>\
						<div id="themes">\
							<div id="themes-switch">\
								<span id="themes-title"></span>\
								<select id="themes-select"></select>\
							</div>\
						</div>\
						<div id="filemenu">\
							<button id="loadcode" class="button"></button>\
							<button id="savecode" class="button"></button>\
						</div>\
						<div id="setup-grid">\
							<input id="setup-grid-enable" type="checkbox" checked /><label id="setup-grid-divisions-title" for="setup-grid-enable"></label>\
							<input id="setup-grid-divisions" type="number" value="15" /><br />\
							<select id="setup-grid-coordinates"></select><br />\
							<label id="setup-guide-enable-title" for="setup-guide-enable"></label><input id="setup-guide-enable" type="checkbox" checked />\
						</div>\
						<div id="toolbox-setup-author"></div>\
					</div>\
				</div>\
				<div id="toolbox-debug-command"><form id="toolbox-debug-command-form">\
					<input id="toolbox-debug-command-input" type="text" />\
					<button id="toolbox-debug-command-button" class="button"></button>\
				</form></div>\
			</div>\
			<div id="view" class="panel view-panel">\
				<div id="view-tabs" class="tabs">\
					<button id="view-tabs-restore-toolbox" class="tab"></button>\
					<span id="view-tabs-title" class="tab-title"></span>\
					<button id="view-tabs-level1" class="tab"></button>\
					<button id="view-tabs-level2" class="tab"></button>\
					<button id="view-tabs-level3" class="tab"></button>\
					<button id="view-tabs-level4" class="tab"></button>\
					<button id="view-tabs-maximize" class="tab"></button>\
				</div>\
				<div id="view-content" class="program" translate="no">\
					<div id="view-blocks-tabs" class="tabs">\
						<button id="view-blocks-tabs-flow" class="tab"></button>\
						<button id="view-blocks-tabs-multiselect" class="tab"></button>\
						<button id="view-blocks-tabs-move" class="tab hide"></button>\
						<button id="view-blocks-tabs-duplicate" class="tab hide"></button>\
						<button id="view-blocks-tabs-remove" class="tab hide"></button>\
					</div>\
					<div id="view-blocks" class="panel-column"></div>\
					<div id="view-write" class="panel-column"></div>\
				</div>\
				<div id="view-buttons">\
					<button id="button-undo" class="button"></button>\
					<div>\
						<button id="button-execute" class="button"></button>\
						<button id="button-pause" class="button"></button>\
						<button id="button-resume" class="button"></button>\
						<button id="button-clear" class="button"></button>\
						<button id="button-reset" class="button"></button>\
					</div>\
					<button id="button-redo" class="button"></button>\
				</div>\
			</div>\
			<div id="whiteboard-wrapper" class="panel whiteboard-panel">\
				<div id="whiteboard-tabs" class="tabs">\
					<button id="whiteboard-tabs-download-button" class="tab"></button>\
				</div>\
				<div id="whiteboard"></div>\
			</div>\
		</div>\
		<div id="footer"></div>\
	';
	setTimeout(() => Object.entries({
		"fullscreen-button": $e.ui.toggleFullscreen,
		"toolbox-tabs-setup": () => $e.ui.switchToolboxMode("setup"),
		"toolbox-tabs-pieces": () => $e.ui.switchToolboxMode($e.modes.views.current.id),
		"toolbox-tabs-io": () => $e.ui.switchToolboxMode("io"),
		"toolbox-tabs-window": () => $e.ui.switchToolboxMode("window"),
		"toolbox-tabs-debug": () => $e.ui.switchToolboxMode("debug"),
		"loadcode": $e.ui.loadCode,
		"savecode": $e.ui.saveCode,
		"translations-select": (event) => $e.ui.translations.switch(event.target.value),
		"themes-select": (event) => $e.ui.themes.switch(event.target.value),
		"setup-grid-enable": $e.ui.toggleGrid,
		"setup-guide-enable": $e.toggleGuideFromUI,
		"setup-grid-coordinates": $e.ui.changeAxis,
		"setup-grid-divisions": $e.ui.updateGridDivisions,
		"toolbox-debug-layers-title-toggles-checkbox": $e.ui.debug.selectAllNoneLayers,
		"toolbox-debug-breakpoint-add": $e.ui.debug.addBreakpoint,
		"toolbox-debug-watch-add": $e.ui.debug.addWatch,
		"toolbox-debug-analyzer-title-toggles-checkbox": $e.ui.debug.enableAllNoneBreakpoints,
		"toolbox-debug-execute-instructionsDelay-input": $e.execution.updateInstructionsDelay,
		"toolbox-debug-execute-step-backwards": () => $e.ide.runSteps(-1),
		"toolbox-debug-execute-step-forward": $e.ide.runSteps,
		"toolbox-debug-command-form": () => { $e.ui.debug.command(); return false; },
		"toolbox-debug-command-button": $e.ui.debug.command,
		"view-tabs-restore-toolbox": $e.ui.restoreToolbox,
		"view-tabs-level1": () => $e.ui.switchViewFromUI("level1"),
		"view-tabs-level2": () => $e.ui.switchViewFromUI("level2"),
		"view-tabs-level3": () => $e.ui.switchViewFromUI("level3"),
		"view-tabs-level4": () => $e.ui.switchViewFromUI("level4"),
		"view-tabs-maximize": $e.ui.resizeView,
		"view-blocks-tabs-flow": $e.ui.blocks.flowToggle,
		"view-blocks-tabs-multiselect": $e.ui.blocks.multiselectToggle,
		"view-blocks-tabs-move": $e.ui.blocks.multiipleMoveEventStart,
		"view-blocks-tabs-duplicate": $e.ui.blocks.multipleDuplicate,
		"view-blocks-tabs-remove": $e.ui.blocks.multipleRemove,
		"button-undo": $e.ui.undo,
		"button-execute": $e.ui.execute,
		"button-pause": $e.ui.pauseExecution,
		"button-resume": $e.ui.resume,
		"button-clear": $e.ui.clear,
		"button-reset": $e.ui.resetExecution,
		"button-redo": $e.ui.redo,
		"whiteboard-tabs-download-button": $e.ui.downloadWhiteboard,
	}).forEach(([ id, call ]) => {
		const el = $e.ui.element.querySelector("#" + id);
		let listenerType = "click";
		if (el.type == "checkbox" || el.type == "range" || el.tagName == "SELECT") listenerType = "change";
		else if (el.tagName == "FORM") listenerType = "submit";
		el.addEventListener(listenerType, call);
	}), 0); // Make it asynchronous so it gives time for the DOM to be created
};