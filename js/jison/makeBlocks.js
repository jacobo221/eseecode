"use strict";

(function(parser) {
	var ast = parser.ast;

	function appendBlock(level, instruction, parentDiv, params) {
		var div = document.createElement('div');
		var instructionSetId = $e_getInstructionSetIdFromName(instruction);
		if (instructionSetId < 0) {
			instructionSetId = $e_getInstructionSetIdFromName("unknownFunction");
			// Custom functions recieve all parameters as a single one because we don't know how many they must have so there's no need to separate them
			var parametersTexts = "";
			for (var i=0; i<params.length; i++) {
				if (i > 0) {
					parametersTexts += ", ";
				}
				parametersTexts += params[i];
			}
			params = [parametersTexts];
			div.setAttribute("instructionName", instruction);
		}
		if (params) {
			div.setAttribute("data-param1", ""); // At least force it to have one parameter
			for (var i=0; i<params.length; i++) {
				div.setAttribute("data-param"+(i+1), params[i]);
			}
		}
		if ($_eseecode.instructions.set[instructionSetId].block) {
			document.body.appendChild(div); // We need it to exist in order to draw the end div background
		}
		$e_createBlock(level,div,instructionSetId);
		$e_addBlock(div,true,parentDiv,true);
		return div;
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

	ast.ProgramNode.prototype.makeBlocks = function(level, parentDiv) {
		var elements = this.body;
		var unparsedLines = [];
		// First dump all FunctionDeclaration's to comply with "use strict"...
		for (var i = 0, len = elements.length; i < len; i++) {
			if (elements[i].type === "FunctionDeclaration" || (elements[i].type === "Comment" && isFunctionComment(elements, i))) {
				elements[i].makeBlocks(level,parentDiv);
			} else {
				unparsedLines.push(i);
			}
		}
		// ...Then dump the rest of the code
		for (var i = 0, len = unparsedLines.length; i < len; i++) {
			var line = unparsedLines[i];
			elements[line].makeBlocks(level, parentDiv);
		}
	}

	ast.EmptyStatementNode.prototype.makeBlocks = function(level, parentDiv) {
		return;
	}

	ast.BlockStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		for (var i=0,len=this.body.length; i<len; i++) {
			this.body[i].makeBlocks(level,parentDiv);
		}
	}

	ast.ExpressionStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		return this.expression.makeBlocks(level,parentDiv);
	}

	ast.IfStatementNode.prototype.makeBlocks = function(level,parentDiv,elseIf) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var condition = this.test.makeBlocks(level,null);
		var div;
		if (!elseIf) {
			div = appendBlock(level,"if",parentDiv,[condition]);
		} else {
			appendBlock(level,"elseIf",parentDiv,[condition]);
			div = parentDiv;
		}
		this.consequent.makeBlocks(level,div);
		if (this.alternate !== null) {
			// Now we convert the block into an ifelse
			// We couldn't do it before because we wanted the inner blocks to go _before_ the else block
			div.setAttribute("data-instructionsetid",$e_getInstructionSetIdFromName("ifelse"));
			if (this.alternate.type == "IfStatement") {
				 // else if
				this.alternate.makeBlocks(level,div,true);
			} else {
				appendBlock(level,"else",div,[condition]);
				this.alternate.makeBlocks(level,div);
			}
		}
	}

	ast.LabeledStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var params = new Array();
		if (this.label) {
			params.push(this.label.makeWrite(level,"",""));
		}
		appendBlock(level,"label",parentDiv,params);
		this.body.makeBlocks(level, parentDiv)
	};

	ast.BreakStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var params = new Array();
		if (this.label) {
			params.push(this.label.makeWrite(level,"",""));
		}
		appendBlock(level,"break",parentDiv,params);
	};

	ast.ContinueStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var params = new Array();
		if (this.label) {
			params.push(this.label.makeWrite(level,"",""));
		}
		appendBlock(level,"continue",parentDiv,params);
	};

	ast.WithStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var div = appendBlock(level,"with",parentDiv,[this.object.makeWrite(level, "", "")]);
		this.body.makeBlocks(level,div);
	};

	ast.SwitchStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var div = appendBlock(level,"switch",parentDiv,[this.discriminant.makeWrite(level, "", "")]);
		for (var i = 0, len = this.cases.length; i < len; i++) {
			this.cases[i].makeBlocks(level,div);
		}
	};

	ast.ReturnStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var str = "";
		if (this.argument !== null) {
			str += this.argument.makeWrite(level,"","");
		}
		if (str.length > 0) {
			appendBlock(level,"return",parentDiv,[str]);
		} else {
			appendBlock(level,"return",parentDiv,null);
		}
	};

	ast.ThrowStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.TryStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var div = appendBlock(level,"try",parentDiv,null);
		this.block.makeBlocks(level,div);
		if (this.handlers !== null) {
			this.handlers.makeBlocks(level, div);
		}
		if (this.finalizer !== null) {
			appendBlock(level,"finally",div,null);
			this.finalizer.makeBlocks(level, div);
		}
	};

	ast.WhileStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var condition = this.test.makeBlocks(level,null);
		var div = appendBlock(level,"while",parentDiv,[condition]);
		this.body.makeBlocks(level,div);
	};

	ast.RepeatStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var condition = this.test.makeBlocks(level,null);
		var div = appendBlock(level,"repeat",parentDiv,[condition]);
		this.body.makeBlocks(level,div);
	};

	ast.DoWhileStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var div = appendBlock(level,"do",parentDiv,null);
		this.body.makeBlocks(level,div);
		div.lastChild.setAttribute("param1",this.test.makeWrite(level, "", ""));
		paintBlock(div.lastChild);
	};

	ast.ForStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var str = "";
		if (this.init !== null) {
			if (typeof(this.init.type) === "undefined") {
				str += "var ";

				for (var i = 0, len = this.init.length; i < len; i++) {
					if (i !== 0)
						str += ", ";

					str += this.init[i].makeWrite(level, "", "");
				}
			} else {
				str += this.init.makeWrite(level, "", "");
			}
		}
		str += "; ";
		if (this.test !== null) {
			str += this.test.makeWrite(level, "", "");
		}
		str += "; ";
		if (this.update != null) {
			str += this.update.makeWrite(level, "", "");
		}
		var div = appendBlock(level,"for",parentDiv,[str]);
		this.body.makeBlocks(level,div);
	};

	ast.ForInStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var str = "";
		if (this.left !== null) {
			if (this.left.type === "VariableDeclarator") {
				str += "var " + this.left.makeWrite(level, "", "");
			} else {
				str += this.left.makeWrite(level, "", "");
			}
		}
		str += " in " + this.right.makeWrite(level, "", "");
		var div = appendBlock(level,"forIn",parentDiv,[str]);
		this.body.makeBlocks(level,div);
	};

	ast.DebugggerStatementNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.FunctionDeclarationNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var name = this.id.makeWrite(level,"","");
		var params = "";
		for (var i=0,len=this.params.length; i<len; i++) {
			if (i > 0) {
				params += ", ";
			}
			params  += this.params[i].makeWrite(level,"","");
		}
		var div = appendBlock(level,"function",parentDiv,[name,params]);
		for (var i=0,len=this.body.length; i<len; i++) {
			this.body[i].makeBlocks(level,div);
		}
	};

	ast.VariableDeclarationNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var type = this.kind;
		var declarations = "";
		for (var i=0,len=this.declarations.length; i<len; i++) {
			if (i !== 0) {
				declarations += ", ";
			}
			declarations += this.declarations[i].makeBlocks(level,null);
		}
		var div = appendBlock(level,this.kind,parentDiv,[declarations]);
	};

	ast.VariableDeclaratorNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.ThisExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.ArrayExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
			return this.makeWrite(level,"","");
	};

	ast.ObjectExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var div = appendBlock(level,"object",parentDiv,null);
		for (var i = 0, len=this.properties.length; i<len; i++) {
			this.properties[i].makeBlocks(level,div);
		}
	};

	ast.FunctionExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.SequenceExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.UnaryExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.BinaryExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.AssignmentExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"=",parentDiv,[this.left.makeWrite(level,"",""),this.right.makeWrite(level,"","")]);
	};

	ast.UpdateExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.LogicalExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.ConditionalExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.NewExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.CallExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var name = this.callee.makeBlocks(level,null);
		var params = new Array();
		for (var i=0,len=this.arguments.length; i<len; i++) {
			params[i] = this.arguments[i].makeWrite(level,"","");
		}
		appendBlock(level,name,parentDiv,params);
	};

	ast.MemberExpressionNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.SwitchCaseNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		var div;
		if (this.test !== null) {
			div = appendBlock(level,"case",parentDiv,[this.test.makeWrite(level, "", "")]);
		} else {
			div = appendBlock(level,"default",parentDiv,null);
		}
		for (var i = 0, len = this.consequent.length; i < len; i++) {
			this.consequent[i].makeBlocks(level, div);
		}
	};

	ast.CatchClauseNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"catch",parentDiv,[this.param.makeWrite(level, "","")]);
		this.body.makeBlocks(level, parentDiv);
	};

	ast.IdentifierNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};

	ast.CommentNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		if (this.kind == "//") {
			appendBlock(level,"comment",parentDiv,[this.makeWrite(level,"","").substr(2).trim()]);
		} else {
			var comment = this.makeWrite(level,"","").slice(2,-2).trim();
			if (!comment.match(/(\n|\r)/)) {
				appendBlock(level,"commentmultilinesingle",parentDiv,[comment]);
			} else {
				comment = comment.split("\n");
				if (comment.length <= 1) {
					appendBlock(level,"commentmultiline",parentDiv,[comment]);
				} else  {
					var div = appendBlock(level,"commentmultiline",parentDiv);
					for (var i=0; i<comment.length; i++) {
						appendBlock(level,"nullChild",div,[comment[i]]);
					}
				}
			}
		}
	};

	ast.LiteralNode.prototype.makeBlocks = function(level,parentDiv) {
		if (!parentDiv) {
			return this.makeWrite(level,"","");
		}
		appendBlock(level,"null",parentDiv,[this.makeWrite(level,"","")]);
	};
})(eseecodeLanguage);
