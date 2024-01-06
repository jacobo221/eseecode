"use strict";

(() => {
     Object.assign($e, {
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
    });
})();