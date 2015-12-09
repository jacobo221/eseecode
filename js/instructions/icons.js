"use strict";

	/**
	 * Contains the icon definition for each instruction
	 * @type {Array<{String, function(!HTMLElement, Number, Number, Array<String>)}>}
	 * @example {"arc": function(ctx, width, height, param) { ... }}
	 */
	$_eseecode.instructions.icons = {
		"animate": function(ctx, width, height, param) {
			var margin = 15;
			ctx.lineWidth = 3;
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.arc(width/2, height/2, width/2-margin, 0, 360, false);
			ctx.closePath();
			ctx.stroke();
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(width/2, height/2);
			ctx.lineTo(4*margin/3, height/2);
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(width/2, height/2);
			ctx.lineTo(width/2, 3*margin/2);
			ctx.closePath();
			ctx.stroke();
		},
		"animateLayers": function(ctx, width, height, param) {
			var margin = 15;
			var separation = 4;
			ctx.lineWidth = 3;
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(margin+separation,height/3-separation);
			ctx.lineTo(2*width/3+separation,height/3-separation);
			ctx.lineTo(2*width/3+separation,(height-margin)-separation);
			ctx.lineTo(margin+separation,(height-margin)-separation);
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(margin+separation*2,height/3-separation*2);
			ctx.lineTo(2*width/3+separation*2,height/3-separation*2);
			ctx.lineTo(2*width/3+separation*2,(height-margin)-separation*2);
			ctx.lineTo(margin+separation*2,(height-margin)-separation*2);
			ctx.closePath();
			ctx.stroke();
			ctx.fillStyle = '#222222';
			ctx.beginPath();
			ctx.moveTo(margin,height/3);
			ctx.lineTo(2*width/3,height/3);
			ctx.lineTo(2*width/3,height-margin);
			ctx.lineTo(margin,height-margin);
			ctx.closePath();
			ctx.fill();
			ctx.strokeStyle = '#AAAAAA';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.arc(width-1.5*margin,height-1.5*margin, 1.5*margin/2, 0, 2*Math.PI);
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(width-1.5*margin,height-1.5*margin);
			ctx.lineTo(width-1.5*margin+margin/2,height-1.5*margin);
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(width-1.5*margin,height-1.5*margin);
			ctx.lineTo(width-1.5*margin,height-1.5*margin-margin/2);
			ctx.closePath();
			ctx.stroke();
		},
		"arc": function(ctx, width, height, param) {
			var margin = 15;
			var param1, param2;
			if (param) {
				param1 = parseInt(param[0]);
				param2 = parseInt(param[1]);
				if (!$e_isNumber(param2, true)) {
					param2 = 360;
				}
			} else {
				param1 = (height-margin*2)/3;
				param2 = 360;
			}
			if (!$e_isNumber(param1, true) || !$e_isNumber(param2, true)) {
				ctx.font = 12+"px Verdana";
      			ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam1 = 100;
			var maxparam2 = 360;
			if ($e_isNumber(param2,true) && param2 < 0) {
				param2 = param2 % 360;
			}
			if (!$e_isNumber(param1,true)) {
				param1 = maxparam1;
			}
			if (!$e_isNumber(param2,true) || param2 > maxparam2) {
				param2 = maxparam2;
			}
			var radius = (height-margin*2)/2*(param1/maxparam1);
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 3;
			var startAngle = 0;
			var endAngle = param2*Math.PI/180;
			ctx.beginPath();
			ctx.arc(width/2, height/2, radius, startAngle, endAngle, false);
			ctx.stroke();
			ctx.closePath();
		},
		"array" : function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			var minfont = 10;
			var maxfont = 20;
			var fontSize = (width-margin*2)/param.length;
			if (fontSize < minfont) {
				fontSize = minfont;
			}
			if (fontSize > maxfont) {
				fontSize = maxfont;
			}
			ctx.font = fontSize+"px Verdana";
      		ctx.fillStyle = '#FFFFFF';
			ctx.fillText(param,margin,height-margin);
			ctx.font = "32px Verdana";
			ctx.fillText("[ ]",margin,height/2);
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
			ctx.arc(margin, height/2, 2, startAngle, endAngle, false);
			ctx.arc(margin, margin+3*(height-margin*2)/4, 2, startAngle, endAngle, false);
			ctx.arc(margin, height-margin, 2, startAngle, endAngle, false);
			ctx.fill();
		},
		"changeAxis": function(ctx, width, height, param) {
			var margin = 20;
			if (!param) {
				return;
			}
			var param1 = parseInt(param[0]);
			var param2 = parseInt(param[1]);
			if (!$e_isNumber(param1,true) || !$e_isNumber(param2,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var canvasSize = $_eseecode.whiteboard.offsetWidth;
			if (!$e_isNumber(param1,true)) {
				param1 = width/2;
			} else {
				param1 = margin+parseInt(param1)/canvasSize*(width-(2*margin));
			}
			if (!$e_isNumber(param2,true)) {
				param2 = height/2;
			} else {
				param2 = margin+parseInt(param2)/canvasSize*(height-(2*margin));
			}
			var arrowSize = 6;
			ctx.strokeStyle = "#000000";
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.moveTo(param1,margin);
			ctx.lineTo(param1,height-margin);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(param1-arrowSize/2,margin);
			ctx.lineTo(param1+arrowSize/2,margin);
			ctx.lineTo(param1,margin-arrowSize);
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(margin,param2);
			ctx.lineTo(width-margin,param2);
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(width-margin,param2-arrowSize/2);
			ctx.lineTo(width-margin,param2+arrowSize/2);
			ctx.lineTo(width-margin+arrowSize,param2);
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
			ctx.arc(width-margin, height/2,2, startAngle, endAngle, false);
			ctx.arc(width-margin, margin+(height-margin*2)/4, 2, startAngle, endAngle, false);
			ctx.arc(width-margin, margin, 2, startAngle, endAngle, false);
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
			var margin = 15;
			if (param) {
				param = parseInt(param[0]);
			} else {
				param = 50;
			}
			if (!$e_isNumber(param,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam = 250;
			var backwards = false;
			if ($e_isNumber(param,true) && param < 0) {
				backwards = true;
				param = -param;
			}
			if (!$e_isNumber(param,true) || param > maxparam*0.75) {
				param = maxparam*0.75;
			}
			var lineHeight = (height-margin*2)*param/maxparam;
			var lineWidth = (width-margin*2)/2*(1-param/maxparam);
			var arrowHeight = (height-margin*2)-lineHeight;
			var arrowWidth = Math.min (2*lineWidth, width-2*margin);
			ctx.fillStyle = "#0000FF";
			ctx.beginPath();
			if (!backwards) {
				ctx.moveTo(width/2-lineWidth/2, height-margin);
				ctx.lineTo(width/2+lineWidth/2, height-margin);
				ctx.lineTo(width/2+lineWidth/2, margin+arrowHeight);
				ctx.lineTo(width/2+arrowWidth/2, margin+arrowHeight);
				ctx.lineTo(width/2, margin);
				ctx.lineTo(width/2-arrowWidth/2, margin+arrowHeight);
				ctx.lineTo(width/2-lineWidth/2, margin+arrowHeight);
			} else {
				ctx.moveTo(width/2-lineWidth/2, margin);
				ctx.lineTo(width/2+lineWidth/2, margin);
				ctx.lineTo(width/2+lineWidth/2, margin+lineHeight);
				ctx.lineTo(width/2+arrowWidth/2, margin+lineHeight);
				ctx.lineTo(width/2, height-margin);
				ctx.lineTo(width/2-arrowWidth/2, margin+lineHeight);
				ctx.lineTo(width/2-lineWidth/2, margin+lineHeight);
			}
			ctx.closePath();
			ctx.fill();
		},
		"function" : function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
			var margin = 15;
			var minfont = 10;
			var maxfont = 20;
			var fontSize = (width-margin*2)/param.length;
			if (fontSize < minfont) {
				fontSize = minfont;
			}
			if (fontSize > maxfont) {
				fontSize = maxfont;
			}
			var margin = 15;
			ctx.font = fontSize+"px Verdana";
   			ctx.fillStyle = '#FFFFFF';
			ctx.fillText(param,margin,height-margin);
			ctx.font = "32px Verdana";
			ctx.fillText("( )",margin,height/2);
		},
		"goTo": function(ctx, width, height, param) {
			var margin = 20;
			if (!param) {
				return;
			}
			var param1 = parseInt(param[0]);
			var param2 = parseInt(param[1]);
			if (!$e_isNumber(param1,true) || !$e_isNumber(param2,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var canvasSize = $_eseecode.whiteboard.offsetWidth;
			if (!$e_isNumber(param1,true)) {
				param1 = 0;
			}
			if (!$e_isNumber(param2,true)) {
				param2 = canvasSize/2+$_eseecode.coordinates.y;
			}
			var coords = $e_user2systemCoords({x: parseInt(param1), y: parseInt(param2)});
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(margin+(width-margin*2)*coords.x/canvasSize, margin+(height-margin*2)*coords.y/canvasSize, height/20, startAngle, endAngle, false);
			ctx.closePath();
			ctx.fill();
		},
		"goToCenter": function(ctx, width, height, param) {
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(width/2, height/2, height/20, startAngle, endAngle, false);
			ctx.fill();
		},
		"goToLowLeft": function(ctx, width, height, param) {
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(margin, height-margin, height/20, startAngle, endAngle, false);
			ctx.fill();
		},
		"goToLowRight": function(ctx, width, height, param) {
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(width-margin, height-margin, height/20, startAngle, endAngle, false);
			ctx.fill();
		},
		"goToUpLeft": function(ctx, width, height, param) {
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(margin, margin, height/20, startAngle, endAngle, false);
			ctx.fill();
		},
		"goToUpRight": function(ctx, width, height, param) {
			var margin = 20;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = "#000000";
			ctx.beginPath();
			ctx.arc(width-margin, margin, height/20, startAngle, endAngle, false);
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
				ctx.arc(margin/2+(width-margin)*Math.random(), margin+(height-margin*2)*Math.random(), (height-margin*2)/2*Math.random(), startAngle, endAngle, false);
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
			ctx.moveTo(width-margin,height-margin);
			ctx.lineTo(width-margin*2,height-margin*2);
			ctx.moveTo(width-margin,height-margin*2);
			ctx.lineTo(width-margin*2,height-margin);
			ctx.stroke();
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
			var literals = true;
			var param1, param2, param3, param4;
			if (param && param.length) {
				param1 = parseInt(param[0]);
				param2 = parseInt(param[1]);
				param3 = parseInt(param[2]);
				param4 = parseInt(param[3]);
				if (!$e_isNumber(param1,true) || !$e_isNumber(param2,true) || !$e_isNumber(param3,true) || !$e_isNumber(param4,true)) {
					literals = false;
				}
			}
			var margin = 15;
			ctx.lineWidth = 3;
			ctx.strokeStyle = '#FFFFFF';
			var org = {};
			var destination = {};
			if (literals) {
			var canvasSize = $_eseecode.whiteboard.offsetWidth;
				org = $e_user2systemCoords({x: parseInt(param1), y: parseInt(param2)});
				org.x = margin+(width-margin*2)*org.x/canvasSize;
				org.y = margin+(height-margin*2)*org.y/canvasSize;
				destination = $e_user2systemCoords({x: parseInt(param3), y: parseInt(param4)});
				destination.x = margin+(width-margin*2)*destination.x/canvasSize;
				destination.y = margin+(height-margin*2)*destination.y/canvasSize;
			} else {
				org = {x: width/2, y: height-margin};
				destination = {x: width-margin, y: margin};
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			ctx.moveTo(org.x,org.y);
			ctx.lineTo(destination.x,destination.y);
			ctx.stroke();
		},
		"move": function(ctx, width, height, param) {
			var param1, param2;
			if (param != null && param != undefined && param != "") {
				param1 = parseInt(param[0]);
				param2 = parseInt(param[1]);
			}
			var margin = 15;
			if ($e_isNumber(param1,true) && $e_isNumber(param2,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam1 = 100;
			if (!$e_isNumber(param1,true) || param1 > maxparam1*0.75) {
				param1 = maxparam1*0.75;
			}
			var maxparam2 = 100;
			if (!$e_isNumber(param2,true) || param2 > maxparam2*0.75) {
				param2 = maxparam2*0.75;
			}
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
			ctx.arc(width/2+squareWidth, height/2+squareHeight, 1.5*lineWidth, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath();
		},
		"moveDown": function(ctx, width, height, param) {
			var margin = 15;
			var param1;
			if (param != null && param != undefined && param != "") {
				param1 = parseInt(param[0]);
			}
			if (!$e_isNumber(param1,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam1 = 100;
			if (!$e_isNumber(param1,true) || param1 > maxparam1*0.75) {
				param1 = maxparam1*0.75;
			}
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
			ctx.arc(width/2+squareWidth, height/2+squareHeight, 1.5*lineWidth, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath();
		},
		"moveLeft": function(ctx, width, height, param) {
			var margin = 15;
			var param1;
			if (param != null && param != undefined && param != "") {
				param1 = parseInt(param[0]);
			}
			if (!$e_isNumber(param1,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam1 = 100;
			if (!$e_isNumber(param1,true) || param1 > maxparam1*0.75) {
				param1 = maxparam1*0.75;
			}
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
			ctx.arc(width/2+squareWidth, height/2+squareHeight, 1.5*lineWidth, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath();
		},
		"moveRight": function(ctx, width, height, param) {
			var margin = 15;
			var param1;
			if (param != null && param != undefined && param != "") {
				param1 = parseInt(param[0]);
			}
			if (!$e_isNumber(param1,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam1 = 100;
			if (!$e_isNumber(param1,true) || param1 > maxparam1*0.75) {
				param1 = maxparam1*0.75;
			}
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
			ctx.arc(width/2+squareWidth, height/2+squareHeight, 1.5*lineWidth, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath();
		},
		"moveUp": function(ctx, width, height, param) {
			var margin = 15;
			var param1;
			if (param != null && param != undefined && param != "") {
				param1 = parseInt(param[0]);
			}
			if (!$e_isNumber(param1,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam1 = 100;
			if (!$e_isNumber(param1,true) || param1 > maxparam1*0.75) {
				param1 = maxparam1*0.75;
			}
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
			ctx.arc(width/2+squareWidth, height/2+squareHeight, 1.5*lineWidth, 0, 2*Math.PI, false);
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
			var margin = 15;
			if (param != null && param != undefined && param != "") {
				param = parseInt(param[0]);
			} else {
				param = 1;
			}
			if (!$e_isNumber(param,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam = 6;
			if (!$e_isNumber(param,true) || param > maxparam*0.75) {
				param = maxparam*0.75;
			}
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
			var margin = 15;
			if (param != null && param != undefined && param != "") {
				param = parseInt(param[0]);
			} else {
				param = 1;
			}
			if (!$e_isNumber(param,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam = 6;
			if (!$e_isNumber(param,true) || param > maxparam*0.75) {
				param = maxparam*0.75;
			}
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
		"pop": function(ctx, width, height, param) {
			var margin = 15;
			var separation = 4;
			ctx.lineWidth = 3;
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(margin+separation,height/3-separation);
			ctx.lineTo(2*width/3+separation,height/3-separation);
			ctx.lineTo(2*width/3+separation,(height-margin)-separation);
			ctx.lineTo(margin+separation,(height-margin)-separation);
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(margin+separation*2,height/3-separation*2);
			ctx.lineTo(2*width/3+separation*2,height/3-separation*2);
			ctx.lineTo(2*width/3+separation*2,(height-margin)-separation*2);
			ctx.lineTo(margin+separation*2,(height-margin)-separation*2);
			ctx.closePath();
			ctx.stroke();
			ctx.strokeStyle = '#AAAAAA';
			ctx.beginPath();
			ctx.moveTo(margin,height/3);
			ctx.lineTo(2*width/3,height-margin);
			ctx.closePath();
			ctx.stroke();
			ctx.beginPath();
			ctx.lineTo(2*width/3,height/3);
			ctx.lineTo(margin,height-margin);
			ctx.closePath();
			ctx.stroke();
		},
		"repeat": function(ctx, width, height, param) {
			param = parseInt(param[0]);
			var margin = 15;
			if (!$e_isNumber(param,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
				param = "N";
			}
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
			ctx.font = "bold "+(height-(margin+lineWidth))/(param.toString().length*1.5)+"px Verdana";
      		ctx.fillStyle = '#000000';
			ctx.fillText(param,margin+lineWidth,height-(margin+lineWidth));
		},
		"rotateLeft": function(ctx, width, height, param) {
			var margin = 15;
			var param1;
			if (param) {
				param1 = parseInt(param[0]);
			}
			if (!$e_isNumber(param1,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam1 = 360;
			if (!$e_isNumber(param1,true) || param1 > maxparam1) {
				param1 = maxparam1;
			}
			var lineWidth = height/20;
			ctx.beginPath();
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 3;
			var startAngle = 0;
			var endAngle = param1*Math.PI/180;
			ctx.arc(width/2, height/2, (height-margin)/2, startAngle, endAngle, false);
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
			ctx.arc(x, y, 1.5*lineWidth, 0, 2*Math.PI, false);
			ctx.fill();
		},
		"rotateRight": function(ctx, width, height, param) {
			var margin = 30;
			var param1;
			if (param) {
				param1 = -parseInt(param[0]);
			}
			if (!$e_isNumber(param1,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam1 = 360;
			if (!$e_isNumber(param1,true) || param1*(-1) > maxparam1) {
				param1 = maxparam1*(-1);
			}
			var lineWidth = height/20;
			ctx.beginPath();
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = 3;
			var startAngle = Math.PI;
			var endAngle = param1*Math.PI/180;
			ctx.arc(width/2, height/2, (height-margin)/2, startAngle, endAngle, false);
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
			ctx.arc(x, y, 1.5*lineWidth, 0, 2*Math.PI, false);
			ctx.fill();
			ctx.closePath()
		},
		"scale": function(ctx, width, height, param) {
			var margin = 15;
			var param1;
			var param2;
			if (param) {
				param1 = parseInt(param[0]);
				param2 = parseInt(param[1]);
			} else {
				param1 = 1;
				param2 = 1;
			}
			if (!$e_isNumber(param1,true) || !$e_isNumber(param2,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam1 = 2;
			if (!$e_isNumber(param1,true) || param1 > maxparam1) {
				param1 = maxparam1;
			}
			var maxparam2 = 2;
			if (!$e_isNumber(param2,true) || param2 > maxparam2) {
				param2 = maxparam2;
			}
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
			var margin = 15;
			if (param) {
				param = param[0];
			}
			if (param === undefined || param === "undefined" || param === "") {
				param = "true";
			}
			if (param === "true" || param === "false") {
				param = (param === "true");
			}
			if (!$e_isBoolean(param)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
				param = true;
			}
			ctx.font = ((param||param===undefined)?"bold ":"")+(height-margin*2)+"px Verdana";
      			ctx.fillStyle = (param||param===undefined)?'#000000':'#AAAAAA';
			ctx.fillText("B",margin,height-margin);
		},
		"setColor": function(ctx, width, height, param) {
			var margin = 15;
			if (param) {
				param = param[0];
			}
			if (param.indexOf('"') !== 0 && param.indexOf("'") !== 0) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
				param = '"#123456"';
			}
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.fillStyle = param.slice(1,param.length-1);
			ctx.strokeStyle = "#000000";
			ctx.moveTo(width/2,height/2);
			ctx.beginPath();
			ctx.arc(width/2, height/2, height/3, startAngle, endAngle, false);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		},
		"setSize": function(ctx, width, height, param) {
			var margin = 15;
			if (param) {
				param = parseInt(param[0]);
			}
			if (!$e_isNumber(param,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var maxparam = 20;
			if (!$e_isNumber(param,true) || param > maxparam*0.85) {
				param = maxparam*0.85;
			}
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
			var margin = 15;
			if (param) {
				param = param[0];
			}
			if (param.indexOf('"') !== 0) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
				param = "";
			}
			ctx.font = (height-margin*2)+"px "+(param?param:"sans-serif");
      			ctx.fillStyle = '#000000';
			ctx.fillText("F",margin,height-margin);
		},
		"setItalic": function(ctx, width, height, param) {
			var margin = 15;
			if (param) {
				param = param[0];
			}
			if (param === undefined || param === "undefined" || param === "") {
				param = "true";
			}
			if (param === "true" || param === "false") {
				param = (param === "true");
			}
			if (!$e_isBoolean(param)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
				param = true;
			}
			ctx.font = ((param||param===undefined)?"italic ":"")+(height-margin*2)+"px Verdana";
      			ctx.fillStyle = (param||param===undefined)?'#000000':'#AAAAAA';
			ctx.fillText("I",margin,height-margin);
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
		"snapshot": function(ctx, width, height, param) {
			var margin = 15;
			var separation = 4;
			ctx.lineWidth = 3;
			ctx.strokeStyle = '#000000';
			ctx.beginPath();
			ctx.moveTo(margin+separation,height/3-separation);
			ctx.lineTo(2*width/3+separation,height/3-separation);
			ctx.lineTo(2*width/3+separation,(height-margin)-separation);
			ctx.lineTo(margin+separation,(height-margin)-separation);
			ctx.closePath();
			ctx.stroke();
			ctx.fillStyle = '#222222';
			ctx.beginPath();
			ctx.moveTo(margin,height/3);
			ctx.lineTo(2*width/3,height/3);
			ctx.lineTo(2*width/3,height-margin);
			ctx.lineTo(margin,height-margin);
			ctx.closePath();
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
		"transparency": function(ctx, width, height, param) {
			var margin = 15;
			if (param) {
				param = param[0];
			}
			if (!$e_isNumber(param,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
				param = 0.5;
			}
			/*
			var grd=ctx.createRadialGradient(width/2,height/2,1,width/2,height/2,(height-margin*2)/1.5);
			grd.addColorStop(0,"rgba(0, 256, 256, "+param+")");
			grd.addColorStop(1,"#FFFF00");
			ctx.fillStyle=grd;
			ctx.fillRect(margin,margin,width-margin*2,height-margin*2);
			*/
			ctx.fillStyle = "#FF00FF";
			ctx.beginPath();
			ctx.moveTo(margin*1.2,margin*1.2);
			ctx.lineTo(width-margin*1.2,margin*1.2);
			ctx.lineTo(width-margin*1.2,height-margin*1.2);
			ctx.lineTo(margin*1.2,height-margin*1.2);
			ctx.closePath();
			ctx.fill();
			ctx.fillStyle = "rgba(0, 256, 256, "+param+")";
			ctx.beginPath();
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.arc(width/2, height/2, height/2-margin, startAngle, endAngle, false);
			ctx.closePath();
			ctx.fill();
		},
		"turnLeft": function(ctx, width, height, param) {
			var margin = 16;
			if (param) {
				param = parseInt(param[0]);
			} else {
				param = 275;
			}
			if (!$e_isNumber(param,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			} else if (param < 0) {
				this["turnRight"](ctx, width, height, [-param]);
				return;
			}
			var maxparam = 360;
			if (!$e_isNumber(param,true) || param > maxparam*0.85) {
				param = maxparam*0.85;
			}
			var startAngle = -1*param*Math.PI/180;
			var endAngle = Math.PI/180;
			var outerRadius = height/2-margin;
			var innerRadius = (height/2-margin)*(param/maxparam);
			var lineWidth = outerRadius-innerRadius;
			ctx.fillStyle = "#0000FF";
			ctx.beginPath();
			ctx.arc(width/2, height/2+margin/2, outerRadius, startAngle, endAngle, false);
			ctx.arc(width/2, height/2+margin/2, innerRadius, endAngle, startAngle, true);
			ctx.moveTo(width/2+outerRadius,height/2+margin/2);
			ctx.lineTo(width/2+outerRadius,height-margin);
			ctx.lineTo(width/2+innerRadius,height-margin);
			ctx.lineTo(width/2+innerRadius,height/2+margin/2);
			ctx.fill();
			ctx.closePath();
			ctx.fillStyle = "#0000FF";
			var COx, COy; // vector from center to origin
			COx = 0;
			COy = (margin+lineWidth/2)-height/2;
			var rotateAngle = -param*Math.PI/180;
			var x = width/2-Math.cos(rotateAngle)*COy+Math.sin(rotateAngle)*COx;
			var y = height/2+margin/2-Math.sin(rotateAngle)*COy-Math.cos(rotateAngle)*COx;
			ctx.save();
			ctx.translate(x,y);
			ctx.rotate(-1*Math.PI/180+rotateAngle);
			ctx.beginPath();
			ctx.moveTo(0-lineWidth,0);
			ctx.lineTo(0+lineWidth,0);
			ctx.lineTo(0,0-lineWidth);
			ctx.fill();
			ctx.restore();
		},
		"turnReset": function(ctx, width, height, param) {
			var margin = 16;
			if (param) {
				param = parseInt(param[0]);
			} else {
				param = 0;
			}
			param = $e_user2systemAngle(param);
			ctx.translate(width/2, height/2);
			ctx.rotate(param*Math.PI/180);
			ctx.translate(-width/2, -height/2);
			ctx.fillStyle = "#0000FF";
			ctx.beginPath();
			ctx.moveTo(width/2,margin);
			ctx.lineTo(width-margin,height/2);
			ctx.lineTo(width/2,height-margin);
			ctx.fill();
		},
		"turnRight": function(ctx, width, height, param) {
			var margin = 16;
			if (param) {
				param = parseInt(param[0]);
			} else {
				param = 90;
			}
			if (!$e_isNumber(param,true)) {
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			} else if (param < 0) {
				this["turnLeft"](ctx, width, height, [-param]);
				return;
			}
			var maxparam = 360;
			if ($e_isNumber(param,true) && param < 0) {
				param = 360 - param;
			}
			if (!$e_isNumber(param,true) || param > maxparam*0.85) {
				param = maxparam*0.85;
			}
			var startAngle = 180*Math.PI/180;
			var endAngle = (180+param)*Math.PI/180;
			var outerRadius = height/2-margin;
			var innerRadius = (height/2-margin)*(param/maxparam);
			var lineWidth = outerRadius-innerRadius;
			ctx.fillStyle = "#0000FF";
			ctx.beginPath();
			ctx.arc(width/2, height/2+margin/2, outerRadius, startAngle, endAngle, false);
			ctx.arc(width/2, height/2+margin/2, innerRadius, endAngle, startAngle, true);
			ctx.moveTo(width/2-outerRadius,height/2+margin/2);
			ctx.lineTo(width/2-outerRadius,height-margin);
			ctx.lineTo(width/2-innerRadius,height-margin);
			ctx.lineTo(width/2-innerRadius,height/2+margin/2);
			ctx.fill();
			ctx.closePath();
			ctx.fillStyle = "#0000FF";
			var COx, COy; // vector from center to origin
			COx = 0;
			COy = (margin+lineWidth/2)-height/2;
			var rotateAngle = (-90+param)*Math.PI/180;
			var x = width/2+Math.cos(rotateAngle)*COx-Math.sin(rotateAngle)*COy;
			var y = height/2+margin/2+Math.sin(rotateAngle)*COx+Math.cos(rotateAngle)*COy;
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
			var margin = 15;
			if (param) {
				param = param[0];
			}
  			ctx.strokeStyle = '#FFFFFF';
			ctx.rect(margin,margin,width-margin*2,height-margin*2);
			ctx.stroke();
			if (!$e_isNumber(param,true)) {
				var fontSize;
				var text;
				if (param == undefined || param == "") {
					fontSize = 20;
					text = _("New");
				} else if (param.charAt(0) === '"' && param.charAt(param.length-1) === '"') {
					param = param.substring(1,param.length-1);
					fontSize = 16;
					text = param;
				} else {
					fontSize = 12;
					text = _("variable");
				}
				ctx.font = fontSize+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(text,margin,height-margin);
			} else {
				ctx.font = "bold "+(height-margin*2)+"px Verdana";
	  			ctx.fillStyle = '#FFFFFF';
				ctx.fillText(param,margin,height-margin);
			}
		},
		"unsetBold": function(ctx, width, height, param) {
			var margin = 15;
			ctx.font = (height-margin*2)+"px Verdana";
      			ctx.fillStyle = '#AAAAAA';
			ctx.fillText("B",margin,height-margin);
		},
		"unsetColor": function(ctx, width, height, param) {
			var margin = 15;
			var startAngle = 0;
			var endAngle = 2*Math.PI;
			ctx.strokeStyle = "#000000";
			ctx.moveTo(width/2,height/2);
			ctx.beginPath();
			ctx.arc(width/2, height/2, height/3, startAngle, endAngle, false);
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
			var margin = 15;
			ctx.font = (height-margin*2)+"px "+"sans-serif";
      			ctx.fillStyle = '#AAAAAA';
			ctx.fillText("F",margin,height-margin);
		},
		"unsetItalic": function(ctx, width, height, param) {
			var margin = 15;
			ctx.font = (height-margin*2)+"px Verdana";
      			ctx.fillStyle = '#AAAAAA';
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
		"var" : function(ctx, width, height, param) {
			if (param) {
				param = param[0];
			}
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
			var minFontSize = 15;
			var maxFontSize = 15;
			var fontSize = (width-margin)*2/param.length;
			if (fontSize < minFontSize) {
				fontSize = minFontSize;
			}
			if (fontSize > maxFontSize) {
				fontSize = maxFontSize;
			};
			if (param.charAt(0) === '"' && param.charAt(param.length-1) === '"') {
				param = param.substring(1,param.length-1);
			}
			var margin = 15
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
			var literals = true;
			var param1, param2, param3, param4;
			if (param && param.length) {
				param1 = param[0];
				param2 = parseInt(param[1]);
				param3 = parseInt(param[2]);
				if (param[3] == undefined || param[3] == "" || param[3] == "undefined") {
					param4 = 0;
				} else if (!$e_isNumber(param[3],true)) {
					param4 = param[3];
					literals = false;
				} else {
					param4 = parseInt(param[3]);
				}
				if (!$e_isNumber(param2,true) || !$e_isNumber(param3,true)) {
					literals = false;
				}
				if (param1.charAt(0) === '"' && param1.charAt(param1-1) === '"') {
					param1 = param1.substring(1,param1.length-1);
				}
			}
			var margin = 15;
			var pos = {};
			var angle;
			if (literals) {
				var canvasSize = $_eseecode.whiteboard.offsetWidth;
				pos = $e_user2systemCoords({x: parseInt(param2), y: parseInt(param3)});
				pos.x = margin+(width-margin*2)*pos.x/canvasSize;
				pos.y = margin+(height-margin*2)*pos.y/canvasSize;
				angle = $e_user2systemAngle(param4)
			} else {
				pos = {x: width/2, y: height-margin};
				angle = 45;
				ctx.font = 12+"px Verdana";
				ctx.fillStyle = '#000000';
				ctx.fillText(_("variable"),margin,height);
			}
			var minFontSize = 15;
			var maxFontSize = 15;
			var fontSize = (width-margin)*2/param1.length;
			if (fontSize < minFontSize) {
				fontSize = minFontSize;
			}
			if (fontSize > maxFontSize) {
				fontSize = maxFontSize;
			}
			ctx.font = fontSize+"px Verdana";
  			ctx.fillStyle = '#FFFFFF';
			ctx.translate(pos.x,pos.y);
			ctx.rotate(angle*Math.PI/180);
			ctx.fillText(param1,0,0);
			ctx.rotate((-angle)*Math.PI/180);
			ctx.translate(-pos.x,-pos.y);
		}
	};