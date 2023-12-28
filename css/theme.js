(() => {

$e.ui.themes.current = {
	id: "default",
	name: "Default",
	version: "1.1",
	compatible: "4.0",
	author: "Jacobo Vilella Vilahur",
	copyright: "GPLv3",
	email: "jvilella@eseecode.com",
	website: "https://www.eseecode.com",
	files: [
		"definitions.css",
		"basic.css",
		"ui.css",
		"categories.css",
		"blocks.css",
		"flow.css",
	],
	unload: () => {}, // Routine to run when the theme is unloaded (to restore replaced functions for example)
};

})();