"use strict";

/**
 * Initializes the default instructions and variables
 * @private
 * @global $e.instructions.set Populates it
 * @global $e.instructions.variables Populates it
 * @example $e.instructions.init()
 */
$e.instructions.init = () => {

	/**
	 * Public instruction set
	 * @type { Array<{name:String, category:String, [parameters]:Array<{name:String, [type]:String, [optional]:Boolean, [initial]:String, [forceInitial]:Boolean, [tip]:String, [minValue]:Number, [maxValue]:Number, [stepValue]:Number, [validate]:function(String):Boolean, [noBrackets]:Boolean, [separator]:String}>, [tip]:String, show:Array<String>, [type]:String, [nameRewrite]:{name:String, reduced:String, code:String}, [code]:Array<[prefix]:String, [space]:Boolean, [noBrackets]:Boolean, [suffix]:String>}>, [container]:Array<{instruction:String, optional:Boolean, multiple:Boolean}>, [showParams]:Boolean, [noChange]:Boolean, [maxInstances]:Number, [countInstances]:Number, classes:Array<String>, reportContainer:Boolean, nondeterministic:Boolean }
	 * @example { name: "forward", category: "guide", parameters: [ {name: "pixels", type: "number", initial: 100, tip: "How many pixels do you want to move forward?"} ], tip: "Moves forward", show: [ "level2", "level3", "level4" ] }
	 */
	$e.instructions.set = {
		"null": { name: "null", category: "internal", parameters: [ { name: "text", type: "text", noBrackets: true } ], nameRewrite: { code: "" }, code: { noBrackets: true } },
		"nullChild": { name: "nullChild", category: "internal", parameters: [ { name: "text", type: "text", noBrackets: true } ], nameRewrite: { code: "" }, code: { noBrackets: true } },
		"object-container": { name: "object-container", category: "other", type: "object", nameRewrite: { name: "{}", reduced: "{}", code: "" }, container: [ { instruction: "object" }, { instruction: "endObject" } ], classes: [ "container" ] },
		"object": { name: "object", category: "other", type: "object", nameRewrite: { code: "" }, code: { prefix: "{ " }, classes: [ "contained" ] },
		"comment": { name: "comment", category: "other", parameters: [ { name: "comment", type: "other", noBrackets: true } ], tip: "Comment text, ignored during execution", show: [ "level3", "level4" ], nameRewrite: { name: "Comment", reduced: "//", code: "//", "level4": "//", }, code: { space: true, noBrackets: true } },
		"commentmultiline-container": { name: "commentmultiline-container", category: "other", tip: "Comment text, ignored during execution", nameRewrite: { name: "Comment", reduced: "/* */", code: "" }, container: [ { instruction: "commentmultiline" }, { instruction: "endComment" } ], classes: [ "container" ] },
		"commentmultiline": { name: "commentmultiline", category: "other", parameters: [ { name: "comment", type: "other", noBrackets: true } ], tip: "Comment text, ignored during execution", nameRewrite: { name: "Comment", reduced: "/* */:", code: "/*" }, code: { space: true, noBrackets: true }, classes: [ "contained" ] },
		"commentmultilinesingle": { name: "commentmultilinesingle", category: "other", parameters: [ { name: "comment", type: "text", noBrackets: true } ], tip: "Comment text, ignored during execution", nameRewrite: { name: "Comment", reduced: "/*", code: "/*" }, code: { space: true, noBrackets: true, suffix: " */" } },
		"beginShape": { name: "beginShape", category: "guide", tip: "Begins a shape definition" },
		"endShape": { name: "endShape", category: "guide", tip: "Ends a shape definition" },
		"clean": { name: "clean", category: "canvas", parameters: [ { name: "id", type: "layer", minValue: 0, optional: true, tip: "Which layer do you want to clean?\n(Leave blank to clean the current layer)" } ], tip: "Wipes the canvas", show: [ "level3", "level4" ] },
		//"flipHorizontally": { name: "flipHorizontally", category: "canvas", tip: "Flips the canvas horizontally", show: [ "level2", "level3", "level4" ] },
		//"flipVertically": { name: "flipVertically", category: "canvas", tip: "Flips the canvas vertically", show: [ "level2", "level3", "level4" ] },
		"blank": { name: "blank", category: "guide", show: [ "level2" ] },
		"forward": { name: "forward", category: "guide", parameters: [ { name: "pixels", initial: 100, type: "number", tip: "How many pixels do you want to move forward?" } ], tip: "Moves forward", show: [ "level2", "level3", "level4" ] },
		"forward1": { name: "forward", category: "guide", parameters: [ { name: "pixels", initial: 100, type: "number", tip: "How many pixels do you want to move forward?" } ], tip: "Moves 100 steps forward", show: [ "level1" ] },
		"forward2": { name: "forward", category: "guide", parameters: [ { name: "pixels", initial: 50, type: "number", tip: "How many pixels do you want to move forward?" } ], tip: "Moves 50 steps forward", show: [ "level1" ] },
		"forward3": { name: "forward", category: "guide", parameters: [ { name: "pixels", initial: 25, type: "number", tip: "How many pixels do you want to move forward?" } ], tip: "Moves 25 step forward", show: [ "level1" ] },
		"blank1": { name: "blank", category: "guide", show: [ "level1" ] },
		"turnLeft": { name: "turnLeft", category: "guide", parameters: [ { name: "degrees", initial: 90, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?" } ], tip: "Turns left", show: [ "level2", "level3", "level4" ] },
		"turnLeft1": { name: "turnLeft", category: "guide", parameters: [ { name: "degrees", initial: 90, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?" } ], tip: "Turns 90 degrees left", show: [ "level1" ] },
		"turnLeft2": { name: "turnLeft", category: "guide", parameters: [ { name: "degrees", initial: 45, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?" } ], tip: "Turns 45 degrees left", show: [ "level1" ] },
		"turnLeft3": { name: "turnLeft", category: "guide", parameters: [ { name: "degrees", initial: 15, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?" } ], tip: "Turns 15 degrees left", show: [ "level1" ] },
		"blank2": { name: "blank", category: "guide", show: [ "level1" ] },
		"turnRight": { name: "turnRight", category: "guide", parameters: [ { name: "degrees", initial: 90, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?" } ], tip: "Turns right", show: [ "level2", "level3", "level4" ] },
		"turnRight1": { name: "turnRight", category: "guide", parameters: [ { name: "degrees", initial: 90, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?" } ], tip: "Turns 90 degrees right", show: [ "level1" ] },
		"turnRight2": { name: "turnRight", category: "guide", parameters: [ { name: "degrees", initial: 45, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?" } ], tip: "Turns 45 degrees right", show: [ "level1" ] },
		"turnRight3": { name: "turnRight", category: "guide", parameters: [ { name: "degrees", initial: 15, type: "number", minValue: -360, maxValue: 360, tip: "How many degrees do you want to turn?" } ], tip: "Turns 15 degrees right", show: [ "level1" ] },
		"turnReset": { name: "turnReset", category: "guide", parameters: [ { name: "degrees", type: "number", initial: 0, minValue: -360, maxValue: 360, optional: true, tip: "Which angle do you want the pointer to face?\n(Leave blank to reset to initial state)" } ], tip: "Resets the angle to initial rotation", show: [ "level3", "level4" ] },
		"blank3": { name: "blank", category: "guide", show: [ "level1", "level2" ] },
		"arc": { name: "arc", category: "guide", parameters: [ { name: "radius", initial: 50, type: "number", minValue: 0, tip: "Radius of the arc" }, { name: "degrees", optional: true, type: "number", minValue: -360, maxValue: 360, tip: "Degrees to turn the arc" }, { name: "follow", type: "bool", initial: false, optional: true, tip: "Should the arc follow the guide's position and angle and move the guide to the end of the arc?" }, { name: "counterclockwise", type: "bool", initial: false, optional: true, tip: "Draw the arc counterclockwise?" } ], tip: "Draws an arc", show: [ "level2", "level3", "level4" ] },
		"line": { name: "line", category: "guide", parameters: [ { name: "destinationx", initial: "centerX", type: "number", minValue: "minX", maxValue: "maxX", tip: "Set X coordinate to go to" }, { name: "destinationy", initial: "centerY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Set Y coordinate to go to" } ], tip: "Draws a line from current position to specified coordinates", show: [ "level2", "level3", "level4" ] },
		"write": { name: "write", category: "guide", parameters: [ { name: "text", initial: "Hello!", type: "text", tip: "Which text do you want to write?" } ], tip: "Draws text", show: [ "level2", "level3", "level4" ] },
		"blank4": { name: "blank", category: "guide", show: [ "level2" ] },
		//"changeAxis": { name: "changeAxis", category: "value", parameters: [ { name: "posx", type: "number", initial: 0, minValue: 0, maxValue: 400, optional: true, tip: "X coordinate of the center of axis, counting the origin at the upper left corner of the whiteboard" }, { name: "posy", type: "number", initial: 0, minValue: 0, maxValue: 400, optional: true, tip: "Y coordinate of the center of axis, counting the origin at the upper left corner of the whiteboard" }, { name: "xScale", type: "number", initial: 1, optional: true, tip: "Scale by which to multiply the X coordinates" }, { name: "yScale", type: "number", initial: 1, optional: true, tip: "Scale by which to multiply the Y coordinates" } ], tip: "Changes the axis", show: [ "level4" ] },
		"setAxis": { name: "setAxis", category: "value", parameters: [ { name: "firstX", type: "number", initial: "minX", tip: "First value in the horizontal axis (left)" }, { name: "lastX", type: "number", initial: "maxX", tip: "Last value in the horizontal axis (right)" }, { name: "firstY", type: "number", initial: "minY", tip: "First value in the vertical axis (bottom)" }, { name: "lastY", type: "number", initial: "maxY", tip: "Last value in the horizontal axis (up)" } ], tip: "Changes the axis", show: [ "level4" ] },
		"getArccosine": { name: "getArccosine", category: "value", parameters: [ { name: "number", initial: 90, type: "number", tip: "Value" } ], type: "number", tip: "Returns the arccosine", show: [ "level4" ] },
		"getArcsine": { name: "getArcsine", category: "value", parameters: [ { name: "number", initial: 90, type: "number", tip: "Value" } ], type: "number", tip: "Returns the arcsine", show: [ "level4" ] },
		"getArctangent": { name: "getArctangent", category: "value", parameters: [ { name: "number", initial: 90, type: "number", tip: "Value" } ], type: "number", tip: "Returns the arctangent", show: [ "level4" ] },
		"getCosine": { name: "getCosine", category: "value", parameters: [ { name: "degrees", initial: 90, type: "number", tip: "Value in degrees" } ], type: "number", tip: "Returns the cosine", show: [ "level4" ] },
		"getLayerHeight": { name: "getLayerHeight", category: "value", type: "number", tip: "Returns the canvas height", show: [ "level4" ] },
		"getLayerWidth": { name: "getLayerWidth", category: "value", type: "number", tip: "Returns the canvas width", show: [ "level4" ] },
		"getLayerName": { name: "getLayerName", category: "value", type: "text", tip: "Returns the current canvas' name", show: [ "level4" ] },
		"getLayerVisibility": { name: "getLayerVisibility", category: "value", parameters: [ { name: "layerId", type: "layer", initial: 0, optional: true, tip: "Which layer do you want to query?" } ], type: "bool", tip: "Returns if the layer is visible", show: [ "level4" ] },
		"getLayerExists": { name: "getLayerExists", category: "value", parameters: [ { name: "layerId", type: "string|number", initial: 0, tip: "Which layer do you want to query?" } ], type: "bool", tip: "Returns whether the layer exists or not", show: [ "level4" ] },
		"getLayerHeight": { name: "getLayerHeight", category: "value", type: "number", tip: "Returns the canvas height", show: [ "level4" ] },
		"getSize": { name: "getSize", category: "value", type: "number", tip: "Returns the size for future drawing lines and text", show: [ "level4" ] },
		"getColor": { name: "getColor", category: "value", type: "number", tip: "Returns the color for future drawing lines and text", show: [ "level4" ] },
		"getBold": { name: "getBold", category: "value", type: "boolean", tip: "Returns whether text will be drawn in bold", show: [ "level4" ] },
		"getItalic": { name: "getItalic", category: "value", type: "string", tip: "Returns the font name in which text will be drawn", show: [ "level4" ] },
		"getFont": { name: "getFont", category: "value", type: "boolean", tip: "Returns whether text will be drawn in bold", show: [ "level4" ] },
		"getRandomColor": { name: "getRandomColor", category: "value", type: "color", tip: "Returns a random color", show: [ "level4" ], nondeterministic: true },
		"getRandomNumber": { name: "getRandomNumber", category: "value", parameters: [ { name: "number", initial: 100, type: "number", minValue: 0, tip: "Maximum possible random value desired" } ], type: "number", tip: "Returns a random number", show: [ "level4" ], nondeterministic: true },
		"getRGB": { name: "getRGB", category: "value", parameters: [ { name: "red", initial: 0, type: "number", tip: "Red component" }, { name: "green", initial: 0, type: "number", tip: "Green component" }, { name: "blue", initial: 0, type: "number", tip: "Blue component" } ], type: "number", tip: "Returns a color from and RGB definition", show: [ "level4" ] },
		"getSine": { name: "getSine", category: "value", parameters: [ { name: "degrees", initial: 90, type: "number", tip: "Value in degrees" } ], type: "number", tip: "Returns the sine", show: [ "level4" ] },
		"getTangent": { name: "getTangent", category: "value", parameters: [ { name: "degrees", initial: 90, type: "number", tip: "Value in degrees" } ], type: "number", tip: "Returns the tangent", show: [ "level4" ] },
		"getSquareRoot": { name: "getSquareRoot", category: "value", parameters: [ { name: "number", initial: 0, type: "number", tip: "Value in degrees" } ], type: "number", tip: "Returns the square root of the number", show: [ "level4" ] },
		"getAngle": { name: "getAngle", category: "value", parameters: [ { name: "id", type: "layer", initial: 0, optional: true, tip: "Which layer do you want to query?" } ], type: "number", tip: "Returns the current angle", show: [ "level4" ] },
		"getX": { name: "getX", category: "value", parameters: [ { name: "id", type: "layer", initial: 0, optional: true, tip: "Which layer do you want to query?" } ], type: "number", tip: "Returns the X coordinate", show: [ "level4" ] },
		"getY": { name: "getY", category: "value", parameters: [ { name: "id", type: "layer", initial: 0, optional: true, tip: "Which layer do you want to query?" } ], type: "number", tip: "Returns the Y coordinate", show: [ "level4" ] },
		"getLayerImage": { name: "getLayerImage", category: "value", parameters: [ { name: "id", type: "layer", initial: 0, optional: true, tip: "Which layer do you want to query?" } ], type: "text", tip: "Returns the image in the canvas", show: [ "level4" ] },
		"getTimestamp": { name: "getTimestamp", category: "value", type: "number", tip: "Returns a timestamp of the current hour", show: [ "level4" ], nondeterministic: true },
		"getYear": { name: "getYear", category: "value", type: "number", tip: "Returns the current year", show: [ "level4" ], nondeterministic: true },
		"getMonth": { name: "getMonth", category: "value", type: "number", tip: "Returns the current month", show: [ "level4" ], nondeterministic: true },
		"getDay": { name: "getDay", category: "value", type: "number", tip: "Returns the current day of the month", show: [ "level4" ], nondeterministic: true },
		"getWeekDay": { name: "getWeekDay", category: "value", type: "number", tip: "Returns the current day of the week", show: [ "level4" ], nondeterministic: true },
		"getHours": { name: "getHours", category: "value", type: "number", tip: "Returns the current hour", show: [ "level4" ], nondeterministic: true },
		"getMinutes": { name: "getMinutes", category: "value", type: "number", tip: "Returns the current minute", show: [ "level4" ], nondeterministic: true },
		"getSeconds": { name: "getSeconds", category: "value", type: "number", tip: "Returns the current second", show: [ "level4" ], nondeterministic: true },
		"getMilliseconds": { name: "getMilliseconds", category: "value", type: "number", tip: "Returns the current milliseconds in the current second", show: [ "level4" ], nondeterministic: true },
		"getCharFromCode": { name: "getCharFromCode", category: "value", parameters: [ { name: "code", type: "number", initial: 0, tip: "Which key code do you want to convert?" } ], type: "string", tip: "Returns the character corresponding to a key code", show: [ "level4" ] },
		"getPixelColor": { name: "getPixelColor", category: "value", parameters: [ { name: "x", type: "number", initial: "centerX", tip: "Coordinate x of the position to check the color" }, { name: "y", type: "number", initial: "centerY", tip: "Coordinate y of the position to check the color" }, { name: "id", type: "layer", initial: 0, optional: true, tip: "Which layer do you want to query?" } ], type: "number", tip: "Returns the color in a certain coordinate in the current layer", show: [ "level4" ] },
		"getPointerX": { name: "getPointerX", category: "value", type: "number", tip: "Returns the horitzontal position of the pointer (mouse or touch gesture) in the whiteboard", show: [ "level4" ], nondeterministic: true },
		"getPointerY": { name: "getPointerY", category: "value", type: "number", tip: "Returns the vertical position of the pointer (mouse or touch gesture) in the whiteboard", show: [ "level4" ], nondeterministic: true },
		"getPointerLastX": { name: "getPointerLastX", category: "value", type: "number", tip: "Returns the horitzontal position of the pointer the last time it was clicked (mouse or touch gesture) in the whiteboard", show: [ "level4" ], nondeterministic: true },
		"getPointerLastY": { name: "getPointerLastY", category: "value", type: "number", tip: "Returns the vertical position of the pointer the last time it was clicked (mouse or touch gesture) in the whiteboard", show: [ "level4" ], nondeterministic: true },
		"getPointerOver": { name: "getPointerOver", category: "value", type: "number", tip: "Checks whether the pointer (mouse or touch gesture) is over the whiteboard", show: [ "level4" ], nondeterministic: true },
		"getPointerPressed": { name: "getPointerPressed", category: "value", type: "number", tip: "Checks whether the pointer (mouse or touch panel) is being pressed (click if its a mouse, touch if its a tocuh device)", show: [ "level4" ], nondeterministic: true },
		"getKeyboardLastKey": { name: "getKeyboardLastKey", category: "value", type: "number", tip: "Returns the value of the last key in the keyboard that was being pressed", show: [ "level4" ], nondeterministic: true },
		"getKeyboardKey": { name: "getKeyboardKey", category: "value", type: "number", tip: "Returns the value of the key in the keyboard is being pressed", show: [ "level4" ], nondeterministic: true },
		"getKeyboardPressed": { name: "getKeyboardPressed", category: "value", type: "number", tip: "Checks if a key in the keyboard is being pressed", show: [ "level4" ], nondeterministic: true },
		"setSize3": { name: "setSize", category: "guide", parameters: [ { name: "size", initial: 4, type: "number", tip: "Which size in pixels do you want to set?" } ], tip: "Sets the drawing size to thick", show: [ "level1" ] },
		"setSize2": { name: "setSize", category: "guide", parameters: [ { name: "size", initial: 2, type: "number", tip: "Which size in pixels do you want to set?" } ], tip: "Sets the drawing size to thick", show: [ "level1" ] },
		"setSize1": { name: "setSize", category: "guide", parameters: [ { name: "size", initial: 1, type: "number", tip: "Which size in pixels do you want to set?" } ], tip: "Sets the drawing size to thick", show: [ "level1" ] },
		"blank5": { name: "blank", category: "guide", show: [ "level1" ] },
		"setColor": { name: "setColor", category: "guide", parameters: [ { name: "color", initial: "#FF0000", type: "color", tip: "Which color do you want to use?" } ], tip: "Sets the color for  forward drawings", show: [ "level2", "level3", "level4" ] },
		"unsetColor": { name: "unsetColor", category: "guide", tip: "Sets the color for forward drawings to transparent", show: [ "level2", "level3", "level4" ] },
		"blank6": { name: "blank", category: "guide", show: [ "level1", "level2" ] },
		"hide": { name: "hide", category: "canvas", parameters: [ { name: "layerId", type: "layer", initial: 0, optional: true, tip: "Which layer do you want to hide?\n(Leave blank to hide the current layer)" }, { name: "hide", type: "bool", initial: true, optional: true, tip: "Whether to hide the layer or not" } ], tip: "Hides the canvas", show: [ "level3", "level4" ] },
		"image": { name: "image", category: "draw", parameters: [ { name: "source", initial: "", type: "text", tip: "URL of an image" }, { name: "posx", initial: "centerX", type: "number", minValue: "minX", maxValue: "maxX", tip: "X coordinate where the image will be painted" }, { name: "posy", initial: "centerY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Y coordinate where the image will be painted" }, { name: "centered", type: "bool", initial: false, optional: true, tip: "Do you want the image to be centered in the given position?" }, { name: "width", type: "number", optional: true, minValue: 0, tip: "Width to show the image, in pixels" }, { name: "height", type: "number", optional: true, minValue: 0, tip: "Height to show the image, in pixels" }, { name: "rotation", type: "number", initial: 0, optional: true, tip: "Degrees to rotate the image" }, { name: "flipX", type: "bool", initial: false, optional: true, tip: "Flip the image horizontally" }, { name: "flipY", type: "bool", initial: false, optional: true, tip: "Flip the image vertically" } ], tip: "Sticks an external image", show: [ "level2", "level3", "level4" ] },
		"lineAt": { name: "lineAt", category: "draw", parameters: [ { name: "originx", initial: "minX", type: "number", minValue: "minX", maxValue: "maxX", tip: "Where should the line begin? Set the X coordinate" }, { name: "originy", initial: "minY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Where should the line begin? Set the Y coordinate" }, { name: "destinationx", initial: "maxX", type: "number", minValue: "minX", maxValue: "maxX", tip: "Where should the line end? Set the X coordinate" }, { name: "destinationy", initial: "maxY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Where should the line end? Set the Y coordinate" } ], tip: "Draws a line from coordinate position to coordinate position", show: [ "level2", "level3", "level4" ] },
		//"move": { name: "move", category: "canvas", parameters: [ { name: "right", initial: 50, type: "number", tip: "Distance to move right" }, { name: "down", initial: 50, type: "number", tip: "Distance to move down" } ], tip: "Moves the canvas (offset canvas parts will be lost)", show: [ "level3", "level4" ] },
		//"moveDown": { name: "moveDown", category: "canvas", parameters: [ { name: "pixels", initial: 50, type: "number", tip: "Distance to move down" } ], tip: "Moves the canvas down (offset canvas parts will be lost)", show: [ "level3", "level4" ] },
		//"moveLeft": { name: "moveLeft", category: "canvas", parameters: [ { name: "pixels", initial: 50, type: "number", tip: "Distance to move left" } ], tip: "Moves the canvas left (offset canvas parts will be lost)", show: [ "level3", "level4" ] },
		//"moveRight": { name: "moveRight", category: "canvas", parameters: [ { name: "pixels", initial: 50, type: "number", tip: "Distance to move right" } ], tip: "Moves the canvas right (offset canvas parts will be lost)", show: [ "level3", "level4" ] },
		//"moveUp": { name: "moveUp", category: "canvas", parameters: [ { name: "pixels", initial: 50, type: "number", tip: "Distance to move up" } ], tip: "Moves the canvas up (offset canvas parts will be lost)", show: [ "level3", "level4" ] },
		"pull": { name: "pull", category: "canvas", parameters: [ { name: "levels", type: "number", initial: 1, minValue: 0, optional: true, tip: "How many layers do you want to pull it up?" }, { name: "id", type: "layer", initial: 0, minValue: 0, optional: true, tip: "Which layer do you want to pull?\n(Leave blank to affect the current layer)" } ], tip: "Pulls up a canvas layer", show: [ "level3", "level4" ] },
		"push": { name: "push", category: "canvas", parameters: [ { name: "levels", type: "number", initial: 1, minValue: 0, optional: true, tip: "How many layers do you want to push it down?" }, { name: "id", type: "layer", initial: 0, minValue: 0, optional: true, tip: "Which layer do you want to push?\n(Leave blank to affect the current layer)" } ], tip: "Pushes down a canvas layer", show: [ "level3", "level4" ] },
		"pop": { name: "pop", category: "canvas", parameters: [ { name: "id", type: "layer", initial: 0, minValue: 0, optional: true, tip: "Which layer do you want to delete?\n(Leave blank to affect the current layer)" } ], tip: "Deletes a layer", show: [ "level3", "level4" ] },
		//"rotateLeft": { name: "rotateLeft", category: "canvas", parameters: [ { name: "degrees", initial: 90, type: "number", tip: "Degrees to rotate the layer" }, { name: "axis", type: "number", initial: 0, minValue: 0, maxValue: 4, optional: true, tip: "Where should the center of the rotation be?\n0 = center (default), 1 = upper-left corner, 2 = upper-right corner, 3 = lower-right corner, 4= lower-left corner" } ], tip: "Rotates the canvas left (offset canvas parts will be lost)", show: [ "level3", "level4" ] },
		//"rotateRight": { name: "rotateRight", category: "canvas", parameters: [ { name: "degrees", initial: 90, type: "number", tip: "Degrees to rotate the layer" }, { name: "axis", type: "number", initial: 0, minValue: 0, maxValue: 4, optional: true, tip: "Where should the center of the rotation be?\n0 = center (default), 1 = upper-left corner, 2 = upper-right corner, 3 = lower-right corner, 4= lower-left corner" } ], tip: "Rotates the canvas right (offset canvas parts will be lost)", show: [ "level3", "level4" ] },
		//"scale": { name: "scale", category: "canvas", parameters: [ { name: "horizontal", initial: 0.5, type: "number", tip: "Scale by which to resize the layer horizontally" }, { name: "vertical", initial: 0.5, type: "number", tip: "Scale by which to resize the layer vertically" }, { name: "axis", type: "number", initial: 0, optional: true, tip: "Where should the center of the scale be?\n0 = center (default), 1 = upper-left corner, 2 = upper-right corner, 3 = lower-right corner, 4= lower-left corner" } ], tip: "Scales the canvas (offset canvas parts will be lost)", show: [ "level3", "level4" ] },
		"setSize": { name: "setSize", category: "guide", parameters: [ { name: "size", initial: 2, type: "number", minValue: 1, tip: "Which size in pixels do you want to set?" } ], tip: "Sets the drawing size", show: [ "level2", "level3", "level4" ] },
		"transparency": { name: "transparency", category: "guide", parameters: [ { name: "value", type: "number", initial: 0.5, stepValue: 0.05, minValue: 0, maxValue: 1, tip: "From 0 (invisible) to 1 (opaque), how invisible do you want to draw?" }, { name: "id", type: "layer", initial: 0, minValue: 0, optional: true, tip: "To which layer do you want to change its transparency?\n(Leave blank to affect the current layer)" } ], tip: "Sets the transparency of the layer", show: [ "level2", "level3", "level4" ] },
		"blank7": { name: "blank", category: "guide", show: [ "level1", "level2" ] },
		"unsetColor1": { name: "unsetColor", category: "guide", tip: "Sets the color for forward drawings to transparent", show: [ "level1" ] },
		"setColor7": { name: "setColor", category: "guide", parameters: [ { name: "color", initial: "#000000", type: "color", tip: "Which color do you want to use?" } ], tip: "Sets the color for forward drawings to black", show: [ "level1" ] },
		"blank8": { name: "blank", category: "guide", show: [ "level1" ] },
		"setColor1": { name: "setColor", category: "guide", parameters: [ { name: "color", initial: "#FF0000", type: "color", tip: "Which color do you want to use?" } ], tip: "Sets the color for forward drawings to red", show: [ "level1" ] },
		"setColor2": { name: "setColor", category: "guide", parameters: [ { name: "color", initial: "#00FF00", type: "color", tip: "Which color do you want to use?" } ], tip: "Sets the color for forward drawings to green", show: [ "level1" ] },
		"setColor3": { name: "setColor", category: "guide", parameters: [ { name: "color", initial: "#0000FF", type: "color", tip: "Which color do you want to use?" } ], tip: "Sets the color for forward drawings to blue", show: [ "level1" ] },
		"setColor4": { name: "setColor", category: "guide", parameters: [ { name: "color", initial: "#FFFF00", type: "color", tip: "Which color do you want to use?" } ], tip: "Sets the color for forward drawings to yellow", show: [ "level1" ] },
		"setColor5": { name: "setColor", category: "guide", parameters: [ { name: "color", initial: "#00FFFF", type: "color", tip: "Which color do you want to use?" } ], tip: "Sets the color for forward drawings to light blue", show: [ "level1" ] },
		"setColor6": { name: "setColor", category: "guide", parameters: [ { name: "color", initial: "#FFFFFF", type: "color", tip: "Which color do you want to use?" } ], tip: "Sets the color for forward drawings to white", show: [ "level1" ] },
		"setColor9": { name: "setColor", category: "guide", parameters: [ { name: "color", initial: "#AAAAAA", type: "color", tip: "Which color do you want to use?" } ], tip: "Sets the color for forward drawings to light grey", show: [ "level1" ] },
		"setColor8": { name: "setColor", category: "guide", parameters: [ { name: "color", initial: "#555555", type: "color", tip: "Which color do you want to use?" } ], tip: "Sets the color for forward drawings to grey", show: [ "level1" ] },
		"blank9": { name: "blank", category: "guide", show: [ "level1" ] },
		//"unsetSize": { name: "unsetSize", category: "guide", tip: "Resets the drawing size", show: [ "level1" ] },
		"setBold": { name: "setBold", category: "guide", parameters: [ { name: "bool", type: "bool", initial: true, optional: true, tip: "Do you want the text to be bold?" } ], tip: "Sets the bold property for future text", show: [ "level3", "level4" ] },
		"unsetBold": { name: "unsetBold", category: "guide", tip: "Unsets the bold property for future text", show: [ "level3", "level4" ] },
		"blank10": { name: "blank", category: "guide", show: [ "level2" ] },
		"setFont": { name: "setFont", category: "guide", parameters: [ { name: "font", initial: "\"Comic Sans MS\"", type: "font", tip: "Which font do you want to use?" } ], tip: "Sets the font for future text", show: [ "level3", "level4" ] },
		"unsetFont": { name: "unsetFont", category: "guide", tip: "Resets the font for future text", show: [ "level3", "level4" ] },
		"blank11": { name: "blank", category: "guide", show: [ "level2" ] },
		"setItalic": { name: "setItalic", category: "guide", parameters: [ { name: "bool", type: "bool", initial: true, optional: true, tip: "Do you want the text to be italic?" } ], tip: "Sets the italic property for future text", show: [ "level3", "level4" ] },
		"unsetItalic": { name: "unsetItalic", category: "guide", tip: "Resets the italic property for future text", show: [ "level3", "level4" ] },
		"show": { name: "show", category: "canvas", parameters: [ { name: "layerId", type: "layer", initial: true, optional: true, tip: "Which layer do you want to show?\n(Leave blank to show the current layer)" }, { name: "show", type: "bool", initial: true, optional: true, tip: "Whether to show the layer or not" } ], tip: "Shows the canvas", show: [ "level3", "level4" ] },
		"blank12": { name: "blank", category: "guide", show: [ "level1", "level2" ] },
		"goToUpLeft": { name: "goToUpLeft", category: "guide", tip: "Moves to the upper left of the canvas", show: [ "level1", "level2", "level3", "level4" ] },
		"goToUpRight": { name: "goToUpRight", category: "guide", tip: "Moves to the upper right of the canvas", show: [ "level1", "level2", "level3", "level4" ] },
		"goToCenter": { name: "goToCenter", category: "guide", tip: "Moves to the center of the canvas", show: [ "level1", "level2", "level3", "level4" ] },
		"goToLowLeft": { name: "goToLowLeft", category: "guide", tip: "Moves to the lower left of the canvas", show: [ "level1", "level2", "level3", "level4" ] },
		"goToLowRight": { name: "goToLowRight", category: "guide", tip: "Moves to the lower right of the canvas", show: [ "level1", "level2", "level3", "level4" ] },
		"goTo": { name: "goTo", category: "guide", parameters: [ { name: "posx", initial: "centerX", type: "number", minValue: "minX", maxValue: "maxX", tip: "Set X coordinate to go to" }, { name: "posy", initial: "centerY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Set Y coordinate to go to" } ], tip: "Moves to the specified coordinates in the canvas", show: [ "level2", "level3", "level4" ] },
		"blank13": { name: "blank", category: "guide", show: [ "level1", "level2" ] },
		"use": { name: "use", category: "canvas", parameters: [ { name: "id", type: "text", initial: 0, optional: true, tip: "Which layer do you want to switch to?\nIf the layer doesn't exist it will create it, unless the id is a number in which case it will get the corresponing layer in order from background to foreground so the layer has to exist in the stack of layers or it will fail.\n(Leave blank to create a new layer)", minValue: 0 } ], type: "text", tip: "Switches the active canvas, returns the name of the new current canvas", show: [ "level2", "level3", "level4" ] },
		"snapshot": { name: "snapshot", category: "canvas", parameters: [ { name: "id", type: "layer", initial: 0, optional: true, tip: "Which layer do you want the capture to go to?\n(Leave blank to save it in a new layer)" } ], type: "text", tip: "creates a clone of the current canvas, returns the name of the clone canvas", show: [ "level2", "level3", "level4" ] },
		"animate": { name: "animate", category: "canvas", parameters: [ { name: "action", initial: "", type: "text", tip: "Code to run" }, { name: "seconds", type: "number", initial: 0.5, minValue: 0.05, stepValue: 0.05, optional: true, tip: "How often to run the code (in seconds)" }, { name: "maxTimes", type: "number", optional: true, tip: "Maximum number of times to run the code" } ], tip: "Runs the action every certain amount of time", show: [ "level3", "level4" ] },
		"unanimate": { name: "unanimate", category: "canvas", parameters: [ { name: "handlerId", type: "text", initial: 0, optional: true, tip: "Handler ID of an animation, returned by the animate() call" } ], tip: "Stops an animation", show: [ "level3", "level4" ] },
		"animateLayers": { name: "animateLayers", category: "canvas", parameters: [ { name: "seconds", type: "number", initial: 0.5, stepValue: 0.1, minValue: 0, optional: true, tip: "How often to change the layer (in seconds)" } ], tip: "Shows one layer at a time every certain time", show: [ "level2", "level3", "level4" ] },
		"sound": { name: "sound", category: "canvas", parameters: [ { name: "source", initial: "", type: "text", tip: "URL of an audio" }, { name: "background", initial: false, type: "bool", optional: true, tip: "Play the sound in the background, without stopping the execution of the code" }, { name: "repeat", initial: false, type: "bool", optional: true, tip: "Loop audio, ony available if played in the background" } ], tip: "Play a audio file", show: [ "level3", "level4" ] },
		"stopSound": { name: "stopSound", category: "canvas", parameters: [ { name: "handlerId", initial: 0, type: "text", optional: true, tip: "Handler ID of an animation, returned by the sound() call" } ], tip: "Stop background sound", show: [ "level3", "level4" ] },
		"if-container": { name: "if-container", category: "flow", nameRewrite: { name: "if", reduced: "if", code: "" }, code: { space: true }, container: [ { instruction: "if" }, { instruction: "elseIf", optional: true, multiple: true}, { instruction: "else", optional: true }, { instruction: "end" } ], tip: "Conditional execution", show: [ "level2", "level3" ], classes: [ "conditional", "container" ] },
		"if": { name: "if", category: "flow", parameters: [ { name: "condition", initial: true, type: "bool", tip: "When should the code be triggered?" } ], tip: "Conditional execution", show: [ "level4" ], code: { space: true, suffix: " {" }, classes: [ "conditional", "contained" ] },
		"elseIf": { name: "elseIf", category: "flow", parameters: [ { name: "condition", initial: false, type: "bool", tip: "When should the code be triggered?" } ], tip: "Alternative branch to conditional execution", nameRewrite: { name: "else if", reduced: "else if", code: "else if" }, code: { prefix: "} ", space: true, suffix: " {" }, classes: [ "conditional", "contained" ] },
		"else": { name: "else", category: "flow", tip: "Alternative branch to conditional execution", code: { space: true, prefix: "} ", suffix: " {", noBrackets: true }, classes: [ "conditional", "contained" ], reportContainer: true },
		"switch-container": { name: "switch-container", category: "flow", tip: "Value based execution", tip: "Value based execution", code: { space: true }, nameRewrite: { name: "switch", reduced: "switch", code: "" }, container: [ { instruction: "switch" }, { instruction: "case", optional: true, multiple: true }, { instruction: "default", optional: true }, { instruction: "end" }, ], classes: [ "conditional", "container" ] },
		"switch": { name: "switch", category: "flow", parameters: [ { name: "identifier", initial: true, type: "bool", tip: "Where is the value we want to check?" } ], tip: "Value based execution", code: { space: true, suffix: " {" }, classes: [ "conditional", "contained" ] },
		"case": { name: "case", category: "flow", parameters: [ { name: "value", type: "text" } ], code: { extraIndent: true, space: true, noBrackets: true, suffix: ":" }, classes: [ "conditional", "contained" ] },
		"default": { name: "default", category: "flow", code: { extraIndent: true, suffix: " :" }, classes: [ "conditional", "contained" ], reportContainer: true },
		"try-container": { name: "try-container", category: "flow", nameRewrite: { name: "try", reduced: "try", code: "" }, container: [ { instruction: "try" }, { instruction: "catch" }, { instruction: "finally", optional: true }, { instruction: "end" }, ], classes: [ "conditional", "container" ] },
		"try": { name: "try", category: "flow", code: { suffix: " {" }, classes: [ "conditional", "contained"] },
		"catch": { name: "catch", category: "flow", parameters: [ { name: "identifier", initial: "e", type: "text", tip: "Exception to catch" } ], code: { space: true, prefix: "} ", suffix: " {" }, classes: [ "conditional", "contained" ] },
		"finally": { name: "finally", category: "flow", code: { space: true, prefix: "} ", suffix: " {" }, classes: [ "conditional", "contained" ] },
		"with-container": { name: "with-container", category: "flow", code: { space: true }, nameRewrite: { name: "with", reduced: "with", code: "" }, container: [ { instruction: "with" }, { instruction: "end" }, ], classes: [ "container" ] },
		"with": { name: "with", category: "flow", parameters: [ { name: "object", initial: [], type: "object" } ], code: { space: true, suffix: " {" }, classes: [ "contained" ] },
		"do-container": { name: "do-container", category: "flow", tip: "Conditional loop", nameRewrite: { name: "do while", reduced: "do while", code: "" }, container: [ { instruction: "do" }, { instruction: "endDo" }, ], classes: [ "loop", "container" ] },
		"do": { name: "do", category: "flow", code: { suffix: " {", noBrackets: true }, classes: [ "loop", "contained" ] },
		"endDo": { name: "endDo", category: "flow", parameters: [ { name: "condition", initial: false, type: "bool" } ], nameRewrite: { name: "while", reduced: "while", code: "while" }, code: { space: true, prefix: "} " }, classes: [ "loop", "contained" ] },
		"while-container": { name: "while-container", category: "flow", code: { space: true }, nameRewrite: { name: "while", reduced: "while", code: "" }, tip: "Conditional loop", show: [ "level2", "level3" ], container: [ { instruction: "while" }, { instruction: "end" }, ], classes: [ "loop", "container" ] },
		"while": { name: "while", category: "flow", parameters: [ { name: "condition", initial: false, type: "bool", tip: "The code will be triggered as long as the following condition remains true" } ], tip: "Conditional loop", show: [ "level4" ], code: { space: true, suffix: " {" }, classes: [ "loop", "contained"] },
		"repeat-container": { name: "repeat-container", category: "flow", code: { space: true }, nameRewrite: { name: "repeat", reduced: "repeat", code: "" }, tip: "Repeating loop", show: [ "level2", "level3" ], container: [ { instruction: "repeat" }, { instruction: "end" }, ], classes: [ "loop", "container" ] },
		"repeat": { name: "repeat", category: "flow", parameters: [ { name: "number", initial: 1, type: "number", minValue: 0, tip: "How many times do you want to run the code?" } ], tip: "Repeating loop", show: [ "level4" ], code: { space: true, suffix: " {" }, classes: [ "loop", "contained"] },
		"fill-container": { name: "fill-container", category: "guide", tip: "Draw a shape", show: [ "level2", "level3", "level4" ], code: { space: true }, nameRewrite: { name: "fill", reduced: "fill", code: "" }, show: [ "level2", "level3" ], container: [ { instruction: "fill" }, { instruction: "end" }, ], classes: [ "container" ] },
		"fill": { name: "fill", category: "guide", parameters: [ { name: "fillColor", initial: "#000000", type: "color", tip: "Which fill color do you want to use?" }, { name: "borderColor", initial: "#000000", type: "color", tip: "Which border color do you want to use?" } ], tip: "Draw a shape", show: [ "level4" ], code: { space: true, suffix: " {" }, classes: [ "contained" ] },
		"for-container": { name: "for-container", category: "flow", code: { space: true }, nameRewrite: { name: "for", reduced: "for", code: "" }, container: [ { instruction: "for" }, { instruction: "end" }, ], classes: [ "loop", "container" ] },
		"for": { name: "for", category: "flow", parameters: [ { name: "initialization;condition;update", initial: ";false;", type: "text", tip: "For syntax: initialize; condition; increment" } ], code: { space: true, suffix: " {" }, classes: [ "loop", "contained" ] },
		"forIn-container": { name: "forIn-container", category: "flow", code: { space: true }, nameRewrite: { name: "for in", reduced: "for in", code: "" }, container: [ { instruction: "forIn" }, { instruction: "end" }, ], classes: [ "loop", "container" ] },
		"forIn": { name: "forIn", category: "flow", parameters: [ { name: "iteration", initial: "x in []", type: "text", tip: "For...in syntax: variable in sequence" } ], nameRewrite: { name: "for", reduced: "for", code: "for" }, code: { space: true, suffix: " {" }, classes: [ "loop", "contained" ] },
		"end": { name: "end", category: "internal", tip: "End flow break", nameRewrite: { name: "", reduced: "", code: "}" }, code: { noBrackets: true } },
		"endObject": { name: "endObject", category: "internal", tip: "End object definition", nameRewrite: { name: "", reduced: "", code: " }" }, code: { noBrackets: true } },
		"endComment": { name: "endComment", category: "internal", tip: "End flow break", nameRewrite: { name: "", reduced: "", code: "*/" }, code: { noBrackets: true } },
		"wait": { name: "wait", category: "flow", parameters: [ { name: "milliseconds", initial: 1000, minValue: 0, type: "number", tip: "Milliseconds to wait" } ], tip: "Stops execution for the specified time (in milliseconds)", show: [ "level3", "level4" ], nondeterministic: true }, // wait is deterministic, but we want it to be skipped when stepping backwards
		//"stop": { name: "stop", category: "flow", tip: "Stop the execution", show: [ "level2", "level3", "level4" ] },
		"label": { name: "label", category: "flow", parameters: [ { name: "identifier", type: "text", validate: variable => { return (variable.match(/^[ A-Za-z ][ A-Za-z_0-9 ]*$/)); }, noBrackets: true, tip: "Name of the label" } ], tip: "Label a spot in the code", nameRewrite: { code: "" }, code: { suffix: ":" } },
		"call": { name: "call", category: "flow", parameters: [ { name: "identifier", type: "text", validate: variable => { return (variable.match(/^[ A-Za-z ][ A-Za-z_0-9 ]*$/)); }, noBrackets: true, tip: "Name of the function to call" }, { name: "parameters...", type: "text", tip: "Parameters to provide the function with" } ], tip: "Call a custom function", nameRewrite: { name: "call", reduced: "", code: "" }, show: [ "level3" ] },
		"return": { name: "return", category: "flow", parameters: [ { name: "value", type: "text", optional: true, tip: "Value to return" } ], tip: "Return to calling function", show: [ "level3", "level4" ], code: { space: true, noBrackets: true } },
		"break": { name: "break", category: "flow", parameters: [ { name: "value", type: "text", optional: true, tip: "How many loop structures do you want to break?" } ], tip: "End loop execution", code: { space: true, noBrackets: true } },
		"continue": { name: "continue", category: "flow", parameters: [ { name: "value", type: "text", optional: true, tip: "How many loop structures do you want to continue?" } ], tip: "Skip to next loop iteration", code: { space: true, noBrackets: true } },
		"var": { name: "var", category: "objects", parameters: [ { name: "identifier", type: "var", validate: variable => { return (variable.match(/^[ A-Za-z ][ A-Za-z_0-9 ]*$/)); }, tip: "Provide a unique identifier for the variable" }, { name: "value", type: "var", initial: undefined, optional: true, separator: "=", tip: "Provide an initial value for the variable" } ], tip: "Declare a new variable", show: [ "level3", "level4" ], code: { space: true, noBrackets: true } },
		"array": { name: "array", category: "objects", parameters: [ { name: "identifier", type: "var", validate: variable => { return (variable.match(/^[ A-Za-z ][ A-Za-z_0-9 ]*$/)); }, noBrackets: true, tip: "Provide a unique identifier for the array" } ], tip: "Declare a new array", show: [ "level3", "level4" ], code: { space: true, noBrackets: true } },
		"=": { name: "=", category: "objects", nameRewrite: { name: "=", reduced: "=", code: "" }, parameters: [ { name: "variable", type: "var", tip: "Name of the variable", validate: variable => { return (variable.match(/^[ A-Za-z ][ A-Za-z_0-9 ]*$/)); }, noBrackets: true }, { name: "value", initial: undefined, type: "var", tip: "Which value do you want to give the variable?", validate: variable => { const varTrimmed = variable.replace(/^\s+|\s+$/gm, ''); return !(varTrimmed.length === 0 || (varTrimmed.startsWith("'") && varTrimmed.match(/'/g).length == 1) || (varTrimmed.startsWith("\"") && varTrimmed.match(/"/g).length == 1)); }, noBrackets: true, separator: "=" } ], type: "var", tip: "Assigns a value to a variable", show: [ "level3" ], code: { space: true, noBrackets: true } },
		"function-container": { name: "function-container", category: "objects", nameRewrite: { name: "function", reduced: "function", code: "" }, container: [ { instruction: "function" }, { instruction: "end" }, ], tip: "Declares a new function", show: [ "level3" ] },
		"function": { name: "function", category: "objects", parameters: [ { name: "identifier", type: "var", validate: variable => { return (variable.match(/^[ A-Za-z ][ A-Za-z_0-9 ]*$/)); }, space: true, noBrackets: true, tip: "Provide a unique identifier for the function" }, { name: "parameters...", type: "parameters", optional: true, tip: "Provide the list of parameters the function will process" } ], tip: "Declares a new function", show: [ "level4" ], code: { suffix: " {" }, classes: [ "contained" ] },
		"say": { name: "say", category: "objects", parameters: [ { name: "message", type: "text", tip: "Message to display" }, { name: "timeout", type: "number", tip: "Milliseconds to wait before closing the message" } ], tip: "Stops execution and waits for the user to accept the message", show: [ "level3", "level4" ], nondeterministic: true }, // say is deterministic, but we want it to be skipped when stepping backwards
		"ask": { name: "ask", category: "objects", parameters: [ { name: "message", type: "text", tip: "Message to display in the prompt", optional: true }, { name: "initial_value", type: "text", tip: "Initial value to display", optional: true, }, { name: "timeout", type: "number", tip: "Milliseconds to wait before cancelling the prompt", optional: true, } ], tip: "Stops execution and waits for the user to enter a value", show: [ "level3", "level4" ], nondeterministic: true },
		"input": { name: "input", category: "objects", parameters: [ { name: "type", type: "text", initial: "guess", validate: variable => { return (variable=="char"||variable=="word"||variable=="number"||variable=="integer"||variable=="line"||variable=="guess"||variable==undefined); }, tip: "How to read the input. Possible values: \"char\", \"word\", \"number\", \"integer\", \"line\", \"guess\"", optional: true } ], tip: "Read an input from the I/O area", show: [ "level3", "level4" ], nondeterministic: true },
		"getInputPosition": { name: "getInputPosition", category: "value", tip: "Returns the position in the input string", show: [ "level3", "level4" ] },
		"inputReset": { name: "inputReset", category: "objects", parameters: [ { name: "position", type: "number", initial: 0, minValue: 0, optional: true, tip: "What is the position in the input string?" } ], tip: "Resets the position from where we read the input string", show: [ "level3", "level4" ] },
		"output": { name: "output", category: "objects", parameters: [ { name: "text", type: "text", initial: "", tip: "Value to output", optional: true }, { name: "newline", type: "bool", initial: true,  tip: "Do you want a new line?", optional: true } ], tip: "Output a text in the I/O area", show: [ "level3", "level4" ] },
		"windowButtonCreate": { name: "windowButtonCreate", category: "window", parameters: [ { name: "window", initial: 0, type: "text", minValue: 0, tip: "In which window do you want to create it?" }, { name: "id", initial: 1, type: "text", minValue: 0, tip: "Provide an identifier unique for its containing window" }, { name: "text", type: "text", initial: "Click me!", optional: true, tip: "Text in the button" }, { name: "posx", type: "number", initial: 0, optional: true, minValue: 0, tip: "X coordinate where to place it" }, { name: "posy", type: "number", initial: 0, optional: true, minValue: 0, tip: "Y coordinate where to place it" }, { name: "action", type: "text", optional: true, tip: "Action to run when clicked" }, { name: "width", type: "number", initial: 200, optional: true, minValue: 0, tip: "Width of the element" }, { name: "height", type: "number", initial: 20, optional: true, minValue: 0, tip: "Height of the element" } ], tip: "Creates a button in a window", show: [ "level4" ] },
		"windowButtonEdit": { name: "windowButtonEdit", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" }, { name: "text", type: "text", initial: "Click me!", optional: true, tip: "Text in the button" }, { name: "posx", type: "number", initial: 0, optional: true, minValue: 0, tip: "X coordinate where to place it" }, { name: "posy", type: "number", initial: 0, optional: true, minValue: 0, tip: "Y coordinate where to place it" }, { name: "action", type: "text", optional: true, tip: "Action to run when clicked" }, { name: "width", type: "number", initial: 200, minValue: 0, optional: true, tip: "Width of the element" }, { name: "height", type: "number", initial: 20, minValue: 0, optional: true, tip: "Height of the element" } ], tip: "Modifies a button in a window", show: [ "level4" ] },
		"windowButtonHide": { name: "windowButtonHide", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Hides a button in a window", show: [ "level4" ] },
		"windowButtonRemove": { name: "windowButtonRemove", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Deletes a button in a window", show: [ "level4" ] },
		"windowButtonShow": { name: "windowButtonShow", category: "window", parameters: [ { name: "id", initial: 0, type: "number", minValue: 0, tip: "Identifier of the element" } ], tip: "Shows a button in a window", show: [ "level4" ] },
		"windowClean": { name: "windowClean", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the window to affect\n(Leave blank to affect the current window)" } ], tip: "Deletes all elements in a window", show: [ "level4" ] },
		"windowHide": { name: "windowHide", category: "window", parameters: [ { name: "id", type: "text", initial: 0, optional: true, minValue: 0, tip: "Identifier of the window to affect\n(Leave blank to affect the current window)" } ], tip: "Hides a window", show: [ "level4" ] },
		"windowImageCreate": { name: "windowImageCreate", category: "window", parameters: [ { name: "window", initial: 0, type: "window", minValue: 0, tip: "In which window do you want to create it?" }, { name: "id", initial: 1, type: "text", minValue: 0, tip: "Provide an identifier unique for its containing window" }, { name: "layerId", initial: 1, type: "layer", tip: "Layer to use as image" }, { name: "posx", type: "number", initial: 0, optional: true, minValue: 0, tip: "Y coordinate where to place it" }, { name: "posy", type: "number", initial: 0, optional: true, minValue: 0, tip: "Y coordinate where to place it" }, { name: "width", type: "number", initial: 50, optional: true, minValue: 0, tip: "Width of the image" }, { name: "height", type: "number", initial: 50, optional: true, minValue: 0, tip: "Height of the image" }, { name:"onclick", type: "text", optional: true, tip: "Action to run when clicked" }, { name:"onmouseover", type: "text", optional: true, tip: "Action to run when the mouse goes over it" }, { name:"onmouseout", type: "text", optional: true, tip: "Action to run when the mouse moves away from it" } ], tip: "Creates an image in a window", show: [ "level4" ] },
		"windowImageEdit" :{ name: "windowImageEdit", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" }, { name: "layerId", initial: 1, type: "layer", tip: "Layer to use as image" }, { name: "posx", type: "number", initial: 0, optional: true, minValue: 0, tip: "X coordinate where to place it" }, { name: "posy", type: "number", initial: 0, optional: true, minValue: 0, tip: "Y coordinate where to place it" }, { name: "width", type: "number", initial: 50, optional: true, minValue: 0, tip: "Width of the image" }, { name: "height", type: "number", initial: 50, optional: true, minValue: 0, tip: "Height of the image" }, { name:"onclick", type: "text", optional: true, tip: "Action to run when clicked" }, { name:"onmouseover", type: "text", optional: true, tip: "Action to run when the mouse goes over it" }, { name:"onmouseout", type: "text", optional: true, tip: "Action to run when the mouse moves away from it" } ], tip: "Modifies a button in a window", show: [ "level4" ] },
		"windowImageHide": { name: "windowImageHide", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Hides an image in a window", show: [ "level4" ] },
		"windowImageRemove": { name: "windowImageRemove", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Deletes an image in a window", show: [ "level4" ] },
		"windowImageShow": { name: "windowImageShow", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Shows an image in a window", show: [ "level4" ] },
		"windowInputCreate": { name: "windowInputCreate", category: "window", parameters: [ { name: "window", initial: 0, type: "window", minValue: 0, tip: "In which window do you want to create it?" }, { name: "id", initial: 1, type: "text", minValue: 0, tip: "Provide an identifier unique for its containing window" }, { name: "posx", type: "number", initial: 0, optional: true, minValue: 0, tip: "X coordinate where to place it" }, { name: "posy", type: "number", initial: 0, optional: true, minValue: 0, tip: "Y coordinate where to place it" }, { name: "width", type: "number", initial: 50, optional: true, minValue: 0, tip: "Width of the element" }, { name: "height", type: "number", initial: 12, optional: true, minValue: 0, tip: "Height of the element" }, { name:"type", type: "text", optional: true, tip: "Type of content" } ], tip: "Creates an input box in a window", show: [ "level4" ] },
		"windowInputEdit": { name: "windowInputEdit", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" }, { name: "posx", type: "number", initial: 0, optional: true, minValue: 0, tip: "X coordinate where to place it" }, { name: "posy", type: "number", initial: 0, optional: true, minValue: 0, tip: "Y coordinate where to place it" }, { name: "width", type: "number", initial: 50, optional: true, minValue: 0, tip: "Width of the element" }, { name: "height", type: "number", initial: 12, optional: true, minValue: 0, tip: "Height of the element" }, { name:"type", type: "text", optional: true, tip: "Type of content" } ], tip: "Modifies an input box in a window", show: [ "level4" ] },
		"windowInputGet": { name: "windowInputGet", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Gets the value in an input box in a window", show: [ "level4" ], nondeterministic: true },
		"windowInputHide": { name: "windowInputHide", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Hides an input box in a window", show: [ "level4" ] },
		"windowInputRemove": { name: "windowInputRemove", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Deletes an input box in a window", show: [ "level4" ] },
		"windowInputSet": { name: "windowInputSet", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" }, { name: "text", type: "text", initial: "Some text", optional: true, tip: "Text to set in the input box" } ], tip: "Sets the value in the input box", show: [ "level4" ] },
		"windowInputShow": { name: "windowInputShow", category: "window", parameters: [ { name: "id", type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Shows an input box in a window", show: [ "level4" ] },
		"windowShow": { name: "windowShow", category: "window", parameters: [ { name: "id", type: "text", initial: 0, optional: true, minValue: 0, tip: "Identifier of the window to affect\n(Leave blank to affect the current window)" } ], tip: "Shows a window", show: [ "level4" ] },
		"windowTextCreate": { name: "windowTextCreate", category: "window", parameters: [ { name: "window", initial: 0, type: "window", minValue: 0, tip: "In which window do you want to create it?" }, { name: "id", initial: 1, type: "text", minValue: 0, tip: "Provide an identifier unique for its containing window" }, { name: "text", type: "text", initial: "Hello!", optional: true, tip: "Text to display" }, { name: "posx", type: "number", initial: 0, optional: true, minValue: 0, tip: "X coordinate where to place it" }, { name: "posy", type: "number", initial: 0, optional: true, minValue: 0, tip: "Y coordinate where to place it" }, { name: "width", type: "number", optional: true, minValue: 0, tip: "Width of the element" }, { name: "bold", type: "bool", initial: false, optional: true, tip: "Use bold font?" }, { name:"italic", type: "bool", initial: false, optional: true, tip: "Use italic font?" }, { name:"size", type: "number", initial: 10, minValue: 1, optional: true, tip: "Set the size of the text" }, { name:"color", type: "color", optional: true, initial: "#000000", tip: "Set the color of the text" }, { name:"family", type: "text", optional: true, tip: "Set the font of the text" } ], tip: "Creates text in a window", show: [ "level4" ] },
		"windowTextEdit": { name: "windowTextEdit", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" }, { name: "text", type: "text", initial: "Hello!", optional: true, tip: "Text to display" }, { name: "posx", type: "number", initial: 0, minValue: 0, optional: true, tip: "X coordinate where to place it" }, { name: "posy", type: "number", initial: 0, minValue: 0, optional: true, tip: "Y coordinate where to place it" }, { name: "width", type: "number", optional: true, minValue: 0, tip: "Width of the element" }, { name: "bold", type: "bool", initial: false, optional: true, tip: "Use bold font?" }, { name:"italic", type: "bool", initial: false, optional: true, tip: "Use italic font?" }, { name:"size", type: "number", initial: 10, minValue: 1, optional: true, tip: "Set the size of the text" }, { name:"color", type: "color", initial: "black", optional: true, tip: "Set the color of the text" }, { name:"family", type: "text", optional: true, tip: "Set the font of the text" } ], tip: "Modifies text in a window", show: [ "level4" ] },
		"windowTextGet": { name: "windowTextGet", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Gets the value in a text box in a window", show: [ "level4" ] },
		"windowTextHide": { name: "windowTextHide", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Hides text in a window", show: [ "level4" ] },
		"windowTextRemove": { name: "windowTextRemove", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Deletes text in a window", show: [ "level4" ] },
		"windowTextShow": { name: "windowTextShow", category: "window", parameters: [ { name: "id", initial: 0, type: "text", minValue: 0, tip: "Identifier of the element" } ], tip: "Shows text in a window", show: [ "level4" ] },
		"windowUse": { name: "windowUse", category: "window", parameters: [ { name: "id", type: "text", initial: 0, optional: true, minValue: 0, tip: "Identifier of the window to change to" } ], tip: "Switches the active window", show: [ "level4" ] },
		"writeAt": { name: "writeAt", category: "draw", parameters: [ { name: "text", initial: "Hello!", type: "text", tip: "Which text do you want to write?" }, { name: "posx", initial: "centerX", type: "number", minValue: "minX", maxValue: "maxX", tip: "Where do you want to show it? Set the X coordinate" }, { name: "posy", initial: "centerY", type: "number", minValue: "minY", maxValue: "maxY", tip: "Where do you want to show it? Set the Y coordinate" }, { name: "angle", type: "number", initial: 0, minValue: -360, maxValue: 360, optional: true, tip: "In which angle to write the text?" } ], tip: "Draws text at specified coodinates", show: [ "level2", "level3", "level4" ] }
	};

	/**
	 * Public variables set
	 * @type {Array<{name:String, value:*}>}
	 * @example { name: "repeatCount", value: undefined }
	 */
	$e.instructions.variables = [
		{ name: "repeatCount", value: undefined },
		{ name: "Pi", value: Math.PI },
		{ name: "Phi", value: (1+Math.sqrt(5))/2 },
		{ name: "E", value: Math.E }
	];

	/*
	 * Returns the value corresponding to the name provided for initial parameter values, or the original value otherwise
	 * @param {Object} value Value to parse
	 * @return Real value
	 * @example {Object} $e.instructions.parsePredefinedConstants("maxX")
	 */
	$e.instructions.parsePredefinedConstants = (value) => {
		if (value == "minX") {
			value = $e.backend.whiteboard.axis.system2userCoords({ x: 0, y: 0 }).x;
		} else if (value == "maxX") {
			value = $e.backend.whiteboard.axis.system2userCoords({ x: $e.backend.whiteboard.width, y: $e.backend.whiteboard.width }).x;
		} else if (value == "minY") {
			value = $e.backend.whiteboard.axis.system2userCoords({ x: 0, y: 0 }).y;
		} else if (value == "maxY") {
			value = $e.backend.whiteboard.axis.system2userCoords({ x: $e.backend.whiteboard.width, y: $e.backend.whiteboard.width }).y;
		} else if (value == "centerX") {
			value = $e.backend.whiteboard.axis.system2userCoords({ x: $e.backend.whiteboard.width / 2, y: $e.backend.whiteboard.width / 2 }).x;
		} else if (value == "centerY") {
			value = $e.backend.whiteboard.axis.system2userCoords({ x: $e.backend.whiteboard.width / 2, y: $e.backend.whiteboard.width / 2 }).y;
		}
		if (value === -0) value = 0;
		return value;
	};

	/**
	 * Returns the parameters of an instruction, or the default parameters if none were set
	 * In parameters it returns the parameters in an array, in text it returns the parameters ready to insert them in code
	 * @private
	 * @param {!String} instructionSetId Block element
	 * @param {Array<Object>} [values] Values of the parameters of the instruction
	 * @param {String} [instructionName] Name to overwrite the instruction with
	 * @return {parameters:Array<String>, strings:String} Parameters of an instruction, or the default parameters if none were set
	 * @example $e.instructions.getParameters("forward")
	 */
	$e.instructions.getParameters = (instructionSetId, values = [], instructionName) => {
		const instruction = $e.instructions.set[instructionSetId];
		const parameters = [];
		const strings = {
			name: "",
			reduced: "",
			flow: "",
			code: "",
		};
		if (instruction.parameters) {
			instruction.parameters.forEach((parameter, i) => {
				let param = undefined;
				const paramValue = values[i];
				if (paramValue !== undefined) {
					param = paramValue;
				} else if (parameter.initial !== undefined && (parameter.optional !== true || parameter.forceInitial === true)) {
					param = parameter.initial;
					if (typeof param == "string" && parameter.type == "number") {
						param = $e.instructions.parsePredefinedConstants(param);
					}
				} else if (i <= values.length) {
					param = "";
				}
				if (param !== undefined) {
					parameters.push(param);
				}
			});
			for (let i = instruction.parameters.length; i < values.length; i++) {
				const param = values[i];
				if (instructionSetId === "call") {
					parameters[parameters.length - 1] += (parameters[parameters.length - 1] ? ", " : "") + param;
				} else if (param) parameters.push(param);
			}
		}
		strings.name += instruction.nameRewrite && instruction.nameRewrite.name ? instruction.nameRewrite.name : instruction.name;
		strings.reduced += instruction.nameRewrite && instruction.nameRewrite.reduced ? instruction.nameRewrite.reduced : instruction.name;
		if (instructionName) {
			strings.code += instructionName;
		} else if (instruction.nameRewrite && instruction.nameRewrite.code !== undefined) {
			strings.code += instruction.nameRewrite.code;
		} else {
			strings.code += instruction.name;
		}
		let parametersText = "";
		let bracketsUnclosed; // undefined indicates we haven't started yet
		let lastMandatoryParameterIndex = instruction.parameters ? instruction.parameters.findLastIndex(parameter => !parameter.optional) : -1;
		let lastParameterWithValueIndex = parameters ? parameters.findLastIndex(parameter => !!parameter) : -1;
		parameters.some((param, i) => {
			if (lastMandatoryParameterIndex < i && lastParameterWithValueIndex < i) return true;
			const instruction_parameter = instruction.parameters[i] ? instruction.parameters[i] : {};
			if (instruction_parameter.space) strings.code += " ";
			if (!bracketsUnclosed && (!instruction_parameter.noBrackets && (!instruction.code || !instruction.code.noBrackets))) {
				if (instruction.code && instruction.code.space && !parametersText.endsWith(" ")) {
					parametersText += " ";
				}
				parametersText += "(";
				bracketsUnclosed = true;
			} else if (bracketsUnclosed && instruction_parameter.noBrackets) {
				parametersText += ") ";
				bracketsUnclosed = false;
			} else if (bracketsUnclosed !== undefined) {
				if (instruction_parameter.separator) {
					parametersText += " " + instruction_parameter.separator + " ";
				} else {
					parametersText += ", ";
				}
			} else if (bracketsUnclosed === undefined) {
				if (instruction_parameter.separator) {
					parametersText += " " + instruction_parameter.separator + " ";
				} else if (instruction.code && instruction.code.space && !parametersText.endsWith(" ")) {
					parametersText += " ";
				}
			}
			if (param === "" && i < parameters.length - 1 && !instruction_parameter.noBrackets) { // If there are more parameters left to parse use "undefined" instead of leaving blank
				parametersText += "undefined";
			} else {
				parametersText += param;
			}
		});
		if (bracketsUnclosed) {
			parametersText += ")";
			bracketsUnclosed = false;
		}
		if (bracketsUnclosed === undefined && (!instruction.code || !instruction.code.noBrackets)) { // If no brackets written but it must have brackets, add the brackets with no parameters
			parametersText += "()";
		}
		if (lastMandatoryParameterIndex < lastParameterWithValueIndex && parametersText == " ") parametersText = "";
		strings.code += parametersText;
		if (!instruction.code || !instruction.code.noBrackets) {
			if (instruction.showParams) strings.reduced += parametersText;
			else strings.reduced += "()";
		}
		strings.flow = strings.code;
		if (instruction.code && instruction.code.prefix) {
			strings.code = instruction.code.prefix + strings.code;
		}
		if (instruction.code && instruction.code.suffix) {
			strings.code += instruction.code.suffix;
		}
		return { parameters, strings };
	};

};