## 2.0 (on the works)

 *Milestone: Purely graphical programming in levels 1 and 2*
 * Setup blocks with a friendly interface
 * Add animations capability

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
 * Debug can highlight a single layer. Debug also points where the turtle is in a layer if it is outbouds

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

 * Debug system to list layers, their order, show their turtle and run commands (independently of the code)
 * New Window API to create interactive applications
 * Can now maximize/restore the console

## 0.2 (2014-01-31)

 * Ability to run step by step
 * A customizable grid is available to help measure

## 0.1 (2013-12-05)

 *Milestone reached: Prototype*
 * Level 4 working
 * Instructions and API in place