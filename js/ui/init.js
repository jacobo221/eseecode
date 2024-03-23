"use strict";

(async () => {

    const eseecodeEl = $e.ui.element; // Keep it to retore it later, as we are going to erase the contents of $e

    Object.assign($e, {
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
            gridStep: 25,
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
                lockBreakpoints: false,
            },
            maxDragForSetup: 5,
            write: {},
            debug: {},
            loading: {},
            msgBox: {},
        },
    });

    $e.ui.element = eseecodeEl; // Restore the element from previous $e value, as it might have been passed as parameter to the loader
    
})();
