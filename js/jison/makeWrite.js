"use strict";

(function(parser) {
	var ast = parser.ast;

	function realCodeAddition(realCode, lineNumber) {
		var str = "";
		if (realCode) {
			str += ";if($_eseecode.session.breakpoints["+lineNumber+"]){for (var watch in $_eseecode.session.breakpoints["+lineNumber+"]){$_eseecode.session.breakpoints["+lineNumber+"][watch]=eval('if (typeof '+watch+' !== \\'undefined\\') '+watch);}}";
			str += ";checkExecutionLimits("+lineNumber+");";
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

	ast.ProgramNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var elements = this.body;
		var str = "";
		var unparsedLines = [];
		// First dump all FunctionDeclaration's to comply with "use strict"...
		for (var i = 0, len = elements.length; i < len; i++) {
			if (elements[i].type === "FunctionDeclaration" || (elements[i].type === "Comment" && isFunctionComment(elements, i))) {
				str += elements[i].makeWrite(level, indent, indentChar, realCode) + "\n";
			} else {
				unparsedLines.push(i);
			}
		}
		// ...Then dump the rest of the code
		for (var i = 0, len = unparsedLines.length; i < len; i++) {
			var line = unparsedLines[i];
			str += elements[line].makeWrite(level, indent, indentChar, realCode) + "\n";
		}
		return str;
	};

	ast.EmptyStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		return indent;
	};

	ast.BlockStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var statements = this.body;
		var str = "";
		var newIndent = indent + indentChar;

		for (var i = 0, len = statements.length; i < len; i++) {
			str += statements[i].makeWrite(level, newIndent, indentChar, realCode) + "\n";
		}

		return str;
	};

	ast.ExpressionStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + this.expression.makeWrite(level, indent, indentChar, realCode);
		str += realCodeAddition(realCode,this.loc.start.line);
		return str;
	};

	ast.IfStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "if (" + this.test.makeWrite(level, "", "", realCode) + ") {";
		str += realCodeAddition(realCode,this.loc.start.line);
		str += "\n";
		var consequent = this.consequent;
		var alternate = this.alternate;

		if (consequent.type === "BlockStatement") {
			str += consequent.makeWrite(level, indent, indentChar, realCode);
		} else {
			str += consequent.makeWrite(level, indent + indentChar, indentChar, realCode);
		}
		if (alternate !== null) {
			if (alternate.type !== "IfStatement") {
				str += indent + "} else {";
				str += realCodeAddition(realCode,this.loc.start.line);
				str += "\n";
				str += alternate.makeWrite(level, indent, indentChar, realCode);
				str += indent + "}";
			} else {
				 // else if
				str += indent + "} else ";
				str += alternate.makeWrite(level, indent, indentChar, realCode);
			}
		} else {
			str += indent + "}";
		}
		return str;
	};

	ast.LabeledStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		return indent + this.label.makeWrite(level, "", "", realCode) + ": " + this.body.makeWrite(level, "", "", realCode);
	};

	ast.BreakStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "break";
		var label = this.label;

		if (label !== null)
			str += " " + label.makeWrite(level, "", "", realCode);

		return str;
	};

	ast.ContinueStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "continue";
		var label = this.label;

		if (label !== null)
			str += " " + label.makeWrite(level, "", "", realCode);

		return str;
	};

	ast.WithStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "with (" + this.object.makeWrite(level, "", "", realCode) + ") {\n";
		if (this.body.type === "BlockStatement") {
			str += this.body.makeWrite(level, indent, indentChar, realCode);
		} else {
			str += this.body.makeWrite(level, indent + indentChar, indentChar, realCode);
		}
		str += indent + "}";
		return str;
	};

	ast.SwitchStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "switch (" + this.discriminant.makeWrite(level, "", "", realCode) + ") {\n";
		var cases = this.cases;
		var newIndent = indent + indentChar;

		for (var i = 0, len = cases.length; i < len; i++) {
			str += cases[i].makeWrite(level, newIndent, indentChar, realCode);
		}

		return str + indent + "}";
	};

	ast.ReturnStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "return";
		var argument = this.argument;

		if (argument !== null)
			str += " " + argument.makeWrite(level, "", "", realCode);

		return str;
	};

	ast.ThrowStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "throw";
		var argument = this.argument;

		if (argument !== null)
			str += " " + argument.makeWrite(level, "", "", realCode);

		return str;
	};

	ast.TryStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "try {";
		str += realCodeAddition(realCode,this.loc.start.line);
		str += "\n";
		var handlers = this.handlers;
		var finalizer = this.finalizer;
		str += this.block.makeWrite(level, indent, indentChar, realCode);
		str += indent + "} ";

		if (handlers !== null) {
			str += handlers.makeWrite(level, indent, indentChar, realCode);
		}
		if (finalizer !== null) {
			str += "finally {";
		str += realCodeAddition(realCode,this.loc.start.line);
			str += "\n";
			str += finalizer.makeWrite(level, indent, indentChar, realCode);
			str += indent + "}";
		}
		return str;
	};

	ast.WhileStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "while (" + this.test.makeWrite(level, "", "", realCode) + ") {";
		str += realCodeAddition(realCode,this.loc.start.line);
		str += "\n";
		var body = this.body;

		if (body.type === "BlockStatement") {
			str += body.makeWrite(level, indent, indentChar, realCode);
		} else {
			str += body.makeWrite(level, indent + indentChar, indentChar, realCode);
		}
		str += indent + "}";

		return str;
	};

	ast.RepeatStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent;
		var condition = this.test.makeWrite(level, "", "", realCode);
		if (realCode) {
			var internalCounter = "repeatCount"+(Math.floor(Math.random()*1000000000));
			str += "for (var repeatCount=0,"+internalCounter+"=0;"+internalCounter+"<"+condition+";repeatCount++,"+internalCounter+"++) {";
			str += realCodeAddition(realCode,this.loc.start.line);
			str += "\n";
		} else {
			str += "repeat (" + condition + ") {\n";
		}
		var body = this.body;

		if (body.type === "BlockStatement") {
			str += body.makeWrite(level, indent, indentChar, realCode);
		} else {
			str += body.makeWrite(level, indent + indentChar, indentChar, realCode);
		}
		str += indent + "}";

		return str;
	};

	ast.DoWhileStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "do {";
		str += realCodeAddition(realCode,this.loc.start.line);
		str += "\n";
		str += this.body.makeWrite(level, indent + indentChar, indentChar, realCode) + "\n";
		return str + indent + "} while (" + this.test.makeWrite(level, "", "", realCode) + ")";
	};

	ast.ForStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "for (";
		var init = this.init;
		var test = this.test;
		var update = this.update;
		var body = this.body;

		if (init !== null) {
			if (typeof(init.type) === "undefined") {
				str += "var ";

				for (var i = 0, len = init.length; i < len; i++) {
					if (i !== 0)
						str += ", ";

					str += init[i].makeWrite(level, "", "", realCode);
				}
			} else {
				str += init.makeWrite(level, "", "", realCode);
			}
		}

		str += "; ";

		if (test !== null)
			str += test.makeWrite(level, "", "", realCode);

		str += "; ";

		if (update != null)
			str += update.makeWrite(level, "", "", realCode);

		str += ") {";
		str += realCodeAddition(realCode,this.loc.start.line);
		str += "\n";
		str += body.makeWrite(level, indent + indentChar, indentChar, realCode) + "\n";
		str += indent + "}";

		return str;
	};

	ast.ForInStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent + "for (";
		var left = this.left;
		var body = this.body;
		if (left !== null) {
			if (left.type === "VariableDeclarator") {
				str += "var " + left.makeWrite(level, "", "", realCode);
			} else {
				str += left.makeWrite(level, "", "", realCode);
			}
		}
		str += " in " + this.right.makeWrite(level, "", "", realCode) + ") {";
		str += realCodeAddition(realCode,this.loc.start.line);
		str += "\n";
		str += body.makeWrite(level, indent + indentChar, indentChar, realCode) + "\n";
		str += indent + "}";
		return str;
	};

	ast.DebugggerStatementNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		return indent + "debugger"
	};

	ast.FunctionDeclarationNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent;
		var name = this.id.makeWrite(level, "", "", realCode);
		if (realCode) {
			// This change makes it work with "strict use" inside a try {}
			str += "var "+name+" = function(";
		} else {
			str += "function " + name + "(";
		}
		var params = this.params;
		var body = this.body;
		var newIndent = indent + indentChar;

		for (var i = 0, len = params.length; i < len; i++) {
			if (i !== 0)
				str += ", ";

			str += params[i].makeWrite(level, newIndent, indentChar, realCode);
		}

		str += ") {";
		str += realCodeAddition(realCode,this.loc.start.line);
		str += "\n";

		for (var i = 0, len = body.length; i < len; i++) {
			str += body[i].makeWrite(level, newIndent, indentChar, realCode) + "\n";
		}

		return str + indent + "}\n";
	};

	ast.VariableDeclarationNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent;
		var type = this.kind;
		if (realCode && type === "array") {
			str += "var ";
		} else {
			str += this.kind + " ";
		}
		var declarations = this.declarations;

		for (var i = 0, len = declarations.length; i < len; i++) {
			if (i !== 0)
				str += ", ";

			var declaration = declarations[i].makeWrite(level, "", "", realCode);
			str += declaration;
			if (realCode && type === "array" && declaration.indexOf("=") < 0) {
				str += " = []";
			}
		}

		str += realCodeAddition(realCode,this.loc.start.line);
		return str;
	};

	ast.VariableDeclaratorNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = this.id.makeWrite(level, "", "", realCode);
		var init = this.init;

		if (init !== null)
			str += " = " + init.makeWrite(level, "", "", realCode);

		return str;
	};

	ast.ThisExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		return "this";
	};

	ast.ArrayExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = "[";
		var elements = this.elements;

		for (var i = 0, len = elements.length; i < len; i++) {
			if (i !== 0)
				str += ", ";

			str += elements[i].makeWrite(level, "", "", realCode);
		}

		return str + "]";
	};

	ast.ObjectExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = "{";
		var properties = this.properties;

		for (var i = 0, len = properties.length; i < len; i++) {
			var prop = properties[i];
			var kind = prop.kind;
			var key = prop.key;
			var value = prop.value;

			if (i !== 0)
				str += ", ";

			if (kind === "init") {
				str += key.makeWrite(level, "", "") + ": " + value.makeWrite(level, "", "", realCode);
			} else {
				var params = value.params;
				var body = value.body;

				str += kind + " " + key.makeWrite(level, "", "", realCode) + "(";

				for (var j = 0, plen = params.length; j < plen; j++) {
					if (j !== 0)
						str += ", ";

					str += params[j].makeWrite(level, "", "", realCode);
				}

				str += ") { ";

				for (var j = 0, blen = body.length; j < blen; j++) {
					str += body[j].makeWrite(level, "", "", realCode) + " ";
				}

				str += "}";
			}
		}

		return str + "}";
	};

	ast.FunctionExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = "(function";
		var id = this.id;
		var params = this.params;
		var body = this.body;
		var newIndent = indent + indentChar;

		if (id !== null)
			str += " " + id.makeWrite(level, "", "", realCode);

		str += "(";

		for (var i = 0, len = params.length; i < len; i++) {
			if (i !== 0)
				str += ", ";

			str += params[i].makeWrite(level, newIndent, indentChar, realCode);
		}

		str += ") {";
		str += realCodeAddition(realCode,this.loc.start.line);
		str += "\n";

		for (var i = 0, len = body.length; i < len; i++) {
			str += body[i].makeWrite(level, newIndent, indentChar, realCode) + ";";
			str += "\n";
		}

		return str + "})";
	};

	ast.SequenceExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = "";
		var expressions = this.expressions;

		for (var i = 0, len = expressions.length; i < len; i++) {
			if (i !== 0)
				str += ", ";

			str += expressions[i].makeWrite(level, "", "", realCode);
		}

		return str;
	};

	ast.UnaryExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = this.operator;
		if ((this.operator === "delete" || this.operator === "void" || this.operator === "typeof") ||
		     (needBrackets(this, this.argument))) {
			str += "(" + this.argument.makeWrite(level, "", "", realCode) + ")";
		} else {
			str += this.argument.makeWrite(level, "", "", realCode);
		}
		return str;
	};

	ast.BinaryExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = "";
		if (needBrackets(this,this.left,true)) {
			str += "(" + this.left.makeWrite(level, "", "", realCode) + ")";
		} else {
			str += this.left.makeWrite(level, "", "", realCode);
		}
		str += " " + this.operator + " ";
		if (needBrackets(this,this.right)) {
			str += "(" + this.right.makeWrite(level, "", "", realCode) + ")";
		} else {
			str += this.right.makeWrite(level, "", "", realCode);
		}
		return str;
	};

	ast.AssignmentExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = this.left.makeWrite(level, "", "", realCode) + " " + this.operator + " ";
		if (needBrackets(this,this.right)) {
			str += "(" + this.right.makeWrite(level, "", "", realCode) + ")";
		} else {
			str += this.right.makeWrite(level, "", "", realCode);
		}
		return str;
	};

	ast.UpdateExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = this.argument.makeWrite(level, "", "", realCode);
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

	ast.LogicalExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = "";
		if (needBrackets(this,this.left,true)) {
			str += "(" + this.left.makeWrite(level, "", "", realCode) + ")";
		} else {
			str += this.left.makeWrite(level, "", "", realCode);
		}
		str += " " + this.operator + " ";
		if (needBrackets(this,this.right)) {
			str += "(" + this.right.makeWrite(level, "", "", realCode) + ")";
		} else {
			str += this.right.makeWrite(level, "", "", realCode);
		}
		return str;
	};

	ast.ConditionalExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		return this.test.makeWrite(level, "", "", realCode) + " ? " + this.consequent.makeWrite(level, "", "", realCode) + " : " + this.alternate.makeWrite(level, "", "", realCode);
	};

	ast.NewExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = "new " + this.callee.makeWrite(level, "", "", realCode);
		var args = this.arguments;

		if (args !== null) {
			str += "(";

			for (var i = 0, len = args.length; i < len; i++) {
				if (i !== 0)
					str += ", ";

				str += args[i].makeWrite(level, "", "", realCode);
			}

			str += ")";
		}

		return str;
	};

	ast.CallExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = this.callee.makeWrite(level, "", "", realCode) + "(";
		var args = this.arguments;

		for (var i = 0, len = args.length; i < len; i++) {
			if (i !== 0)
				str += ", ";

			str += args[i].makeWrite(level, "", "", realCode);
		}

		return str + ")";
	};

	ast.MemberExpressionNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		if (this.computed) {
			return this.object.makeWrite(level, "", "", realCode) + "[" + this.property.makeWrite(level, "", "", realCode) + "]";
		} else {
			return this.object.makeWrite(level, "", "", realCode) + "." + this.property.makeWrite(level, "", "", realCode);
		}
	};

	ast.SwitchCaseNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var str = indent;
		var test = this.test;
		var consequent = this.consequent;
		var newIndent = indent + indentChar;

		if (test !== null) {
			str += "case " + test.makeWrite(level, "", "", realCode) + ":\n";
		} else {
			str += "default:\n";
		}

		for (var i = 0, len = consequent.length; i < len; i++) {
			str += consequent[i].makeWrite(level, newIndent, indentChar, realCode) + "\n";
		}

		return str;
	};

	ast.CatchClauseNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		var name = this.param.makeWrite(level, "", "", realCode);
		var str;
		if (realCode) {
			str = "catch (" + name + ") { if ("+name+".indexOf(\"$_eseecode_\") === 0) { throw "+name+";};";
		} else {
			str = "catch (" + name + ") {";
		}
		str += realCodeAddition(realCode,this.loc.start.line);
		str += "\n";

		str += this.body.makeWrite(level, indent, indentChar, realCode);
		str += indent + "} ";
		return str;
	};

	ast.IdentifierNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		return this.name;
	};

	ast.CommentNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		if (this.kind === "/*") {
			var lines = this.body.split(/\r?\n/);
			if (lines.length > 1) {
				var str = indent + "/*\n";
				var line = lines[0].substr(2).replace(/\r?\n/,"").trim();
				if (line.length > 0) {
					str += indent + "   " + line + "\n";
				}
				for (var i=1; i<lines.length-1; i++) {
					str += indent + "   "+lines[i].trim()+"\n";
				}
				line = lines[lines.length-1].trim().slice(0,-2).trim();
				if (line.length > 0) {
					str += indent + "   " + line + "\n";
				}
				str += indent + "*/";
				return str;
			} else {
				return indent + this.body.trim();
			}
		} else {
			return indent + this.body;
		}
	};

	ast.LiteralNode.prototype.makeWrite = function(level, indent, indentChar, realCode) {
		return this.value;
	};
})(eseecodeLanguage);
