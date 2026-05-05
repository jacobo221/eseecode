"use strict";

const codelangPython = $e.execution.codelang.available.find((candidate) => candidate.id === "python");

/**
 * Configures Skulpt and runs a Python code string
 * @private
 * @param {String} code Python source code
 * @return {Promise} Resolves when execution ends, rejects on error
 * @example codelangPython.execute("forward(100)")
 */
codelangPython.execute = (code) => {
	Sk.configure({
		output: (text) => {
			const outputEl = $e.ui.element.querySelector("#toolbox-io-output");
			outputEl.textContent += text;
			$e.ui.switchToolboxMode("io");
		},
		read: (x) => {
			if (Sk.builtinFiles?.["files"]?.[x] !== undefined) return Sk.builtinFiles["files"][x];
			throw "File not found: '" + x + "'";
		},
		__future__: Sk.python3,
	});

	codelangPython.setupBuiltins();

	return Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true));
};

/**
 * Builds a Skulpt built-in function wrapping a JavaScript drawing/API function.
 * Async JS functions (those returning a Promise) are exposed via Skulpt suspensions
 * so Python code awaits them transparently.
 * @private
 * @param {String} funcName Name of the global JS function to wrap
 * @return {Sk.builtin.func} Skulpt callable
 * @example Sk.builtins["forward"] = codelangPython.createBuiltin("forward")
 */
codelangPython.createBuiltin = (funcName) => {
	const jsFn = window[funcName];
	return new Sk.builtin.func(function() {
		if ($e.execution.current.kill) throw "executionKilled";

		// Convert Python arguments to JavaScript values
		const jsArgs = Array.from(arguments).map(arg => {
			if (arg === undefined || arg === Sk.builtin.none.none$) return undefined;
			try { return Sk.ffi.remapToJs(arg); } catch(e) { return undefined; }
		});

		let result;
		try {
			result = jsFn(...jsArgs);
		} catch(err) {
			// Re-throw codeError objects and regular errors so Skulpt wraps them in ExternalError
			throw err instanceof Error ? err : (typeof err === "object" ? Object.assign(new Error(err.text || String(err)), err) : new Error(String(err)));
		}

		// Async JS functions return Promises — wrap in a Skulpt suspension
		if (result instanceof Promise) {
			const susp = new Sk.misceval.Suspension();
			susp.resume = function() {
				if ($e.execution.current.kill) throw "executionKilled";
				return Sk.builtin.none.none$;
			};
			susp.data = { type: "Sk.promise", promise: result };
			return susp;
		}

		if ($e.execution.current.kill) throw "executionKilled";
		if (result !== undefined && result !== null) {
			try { return Sk.ffi.remapToPy(result); } catch(e) { return Sk.builtin.none.none$; }
		}
		return Sk.builtin.none.none$;
	});
};

/**
 * Registers all eSeeCode instruction functions as Skulpt Python built-ins.
 * Called once per execution so fresh wrappers are created after precode may
 * have added custom instructions to window[funcName].
 * @private
 * @example codelangPython.python.setupBuiltins()
 */
codelangPython.setupBuiltins = () => {
	Object.values($e.instructions.set).forEach(instruction => {
		if (instruction.isAlias) return;
		const funcName = instruction.name;
		if (typeof window[funcName] !== "function") return;
		Sk.builtins[funcName] = codelangPython.createBuiltin(funcName);
	});
};

/**
 * Translates a Skulpt exception into the existing eSeeCode error display.
 * Silently returns when execution was killed intentionally.
 * @private
 * @param {*} err Error thrown by Skulpt's asyncToPromise
 * @example codelangPython.handleError(err)
 */
codelangPython.handleError = (err) => {
	if ($e.execution.current.kill) return;
	if (!err) return;

	// Unwrap ExternalError to get the original JS exception
	const inner = err?.nativeError ?? err;

	if (inner === "executionKilled") return;

	if (inner?.type === "codeError") {
		// eSeeCode codeError thrown from inside a built-in — reuse existing display
		$e.execution.showResults(inner);
		return;
	}

	let message = "";
	let lineNumber;

	if (err.traceback?.length > 0) {
		lineNumber = err.traceback[err.traceback.length - 1].lineno;
	}

	message = (typeof err.toString === "function") ? err.toString() : String(err);

	if (lineNumber) {
		$e.ui.highlight(lineNumber, "error");
		if ($e.modes.views.current.type === "write") {
			$e.session.editor.gotoLine(lineNumber, 0, true);
		}
	}

	$e.ui.msgBox.open(message, { classes: ["error", "monospace"] });
};

/**
 * Full Python execution path: runs precode as JavaScript, user code via Skulpt,
 * and postcode as JavaScript.  Called by $e.execution.execute() when
 * $e.execution.codelang.current === "python" and the current view is "write".
 * @private
 * @param {String} code Python source code (from the editor)
 * @param {Boolean} immediate Skip breakpoints / animation delays
 * @param {Boolean} skipAnimation Skip drawing animations
 * @example await codelangPython.run(code, false, false)
 */
codelangPython.run = async (code, immediate, skipAnimation) => {
	const oldWindowProperties = Object.getOwnPropertyNames(window);
	$e.execution.traceInject();

	// Build and eval precode (still JavaScript / eSeeCode language)
	let precodeJs = "\"use strict\";(async function() {";
	const instructions = Object.values($e.instructions.set);
	if ($e.execution.precode || instructions.some(d => d.run && !d.isAlias)) {
		let customInstructionsCode = "";
		instructions.forEach(instruction_details => {
			if (!instruction_details || !instruction_details.run || instruction_details.isAlias) return;
			customInstructionsCode += "\nfunction " + instruction_details.name + "(";
			if (instruction_details.parameters) {
				let parameters_text = "";
				Object.values(instruction_details.parameters).forEach(p => {
					if (!p || !p.name) return;
					parameters_text += (parameters_text ? ", " : "") + p.name;
				});
				customInstructionsCode += parameters_text;
			}
			customInstructionsCode += "){\n" +
				(instruction_details.single ? "$e.execution.current.programCounterDisabled = true;" : "") +
				(!instruction_details.animate ? "var original_delay = $e.api.getInstructionsDelay();$e.api.setInstructionsDelay(0);" : "") +
				instruction_details.run +
				(!instruction_details.animate ? ";$e.api.setInstructionsDelay(original_delay);" : "") +
				(instruction_details.single ? ";$e.execution.current.programCounterDisabled = false;" : "") +
				"}\n";
		});
		const real_precode = $e.execution.code2run(customInstructionsCode + $e.execution.precode, { inject: false, inline: true, realcode: true });
		precodeJs += "$e.execution.current.precode.running=true;" + real_precode + ";";
	}
	precodeJs += "})();";

	try {
		await eval(precodeJs);
	} catch(e) {
		$e.execution.updateStatus("stopped");
		$e.execution.traceRestore();
		return;
	}

	if ($e.execution.current.kill) {
		$e.execution.traceRestore();
		return;
	}

	// Execute Python user code via Skulpt
	$e.execution.current.animate = !skipAnimation;
	$e.execution.current.usercode.running = true;
	$e.execution.initProgramCounter();
	$e.execution.updateStatus("running");

	try {
		await codelangPython.execute(code);
		$e.execution.showResults();
	} catch(err) {
		codelangPython.handleError(err);
	}

	$e.execution.current.usercode.running = false;

	if ($e.execution.current.kill) {
		$e.execution.traceRestore();
		$e.execution.updateSandboxChanges(oldWindowProperties, Object.getOwnPropertyNames(window));
		return;
	}

	// Run postcode (still JavaScript / eSeeCode language)
	if ($e.execution.postcode) {
		let postcodeJs = "\"use strict\";(async function() {";
		const real_postcode = $e.execution.code2run($e.execution.postcode, { realcode: true });
		postcodeJs += "$e.execution.current.postcode.running=true;" + real_postcode + ";$e.execution.current.postcode.running=false;";
		postcodeJs += "})();";
		try {
			await eval(postcodeJs);
		} catch(e) {
			$e.execution.updateStatus("stopped");
		}
	}

	$e.execution.updateStatus("finished");
	$e.execution.current.animate = false;
	$e.execution.traceRestore();
	$e.execution.updateSandboxChanges(oldWindowProperties, Object.getOwnPropertyNames(window));
};
