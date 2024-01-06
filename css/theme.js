(() => {

$e.ui.themes.current = {
	id: "default",
	name: "Default",
	version: "1.1",
	compatible: $e.platform.version,
	author: $e.platform.author,
	copyright: $e.platform.license,
	email: $e.platform.email,
	website: $e.platform.website,
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