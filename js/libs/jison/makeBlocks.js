"use strict";

(function(parser) {

	const ast = parser.ast;

	function appendBlock(blockOrInstructionSetId, parentBlock, params, isSubblock) {
		return $e.ui.blocks.createAndPlaceBlock(blockOrInstructionSetId, parentBlock, undefined, params, { noInitSubblocks: true, isSubblock: isSubblock });
	}

	function isFunctionComment(elements, i) {
		let itIs = false;
		elements.some(element => {
			if (element.type !== "Comment") {
				itIs = element.type === "FunctionDeclaration";
				return true;
			}
		});
		return itIs;
	}

	ast.ProgramNode.prototype.makeBlocks = function(parentBlock) {
		const elements = this.body;
		const unparsedLines = [];
		// First dump all FunctionDeclaration's to comply with "use strict"...
		for (let i = 0, len = elements.length; i < len; i++) {
			if (elements[i].type === "FunctionDeclaration" || (elements[i].type === "Comment" && isFunctionComment(elements, i))) {
				elements[i].makeBlocks(parentBlock);
			} else {
				unparsedLines.push(i);
			}
		}
		// ...Then dump the rest of the code
		unparsedLines.forEach(line => elements[line].makeBlocks(parentBlock));
	}

	ast.EmptyStatementNode.prototype.makeBlocks = function(parentBlock) {
		return;
	}

	ast.BlockStatementNode.prototype.makeBlocks = function(parentBlock) {
		this.body.forEach(line => line.makeBlocks(parentBlock));
	}

	ast.ExpressionStatementNode.prototype.makeBlocks = function(parentBlock) {
		return this.expression.makeBlocks(parentBlock);
	}

	ast.IfStatementNode.prototype.makeBlocks = function(parentBlock, isElseIf) {

		if (!parentBlock) return this.makeWrite("", "");

		const containerBlock = isElseIf ? parentBlock : appendBlock("if-container", parentBlock);

		// Create the condition and sub-blocks
		const condition = this.test.makeBlocks(null);
		const blockEl = appendBlock(isElseIf ? "elseIf" : "if", containerBlock, [ condition ], true);
		this.consequent.makeBlocks(blockEl);

		if (this.alternate) {
			if (this.alternate.type == "IfStatement") {	// else if
				this.alternate.makeBlocks(containerBlock, true); // Create the elseIf block as a child of the container
			} else { // else
				const elseBlockEl = appendBlock("else", containerBlock, undefined, true);
				this.alternate.makeBlocks(elseBlockEl);
			}
		}

		if (!isElseIf) appendBlock("end", containerBlock, undefined, true);

	}

	ast.LabeledStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const params = new Array();
		if (this.label) params.push(this.label.makeWrite("", ""));
		appendBlock("label", parentBlock, params);
		this.body.makeBlocks(parentBlock);
	};

	ast.BreakStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const params = new Array();
		if (this.label) params.push(this.label.makeWrite("", ""));
		appendBlock("break", parentBlock, params);
	};

	ast.ContinueStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const params = new Array();
		if (this.label) params.push(this.label.makeWrite("", ""));
		appendBlock("continue", parentBlock, params);
	};

	ast.WithStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("with-container", parentBlock);
		const blockEl = appendBlock("with", containerBlock, [ this.object.makeWrite("", "") ], true);
		this.body.makeBlocks(blockEl);
		appendBlock("end", containerBlock, undefined, true);
	};

	ast.SwitchStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("switch-container", parentBlock);
		const blockEl = appendBlock("switch", containerBlock, [ this.discriminant.makeWrite("", "") ], true);
		this.cases.forEach(line => line.makeBlocks(containerBlock));
		appendBlock("end", containerBlock, undefined, true);
	};

	ast.ReturnStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		let str = "";
		if (this.argument !== null) str += this.argument.makeWrite("", "");
		if (str.length > 0) {
			appendBlock("return", parentBlock, [ str ]);
		} else {
			appendBlock("return", parentBlock);
		}
	};

	ast.ThrowStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.TryStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("try-container", parentBlock);
		let blockEl = appendBlock("try", containerBlock, undefined, true);
		this.block.makeBlocks(blockEl);
		if (this.handlers !== null) {
			this.handlers.makeBlocks(containerBlock);
		}
		if (this.finalizer !== null) {
			blockEl = appendBlock("finally", containerBlock, undefined, true);
			this.finalizer.makeBlocks(blockEl);
		}
		appendBlock("end", containerBlock, undefined, true);
	};

	ast.WhileStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("while-container", parentBlock);
		const condition = this.test.makeBlocks(null);
		const blockEl = appendBlock("while", containerBlock, [ condition ], true);
		this.body.makeBlocks(blockEl);
		appendBlock("end", containerBlock, undefined, true);
	};

	ast.RepeatStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("repeat-container", parentBlock);
		const condition = this.test.makeBlocks(null);
		const blockEl = appendBlock("repeat", containerBlock, [ condition ], true);
		this.body.makeBlocks(blockEl);
		appendBlock("end", containerBlock, undefined, true);
	};

	ast.FillStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("fill-container", parentBlock);
		let colors;
		if (this.color.type == "SequenceExpression") {
 			colors = [
				this.color.expressions[0].makeBlocks(null),
				this.color.expressions[1].makeBlocks(null),
			];
		} else {
 			colors = [
				this.color.makeBlocks(null),
				this.color.makeBlocks(null),
			];
		}
		const blockEl = appendBlock("fill", containerBlock, colors, true);
		this.body.makeBlocks(blockEl);
		appendBlock("end", containerBlock, undefined, true);
	};

	ast.DoWhileStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("do-container", parentBlock);
		const blockEl = appendBlock("do", containerBlock, undefined, true);
		this.body.makeBlocks(blockEl);
		appendBlock("endDo", containerBlock, [ this.test.makeWrite("", "") ], true);
	};

	ast.ForStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("for-container", parentBlock);
		let str = "";
		if (this.init !== null) {
			if (typeof(this.init.type) === "undefined") {
				str += "var " + this.init.map(v => v.makeWrite("", "")).join(', ');
			} else {
				str += this.init.makeWrite("", "");
			}
		}
		str += "; ";
		if (this.test !== null) str += this.test.makeWrite("", "");
		str += "; ";
		if (this.update != null) str += this.update.makeWrite("", "");
		const blockEl = appendBlock("for", containerBlock, [ str ], true);
		this.body.makeBlocks(blockEl);
		appendBlock("end", containerBlock, undefined, true);
	};

	ast.ForInStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("forIn-container", parentBlock);
		let str = "";
		if (this.left !== null) {
			if (this.left.type === "VariableDeclarator") {
				str += "var " + this.left.makeWrite("", "");
			} else {
				str += this.left.makeWrite("", "");
			}
		}
		str += " in " + this.right.makeWrite("", "");
		const blockEl = appendBlock("forIn", containerBlock, [ str ], true);
		this.body.makeBlocks(blockEl);
		appendBlock("end", containerBlock, undefined, true);
	};

	ast.DebugggerStatementNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.FunctionDeclarationNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("function-container", parentBlock);
		const name = this.id.makeWrite("", "");
		let params = this.params.map(param => param.makeWrite("", "")).join(', ');
		const blockEl = appendBlock("function", containerBlock, [ name, params ], true);
		this.body.forEach(line => line.makeBlocks(blockEl));
		appendBlock("end", containerBlock, undefined, true);
	};

	ast.VariableDeclarationNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const type = this.kind;
		if (this.declarations.length === 1) {
			const id = this.declarations[0].id.name;
			const init = this.declarations[0].init;
			if (init) {
				if (init.name) {
					appendBlock(type, parentBlock, [ id, init.name ]);
				} else if (init.value) {
					appendBlock(type, parentBlock, [ id, init.value ]);
				} else {
					appendBlock(type, parentBlock, [ id, init.makeWrite("", "") ]);
				}
			} else {
				appendBlock(type, parentBlock, [ id ]);
			}
		} else {
			const declarations = this.declarations.map(v => v.makeBlocks(null)).join(', ');
			appendBlock(type, parentBlock, [ declarations ]);
		}
	};

	ast.VariableDeclaratorNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.ThisExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.ArrayExpressionNode.prototype.makeBlocks = function(parentBlock) {
		return this.makeWrite("", "");
	};

	ast.ObjectExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const containerBlock = appendBlock("object-container", parentBlock);
		const blockEl = appendBlock("object", containerBlock, undefined, true);
		this.properties.forEach(property => property.makeBlocks(blockEl));
		appendBlock("endObject", containerBlock, undefined, true);
	};

	ast.FunctionExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.SequenceExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.UnaryExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.BinaryExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.AssignmentExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("=", parentBlock, [ this.left.makeWrite("", ""), this.right.makeWrite("", "") ]);
	};

	ast.UpdateExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.LogicalExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.ConditionalExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.NewExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.CallExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const name = this.callee.makeBlocks(null);
		const params = this.arguments.reduce((acc, argument) => acc.concat(argument.makeWrite("", "")), []);
		appendBlock(name, parentBlock, params);
	};

	ast.MemberExpressionNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.SwitchCaseNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		let blockEl;
		if (this.test !== null) {
			blockEl = appendBlock("case", parentBlock, [ this.test.makeWrite("", "") ]);
		} else {
			blockEl = appendBlock("default", parentBlock);
		}
		this.consequent.forEach(c => c.makeBlocks(blockEl));
	};

	ast.CatchClauseNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		const blockEl = appendBlock("catch", parentBlock, [ this.param.makeWrite("", "") ]);
		this.body.makeBlocks(blockEl);
	};

	ast.IdentifierNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};

	ast.CommentNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		if (this.kind == "//") {
			appendBlock("comment", parentBlock, [ this.makeWrite("", "").substr(2).trim() ]);
		} else {
			let comment = this.makeWrite("", "").slice(2, -2).trim();
			if (!comment.match(/(\n|\r)/)) {
				appendBlock("commentmultilinesingle", parentBlock, [ comment ]);
			} else {
				comment = comment.split("\n");
				const containerBlock = appendBlock("commentmultiline-container", parentBlock);
				if (comment.length <= 1) {
					appendBlock("commentmultiline", containerBlock, [ comment ], true);
				} else  {
					const blockEl = appendBlock("commentmultiline", containerBlock, undefined, true);
					comment.forEach(line => appendBlock("nullChild", blockEl, [ line ]));
				}
				appendBlock("endComment", containerBlock, undefined, true);
			}
		}
	};

	ast.LiteralNode.prototype.makeBlocks = function(parentBlock) {
		if (!parentBlock) return this.makeWrite("", "");
		appendBlock("null", parentBlock, [ this.makeWrite("", "") ]);
	};
})(eseecodeLanguage);
