"use static";

/**
 * Initializes/Resets the themes menu UI element
 * @private
 * @example $e.ui.themes.resetMenu()
 */
$e.ui.themes.resetMenu = () => {
	if ($e.ui.themes.menuVisible && $e.ui.themes.available.length > 1) {
		$e.ui.themes.resetSelect();
		$e.ui.element.querySelector("#themes").classList.remove("hide");
	} else {
		$e.ui.element.querySelector("#themes").classList.add("hide");
	}
};

/**
 * Populate list of installed themes
 * @since 2.4
 * @private
 * @example $e.ui.themes.resetSelect()
 */
$e.ui.themes.resetSelect = () => {
	let themes = $e.ui.themes.available;
	const select = $e.ui.element.querySelector("#themes-select");
	// Reset themes in dropdown menu
	select.options.length = 0;
	// Sort by name
	themes = themes.sort((a, b) => a.name > b.name);
	// Add themes to dropdown menu
	themes.forEach(theme => {
		const option = document.createElement("option");
		option.text = theme.name;
		option.value = theme.id;
		select.add(option, null);
	});
	select.value = $e.ui.themes.current.id;
};

/**
 * Switches the active theme
 * @since 2.4
 * @private
 * @param {String} theme Name of the theme to use
 * @param {Boolean} [redrawBlocks=false] Redraw the blocks
 * @example $e.ui.themes.switch("default")
 */
$e.ui.themes.switch = (newTheme, redrawBlocks) => {
	$e.ui.themes.current.loaded = false;
	if (!newTheme || newTheme === "") newTheme = "default";
	newTheme = newTheme.toLowerCase();
	const defaultThemePath = $e.basepath + "/css";
	const themesPath = $e.basepath + "/themes";
	const headElement = document.querySelector("head");
	const oldTheme = $e.ui.themes.current.id.toLowerCase();
	let oldThemePath;
	if (oldTheme == "default") {
		oldThemePath = defaultThemePath;
	} else {
		oldThemePath = themesPath + "/" + oldTheme;
	}
	let newThemePath = themesPath + "/" + newTheme;
	if (newTheme == "default") {
		newThemePath = defaultThemePath;
	}
	if ($e.ui.themes.current.unload) $e.ui.themes.current.unload();
	const createCSSElement = (filepath) => {
		const elementCSS = document.createElement("link");
		elementCSS.rel = "stylesheet";
		elementCSS.type = "text/css";
		elementCSS.href = filepath + ($e.v ? "?v=" + $e.v : "");
		return elementCSS;
	};
	// Replace/remove the previous theme
	// We cannot first remove and then add because for some reason Chrome is unable to find theme.css if you are going to remove it
	const headElements = headElement.children;
	$e.session.semaphor = 0;
	if (oldTheme != "default") Array.from(headElements).filter(element => { // Do not remove teh default theme, it is always behind to give basic format
		return (element.tagName === "LINK" && element.rel === "stylesheet" && element.href && element.href.startsWith(oldThemePath + "/")) || (element.tagName === "SCRIPT" && element.src && element.src.startsWith(oldThemePath + "/")); // We don't remove them yet, instead we add them to an array of elements to remove and we remove them all at once, otherwise they are reordered while looping and some are left behind
	}).forEach(element => element.remove()); // We remove them now, in reverse order so that remval doesn't affect the order
	if (newTheme == "default") return; // The default theme is already loaded, it is always loaded at the beginning
	// Add files
	const newThemeJSPath = newThemePath + "/theme.js" + ($e.v ? "?v=" + $e.v : "");
	const elementJS = document.createElement("script");
	elementJS.type = "text/javascript";
	elementJS.src = newThemeJSPath;
	elementJS.onload = () => {
		const informLoaded = (redrawBlocks) => {
			if ($e.session.semaphor >= numCSSFiles) {
				if (redrawBlocks) {
					const level = $e.modes.views.current.id;
					if ($e.modes.toolboxes.current.type == "blocks") {
						$e.ui.blocks.initToolbox(level, $e.modes.toolboxes.current.element);
					}
					$e.ui.initElements();
					$e.ui.resetGuide();
				}
				$e.ui.themes.current.loaded = true;
				$e.ui.element.querySelector("#themes-select").value = newTheme;
			} else {
				// Wait for all the CSS files to be uploaded
				setTimeout(() => { informLoaded(redrawBlocks); }, 100);
			}
		};
		let numCSSFiles = 0; // theme.css is already loaded
		if ($e.ui.themes.current.files) {
			numCSSFiles += $e.ui.themes.current.files.length;
			$e.ui.themes.current.files.forEach(basename => {
				const filepath = newThemePath + "/" + basename;
				const newElement = createCSSElement(filepath);
				newElement.onload = () => { $e.session.semaphor++; };
				headElement.appendChild(newElement);
			});
		}
		informLoaded(redrawBlocks);
	};
	headElement.appendChild(elementJS);
};