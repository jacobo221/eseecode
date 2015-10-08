## 2.2 (ongoing work)

 *Milestone: Easily understandable runtime errors*
 *   Allow breakpoints and stepping to work together in debug
 *   API_uploadCode() allows to immediately run the code: Regarding preload it defined whether the code should be preloaded in the whiteboard or run when the user clicks run
 *   Breakpoints in debug now count how many times the app has gone through them (most useful when the breakpoint exists but is disabled)
 *   Build view now also shows visual setup, although by default it shows the advanced setup
 *   Added tips, initial, minValue, etc to all parameters in instructions
 *   Added a few new parameters to existing instructions
 *   Hide execute and clear buttons in Touch view
 *   Hide undo/redo buttons when the action isn't possible
 *   Moved download layers/canvas to whiteboard tabs space
 *   Added option to download layers in a grid
 *   Fix: Remove extra space in single line comments

## 2.1 (2015-10-06)

 *Milestone reached: Better design to make it easy to be used by teachers and students*
 * This is a major update with so many new features we had to split them into categories to list them all
 * Interface:
 *   Introduced the notion of Guide for the pointer and Touch,Drag,Build,Code for the levels we now call Views
 *   GUI restyled and cleaned up
 *   New logo ( thanks to Rodolfo Espina from rodolfoespina.com )
 *   It is now Web App installable
 *   The platform now resizes to adapt to the browser size
 *   Option to go fullscreen (disabled if embedded)
 *   Confirm before leaving page (disabled if embedded)
 *   Default to landscape view
 *   Added options to download all layers as an animation
 *   Level1 has no text in blocks no more
 *   Removed advanced parameter description from level 2
 *   New resize console button, much more intuitive than doubleclicking level tabs
 *   Enable ACE editor worker, helper and horizontal scroll
 *   Download layer images hides/shows guide and grid based on settings
 *   Added a shortcut to run the code: CTRL+R
 *   Focus back to code when clicking instruction in dialog
 *   Resetting the UI and switching the console level always leave the dialog in Pieces mode
 *   Guide icon slightly redesigned
 *   Better icon for if/ifelse
 *   lineAt and writeAt icons are now dynamic
 * Programming:
 *   New animateLayers() instruction to ease creating animations from Level2
 *   Added instruction snapshot()
 *   Guide starts at (0,0)
 *   Center of coordinates can be changed
 *   Layers, windows and repeatCount now start numbering at 0
 *   Easily convert between if and ifelse in blocks modes
 *   Added option in visual block setup to leave parameters without value, and instructionSet parameter "optional"
 *   Clicking on "}" block or "else" block will prompt for the parent block setup
 *   Additional parameter in "image" allows the image to be centered in teh given position
 *   Wrapped all functions under the $e_ prefix so it is much less probably to have a conflict with function/variable names
 *   Added the possibility to include global variables in the language
 *   Allow predefined constants in the instruction set definitions: minX, minY, maxX, maxY, centerX, centerY, originX, originY (only applies to type "number")
 * Debug:
 *   Added real watchpoints
 *   Breakpoints can now be enabled/disabled
 *   New tracing platform allows to keep random/interactive values from one breakpoint/step to another
 *   Breakpoints in Code view and blocks modes are now marked
 *   Began work on better execution error messages
 *   Stepping moved from setup window to debug window
 * Embedding:
 *   Pre-run instructions through API for exercise
 *   Adapt instructionSet by param for exercise (instructions= instruction;parameter or blank)
 * Misc:
 *   Added some interesting mathematical examples ( by Joan Alemany Flos from joanalemany.name )
 *   Added some fractal examples adapted from the FMSLogo documentation
 *   Added examples exercices showing the new embedding capabilities
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
 * Fix: several fixes in breakpoint position handing in write mode and when converting to blocks mode

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
 * Setup window to simplify UI, reduce height and make he whole app fit in Android browser
 * Get parameters from URL to set console mode and language
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
 * Debug can highlight a single layer. Debug also points where the guide is in a layer if it is outbouds

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
 * Level4 can now use Ace http://ace.c9.io/#nav=about
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
 * Can now maximize/restore the console

## 0.2 (2014-01-31)

 * Ability to run step by step
 * A customizable grid is available to help measure

## 0.1 (2013-12-05)

 *Milestone reached: Prototype*
 * Level 4 working
 * Instructions and API in place
