"use strict";

(function(parser) {
	var ast = parser.ast;

	function needBrackets(parentToken, childToken, childPrecedesParent) {
		let firstOp = parentToken.operator;
		if ((parentToken.type == "UnaryExpression") &&
		    (parentToken.operator == "-" || parentToken.operator == "+")) {
			 firstOp += "unary";
		}
		let secondOp = childToken.operator;
		if ((childToken.type == "UnaryExpression") &&
		    (childToken.operator == "-" || childToken.operator == "+")) {
			 secondOp += "unary";
		}
		const nonCommutative = [ "-" , "/" , "%" ];
		if (!childPrecedesParent && childToken.type == "BinaryExpression") {
			if (nonCommutative.some(v => v == firstOp)) return true;
		}
		const precedence = new Array(  // from less to most preferent
			new Array("=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "&=", "^=", "|="),
			"||",
			"&&",
			"|",
			"^",
			"&",
			new Array("<", "<=", ">", ">=", "in", "instanceof"),
			new Array("<<", ">>", ">>>"),
			new Array("+", "-"),
			new Array("*", "/", "%"),
			new Array("!", "~", "+unary", "-unary", "typeof", "void", "delete"),
			new Array("++", "--"),
		);
		let firstPos = precedence.length, secondPos = precedence.length;
		for (let i = 0; i < precedence.length; i++) {
			for (let j = 0; j < precedence[i].length; j++) {
				if (firstOp === precedence[i][j]) firstPos = i;
				if (secondOp === precedence[i][j]) secondPos = i;
			}
		}
		return firstPos > secondPos;
	}

	function isFunctionComment(elements, i) {
		let itIs = false;
		for (i = i + 1; i < elements.length; i++) {
			if (elements[i].type !== "Comment") {
				if (elements[i].type === "FunctionDeclaration") {
					itIs = true;
				} else {
					itIs = false;
				}
				break;
			}
		}
		return itIs;
	}

	ast.ProgramNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var elements = this.body;
		var str = "";
		var unparsedLines = [];
		// First dump all FunctionDeclaration's to comply with "use strict"...
		for (let i = 0, len = elements.length; i < len; i++) {
			if (elements[i].type === "FunctionDeclaration" || (elements[i].type === "Comment" && isFunctionComment(elements, i))) {
				str += elements[i].makeWrite(indent, indentChar, options);
				if (!options.inline) str += "\n";
			} else {
				unparsedLines.push(i);
			}
		}
		// ...Then dump the rest of the code
		for (let i = 0, len = unparsedLines.length; i < len; i++) {
			var line = unparsedLines[i];
			str += elements[line].makeWrite(indent, indentChar, options);
			if (!options.inline) str += "\n";
			else str += ";";
		}
		str += $e.execution.injectCode(options, this.loc.end.line);
		if (options.inject) str += ";$e.execution.end();"; // Finish execution
		return str;
	};

	ast.EmptyStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		return indent;
	};

	ast.BlockStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var statements = this.body;
		var str = "";
		var newIndent = "";
		if (indentChar && !options.realcode) newIndent = indent + indentChar;

		for (let i = 0, len = statements.length; i < len; i++) {
			str += statements[i].makeWrite(newIndent, indentChar, options);
			if (!options.inline) str += "\n";
			else str += ";";
		}

		return str;
	};

	ast.ExpressionStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += $e.execution.injectCode(options, this.loc.start.line);
		str += this.expression.makeWrite(indent, indentChar, options);
		return str;
	};

	ast.IfStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "if (";
		if (options.inject) {
			str += $e.execution.injectCode(options, this.loc.start.line, true) + (options.inject ? " || (" : "");
		}
		str += this.test.makeWrite("", "", options);
		if (options.inject) str += ")";
		str += ") {";
		if (!options.inline) str += "\n";
		var consequent = this.consequent;
		var alternate = this.alternate;

		if (consequent.type === "BlockStatement") {
			str += consequent.makeWrite(indent, indentChar, options);
		} else {
			str += consequent.makeWrite(indent + indentChar, indentChar, options);
			if (!options.inline) str += "\n";
		}
		if (alternate !== null) {
			if (alternate.type !== "IfStatement") {
				if (indent && !options.realcode) str += indent;
				str += "} else ";
				if (options.inject) {
					// We need to add "|| true", otherwise we never enter the else. The code will anyway only be run when the else is evaluated
					str += "if ("+$e.execution.injectCode(options, consequent.loc.end.line, true)+" || true) ";
				}
				str +="{";
				if (!options.online) str += "\n";
				str += alternate.makeWrite(indent, indentChar, options);
				if (indent && !options.realcode) str += indent;
				str += "}";
			} else {
				 // else if
				if (indent && !options.realcode) str += indent;
				str += "} else ";
				str += alternate.makeWrite(indent, indentChar, options);
			}
		} else {
			if (indent && !options.realcode) str += indent;
			str += "}";
		}
		return str;
	};

	ast.LabeledStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += this.label.makeWrite("", "", options) + ": " + this.body.makeWrite("", "", options);
	};

	ast.BreakStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "break";
		var label = this.label;

		if (label !== null) {
			str += " " + label.makeWrite("", "", options);
		}

		return str;
	};

	ast.ContinueStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = indent + "continue";
		var label = this.label;

		if (label !== null) {
			str += " " + label.makeWrite("", "", options);
		}

		return str;
	};

	ast.WithStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "with (" + this.object.makeWrite("", "", options) + ") {";
		if (!options.inline) str += "\n";
		if (this.body.type === "BlockStatement") {
			str += this.body.makeWrite(indent, indentChar, options);
		} else {
			str += this.body.makeWrite(indent + indentChar, indentChar, options);
			if (!options.inline) str += "\n";
		}
		if (indent && !options.realcode) str += indent;
		str += "}";
		return str;
	};

	ast.SwitchStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		 str += "switch (";
		if (options.inject) {
			str += $e.execution.injectCode(options, this.loc.start.line, true)+" || (";
		}
		str += this.discriminant.makeWrite("", "", options);
		if (roptions.inject) {
			str += ")";
		}
		str += ") {";
		if (!options.inline) str += "\n";
		var cases = this.cases;
		var newIndent = "";
		if (indentChar && !options.realcode) newIndent = indent + indentChar;

		for (let i = 0, len = cases.length; i < len; i++) {
			str += cases[i].makeWrite(newIndent, indentChar, options);
		}

		if (!options.realcode) str += indent;
		str += "}";
		return str;
	};

	ast.ReturnStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		if (options.inject) str += $e.execution.injectCode(options, this.loc.start.line);
		str += "return";
		var argument = this.argument;

		if (argument !== null) {
			str += " " + argument.makeWrite("", "", options);
		}

		return str;
	};

	ast.ThrowStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "throw";
		var argument = this.argument;

		if (argument !== null) {
			str += " " + argument.makeWrite("", "", options);
		}

		return str;
	};

	ast.TryStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		if (options.inject) str += $e.execution.injectCode(options, this.loc.start.line);
		str += "try {";
		if (!options.inline) str += "\n";
		var handlers = this.handlers;
		var finalizer = this.finalizer;
		str += this.block.makeWrite(indent, indentChar, options);
		if (indent && !options.realcode) str += indent;
		str += "} ";

		if (handlers !== null) {
			str += handlers.makeWrite(indent, indentChar, options);
		}
		if (finalizer !== null) {
			str += "finally {";
			if (options.inject) str += $e.execution.injectCode(options, (handlers || this.block).loc.end.line);
			if (!options.inline) str += "\n";
			str += finalizer.makeWrite(indent, indentChar, options);
			if (indent && !options.realcode) str += indent;
			str += "} ";
		}
		return str;
	};

	ast.WhileStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "while (";
		if (options.inject) {
			str += $e.execution.injectCode(options, this.loc.start.line, true) + " || (";
		}
		str += this.test.makeWrite("", "", options);
		if (options.inject) {
			str += ")";
		}
		str += ") {";
		if (!options.inline) str += "\n";
		var body = this.body;

		if (body.type === "BlockStatement") {
			str += body.makeWrite(indent, indentChar, options);
		} else {
			str += body.makeWrite(indent + indentChar, indentChar, options);
			if (!options.inline) str += "\n";
		}
		if (indent && !options.realcode) str += indent;
		str += "}";

		return str;
	};

	ast.RepeatStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		var condition = this.test.makeWrite("", "", options);
		if (options.realcode) {
			str += "for (let repeatCount=0;";
			if (options.inject) {
				str += $e.execution.injectCode(options, this.loc.start.line, true) + " || (";
			}
			str += "repeatCount<" + condition;
			if (options.inject) str += ")";
			str += ";repeatCount++) {";
			if (!options.inline) str += "\n";
		} else {
			str += "repeat (" + condition + ") {";
			if (!options.inline) str += "\n";
		}
		var body = this.body;

		if (body.type === "BlockStatement") {
			str += body.makeWrite(indent, indentChar, options);
		} else {
			str += body.makeWrite(indent + indentChar, indentChar, options);
			if (!options.inline) str += "\n";
		}
		if (indent && !options.realcode) str += indent;
		str += "}";

		return str;
	};

	ast.FillStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		var colors = this.color.makeWrite("", "", options);
		var fillColor, borderColor;
		if (this.color.type == "SequenceExpression") {
			fillColor = this.color.expressions[0].makeWrite("", "", options);
			borderColor = this.color.expressions[1].makeWrite("", "", options);
		} else {
			fillColor = borderColor = this.color.makeWrite("", "", options);
		}
		if (options.realcode) {
			str += "beginShape();";
			str += "setColor(" + borderColor + ");";
			if (!options.inline) str += "\n";
		} else {
			str += "fill (" + colors + ") {";
			if (!options.inline) str += "\n";
		}
		var body = this.body;

		if (body.type === "BlockStatement") {
			str += body.makeWrite(indent, indentChar, options);
		} else {
			str += body.makeWrite(indent + indentChar, indentChar, options);
			if (!options.inline) str += "\n";
		}
		if (indent && !options.realcode) str += indent;
		if (options.realcode) {
			str += "setColor(" + fillColor + ");";
			str += "endShape();";
		} else {
			str += "}";
		}

		return str;
	};

	ast.DoWhileStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		if (options.inject) str += $e.execution.injectCode(options, this.loc.start.line);
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "do {";
		if (!options.inline) str += "\n";
		str += this.body.makeWrite(indent, indentChar, options);
		str += indent + "} while (";
		if (options.inject) {
			str += $e.execution.injectCode(options, this.body.loc.end.line, true) + " || (";
		}
		str += this.test.makeWrite("", "", options);
		if (options.inject) {
			str += ")";
		}
		str += ")";
		return str;
	};

	ast.ForStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		var init = this.init;
		var test = this.test;
		var update = this.update;
		var body = this.body;

		str += "for (";
		if (init !== null) {
			if (typeof(init.type) === "undefined") {
				str += "let ";

				for (let i = 0, len = init.length; i < len; i++) {
					if (i !== 0) {
						str += ", ";
					}

					str += init[i].makeWrite("", "", options);
				}
			} else {
				str += init.makeWrite("", "", options);
			}
		}

		str += "; ";
		if (options.inject) {
			str += $e.execution.injectCode(options, this.loc.start.line, true) + " || (";
		}

		if (test !== null) {
			str += test.makeWrite("", "", options);
		}

		if (options.inject) {
			str += ")";
		}
		str += "; ";

		if (update != null) {
			str += update.makeWrite("", "", options);
		}

		str += ") {";
		if (!options.inline) str += "\n";
		str += body.makeWrite(indent + indentChar, indentChar, options);
		if (indent && !options.realcode) str += indent;
		str += "}";

		return str;
	};

	ast.ForInStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "for (";
		var left = this.left;
		var body = this.body;
		if (left !== null) {
			if (left.type === "VariableDeclarator") {
				str += "let " + left.makeWrite("", "", options);
			} else {
				str += left.makeWrite("", "", options);
			}
		}
		str += " in " + this.right.makeWrite("", "", options) + ") {";
		str += $e.execution.injectCode(options, this.loc.start.line);
		if (!options.inline) str += "\n";
		str += body.makeWrite(indent + indentChar, indentChar, options);
		if (!options.inline) str += "\n";
		if (indent && !options.realcode) str += indent;
		str += "}";
		return str;
	};

	ast.DebugggerStatementNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "debugger";
		return str;
	};

	ast.FunctionDeclarationNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		var name = this.id.makeWrite("", "", options);
		if (options.realcode) {
			// This change makes it work with "strict use" inside a try {}
			str += "var "+name+" = async function(";
		} else {
			str += "function " + name + "(";
		}
		var params = this.params;
		var body = this.body;
		var newIndent = "";
		if (indentChar && !options.realcode) newIndent = indent + indentChar;

		for (let i = 0, len = params.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}

			str += params[i].makeWrite(newIndent, indentChar, options);
		}

		str += ") {";
		str += $e.execution.injectCode(options, this.loc.start.line);
		if (!options.inline) str += "\n";

		for (let i = 0, len = body.length; i < len; i++) {
			str += body[i].makeWrite(newIndent, indentChar, options);
			if (!options.inline) str += "\n";
			else str += ";";
		}

		if (indent && !options.realcode) str += indent;
		str += "}";
		if (!options.inject) str += "\n";
		return str;
	};

	ast.VariableDeclarationNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += $e.execution.injectCode(options,this.loc.start.line);
		var type = this.kind;
		if (options.realcode && type === "array") {
			str += "let ";
		} else {
			str += this.kind + " ";
		}
		var declarations = this.declarations;

		for (let i = 0, len = declarations.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}

			var declaration = declarations[i].makeWrite("", "", options);
			str += declaration;
			if (options.realcode && type === "array" && !declaration.includes("=")) {
				str += " = []";
			}
		}

		return str;
	};

	ast.VariableDeclaratorNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = this.id.makeWrite("", "", options);
		var init = this.init;

		if (init !== null) {
			str += " = " + init.makeWrite("", "", options);
		}

		return str;
	};

	ast.ThisExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		return "this";
	};

	ast.ArrayExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "[";
		var elements = this.elements;

		for (let i = 0, len = elements.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}

			str += elements[i].makeWrite("", "", options);
		}

		return str + "]";
	};

	ast.ObjectExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "{";
		var properties = this.properties;

		for (let i = 0, len = properties.length; i < len; i++) {
			var prop = properties[i];
			var kind = prop.kind;
			var key = prop.key;
			var value = prop.value;

			if (i !== 0) {
				str += ", ";
			}

			if (kind === "init") {
				str += key.makeWrite("", "") + ": " + value.makeWrite("", "", options);
			} else {
				var params = value.params;
				var body = value.body;

				str += kind + " " + key.makeWrite("", "", options) + "(";

				for (let j = 0, plen = params.length; j < plen; j++) {
					if (j !== 0) {
						str += ", ";
					}

					str += params[j].makeWrite("", "", options);
				}

				str += ") { ";

				for (let j = 0, blen = body.length; j < blen; j++) {
					str += body[j].makeWrite("", "", options) + " ";
				}

				str += "}";
			}
		}

		return str + "}";
	};

	ast.FunctionExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "(" + (options.realcode ? "async " : "") + "function";
		var id = this.id;
		var params = this.params;
		var body = this.body;
		indentChar = "\t";
		var newIndent = "";
		if (!options.realcode) newIndent = indent + indentChar;

		if (id !== null) {
			str += " " + id.makeWrite("", "", options);
		}

		str += "(";

		for (let i = 0, len = params.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}

			str += params[i].makeWrite(newIndent, indentChar, options);
		}

		str += ") {";
		str += $e.execution.injectCode(options, this.loc.start.line);
		if (!options.inline) str += "\n";

		for (let i = 0, len = body.length; i < len; i++) {
			str += body[i].makeWrite(newIndent, indentChar, options);
			if (!options.inline) str += "\n";
			else str += ";";
		}

		return str + "})";
	};

	ast.SequenceExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		var expressions = this.expressions;

		for (let i = 0, len = expressions.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}

			str += expressions[i].makeWrite("", "", options);
		}

		return str;
	};

	ast.UnaryExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = this.operator;
		if ((this.operator === "delete" || this.operator === "void" || this.operator === "typeof") ||
		     (needBrackets(this, this.argument))) {
			str += "(" + this.argument.makeWrite("", "", options) + ")";
		} else {
			str += this.argument.makeWrite("", "", options);
		}
		return str;
	};

	ast.BinaryExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (needBrackets(this, this.left, true)) {
			str += "(" + this.left.makeWrite("", "", options) + ")";
		} else {
			str += this.left.makeWrite("", "", options);
		}
		str += " " + this.operator + " ";
		if (needBrackets(this, this.right)) {
			str += "(" + this.right.makeWrite("", "", options) + ")";
		} else {
			str += this.right.makeWrite("", "", options);
		}
		return str;
	};

	ast.AssignmentExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = this.left.makeWrite("", "", options) + " " + this.operator + " ";
		if (needBrackets(this, this.right)) {
			str += "(" + this.right.makeWrite("", "", options) + ")";
		} else {
			str += this.right.makeWrite("", "", options);
		}
		return str;
	};

	ast.UpdateExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = this.argument.makeWrite("", "", options);
		if (needBrackets(this, this.argument)) {
			str = "(" + str + ")";
		}
		if (this.prefix) {
			str = this.operator + str;
		} else {
			str = str + this.operator;
		}
		return str;
	};

	ast.LogicalExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (needBrackets(this, this.left, true)) {
			str += "(" + this.left.makeWrite("", "", options) + ")";
		} else {
			str += this.left.makeWrite("", "", options);
		}
		var operator = this.operator;
		var real_operator = operator;
		if (this.operator == "and") real_operator = "&&";
		else if (this.operator == "or") real_operator = "||";
		if (options && options.realcode) {
			str += " " + real_operator + " ";
		} else {
			str += " " + operator + " ";
		}
		if (needBrackets(this, this.right)) {
			str += "(" + this.right.makeWrite("", "", options) + ")";
		} else {
			str += this.right.makeWrite("", "", options);
		}
		return str;
	};

	ast.ConditionalExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		return this.test.makeWrite("", "", options) + " ? " + this.consequent.makeWrite("", "", options) + " : " + this.alternate.makeWrite("", "", options);
	};

	ast.NewExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "new " + this.callee.makeWrite("", "", options);
		var args = this.arguments;

		if (args !== null) {
			str += "(";

			for (let i = 0, len = args.length; i < len; i++) {
				if (i !== 0) {
					str += ", ";
				}

				str += args[i].makeWrite("", "", options);
			}

			str += ")";
		}

		return str;
	};

	ast.CallExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		let callee = this.callee.makeWrite("", "", options);
		var str = (options.realcode ? "await " : "") + callee + "(";
		var args = this.arguments;

		for (let i = 0, len = args.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}
			str += args[i].makeWrite("", "", options);
		}

		return str + ")";
	};

	ast.MemberExpressionNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		if (this.computed) {
			return this.object.makeWrite("", "", options) + "[" + this.property.makeWrite("", "", options) + "]";
		} else {
			return this.object.makeWrite("", "", options) + "." + this.property.makeWrite("", "", options);
		}
	};

	ast.SwitchCaseNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		var test = this.test;
		var consequent = this.consequent;
		var newIndent = "";
		if (!options.realcode) newIndent = indent + indentChar;

		if (test !== null) {
			str += "case " + test.makeWrite("", "", options) + ":";
			if (!options.inline) str += "\n";
		} else {
			str += "default:";
			if (!options.inline) str += "\n";
		}

		for (let i = 0, len = consequent.length; i < len; i++) {
			str += consequent[i].makeWrite(newIndent, indentChar, options);
			if (!options.inline) str += "\n";
		}

		return str;
	};

	ast.CatchClauseNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		var name = this.param.makeWrite("", "", options);
		var str = "";
		if (options.realcode) {
			str += "catch (" + name + ") { if (" + name + ".startsWith(\"$e_\")) { throw " + name + ";};";
		} else {
			str += "catch (" + name + ") {";
		}
		str += $e.execution.injectCode(options, this.loc.start.line);
		if (!options.inline) str += "\n";

		str += this.body.makeWrite(indent, indentChar, options);
		if (indent && !options.realcode) str += indent;
		str += "} ";
		return str;
	};

	ast.IdentifierNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		return this.name;
	};

	ast.CommentNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		let str = "";
		if (this.kind === "/*") {
			var lines = this.body.split(/\r?\n/);
			if (lines.length > 1) {
				if (indent && !options.realcode) str +=indent;
				str += "/*";
				if (!options.inline) str += "\n";
				var line = lines[0].substr(2).replace(/\r?\n/, "").trim();
				if (line.length > 0) {
					if (indent && !options.realcode) str += indent;
					str += "   " + line;
					if (!options.inline) str += "\n";
				}
				for (let i = 1; i < lines.length - 1; i++) {
					if (indent && !options.realcode) str += indent;
					str += "   " + lines[i].trim();
					if (!options.inline) str += "\n";
				}
				line = lines[lines.length - 1].trim().slice(0, -2).trim();
				if (line.length > 0) {
					if (indent && !options.realcode) str += indent;
					str += "   " + line;
					if (!options.inline) str += "\n";
				}
				if (indent && !options.realcode) str += indent;
				str += "*/";
				return str;
			} else {
				if (indent && !options.realcode) str += indent;
				str += this.body.trim();
				return str;
			}
		} else {
			if (indent && !options.realcode) str += indent;
			str += this.body;
			return str;
		}
	};

	ast.LiteralNode.prototype.makeWrite = function(indent, indentChar, options = {}) {
		return this.value;
	};
})(eseecodeLanguage);
