"use strict";

/**
 * Change whiteboard axis setup
 * @private
 * @param {Number} pos Position of the axis, origin is upperleft corner
 * @param {Number} scale Scale by which to multiply the coordinates, originaly increasing downwards
 * @example $e.backend.whiteboard.axis.change({ x: 200, y: 200 }, { x: 1, y: -1 })
 */
$e.backend.whiteboard.axis.change = (pos, scale) => {
	$e.backend.whiteboard.axis.origin = Object.assign({}, pos); // Make a copy, so we can replace callbacks with their current value without removing the callback from the original object
	if (typeof $e.backend.whiteboard.axis.origin.x == "function") $e.backend.whiteboard.axis.origin.x =  $e.backend.whiteboard.axis.origin.x();
	if (typeof $e.backend.whiteboard.axis.origin.y == "function") $e.backend.whiteboard.axis.origin.y =  $e.backend.whiteboard.axis.origin.y();
	$e.backend.whiteboard.axis.scale = scale;
	$e.ide.resetGrid();
	const element = $e.ui.element.querySelector("#setup-grid-coordinates");
	const gridModes = $e.backend.whiteboard.axis.predefined;
	const gridIsPredefined = $e.backend.whiteboard.axis.getIndexInPredefined(pos, scale);
	if (gridIsPredefined >= 0) {
		// Only change if it is not the one already selected, otherwise we enter a infinite loop
		if (element.value != gridIsPredefined) {
			element.value = gridIsPredefined;
		}
		if (element.options.length > gridModes.length) {
			// Remove the Custom option
			element.remove(gridModes.length);
		}
	} else {
		if (element.options.length == gridModes.length) {
			const option = document.createElement("option");
			option.value = gridModes.length;
			option.text = _("Custom");
			element.add(option);
		}
		element.value = gridModes.length;
	}
};

/**
 * Converts user coordinates to system coordinates
 * @private
 * @param {Array} pos System coordinates with Array elements x and y
 * @return System value which refers to the same user position
 * @example $e.backend.whiteboard.axis.user2systemCoords({ x: 150, y: 250 })
 */
$e.backend.whiteboard.axis.user2systemCoords = (pos) => {
	const value = {};
	value.y = pos.y * $e.backend.whiteboard.axis.scale.y + $e.backend.whiteboard.axis.origin.y;
	value.x = pos.x * $e.backend.whiteboard.axis.scale.x + $e.backend.whiteboard.axis.origin.x;
	return value;
};

/**
 * Converts system coordinates to user coordinates
 * @private
 * @param {Array} pos System coordinates with Array elements x and y
 * @return User value which refers to the same system position
 * @example $e.backend.whiteboard.axis.system2userCoords({ x: 100, y: 200 })
 */
$e.backend.whiteboard.axis.system2userCoords = (pos) => {
	const value = {};
	value.x = (pos.x - $e.backend.whiteboard.axis.origin.x) / $e.backend.whiteboard.axis.scale.x;
	value.y = (pos.y - $e.backend.whiteboard.axis.origin.y) / $e.backend.whiteboard.axis.scale.y;
	return value;
};

/**
 * Converts user angle to system angle
 * @private
 * @param {Number} angle User angle
 * @return System value which refers to the same user angle
 * @example $e.backend.whiteboard.axis.user2systemAngle(90)
 */
$e.backend.whiteboard.axis.user2systemAngle = (angle) => {
	return $e.backend.whiteboard.axis.system2userAngle(angle);
};

/**
 * Converts system angle to user angle
 * @private
 * @param {Number} angle System angle
 * @return User value which refers to the same system position
 * @example $e.backend.whiteboard.axis.system2userAngle(90)
 */
$e.backend.whiteboard.axis.system2userAngle = (angle) => {
	if ($e.backend.whiteboard.axis.scale.x < 0) {
		angle = 180 - angle;
	}
	if ($e.backend.whiteboard.axis.scale.y < 0) {
		angle = angle * -1;
	}
	if (angle < 0) {
		angle += 360;
	}
	return angle;
};

/**
 * Change whiteboard axis based on UI settings
 * @private
 * @example $e.backend.whiteboard.axis.update()
 */
$e.backend.whiteboard.axis.update = () => {
	const gridModes = $e.backend.whiteboard.axis.predefined;
	let newUserSelection = $e.backend.whiteboard.axis.userSelection;
	if ($e.backend.whiteboard.axis.userSelection == gridModes.length) { // It was set as Custom
		newUserSelection = 0;
		gridModes.some((gridMode, i) => {
			if (gridMode.initial) {
				newUserSelection = i;
				return true;
			}
		});
	}
	$e.backend.whiteboard.axis.userSelection = newUserSelection;
	$e.backend.whiteboard.axis.change(gridModes[newUserSelection].origin, gridModes[newUserSelection].scale);
};

/**
 * Returns the $e.backend.whiteboard.axis.predefined index of the axis setup
 * If no parameters are passed it assumes current coordinates
 * @private
 * @param {Number} pos Position of the axis, origin us upperleft corner
 * @param {Number} scale Scale by which to multiply the x coordinates, originaly increasing from left to right
 * @return The index if it is found, -1 otherwise
 * @example $e.backend.whiteboard.axis.getIndexInPredefined(200, 200, 1, -1)
 */
$e.backend.whiteboard.axis.getIndexInPredefined = (pos = $e.backend.whiteboard.axis.origin, scale = $e.backend.whiteboard.axis.scale) => {
	const gridModes = $e.backend.whiteboard.axis.predefined;
	const foundPredefined = false;
	return gridModes.findIndex((gridMode) => {
		const compare_this = [ gridMode.origin.x, gridMode.origin.y, gridMode.scale.x, gridMode.scale.y ];
		const compare_with = [ pos.x,             pos.y,             scale.x,          scale.y          ];
		return compare_this.every((v, i) => (typeof v == "function" ? v() : v) === (typeof compare_with[i] == "function" ? compare_with[i]() : compare_with[i]));
	});
};