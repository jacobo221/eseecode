$_eseecode.ui.theme = {
	name: "Sharp",
	version: "0.1",
	compatible: "2.4",
	author: "Jacobo Vilella Vilahur",
	copyright: "GPLv3",
	email: "jvilella@eseecode.com",
	website: "https://www.eseecode.com",

	functions: {
		drawGuide: function(canvas, targetCanvas) {
			var canvasSize = $_eseecode.whiteboard.offsetWidth;
			var size = 20;
			var org = targetCanvas.guide;
			var angle = targetCanvas.guide.angle;
			var frontx = org.x+size*Math.cos(angle*Math.PI/180);
			var fronty = org.y+size*Math.sin(angle*Math.PI/180);
			var leftx = org.x+size/2*Math.cos(angle*Math.PI/180+Math.PI/3);
			var lefty = org.y+size/2*Math.sin(angle*Math.PI/180+Math.PI/3);
			var rightx = org.x+size/2*Math.cos(angle*Math.PI/180-Math.PI/3);
			var righty = org.y+size/2*Math.sin(angle*Math.PI/180-Math.PI/3);
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
