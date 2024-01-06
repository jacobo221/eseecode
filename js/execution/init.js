"use strict";

(() => {
    Object.assign($e, {
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
    });
})();