"use strict";

// Main initialization
/**
 * @type platform:{name:{text:String,link:String},version:{text:String,link:String},logo:{text:String,link:String},author:{text:String,link:String},license:{text:String,link:String}},instructions:{set:Array<{*}>,custom:Array<{*}>,categories:Array{String},icons:Array{*}},execution:{stepSize:Number,instructionsDelay:Number,instructionsMinimumPause:Number,instructionsAnimationFramePause:Number,precode:String,monitors:Array<{breakpoint:Boolean}>,postcode:String,prerun:Function,postrun:Function,inputDefault:String,basepath:String,guides:{imageUrl:String,size:Integer},breaktouiInterval:Number,current:{stepped:Number,sandboxProperties:Array<String>,animate:Boolean,animatedTime:Number,precode:{running:Boolean,standby:Boolean},usercode:{running:Boolean},postcode:{running:Boolean},guideCache:{imageUrl:String,imageObj:Object},highlight:{lineNumber:Number,reason:String},monitors:Array<{value:*,oldValue:*,count:Number}>,inputRaw:String,inputPosition:Number,watchesChanged:Array<String>,layersChanged:Array<Number|String>,programCounter:Number,startTime:Number,trace:{stack:Array<*>,current:Integer,replaced:Array<{name:String,original:Function}>},timeoutHandlers:Array<{*}>,audioHandlers:Array<Number>,pauseHandler:Number,status:String,kill:Boolean,breaktoui:Boolean,breaktouiHandler:Number}},ide:{last_id:Number,blocks:{changes:{stack:Array<{*}>,current:Number},flowVisible:Boolean,multiselect:Boolean,lastSelected:HTMLElement},write:Object},handlers:{keyboard:{key:Number,lastKey:String},pointer:{x:Number,y:Number,lastX:Number,lastY:Number,pressed:Boolean}},updateOnViewSwitch:Boolean,lastChange:Number,lastRun:Number,lastSave:Number,lastAutosave:Number,ready:String,kill:Boolean},session:{editor:Object,breakpointHandler:{Boolean|Number},moveBlocksHandler:Boolean,lastRunLineNumber:Number,time:Number,instructionsCount:Number,linesCount:Number,runFrom:String,disableCode:Boolean},backend:{whiteboard:{element:HTMLElement,width:Number,height:Number,axis:{origin:Array<{x:Number,y:Number}>,scale:Array<{x:Number,y:Number}>,userSelection:Number,predefined:Array<{name:String,x:Number,y:Number,scale:Array<{x:Number,y:Number}>,initial:Boolean}>},layers:{available:Object,current:Object,top:Object,bottom:Object},guides:Object,axis:Object},windows:{available:Array<HTMLElement>,current:HTMLElement},io:Object,sound:Object},events:Object},ui:Array<{element:Object,loading:Object,msgBox:Object,maxDragForSetup:Number,blocks:{styles:Object,forceSetup:boolean,setup:{current:Object},dragging:{blockEl:HTMLElement,sourceBlockEl:HTMLElement,movesCount:Number,mouse:{x:Number,y:Number}}},write:Object,debug:Object,translations:{available:Array<{id:String,name:String,menuVisible:Boolean}>,current:Array<*>},themes:{available:Array<{id:String,name:String}>,current:Array<*>,menuVisible:Boolean},minWindowHeight:Number,codeFileName:String,toolboxWindow:HTMLElement,downloadLayersInterval:Number,downloadLayersColumns:Number,preventExit:Boolean,disableKeyboardShortcuts:Boolean,scrollTimeout:Object,guideVisible:Boolean,gridVisible:Boolean,gridStep:Number,setupType:String,filemenuVisible:Boolean}>,debug:Object,setup:{defaultView:String,defaultToolbox:String,defaultFontSize:Number,defaultFontWidth:Number,undoDepth:Number,tabSize:Number,autosaveInterval:Number,autosaveExpiration:Number,autorestore:Boolean,exercise:String},modes:{views:{current:Object,available:Object},toolboxes:{current:Object,available:Object}}},api:Object}
 */

(() => {

const eseecodeEl = $e.ui.element; // Keep it to retore it later, as we are going to erase the contents of $e

Object.assign($e, {
	basepath: (() => {
			const scripts = document.querySelectorAll("script");
			const scriptPath = scripts[scripts.length - 1].src;
			let result = scriptPath.substring(0, scriptPath.lastIndexOf("/js/"));
			if (result.length === 0) {
				result = ".";
			}
			return result;
		})(),
	platform: {
		name: {
			text: "eSeeCode",
			link: undefined,
		},
		version: {
			text: "4.0",
			link: "CHANGELOG.md",
		},
		logo: {
			text: "/images/logo.svg",
			link: "http://eseecode.com",
		},
		author: {
			text: "Jacobo Vilella Vilahur",
			link: "http://eseecode.com",
		},
		license: {
			text: "GPLv3 or later",
			link: "https://gnu.org/licenses/gpl.html",
		},
		web: {
			text: "eSeeCode.com",
			link: "http://eseecode.com",
		},
	},
	instructions: {
		set: {},
		custom: [],
		categories: [],
		icons: {},
	},
	execution: {
		stepSize: 1,
		instructionsDelay: 200,
		instructionsMinimumPause: 100,
		instructionsAnimationFramePause: 17, // This is 60Hz which is what a human eye can perceive
		inputDefault: "",
		basepath: "",
		guide: {
			imageUrl: undefined,
			size: 20,
		},
		precode: "",
		postcode: "",
		monitors: {},
		breaktouiInterval: 300,
		current: {
			stepped: undefined,
			sandboxProperties: [],
			animate: false, // Leave it as false initially so the guide can be placed in the center without animation
			animatedTime: 0,
			guideCache: {
				imageUrl: undefined,
				imageObj: undefined,
			},
			precode: {
				running: false,
				standby: false,
			},
			usercode: {
				running: false,
			},
			postcode: {
				running: false,
			},
			prerun: undefined,
			postrun: undefined,
			inputRaw: "",
			inputPosition: 0,
			programCounter: -1,
			monitors: {},
			watchesChanged: [],
			layersChanged: [],
			startTime: undefined,
			trace: {
				stack: [],
				current: -1,
				replaced: [],
			},
			timeoutHandlers: [],
			audioHandlers: [],
			pauseHandler: undefined,
			status: "clean",
			kill: undefined,
			highlight: {
				lineNumber: 0,
				reason: undefined,
			},
			breaktoui: false,
			breaktouiHandler: undefined,
			lastRunLineNumber: -1,
			linesCount: undefined,
			time: undefined,
			instructionsCount: undefined,
		},
	},
	ide: {
		last_id: 0,
		blocks: {
			changes: {
				stack: [],
				current: -1,
			},
			flowVisible: false,
			multiselect: false,
			lastSelected: undefined,
		},
		write: {},
	},
	session: {
		editor: undefined,
		handlers: {
			keyboard: {
				key: undefined,
				lastKey: undefined,
			},
			pointer: {
				x: undefined,
				y: undefined,
				lastX: undefined,
				lastY: undefined,
				pressed: false,
			},
		},
		disableCode: false,
		updateOnViewSwitch: false,
		lastChange: 0,
		lastRun: 0,
		lastSave: 0,
		lastAutosave: 0,
		ready: false, // This overwriteConsos the value from eseecode.js, both are set to false to indicate it is loading
		breakpointHandler: undefined,
		moveBlocksHandler: undefined,
		runFrom: undefined,
	},
	backend: {
		whiteboard: {
			element: undefined,
			width: 600,
			height: 600,
			axis: {
				origin: {
					x: 0,
					y: 0,
				},
				scale:{
					x: 1,
					y: 1,
				},
				userSelection: 2,
				predefined: [
					{ name: "Computer view", origin: { x: 0, y: 0 }, scale: { x: 1, y: 1 }, initial: false },
					{ name: "Mathematical simple", origin: { x: 0, y: () => $e.backend.whiteboard.width }, scale: { x: 1, y: -1 }, initial: false },
					{ name: "Mathematical centered", origin: { x: () => $e.backend.whiteboard.width / 2, y: () => $e.backend.whiteboard.width / 2 }, scale: { x: 1, y: -1 }, initial: true },
				],
			},
			layers: {
				available: {},
				current: null,
				top: null,
				bottom: null,
			},
			guides: {},
		},
		windows: {
			available: [],
			currentWindow: null,
		},
		io: {},
		sound: {},
		events: {},
	},
	ui: {
		element: undefined,
		translations: {
			available: [ { id: "default", name: "Default" } ],
			current: { id: "default", name: "Default", code: "en", strings: {} },
			menuVisible: true,
		},
		themes: {
			available: [ { id: "default", name: "Default" } ],
			current: { id: "default", name: "Default" },
			menuVisible: true,
		},
		minWindowHeight: 500,
		codeFilename: "code.esee",
		toolbxosWindow: null,
		guideVisible: true,
		gridVisible: true,
		gridStep: 50,
		setupType: undefined,
		filemenuVisible: true,
		fullscreenmenuVisible: undefined,
		scrollTimeout: null,
		whiteboardResizeInterval: null,
		downloadLayersInterval: 500,
		downloadLayersColumns: 3,
		preventExit: true,
		disableKeyboardShortcuts: false,
		blocks: {
			styles: {},
			forceSetup: true,
			setup: {
				current: undefined,
			},
			dragging: undefined,
		},
		maxDragForSetup: 5,
		write: {},
		debug: {},
		loading: {},
		msgBox: {},
	},
	debug: {},
	setup: {
		defaultView: "level1",
		defaultToolbox: "level1",
		defaultFontSize: 9,
		defaultFontWidth: 6,
		undoDepth: 20,
		tabSize: 4,
		autosaveInterval: 60,
		autosaveExpiration: 0,
		autorestore: true,
		exercise: undefined,
	},
	modes: {
		views: {
			current: undefined,
			available: {
				level1: { id: "level1", name: "Touch", type: "blocks", tab: null, },
				level2: { id: "level2", name: "Drag", type: "blocks", tab: null, },
				level3: { id: "level3", name: "Build", type: "blocks", tab: null, },
				level4: { id: "level4", name: "Code", type: "write", tab: null, },
			},
		},
		toolboxes: {
			current: undefined,
			available: {
				level1: { id: "level1", name: "Touch", type: "blocks", element: null, tab: null, },
				level2: { id: "level2", name: "Drag", type: "blocks", element: null, tab: null, },
				level3: { id: "level3", name: "Build", type: "blocks", element: null, tab: null, },
				level4: { id: "level4", name: "Code", type: "write", element: null, tab: null, },
				io: { id: "io", name: "I/O", type: "io", element: null, tab: null, },
				window: { id: "window", name: "Window", type: "window", element: null, tab: null, },
				debug: { id: "debug", name: "Debug", type: "debug", element: null, tab: null, },
				setup: { id: "setup", name: "Setup", type: "setup", element: null, tab: null, },
			},
		},
	},
	api: {},
});

$e.ui.element = eseecodeEl; // Restore the element from previous $e value, as it might have been passed as parameter to the loader

})();