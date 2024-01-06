"use strict";

(() => {
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
    });
})();