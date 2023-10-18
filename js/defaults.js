"use strict";
	/**
	 * @author Jacobo Vilella Vilahur
	 * @license GPL-3.0
	 */

	// Main initialization
	/**
	 * @type platform:{name:{text:String,link:String},version:{text:String,link:String},logo:{text:String,link:String},author:{text:String,link:String},license:{text:String,link:String}},instructions:{set:Array<{*}>,custom:Array<{*}>,categories:Array{*},icons:Array{*}},execution:{reakpointCounter:Number,breakpointCounterLimit:Number,step:Number,stepped:Boolean,timeLimit:Number,programCounter:Number,programCounterLimit:Number,endLimit:Number,startTime:Number,trace:Array<*>,sandboxProperties:Array<String>,precode:{code:String,running:Boolean,standby:Boolean},precode:{code:String,running:Boolean},watchpointsChanged:Array<String>,inputDefault:String,inputRaw:String,inputPosition:Number},session:{highlight:{lineNumber:Number,reason:String},handlers:{keyboard:{key:Number,lastKeycode:Number},pointer:{x:Number,y:Number,lastX:Number,lastY:Number,pressed:Boolean}},updateOnConsoleSwitch:Boolean,lastChange:Number,lastRun:Number,lastSave:Number,ready:String,floatingBlock:{div:HTMLElement,fromDiv:HTMLElement,mouse:{x:Number,y:Number}},blocksUndo:Array<{*}>,breakpoints:Array<{*}>,breakpointHandler:Boolean|Number,watchpoints:Array<String>,watchpoints:Array<Boolean>,timeoutHandlers:Array<{*}>, disableCode:Boolean},whiteboard:HTMLElement,coordinates:Array<{origin:Array<{x:Number,y:Number}>,scale:Array<{x:Number,y:Number}>,userSelection:Number,predefined:Array<{name:String,x:Number,y:Number,scale:Array<{x:Number,y:Number}>,initial:Boolean}>}>,ui:Array<{translations: Array<{id:String,name:String}>translation:Array<*>,themes: Array<{id:String,name:String}>theme:Array<*>,minWindowHeight:Number,codeFileName:String,dialogWindow:HTMLElement,tipInterval:Object,downloadLayersInterval:Number,downloadLayersColumns:Number,preventExit:Boolean,scrollTimeout:Object,guideVisible:Boolean,gridVisible:Boolean,gridStep:Number,setupType:String,filemenuVisible:Boolean,translationsmenuVisible:Boolean,themesmenuVisible:Boolean}>,canvasArray:Array<{*}>,windowsArray:Array<{*}>,currentCanvas:Object,currentWindow:HTMLElement,setup:{blockWidth:Array<{String, String},blockheight:Array<{String, String}>,defaultFontSize:Number,defaultFontWidth:Number,undoDepth:Number,modes:{console:Array<{*}>,dialog:Array<{*}>}}
	 */
	if (typeof $_eseecode === 'undefined') var $_eseecode; // Create the main object if it hasn't been declated from the calling page
	$_eseecode = Object.assign({
		basepath: (function(){
				var scripts = document.getElementsByTagName("script");
				var scriptPath = scripts[scripts.length-1].src;
				var result = scriptPath.substring(0,scriptPath.lastIndexOf("/js/"));
				if (result.length == 0) {
					result = ".";
				}
				return result;
			})(),
		platform: {
			name: {
				text: "eSeeCode",
				link: undefined
			},
			version: {
				text: "3.0.1",
				link: "CHANGELOG.md"
			},
			logo: {
				text: "/images/eSeeCode_logo.png",
				link: "http://eseecode.com"
			},
			author: {
				text: "Jacobo Vilella Vilahur",
				link: "http://eseecode.com"
			},
			license: {
				text: "GPLv3 or later",
				link: "https://gnu.org/licenses/gpl.html"
			},
			web: {
				text: "eSeeCode.com",
				link: "http://eseecode.com"
			},
		},
		instructions: {
			set: {},
			custom: [],
			categories: {},
			icons: {}
		},
		execution: {
			breakpointCounter: 0,
			breakpointCounterLimit: 1,
			step: 1,
			stepped: false,
			pause: 500,
			timeLimit: 120,
			programCounter: 0,
			programCounterLimit: 0,
			endLimit: undefined,
			startTime: undefined,
			trace: [],
			sandboxProperties: [],
			precode: {
				code: "",
				running: false,
				standby: false
			},
			postcode: {
				code: "",
				running: false
			},
			watchpointsChanged: [],
			inputDefault: "",
			inputRaw: "",
			inputPosition: 0,
			basepath: ""
		},
		session: {
			highlight: {
				lineNumber: 0,
				reason: undefined
			},
			handlers: {
				keyboard: {
					key: undefined,
					lastKeycode: undefined
				},
				pointer: {
					x: undefined,
					y: undefined,
					lastX: undefined,
					lastY: undefined,
					pressed: false
					
				}
			},
			updateOnConsoleSwitch: false,
			lastChange: 0,
			lastRun: 0,
			lastSave: 0,
			floatingBlock: { div: null, fromDiv: null, mouse: {x: undefined, y: undefined} },
			blocksUndo: null,
			breakpoints: {},
			breakpointHandler: false,
			watchpoints: {},
			timeoutHandlers: [],
			audioHandlers: [],
			pauseHandler: undefined,
			disableCode: false,
			kill: undefined
		},
		whiteboard: {
			offsetWidth: 400,
			offsetHeight: 400
		},
		coordinates: {
			origin: {
				x: 0,
				y: 0
			},
			scale:{
				x: 1,
				y: 1
			},
			userSelection: 2,
			predefined: [
				{ name: "Computer console", origin: {x: 0, y: 0}, scale: {x: 1, y: 1}, initial: false },
				{ name: "Mathematical simple", origin: {x: 0, y: 400}, scale: {x: 1, y: -1 }, initial: false },
				{ name: "Mathematical centered", origin: {x: 200, y: 200}, scale: {x: 1, y: -1}, initial: true }
			]
		},
		ui: {
			translations: [{id: "default", name: "English" }],
			translation: {id: "default", name: "English", code: "en", strings: {} },
			themes: [{id: "default", name: "Default" }],
			theme: {id: "default", name: "Default" },
			minWindowHeight: 500,
			codeFilename: "code.esee",
			dialogWindow: null,
			guideVisible: true,
			gridVisible: true,
			gridStep: 25,
			forceBlockSetup: true,
			setupType: undefined,
			filemenuVisible: true,
			translationsmenuVisible: true,
			themesmenuVisible: true,
			fullscreenmenuVisible: undefined,
			scrollTimeout: null,
			tipInterval: null,
			whiteboardResizeInterval: null,
			downloadLayersInterval: 500,
			downloadLayersColumns: 3,
			preventExit: true
		},
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
				{id: "level1", name: "Touch", div: "blocks", tab: null},
				{id: "level2", name: "Drag", div: "blocks", tab: null},
				{id: "level3", name: "Build", div: "blocks", tab: null},
				{id: "level4", name: "Code", div: "write", tab: null}
			],
		  	dialog: [
				1,
				{id: "level1", name: "Touch", div: "blocks", element: null, tab: null},
				{id: "level2", name: "Drag", div: "blocks", element: null, tab: null},
				{id: "level3", name: "Build", div: "blocks", element: null, tab: null},
				{id: "level4", name: "Code", div: "write", element: null, tab: null},
				{id: "io", name: "I/O", div: "io", element: null, tab: null},
				{id: "window", name: "Window", div: "window", element: null, tab: null},
				{id: "debug", name: "Debug", div: "debug", element: null, tab: null},
				{id: "setup", name: "Setup", div: "setup", element: null, tab: null}
			]
		}
	}, $_eseecode);
