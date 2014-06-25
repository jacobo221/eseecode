"use strict";
	/**
	 * @author Jacobo Vilella Vilahur
	 */

	/**
	 * Loads a style sheet into the DOM
	 * @private
	 * @param {!String} url URL of the style sheet to load
	 * @example loadStyle("css/ui.js")
	 */
	function loadStyle(url) {
		var element = document.createElement("style");
		element.type = "text/css";
		element.innerHTML = "@import url(\""+url+"\");";
		document.getElementsByTagName("head")[0].appendChild(element);
	}

	/**
	 * Loads a script into the DOM
	 * @private
	 * @param {!String} url URL of the script to load
	 * @param {function()} callback Function to run once the script is loaded
	 * @example loadScript("js/common.js")
	 */
	function loadScript(url, callback) {
		var element = document.createElement("script");
		element.type = "text/javascript";
		element.src = url;
		if (callback) {
			element.onreadystatechange = callback;
			element.onload = callback;
		}
		document.getElementsByTagName("head")[0].appendChild(element);
	}

	loadStyle("css/common.css");
	loadStyle("css/ui.css");
	loadStyle("css/blocks.css");
	loadScript("js/common.js");
	loadScript("js/backend.js");
	loadScript("js/execution.js");
	loadScript("js/blocks.js");
	loadScript("js/levelConvert.js");
	loadScript("js/debug.js");
	loadScript("js/ui.js");
	loadScript("js/translate.js");
	loadScript("js/api.js");
	loadScript("js/instructions/set.js");
	loadScript("js/instructions/categories.js");
	loadScript("js/instructions/implementation.js");
	loadScript("js/instructions/icons.js");
	loadScript("js/i18n/ca.js");
	loadScript("js/i18n/es.js");
	loadScript("js/jison/eseecodeLanguage.js",function(){
		loadScript("js/jison/makeBlocks.js");
		loadScript("js/jison/makeWrite.js");
	});
	loadScript("js/ace/ace.js");
	loadScript("js/jscolor/jscolor.js");

	// Main initialization
	/**
	 * @type Array<{platform:{name:{text:String,link:String},version:{text:String,link:String},author:{text:String,link:String},license:{text:String,link:String}},i18n:{available:Array<{*}>,current:String},instructions:{set:Array<{*}>,categories:Array{*},icons:Array{*}},execution:{reakpointCounter:Number,breakpointCounterLimit:Number,step:Number,stepped:Boolean,timeLimit:Number,programCounter:Number,programCounterLimit:Number,endLimit:Number,startTime:Number,sandboxProperties:Array<String>},codeFileName:String,session:{highlight:{lineNumber:Number,reason:String},changesInCode:Boolean,floatingBlock:{div:HTMLElement,fromDiv:HTMLElement},blocksUndo:Array<{*}>,breakpoints:Array<{*}>,breakpointHandler:Boolean|Number,timeoutHandlers:Array<{*}>},whiteboard:HTMLElement,dialogWindow:HTMLElement,canvasArray:Array<{*}>,windowsArray:Array<{*}>,currentCanvas:Object,currentWindow:HTMLElement,setup:{blockWidth:Array<{String, String},blockheight:Array<{String, String}>,defaultFontSize:Number,defaultFontWidth:Number,undoDepth:Number},modes:{console:Array<{*}>,dialog:Array<{*}>}}>
	 */
	var $_eseecode = {
		platform: {
			name: {
				text: "eSeeCode",
				link: undefined
			},
			version: {
				text: "1.7",
				link: "changelog.txt"
			},
			author: {
				text: "Jacobo Vilella Vilahur",
				link: "http://www.eseecode.com"
			},
			license: {
				text: "GPLv3 or later",
				link: "https://gnu.org/licenses/gpl.html"
			}
		},
		i18n: {
			available: {
				default: { name: "English" }
			},
			current: "default"
		},
		instructions: {
			set: {},
			categories: {},
			icons: {}
		},
		execution: {
			breakpointCounter: 0,
			breakpointCounterLimit: 0,
			step: 1,
			stepped: false,
			timeLimit: 3,
			programCounter: 0,
			programCounterLimit: 0,
			endLimit: undefined,
			startTime: undefined,
			sandboxProperties: []
		},
		codeFilename: "",
		session: {
			highlight: {
				lineNumber: 0,
				reason: undefined
			},
			changesInCode: false,
			floatingBlock: { div: null, fromDiv: null },
			blocksUndo: null,
			breakpoints: {},
			breakpointHandler: false,
			timeoutHandlers: []

		},
		whiteboard: null,
		dialogWindow: null,
		canvasArray: [],
		windowsArray: [],
		currentCanvas: null,
		currentWindow: null,
		setup: {
			blockWidth: { level1: 68, level2: 68, level3: 45, level4: undefined },
			blockHeight: { level1: 68, level2: 68, level3: 15, level4: 15 },
			defaultFontSize: 9,
			defaultFontWidth: 6,
			undoDepth: 20
		},
		modes: {
			console: [
				1,
				{name: "level1", div: "blocks", tab: null},
				{name: "level2", div: "blocks", tab: null},
				{name: "level3", div: "blocks", tab: null},
				{name: "level4", div: "write", tab: null}
			],
		  	dialog: [
				1,
				{name: "level1", div: "blocks", element: null, tab: null},
				{name: "level2", div: "blocks", element: null, tab: null},
				{name: "level3", div: "blocks", element: null, tab: null},
				{name: "level4", div: "write", element: null, tab: null},
				{name: "window", div: "window", element: null, tab: null},
				{name: "debug", div: "debug", element: null, tab: null},
				{name: "setup", div: "setup", element: null, tab: null}
			]
		}
	};

	// Init application
	window.addEventListener("load",function(){resetUI()}, false);

