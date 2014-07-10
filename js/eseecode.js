"use strict";
	/**
	 * @author Jacobo Vilella Vilahur
	 */

	// Main initialization
	/**
	 * @type Array<{platform:{name:{text:String,link:String},version:{text:String,link:String},author:{text:String,link:String},license:{text:String,link:String}},i18n:{available:Array<{*}>,current:String},instructions:{set:Array<{*}>,categories:Array{*},icons:Array{*}},execution:{reakpointCounter:Number,breakpointCounterLimit:Number,step:Number,stepped:Boolean,timeLimit:Number,programCounter:Number,programCounterLimit:Number,endLimit:Number,startTime:Number,sandboxProperties:Array<String>},codeFileName:String,session:{highlight:{lineNumber:Number,reason:String},changesInCode:Boolean,floatingBlock:{div:HTMLElement,fromDiv:HTMLElement},blocksUndo:Array<{*}>,breakpoints:Array<{*}>,breakpointHandler:Boolean|Number,timeoutHandlers:Array<{*}>,tipInterval:Object,scrollTimeout:Object},whiteboard:HTMLElement,dialogWindow:HTMLElement,canvasArray:Array<{*}>,windowsArray:Array<{*}>,currentCanvas:Object,currentWindow:HTMLElement,setup:{blockWidth:Array<{String, String},blockheight:Array<{String, String}>,defaultFontSize:Number,defaultFontWidth:Number,undoDepth:Number},modes:{console:Array<{*}>,dialog:Array<{*}>}}>
	 */
	var $_eseecode = {
		platform: {
			name: {
				text: "eSeeCode",
				link: undefined
			},
			version: {
				text: "2.0",
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
			timeLimit: 10,
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
			timeoutHandlers: [],
			scrollTimeout: null,
			tipInterval: null
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

