"use strict";

	/**
	 * Public instruction set
	 * @type {Array<{name:String, category:String, [parameters]:Array<{name:String, [type]:String, [initial]:String, [tip]:String, minValue:Number, maxValue:Number, stepValue:Number, [validate]:function(String):Boolean, [noBrackets]:Boolean}>, [tip]:String, show:Array<String>, [type]:String, [block]:Array<String>, [nameRewrite]:Array<{String, String}>, [dummy]:Boolean, [code]:Array<[unindent]:Boolean, [prefix]:String, [noName]:Boolean, [space]:Boolean, [noBrackets]:Boolean, [suffix]:String>}>, [convert]:Array<String>}
	 * @example { name: "forward", category: "guide", parameters: [{name: "pixels", type: "number", initial: 100, tip: "How many pixels do you want to move forward?"}], tip: "Moves forward", show: ["level2","level3","level4"] }
	 */
	$_eseecode.instructions.set = [
		{ name: "null", category: "internal", parameters: [{name: "text", type: "text", noBrackets: true}], show: [], code: { noName: true, noBrackets: true } },
		{ name: "nullChild", category: "internal", parameters: [{name: "text", type: "text", noBrackets: true}], show: [], dummy: true, code: { noName: true, noBrackets: true, unindent: true } },
		{ name: "unknownFunction", category: "internal", parameters: [{name: "parameters...", type: "text"}], show: [] },
		{ name: "object", category: "other", parameters: null, type: "object", show: [], block: ["endObject"], nameRewrite: { level3: "", level4: "" }, code: { prefix: "{ " } },
		{ name: "comment", category: "other", parameters: [{name: "comment", type: "text", noBrackets: true}], tip: "Comment text, ignored during execution", show: ["level3","level4"], nameRewrite: { level1: "Comment:", level2: "Comment:", level3: "//", level4: "//" }, code: { space: true, noBrackets: true } },
		{ name: "commentmultiline", category: "other", parameters: [{name: "comment", type: "text", noBrackets: true}], tip: "Comment text, ignored during execution", show: [], block: ["endComment"], nameRewrite: { level1: "Comment:", level2: "Comment:", level3: "/*", level4: "/*" }, code: { space: true, noBrackets: true } },
		{ name: "commentmultilinesingle", category: "other", parameters: [{name: "comment", type: "text", noBrackets: true}], tip: "Comment text, ignored during execution", show: [], nameRewrite: { level1: "Comment:", level2: "Comment:", level3: "/*", level4: "/*" }, code: { space: true, noBrackets: true, suffix: " */" } },
		{ name: "beginShape", category: "guide", parameters: [], tip: "Begins a shape definition", show: ["level2","level3","level4"] },
		{ name: "endShape", category: "guide", parameters: [], tip: "Ends a shape definition", show: ["level2","level3","level4"] },
		{ name: "clean", category: "canvas", parameters: [{ name: "id", type: "number" }], tip: "Wipes the canvas", show: ["level3", "level4"] },
		{ name: "flipHorizontally", category: "canvas", parameters: [], tip: "Flips the canvas horizontally", show: ["level2","level3","level4"] },
		{ name: "flipVertically", category: "canvas", parameters: [], tip: "Flips the canvas vertically", show: ["level2","level3","level4"] },
		{ name: "blank", category: "guide", show: ["level1","level2"] },
		{ name: "forward", category: "guide", parameters: [{name: "pixels", initial: 100, type: "number", tip: "How many pixels do you want to move forward?"}], tip: "Moves forward", show: ["level2","level3","level4"] },
		{ name: "forward", category: "guide", parameters: [{name: "pixels", initial: 100, type: "number", tip: "How many pixels do you want to move forward?"}], tip: "Moves 100 steps forward", show: ["level1"] },
		{ name: "forward", category: "guide", parameters: [{name: "pixels", initial: 50, type: "number"}], tip: "Moves 50 steps forward", show: ["level1"] },
		{ name: "forward", category: "guide", parameters: [{name: "pixels", initial: 25, type: "number"}], tip: "Moves 25 step forward", show: ["level1"] },
		{ name: "arc", category: "guide", parameters: [{name: "radius", initial: 50, type: "number" }, { name: "degrees", initial: 15 }, { name: "axis", initial: 0 }, { name: "counterclockwise", initial: false }], tip: "Draws an arc", show: ["level3","level4"] },
		{ name: "blank", category: "guide", show: ["level1"] },
		{ name: "turnLeft", category: "guide", parameters: [{name: "degrees", initial: 90, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?"}], tip: "Turns left", show: ["level2","level3","level4"] },
		{ name: "turnLeft", category: "guide", parameters: [{name: "degrees", initial: 90, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?"}], tip: "Turns 90 degrees left", show: ["level1"] },
		{ name: "turnLeft", category: "guide", parameters: [{name: "degrees", initial: 45, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?"}], tip: "Turns 45 degrees left", show: ["level1"] },
		{ name: "turnLeft", category: "guide", parameters: [{name: "degrees", initial: 15, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?"}], tip: "Turns 15 degrees left", show: ["level1"] },
		{ name: "blank", category: "guide", show: ["level1"] },
		{ name: "turnRight", category: "guide", parameters: [{name: "degrees", initial: 90, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?"}], tip: "Turns right", show: ["level2","level3","level4"] },
		{ name: "turnRight", category: "guide", parameters: [{name: "degrees", initial: 90, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?"}], tip: "Turns 90 degrees right", show: ["level1"] },
		{ name: "turnRight", category: "guide", parameters: [{name: "degrees", initial: 45, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?"}], tip: "Turns 45 degrees right", show: ["level1"] },
		{ name: "turnRight", category: "guide", parameters: [{name: "degrees", initial: 15, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?"}], tip: "Turns 15 degrees right", show: ["level1"] },
		{ name: "turnReset", category: "guide", parameters: [{name: "degrees", initial: 0, type: "number", minValue: -360, maxValue: 360, tip: "Which angle do you want the pointer to face?"}], tip: "Resets the angle to initial rotation", show: ["level3","level4"] },
		{ name: "blank", category: "guide", show: ["level1","level2"] },
		{ name: "=", category: "value", parameters: [{name: "variable", type: "var", validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); }, noBrackets: true},{name: "value", initial: undefined, type: "var", noBrackets: true}], type: "var", tip: "Assigns a value to a variable", show: ["level3","level4"], inorder: true, code: { space: true, noBrackets: true } },
		{ name: "changeAxis", category: "value", parameters: [{name: "posx", initial: 0, minValue: 0, maxValue: 400, type: "number"}, {name: "posy", initial: 0, minValue: 0, maxValue: 400, type: "number"}, {name: "xScale", initial: 1, type: "number"}, {name: "yScale", initial: 1, type: "number"}], tip: "Changes the axis", show: ["level4"] },
		{ name: "getArccosine", category: "value", parameters: [{name: "degrees", initial: 90, type: "number"}], type: "number", tip: "Returns the arccosine", show: ["level4"] },
		{ name: "getArcsine", category: "value", parameters: [{name: "degrees", initial: 90, type: "number"}], type: "number", tip: "Returns the arcsine", show: ["level4"] },
		{ name: "getArctangent", category: "value", parameters: [{name: "degrees", initial: 90, type: "number"}], type: "number", tip: "Returns the arctangent", show: ["level4"] },
		{ name: "getLayerHeight", category: "value", parameters: [], type: "number", tip: "Returns the canvas height", show: ["level4"] },
		{ name: "getLayerWidth", category: "value", parameters: [], type: "number", tip: "Returns the canvas width", show: ["level4"] },
		{ name: "getLayerName", category: "value", parameters: [], type: "text", tip: "Returns the current canvas' name", show: ["level4"] },
		{ name: "getLayerVisibility", category: "value", parameters: [{name: "canvasId", initial: undefined, type: "number"}], type: "bool", tip: "Returns if the layer is visible", show: ["level4"] },
		{ name: "getCosine", category: "value", parameters: [{name: "degrees", initial: 90, type: "number"}], type: "number", tip: "Returns the cosine", show: ["level4"] },
		{ name: "getRandomColor", category: "value", parameters: [], type: "color", tip: "Returns a random color", show: ["level4"] },
		{ name: "getRandomNumber", category: "value", parameters: [{name: "number", initial: 100, type: "number"}], type: "number", tip: "Returns a random number", show: ["level4"] },
		{ name: "getRGB", category: "value", parameters: [{name: "red", initial: 0},{name: "green", initial: 0, type: "number"},{name: "blue", initial: 0}], type: "number", tip: "Returns a color from and RGB definition", show: ["level4"] },
		{ name: "getSine", category: "value", parameters: [{name: "degrees", initial: 90, type: "number"}], type: "number", tip: "Returns the sine", show: ["level4"] },
		{ name: "getTangent", category: "value", parameters: [{name: "degrees", initial: 90, type: "number"}], type: "number", tip: "Returns the tangent", show: ["level4"] },
		{ name: "getSquareRoot", category: "value", parameters: [{name: "number", initial: 0, type: "number"}], type: "number", tip: "Returns the square root of the number", show: ["level4"] },
		{ name: "getAngle", category: "value", parameters: [{name: "id", type: "number"}], type: "number", tip: "Returns the current angle", show: ["level4"] },
		{ name: "getX", category: "value", parameters: [{name: "id", type: "number"}], type: "number", tip: "Returns the X coordinate", show: ["level4"] },
		{ name: "getY", category: "value", parameters: [{name: "id", type: "number"}], type: "number", tip: "Returns the Y coordinate", show: ["level4"] },
		{ name: "getLayerImage", category: "value", parameters: [{name: "id", type: "number"}], type: "text", tip: "Returns the image in the canvas", show: ["level4"] },
		{ name: "setColor", category: "guide", parameters: [{name: "color", initial: "\"#FF0000\"", type: "color", tip: "Which color do you want to use?"}], tip: "Sets the drawing color", show: ["level2","level3","level4"] },
		{ name: "unsetColor", category: "guide", parameters: [], tip: "Resets the drawing color", show: ["level2","level3","level4"] },
		{ name: "blank", category: "guide", show: ["level1","level2"] },
		{ name: "goToUpLeft", category: "guide", parameters: [], tip: "Moves to the upper left of the canvas", show: ["level1","level2","level3","level4"] },
		{ name: "goToUpRight", category: "guide", parameters: [], tip: "Moves to the upper right of the canvas", show: ["level1","level2","level3","level4"] },
		{ name: "goToCenter", category: "guide", parameters: [], tip: "Moves to the center of the canvas", show: ["level1","level2","level3","level4"] },
		{ name: "goToLowLeft", category: "guide", parameters: [], tip: "Moves to the lower left of the canvas", show: ["level1","level2","level3","level4"] },
		{ name: "goToLowRight", category: "guide", parameters: [], tip: "Moves to the lower right of the canvas", show: ["level1","level2","level3","level4"] },
		{ name: "goTo", category: "guide", parameters: [{name: "posx", initial: "centerX", type: "number", minValue: "minX", maxValue: "maxX", tip: "Set X coordinate to go to"},{name: "posy", initial: "centerY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Set Y coordinate to go to"}], tip: "Moves to the specified coordinates in the canvas", show: ["level2","level3","level4"] },
		{ name: "blank", category: "guide", show: ["level1","level2"] },
		{ name: "unsetSize", category: "guide", parameters: [], tip: "Unsets the drawing size", show: ["level3","level4"] },
		{ name: "hide", category: "canvas", parameters: [{name: "canvasId", initial: undefined, type: "number"}], tip: "Hides the canvas", show: ["level3","level4"] },
		{ name: "image", category: "draw", parameters: [{name: "src", initial: "\"\"", type: "text", tip: "URL of an image"},{name: "posx", initial: "centerX", type: "number", minValue: "minX", maxValue: "maxX", tip: "X coordinate where the image will be painted"},{name: "posy", initial: "centerY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Y coordinate where the image will be painted"},{name: "width", type: "number", minValue: 0, tip: "Width to show the image, in pixels" },{name: "height", type: "number", minValue: 0, tip: "Height to show the image, in pixels" }], tip: "Sticks an external image", show: ["level2","level3","level4"] },
		{ name: "lineAt", category: "draw", parameters: [{name: "originx", initial: "minX", type: "number", minValue: "minX", maxValue: "maxX", tip: "Where should the line begin? Set the X coordinate"},{name: "originy", initial: "minY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Where should the line begin? Set the Y coordinate"},{name: "destinationx", initial: "maxX", type: "number", minValue: "minX", maxValue: "maxX", tip: "Where should the line end? Set the X coordinate"},{name: "destinationy", initial: "maxY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Where should the line end? Set the Y coordinate"}], tip: "Draws a line from coordinate position to coordinate position", show: ["level2","level3","level4"] },
		{ name: "move", category: "canvas", parameters: [{name: "right", initial: 50, type: "number"},{name: "down", initial: 50, type: "number"}], tip: "Moves the canvas (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "moveDown", category: "canvas", parameters: [{name: "pixels", initial: 50, type: "number"}], tip: "Moves the canvas down (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "moveLeft", category: "canvas", parameters: [{name: "pixels", initial: 50, type: "number"}], tip: "Moves the canvas left (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "moveRight", category: "canvas", parameters: [{name: "pixels", initial: 50, type: "number"}], tip: "Moves the canvas right (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "moveUp", category: "canvas", parameters: [{name: "pixels", initial: 50, type: "number"}], tip: "Moves the canvas up (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "pull", category: "canvas", parameters: [{name: "levels", initial: 1, type: "number"}], tip: "Pulls up a canvas layer", show: ["level3","level4"] },
		{ name: "push", category: "canvas", parameters: [{name: "levels", initial: 1, type: "number"}], tip: "Pushes down a canvas layer", show: ["level3","level4"] },
		{ name: "rotateLeft", category: "canvas", parameters: [{name: "degrees", initial: 90, type: "number"},{name: "axis", type: "number"}], tip: "Rotates the canvas left (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "rotateRight", category: "canvas", parameters: [{name: "degrees", initial: 90, type: "number"},{name: "axis", type: "number"}], tip: "Rotates the canvas right (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "scale", category: "canvas", parameters: [{name: "horizontal", initial: 0.5, type: "number"},{name: "vertical", initial: 0.5, type: "number"},{name: "axis", type: "number"}], tip: "Scales the canvas (offset canvas parts will be lost)", show: ["level3","level4"] },
		{ name: "setSize", category: "guide", parameters: [{name: "size", initial: 16, type: "number", minValue: 0, tip: "Which size in pixels do you want to set?"}], tip: "Sets the drawing size", show: ["level2","level3","level4"] },
		{ name: "blank", category: "guide", show: ["level2"] },
		{ name: "setInvisible", category: "guide", parameters: [{name: "index", type: "number", initial: 0.5, stepValue: 0.05, minValue: 0, maxValue: 1, tip: "From 0 (invisible] to 1 (opaque), how invisible do you want to draw?"}], tip: "Sets the drawing transparency value", show: ["level2","level3","level4"] },
		{ name: "unsetInvisible", category: "guide", parameters: [], tip: "Sets the drawing transparency to opaque", show: ["level2","level3","level4"] },
		{ name: "blank", category: "guide", show: ["level1","level2"] },
		{ name: "setColor", category: "guide", parameters: [{name: "color", initial: "\"#FF0000\"", type: "color"}], tip: "Sets the drawing color to red", show: ["level1"] },
		{ name: "setColor", category: "guide", parameters: [{name: "color", initial: "\"#00FF00\"", type: "color"}], tip: "Sets the drawing color to green", show: ["level1"] },
		{ name: "setColor", category: "guide", parameters: [{name: "color", initial: "\"#0000FF\"", type: "color"}], tip: "Sets the drawing color to blue", show: ["level1"] },
		{ name: "setColor", category: "guide", parameters: [{name: "color", initial: "\"#FFFF00\"", type: "color"}], tip: "Sets the drawing color to yellow", show: ["level1"] },
		{ name: "setColor", category: "guide", parameters: [{name: "color", initial: "\"#00FFFF\"", type: "color"}], tip: "Sets the drawing color to light blue", show: ["level1"] },
		{ name: "setColor", category: "guide", parameters: [{name: "color", initial: "\"#FFFFFF\"", type: "color"}], tip: "Sets the drawing color to white", show: ["level1"] },
		{ name: "setColor", category: "guide", parameters: [{name: "color", initial: "\"#000000\"", type: "color"}], tip: "Sets the drawing color to black", show: ["level1"] },
		{ name: "setColor", category: "guide", parameters: [{name: "color", initial: "\"#555555\"", type: "color"}], tip: "Sets the drawing color to grey", show: ["level1"] },
		{ name: "setColor", category: "guide", parameters: [{name: "color", initial: "\"#AAAAAA\"", type: "color"}], tip: "Sets the drawing color to light grey", show: ["level1"] },
		{ name: "blank", category: "guide", show: ["level1"] },
		{ name: "setSize", category: "guide", parameters: [{name: "size", initial: 16, type: "number"}], tip: "Sets the drawing size to very thick", show: ["level1"] },
		{ name: "setSize", category: "guide", parameters: [{name: "size", initial: 9, type: "number"}], tip: "Sets the drawing size to thicker", show: ["level1"]},
		{ name: "setSize", category: "guide", parameters: [{name: "size", initial: 4, type: "number"}], tip: "Sets the drawing size to thick", show: ["level1"]},
		{ name: "blank", category: "guide", show: ["level1"] },
		{ name: "unsetColor", category: "guide", parameters: [], tip: "Resets the drawing color", show: ["level1"] },
		{ name: "unsetSize", category: "guide", parameters: [], tip: "Unsets the drawing size", show: ["level1"] },
		{ name: "blank", category: "guide", show: ["level1"]},
		{ name: "setBold", category: "guide", parameters: [{name: "bool", initial: true, type: "bool", tip: "Do you want the text to be bold?" }], tip: "Sets the bold property for future text", show: ["level2","level3","level4"] },
		{ name: "unsetBold", category: "guide", parameters: [], tip: "Unsets the bold property for future text", show: ["level2","level3","level4"] },
		{ name: "line", category: "guide", parameters: [{name: "destinationx", initial: 0, type: "number", tip: "Set X coordinate to go to"},{name: "destinationy", initial: 0, type: "number", tip: "Set Y coordinate to go to"}], tip: "Draws a line from current position to specified coordinates", show: ["level2","level3","level4"] },
		{ name: "blank", category: "guide", show: ["level2"] },
		{ name: "setFont", category: "guide", parameters: [{name: "font", initial: "\"Comic Sans MS\"", type: "font", tip: "Which font do you want to use?" }], tip: "Sets the font for future text", show: ["level2","level3","level4"] },
		{ name: "unsetFont", category: "guide", parameters: [], tip: "Resets the font for future text", show: ["level2","level3","level4"] },
		{ name: "write", category: "guide", parameters: [{name: "text", initial: "\"Hello!\"", type: "text", tip: "Which text do you want to write?"}], tip: "Draws text", show: ["level2","level3","level4"] },
		{ name: "blank", category: "guide", show: ["level2"] },
		{ name: "setItalic", category: "guide", parameters: [{name: "bool", initial: true, type: "bool", tip: "Do you want the text to be italic?" }], tip: "Sets the italic property for future text", show: ["level2","level3","level4"] },
		{ name: "unsetItalic", category: "guide", parameters: [], tip: "Resets the italic property for future text", show: ["level2","level3","level4"] },
		{ name: "show", category: "canvas", parameters: [{name: "canvasId", initial: undefined, type: "number"}], tip: "Shows the canvas", show: ["level3","level4"] },
		{ name: "blank", category: "guide", show: ["level1"] },
		{ name: "snapshot", category: "canvas", parameters: [{name: "id", initial: undefined, type: "number"}], type: "text", tip: "creates a clone of the current canvas, returns the name of the clone canvas", show: ["level4"] },
		{ name: "blank", category: "canvas", show: ["level2"] },
		{ name: "animate", category: "canvas", parameters: [{name: "action", initial: "", type: "text", tip: "Code to run"},{name: "seconds", initial: 1, type: "number", tip: "How often to run the code (in seconds)"},{name: "maxTimes", initial: 1, type: "number", tip: "Maximum number of times to run the code"}], tip: "Runs the action every certain amount of time", show: ["level3","level4"] },
		{ name: "unanimate", category: "canvas", parameters: [{name: "handlerId", initial: 0, type: "number"}], tip: "Stops an animation", show: ["level3","level4"] },
		{ name: "animateLayers", category: "canvas", parameters: [{name: "seconds", initial: 1, type: "number", tip: "How often to change the layer (in seconds)"}], tip: "Shows one layer at a time every certain time", show: ["level2","level3","level4"] },
		{ name: "use", category: "canvas", parameters: [{name: "id", initial: 1, type: "number"}], type: "text", tip: "Switches the active canvas, returns the name of the new current canvas", show: ["level2","level3","level4"] },
		{ name: "if", category: "flow", parameters: [{name: "condition", initial: true, type: "bool", tip: "When should the code be triggered?"}], tip: "Conditional execution", show: ["level2","level3","level4"], block: ["end"], code: { space: true, suffix: " {" }, convert: ["ifelse"] },
		{ name: "ifelse", category: "flow", parameters: [{name: "condition", initial: true, type: "bool", tip: "When should the code be triggered?"}], tip: "Conditional execution", show: ["level3"], block: ["else","end"], nameRewrite: { level1: "if", level2: "if", level3: "if", level4: "if" }, code: { space: true, suffix: " {" }, convert: ["if"] },
		{ name: "switch", category: "flow", parameters: [{name: "identifier", initial: true, type: "bool", tip: "Where is the value we want to check?"}], tip: "Value based execution", show: [], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "case", category: "flow", parameters: [{name: "value", initial: false, type: "bool"}], show: [], block: [], dummy: true, code: { space: true, noBrackets: true, suffix: " :" } },
		{ name: "default", category: "flow", parameters: null, show: [], dummy: true, code: { suffix: " :" } },
		{ name: "try", category: "flow", parameters: null, show: [], block: ["end"], code: { suffix: " {" } },
		{ name: "with", category: "flow", parameters: [{name: "object", initial: [], type: "object"}], show: [], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "do", category: "flow", parameters: null, show: [], block: ["endDo"], code: { suffix: " {" } },
		{ name: "endDo", category: "flow", parameters: [{name: "condition", initial: false, type: "bool"}], show: [], nameRewrite: { level1: "while", level2: "while", level3: "while", level4: "while" }, block: ["end"], dummy: true, code: { prefix: "} ", unindent: true } },
		{ name: "while", category: "flow", parameters: [{name: "condition", initial: true, type: "bool", tip: "The code will be triggered as long as the following condition remains true"}], tip: "Conditional loop", show: ["level2","level3","level4"], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "repeat", category: "flow", parameters: [{name: "number", initial: 1, type: "number", minValue: 0, tip: "How many times do you want to run the code?"}], tip: "Repeating loop", show: ["level2","level3","level4"], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "for", category: "flow", parameters: [{name: "initialization;condition;update", initial: ";false;", type: "text"}], show: [], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "forIn", category: "flow", parameters: [{name: "iteration", initial: "x in []", type: "text"}], show: [], block: ["end"], nameRewrite: { level1: "for", level2: "for", level3: "for", level4: "for" }, code: { space: true, suffix: " {" } },
		{ name: "elseIf", category: "flow", parameters: [{name: "condition", initial: false, type: "bool"}], tip: "Alternative branch to conditional execution", show: ["level4"], dummy: true, nameRewrite: { level1: "else if", level2: "else if", level3: "else if", level4: "else if" }, code: { prefix: "} ", space: true, suffix: " {", unindent: true } },
		{ name: "catch", category: "flow", parameters: [{name: "identifier", initial: "e", type: "text"}], show: [], dummy: true, code: { space: true, prefix: "} ", suffix: " {", unindent: true } },
		{ name: "finally", category: "flow", parameters: null, show: [], dummy: true, code: { space: true, prefix: "} ", suffix: " {", unindent: true } },
		{ name: "else", category: "flow", parameters: null, tip: "Alternative branch to conditional execution", show: ["level4"], dummy: true, code: { space: true, prefix: "} ", suffix: " {", unindent: true } },
		{ name: "end", category: "internal", parameters: null, tip: "End flow break", show: [], dummy: true, nameRewrite: { level1: "", level2: "", level3: "}", level4: "}" }, code: { unindent: true } },
		{ name: "endObject", category: "internal", parameters: null, tip: "End object definition", show: [], dummy: true, nameRewrite: { level1: "", level2: "", level3: "}", level4: "}" }, code: { unindent: true } },
		{ name: "endComment", category: "internal", parameters: null, tip: "End flow break", show: [], dummy: true, nameRewrite: { level1: "", level2: "", level3: "*/", level4: "*/" }, code: { unindent: true } },
		{ name: "wait", category: "flow", parameters: [{name: "milliseconds", initial: 1000, type: "number"}], tip: "Stops execution for the specified time (in milliseconds)", show: [] },
		{ name: "stop", category: "flow", parameters: [], tip: "Stop the execution", show: ["level2","level3","level4"] },
		{ name: "label", category: "flow", parameters: [{name: "identifier", type: "text", validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); }, noBrackets: true}], tip: "Label a spot in the code", show: [], code: { noName: true, suffix: ":" } },
		{ name: "return", category: "flow", parameters: [{name: "value", type: "text"}], tip: "Return to calling function", show: ["level3","level4"], code: { space: true, noBrackets: true } },
		{ name: "call", category: "flow", parameters: [{name: "identifier", type: "text", validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); }, noBrackets: true},{name: "parameters...", type: "text"}], tip: "Call a custom function", show: ["level3"], nameRewrite: { level1: "", level2: "Comment:", level3: "", level4: "" } },
		{ name: "break", category: "flow", parameters: [{name: "value", type: "text"}], tip: "End loop execution", show: [], code: { space: true, noBrackets: true } },
		{ name: "continue", category: "flow", parameters: [{name: "value", type: "text"}], tip: "Skip to next loop iteration", show: [], code: { space: true, noBrackets: true } },
		{ name: "var", category: "objects", parameters: [{name: "identifier", type: "text", validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); }, noBrackets: true}], tip: "Declare a new variable", show: ["level3","level4"], code: { space: true, noBrackets: true } },
		{ name: "array", category: "objects", parameters: [{name: "identifier", type: "text", validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); }, noBrackets: true}], tip: "Declare a new array", show: ["level3","level4"], code: { space: true, noBrackets: true } },
		{ name: "function", category: "objects", parameters: [{name: "identifier", type: "text", validate: function(variable){ return (variable.match(/^[A-Za-z][A-Za-z_0-9]*$/)); }, noBrackets: true},{name: "parameters...", type: "text"}], tip: "Declares a new function", show: ["level3","level4"], block: ["end"], code: { space: true, suffix: " {" } },
		{ name: "windowButtonCreate", category: "window", parameters: [{name: "window", initial: 1, type: "number"},{name: "id", initial: 1, type: "number"},{name: "text", initial: "\"Click me!\"", type: "text"},{name: "posx", initial: 0, type: "number"},{name: "posy", initial: 0, type: "number"},{name: "action", type: "text"}], tip: "Creates a button in a window", show: ["level3","level4"] },
		{ name: "windowButtonEdit", category: "window", parameters: [{name: "id", initial: 1, type: "number"},{name: "text", initial: "Click me!", type: "text"},{name: "posx", initial: 0, type: "number"},{name: "posy", initial: 0, type: "number"},{name: "action", type: "text"}], tip: "Modifies a button in a window", show: ["level3","level4"] },
		{ name: "windowButtonHide", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Hides a button in a window", show: ["level3","level4"] },
		{ name: "windowButtonRemove", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Deletes a button in a window", show: ["level3","level4"] },
		{ name: "windowButtonShow", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Shows a button in a window", show: ["level3","level4"] },
		{ name: "windowHide", category: "window", parameters: [], tip: "Hides a window", show: ["level3","level4"] },
		{ name: "windowImageCreate", category: "window", parameters: [{name: "window", initial: 1, type: "number"},{name: "id", initial: 1, type: "number"},{name: "canvasId", initial: 1, type: "number"},{name: "posx", initial: 0, type: "number"},{name: "posy", initial: 0, type: "number"},{name: "width", initial: 50, type: "number"},{name: "height", initial: 50, type: "number"},{name:"onclick", type: "text"},{name:"onmouseover", type: "text"},{name:"onmouseout", type: "text"}], tip: "Creates an image in a window", show: ["level3","level4"] },
		{ name: "windowImageEdit", category: "window", parameters: [{name: "id", initial: 1, type: "number"},{name: "canvasId", initial: 1, type: "number"},{name: "posx", initial: 0, type: "number"},{name: "posy", initial: 0, type: "number"},{name: "width", initial: 50, type: "number"},{name: "height", initial: 50, type: "number"},{name:"onclick", type: "text"},{name:"onmouseover", type: "text"},{name:"onmouseout", type: "text"}], tip: "Modifies a button in a window", show: ["level3","level4"] },
		{ name: "windowImageHide", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Hides an image in a window", show: ["level3","level4"] },
		{ name: "windowImageRemove", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Deletes an image in a window", show: ["level3","level4"] },
		{ name: "windowImageShow", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Shows an image in a window", show: ["level3","level4"] },
		{ name: "windowInputCreate", category: "window", parameters: [{name: "window", initial: 1, type: "number"},{name: "id", initial: 1, type: "number"},{name: "posx", initial: 0, type: "number"},{name: "posy", initial: 0, type: "number"},{name: "width", initial: 50, type: "number"},{name: "height", initial: 12, type: "number"},{name:"type", type: "text"}], tip: "Creates an input box in a window", show: ["level3","level4"] },
		{ name: "windowInputEdit", category: "window", parameters: [{name: "id", initial: 1, type: "number"},{name: "posx", initial: 0, type: "number"},{name: "posy", initial: 0, type: "number"},{name: "width", initial: 50, type: "number"},{name: "height", initial: 12, type: "number"},{name:"type", type: "text"}], tip: "Modifies an input box in a window", show: ["level3","level4"] },
		{ name: "windowInputGet", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Gets the value in an input box in a window", show: ["level3","level4"] },
		{ name: "windowInputHide", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Hides an input box in a window", show: ["level3","level4"] },
		{ name: "windowInputRemove", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Deletes an input box in a window", show: ["level3","level4"] },
		{ name: "windowInputSet", category: "window", parameters: [{name: "id", initial: 1, type: "number"},{name: "text", initial: "0", type: "text"}], tip: "Sets the value in the input box", show: ["level3","level4"] },
		{ name: "windowInputShow", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Shows an input box in a window", show: ["level3","level4"] },
		{ name: "windowRemove", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Deletes a window", show: ["level3","level4"] },
		{ name: "windowShow", category: "window", parameters: [], tip: "Shows a window", show: ["level3","level4"] },
		{ name: "windowTextCreate", category: "window", parameters: [{name: "window", initial: 1, type: "number"},{name: "id", initial: 1, type: "number"},{name: "text", initial: "\"Hello!\"", type: "text"},{name: "posx", initial: 0, type: "number"},{name: "posy", initial: 0, type: "number"},{name: "width", type: "number"},{name: "bold", type: "bool"},{name:"italic", type: "bool"},{name:"size", type: "number"},{name:"color", type: "color"},{name:"family", type: "text"}], tip: "Creates text in a window", show: ["level3","level4"] },
		{ name: "windowTextEdit", category: "window", parameters: [{name: "id", initial: 1, type: "number"},{name: "text", initial: "\"Hello!\"", type: "text"},{name: "posx", type: "number"},{name: "posy", type: "number"},{name: "width", type: "number"},{name: "bold", type: "bool"},{name:"italic", type: "bool"},{name:"size", type: "number"},{name:"color", type: "color"},{name:"family", type: "text"}], tip: "Modifies text in a window", show: ["level3","level4"] },
		{ name: "windowTextGet", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Gets the value in a text box in a window", show: ["level3","level4"] },
		{ name: "windowTextHide", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Hides text in a window", show: ["level3","level4"] },
		{ name: "windowTextRemove", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Deletes text in a window", show: ["level3","level4"] },
		{ name: "windowTextShow", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Shows text in a window", show: ["level3","level4"] },
		{ name: "windowUse", category: "window", parameters: [{name: "id", initial: 1, type: "number"}], tip: "Switches the active window", show: ["level3","level4"] },
		{ name: "writeAt", category: "draw", parameters: [{name: "text", initial: "\"Hello!\"", type: "text", tip: "Which text do you want to write?"},{name: "posx", initial: "centerX", type: "number", minValue: "minX", maxValue: "maxX", tip: "Where do you want to show it? Set the X coordinate"},{name: "posy", initial: "centerY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Where do you want to show it? Set the Y coordinate"},{name: "angle", initial: 0, type: "number", minValue: -360, maxValue: 360, tip: "In which angle to write the text?"}], tip: "Draws text at specified coodinates", show: ["level2","level3","level4"] }
	];

	/**
	 * Public variables set
	 * @type {Array<{name:String, value:*}>}
	 * @example { name: "repeatCount", value: undefined }
	 */
	$_eseecode.instructions.variables = [
		{ name: "repeatCount", value: undefined },
		{ name: "pi", value: Math.PI }
	];
