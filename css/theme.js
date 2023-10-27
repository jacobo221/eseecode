$_eseecode.ui.theme = {
	id: "default",
	name: "Default",
	version: "1.0",
	compatible: "2.4",
	author: "Jacobo Vilella Vilahur",
	copyright: "GPLv3",
	email: "jvilella@eseecode.com",
	website: "https://www.eseecode.com",
	
	files: ["theme.css", "common.css", "blocks.css"],
	
	functions: {
		drawGuide: function(canvas, targetCanvas) {
			var canvasSize = $_eseecode.whiteboard.offsetWidth;
			var size = 20;
			var org = targetCanvas.guide;
			var angle = targetCanvas.guide.angle;
			if (canvas === undefined) {
				if (!$_eseecode.ui.guideVisible) {
					return;
				}
				canvas = $_eseecode.canvasArray["guide"].canvas;
			}
			var ctx = canvas.getContext("2d");
			canvas.width = canvasSize;
			// clear guide
			ctx.clearRect(0,0,canvasSize,canvasSize);
			if ($_eseecode.execution.guideImage) {
				var src = $_eseecode.execution.guideImage;
				if (!src.startsWith("http://") && !src.startsWith("https://")) src = $_eseecode.execution.basepath + src;
				var img = new Image();
				img.onload = function() {
					ctx.save();
					ctx.translate(org.x, org.y);
					ctx.rotate(targetCanvas.guide.angle*Math.PI/180);
					ctx.drawImage(img, -size, -size, size*2, size*2);
					ctx.restore();
				}
				img.src = src;
				return;
			}
			var frontx = org.x+size*Math.cos(angle*Math.PI/180);
			var fronty = org.y+size*Math.sin(angle*Math.PI/180);
			var leftx = org.x+size/2*Math.cos(angle*Math.PI/180+Math.PI/3);
			var lefty = org.y+size/2*Math.sin(angle*Math.PI/180+Math.PI/3);
			var rightx = org.x+size/2*Math.cos(angle*Math.PI/180-Math.PI/3);
			var righty = org.y+size/2*Math.sin(angle*Math.PI/180-Math.PI/3);
			// draw guide
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#888888";
			var gradient = ctx.createRadialGradient(frontx,fronty,size/1.2,frontx,fronty,size/10);
			gradient.addColorStop(0,'rgb(100,100,100)');
			gradient.addColorStop(1,'rgb(215,215,0)');
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.moveTo(rightx, righty);
			ctx.lineTo(leftx, lefty);
			ctx.lineTo(frontx, fronty);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			gradient = ctx.createRadialGradient(org.x,org.y,size,org.x,org.y,size/10);
			gradient.addColorStop(0,'rgb(0,0,0)');
			gradient.addColorStop(1,'rgb(103,137,171)');
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(org.x, org.y, size/2, 2*Math.PI, 0, false);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		},
		drawFullscreenButton: function(fullscreenButton) {
			var iconMargin = 2;
			if (!$e_isFullscreen()) {
				iconMargin = 4;
			} else {
				iconMargin = 2;
			}
			// Console resize tab
			var canvas = fullscreenButton.firstChild;
			var ctx = canvas.getContext("2d");
			var width = canvas.width;
			var height = canvas.height;
			canvas.width = width;
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(iconMargin,iconMargin);
			ctx.lineTo(width-iconMargin,iconMargin);
			ctx.lineTo(width-iconMargin,height-iconMargin);
			ctx.lineTo(iconMargin,height-iconMargin);
			ctx.closePath();
			ctx.stroke();
		},
		blockTextColor: function(color) {
			return $e_readableText(color);
		},
		UIElements: {
			"eseecode": function() {
				// Main background
				/*
				var canvas, ctx, div, width, height, src;
				div = document.getElementById("eseecode");
				// Gradient background
				canvas = document.createElement("canvas");
				ctx = canvas.getContext("2d");
				width = div.clientWidth;
				height = div.clientHeight;
				canvas.width = width;
				canvas.height = height;
				var border = document.getElementById("header").clientHeight/2;
				var gradient = ctx.createLinearGradient(0,border,0,0);
				gradient.addColorStop(0,"#123456");
				gradient.addColorStop(1, "rgba(0,0,0,0)");
				ctx.fillStyle = gradient;
				ctx.fillRect(0,0,width,border);
				gradient = ctx.createLinearGradient(0,height-border,0,height);
				gradient.addColorStop(0,"#123456");
				gradient.addColorStop(1,"rgba(0,0,0,0)");
				ctx.fillStyle = gradient;
				ctx.fillRect(0,height-border,width,height);
				ctx.fillStyle = "#123456";
				ctx.fillRect(0,border,width,height-border*2);
				src = canvas.toDataURL();
				div.style.backgroundImage = "url("+src+")";
				div.style.backgroundColor = "rgba(0,0,0,0)";
				*/
			},
			"console-blocks": function() {
				// Console background
				var canvas, ctx, div, width, height, src;
				canvas = document.createElement("canvas");
				ctx = canvas.getContext("2d");
				div = document.getElementById("console-blocks");
				width = div.parentNode.offsetWidth; // Use parent in case it had display:none at this moment
				height = div.parentNode.offsetHeight;
				canvas.width = width;
				canvas.height = height;
				var rBackground ="D5";
				var gBackground = "DF";
				var bBackground = "DA";
				ctx.fillStyle = "#"+rBackground+gBackground+bBackground;
				ctx.fillRect(0,0,width,height);
				var colorDifferMax = 30;
				var widthMax = 30;
				rBackground = parseInt(rBackground,16);
				gBackground = parseInt(gBackground,16);
				bBackground = parseInt(bBackground,16);
				for (var i=0; i<75; i++) {
					var randomValue = Math.floor(Math.random()*colorDifferMax-colorDifferMax/2);
					var r = (randomValue+rBackground).toString(16).slice(-2);
					var g = (randomValue+gBackground).toString(16).slice(-2);
					var b = (randomValue+bBackground).toString(16).slice(-2);
					ctx.fillStyle = "#"+r+g+b;
					var x = Math.floor(Math.random()*width);
					var y = Math.floor(Math.random()*height);
					var size = Math.floor(Math.random()*widthMax);
					ctx.beginPath()
					ctx.arc(x, y, size, 0, 2*Math.PI, false);
					ctx.fill();
					ctx.closePath();
				}
				src = canvas.toDataURL();
				div.style.backgroundImage = "url("+src+")";
				div.style.backgroundRepeat = "repeat";
			},
			"console-buttons": function() {
				// Console buttons background
				var canvas, ctx, div, width, height, src;
				canvas = document.createElement("canvas");
				ctx = canvas.getContext("2d");
				div = document.getElementById("console-buttons");
				width = div.clientWidth;
				height = div.clientHeight+3;
				canvas.width = width;
				canvas.height = height;
				var rBackground ="D5";
				var gBackground = "DF";
				var bBackground = "DA";
				ctx.fillStyle = "#"+rBackground+gBackground+bBackground;
				ctx.fillRect(0,0,width,height);
				var gradient = ctx.createLinearGradient(0,0,0,height);	
				gradient.addColorStop(0.0,'rgba(0,0,0,0)');
				gradient.addColorStop(1,'rgba(0,0,0,0.5)');
				ctx.fillStyle = gradient;
				ctx.fillRect(0,-height*2,width,height*3);
				src = canvas.toDataURL();
				div.style.backgroundImage = "url("+src+")";
				div.style.backgroundRepeat = "repeat";
			},
			"dialog-debug-command": function() {
				// Debug command background
				var canvas, ctx, div, width, height, src;
				canvas = document.createElement("canvas");
				ctx = canvas.getContext("2d");
				div = document.getElementById("dialog-debug-command");
				width = div.clientWidth;
				height = div.clientHeight+3;
				canvas.width = width;
				canvas.height = height;
				var rBackground ="D5";
				var gBackground = "DF";
				var bBackground = "DA";
				ctx.fillStyle = "#"+rBackground+gBackground+bBackground;
				ctx.fillRect(0,0,width,height);
				var gradient = ctx.createLinearGradient(0,0,0,height);	
				gradient.addColorStop(0.0,'rgba(0,0,0,0)');
				gradient.addColorStop(1,'rgba(0,0,0,0.5)');
				ctx.fillStyle = gradient;
				ctx.fillRect(0,-height*2,width,height*3);
				src = canvas.toDataURL();
				div.style.backgroundImage = "url("+src+")";
				div.style.backgroundRepeat = "repeat";
			},
			"dialog-blocks": function() {
				// Dialog background
				var canvas, ctx, div, width, height, src;
				canvas = document.createElement("canvas");
				ctx = canvas.getContext("2d");
				div = document.getElementById("dialog-blocks");
				width = div.parentNode.clientWidth; // Use parent in case it had display:none at this moment
				height = div.parentNode.clientHeight;
				canvas.width = width;
				canvas.height = height;
				var rBackground = "FF";
				var gBackground = "FA";
				var bBackground = "CD";
				ctx.fillStyle = "#"+rBackground+gBackground+bBackground;
				ctx.fillRect(0,0,width,height);
				var widthMax = 20;
				for (var i=0; i<10; i++) {
					ctx.strokeStyle = "#EAEAEA";
					var x = Math.floor(Math.random()*width);
					var y = Math.floor(Math.random()*height);
					var sideStart = Math.floor(Math.random()*2);
					var sideEnd = Math.floor(Math.random()*2);
					var size = Math.floor(Math.random()*widthMax);
					ctx.lineWidth = size;
					ctx.beginPath();
					if (sideStart == 0) {
						ctx.moveTo(0,x);
					} else {
						ctx.moveTo(x,0);
					}
					if (sideEnd == 0) {
						ctx.lineTo(width,y);
					} else {
						ctx.lineTo(y,height);
					}
					ctx.stroke();
				}
				src = canvas.toDataURL();
				div.style.backgroundImage = "url("+src+")";
				div.style.backgroundRepeat = "repeat";
			},
			"button-undo": function() {
				// Undo button
				var canvas, ctx, div, width, height, src;
				canvas = document.getElementById("button-undo").firstChild;
				ctx = canvas.getContext("2d");
				width = canvas.width;
				height = canvas.height;
				var margin = 2;
				var marginX = (width-margin*2)/3;
				ctx.strokeStyle = "#997700";
				ctx.beginPath();
				ctx.lineWidth = 10;
				ctx.arc(width-marginX*2, height-margin, (height-margin*2)/2, 0, -90*Math.PI/180, true);
				ctx.lineTo(marginX,height/2);
				ctx.stroke();
				ctx.closePath();
				ctx.fillStyle = "#997700";
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.lineTo(margin,height/2);
				ctx.lineTo(marginX,margin);
				ctx.lineTo(marginX,height-margin);
				ctx.fill();
				ctx.closePath();
			},
			"button-execute": function() {
				// Execute console button
				var canvas, ctx, div, width, height, src;
				var margin = 2;
				canvas = document.getElementById("button-execute").firstChild;
				ctx = canvas.getContext("2d");
				width = canvas.width;
				height = canvas.height;
				ctx.fillStyle = "#00FF00";
				ctx.strokeStyle = "#006600";
				ctx.beginPath();
				ctx.moveTo(margin,margin);
				ctx.lineTo(width-margin,height/2);
				ctx.lineTo(margin,height-margin);
				ctx.lineTo(margin,margin);
				ctx.fill();
				ctx.stroke();
				ctx.closePath();
				var gradient = ctx.createLinearGradient(0,(height-margin)/2,0,-margin);	
				gradient.addColorStop(0.0,'rgba(0,0,0,0)');
				gradient.addColorStop(1.0,'rgba(0,0,0,1)');
				ctx.fillStyle = gradient;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(margin,margin);
				ctx.lineTo(width-margin,height/2);
				ctx.lineTo(margin,height/2);
				ctx.lineTo(margin,margin);
				ctx.fill();
				ctx.closePath();
				gradient = ctx.createLinearGradient(0,(height-margin)/2,0,height+margin);	
				gradient.addColorStop(0.0,'rgba(0,0,0,0)');
				gradient.addColorStop(1.0,'rgba(0,0,0,1)');
				ctx.fillStyle = gradient;
				ctx.beginPath();
				ctx.moveTo(margin,height/2);
				ctx.lineTo(width-margin,height/2);
				ctx.lineTo(margin,height-margin);
				ctx.lineTo(margin,height/2);
				ctx.fill();
				ctx.closePath();
			},
			"button-pause": function() {
				// Pause execution button
				var canvas, ctx, div, width, height, src;
				canvas = document.getElementById("button-pause").firstChild;
				ctx = canvas.getContext("2d");
				width = canvas.width;
				var lineWidth = width / 8;
				width = canvas.width;
				height = canvas.height;
				var margin = width/8;
				ctx.strokeStyle = "#FFFF00";
				ctx.lineWidth = lineWidth;
				ctx.moveTo(width/2-margin,margin);
				ctx.lineTo(width/2-margin,height-margin);
				ctx.moveTo(width/2+margin,margin);
				ctx.lineTo(width/2+margin,height-margin);
				ctx.stroke();
			},
			"button-clear": function() {
				// Clear console button
				var canvas, ctx, div, width, height, src;
				canvas = document.getElementById("button-clear").firstChild;
				ctx = canvas.getContext("2d");
				width = canvas.width;
				height = canvas.height;
				var lineWidth = width/8;
				var margin = width/8;
				ctx.fillStyle = "#FF0000";
				ctx.beginPath();
				ctx.arc(width/2, height/2+margin/8, height/2-margin/2, 0, 270*Math.PI/180, false);
				ctx.arc(width/2, height/2+margin/8, (height-margin)/2-lineWidth, 270*Math.PI/180, 0, true);
				ctx.fill();
				ctx.closePath();
				ctx.beginPath();
				ctx.moveTo(width/2,margin/4);
				ctx.lineTo(width/2+lineWidth*1.3,(margin+lineWidth)/1.7);
				ctx.lineTo(width/2,lineWidth+margin);
				ctx.fill();
				ctx.closePath();
			},
			"button-reset": function() {
				// Reset console button
				var canvas, ctx, div, width, height, src;
				canvas = document.getElementById("button-reset").firstChild;
				ctx = canvas.getContext("2d");
				width = canvas.width;
				var lineWidth = width / 8;
				width = canvas.width;
				height = canvas.height;
				var margin = width/8;
				ctx.strokeStyle = "#000088";
				ctx.lineWidth = lineWidth;
				ctx.moveTo(margin,margin);
				ctx.lineTo(width-margin,height-margin);
				ctx.moveTo(width-margin,margin);
				ctx.lineTo(margin,height-margin);
				ctx.stroke();
			},
			"button-redo": function() {
				// Redo button
				var canvas, ctx, div, width, height, src;
				canvas = document.getElementById("button-redo").firstChild;
				ctx = canvas.getContext("2d");
				width = canvas.width;
				height = canvas.height;
				var margin = 2;
				var marginX = (width-margin*2)/3;
				ctx.strokeStyle = "#997700";
				ctx.beginPath();
				ctx.lineWidth = 10;
				ctx.arc(marginX*2, height-margin, (height-margin*2)/2, 180*Math.PI/180, -90*Math.PI/180, false);
				ctx.lineTo(width-marginX,height/2);
				ctx.stroke();
				ctx.closePath();
				ctx.fillStyle = "#997700";
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.lineTo(width-margin,height/2);
				ctx.lineTo(width-marginX,margin);
				ctx.lineTo(width-marginX,height-margin);
				ctx.fill();
				ctx.closePath();
			},
			"dialog-debug-command-button": function() {
				// Debug run button
				var canvas, ctx, div, width, height, src;
				canvas = document.getElementById("dialog-debug-command-button").firstChild;
				ctx = canvas.getContext("2d");
				width = canvas.width;
				height = canvas.height;
				var margin = 2;
				ctx.fillStyle = "#000000";
				ctx.strokeStyle = "#FFFFFF";
				ctx.beginPath();
				ctx.moveTo(margin,margin);
				ctx.lineTo(width-margin,height/2);
				ctx.lineTo(margin,height-margin);
				ctx.lineTo(margin,margin);
				ctx.fill();
				ctx.stroke();
				ctx.closePath();
			},
			"whiteboard-tabs-download-button": function() {
				// Download whiteboard button
				var canvas, ctx, div, width, height, src;
				canvas = document.getElementById("whiteboard-tabs-download-button").firstChild;
				ctx = canvas.getContext("2d");
				width = canvas.width;
				height = canvas.height;
				var margin = 2;
				ctx.fillStyle = "#000000";
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(margin,1*height/3);
				ctx.lineTo(width-margin,1*height/3);
				ctx.lineTo(width-margin,height-margin);
				ctx.lineTo(margin,height-margin);
				ctx.fill();
				ctx.closePath();
				ctx.beginPath();
				ctx.moveTo(width/4,1*height/3);
				ctx.lineTo(3*width/4,1*height/3);
				ctx.lineTo(3*width/4-margin,margin);
				ctx.lineTo(1*width/4+margin,margin);
				ctx.fill();
				ctx.closePath();
				ctx.strokeStyle = "#FFFFFF";
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.arc(width/2, 2*height/3-margin, height/5, 0, 360*Math.PI/180, true);
				ctx.stroke();
				ctx.closePath();
				ctx.beginPath();
				ctx.moveTo(width-margin,1*height/3+margin);
				ctx.lineTo(width-2*margin,1*height/3+margin);
				ctx.stroke();
				ctx.closePath();
			}
		},
		blockBackground: function(color, bgCtx, bgWidth, bgHeight) {
			var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id;
			if (!!navigator.userAgent.match(/Trident.*rv[ :]*11\./)) {
				// There is a bug in IE11 where it fails to show transparent gradients on canvas. See https://connect.microsoft.com/IE/feedback/details/828441 . This hack works around the bug
				if (color.charAt(0) == "#") {
					var r = color.substr(1,2);
					var g = color.substr(3,2);
					var b = color.substr(5,2);
					if (level == "level1" || level == "level2") {
						var gradient = bgCtx.createRadialGradient(bgWidth/2,bgHeight/2,bgHeight,bgWidth/3,bgHeight/3,bgHeight/4);
						gradient.addColorStop(0,'rgb(150,150,150)');
						gradient.addColorStop(1,'rgb('+parseInt(r,16)+','+parseInt(g,16)+','+parseInt(b,16)+')');
						bgCtx.fillStyle = gradient;
						bgCtx.beginPath();
						bgCtx.fillRect(0,0,bgWidth,bgHeight);
						bgCtx.closePath();
						bgCtx.fill();
					} else if (level == "level3") {
						var gradient = bgCtx.createLinearGradient(0,0,0,bgHeight);
						gradient.addColorStop(0,'rgb(120,120,120)');
						gradient.addColorStop(0.5,'rgb('+parseInt(r,16)+','+parseInt(g,16)+','+parseInt(b,16)+')');
						gradient.addColorStop(1,'rgb(120,120,120)');
						bgCtx.fillStyle = gradient;
						bgCtx.fillRect(0,0,bgWidth,bgHeight);
					}
				} else {
						bgCtx.fillStyle = color;
						bgCtx.fillRect(0,0,bgWidth,bgHeight);
				}
			} else {
				if (level == "level1" || level == "level2") {
					var gradient = bgCtx.createRadialGradient(bgWidth/2,bgHeight/2,bgHeight*1.5,bgWidth/3,bgHeight/3,bgHeight/4);
					gradient.addColorStop(0.0,'rgba(0,0,0,1)');
					gradient.addColorStop(1.0,'rgba(0,0,0,0)');
					bgCtx.fillStyle = gradient;
					bgCtx.beginPath();
					bgCtx.arc(bgWidth/2,bgHeight/2,bgHeight,2*Math.PI,0,false);
					bgCtx.closePath();
					bgCtx.fill();
				} else if (level == "level3") {
					var gradient = bgCtx.createLinearGradient(0,0,0,bgHeight);	
					gradient.addColorStop(0.0,'rgba(0,0,0,0.25)');
					gradient.addColorStop(0.5,'rgba(0,0,0,0)');
					gradient.addColorStop(1.0,'rgba(0,0,0,0.25)');
					bgCtx.fillStyle = gradient;
					bgCtx.fillRect(0,-bgHeight*2,bgWidth,bgHeight*3);
				}
			}
		},
		roundBlockCorners: function(div) {
			if (div.id === "setupBlockIcon") {
				return;
			}
			var width = div.getBoundingClientRect().width;
			if (width) {
				var borderRadius = 10;
				var previous = div.previousElementSibling;
				var next = div.nextSibling;
				var isFunction;
				if (div.className.match(/\bfunction\b/)) {
					isFunction = true;
				} else {
					isFunction = false;
				}
				if (!previous || previous.tagName != "DIV" || isFunction ) {
					if (previous && isFunction) {
						previous.style.borderBottomRightRadius = borderRadius+"px";
						previous.style.borderBottomLeftRadius = borderRadius+"px";
					}
					div.style.borderTopRightRadius = borderRadius+"px";
					div.style.borderTopLeftRadius = borderRadius+"px";
				} else {
					var previousWidth = previous.getBoundingClientRect().width;
					if (previousWidth > width) {
						previous.style.borderBottomRightRadius = Math.min(previousWidth-width,borderRadius)+"px";
						div.style.borderTopRightRadius = "";
					} else if (width > previousWidth) {
						previous.style.borderBottomRightRadius = "";
						div.style.borderTopRightRadius = Math.min(width-previousWidth,borderRadius)+"px";
					} else {
						previous.style.borderBottomRightRadius = "";
						div.style.borderTopRightRadius = "";
					}
					previous.style.borderBottomLeftRadius = "";
					div.style.borderTopLeftRadius = "";
				}
				if (!next || next.className.match(/\bdummyBlock\b/) || isFunction) {
					div.style.borderBottomRightRadius = borderRadius+"px";
					div.style.borderBottomLeftRadius = borderRadius+"px";
					if (next && isFunction) {
						next.style.borderTopRightRadius = borderRadius+"px";
						next.style.borderTopLeftRadius = borderRadius+"px";
					}
				} else {
					var nextWidth = next.getBoundingClientRect().width;
					if (nextWidth > width) {
						div.style.borderBottomRightRadius = "";
						next.style.borderTopRightRadius = Math.min(nextWidth-width,borderRadius)+"px";;
					} else if (width > nextWidth) {
						div.style.borderBottomRightRadius = Math.min(width-nextWidth,borderRadius)+"px";
						next.style.borderTopRightRadius = "";
					} else {
						div.style.borderBottomRightRadius = "";
						next.style.borderTopRightRadius = "";
					}
					div.style.borderBottomLeftRadius = "";
					next.style.borderTopLeftRadius = "";
				}
			}
		}
	}
}
