"use strict";

	/**
	 * Contains the icon definition for each instruction
	 * @type {Array<{String, function(!HTMLElement, Number, Number, Array<String>)}>}
	 * @example {"arc": function(ctx, width, height, param) { ... }}
	 */
	$_eseecode.instructions.icons = {
		"arc": function(ctx, width, height, param) {
			var margin = 15;
			var param1, param2;
			if (param) {
				param1 = param[0];
				param2 = param[1];
			} else {
				param1 = (height-margin*2)/3;
				param2 = 50;
			}
			if (param2 < 0) {
				param2 = 360 - param;
			}
			var maxparam1 = 100;
			if (param1 > (height-margin*2)/2) {
				param2 = (height-margin*2)/2;
			}
			var maxparam2 = 360;
			if (param2 > maxparam2) {
				param2 = maxparam2;
			}
			var radius = (height-margin*2)/2*(param1/maxparam1);
			ctx.strokeStyle = '#0000FF';
			ctx.lineWidth = 3;
			var startAngle = 0;
			var endAngle = param2*Math.PI/180;
			ctx.beginPath();
			ctx.arc(width/2,height/2,radius,startAngle,endAngle);
			ctx.stroke();
			ctx.closePath();
		},
		"array" : function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			var maxparam1 = 10;
			var maxparam2 = 10;
			var fontSize = (width-margin*2)/param.length;
			if (fontSize < maxparam1) {
				fontSize = maxparam1;
			}
			ctx.font = fontSize+"px Verdana";
      			ctx.fillStyle = '#FFFFFF';
			ctx.fillText(param,margin,height-margin);
			fontSize = height-margin*2;
			if (fontSize < maxparam2) {
				fontSize = maxparam2;
			}
			ctx.font = fontSize+"px Verdana";
			ctx.fillText("[ ]",margin,height-margin);
		},
		"beginShape": function(ctx, width, height, param) {
			var margin = 15;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = '#00FFFF';
			ctx.beginPath();
			ctx.rect(margin, margin, width-margin*2, height-margin*2);
			ctx.fill();
			ctx.closePath();
			ctx.lineWidth = 4;
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(width-margin, margin);
			ctx.lineTo(margin, margin);
			ctx.lineTo(margin, height/2);
			ctx.stroke();
			ctx.closePath();
			ctx.fillStyle = '#000000';
			ctx.beginPath();
			ctx.arc(margin,height/2,2,startAngle,endAngle);
			ctx.arc(margin,margin+3*(height-margin*2)/4,2,startAngle,endAngle);
			ctx.arc(margin,height-margin,2,startAngle,endAngle);
			ctx.fill();
		},
		"clean": function(ctx, width, height, param) {
			var margin = 15;
			var lineWidth = width / 8;
			ctx.strokeStyle = "#000088";
			ctx.moveTo(margin,margin);
			ctx.lineTo(width-margin,height-margin);
			ctx.moveTo(width-margin,margin);
			ctx.lineTo(margin,height-margin);
			ctx.stroke();
		},
		"comment": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			var fontSize = 10;
			ctx.font = fontSize+"px Verdana";
      			ctx.fillStyle = '#000000';
			ctx.fillText(param,margin,height-margin);
		},
		"commentmultilinesingle": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			var fontSize = 10;
			ctx.font = fontSize+"px Verdana";
      			ctx.fillStyle = '#000000';
			ctx.fillText(param,margin,height-margin);
		},
		"endShape": function(ctx, width, height, param) {
			var margin = 15;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = '#00FFFF';
			ctx.beginPath();
			ctx.rect(margin, margin, width-margin*2, height-margin*2);
			ctx.fill();
			ctx.closePath();
			ctx.lineWidth = 4;
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(width-margin, margin);
			ctx.lineTo(margin, margin);
			ctx.lineTo(margin, height-margin);
			ctx.lineTo(width-margin, height-margin);
			ctx.lineTo(width-margin, margin+3*(height-margin*2)/4);
			ctx.stroke();
			ctx.closePath();
			ctx.fillStyle = '#000000';
			ctx.beginPath();
			ctx.arc(width-margin,height/2,2,startAngle,endAngle);
			ctx.arc(width-margin,margin+(height-margin*2)/4,2,startAngle,endAngle);
			ctx.arc(width-margin,margin,2,startAngle,endAngle);
			ctx.fill();
		},
		"flipHorizontally": function(ctx, width, height, param) {
			var margin = 15;
      			ctx.lineWidth = 3;
      			ctx.strokeStyle = '#888888';
			ctx.moveTo(margin, margin);
			ctx.lineTo(width/2-margin/2, margin+(height-margin*2)/3);
			ctx.lineTo(width/2-margin/2, margin+2*(height-margin*2)/3);
			ctx.lineTo(margin, height-margin);
			ctx.lineTo(margin, margin);
			ctx.stroke();
			ctx.beginPath();
      			ctx.fillStyle = '#888888';
			ctx.moveTo(width-margin, margin);
			ctx.lineTo(width/2+margin/2, margin+(height-margin*2)/3);
			ctx.lineTo(width/2+margin/2, margin+2*(height-margin*2)/3);
			ctx.lineTo(width-margin, height-margin);
			ctx.lineTo(width-margin, margin);
			ctx.fill();
		},
		"flipVertically": function(ctx, width, height, param) {
			var margin = 15;
      			ctx.lineWidth = 3;
      			ctx.strokeStyle = '#888888';
			ctx.moveTo(margin, margin);
			ctx.lineTo(margin+(width-margin*2)/3, height/2-margin/2);
			ctx.lineTo(margin+2*(width-margin*2)/3, height/2-margin/2);
			ctx.lineTo(width-margin, margin);
			ctx.lineTo(margin, margin);
			ctx.stroke();
			ctx.beginPath();
      			ctx.fillStyle = '#888888';
			ctx.moveTo(margin, height-margin);
			ctx.lineTo(margin+(width-margin*2)/3, height/2+margin/2);
			ctx.lineTo(margin+2*(width-margin*2)/3, height/2+margin/2);
			ctx.lineTo(width-margin, height-margin);
			ctx.lineTo(margin, height-margin);
			ctx.fill();
		},
		"forward": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			} else {
				param = 50;
			}
			var maxparam = 250;
			var backwards = false;
			if (param < 0) {
				backwards = true;
				param = -param;
			}
			if (param > maxparam*0.75) {
				param = maxparam*0.75;
			} 
			var margin = 15;
			var lineHeight = (height-margin*2)/2*(1-param/maxparam);
			var lineWidth = (width-margin*2)*param/maxparam;
			var arrowHeight = lineHeight*2;
			var arrowWidth = (width-margin*2)-lineWidth;
			ctx.fillStyle = "#0000FF";
			ctx.beginPath();
			if (!backwards) {
				ctx.moveTo(margin,height/2-lineHeight/2);
				ctx.lineTo(margin,height/2+lineHeight/2);
				ctx.lineTo(margin+lineWidth,height/2+lineHeight/2);
				ctx.lineTo(margin+lineWidth,height/2-lineHeight/2);
				ctx.moveTo(width-margin-arrowWidth,height/2-arrowHeight/2);
				ctx.lineTo(width-margin,height/2);
				ctx.lineTo(width-margin-arrowWidth,height/2+arrowHeight/2);
			} else {
				ctx.moveTo(width-margin,height/2-lineHeight/2);
				ctx.lineTo(width-margin,height/2+lineHeight/2);
				ctx.lineTo(width-(margin+lineWidth),height/2+lineHeight/2);
				ctx.lineTo(width-(margin+lineWidth),height/2-lineHeight/2);
				ctx.moveTo(margin+arrowWidth,height/2-arrowHeight/2);
				ctx.lineTo(margin,height/2);
				ctx.lineTo(margin+arrowWidth,height/2+arrowHeight/2);
			}
			ctx.fill();
			ctx.closePath();
		},
		"function" : function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			var maxparam1 = 10;
			var maxparam2 = 20;
			var fontSize = (width-margin)/param.length;
			if (fontSize < maxparam1) {
				fontSize = maxparam1;
			}
			var margin = 15;
			ctx.font = fontSize+"px Verdana";
      			ctx.fillStyle = '#FFFFFF';
			ctx.fillText(param,margin,height-margin);
			fontSize = height-margin*2;
			if (fontSize < maxparam2) {
				fontSize = maxparam2;
			}
			ctx.font = fontSize+"px Verdana";
			ctx.fillText("( )",margin,height-margin);
		},
		"goTo": function(ctx, width, height, param) {
			if (!param) {
				return;
			}
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(margin+(width-margin*2)*param[0]/whiteboard.offsetWidth,margin+(height-margin*2)*param[1]/whiteboard.offsetHeight,height/20,startAngle,endAngle);
			ctx.fill();
		},
		"goToCenter": function(ctx, width, height, param) {
			if (!param) {
				return;
			}
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(width/2,height/2,height/20,startAngle,endAngle);
			ctx.fill();
		},
		"goToLowLeft": function(ctx, width, height, param) {
			if (!param) {
				return;
			}
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(margin,height-margin,height/20,startAngle,endAngle);
			ctx.fill();
		},
		"goToLowRight": function(ctx, width, height, param) {
			if (!param) {
				return;
			}
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(width-margin,height-margin,height/20,startAngle,endAngle);
			ctx.fill();
		},
		"goToUpLeft": function(ctx, width, height, param) {
			if (!param) {
				return;
			}
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(margin,margin,height/20,startAngle,endAngle);
			ctx.fill();
		},
		"goToUpRight": function(ctx, width, height, param) {
			if (!param) {
				return;
			}
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(width-margin,margin,height/20,startAngle,endAngle);
			ctx.fill();
		},
		"hide": function(ctx, width, height, param) {
			var margin = 15;
			ctx.beginPath()
      			ctx.strokeStyle = '#000000';
        		ctx.setLineDash([5]);
			ctx.moveTo(width/4,margin);
			ctx.lineTo(width/4,height-margin);
			ctx.lineTo(3*width/4,height/2);
			ctx.lineTo(width/4,margin);
			ctx.stroke();
		},
		"image": function(ctx, width, height, param) {
			var margin = 20;
			ctx.beginPath();
			ctx.fillStyle = "#FFFFFF";
			ctx.rect(margin/2,margin,width-margin,height-margin*2);
			ctx.fill();
			ctx.strokeStyle = "#000000";
			ctx.stroke();
			ctx.save();
			ctx.clip();
			for (var i=0; i<15; i++) {
				var startAngle =Math.random()*2*Math.PI;
				var endAngle = Math.random()*2*Math.PI;
				ctx.fillStyle = "rgb("+parseInt(256*Math.random())+","+parseInt(256*Math.random())+","+parseInt(256*Math.random())+")";
				ctx.beginPath();
				ctx.arc(margin/2+(width-margin)*Math.random(),margin+(height-margin*2)*Math.random(),(height-margin*2)/2*Math.random(),startAngle,endAngle);
				ctx.fill();
			}
			ctx.restore();
		},
		"if": function(ctx, width, height, param) {
			var margin = 15;
			ctx.lineWidth = '3';
			ctx.strokeStyle = '#000000';	
			ctx.moveTo(width-margin*2,margin*1.5);
			ctx.lineTo(margin,height/2);
			ctx.lineTo(width-margin*2,height-margin*1.5);
			ctx.stroke();
			ctx.fillStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(width-margin*2,margin);
			ctx.lineTo(width-margin,margin*1.5);
			ctx.lineTo(width-margin*2,margin*2);
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(width-margin*2,height-margin);
			ctx.lineTo(width-margin,height-margin*1.5);
			ctx.lineTo(width-margin*2,height-margin*2);
			ctx.fill();
		},
		"ifelse": function(ctx, width, height, param) {
			var margin = 15;
			ctx.lineWidth = '3';
			ctx.strokeStyle = '#000000';	
			ctx.moveTo(width-margin*2,margin*1.5);
			ctx.lineTo(margin,height/2);
			ctx.lineTo(width-margin*2,height-margin*1.5);
			ctx.stroke();
			ctx.fillStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(width-margin*2,margin);
			ctx.lineTo(width-margin,margin*1.5);
			ctx.lineTo(width-margin*2,margin*2);
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(width-margin*2,height-margin);
			ctx.lineTo(width-margin,height-margin*1.5);
			ctx.lineTo(width-margin*2,height-margin*2);
			ctx.fill();	
			ctx.moveTo(margin,height/2);
			ctx.lineTo(width-margin*2,height/2);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(width-margin*2,height/2-margin/2);
			ctx.lineTo(width-margin,height/2);
			ctx.lineTo(width-margin*2,height/2+margin/2);
			ctx.fill();
		},
		"line": function(ctx, width, height, param) {
			var margin = 15;
			ctx.lineWidth = '3';
			ctx.strokeStyle = '#000000';
			ctx.moveTo(width/2,height-margin);
			ctx.lineTo(width-margin,margin);
			ctx.stroke();
		},
		"lineAt": function(ctx, width, height, param) {
			var margin = 15;
			ctx.lineWidth = 3;
			ctx.strokeStyle = '#FFFFFF';
			ctx.moveTo(width/2,height-margin);
			ctx.lineTo(width-margin,margin);
			ctx.stroke();
		},
		"move": function(ctx, width, height, param) {
			var param1, param2;
			if (param != null && param != undefined && param != "") {
				param1 = param[0];
				param2 = param[1];
			}
			var maxparam1 = 100;
			if (param1 > maxparam1*0.75) {
				param1 = maxparam1*0.75;
			}
			var maxparam2 = 100;
			if (param2 > maxparam2*0.75) {
				param2 = maxparam2*0.75;
			}
			var margin = 15;
			ctx.fillStyle = "#000000";
			ctx.strokeStyle = "#000000";
			var lineWidth = width/20;
			var squareWidth = (width-margin)/2*param1/maxparam1;
			var squareHeight = (height-margin)/2*param2/maxparam2;
			ctx.beginPath();
			ctx.moveTo(width/2,height/2);
			ctx.lineTo(width/2+squareWidth,height/2+squareHeight);
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc(width/2+squareWidth,height/2+squareHeight,1.5*lineWidth,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();
		},
		"moveDown": function(ctx, width, height, param) {
			var param1;
			if (param != null && param != undefined && param != "") {
				param1 = param[0];
			}
			var maxparam1 = 100;
			if (param1 > maxparam1*0.75) {
				param1 = maxparam1*0.75;
			}
			var margin = 15;
			ctx.fillStyle = "#000000";
			ctx.strokeStyle = "#000000";
			var lineWidth = width/20;
			var squareWidth = 0;
			var squareHeight = (height-margin)/2*param1/maxparam1;
			ctx.beginPath();
			ctx.moveTo(width/2,height/2);
			ctx.lineTo(width/2+squareWidth,height/2+squareHeight);
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc(width/2+squareWidth,height/2+squareHeight,1.5*lineWidth,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();
		},
		"moveLeft": function(ctx, width, height, param) {
			var param1;
			if (param != null && param != undefined && param != "") {
				param1 = param[0];
			}
			var maxparam1 = 100;
			if (param1 > maxparam1*0.75) {
				param1 = maxparam1*0.75;
			}
			var margin = 15;
			ctx.fillStyle = "#000000";
			ctx.strokeStyle = "#000000";
			var lineWidth = width/20;
			var squareWidth = (width-margin)/2*param1/maxparam1;
			var squareHeight = 0;
			ctx.beginPath();
			ctx.moveTo(width/2,height/2);
			ctx.lineTo(width/2+squareWidth,height/2+squareHeight);
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc(width/2+squareWidth,height/2+squareHeight,1.5*lineWidth,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();
		},
		"moveRight": function(ctx, width, height, param) {
			var param1;
			if (param != null && param != undefined && param != "") {
				param1 = param[0];
			}
			var maxparam1 = 100;
			if (param1 > maxparam1*0.75) {
				param1 = maxparam1*0.75;
			}
			var margin = 15;
			ctx.fillStyle = "#000000";
			ctx.strokeStyle = "#000000";
			var lineWidth = width/20;
			var squareWidth = (width-margin)/2*param1/maxparam1;
			var squareHeight = 0;
			ctx.beginPath();
			ctx.moveTo(width/2,height/2);
			ctx.lineTo(width/2+squareWidth,height/2+squareHeight);
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc(width/2+squareWidth,height/2+squareHeight,1.5*lineWidth,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();
		},
		"moveUp": function(ctx, width, height, param) {
			var param1;
			if (param != null && param != undefined && param != "") {
				param1 = param[0];
			}
			var maxparam1 = 100;
			if (param1 > maxparam1*0.75) {
				param1 = maxparam1*0.75;
			}
			var margin = 15;
			ctx.fillStyle = "#000000";
			ctx.strokeStyle = "#000000";
			var lineWidth = width/20;
			var squareWidth = 0;
			var squareHeight = (height-margin)/2*param1/maxparam1;
			ctx.beginPath();
			ctx.moveTo(width/2,height/2);
			ctx.lineTo(width/2+squareWidth,height/2+squareHeight);
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc(width/2+squareWidth,height/2+squareHeight,1.5*lineWidth,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();
		},
		"null" : function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			ctx.font = "10px Verdana";
      			ctx.fillStyle = '#FFFFFF';
			ctx.fillText(param,margin,height/2);
		},
		"nullChild" : function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			ctx.font = "10px Verdana";
	      		ctx.fillStyle = "#000000";
			ctx.fillText(param,margin,height/2);
		},
		"pull": function(ctx, width, height, param) {
			if (param != null && param != undefined && param != "") {
				param = param[0];
			} else {
				param = 1;
			}
			var maxparam = 6;
			if (param > maxparam*0.75) {
				param = maxparam*0.75;
			}
			var margin = 15;
			ctx.fillStyle = "#00FF00";
			ctx.beginPath();
			ctx.moveTo(margin,height-margin);
			ctx.lineTo(width-margin,height-margin);
			ctx.lineTo(width/2,height/2-(height-margin*2)/2*(param-1)/(maxparam-1));
			ctx.fill();
			ctx.closePath();
			ctx.beginPath();
			ctx.moveTo(margin,margin);
			ctx.lineTo(width-margin,margin);
			ctx.lineTo(width-margin,height/2-(height-margin*2)/2*(param-1)/(maxparam-1));
			ctx.lineTo(margin,height/2-(height-margin*2)/2*(param-1)/(maxparam-1));
			ctx.fill();
			ctx.closePath();
		},
		"push": function(ctx, width, height, param) {
			if (param != null && param != undefined && param != "") {
				param = param[0];
			} else {
				param = 1;
			}
			var maxparam = 6;
			if (param > maxparam*0.75) {
				param = maxparam*0.75;
			}
			var margin = 15;
			ctx.fillStyle = "#FFFFFF";
			ctx.beginPath();
			ctx.moveTo(margin,margin);
			ctx.lineTo(width-margin,margin);
			ctx.lineTo(width/2,height/2+(height-margin*2)/2*(param-1)/(maxparam-1));
			ctx.fill();
			ctx.closePath();
			ctx.beginPath();
			ctx.moveTo(margin,height-margin);
			ctx.lineTo(width-margin,height-margin);
			ctx.lineTo(width-margin,height/2+(height-margin*2)/2*(param-1)/(maxparam-1));
			ctx.lineTo(margin,height/2+(height-margin*2)/2*(param-1)/(maxparam-1));
			ctx.fill();
			ctx.closePath();
		},
		"repeat": function(ctx, width, height, param) {
			param = param[0].toString();
			var margin = 15;
			var lineWidth = 3
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = '#000000';
			ctx.moveTo(width/2+margin/2,margin*1.5);
			ctx.lineTo(width-margin,margin*1.5);
			ctx.lineTo(width-margin,height-margin);
			ctx.lineTo(margin,height-margin);
			ctx.lineTo(margin,margin*1.5);
			ctx.lineTo(width/2,margin*1.5);
			ctx.stroke();
			ctx.fillStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(width/2-3,margin);
			ctx.lineTo(width/2+margin/2-3,margin*1.5);
			ctx.lineTo(width/2-3,margin*2);
			ctx.fill();
			ctx.font = "bold "+(height-(margin+lineWidth))/(param.length*1.5)+"px Verdana";
      			ctx.fillStyle = '#000000';
			ctx.fillText(param,margin+lineWidth,height-(margin+lineWidth));
		},
		"rotateLeft": function(ctx, width, height, param) {
			var param1;
			if (param) {
				param1 = param[0];
			}
			var maxparam1 = 360;
			if (param1 > maxparam1) {
				param1 = maxparam1;
			}
			var margin = 15;
			var lineWidth = height/20;
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 3;
			var startAngle = 0;
			var endAngle = param1*Math.PI/180;
			ctx.arc(width/2,height/2,(height-margin)/2,startAngle,endAngle);
			ctx.stroke();
			ctx.closePath();
			var COx, COy; // vector from center to origin
			COx = 0-lineWidth;
			COy = (height-margin)/2-lineWidth;
			var rotateAngle = -param1*Math.PI/180;
			var x = width/2+Math.cos(rotateAngle)*COx-Math.sin(rotateAngle)*COy;
			var y = height/2+Math.sin(rotateAngle)*COx+Math.cos(rotateAngle)*COy;
			ctx.beginPath();
			ctx.fillStyle = "#000000";
			ctx.arc(x,y,1.5*lineWidth,0,2*Math.PI);
			ctx.fill();
		},
		"rotateRight": function(ctx, width, height, param) {
			var param1;
			if (param) {
				param1 = -param[0];
			}
			var maxparam1 = 360;
			if (param1*(-1) > maxparam1) {
				param1 = maxparam1*(-1);
			}
			var margin = 30;
			var lineWidth = height/20;
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 3;
			var startAngle = Math.PI;
			var endAngle = param1*Math.PI/180;
			ctx.arc(width/2,height/2,(height-margin)/2,startAngle,endAngle);
			ctx.stroke();
			ctx.closePath();
			var COx, COy; // vector from center to origin
			COx = 0-lineWidth;
			COy = (height-margin)/2-lineWidth;
			var rotateAngle = -param1*Math.PI/180;
			var x = width/2+Math.cos(rotateAngle)*COx-Math.sin(rotateAngle)*COy;
			var y = height/2+Math.sin(rotateAngle)*COx+Math.cos(rotateAngle)*COy;
			ctx.beginPath();
			ctx.fillStyle = "#000000";
			ctx.arc(x,y,1.5*lineWidth,0,2*Math.PI);
			ctx.fill();
		},
		"scale": function(ctx, width, height, param) {
			var param1;
			if (param) {
				param1 = param[0];
				param2 = param[1];
			} else {
				param1 = 1;
				param2 = 1;
			}
			var maxparam1 = 2;
			if (param1 > maxparam1) {
				param1 = maxparam1;
			}
			var maxparam2 = 2;
			if (param2 > maxparam2) {
				param2 = maxparam2;
			}
			var margin = 15;
			ctx.beginPath();
			ctx.fillStyle = "#FFFFFF";
			ctx.rect(margin,margin,param1*(width-margin*2)/2,param2*(width-margin*2)/2);
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.strokeStyle = "#AAAAAA";
			ctx.rect(margin,margin,(width-margin*2)/2,(width-margin*2)/2);
			ctx.stroke();
			ctx.closePath();
		},
		"setBold": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			ctx.font = ((param||param===undefined)?"bold ":"")+(height-margin*2)+"px Verdana";
      			ctx.fillStyle = (param||param===undefined)?'#000000':'#AAAAAA';
			ctx.fillText("B",margin,height-margin);
		},
		"setColor": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			if (param < 0) {
				param = 360 - param;
			}
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = param.slice(1,param.length-1);
			ctx.strokeStyle = "#000000";
			ctx.moveTo(width/2,height/2);
			ctx.beginPath();
			ctx.arc(width/2,height/2,height/3,startAngle,endAngle);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		},
		"setSize": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var maxparam = 20;
			if (param > maxparam*0.85) {
				param = maxparam*0.85;
			}
			var margin = 15;
			var squareWidth = (width-margin*2)*(param/maxparam);
			var squareHeight = (height-margin*2)*(param/maxparam);
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(width/2-squareWidth/2,height/2-squareHeight/2);
			ctx.lineTo(width/2+squareWidth/2,height/2-squareHeight/2);
			ctx.lineTo(width/2+squareWidth/2,height/2+squareHeight/2);
			ctx.lineTo(width/2-squareWidth/2,height/2+squareHeight/2);
			ctx.lineTo(width/2-squareWidth/2,height/2-squareHeight/2);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(width/2-squareWidth/2,height/2-squareHeight/2);
			ctx.lineTo(width/2+squareWidth/2,height/2+squareHeight/2);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(width/2-squareWidth/2,height/2+squareHeight/2);
			ctx.lineTo(width/2+squareWidth/2,height/2-squareHeight/2);
			ctx.stroke();
		},
		"setFont": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			ctx.font = (height-margin*2)+"px "+(param?param:"");
      			ctx.fillStyle = '#000000';
			ctx.fillText("F",margin,height-margin);
		},
		"setItalic": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			ctx.font = ((param||param===undefined)?"italic ":"")+(height-margin*2)+"px Verdana";
      			ctx.fillStyle = (param||param===undefined)?'#000000':'#AAAAAA';
			ctx.fillText("I",margin,height-margin);
		},
		"setInvisible": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			var grd=ctx.createRadialGradient(width/2,height/2,1,width/2,height/2,(height-margin*2)/1.5);
			grd.addColorStop(0,"rgba(0, 256, 0, "+param+")");
			grd.addColorStop(1,"#FFFF00");
			ctx.fillStyle=grd;
			ctx.fillRect(margin,margin,width-margin*2,height-margin*2);
		},
		"show": function(ctx, width, height, param) {
			var margin = 15;
			ctx.beginPath()
      			ctx.fillStyle = '#000000';
			ctx.moveTo(width/4,margin);
			ctx.lineTo(width/4,height-margin);
			ctx.lineTo(3*width/4,height/2);
			ctx.fill();
		},
		"stop": function(ctx, width, height, param) {
			var margin = 15;
			ctx.fillStyle = '#FF0000';
			ctx.strokeStyle = '#FFFFFF';
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.moveTo(margin+(width-margin*2)/3,margin);
			ctx.lineTo(margin+2*(width-margin*2)/3,margin);
			ctx.lineTo(width-margin,margin+(height-margin*2)/3);
			ctx.lineTo(width-margin,margin+2*(height-margin*2)/3);
			ctx.lineTo(margin+2*(width-margin*2)/3,height-margin);
			ctx.lineTo(margin+(width-margin*2)/3,height-margin);
			ctx.lineTo(margin,margin+2*(height-margin*2)/3);
			ctx.lineTo(margin,margin+(height-margin*2)/3);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			ctx.moveTo(margin*1.5,height/2);
			ctx.lineTo(width-margin*1.5,height/2);
			ctx.stroke();
		},
		"turnLeft": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			} else {
				param = 275;
			}
			var maxparam = 360;
			if (param > maxparam*0.85) {
				param = maxparam*0.85;
			}
			var margin = 15;
			var startAngle = (-90-param)*Math.PI/180;
			var endAngle = -90*Math.PI/180;
			ctx.fillStyle = "#0000FF";
			ctx.beginPath();
			ctx.arc(width/2,height/2,height/2-margin,startAngle,endAngle);
			ctx.arc(width/2,height/2,(height/2-margin)*(param/maxparam),endAngle,startAngle,true);
			ctx.fill();
			ctx.closePath();
			ctx.fillStyle = "#0000FF";
			var lineWidth = (height/2-margin-(height/2-margin)*(param/maxparam));
			var COx, COy; // vector from center to origin
			COx = 0;
			COy = (margin+lineWidth/2)-height/2;
			var rotateAngle = -param*Math.PI/180;
			var x = width/2+Math.cos(rotateAngle)*COx-Math.sin(rotateAngle)*COy;
			var y = height/2+Math.sin(rotateAngle)*COx+Math.cos(rotateAngle)*COy;
			ctx.save();
			ctx.translate(x,y);
			ctx.rotate(-90*Math.PI/180+rotateAngle);
			ctx.beginPath();
			ctx.moveTo(0-lineWidth,0);
			ctx.lineTo(0+lineWidth,0);
			ctx.lineTo(0,0-lineWidth);
			ctx.fill();
			ctx.restore();
		},
		"turnReset": function(ctx, width, height, param) {
			var margin = 15;
			ctx.fillStyle = "#0000FF";
			ctx.beginPath();
			ctx.moveTo(margin,height/2);
			ctx.lineTo(width-margin,height/2);
			ctx.lineTo(width/2,margin);
			ctx.lineTo(margin,height/2);
			ctx.fill();
		},
		"turnRight": function(ctx, width, height, param) {
			if (param) {
				param = parseInt(param[0]);
			} else {
				param = 90;
			}
			var maxparam = 360;
			if (param < 0) {
				param = 360 - param;
			}
			if (param > maxparam*0.85) {
				param = maxparam*0.85;
			}
			var margin = 15;
			var startAngle = -90*Math.PI/180;
			var endAngle = (param-90)*Math.PI/180;
			ctx.fillStyle = "#0000FF";
			ctx.beginPath();
			ctx.arc(width/2,height/2,height/2-margin,startAngle,endAngle);
			ctx.arc(width/2,height/2,(height/2-margin)*(param/maxparam),endAngle,startAngle,true);
			ctx.fill();
			ctx.closePath();
			ctx.fillStyle = "#0000FF";
			var lineWidth = (height/2-margin-(height/2-margin)*(param/maxparam));
			var COx, COy; // vector from center to origin
			COx = 0;
			COy = (margin+lineWidth/2)-height/2;
			var rotateAngle = param*Math.PI/180;
			var x = width/2+Math.cos(rotateAngle)*COx-Math.sin(rotateAngle)*COy;
			var y = height/2+Math.sin(rotateAngle)*COx+Math.cos(rotateAngle)*COy;
			ctx.save();
			ctx.translate(x,y);
			ctx.rotate(90*Math.PI/180+rotateAngle);
			ctx.beginPath();
			ctx.moveTo(0-lineWidth,0);
			ctx.lineTo(0+lineWidth,0);
			ctx.lineTo(0,0-lineWidth);
			ctx.fill();
			ctx.restore();
		},
		"use": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			if (param === undefined) {
				param = "N";
			}
			var margin = 15;
			ctx.font = "bold "+(height-margin*2)+"px Verdana";
      			ctx.fillStyle = '#FFFFFF';
      			ctx.strokeStyle = '#FFFFFF';
			ctx.fillText(param,margin,height-margin);
			ctx.rect(margin,margin,width-margin*2,height-margin*2);
			ctx.stroke();
		},
		"unsetBold": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			ctx.font = (param?"bold ":"")+(height-margin*2)+"px Verdana";
      			ctx.fillStyle = param?'#000000':'#AAAAAA';
			ctx.fillText("B",margin,height-margin);
		},
		"unsetColor": function(ctx, width, height, param) {
			var margin = 15;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.strokeStyle = "#000000";
			ctx.moveTo(width/2,height/2);
			ctx.beginPath();
			ctx.arc(width/2,height/2,height/3,startAngle,endAngle);
			ctx.stroke();
			ctx.closePath();
			ctx.strokeStyle = "#AA0000";
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(margin,margin);
			ctx.lineTo(width-margin,height-margin);
			ctx.stroke();
			ctx.beginPath();
			ctx.lineTo(width-margin,margin);
			ctx.lineTo(margin,height-margin);
			ctx.stroke();
		},
		"unsetFont": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			ctx.font = (height-margin*2)+"px "+(param?param:"sans-serif");
      			ctx.fillStyle = param?'#000000':'#AAAAAA';
			ctx.fillText("F",margin,height-margin);
		},
		"unsetItalic": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			ctx.font = (param?"italic ":"")+(height-margin*2)+"px Verdana";
      			ctx.fillStyle = param?'#000000':'#AAAAAA';
			ctx.fillText("I",margin,height-margin);
		},
		"unsetResize": function(ctx, width, height, param) {
			var margin = 15;
			var squareWidth = (width-margin*2)*0.7;
			var squareHeight = (height-margin*2)*0.7;
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(width/2-squareWidth/2,height/2-squareHeight/2);
			ctx.lineTo(width/2+squareWidth/2,height/2-squareHeight/2);
			ctx.lineTo(width/2+squareWidth/2,height/2+squareHeight/2);
			ctx.lineTo(width/2-squareWidth/2,height/2+squareHeight/2);
			ctx.lineTo(width/2-squareWidth/2,height/2-squareHeight/2);
			ctx.stroke();
			ctx.strokeStyle = "#AA0000";
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(width/2-squareWidth/2*1.2,height/2-squareHeight/2*1.2);
			ctx.lineTo(width/2+squareWidth/2*1.2,height/2+squareHeight/2*1.2);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(width/2-squareWidth/2*1.2,height/2+squareHeight/2*1.2);
			ctx.lineTo(width/2+squareWidth/2*1.2,height/2-squareHeight/2*1.2);
			ctx.stroke();
		},
		"unsetSize": function(ctx, width, height, param) {
			var margin = 15;
			var squareWidth = (width-margin*2)*0.7;
			var squareHeight = (height-margin*2)*0.7;
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(width/2-squareWidth/2,height/2-squareHeight/2);
			ctx.lineTo(width/2+squareWidth/2,height/2-squareHeight/2);
			ctx.lineTo(width/2+squareWidth/2,height/2+squareHeight/2);
			ctx.lineTo(width/2-squareWidth/2,height/2+squareHeight/2);
			ctx.lineTo(width/2-squareWidth/2,height/2-squareHeight/2);
			ctx.stroke();
			ctx.strokeStyle = "#AA0000";
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(width/2-squareWidth/2*1.2,height/2-squareHeight/2*1.2);
			ctx.lineTo(width/2+squareWidth/2*1.2,height/2+squareHeight/2*1.2);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(width/2-squareWidth/2*1.2,height/2+squareHeight/2*1.2);
			ctx.lineTo(width/2+squareWidth/2*1.2,height/2-squareHeight/2*1.2);
			ctx.stroke();
		},
		"unsetInvisible": function(ctx, width, height, param) {
			var margin = 15;
			var grd=ctx.createRadialGradient(width/2,height/2,1,width/2,height/2,(height-margin*2)/1.5);
			grd.addColorStop(0,"#FFFF00");
			grd.addColorStop(1,"#00FF00");
			ctx.fillStyle=grd;
			ctx.fillRect(margin,margin,width-margin*2,height-margin*2);
		},
		"var" : function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			var maxparam = 10;
			var fontSize = (width-margin)/param.length;
			if (fontSize < maxparam) {
				fontSize = maxparam;
			}
			var margin = 15;
			ctx.font = fontSize+"px Verdana";
      			ctx.fillStyle = '#FFFFFF';
			ctx.fillText(param,margin,height/2);
		},
		"=" : function(ctx, width, height, param) {
			if (!param) {
				return;
			}
			var margin = 15;
			var maxparam = 10;
			var fontSize = (width-margin)/param.length;
			if (fontSize < maxparam) {
				fontSize = maxparam;
			}
			var margin = 15;
			ctx.font = fontSize+"px Verdana";
      			ctx.fillStyle = '#000000';
			ctx.fillText(param[0],margin,height/2);
			ctx.font = fontSize/1.5+"px Verdana";
			ctx.fillText(param[1],margin,height/2+fontSize);
		},
		"while": function(ctx, width, height, param) {
			var margin = 15;
			ctx.lineWidth = '3';
			ctx.strokeStyle = '#000000';	
			ctx.moveTo(width/2+margin/2,margin*1.5);
			ctx.lineTo(width-margin,margin*1.5);
			ctx.lineTo(width-margin,height-margin);
			ctx.lineTo(margin,height-margin);
			ctx.lineTo(margin,margin*1.5);
			ctx.lineTo(width/2,margin*1.5);
			ctx.stroke();
			ctx.fillStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(width/2-3,margin);
			ctx.lineTo(width/2+margin/2-3,margin*1.5);
			ctx.lineTo(width/2-3,margin*2);
			ctx.fill();
		},
		"write": function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			var maxparam = 10;
			var fontSize = (width-margin)*2/param.length;
			if (fontSize < maxparam) {
				fontSize = maxparam;
			}
			var margin = 15;
			var angle = 45;
			ctx.font = fontSize+"px Verdana";
      			ctx.fillStyle = '#000000';
			ctx.translate(-width/2,height/2);
			ctx.rotate(-angle*Math.PI/180);
			ctx.fillText(param,margin,height-margin);
			ctx.rotate(angle*Math.PI/180);
			ctx.translate(width/2,-height/2);
		},
		"writeAt" : function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			var maxparam = 10;
			var fontSize = (width-margin)*2/param.length;
			if (fontSize < maxparam) {
				fontSize = maxparam;
			}
			var margin = 15;
			var angle = 45;
			ctx.font = fontSize+"px Verdana";
      			ctx.fillStyle = '#FFFFFF';
			ctx.translate(-width/2,height/2);
			ctx.rotate(-angle*Math.PI/180);
			ctx.fillText(param,margin,height-margin);
			ctx.rotate(angle*Math.PI/180);
			ctx.translate(width/2,-height/2);
		}
	};
