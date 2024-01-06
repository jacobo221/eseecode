## 4.0 (2023-01-06)

*Milestone reached: Flowchart, real grid resize, animate the guide movements, multiselect blocks, run backwards, autosave*
* New flowchart style. New url parameters style= and styletabs=, and API calls setStyle() and showFlowTab()
* Grid can now be any resolution, not only 400x400. New url parameter whiteboardresolution=, and API calls getWhiteboardResolution() and setWhiteboardResolution()
* Allow to always pause the execution, even if running with no delay
* New resume execution button
* Stepped execution can now run backwards. Stepped executions do not trigger breakpoints (but do update monitors). Stepped execution now works independently to regular execution, so a new API call runSteps() exists, and API call setExecutionStep() and URL parameter step= have been deprecated in favour of setStepSize() and stepsize=
* New API call setInstructionsDelay() and URL parameter delay= to define how long each instruction delays the execution. Substracting setInstructionsPause() to setInstructionsDelay() will be the time spend animating the instruction
* New API call setExercise() and URL parameter exercise= to define an id for the exercise, which for now is only used by autosave to determine which autosaved code to restore
* Every guide movement is now animated
* Multiselection of blocks to move, duplicate or delete them
* Hold shift key while multiselecting two blocks to select all blocks in between. New API call showMultiselectTab() and URL parameter multiselect= to display/hide this functionality
* Improved block setup dialog UI
* Highlight where the block is going to be dropped, blur the block if it is going to be removed if dropped
* If a block is moved and then returned to its position, don't open block setup dialog
* Code is autosaved on every run and periodically when the code has been changed. Autosave can be requested through API call autosave(). New API call setAutosaveInterval() and URL parameter autosave= to define the time between autosaves, in seconds. New API call restoreAutosave() with URL parameter autorestore= to restore the autosaved code on initialization. New API call setAutosaveExpiration() and URL parameter autosaveexpire= to define the expiration in seconds of autosave code
* Code is now copied with synthax highlight
* Output box now allows to select and copy its content
* Added keyboard shortcuts to open (CTRL+O) and save (CTRL+S). CTRl+R will now toggle between run/resume and pause
* Clicking on a layer name in the debug toolbox no longer switches to that layer, as that intereferes with the execution and pedagogically the layer switch must be done with code
* Now let is used internally for variables instead of var so variables are scoped as they are in most languages and errors appear if used before declaration in the same function
* New instruction say() to display a message to the user
* Deprecated getKeyboardLastKeycode() and getKeyboardKeycode(), use getKeyboardLastKey() and getKeyboardKey() instead, including for special keys
* Window instructions are not listed anymore in the Build view, only in the Code view
* Animation during initial loading, and during view switches
* Improved general visual style, animations and responsiveness
* Disable automatic browser translation (because it translates instructions)
* Themes system has been reworked and simplified to make it easier to create/maintain themes
* Two new themes: Psychedelic and Retro
* Default and sharp themes updated
* URL param "dialog" has been renamed to "toolbox", and API calls switchDialog() and getDialog() have been renamed to switchToolbox() and getToolbox()
* Base code deeply updated, refreshed and reworked. Dropped support for IE and browsers older than 2019
* Fix: getKeyboardLastKey() wasn't working
* Small fixes in some instructions' metainfo

## 3.2 (2023-11-01)

*Milestone reached: Real pause/resume execution and debug*
* Can now pause/resume executions
* Debug internal code reworked completely. Now debug (breakpoints, watchpoints, stepping) is running the real code, not simulating
* Pause on every instruction is now inbuilt
* Removed timeout setting as it does not make sense anymore with the pause/resume feature
* Breakpoint watches removed, instead we can have breakpoints, breakpointing watches and non-breakpointing watches, which is much easier to understand
* Improved and simplified UI and behaviour of debug breakpoints, watchpoints and steps
* Improved UI visibility for run/resume/clear/reset buttons
* Debug stepping is now only enable/disable through UI (always set to 1 step, stepping size can now be changed through API only)
* New API calls stop(), pause(), resume() to control executions
* New URL params breakpoints= and observe= and API calls setBreakpoints(), getBreakpoints(), setObservers(), getObservers() to set up and obtain breakpoints, watches and watchpoints
* New URL param step= and API call setExecutionStep() to enable/disable debug stepping and how many instructions for each step
* New URL param background= and its API call setWhiteboardBackground() to set a background image for the whiteboard
* New URL param guideimage= and guidesize= and its API calls setGuideImage() and setGuideSize() to set a custom image and size for the guide
* New URL param e= to allow base64 encoded params in it (circumvent mod_security conflicts)
* getX() and getY() now return an integer to allow proper validation if "same coordinate" after moving around the guide
* Custom instructions can now include the code in the instructions' definitions instead of delegating it to precode
* Default UI language to browser language
* Updated create.js
* Updated and improved guide.js, including translations, chaining tutorials, embedding texts, etc
* Fixed and updated tutorials
* Fix: Maximizing view is back working, and better than every (full maximization)

## 3.1 (2023-10-19)

*Milestone reached: Language structure improvements*
* New block fill() {} to ease the use of shapes (more intuitive than beginShape()+endShape())
* Support and/or behaving as &&/||
* Added instruction getCosine()

## 3.0 (2023-05-23)

*Milestone reached: Support pauses, sound, automatic judge, customized exercices*
* Added wait() instruction to freeze execution
* Added sound() and soundStop() instructions to play sounds
* Added ask() instruction to ease prompting the user to input data
* Added instructions to get draw/text properties: getSize() getColor() getFont() getBold() getItalic()
* New API messaging system to communicate within an iframe
* Added API methods to support exercises auto-corrections (autojudge) and obtaining UI information
* Added API methods forceblocksetup(), basepath(), pause(), downloadWhiteboard(), downloadCode(), prerun(), postrun(), getLastExecutionCodeLinesCount(), getLastExecutionInstuctionsCount(), getLastExecutionTime()
* Allow to setup grid and guide visibility with getWhiteboard() through API
* Allow in API setInstructions() to decide whether to show or hide parameters in custom instructions
* Added API setCustomInstructions() to add new instructions into the instruction set, including an instruction icon
* Allow to disable block setup when adding instructions in Drag view
* Allow to display instruction parameters in Drag view
* Allow basepath for image() and sound() calls
* Code view now only shows custom instruction set in toolbox when custom instruction set is set
* Animate execution steps. Can be be configured from the Debug tab
* Prompt the user before loosing data when there are undo/redo actions available
* Allow calling platform with a versioning number to prevent caching
* Responsive whiteboard
* Fix: getPixelColor() was broken. Thanks to Jordi Losantos for reporting
* Fix: image() was leaving the canvas in an unstable context
* Fix: Some strings and translations fixed
* Fix: Cleanup repetitive UI code re-executions

## 2.4 (2016-07-15)

*Milestone reached: Maximize guided exercises and challanges*
* Create custom instruction set where instructions parameters can't be customized
* Instructions can now have a maximum amount of uses (only in blocks modes)
* Now Layers can be called by name or position in the stack and you can check if a layer exists with getLayerExists()
* Debug shows the position and name of every layer
* Allow variables and expressions in parameters, maximize code view and disable prevent exit from API
* Allow defining code, precode, postcode, execute, set toolbox view, hide view tabs, etc from URL
* Allow to initialize variables when declaring them in blocks views
* Allow to duplicate blocks
* New tool to ease creation of customized eSeeCode for exercises
* Allow animate(), windowbuttonedit/create() and windowimageedit/create() to recieve functions
* Allow to choose filename when downloading code
* animateLayers() hides the guide to prevent confusion
* Added instructions to get date, mouse/touch/keyboard events and query color in a pixel as requested by Jordi Losantos and Xavier Paytubi
* Added setAxis() instruction which deprecates changeAxis()
* Allow gridStep to go down to 1
* More web app devices compatibility
* Ask for confirmation if loading a file will delete unsaved changes
* New API for embedding in mobile platforms using same UI (saveFile() and loadFile(), and other new functions)
* Easier to embed: just call eseecode.js from your page
* Warn before loading a file if there are unsaved changes
* Now grid lines are configured by number of divisions instead of pixels between divisions
* Basic setup of Function eases the creation of parameters
* Now remembers setup type (basic/advanced) in Build view
* API isReady() allows to know if the plaform is ready for use in parent windows
* Support themes
* Translations format reworked to load dynamically
* input() now supports "integer" type to read between chars in a string
* Fix: Redo block add after undo
* Fix: Changing mode right after loading a file showed a blank code
* Fix: If opening code on Touch mode show Run button
* Fix: Dragging now works in Android WebView (for embedding in an app)
* Fix: Copy&paste and code save in Windows now keeps newlines (thank you Jordi Losantos)
* Fix: Save code now works with all browsers (except Safari, where it will pop a window)
* Fix: jsColor iputs missed the '#' at the beginning
* Fix: Added jscolor support for windowInputEdit/Create which broke in IE
* Fix: Updated all examples to current instruction set
* Fix: API_setTimeout() didn't work when called from within the code
* Fix: Animations were not being stopped when resetting
* Fix: Image and Button fixes
* Fix: Icons now update when chaning params in IE
* Fix: All icons can now be resized
* Fix: When setting a value in blocks views changin from advanced to basic setup won't remove quotes in strings
* Fix: Check that = has a value
* Fix: Default degrees value in arc() is now undefined
* Fix: Added parameter tips for =
* Fix: Inorder instructions don't show null first param when adding floating block
* Fix: In guide do not show "undefined" in steps titles if no title has been defined
* Fix: In Block setup the tip about parameters only shows () if the instruction uses brackets
* Fix: Accept read correctly variables and expressions in number fields in setupBlock
* Fix: Allow steps with no message in guide
* Fix: arc() icon
* Fix: encodeURI/encodeURIComponent mess in guide
* Fix: Reset code when going back to first steps in guide
* Fix: Guide now supports shortcuts
* Fix: Custom instructions in guide are now reset when reloaded
* Fix: Ace wasn't suggesting eSeeCode keywords (thanks Xavier Paytubi)
* Fix: Debug showing statistics when only precode has been run
* ...and many other bugfixes

## 2.3 (2015-12-06)

*Milestone reached: Easy input/output methods*
* New input and output instructions and panels
* Added URL parameters grid=, gridStep=, guide=, input= and timeout=
* New APIs: getLayersAsAnimation(), getLayersAsGrid(), getWhiteboard(), loadURLParams(), execute(), setInput(), getOutput(), uploadPrecode(), ...
* Code cleanup regarding UI/code separation and URL parameters parsing
* Embedding setup Wizard example added
* Rotated forward and turnLeft/Right icons as suggested by Laura Morera
* Improved animateLayers() icon and added snapshot() icon
* Added pop() instruction
* Removed stop() instruction
* Blocks in code are now always rounded and adapting to context
* Prepared for better external access
* New guiding system to teach to use eSeeCode
* Blocks are translucent when dragging so you can see where you drop them
* Added some tutorials
* New animation in Touch view when adding new blocks
* Better way of accessing the instructions' definitions
* Added documentation for not-in-implementation.js code elements such as repeat(), while(), if(), ...
* Prevent from selecting text (except in Code view), which frequently was an error when trying to click
* Improved order of blocks in toolbox in Touch and Drag views
* Deprecated unsetColor()
* arc() by default draws circles
* When using mouse attend only the left button
* Fix: Keep maximum precision in cursor movements
* Fix: Long awaited fix to get the exact position of a block and scroll to its exact position
* Fix. Watchpoints were highlighting wrong lines when in repeat/for/etc
* Fix: Translate variable types
* Fix: Correcting wrong styling in inline functions
* Fix: uploadCode() turns to Code view if code cannot be parsed, so code is loaded and not lost
* Fix: Grid coordinates are always rounded now
* Fix: instructions= parameters are set even if they are defined as optionals for the instruction
* Fix: Axis coords were show with decimals, now just integers
* Fix: Fixed initial value overwriting even without forceInitial in layer/number parameters
* Fix: Renamed custom attributes to HTML5 "data-" prefixes

## 2.2 (2015-10-31)

*Milestone reached: Easily understandable runtime errors*
* Detect runtime call errors and show easily understandable explanations of such errors
* Merged flip-, scale, move-, rotate- into image()
* Allow breakpoints and stepping to work together in debug
* API_uploadCode() allows to immediately run the code: Regarding preload it defined whether the code should be preloaded in the whiteboard or run when the user clicks run
* Breakpoints in debug now count how many times the app has gone through them (most useful when the breakpoint exists but is disabled)
* Build view now also shows visual setup, although by default it shows the advanced setup
* Added option to download layers in a grid
* Hide execute and clear buttons in Touch view
* Hide undo/redo buttons when the action isn't possible
* Moved download layers/canvas to whiteboard tabs space
* Drag blocks relative to original mouse position in the block, not centered
* Migrated setInvisible/unsetInvisible() to transparency(). Thanks to Jordi Losantos for his suggestion
* Added a few new parameters to existing instructions
* Added tips, initial, minValue, etc to all parameters in instructions
* Added constants E and Phi, renamed pi to Pi
* Keep Code cursor position when executing
* Now optional parameters are unset by default, ignoring the "initial" key defined in the instructionSet unless forceInitial is set
* Now asks for confirmation before leaving, even when embedded, if not saved or downloaded
* Support for size 1px lines
* Fix: Several fixes in Build view when optional parameters are unset
* Fix: visibility issue in iPads
* Fix: getRandomColor() was giving sometimes invalid color codes
* Fix: Remove extra space in single line comments
* Fix: line() was missing minValue/maxValue definition
* Fix: setSize(1) made lines 2px wide

## 2.1 (2015-10-06)

*Milestone reached: Better design to make it easy to be used by teachers and students*
* Introduced the notion of Guide for the pointer and Touch,Drag,Build,Code for the levels we now call Views
* GUI restyled and cleaned up
* New logo ( thanks to Rodolfo Espina from rodolfoespina.com )
* It is now Web App installable
* The platform now resizes to adapt to the browser size
* Option to go fullscreen (disabled if embedded)
* Confirm before leaving page (disabled if embedded)
* Default to landscape view
* Added options to download all layers as an animation
* Level1 has no text in blocks anymore
* Removed advanced parameter description from level 2
* New resize view button, much more intuitive than doubleclicking level tabs
* Enable ACE editor worker, helper and horizontal scroll
* Download layer images hides/shows guide and grid based on settings
* Added a shortcut to run the code: CTRL+R
* Focus back to code when clicking instruction in toolbox
* Resetting the UI and switching the view level always leaves the toolbox in Pieces display
* Guide icon slightly redesigned
* Better icon for if/ifelse
* lineAt and writeAt icons are now dynamic
* New animateLayers() instruction to ease creating animations from Level2
* Added instruction snapshot()
* Guide starts at (0,0)
* Center of coordinates can be changed
* Layers, windows and repeatCount now start numbering at 0
* Easily convert between if and ifelse in blocks views
* Added option in visual block setup to leave parameters without value, and instructionSet parameter "optional"
* Clicking on "}" block or "else" block will prompt for the parent block setup
* Additional parameter in "image" allows the image to be centered in the given position
* Wrapped all functions under the a prefix so it is much less probably to have a conflict with function/variable names
* Added the possibility to include global variables in the language
* Allow predefined constants in the instruction set definitions: minX, minY, maxX, maxY, centerX, centerY, originX, originY (only applies to type "number")
* Added real watchpoints
* Breakpoints can now be enabled/disabled
* New tracing platform allows to keep random/interactive values from one breakpoint/step to another
* Breakpoints in Code view and blocks views are now marked
* Began work on better execution error messages
* Stepping moved from setup window to debug window
* Pre-run instructions through API for exercise
* Adapt instructionSet by param for exercise (instructions= instruction;parameter or blank)
* Added some interesting mathematical examples ( by Joan Alemany Flos from joanalemany.name )
* Added some fractal examples adapted from the FMSLogo documentation
* Added example exercices showing the new embedding capabilities
* Fix: Clicking twice on the play button should run the code twice, currently you need to manually reset
* Fix: line() second parameter to type "number"
* Fix: FlipHoritzontally was not working correctly
* Fix: image() needed refresh to load the image
* Fix: scale() icon was broken
* Fix: getArctangent(), getArcsine() and getArcCosine were broken
* Fix: else's inner block not being correctly indented
* Fix: resetUI() was resetting the language also
* Fix: tabs and buttons were scrolling the page
* Fix: breakpoint is unhighlighted when resetting the canvas
* Fix: Undesired tabs switches
* Fix: unsetInvisible() had no tip
* Fix: repeatCount in nested repeat()s is consistent uppon entry/exit of each loop
* Fix: clicking a block to setup but changing nothing no longer takes one slot in the undo stack
* Fix: moving a block downward, then undoing and then redoing no longer misplaces the block
* Fix: unhilighting breakpoints in Code view when moving mouse out
* Fix: several fixes in breakpoint position handing in Code and when converting to blocks views

## 2.0 (2015-01-29)

*Milestone reached: Purely graphical programming in levels 1 and 2*
* Setup blocks with a friendly interface
* Add basic animations capability
* Autocomplete in level4
* Enforced the tip to start programming
* Breakpoints are now dynamic (they are followed through code changes)
* Highlight breakpoint in debug windows when execution reaches it
* Highlight breakpoint in code onmouseover

## 1.7 (2014-06-18)

* Translatable UI
* Translations available: ca, es (by default: en)
* Setup window to simplify UI, reduce height and make the whole app fit in Android browser
* Get parameters from URL to set view mode and language
* Debug now allows breakpoints and watchpoints
* Available API to easily embed eSeeCode into other platforms
* Ace editor is now mandatory, makes no sense to keep compatibility with textarea

## 1.6 (2014-06-10)

* Clean up of variables before execution, so executions are now independent from one another
* Code must comply with "use strict"
* New execution control system now integrated into jison
* Handle infinite loops by timeouting
* Keep undo/redo list when changing modes, except if unavoidable
* Most code reworked and reorganized

## 1.5 (2014-06-01)

*Milestone reached: Allow interactive developments*
* Synthax and execution errors handling and highlighting
* Introduced the instruction "repeat"
* Code now is run in persistive state so real interactive applications can now be developped
* Debug can highlight a single layer. Debug also points where the guide is in a layer if it is outbounds

## 1.2 (2014-05-23)

* Can now setup the blocks (parameters)

## 1.1 (2014-05-12)

* Allow to undo and redo
* Highlight step by step in blocks
* Random backgrounds

## 1.0 (2014-04-20)

*Milestone reached: 4 interchangable levels of development*
* Can change between all levels indistinctively
* Now uses Jison http://zaach.github.io/jison/ to parse the code. Thanks to C. J. Ihrig for his jsparser! http://cjihrig.com/blog/creating-a-javascript-parser/
* Beautify user's code in level4

## 0.7 (2014-04-08)

* Icons change dynamically depending on the value of the parameters
* Level4 now uses Ace editor
* It is now possible to load and save codes, and download the canvas image
* Lots of beautifying

## 0.6 (2014-03-15)

* Level2 working
* Levels 2 and 3 now allow to reorder their blocks
* Accessibility friendly
* Tips for system help
* Instructions definition reworked

## 0.5 (2014-02-17)

* Level3 working
* Introduced instruction categories

## 0.4 (2014-02-10)

* Level1 working

## 0.3 (2014-02-03)

* Debug system to list layers, their order, show their guide and run commands (independently of the code)
* New Window API to create interactive applications
* Can now maximize/restore the view

## 0.2 (2014-01-31)

* Ability to run step by step
* A customizable grid is available to help measure

## 0.1 (2013-12-05)

*Milestone reached: Prototype*
* Level 4 working
* Instructions and API in place
