"use strict";

/**
 * Contains the icon definition for each instruction
 * @type {Array<{String, function(!HTMLElement, Number, Number, Array<String>)}>}
 * @example {" arc": (ctx, height, width, margin, param) => { ... } }
 */
	
$e.instructions.setIcon = (instructionSetId, iconEl, param) => {
	const height = $e.ui.blocks.getPropertyByLevel("level2", "height");
	const width = height; // Use width, not height, because the icons are squared
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	const margin = height < 4 * 15 ? 0 : 15;
	if ($e.instructions.icons[instructionSetId]) $e.instructions.icons[instructionSetId](ctx, height, width, margin, param, iconEl);
	iconEl.style.setProperty("--icon-image-current", "url(" + ctx.canvas.toDataURL() + ")");
};

$e.instructions.icons.animate = (ctx, height, width, margin, param) => {
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.arc(width / 2, height / 2, Math.max(width / 2 - margin, 0), 0, 360, false);
	ctx.closePath();
	ctx.stroke();
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(width / 2, height / 2);
	ctx.lineTo(4 * margin / 3, height / 2);
	ctx.closePath();
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(width / 2, height / 2);
	ctx.lineTo(width / 2, 3 * margin / 2);
	ctx.closePath();
	ctx.stroke();
};

$e.instructions.icons.animateLayers = (ctx, height, width, margin, param) => {
	const separation = 4;
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(margin + separation, height / 3 - separation);
	ctx.lineTo(2 * width / 3 + separation, height / 3 - separation);
	ctx.lineTo(2 * width / 3 + separation, (height - margin) - separation);
	ctx.lineTo(margin + separation, (height - margin) - separation);
	ctx.closePath();
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(margin + separation * 2, height / 3 - separation * 2);
	ctx.lineTo(2 * width / 3 + separation * 2, height / 3 - separation * 2);
	ctx.lineTo(2 * width / 3 + separation * 2, (height - margin) - separation * 2);
	ctx.lineTo(margin + separation * 2, (height - margin) - separation * 2);
	ctx.closePath();
	ctx.stroke();
	ctx.fillStyle = "#222222";
	ctx.beginPath();
	ctx.moveTo(margin, height / 3);
	ctx.lineTo(2 * width / 3, height / 3);
	ctx.lineTo(2 * width / 3, height - margin);
	ctx.lineTo(margin, height - margin);
	ctx.closePath();
	ctx.fill();
	ctx.strokeStyle = "#AAAAAA";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.arc(width - 1.5 * margin, Math.max(height - 1.5 * margin, 0), 1.5 * margin / 2, 0, 2 * Math.PI);
	ctx.closePath();
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(width - 1.5 * margin, height - 1.5 * margin);
	ctx.lineTo(width - 1.5 * margin + margin / 2, height - 1.5 * margin);
	ctx.closePath();
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(width - 1.5 * margin, height - 1.5 * margin);
	ctx.lineTo(width - 1.5 * margin, height - 1.5 * margin - margin / 2);
	ctx.closePath();
	ctx.stroke();
};

$e.instructions.icons.arc = (ctx, height, width, margin, param) => {
	let param1, param2;
	if (param) {
		param1 = parseInt(param[0]);
		param2 = parseInt(param[1]);
		if (!$e.isNumber(param2, true)) {
			param2 = 360;
		}
	} else {
		param1 = (height - margin * 2) / 3;
		param2 = 360;
	}
	if (!$e.isNumber(param1, true) || !$e.isNumber(param2, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam1 = (height - margin * 2) / 2;
	const maxparam2 = 360;
	if ($e.isNumber(param2, true) && param2 < 0) {
		param2 = param2 % 360;
	}
	if (!$e.isNumber(param1, true)) {
		param1 = maxparam1;
	}
	if (!$e.isNumber(param2, true) || param2 > maxparam2) {
		param2 = maxparam2;
	}
	const radius = Math.min(param1, maxparam1);
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 3;
	const startAngle = 0;
	const endAngle = param2 * Math.PI / 180;
	ctx.beginPath();
	ctx.arc(width / 2, height / 2, Math.max(radius, 0), startAngle, endAngle, false);
	ctx.stroke();
	ctx.closePath();
};

$e.instructions.icons.array = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	const minfont = 10;
	const maxfont = 20;
	let fontSize = minfont;
	if (param) fontSize = (width - margin * 2) / param.length;
	if (fontSize < minfont) fontSize = minfont;
	if (fontSize > maxfont) fontSize = maxfont;
	ctx.font = fontSize + "px Verdana";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(param, margin, height - margin);
	ctx.font = "32px Verdana";
	ctx.fillText("[ ]", margin, height / 2);
};

$e.instructions.icons.beginShape = (ctx, height, width, margin, param) => {
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.fillStyle = "#00FFFF";
	ctx.beginPath();
	ctx.rect(margin, margin, width - margin * 2, height - margin * 2);
	ctx.fill();
	ctx.closePath();
	ctx.lineWidth = 4;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width - margin, margin);
	ctx.lineTo(margin, margin);
	ctx.lineTo(margin, height / 2);
	ctx.stroke();
	ctx.closePath();
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.arc(margin, height / 2, 2, Math.max(startAngle, 2), endAngle, false);
	ctx.arc(margin, margin + 3 * (height - margin * 2) / 4, 2, startAngle, endAngle, false);
	ctx.arc(margin, height - margin, 2, startAngle, endAngle, false);
	ctx.fill();
};

$e.instructions.icons.changeAxis = (ctx, height, width, margin, param) => {
	margin = 20;
	if (!param) return;
	let param1 = parseInt(param[0]);
	let param2 = parseInt(param[1]);
	if (!$e.isNumber(param1, true) || !$e.isNumber(param2, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	if (!$e.isNumber(param1, true)) {
		param1 = width / 2;
	} else {
		param1 = margin + parseInt(param1) / canvasWidth * (width - (2 * margin));
	}
	if (!$e.isNumber(param2, true)) {
		param2 = height / 2;
	} else {
		param2 = margin + parseInt(param2) / canvasHeight * (height - (2 * margin));
	}
	const arrowSize = 6;
	ctx.strokeStyle = "#000000";
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(param1, margin);
	ctx.lineTo(param1, height - margin);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(param1 - arrowSize / 2, margin);
	ctx.lineTo(param1 + arrowSize / 2, margin);
	ctx.lineTo(param1, margin - arrowSize);
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(margin, param2);
	ctx.lineTo(width - margin, param2);
	ctx.closePath();
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(width - margin, param2 - arrowSize / 2);
	ctx.lineTo(width - margin, param2 + arrowSize / 2);
	ctx.lineTo(width - margin + arrowSize, param2);
	ctx.fill();
};

$e.instructions.icons.clean = (ctx, height, width, margin, param) => {
	ctx.strokeStyle = "#000088";
	ctx.moveTo(margin, margin);
	ctx.lineTo(width - margin, height - margin);
	ctx.moveTo(width - margin, margin);
	ctx.lineTo(margin, height - margin);
	ctx.stroke();
};

$e.instructions.icons.comment = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	const fontSize = 10;
	ctx.font = fontSize + "px Verdana";
	ctx.fillStyle = "#000000";
	ctx.fillText(param, margin, height - margin);
};

$e.instructions.icons.commentmultilinesingle = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	const fontSize = 10;
	ctx.font = fontSize + "px Verdana";
	ctx.fillStyle = "#000000";
	ctx.fillText(param, margin, height - margin);
};

$e.instructions.icons.endShape = (ctx, height, width, margin, param) => {
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.fillStyle = "#00FFFF";
	ctx.beginPath();
	ctx.rect(margin, margin, width - margin * 2, height - margin * 2);
	ctx.fill();
	ctx.closePath();
	ctx.lineWidth = 4;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width - margin, margin);
	ctx.lineTo(margin, margin);
	ctx.lineTo(margin, height - margin);
	ctx.lineTo(width - margin, height - margin);
	ctx.lineTo(width - margin, margin + 3 * (height - margin * 2) / 4);
	ctx.stroke();
	ctx.closePath();
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.arc(width - margin, height / 2, 2, startAngle, endAngle, false);
	ctx.arc(width - margin, margin + (height - margin * 2) / 4, 2, startAngle, endAngle, false);
	ctx.arc(width - margin, margin, 2, startAngle, endAngle, false);
	ctx.fill();
};

$e.instructions.icons.fill = $e.instructions.icons["fill-container"] = (ctx, height, width, margin, param) => {
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	let fillColor = "#00FFFF";
	let borderColor = "#008888";
	if (param) {
		if (param[0] && typeof param[0] == "string") {
			const color = param[0].replace(/^['"]/, '').replace(/['"]$/, '');
			if ($e.isColor(color)) fillColor = color;
		}
		if (param[1] && typeof param[1] == "string") {
			const color = param[1].replace(/^['"]/, '').replace(/['"]$/, '');
			if ($e.isColor(color)) borderColor = color;
		}
	}
	ctx.fillStyle = fillColor;
	ctx.beginPath();
	ctx.rect(margin, margin, width - margin * 2, height - margin * 2);
	ctx.fill();
	ctx.closePath();
	ctx.lineWidth = 4;
	ctx.strokeStyle = borderColor;
	ctx.beginPath();
	ctx.moveTo(width - margin, margin);
	ctx.lineTo(margin, margin);
	ctx.lineTo(margin, height / 2);
	ctx.stroke();
	ctx.closePath();
	ctx.fillStyle = borderColor;
	ctx.beginPath();
	ctx.arc(margin, height / 2, 2, startAngle, endAngle, false);
	ctx.arc(margin, margin + 3 * (height - margin * 2) / 4, 2, startAngle, endAngle, false);
	ctx.arc(margin, height - margin, 2, startAngle, endAngle, false);
	ctx.fill();
};

$e.instructions.icons.flipHorizontally = (ctx, height, width, margin, param) => {
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#888888";
	ctx.moveTo(margin, margin);
	ctx.lineTo(width / 2 - margin / 2, margin + (height - margin * 2) / 3);
	ctx.lineTo(width / 2 - margin / 2, margin + 2 * (height - margin * 2) / 3);
	ctx.lineTo(margin, height - margin);
	ctx.lineTo(margin, margin);
	ctx.stroke();
	ctx.beginPath();
	ctx.fillStyle = "#888888";
	ctx.moveTo(width - margin, margin);
	ctx.lineTo(width / 2 + margin / 2, margin + (height - margin * 2 ) / 3);
	ctx.lineTo(width / 2 + margin / 2, margin + 2 * (height - margin * 2 ) / 3);
	ctx.lineTo(width - margin, height - margin);
	ctx.lineTo(width - margin, margin);
	ctx.fill();
};

$e.instructions.icons.flipVertically = (ctx, height, width, margin, param) => {
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#888888";
	ctx.moveTo(margin, margin);
	ctx.lineTo(margin + (width - margin * 2) / 3, height / 2 - margin / 2);
	ctx.lineTo(margin + 2 * (width - margin * 2) / 3, height / 2 - margin / 2);
	ctx.lineTo(width - margin, margin);
	ctx.lineTo(margin, margin);
	ctx.stroke();
	ctx.beginPath();
	ctx.fillStyle = "#888888";
	ctx.moveTo(margin, height - margin);
	ctx.lineTo(margin + (width - margin * 2) / 3, height / 2 + margin / 2);
	ctx.lineTo(margin + 2 * (width - margin * 2) / 3, height / 2 + margin / 2);
	ctx.lineTo(width - margin, height - margin);
	ctx.lineTo(margin, height - margin);
	ctx.fill();
};

$e.instructions.icons.forward = (ctx, height, width, margin, param) => {
	if (param) {
		param = parseInt(param[0]);
	} else {
		param = 50;
	}
	if (!$e.isNumber(param, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam = 250;
	let backwards = false;
	if ($e.isNumber(param, true) && param < 0) {
		backwards = true;
		param = -param;
	}
	if (!$e.isNumber(param, true) || param > maxparam * 0.75) {
		param = maxparam * 0.75;
	}
	const lineHeight = (height - margin * 2) * param / maxparam;
	const lineWidth = (width - margin * 2) / 2 * (1 - param / maxparam);
	const arrowHeight = (height - margin * 2) - lineHeight;
	const arrowWidth = Math.min(2 * lineWidth, width - 2 * margin);
	ctx.fillStyle = "#0000FF";
	ctx.beginPath();
	if (!backwards) {
		ctx.moveTo(width / 2 - lineWidth / 2, height - margin);
		ctx.lineTo(width / 2 + lineWidth / 2, height - margin);
		ctx.lineTo(width / 2 + lineWidth / 2, margin + arrowHeight);
		ctx.lineTo(width / 2 + arrowWidth / 2, margin + arrowHeight);
		ctx.lineTo(width / 2, margin);
		ctx.lineTo(width / 2 - arrowWidth / 2, margin + arrowHeight);
		ctx.lineTo(width / 2 - lineWidth / 2, margin + arrowHeight);
	} else {
		ctx.moveTo(width / 2 - lineWidth / 2, margin ) ;
		ctx.lineTo(width / 2 + lineWidth / 2, margin ) ;
		ctx.lineTo(width / 2 + lineWidth / 2, margin + lineHeight);
		ctx.lineTo(width / 2 + arrowWidth / 2, margin + lineHeight);
		ctx.lineTo(width / 2, height - margin);
		ctx.lineTo(width / 2 - arrowWidth / 2, margin + lineHeight);
		ctx.lineTo(width / 2 - lineWidth / 2, margin + lineHeight);
	}
	ctx.closePath();
	ctx.fill();
};

$e.instructions.icons.function = $e.instructions.icons["function-container"] = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	const minfont = 10;
	const maxfont = 20;
	let fontSize = minfont;
	if (param) fontSize = (width - margin * 2) / param.length;
	if (fontSize < minfont) fontSize = minfont;
	if (fontSize > maxfont) fontSize = maxfont;
	ctx.font = fontSize + "px Verdana";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(param, margin, height - margin);
	ctx.font = "32px Verdana";
	ctx.fillText("( )", margin, height / 2);
};

$e.instructions.icons.call = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	const minfont = 10;
	const maxfont = 20;
	let fontSize = minfont;
	if (param) fontSize = (width - margin * 2) / param.length;
	if (fontSize < minfont) fontSize = minfont;
	if (fontSize > maxfont) fontSize = maxfont;
	ctx.font = fontSize + "px Verdana";
	ctx.fillStyle = "#000000";
	ctx.fillText(param, margin, height / 2);
	ctx.fillText("(...)", margin + fontSize, height / 2 + fontSize);
};

$e.instructions.icons.goTo = (ctx, height, width, margin, param) => {
	margin = 20;
	if (!param) return;
	const param1 = parseInt(param[0]);
	const param2 = parseInt(param[1]);
	if (!$e.isNumber(param1, true) || !$e.isNumber(param2, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const canvasWidth = $e.backend.whiteboard.width;
	const canvasHeight = $e.backend.whiteboard.width;
	if (!$e.isNumber(param1, true)) {
		param1 = 0;
	}
	if (!$e.isNumber(param2, true)) {
		param2 = canvasHeight / 2 + $e.backend.whiteboard.axis.y;
	}
	const coords = $e.backend.whiteboard.axis.user2systemCoords({ x: parseInt(param1), y: parseInt(param2) });
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.arc(margin + (width - margin * 2) * coords.x / canvasWidth, margin + (height - margin * 2) * coords.y / canvasHeight, Math.max(height / 20, 0), startAngle, endAngle, false);
	ctx.closePath();
	ctx.fill();
};

$e.instructions.icons.goToCenter = (ctx, height, width, margin, param) => {
	margin = 20;
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.arc(width / 2, height / 2, Math.max(height / 20, 0), startAngle, endAngle, false);
	ctx.fill();
};

$e.instructions.icons.goToLowLeft = (ctx, height, width, margin, param) => {
	margin = 20;
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.arc(margin, height - margin, Math.max(height / 20, 0), startAngle, endAngle, false);
	ctx.fill();
};

$e.instructions.icons.goToLowRight = (ctx, height, width, margin, param) => {
	margin = 20;
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.arc(width - margin, height - margin, Math.max(height / 20, 0), startAngle, endAngle, false);
	ctx.fill();
};

$e.instructions.icons.goToUpLeft = (ctx, height, width, margin, param) => {
	margin = 20;
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.arc(margin, margin, Math.max(height / 20, 0), startAngle, endAngle, false);
	ctx.fill();
};

$e.instructions.icons.goToUpRight = (ctx, height, width, margin, param) => {
	margin = 20;
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.arc(width - margin, margin, Math.max(height / 20, 0), startAngle, endAngle, false);
	ctx.fill();
};

$e.instructions.icons.hide = (ctx, height, width, margin, param) => {
	ctx.beginPath();
	ctx.strokeStyle = "#000000";
	ctx.setLineDash([5]);
	ctx.moveTo(width / 4, margin);
	ctx.lineTo(width / 4, height - margin);
	ctx.lineTo(3 * width / 4, height / 2);
	ctx.lineTo(width / 4, margin);
	ctx.stroke();
};

$e.instructions.icons.image = (ctx, height, width, margin, param) => {
	margin = 20;
	ctx.beginPath();
	ctx.fillStyle = "#FFFFFF";
	ctx.rect(margin / 2, margin, width - margin, height - margin * 2);
	ctx.fill();
	ctx.strokeStyle = "#000000";
	ctx.stroke();
	ctx.save();
	ctx.clip();
	for (let i = 0; i < 15; i++) {
		const startAngle = Math.random() * 2 * Math.PI;
		const endAngle = Math.random() * 2 * Math.PI;
		ctx.fillStyle = "rgb(" + parseInt(256 * Math.random()) + ", " + parseInt(256 * Math.random()) + ", " + parseInt(256 * Math.random()) + ")";
		ctx.beginPath();
		ctx.arc(margin / 2 + (width - margin) * Math.random(), margin + (height - margin * 2) * Math.random(), Math.max((height - margin * 2) / 2 * Math.random(), 0), startAngle, endAngle, false);
		ctx.fill();
	}
	ctx.restore();
};

$e.instructions.icons["if-container"] = (ctx, height, width, margin, param) => {
	ctx.lineWidth = '3';
	ctx.strokeStyle = "#000000";	
	ctx.moveTo(width - margin * 2, margin * 1.5);
	ctx.lineTo(margin, height / 2);
	ctx.lineTo(width - margin * 2, height - margin * 1.5);
	ctx.stroke();
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width - margin * 2, margin);
	ctx.lineTo(width - margin, margin * 1.5);
	ctx.lineTo(width - margin * 2, margin * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(width - margin * 2, height - margin);
	ctx.lineTo(width - margin, height - margin * 1.5);
	ctx.lineTo(width - margin * 2, height - margin * 2);
	ctx.fill();
};

$e.instructions.icons.if = (ctx, height, width, margin, param) => {
	ctx.lineWidth = '3';
	ctx.strokeStyle = "#000000";	
	ctx.moveTo(width - margin * 2, margin * 1.5);
	ctx.lineTo(margin, height / 2);
	ctx.lineTo(width - margin * 2, height - margin * 1.5);
	ctx.stroke();
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width - margin * 2, margin);
	ctx.lineTo(width - margin, margin * 1.5);
	ctx.lineTo(width - margin * 2, margin * 2);
	ctx.fill();
	ctx.moveTo(width - margin, height - margin);
	ctx.lineTo(width - margin * 2, height - margin * 2);
	ctx.moveTo(width - margin, height - margin * 2);
	ctx.lineTo(width - margin * 2, height - margin);
	ctx.stroke();
};

$e.instructions.icons.elseIf = (ctx, height, width, margin, param) => {
	ctx.lineWidth = '3';
	ctx.strokeStyle = "#000000";	
	ctx.moveTo(margin * 1.5, margin * 1.5);
	ctx.lineTo(margin, height / 2);
	ctx.lineTo(margin * 1.5, height - margin * 1.5);
	ctx.stroke();
	ctx.moveTo(margin, height / 2);
	ctx.lineTo(width - margin * 2, height / 2);
	ctx.stroke();
	ctx.fillStyle = "#000000";
	ctx.moveTo(margin * 1.5, margin);
	ctx.lineTo(margin * 1.5 + margin, margin * 2);
	ctx.moveTo(margin * 1.5, margin * 2);
	ctx.lineTo(margin * 1.5 + margin, margin);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(width - margin * 2, height / 2 - margin / 2);
	ctx.lineTo(width - margin, height / 2);
	ctx.lineTo(width - margin * 2, height / 2 + margin / 2);
	ctx.fill();
	ctx.moveTo(margin * 1.5, height - margin);
	ctx.lineTo(margin * 1.5 + margin, height - margin * 2);
	ctx.moveTo(margin * 1.5, height - margin * 2);
	ctx.lineTo(margin * 1.5 + margin, height - margin);
	ctx.stroke();
};

$e.instructions.icons.else = (ctx, height, width, margin, param) => {
	ctx.lineWidth = '3';
	ctx.strokeStyle = "#000000";	
	ctx.moveTo(width - margin * 2, margin * 1.5);
	ctx.lineTo(margin, height / 2);
	ctx.lineTo(width - margin * 2, height - margin * 1.5);
	ctx.stroke();
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width - margin * 2, height - margin);
	ctx.lineTo(width - margin, height - margin * 1.5);
	ctx.lineTo(width - margin * 2, height - margin * 2);
	ctx.fill();
	ctx.moveTo(width - margin, margin);
	ctx.lineTo(width - margin * 2, margin * 2);
	ctx.moveTo(width - margin, margin * 2);
	ctx.lineTo(width - margin * 2, margin);
	ctx.stroke();
};

$e.instructions.icons.line = (ctx, height, width, margin, param) => {
	ctx.lineWidth = '3';
	ctx.strokeStyle = "#000000";
	ctx.moveTo(width / 2, height - margin);
	ctx.lineTo(width - margin, margin);
	ctx.stroke();
};

$e.instructions.icons.lineAt = (ctx, height, width, margin, param) => {
	let literals = true;
	let param1, param2, param3, param4;
	if (param && param.length) {
		param1 = parseInt(param[0]);
		param2 = parseInt(param[1]);
		param3 = parseInt(param[2]);
		param4 = parseInt(param[3]);
		if (!$e.isNumber(param1, true) || !$e.isNumber(param2, true) || !$e.isNumber(param3, true) || !$e.isNumber(param4, true)) {
			literals = false;
		}
	}
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#FFFFFF";
	let org = {};
	let destination;
	if (literals) {
		const canvasWidth = $e.backend.whiteboard.width;
		const canvasHeight = $e.backend.whiteboard.width;
		org = $e.backend.whiteboard.axis.user2systemCoords({ x: parseInt(param1), y: parseInt(param2) });
		org.x = margin + (width - margin * 2) * org.x / canvasWidth;
		org.y = margin + (height - margin * 2) * org.y / canvasHeight;
		destination = $e.backend.whiteboard.axis.user2systemCoords({ x: parseInt(param3), y: parseInt(param4) });
		destination.x = margin + (width - margin * 2) * destination.x / canvasWidth;
		destination.y = margin + (height - margin * 2) * destination.y / canvasHeight;
	} else {
		org = { x: width / 2, y: height - margin };
		destination = { x: width - margin, y: margin };
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	ctx.moveTo(org.x, org.y);
	ctx.lineTo(destination.x, destination.y);
	ctx.stroke();
};

$e.instructions.icons.move = (ctx, height, width, margin, param) => {
	let param1, param2;
	if (param != null && param != undefined && param != "") {
		param1 = parseInt(param[0]);
		param2 = parseInt(param[1]);
	}
	if ($e.isNumber(param1, true) && $e.isNumber(param2, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam1 = 100;
	if (!$e.isNumber(param1, true) || param1 > maxparam1 * 0.75) {
		param1 = maxparam1 * 0.75;
	}
	const maxparam2 = 100;
	if (!$e.isNumber(param2, true) || param2 > maxparam2 * 0.75) {
		param2 = maxparam2 * 0.75;
	}
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#000000";
	const lineWidth = width / 20;
	const squareWidth = (width - margin) / 2 * param1 / maxparam1;
	const squareHeight = (height - margin) / 2 * param2 / maxparam2;
	ctx.beginPath();
	ctx.moveTo(width / 2, height / 2);
	ctx.lineTo(width / 2 + squareWidth, height / 2 + squareHeight);
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.arc(width / 2 + squareWidth, height / 2 + squareHeight, Math.max(1.5 * lineWidth, 0), 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
};

$e.instructions.icons.moveDown = (ctx, height, width, margin, param) => {
	let param1;
	if (param != null && param != undefined && param != "") {
		param1 = parseInt(param[0]);
	}
	if (!$e.isNumber(param1, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam1 = 100;
	if (!$e.isNumber(param1, true) || param1 > maxparam1 * 0.75) {
		param1 = maxparam1 * 0.75;
	}
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#000000";
	const lineWidth = width / 20;
	const squareWidth = 0;
	const squareHeight = (height - margin) / 2 * param1 / maxparam1;
	ctx.beginPath();
	ctx.moveTo(width / 2, height / 2);
	ctx.lineTo(width / 2 + squareWidth, height / 2 + squareHeight);
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.arc(width / 2 + squareWidth, height / 2 + squareHeight, Math.max(1.5 * lineWidth, 0), 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
};

$e.instructions.icons.moveLeft = (ctx, height, width, margin, param) => {
	let param1;
	if (param != null && param != undefined && param != "") {
		param1 = parseInt(param[0]);
	}
	if (!$e.isNumber(param1, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam1 = 100;
	if (!$e.isNumber(param1, true) || param1 > maxparam1 * 0.75) {
		param1 = maxparam1 * 0.75;
	}
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#000000";
	const lineWidth = width / 20;
	const squareWidth = (width - margin) / 2 * param1 / maxparam1;
	const squareHeight = 0;
	ctx.beginPath();
	ctx.moveTo(width / 2, height / 2);
	ctx.lineTo(width / 2 + squareWidth, height / 2 + squareHeight);
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.arc(width / 2 + squareWidth, height / 2 + squareHeight, Math.max(1.5 * lineWidth, 0), 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
};

$e.instructions.icons.moveRight = (ctx, height, width, margin, param) => {
	let param1;
	if (param != null && param != undefined && param != "") {
		param1 = parseInt(param[0]);
	}
	if (!$e.isNumber(param1, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam1 = 100;
	if (!$e.isNumber(param1, true) || param1 > maxparam1 * 0.75) {
		param1 = maxparam1 * 0.75;
	}
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#000000";
	const lineWidth = width / 20;
	const squareWidth = (width - margin) / 2 * param1 / maxparam1;
	const squareHeight = 0;
	ctx.beginPath();
	ctx.moveTo(width / 2, height / 2);
	ctx.lineTo(width / 2 + squareWidth, height / 2 + squareHeight);
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.arc(width / 2 + squareWidth, height / 2 + squareHeight, Math.max(1.5 * lineWidth, 0), 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
};

$e.instructions.icons.moveUp = (ctx, height, width, margin, param) => {
	let param1;
	if (param != null && param != undefined && param != "") {
		param1 = parseInt(param[0]);
	}
	if (!$e.isNumber(param1, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam1 = 100;
	if (!$e.isNumber(param1, true) || param1 > maxparam1 * 0.75) {
		param1 = maxparam1 * 0.75;
	}
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#000000";
	const lineWidth = width/20;
	const squareWidth = 0;
	const squareHeight = (height - margin) / 2 * param1 / maxparam1;
	ctx.beginPath();
	ctx.moveTo(width / 2, height / 2);
	ctx.lineTo(width / 2 + squareWidth, height / 2 + squareHeight);
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.arc(width / 2 + squareWidth, height/ 2 + squareHeight, Math.max(1.5 * lineWidth, 0), 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
};

$e.instructions.icons.null = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	ctx.font = "10px Verdana";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(param, margin, height / 2);
};

$e.instructions.icons.nullChild = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	ctx.font = "10px Verdana";
	ctx.fillStyle = "#000000";
	ctx.fillText(param, margin, height / 2);
};

$e.instructions.icons.pull = (ctx, height, width, margin, param) => {
	if (param != null && param != undefined && param != "") {
		param = parseInt(param[0]);
	} else {
		param = 1;
	}
	if (!$e.isNumber(param, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam = 6;
	if (!$e.isNumber(param, true) || param > maxparam * 0.75) {
		param = maxparam * 0.75;
	}
	ctx.fillStyle = "#00FF00";
	ctx.beginPath();
	ctx.moveTo(margin, height - margin);
	ctx.lineTo(width - margin, height - margin);
	ctx.lineTo(width / 2, height / 2 - (height - margin * 2) / 2 * (param - 1) / (maxparam - 1));
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.moveTo(margin, margin);
	ctx.lineTo(width - margin, margin);
	ctx.lineTo(width - margin, height / 2 - (height - margin * 2) / 2 * (param - 1) / (maxparam - 1));
	ctx.lineTo(margin, height / 2 - (height - margin * 2) / 2 * (param - 1) / (maxparam - 1));
	ctx.fill();
	ctx.closePath();
};

$e.instructions.icons.push = (ctx, height, width, margin, param) => {
	if (param != null && param != undefined && param != "") {
		param = parseInt(param[0]);
	} else {
		param = 1;
	}
	if (!$e.isNumber(param, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam = 6;
	if (!$e.isNumber(param, true) || param > maxparam * 0.75) {
		param = maxparam * 0.75;
	}
	ctx.fillStyle = "#FFFFFF";
	ctx.beginPath();
	ctx.moveTo(margin, margin);
	ctx.lineTo(width - margin, margin);
	ctx.lineTo(width / 2, height / 2 + (height - margin * 2) / 2 * (param - 1) / (maxparam - 1));
	ctx.fill();
	ctx.closePath();
	ctx.beginPath();
	ctx.moveTo(margin, height - margin);
	ctx.lineTo(width - margin, height - margin);
	ctx.lineTo(width - margin, height / 2 + (height - margin * 2) / 2 * (param - 1) / (maxparam - 1));
	ctx.lineTo(margin, height / 2 + (height - margin * 2) / 2 * (param - 1) / (maxparam - 1));
	ctx.fill();
	ctx.closePath();
};

$e.instructions.icons.pop = (ctx, height, width, margin, param) => {
	const separation = 4;
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(margin + separation, height / 3 - separation);
	ctx.lineTo(2 * width / 3 + separation, height / 3 - separation);
	ctx.lineTo(2 * width / 3 + separation, (height - margin) - separation);
	ctx.lineTo(margin + separation, (height - margin) - separation);
	ctx.closePath();
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(margin + separation * 2, height / 3 - separation * 2);
	ctx.lineTo(2 * width / 3 + separation * 2, height / 3 - separation * 2);
	ctx.lineTo(2 * width / 3 + separation * 2, (height - margin) - separation * 2);
	ctx.lineTo(margin + separation * 2, (height - margin) - separation * 2);
	ctx.closePath();
	ctx.stroke();
	ctx.strokeStyle = "#AAAAAA";
	ctx.beginPath();
	ctx.moveTo(margin, height / 3);
	ctx.lineTo(2 * width / 3, height - margin);
	ctx.closePath();
	ctx.stroke();
	ctx.beginPath();
	ctx.lineTo(2 * width / 3, height / 3);
	ctx.lineTo(margin, height - margin);
	ctx.closePath();
	ctx.stroke();
};

$e.instructions.icons.repeat = $e.instructions.icons["repeat-container"] = (ctx, height, width, margin, param) => {
	const param1 = parseInt(param[0]);
	if ($e.isNumber(param1, true)) {
		param = param1;
	} else {
		if (param[0] !== undefined) {
			ctx.font = 12 + "px Verdana";
			ctx.fillStyle = "#000000";
			ctx.fillText(_("variable"), margin, height);
		}
		param = "n";
	}
	const lineWidth = 3;
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = "#000000";
	ctx.moveTo(width / 2 + margin / 2, margin * 1.5);
	ctx.lineTo(width - margin, margin * 1.5);
	ctx.lineTo(width - margin, height - margin);
	ctx.lineTo(margin, height - margin);
	ctx.lineTo(margin, margin * 1.5);
	ctx.lineTo(width / 2, margin * 1.5);
	ctx.stroke();
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width / 2 - 3, margin);
	ctx.lineTo(width / 2 + margin / 2 - 3, margin * 1.5);
	ctx.lineTo(width / 2 - 3, margin * 2);
	ctx.fill();
	ctx.font = "bold " + (height - (margin + lineWidth)) / (param.toString().length * 1.5) + "px Verdana";
	ctx.fillStyle = "#000000";
	ctx.fillText(param, margin + lineWidth, height - (margin + lineWidth));
};

$e.instructions.icons.rotateLeft = (ctx, height, width, margin, param) => {
	let param1;
	if (param) param1 = parseInt(param[0]);
	if (!$e.isNumber(param1, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam1 = 360;
	if (!$e.isNumber(param1, true) || param1 > maxparam1) {
		param1 = maxparam1;
	}
	const lineWidth = height / 20;
	ctx.beginPath();
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 3;
	const startAngle = 0;
	const endAngle = param1 * Math.PI / 180;
	ctx.arc(width / 2, height / 2, Math.max((height - margin) / 2, 0), startAngle, endAngle, false);
	ctx.stroke();
	ctx.closePath();
	let COx, COy; // vector from center to origin
	COx = 0-lineWidth;
	COy = (height - margin) / 2 - lineWidth;
	const rotateAngle = -param1 * Math.PI / 180;
	const x = width / 2 + Math.cos(rotateAngle) * COx - Math.sin(rotateAngle) * COy;
	const y = height / 2 + Math.sin(rotateAngle) * COx + Math.cos(rotateAngle) * COy;
	ctx.beginPath();
	ctx.fillStyle = "#000000";
	ctx.arc(x, y, Math.max(1.5 * lineWidth, 0), 0, 2 * Math.PI, false);
	ctx.fill();
};

$e.instructions.icons.rotateRight = (ctx, height, width, margin, param) => {
	margin = 30;
	let param1;
	if (param) param1 = -parseInt(param[0]);
	if (!$e.isNumber(param1, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam1 = 360;
	if (!$e.isNumber(param1, true) || param1 * (-1) > maxparam1) {
		param1 = maxparam1 * (-1);
	}
	const lineWidth = height / 20;
	ctx.beginPath();
	ctx.lineWidth = lineWidth;
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 3;
	const startAngle = Math.PI;
	const endAngle = param1 * Math.PI / 180;
	ctx.arc(width / 2, height / 2, Math.max((height - margin) / 2, 0), startAngle, endAngle, false);
	ctx.stroke();
	ctx.closePath();
	let COx, COy; // vector from center to origin
	COx = 0 - lineWidth;
	COy = (height - margin) / 2 - lineWidth;
	const rotateAngle = -param1 * Math.PI / 180;
	const x = width / 2 + Math.cos(rotateAngle) * COx - Math.sin(rotateAngle) * COy;
	const y = height / 2 + Math.sin(rotateAngle) * COx + Math.cos(rotateAngle) * COy;
	ctx.beginPath();
	ctx.fillStyle = "#000000";
	ctx.arc(x, y, Math.max(1.5 * lineWidth, 0), 0, 2 * Math.PI, false);
	ctx.fill();
	ctx.closePath();
};

$e.instructions.icons.scale = (ctx, height, width, margin, param) => {
	let param1;
	let param2;
	if (param) {
		param1 = parseInt(param[0]);
		param2 = parseInt(param[1]);
	} else {
		param1 = 1;
		param2 = 1;
	}
	if (!$e.isNumber(param1, true) || !$e.isNumber(param2, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam1 = 2;
	if (!$e.isNumber(param1, true) || param1 > maxparam1) {
		param1 = maxparam1;
	}
	const maxparam2 = 2;
	if (!$e.isNumber(param2, true) || param2 > maxparam2) {
		param2 = maxparam2;
	}
	ctx.beginPath();
	ctx.fillStyle = "#FFFFFF";
	ctx.rect(margin, margin, param1 * (width - margin * 2) / 2, param2 * (width - margin * 2) / 2);
	ctx.stroke();
	ctx.closePath();
	ctx.beginPath();
	ctx.strokeStyle = "#AAAAAA";
	ctx.rect(margin, margin, (width - margin * 2) / 2, (width - margin * 2) / 2);
	ctx.stroke();
	ctx.closePath();
};

$e.instructions.icons.setBold = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	if (param === undefined || param === "undefined" || param === "") {
		param = "true";
	}
	if (param === "true" || param === "false") {
		param = (param === "true");
	}
	if (!$e.isBoolean(param)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
		param = true;
	}
	ctx.font = ((param || param === undefined) ? "bold " : "") + (height - margin * 2) + "px Verdana";
	ctx.fillStyle = (param || param === undefined) ? "#000000" : "#AAAAAA";
	ctx.fillText("B", margin, height - margin);
};

$e.instructions.icons.setColor = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	if (!param.startsWith("\"") || !param.endsWith("\"")) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
		param = '"#123456"';
	}
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.fillStyle = param.slice(1, param.length - 1);
	ctx.strokeStyle = "#000000";
	ctx.moveTo(width / 2, height / 2);
	ctx.beginPath();
	ctx.arc(width / 2, height / 2, Math.max(height / 3, 0), startAngle, endAngle, false);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

$e.instructions.icons.setSize = (ctx, height, width, margin, param) => {
	if (param) param = parseInt(param[0]);
	if (!$e.isNumber(param, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const maxparam = 20;
	if (!$e.isNumber(param, true) || param > maxparam * 0.85) {
		param = maxparam * 0.85;
	}
	const squareWidth = (width - margin * 2) * (param / maxparam);
	const squareHeight = (height - margin * 2) * (param / maxparam);
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width / 2 - squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.lineTo(width / 2 + squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.lineTo(width / 2 + squareWidth / 2, height / 2 + squareHeight / 2);
	ctx.lineTo(width / 2 - squareWidth / 2, height / 2 + squareHeight / 2);
	ctx.lineTo(width / 2 - squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(width / 2 - squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.lineTo(width / 2 + squareWidth / 2, height / 2 + squareHeight / 2);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(width / 2 - squareWidth / 2, height / 2 + squareHeight / 2);
	ctx.lineTo(width / 2 + squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.stroke();
};

$e.instructions.icons.setFont = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	if ($e.ide.blocks.blockParameterIsComplex(param)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
		param = "";
	} else {
		param = JSON.parse(param);
	}
	ctx.font = (height - margin * 2) + "px " + (param ? param : "sans-serif");
	ctx.fillStyle = "#000000";
	ctx.fillText("F", margin, height - margin);
};

$e.instructions.icons.setItalic = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	if (param === undefined || param === "undefined" || param === "") {
		param = "true";
	}
	if (param === "true" || param === "false") {
		param = (param === "true");
	}
	if (!$e.isBoolean(param)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
		param = true;
	}
	ctx.font = ((param || param === undefined) ? "italic " : "") + (height - margin * 2) + "px Verdana";
	ctx.fillStyle = (param || param === undefined) ? "#000000" : "#AAAAAA";
	ctx.fillText("I", margin, height - margin);
};

$e.instructions.icons.show = (ctx, height, width, margin, param) => {
	ctx.beginPath();
	ctx.fillStyle = "#000000";
	ctx.moveTo(width / 4, margin);
	ctx.lineTo(width / 4, height - margin);
	ctx.lineTo(3 * width / 4, height / 2);
	ctx.fill();
};

$e.instructions.icons.snapshot = (ctx, height, width, margin, param) => {
	const separation = 4;
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(margin + separation, height / 3 - separation);
	ctx.lineTo(2 * width / 3 + separation, height / 3 - separation);
	ctx.lineTo(2 * width / 3 + separation, (height - margin) - separation);
	ctx.lineTo(margin + separation, (height - margin) - separation);
	ctx.closePath();
	ctx.stroke();
	ctx.fillStyle = "#222222";
	ctx.beginPath();
	ctx.moveTo(margin, height / 3);
	ctx.lineTo(2 * width / 3, height / 3);
	ctx.lineTo(2 * width / 3, height - margin);
	ctx.lineTo(margin, height - margin);
	ctx.closePath();
	ctx.fill();
};

$e.instructions.icons.sound = (ctx, height, width, margin, param) => {
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(width / 2, height - margin);
	ctx.lineTo(width / 2, margin);
	ctx.lineTo(margin, height / 2 - margin);
	ctx.lineTo(margin, height / 2 + margin);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle = "#BBBBBB";
	ctx.lineWidth = 2;
	ctx.moveTo(width / 2 + (width / 2 - margin) / 4, height / 2 + margin);
	ctx.lineTo(width - margin, height - margin);
	ctx.stroke();
	ctx.moveTo(width / 2 + (width / 2 - margin) / 4, height / 2);
	ctx.lineTo(width - margin, height / 2);
	ctx.stroke();
	ctx.moveTo(width / 2 + (width / 2 - margin) / 4, height / 2 - margin);
	ctx.lineTo(width - margin, margin);
	ctx.stroke();
};

$e.instructions.icons.stop = (ctx, height, width, margin, param) => {
	ctx.fillStyle = "#FF0000";
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(margin + (width - margin * 2) / 3, margin);
	ctx.lineTo(margin + 2 * (width - margin * 2) / 3, margin);
	ctx.lineTo(width - margin, margin + (height - margin * 2) / 3);
	ctx.lineTo(width - margin, margin + 2 * (height - margin * 2) /3);
	ctx.lineTo(margin + 2 * (width - margin * 2) / 3, height - margin);
	ctx.lineTo(margin + (width - margin * 2) / 3, height - margin);
	ctx.lineTo(margin, margin + 2 * (height - margin * 2) /3);
	ctx.lineTo(margin, margin + (height - margin * 2) /3);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.moveTo(margin * 1.5, height / 2);
	ctx.lineTo(width - margin * 1.5, height / 2);
	ctx.stroke();
};

$e.instructions.icons.stopSound = (ctx, height, width, margin, param) => {
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(width / 2, height - margin);
	ctx.lineTo(width / 2, margin);
	ctx.lineTo(margin, height / 2 - margin);
	ctx.lineTo(margin, height / 2 + margin);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	ctx.beginPath();
	ctx.strokeStyle = "#BBBBBB";
	ctx.lineWidth = 2;
	ctx.moveTo(width / 2 + (width / 2 - margin) / 4, height / 2 + margin);
	ctx.lineTo(width - margin, height - margin);
	ctx.stroke();
	ctx.moveTo(width / 2 + (width / 2 - margin) / 4, height / 2);
	ctx.lineTo(width - margin, height / 2);
	ctx.stroke();
	ctx.moveTo(width / 2 + (width / 2 - margin) / 4, height / 2 - margin);
	ctx.lineTo(width - margin, margin);
	ctx.stroke();
	ctx.strokeStyle = "#AA0000";
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(margin, margin);
	ctx.lineTo(width - margin, height - margin);
	ctx.stroke();
	ctx.beginPath();
	ctx.lineTo(width - margin, margin);
	ctx.lineTo(margin, height - margin);
	ctx.stroke();
};

$e.instructions.icons.transparency = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	if (!$e.isNumber(param, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
		param = 0.5;
	}
	ctx.fillStyle = "#FF00FF";
	ctx.beginPath();
	ctx.moveTo(margin * 1.2, margin * 1.2);
	ctx.lineTo(width - margin * 1.2, margin * 1.2);
	ctx.lineTo(width - margin * 1.2, height - margin * 1.2);
	ctx.lineTo(margin * 1.2, height - margin * 1.2);
	ctx.closePath();
	ctx.fill();
	ctx.fillStyle = "rgba(0, 256, 256, " + param + ")";
	ctx.beginPath();
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.arc(width / 2, height / 2, Math.max(height / 2 - margin, 0), startAngle, endAngle, false);
	ctx.closePath();
	ctx.fill();
};

$e.instructions.icons.turnLeft = (ctx, height, width, margin, param) => {
	margin = height / 4.25;
	if (param) {
		param = parseInt(param[0]);
	} else {
		param = 275;
	}
	if (!$e.isNumber(param, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	} else if (param < 0) {
		$e.instructions.icons.turnRight(ctx, height, width, margin, [ -param ]);
		return;
	}
	const maxparam = 360;
	if (!$e.isNumber(param, true) || param > maxparam * 0.85) {
		param = maxparam * 0.85;
	}
	const startAngle = -1 * param * Math.PI / 180;
	const endAngle = Math.PI / 180;
	const outerRadius = height / 2 - margin;
	const innerRadius = (height / 2 - margin) * (param / maxparam);
	const lineWidth = outerRadius - innerRadius;
	ctx.fillStyle = "#0000FF";
	ctx.beginPath();
	ctx.arc(width / 2, height / 2 + margin / 2, Math.max(outerRadius, 0), startAngle, endAngle, false);
	ctx.arc(width / 2, height / 2 + margin / 2, Math.max(innerRadius, 0), endAngle, startAngle, true);
	ctx.moveTo(width / 2 + outerRadius, height / 2 + margin / 2);
	ctx.lineTo(width / 2 + outerRadius, height - margin);
	ctx.lineTo(width / 2 + innerRadius, height - margin);
	ctx.lineTo(width / 2 + innerRadius, height / 2 + margin / 2);
	ctx.fill();
	ctx.closePath();
	ctx.fillStyle = "#0000FF";
	let COx, COy; // vector from center to origin
	COx = 0;
	COy = (margin + lineWidth / 2) - height / 2;
	const rotateAngle = -param * Math.PI / 180;
	const x = width / 2 - Math.cos(rotateAngle) * COy + Math.sin(rotateAngle) * COx;
	const y = height / 2 + margin / 2 - Math.sin(rotateAngle) * COy - Math.cos(rotateAngle) * COx;
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(-1 * Math.PI / 180 + rotateAngle);
	ctx.beginPath();
	ctx.moveTo(0 - lineWidth, 0);
	ctx.lineTo(0 + lineWidth, 0);
	ctx.lineTo(0, 0 - lineWidth);
	ctx.fill();
	ctx.restore();
};

$e.instructions.icons.turnReset = (ctx, height, width, margin, param) => {
	margin = 16;
	if (param) {
		param = parseInt(param[0]);
	} else {
		param = 0;
	}
	param = $e.backend.whiteboard.axis.user2systemAngle(param);
	ctx.translate(width / 2, height / 2);
	ctx.rotate(param * Math.PI / 180);
	ctx.translate(-width / 2, -height / 2);
	ctx.fillStyle = "#0000FF";
	ctx.beginPath();
	ctx.moveTo(width / 2, margin);
	ctx.lineTo(width - margin, height / 2);
	ctx.lineTo(width / 2, height - margin);
	ctx.fill();
};

$e.instructions.icons.turnRight = (ctx, height, width, margin, param) => {
	margin = height / 4.25;
	if (param) {
		param = parseInt(param[0]);
	} else {
		param = 90;
	}
	if (!$e.isNumber(param, true)) {
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	} else if (param < 0) {
		$e.instructions.icons.turnLeft(ctx, height, width, margin, [ -param ]);
		return;
	}
	const maxparam = 360;
	if ($e.isNumber(param, true) && param < 0) {
		param = 360 - param;
	}
	if (!$e.isNumber(param, true) || param > maxparam * 0.85) {
		param = maxparam * 0.85;
	}
	const startAngle = 180 * Math.PI/180;
	const endAngle = (180 + param) * Math.PI / 180;
	const outerRadius = height / 2 - margin;
	const innerRadius = (height / 2 - margin) * (param / maxparam);
	const lineWidth = outerRadius - innerRadius;
	ctx.fillStyle = "#0000FF";
	ctx.beginPath();
	ctx.arc(width / 2, height / 2 + margin / 2, Math.max(outerRadius, 0), startAngle, endAngle, false);
	ctx.arc(width / 2, height / 2 + margin / 2, Math.max(innerRadius, 0), endAngle, startAngle, true);
	ctx.moveTo(width / 2 - outerRadius, height / 2 + margin / 2);
	ctx.lineTo(width / 2 - outerRadius, height - margin);
	ctx.lineTo(width / 2 - innerRadius, height - margin);
	ctx.lineTo(width / 2 - innerRadius, height / 2 + margin / 2);
	ctx.fill();
	ctx.closePath();
	ctx.fillStyle = "#0000FF";
	let COx, COy; // vector from center to origin
	COx = 0;
	COy = (margin + lineWidth / 2) - height / 2;
	const rotateAngle = (-90 + param) * Math.PI / 180;
	const x = width / 2 + Math.cos(rotateAngle) * COx - Math.sin(rotateAngle) * COy;
	const y = height / 2 + margin / 2 + Math.sin(rotateAngle) * COx + Math.cos(rotateAngle) * COy;
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(90 * Math.PI / 180 + rotateAngle);
	ctx.beginPath();
	ctx.moveTo(0 - lineWidth, 0);
	ctx.lineTo(0 + lineWidth, 0);
	ctx.lineTo(0, 0 - lineWidth);
	ctx.fill();
	ctx.restore();
};

$e.instructions.icons.use = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	ctx.strokeStyle = "#FFFFFF";
	ctx.rect(margin, margin, width - margin * 2, height - margin * 2);
	ctx.stroke();
	if (!$e.isNumber(param, true)) {
		let fontSize;
		let text;
		if (param == undefined || param == "") {
			fontSize = 20;
			text = _("New");
		} else if (param.startsWith("\"") && param.endsWith("\"")) {
			param = param.substring(1, param.length - 1);
			fontSize = 16;
			text = param;
		} else {
			fontSize = 12;
			text = _("variable");
		}
		ctx.font = fontSize + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(text, margin, height - margin);
	} else {
		ctx.font = "bold " + (height - margin * 2) + "px Verdana";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText(param, margin, height - margin);
	}
};

$e.instructions.icons.unsetBold = (ctx, height, width, margin, param) => {
	ctx.font = (height - margin * 2) + "px Verdana";
	ctx.fillStyle = "#AAAAAA";
	ctx.fillText("B", margin, height - margin);
};

$e.instructions.icons.unsetColor = (ctx, height, width, margin, param) => {
	const startAngle = 0;
	const endAngle = 2 * Math.PI;
	ctx.strokeStyle = "#000000";
	ctx.moveTo(width / 2, height / 2);
	ctx.beginPath();
	ctx.arc(width / 2, height / 2, Math.max(height / 3, 0), startAngle, endAngle, false);
	ctx.stroke();
	ctx.closePath();
	ctx.strokeStyle = "#AA0000";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(margin, margin);
	ctx.lineTo(width - margin, height - margin);
	ctx.stroke();
	ctx.beginPath();
	ctx.lineTo(width - margin, margin);
	ctx.lineTo(margin, height - margin);
	ctx.stroke();
};

$e.instructions.icons.unsetFont = (ctx, height, width, margin, param) => {
	ctx.font = (height - margin * 2) + "px " + "sans-serif";
	ctx.fillStyle = "#AAAAAA";
	ctx.fillText("F", margin, height - margin);
};

$e.instructions.icons.unsetItalic = (ctx, height, width, margin, param) => {
	ctx.font = (height - margin * 2) + "px Verdana";
	ctx.fillStyle = "#AAAAAA";
	ctx.fillText("I", margin, height - margin);
};

$e.instructions.icons.unsetResize = (ctx, height, width, margin, param) => {
	const squareWidth = (width - margin * 2) * 0.7;
	const squareHeight = (height - margin * 2) * 0.7;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width / 2 - squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.lineTo(width / 2 + squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.lineTo(width / 2 + squareWidth / 2, height / 2 + squareHeight / 2);
	ctx.lineTo(width / 2 - squareWidth / 2, height / 2 + squareHeight / 2);
	ctx.lineTo(width / 2 - squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.stroke();
	ctx.strokeStyle = "#AA0000";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(width / 2 - squareWidth / 2 * 1.2, height / 2 - squareHeight / 2 * 1.2);
	ctx.lineTo(width / 2 + squareWidth / 2 * 1.2, height / 2 + squareHeight / 2 * 1.2);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(width / 2 - squareWidth / 2 * 1.2, height / 2 + squareHeight / 2 * 1.2);
	ctx.lineTo(width / 2 + squareWidth / 2 * 1.2, height / 2 - squareHeight / 2 * 1.2);
	ctx.stroke();
};

$e.instructions.icons.unsetSize = (ctx, height, width, margin, param) => {
	const squareWidth = (width - margin * 2) * 0.7;
	const squareHeight = (height - margin * 2) * 0.7;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width / 2 - squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.lineTo(width / 2 + squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.lineTo(width / 2 + squareWidth / 2, height / 2 + squareHeight / 2);
	ctx.lineTo(width / 2 - squareWidth / 2, height / 2 + squareHeight / 2);
	ctx.lineTo(width / 2 - squareWidth / 2, height / 2 - squareHeight / 2);
	ctx.stroke();
	ctx.strokeStyle = "#AA0000";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.moveTo(width / 2 - squareWidth / 2 * 1.2, height / 2 - squareHeight / 2 * 1.2);
	ctx.lineTo(width / 2 + squareWidth / 2 * 1.2, height / 2 + squareHeight / 2 * 1.2);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(width / 2 - squareWidth / 2 * 1.2, height / 2 + squareHeight / 2 * 1.2);
	ctx.lineTo(width / 2 + squareWidth / 2 * 1.2, height / 2 - squareHeight / 2 * 1.2);
	ctx.stroke();
};

$e.instructions.icons.var =  (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	if (!param) return;
	const maxparam = 10;
	let fontSize = (width - margin) / param.length;
	if (fontSize < maxparam) fontSize = maxparam;
	ctx.font = fontSize + "px Verdana";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText(param, margin, height / 2);
};

$e.instructions.icons["="] = (ctx, height, width, margin, param) => {
	if (!param) return;
	const maxparam = 10;
	let fontSize = (width - margin) / param.length;
	if (fontSize < maxparam) fontSize = maxparam;
	ctx.font = fontSize + "px Verdana";
	ctx.fillStyle = "#000000";
	ctx.fillText(param[0], margin, height / 2);
	ctx.font = fontSize / 1.5 + "px Verdana";
	ctx.fillText(param[1], margin, height / 2 + fontSize);
};

$e.instructions.icons.wait = (ctx, height, width, margin, param) => {
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.arc(width / 2, height / 2, Math.max(width / 2 - margin, 0), 0, 360, false);
	ctx.closePath();
	ctx.stroke();
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(width / 2, height / 2);
	ctx.lineTo(4 * margin / 3, height / 2);
	ctx.closePath();
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(width / 2, height / 2);
	ctx.lineTo(width / 2, 3 * margin / 2);
	ctx.closePath();
	ctx.stroke();
};

$e.instructions.icons.while = $e.instructions.icons["while-container"] = (ctx, height, width, margin, param) => {
	ctx.lineWidth = '3';
	ctx.strokeStyle = "#000000";	
	ctx.moveTo(width / 2 + margin / 2, margin * 1.5);
	ctx.lineTo(width - margin, margin * 1.5);
	ctx.lineTo(width - margin, height - margin);
	ctx.lineTo(margin, height - margin);
	ctx.lineTo(margin, margin * 1.5);
	ctx.lineTo(width / 2, margin * 1.5);
	ctx.stroke();
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width / 2 - 3, margin);
	ctx.lineTo(width / 2 + margin / 2 - 3, margin * 1.5);
	ctx.lineTo(width / 2 - 3, margin * 2);
	ctx.fill();
};

$e.instructions.icons.endDo = $e.instructions.icons["do-container"] = (ctx, height, width, margin, param) => {
	ctx.lineWidth = '3';
	ctx.strokeStyle = "#000000";	
	ctx.moveTo(width / 2 + margin / 2, height - margin * 1.5);
	ctx.lineTo(width - margin, height - margin * 1.5);
	ctx.lineTo(width - margin, margin);
	ctx.lineTo(margin, margin);
	ctx.lineTo(margin, height - margin * 1.5);
	ctx.lineTo(width / 2, height - margin * 1.5);
	ctx.stroke();
	ctx.fillStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(width / 2 - 3, height - margin);
	ctx.lineTo(width / 2 + margin / 2 - 3, height - margin * 1.5);
	ctx.lineTo(width / 2 - 3, height - margin * 2);
	ctx.fill();
};

$e.instructions.icons.write = (ctx, height, width, margin, param) => {
	if (param) param = param[0];
	margin = height / 4.5;
	const maxparam = 10;
	const minFontSize = 15;
	const maxFontSize = 15;
	let fontSize = (width - margin) * 2 / param.length;
	if (fontSize < minFontSize) fontSize = minFontSize;
	if (fontSize > maxFontSize) fontSize = maxFontSize;
	if (typeof param === "string" && param.startsWith("\"") && param.endsWith("\"")) {
		param = param.substring(1, param.length - 1);
	}
	const angle = 45;
	ctx.font = fontSize + "px Verdana";
	ctx.fillStyle = "#000000";
	ctx.translate(-width / 2, height / 2);
	ctx.rotate(-angle * Math.PI / 180);
	ctx.fillText(param, margin, height - margin);
	ctx.rotate(angle * Math.PI / 180);
	ctx.translate(width / 2, -height / 2);
};

$e.instructions.icons.writeAt = (ctx, height, width, margin, param) => {
	let literals = true;
	let param1, param2, param3, param4;
	if (param && param.length) {
		param1 = param[0];
		param2 = parseInt(param[1]);
		param3 = parseInt(param[2]);
		if (param[3] == undefined || param[3] == "" || param[3] == "undefined") {
			param4 = 0;
		} else if (!$e.isNumber(param[3], true)) {
			param4 = param[3];
			literals = false;
		} else {
			param4 = parseInt(param[3]);
		}
		if (!$e.isNumber(param2, true) || !$e.isNumber(param3, true)) {
			literals = false;
		}
		if (param1.startsWith("\"") && param1.endsWith("\"")) {
			param1 = param1.substring(1, param1.length - 1);
		}
	}
	margin = height / 4.5;
	let pos = {};
	let angle;
	if (literals) {
		const canvasWidth = $e.backend.whiteboard.width;
		const canvasHeight = $e.backend.whiteboard.width;
		pos = $e.backend.whiteboard.axis.user2systemCoords({ x: parseInt(param2), y: parseInt(param3) });
		pos.x = margin + (width - margin * 2) * pos.x / canvasWidth;
		pos.y = margin + (height - margin * 2) * pos.y / canvasHeight;
		angle = $e.backend.whiteboard.axis.user2systemAngle(param4);
	} else {
		pos = { x: width / 2, y: height - margin };
		angle = 45;
		ctx.font = 12 + "px Verdana";
		ctx.fillStyle = "#000000";
		ctx.fillText(_("variable"), margin, height);
	}
	const minFontSize = 15;
	const maxFontSize = 15;
	let fontSize = (width - margin) * 2 / param1.length;
	if (fontSize < minFontSize) fontSize = minFontSize;
	if (fontSize > maxFontSize) fontSize = maxFontSize;
	ctx.font = fontSize + "px Verdana";
	ctx.fillStyle = "#FFFFFF";
	ctx.translate(pos.x, pos.y);
	ctx.rotate(angle * Math.PI / 180);
	ctx.fillText(param1, 0, 0);
	ctx.rotate((-angle) * Math.PI / 180);
	ctx.translate(-pos.x, -pos.y);
};
