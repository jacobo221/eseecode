$_eseecode.ui.theme = {
	id: "sharp",
	name: "Sharp",
	version: "0.1",
	compatible: "2.4",
	author: "Jacobo Vilella Vilahur",
	copyright: "GPLv3",
	email: "jvilella@eseecode.com",
	website: "https://www.eseecode.com",

	files: ["theme.css", "common.css", "blocks.css"],

	functions: {
		drawGuide: function(canvas, targetCanvas) {
			var canvasSize = $_eseecode.whiteboard.offsetWidth;
			var size = $_eseecode.execution.guide.size;
			if (size < 0) size = 0;
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
			function drawDefaultGuide(ctx, org, angle, size) {
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
				gradient.addColorStop(1,'rgb(215,215,170)');
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
				gradient.addColorStop(1,'rgb(153,177,201)');
				ctx.fillStyle = gradient;
				ctx.beginPath();
				ctx.arc(org.x, org.y, size/2, 2*Math.PI, 0, false);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
			}
			function drawCustomGuide(ctx, org, angle, size, targetCanvas, img) {
				ctx.save();
				ctx.translate(org.x, org.y);
				ctx.rotate(targetCanvas.guide.angle*Math.PI/180);
				ctx.drawImage(img, -size, -size, size*2, size*2);
				ctx.restore();
			}
			if ($_eseecode.execution.guide.imageUrl) {
				if ($_eseecode.execution.guide.cache.imageUrl != $_eseecode.execution.guide.imageUrl) {
					var src = $_eseecode.execution.guide.imageUrl;
					if (!src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("file://")) src = $_eseecode.execution.basepath + src;
					var img = new Image();
					img.onload = () => {
						drawCustomGuide(ctx, org, angle, size, targetCanvas, img);
						$_eseecode.execution.guide.cache = {
							imageUrl: $_eseecode.execution.guide.imageUrl,
							imageObj: img,
						};
					};
					img.onerror = () => drawDefaultGuide(ctx, org, angle, size);
					img.src = src;
				} else {
					drawCustomGuide(ctx, org, angle, size, targetCanvas, $_eseecode.execution.guide.cache.imageObj);
				}
			} else {
				drawDefaultGuide(ctx, org, angle, size);
			}
		},
		blockTextColor: function(color) {
			return "#101010";
		},
		UIElements: {
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
				var rBackground ="DD";
				var gBackground = "DD";
				var bBackground = "DD";
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
				/*
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
				*/
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
				/*
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
				*/
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
				ctx.strokeStyle = "#997755";
				ctx.beginPath();
				ctx.lineWidth = 10;
				ctx.arc(width-marginX*2, height-margin, (height-margin*2)/2, 0, -90*Math.PI/180, true);
				ctx.lineTo(marginX,height/2);
				ctx.stroke();
				ctx.closePath();
				ctx.fillStyle = "#997755";
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
				ctx.fillStyle = "#55FF55";
				ctx.strokeStyle = "#55FF55";
				ctx.beginPath();
				ctx.moveTo(margin,margin);
				ctx.lineTo(width-margin,height/2);
				ctx.lineTo(margin,height-margin);
				ctx.lineTo(margin,margin);
				ctx.fill();
				ctx.stroke();
				ctx.closePath();
				var gradient = ctx.createLinearGradient(0,(height-margin)/2,0,-margin);	
				gradient.addColorStop(0.5,'rgba(0,0,0,0)');
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
				gradient.addColorStop(0.5,'rgba(0,0,0,0)');
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
				ctx.fillStyle = "#FF5555";
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
				ctx.strokeStyle = "#555588";
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
				ctx.strokeStyle = "#997755";
				ctx.beginPath();
				ctx.lineWidth = 10;
				ctx.arc(marginX*2, height-margin, (height-margin*2)/2, 180*Math.PI/180, -90*Math.PI/180, false);
				ctx.lineTo(width-marginX,height/2);
				ctx.stroke();
				ctx.closePath();
				ctx.fillStyle = "#997755";
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.lineTo(width-margin,height/2);
				ctx.lineTo(width-marginX,margin);
				ctx.lineTo(width-marginX,height-margin);
				ctx.fill();
				ctx.closePath();
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
				var rBackground = "DD";
				var gBackground = "DD";
				var bBackground = "DD";
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
			"dialog-debug-command-button": function() {
				// Debug run button
				var canvas, ctx, div, width, height, src;
				canvas = document.getElementById("dialog-debug-command-button").firstChild;
				ctx = canvas.getContext("2d");
				width = canvas.width;
				height = canvas.height;
				var margin = 2;
				ctx.fillStyle = "#CCCCCC";
				ctx.strokeStyle = "#FFFFFF";
				ctx.beginPath();
				ctx.moveTo(margin,margin);
				ctx.lineTo(width-margin,height/2);
				ctx.lineTo(margin,height-margin);
				ctx.lineTo(margin,margin);
				ctx.fill();
				ctx.stroke();
				ctx.closePath();
			}
		},
		blockBackground: function(color, ctx, width, height) {
			var level = $_eseecode.modes.console[$_eseecode.modes.console[0]].id;
		    if (true || color.charAt(0) == "#") {
				var r = color.substr(1,2);
				var g = color.substr(3,2);
				var b = color.substr(5,2);
				if (level == "level1" || level == "level2") {
					var gradient = ctx.createRadialGradient(width/2,height/2,height,width/3,height/3,height/4);
					gradient.addColorStop(0,'rgb(170,170,170)');
					gradient.addColorStop(1,'rgb('+(parseInt(r,16)+50)+','+(parseInt(g,16)+50)+','+(parseInt(b,16)+50)+')');
					ctx.fillStyle = gradient;
					ctx.beginPath();
					ctx.fillRect(0,0,width,height);
					ctx.closePath();
					ctx.fill();
				} else if (level == "level3") {
					var gradient = ctx.createLinearGradient(0,0,0,height);
					gradient.addColorStop(0,'rgb(170,170,170)');
					gradient.addColorStop(0.5,'rgb('+(parseInt(r,16)+50)+','+(parseInt(g,16)+50)+','+(parseInt(b,16)+50)+')');
					gradient.addColorStop(1,'rgb(200,200,200)');
					ctx.fillStyle = gradient;
					ctx.fillRect(0,0,width,height);
				}
			} else {
					ctx.fillStyle = color;
					ctx.fillRect(0,0,width,height);
			}
	    },
	    roundBlockCorners: function(blockDiv) {
	    	return;
	    }
	}
}
