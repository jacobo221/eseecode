"use strict";

(function(parser) {
	var ast = parser.ast;

	function injectCode(options, lineNumber, inline) {
		var str = "";
		if (!options.inject) return str;
		if (inline !== true) {
			str += ";";
		}
		str += "await $e_eseeCodeInjection("+lineNumber+",(function(){" +
			"if ($_eseecode.session.breakpoints["+lineNumber+"]) {" +
				"for (var watch in $_eseecode.session.breakpoints["+lineNumber+"].watches) {" +
					"try {" +
						"$_eseecode.session.breakpoints["+lineNumber+"].watches[watch] = eval(watch);" +
					"} catch(e) {}" +
				"}" +
			"}" +
			"$_eseecode.execution.watchpointsChanged = [];" +
			"for (var watch in $_eseecode.session.watchpoints) {" +
				"try {" +
					"var newValue;" +
					"newValue = eval(watch);" +
					"if (newValue !== $_eseecode.session.watchpoints[watch].value) {" +
						"$_eseecode.session.watchpoints[watch].value = newValue;" +
						"$_eseecode.execution.watchpointsChanged.push(watch);" +
					"}" +
				"} catch(e) {}" +
			"}" +
		"}()),"+inline+")";
		if (inline !== true) {
			str += ";";
		}
		return str;
	}

	function needBrackets(parentToken, childToken, childPrecedesParent) {
		var firstOp = parentToken.operator;
		if ((parentToken.type == "UnaryExpression") &&
		    (parentToken.operator == "-" || parentToken.operator == "+")) {
			 firstOp += "unary";
		}
		var secondOp = childToken.operator;
		if ((childToken.type == "UnaryExpression") &&
		    (childToken.operator == "-" || childToken.operator == "+")) {
			 secondOp += "unary";
		}
		var nonCommutative = [ "-" , "/" , "%" ];
		if (!childPrecedesParent && childToken.type == "BinaryExpression") {
			for (var i=0; i<nonCommutative.length; i++) {
				if (firstOp == nonCommutative[i]) {
					return true;
				}
			}
		}
		var precedence = new Array(  // from less to most preferent
			new Array("=","+=","-=","*=","/=","%=","<<=",">>=",">>>=","&=","^=","|="),
			"||",
			"&&",
			"|",
			"^",
			"&",
			new Array("<","<=",">",">=","in","instanceof"),
			new Array("<<",">>",">>>"),
			new Array("+","-"),
			new Array("*","/","%"),
			new Array("!","~","+unary","-unary","typeof","void","delete"),
			new Array("++","--")
		);
		var firstPos = precedence.length, secondPos = precedence.length;
		for (var i=0;i<precedence.length;i++) {
			for (var j=0;j<precedence[i].length;j++) {
				if (firstOp === precedence[i][j]) {
					firstPos = i;
				}
				if (secondOp === precedence[i][j]) {
					secondPos = i;
				}
			}
		}
		return firstPos > secondPos;
	}

	function isFunctionComment(elements, i) {
		var itIs = false;
		for (i = i+1; i < elements.length; i++) {
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

	ast.ProgramNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		if (!options) options = {};
		var elements = this.body;
		var str = "";
		var unparsedLines = [];
		// First dump all FunctionDeclaration's to comply with "use strict"...
		for (var i = 0, len = elements.length; i < len; i++) {
			if (elements[i].type === "FunctionDeclaration" || (elements[i].type === "Comment" && isFunctionComment(elements, i))) {
				str += elements[i].makeWrite(level, indent, indentChar, options);
				if (!options.inline) str += "\n";
			} else {
				unparsedLines.push(i);
			}
		}
		// ...Then dump the rest of the code
		for (var i = 0, len = unparsedLines.length; i < len; i++) {
			var line = unparsedLines[i];
			str += elements[line].makeWrite(level, indent, indentChar, options);
			if (!options.inline) str += "\n";
			else str += ";";
		}
		str += injectCode(options, this.loc.end.line);
		if (options.inject) str += ";$e_endExecution();"; // Finish stepped/breakpointed execution
		return str;
	};

	ast.EmptyStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		return indent;
	};

	ast.BlockStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var statements = this.body;
		var str = "";
		var newIndent = "";
		if (indentChar && !options.realcode) newIndent = indent + indentChar;

		for (var i = 0, len = statements.length; i < len; i++) {
			str += statements[i].makeWrite(level, newIndent, indentChar, options);
			if (!options.inline) str += "\n";
			else str += ";";
		}

		return str;
	};

	ast.ExpressionStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += injectCode(options,this.loc.start.line);
		str += this.expression.makeWrite(level, indent, indentChar, options);
		return str;
	};

	ast.IfStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "if (";
		if (options.inject) {
			str += injectCode(options,this.loc.start.line,true) + (options.inject ? " || (" : "");
		}
		str += this.test.makeWrite(level, "", "", options);
		if (options.inject) str += ")";
		str += ") {";
		if (!options.inline) str += "\n";
		var consequent = this.consequent;
		var alternate = this.alternate;

		if (consequent.type === "BlockStatement") {
			str += consequent.makeWrite(level, indent, indentChar, options);
		} else {
			str += consequent.makeWrite(level, indent + indentChar, indentChar, options);
			if (!options.inline) str += "\n";
		}
		if (alternate !== null) {
			if (alternate.type !== "IfStatement") {
				if (indent && !options.realcode) str += indent;
				str += "} else ";
				if (options.inject) {
					// We need to add "|| true", otherwise we never enter the else. The code will anyway only be run when the else is evaluated
					str += "if ("+injectCode(options,consequent.loc.end.line,true)+" || true) ";
				}
				str +="{";
				if (!options.online) str += "\n";
				str += alternate.makeWrite(level, indent, indentChar, options);
				if (indent && !options.realcode) str += indent;
				str += "}";
			} else {
				 // else if
				if (indent && !options.realcode) str += indent;
				str += "} else ";
				str += alternate.makeWrite(level, indent, indentChar, options);
			}
		} else {
			if (indent && !options.realcode) str += indent;
			str += "}";
		}
		return str;
	};

	ast.LabeledStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += this.label.makeWrite(level, "", "", options) + ": " + this.body.makeWrite(level, "", "", options);
	};

	ast.BreakStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "break";
		var label = this.label;

		if (label !== null) {
			str += " " + label.makeWrite(level, "", "", options);
		}

		return str;
	};

	ast.ContinueStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = indent + "continue";
		var label = this.label;

		if (label !== null) {
			str += " " + label.makeWrite(level, "", "", options);
		}

		return str;
	};

	ast.WithStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "with (" + this.object.makeWrite(level, "", "", options) + ") {";
		if (!options.inline) str += "\n";
		if (this.body.type === "BlockStatement") {
			str += this.body.makeWrite(level, indent, indentChar, options);
		} else {
			str += this.body.makeWrite(level, indent + indentChar, indentChar, options);
			if (!options.inline) str += "\n";
		}
		if (indent && !options.realcode) str += indent;
		str += "}";
		return str;
	};

	ast.SwitchStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		 str += "switch (";
		if (options.inject) {
			str += injectCode(options,this.loc.start.line,true)+" || (";
		}
		str += this.discriminant.makeWrite(level, "", "", options);
		if (roptions.inject) {
			str += ")";
		}
		str += ") {";
		if (!options.inline) str += "\n";
		var cases = this.cases;
		var newIndent = "";
		if (indentChar && !options.realcode) newIndent = indent + indentChar;

		for (var i = 0, len = cases.length; i < len; i++) {
			str += cases[i].makeWrite(level, newIndent, indentChar, options);
		}

		if (!options.realcode) str += indent;
		str += "}";
		return str;
	};

	ast.ReturnStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		if (options.inject) str += injectCode(options,this.loc.start.line);
		str += "return";
		var argument = this.argument;

		if (argument !== null) {
			str += " " + argument.makeWrite(level, "", "", options);
		}

		return str;
	};

	ast.ThrowStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "throw";
		var argument = this.argument;

		if (argument !== null) {
			str += " " + argument.makeWrite(level, "", "", options);
		}

		return str;
	};

	ast.TryStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		if (options.inject) str += injectCode(options,this.loc.start.line);
		str += "try {";
		if (!options.inline) str += "\n";
		var handlers = this.handlers;
		var finalizer = this.finalizer;
		str += this.block.makeWrite(level, indent, indentChar, options);
		if (indent && !options.realcode) str += indent;
		str += "} ";

		if (handlers !== null) {
			str += handlers.makeWrite(level, indent, indentChar, options);
		}
		if (finalizer !== null) {
			str += "finally {";
			if (options.inject) str += injectCode(options,(handlers || this.block).loc.end.line);
			if (!options.inline) str += "\n";
			str += finalizer.makeWrite(level, indent, indentChar, options);
			if (indent && !options.realcode) str += indent;
			str += "} ";
		}
		return str;
	};

	ast.WhileStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "while (";
		if (options.inject) {
			str += injectCode(options,this.loc.start.line,true)+" || (";
		}
		str += this.test.makeWrite(level, "", "", options);
		if (options.inject) {
			str += ")";
		}
		str += ") {";
		if (!options.inline) str += "\n";
		var body = this.body;

		if (body.type === "BlockStatement") {
			str += body.makeWrite(level, indent, indentChar, options);
		} else {
			str += body.makeWrite(level, indent + indentChar, indentChar, options);
			if (!options.inline) str += "\n";
		}
		if (indent && !options.realcode) str += indent;
		str += "} ";

		return str;
	};

	ast.RepeatStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		var condition = this.test.makeWrite(level, "", "", options);
		if (options.realcode) {
			var internalCounter = "repeatCount"+(Math.floor(Math.random()*1000000000));
			str += "$e_pushRepeatCount(repeatCount);";
			str += "for (var repeatCount=0,"+internalCounter+"=0;";
			if (options.inject) {
				str += injectCode(options,this.loc.start.line,true) + " || (";
			}
			str += internalCounter+"<"+condition;
			if (options.inject) str += ")";
			str += ";"+internalCounter+"++,repeatCount="+internalCounter+") {";
			if (!options.inline) str += "\n";
		} else {
			str += "repeat (" + condition + ") {";
			if (!options.inline) str += "\n";
		}
		var body = this.body;

		if (body.type === "BlockStatement") {
			str += body.makeWrite(level, indent, indentChar, options);
		} else {
			str += body.makeWrite(level, indent + indentChar, indentChar, options);
			if (!options.inline) str += "\n";
		}
		if (indent && !options.realcode) str += indent;
		str += "}";
		if (options.realcode) {
			str += "repeatCount=$e_popRepeatCount();"; // We restore the parent repeat()'s repeatCount value'
		}

		return str;
	};

	ast.FillStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		var colors = this.color.makeWrite(level, "", "", options);
		var fillColor, borderColor;
		if (this.color.type == "SequenceExpression") {
			fillColor = this.color.expressions[0].makeWrite(level, "", "", options);
			borderColor = this.color.expressions[1].makeWrite(level, "", "", options);
		} else {
			fillColor = borderColor = this.color.makeWrite(level, "", "", options);
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
			str += body.makeWrite(level, indent, indentChar, options);
		} else {
			str += body.makeWrite(level, indent + indentChar, indentChar, options);
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

	ast.DoWhileStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		if (options.inject) str += injectCode(options,this.loc.start.line);
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "do {";
		if (!options.inline) str += "\n";
		str += this.body.makeWrite(level, indent, indentChar, options);
		str += indent + "} while (";
		if (options.inject) {
			str += injectCode(options,this.body.loc.end.line,true)+" || (";
		}
		str += this.test.makeWrite(level, "", "", options);
		if (options.inject) {
			str += ")";
		}
		str += ")";
		return str;
	};

	ast.ForStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		var init = this.init;
		var test = this.test;
		var update = this.update;
		var body = this.body;

		str += "for (";
		if (init !== null) {
			if (typeof(init.type) === "undefined") {
				str += "var ";

				for (var i = 0, len = init.length; i < len; i++) {
					if (i !== 0)
						str += ", ";

					str += init[i].makeWrite(level, "", "", options);
				}
			} else {
				str += init.makeWrite(level, "", "", options);
			}
		}

		str += "; ";
		if (options.inject) {
			str += injectCode(options,this.loc.start.line,true)+" || (";
		}

		if (test !== null) {
			str += test.makeWrite(level, "", "", options);
		}

		if (options.inject) {
			str += ")";
		}
		str += "; ";

		if (update != null) {
			str += update.makeWrite(level, "", "", options);
		}

		str += ") {";
		if (!options.inline) str += "\n";
		str += body.makeWrite(level, indent + indentChar, indentChar, options);
		if (indent && !options.realcode) str += indent;
		str += "}";

		return str;
	};

	ast.ForInStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "for (";
		var left = this.left;
		var body = this.body;
		if (left !== null) {
			if (left.type === "VariableDeclarator") {
				str += "var " + left.makeWrite(level, "", "", options);
			} else {
				str += left.makeWrite(level, "", "", options);
			}
		}
		str += " in " + this.right.makeWrite(level, "", "", options) + ") {";
		str += injectCode(options,this.loc.start.line);
		if (!options.inline) str += "\n";
		str += body.makeWrite(level, indent + indentChar, indentChar, options);
		if (!options.inline) str += "\n";
		if (indent && !options.realcode) str += indent;
		str += "}";
		return str;
	};

	ast.DebugggerStatementNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += "debugger";
		return str;
	};

	ast.FunctionDeclarationNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		var name = this.id.makeWrite(level, "", "", options);
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

		for (var i = 0, len = params.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}

			str += params[i].makeWrite(level, newIndent, indentChar, options);
		}

		str += ") {";
		str += injectCode(options,this.loc.start.line);
		if (!options.inline) str += "\n";

		for (var i = 0, len = body.length; i < len; i++) {
			str += body[i].makeWrite(level, newIndent, indentChar, options);
			if (!options.inline) str += "\n";
			else str += ";";
		}

		if (indent && !options.realcode) str += indent;
		str += "}";
		if (!options.inject) str += "\n";
		return str;
	};

	ast.VariableDeclarationNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		str += injectCode(options,this.loc.start.line);
		var type = this.kind;
		if (options.realcode && type === "array") {
			str += "var ";
		} else {
			str += this.kind + " ";
		}
		var declarations = this.declarations;

		for (var i = 0, len = declarations.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}

			var declaration = declarations[i].makeWrite(level, "", "", options);
			str += declaration;
			if (options.realcode && type === "array" && declaration.indexOf("=") < 0) {
				str += " = []";
			}
		}

		return str;
	};

	ast.VariableDeclaratorNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = this.id.makeWrite(level, "", "", options);
		var init = this.init;

		if (init !== null) {
			str += " = " + init.makeWrite(level, "", "", options);
		}

		return str;
	};

	ast.ThisExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		return "this";
	};

	ast.ArrayExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "[";
		var elements = this.elements;

		for (var i = 0, len = elements.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}

			str += elements[i].makeWrite(level, "", "", options);
		}

		return str + "]";
	};

	ast.ObjectExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "{";
		var properties = this.properties;

		for (var i = 0, len = properties.length; i < len; i++) {
			var prop = properties[i];
			var kind = prop.kind;
			var key = prop.key;
			var value = prop.value;

			if (i !== 0) {
				str += ", ";
			}

			if (kind === "init") {
				str += key.makeWrite(level, "", "") + ": " + value.makeWrite(level, "", "", options);
			} else {
				var params = value.params;
				var body = value.body;

				str += kind + " " + key.makeWrite(level, "", "", options) + "(";

				for (var j = 0, plen = params.length; j < plen; j++) {
					if (j !== 0) {
						str += ", ";
					}

					str += params[j].makeWrite(level, "", "", options);
				}

				str += ") { ";

				for (var j = 0, blen = body.length; j < blen; j++) {
					str += body[j].makeWrite(level, "", "", options) + " ";
				}

				str += "}";
			}
		}

		return str + "}";
	};

	ast.FunctionExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "(" + (options.realcode ? "async " : "") + "function";
		var id = this.id;
		var params = this.params;
		var body = this.body;
		indentChar = "\t";
		var newIndent = "";
		if (!options.realcode) newIndent = indent + indentChar;

		if (id !== null) {
			str += " " + id.makeWrite(level, "", "", options);
		}

		str += "(";

		for (var i = 0, len = params.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}

			str += params[i].makeWrite(level, newIndent, indentChar, options);
		}

		str += ") {";
		str += injectCode(options,this.loc.start.line);
		if (!options.inline) str += "\n";

		for (var i = 0, len = body.length; i < len; i++) {
			str += body[i].makeWrite(level, newIndent, indentChar, options);
			if (!options.inline) str += "\n";
			else str += ";";
		}

		return str + "})";
	};

	ast.SequenceExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		var expressions = this.expressions;

		for (var i = 0, len = expressions.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}

			str += expressions[i].makeWrite(level, "", "", options);
		}

		return str;
	};

	ast.UnaryExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = this.operator;
		if ((this.operator === "delete" || this.operator === "void" || this.operator === "typeof") ||
		     (needBrackets(this, this.argument))) {
			str += "(" + this.argument.makeWrite(level, "", "", options) + ")";
		} else {
			str += this.argument.makeWrite(level, "", "", options);
		}
		return str;
	};

	ast.BinaryExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (needBrackets(this,this.left,true)) {
			str += "(" + this.left.makeWrite(level, "", "", options) + ")";
		} else {
			str += this.left.makeWrite(level, "", "", options);
		}
		str += " " + this.operator + " ";
		if (needBrackets(this,this.right)) {
			str += "(" + this.right.makeWrite(level, "", "", options) + ")";
		} else {
			str += this.right.makeWrite(level, "", "", options);
		}
		return str;
	};

	ast.AssignmentExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = this.left.makeWrite(level, "", "", options) + " " + this.operator + " ";
		if (needBrackets(this,this.right)) {
			str += "(" + this.right.makeWrite(level, "", "", options) + ")";
		} else {
			str += this.right.makeWrite(level, "", "", options);
		}
		return str;
	};

	ast.UpdateExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = this.argument.makeWrite(level, "", "", options);
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

	ast.LogicalExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (needBrackets(this,this.left,true)) {
			str += "(" + this.left.makeWrite(level, "", "", options) + ")";
		} else {
			str += this.left.makeWrite(level, "", "", options);
		}
		var operator = this.operator;
		var real_operator = operator;
		if (this.operator == "and") real_operator = "&&";
		else if (this.operator == "or") real_operator = "||";
		if (options.realcode) {
			str += " " + real_operator + " ";
		} else {
			str += " " + operator + " ";
		}
		if (needBrackets(this,this.right)) {
			str += "(" + this.right.makeWrite(level, "", "", options) + ")";
		} else {
			str += this.right.makeWrite(level, "", "", options);
		}
		return str;
	};

	ast.ConditionalExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		return this.test.makeWrite(level, "", "", options) + " ? " + this.consequent.makeWrite(level, "", "", options) + " : " + this.alternate.makeWrite(level, "", "", options);
	};

	ast.NewExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "new " + this.callee.makeWrite(level, "", "", options);
		var args = this.arguments;

		if (args !== null) {
			str += "(";

			for (var i = 0, len = args.length; i < len; i++) {
				if (i !== 0) {
					str += ", ";
				}

				str += args[i].makeWrite(level, "", "", options);
			}

			str += ")";
		}

		return str;
	};

	ast.CallExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		let callee = this.callee.makeWrite(level, "", "", options);
		var str = (options.realcode ? "await " : "") + callee + "(";
		var args = this.arguments;

		for (var i = 0, len = args.length; i < len; i++) {
			if (i !== 0) {
				str += ", ";
			}
			str += args[i].makeWrite(level, "", "", options);
		}

		return str + ")";
	};

	ast.MemberExpressionNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		if (this.computed) {
			return this.object.makeWrite(level, "", "", options) + "[" + this.property.makeWrite(level, "", "", options) + "]";
		} else {
			return this.object.makeWrite(level, "", "", options) + "." + this.property.makeWrite(level, "", "", options);
		}
	};

	ast.SwitchCaseNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var str = "";
		if (indent && !options.realcode) str += indent;
		var test = this.test;
		var consequent = this.consequent;
		var newIndent = "";
		if (!options.realcode) newIndent = indent + indentChar;

		if (test !== null) {
			str += "case " + test.makeWrite(level, "", "", options) + ":";
			if (!options.inline) str += "\n";
		} else {
			str += "default:";
			if (!options.inline) str += "\n";
		}

		for (var i = 0, len = consequent.length; i < len; i++) {
			str += consequent[i].makeWrite(level, newIndent, indentChar, options);
			if (!options.inline) str += "\n";
		}

		return str;
	};

	ast.CatchClauseNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		var name = this.param.makeWrite(level, "", "", options);
		var str = "";
		if (options.realcode) {
			str += "catch (" + name + ") { if ("+name+".indexOf(\"$_eseecode_\") === 0) { throw "+name+";};";
		} else {
			str += "catch (" + name + ") {";
		}
		str += injectCode(options,this.loc.start.line);
		if (!options.inline) str += "\n";

		str += this.body.makeWrite(level, indent, indentChar, options);
		if (indent && !options.realcode) str += indent;
		str += "} ";
		return str;
	};

	ast.IdentifierNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		return this.name;
	};

	ast.CommentNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		if (this.kind === "/*") {
			var lines = this.body.split(/\r?\n/);
			if (lines.length > 1) {
				var str = "";
				if (indent && !options.realcode) str +=indent;
				str += "/*";
				if (!options.inline) str += "\n";
				var line = lines[0].substr(2).replace(/\r?\n/,"").trim();
				if (line.length > 0) {
					if (indent && !options.realcode) str += indent;
					str += "   " + line;
					if (!options.inline) str += "\n";
				}
				for (var i=1; i<lines.length-1; i++) {
					if (indent && !options.realcode) str += indent;
					str += "   "+lines[i].trim();
					if (!options.inline) str += "\n";
				}
				line = lines[lines.length-1].trim().slice(0,-2).trim();
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

	ast.LiteralNode.prototype.makeWrite = function(level, indent, indentChar, options) {
		return this.value;
	};
})(eseecodeLanguage);
