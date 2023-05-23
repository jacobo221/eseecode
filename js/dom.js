"use strict";
	/**
	 * @author Jacobo Vilella Vilahur
	 * @license GPL-3.0
	 */

	var eseecodeDiv = document.getElementById("eseecode");
	eseecodeDiv.setAttribute("unselectable", "on");
	eseecodeDiv.setAttribute("onselectstart", "return false");
	eseecodeDiv.innerHTML = '\
		<div id="header">\
			<h1 id="title" class="column"></h1>\
			<span id="fullscreen-button" class="button" onclick="$e_toggleFullscreen()"><canvas width="20" height="20"></canvas></span>\
		</div>\
		<div id="body">\
			<div id="dialog" class="column">\
				<div id="dialog-tabs" class="tabs">\
					<div id="dialog-tabs-setup" class="tab" onclick="$e_switchDialogMode(&quot;setup&quot;)"><canvas width="15" height="15"></canvas></div>\
					<div id="dialog-tabs-debug" class="tab" onclick="$e_switchDialogMode(&quot;debug&quot;)"></div>\
					<div id="dialog-tabs-window" class="tab" onclick="$e_switchDialogMode(&quot;window&quot;)"></div>\
					<div id="dialog-tabs-io" class="tab" onclick="$e_switchDialogMode(&quot;io&quot;)"></div>\
					<div id="dialog-tabs-pieces" class="tab" onclick="$e_switchDialogMode($_eseecode.modes.console[0])"></div>\
				</div>\
				<div id="dialog-body" class="programbody">\
					<div id="dialog-blocks" class="program"></div>\
					<div id="dialog-write" class="program"></div>\
					<div id="dialog-window" class="program"></div>\
					<div id="dialog-io" class="program">\
						<div id="dialog-io-input-title" class="dialog-title"></div>\
						<textarea id="dialog-io-input"></textarea>\
						<div id="dialog-io-output-title" class="dialog-title"></div>\
						<textarea id="dialog-io-output" disabled="disabled"></textarea>\
					</div>\
					<div id="dialog-debug" class="program">\
						<div id="dialog-debug-layers-title" class="dialog-title"></div>\
						<div id="dialog-debug-layers-help" class="dialog-help">?</div>\
						<div id="dialog-debug-layers"></div>\
						<div class="separator"></div>\
						<div id="dialog-debug-analyzer-title" class="dialog-title"></div>\
						<div id="dialog-debug-analyzer-help" class="dialog-help">?</div>\
						<div id="dialog-debug-analyzer-toolbar"></div>\
						<div id="dialog-debug-analyzer-breakpoints" class="dialog-debug-analyzer-breakpoint-block"></div>\
						<div id="dialog-debug-analyzer-watches" class="dialog-debug-analyzer-breakpoint-block"></div>\
						<div class="separator"></div>\
						<div id="dialog-debug-execute-stats-title" class="dialog-title"></div>\
						<div id="dialog-debug-execute-stats-help" class="dialog-help">?</div>\
						<div id="dialog-debug-execute-stats"></div>\
						<div id="dialog-debug-execute-step-buttons">\
							<span id="dialog-debug-execute-step-title"></span><input id="dialog-debug-execute-step" type="number" min="1" onchange="$e_updateExecutionStep()" /><span id="dialog-debug-execute-pause-title"></span><input id="dialog-debug-execute-pause" type="number" min="0" value="'+$_eseecode.execution.pause+'" onchange="$e_updateExecutionPause()" /><span id="dialog-debug-execute-step-title2"></span><label id="dialog-debug-execute-stepped-label" for="dialog-debug-execute-stepped"></label><input id="dialog-debug-execute-stepped" type="checkbox" '+($_eseecode.execution.stepped?'checked="checked':'')+' onchange="$e_updateExecutionStepped()" />\
						</div>\
					</div>\
					<div id="dialog-setup" class="program">\
						<br />\
						<div id="translations">\
							<div id="translations-translator"></div><br />\
							<div id="translations-switch">\
								<span id="translations-title"></span>\
								<select id="translations-select" onChange="$e_switchTranslation(this.value)"></select>\
							</div>\
						</div>\
						<br />\
						<div id="themes">\
							<div id="themes-switch">\
								<span id="themes-title"></span>\
								<select id="themes-select" onChange="$e_switchTheme(this.value)"></select>\
							</div>\
						</div>\
						<br />\
						<div id="filemenu">\
							<input type="button" id="loadcode" name="loadfile" onclick="$e_loadCodeFromUI()" />\
							<input type="button" id="savecode" name="savefile" onclick="$e_saveCodeFromUI()" />\
						</div>\
						<br />\
						<div id="setup-grid">\
							<input id="setup-grid-enable" type="checkbox" onclick="$e_toggleGridFromUI()" checked /><span id="setup-grid-divisions-title"></span>\
							<input id="setup-grid-divisions" type="number" onchange="$e_updateGridDivisionsFromUI()" value="15" /><br /><select id="setup-grid-coordinates" onchange="$e_changeAxisFromUI()"></select><br />\
							<span id="setup-guide-enable-title"></span><label id="setup-guide-enable-label" for="setup-guide-enable"></label><input id="setup-guide-enable" type="checkbox" onclick="$e_toggleGuideFromUI()" checked />\
						</div>\
						<br />\
						<div id="setup-execute-time-buttons">\
							<span id="setup-execute-time-title"></span><input id="setup-execute-time" type="number" min="1" onchange="$e_updateExecutionTime()" /><span id="setup-execute-time-title2"></span>\
						</div>\
						<div id="dialog-setup-author"></div>\
					</div>\
				</div>\
				<div id="dialog-debug-command"><form id="dialog-debug-command-form" onsubmit="$e_execute(true,document.getElementById(&quot;dialog-debug-command-input&quot;).value);return false;">\
					<input id="dialog-debug-command-input" type="text" />\
					<span id="dialog-debug-command-button" class="button" onclick="$e_execute(true,document.getElementById(&quot;dialog-debug-command-input&quot;).value)"><canvas width="20" height="20"></canvas></span>\
				</form></div>\
			</div>\
			<div id="console" class="column">\
				<div id="console-tabs" class="tabs">\
					<span id="console-tabs-title" class="tab-title"></span>\
					<div id="console-tabs-level1" class="tab" onclick="$e_switchConsoleMode(&quot;level1&quot;)"></div>\
					<div id="console-tabs-level2" class="tab" onclick="$e_switchConsoleMode(&quot;level2&quot;)"></div>\
					<div id="console-tabs-level3" class="tab" onclick="$e_switchConsoleMode(&quot;level3&quot;)"></div>\
					<div id="console-tabs-level4" class="tab" onclick="$e_switchConsoleMode(&quot;level4&quot;)"></div>\
					<div id="console-tabs-resize" class="tab" onclick="$e_resizeConsole()"><canvas width="15" height="15"></canvas></div>\
				</div>\
				<div id="console-tabdiv" class="programbody">\
					<div id="console-blocks" class="program"></div>\
					<div id="console-write" class="program"></div>\
				</div>\
				<div id="console-buttons">\
					<div id="button-undo" class="button" onclick="$e_undoFromUI()"><canvas width="40" height="20"></canvas></div>\
					<div>\
						<span id="button-execute" class="button" onclick="$e_executeFromUI()"><canvas width="20" height="20"></canvas></span>\
						<span id="button-clear" class="button" onclick="$e_resetCanvasFromUI()"><canvas width="20" height="20"></canvas></span>\
						<span id="button-reset" class="button" onclick="$e_resetUIFromUI()"><canvas width="20" height="20"></canvas></span>\
					</div>\
					<div id="button-redo" class="button" onclick="$e_redoFromUI()"><canvas width="40" height="20"></canvas></div>\
				</div>\
			</div>\
			<div id="whiteboard-wrapper" class="column">\
				<div id="whiteboard-tabs" class="tab-buttons">\
					<span id="whiteboard-tabs-download-button" class="tab-button" onclick="$e_downloadWhiteboardMsgBox()"><canvas width="20" height="20"></canvas></span>\
				</div>\
				<div id="whiteboard"></div>\
			</div>\
		</div>\
		<div id="footer"></div>\
	';
