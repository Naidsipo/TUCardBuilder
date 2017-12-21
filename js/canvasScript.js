function drawCard(ctx, c) {
	var path;
	ctx.font = "16pt Optimus";
	ctx.fillStyle = "white";
	
	path = "/root/style[type=" + c.type + " and rarity=" + c.rarity + "]/source[1]";
	drawFromSources(ctx, path, 0, 0, 160, 220);
	
	if (c.fusion_level) {
		path = "/root/frame[fusion_level='" + c.fusion_level + "']/source[1]"
		drawFromSources(ctx, path, 0, 0, 160, 220);
	}
	
	drawLevel(c, ctx, true);
	
	path = "/root/icon[name='icon_" + unitType(c.card_id).toLowerCase() + "_common']/source[1]"
	drawFromSources(ctx, path, 2, 2, 24, 24);
	
	if (c.cost) {
		path = "/root/icon[name='cost_container']/source[1]"
		drawFromSources(ctx, path, 120, 26, 32, 32);
		ctx.textAlign = "center";
		ctx.fillText(c.cost, 136, 49);
	}
	
	ctx.font="14pt Optimus";
	
	if (unitType(c.card_id) == "Assault") {
		if (c.attack == undefined) {
			c.attack = 0;
		}
		ctx.textAlign = "left";
		ctx.fillText(c.attack, 24, 215);
	} 
	
	if (c.health != undefined) {
		ctx.textAlign = "right";
		ctx.fillText(c.health, 136, 215);
	}
	
	ctx.font = "bold 8pt Arial"
	ctx.textAlign = "left"
	drawArialText(ctx, c.name, 35, 18, 120);
	drawArialText(ctx, facStr(c.type), 10, 140, 140);
	drawSkill(ctx, c, true);
}
function drawSmallCard(ctx, c) {
	var path;
	ctx.font = "8pt Optimus";
	ctx.fillStyle = "white";
	
	path = "/root/style[type=" + c.type + " and rarity=" + c.rarity + "]/source[1]";
	drawFromSources(ctx, path, 0, 0, 80, 110);
	
	if (c.fusion_level) {
		path = "/root/frame[fusion_level='" + c.fusion_level + "']/source[1]"
		drawFromSources(ctx, path, 0, 0, 80, 110);
	}
	
	drawLevel(c, ctx, false);
	
	path = "/root/icon[name='icon_" + unitType(c.card_id).toLowerCase() + "_common']/source[1]"
	drawFromSources(ctx, path, 1.5, 1.5, 11, 11);
	
	if (c.cost) {
		path = "/root/icon[name='cost_container']/source[1]"
		drawFromSources(ctx, path, 60, 13, 16, 16);
		ctx.textAlign = "center";
		ctx.fillText(c.cost, 68, 24.5);
	}
	
	ctx.font="7pt Optimus";
	
	if (unitType(c.card_id) == "Assault") {
		if (c.attack == undefined) {
			c.attack = 0;
		}
		ctx.textAlign = "left";
		ctx.fillText(c.attack, 12, 107.5);
	} 
	
	if (c.health != undefined) {
		ctx.textAlign = "right";
		ctx.fillText(c.health, 69, 107.5);
	}
	
	drawSkill(ctx, c, false);
}

function drawFromSources(ctx, path, dx, dy, dw, dh) {
	var obj, i, img, x, y;
	test(path);
	x = pathfinder(path, cardSources);
	obj = {};
	for (i = 0; i < x.attributes.length; i++) {
		y = x.attributes[i];
		obj[y.nodeName] = y.nodeValue;
	}
	img = $("#" + obj.id)[0];
	ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height, dx, dy, dw, dh);
}
function drawLevel(c, ctx, isBig) {
	var bool, img, ml, hl, x, y, i;
	bool = (c.fusion_level > 0);
	img = $("#cardSource")[0];
	ml = c.maxLevel;
	hl = (ml > 6) ? Math.ceil(ml / 2):ml;
	if (isBig) {
		x = (160 - 11 * hl) / 2;
		y = 205;
	} else {
		x = (160 - 11 * hl) / 4;
		y = 102.5;
	}
	for (i = 0; i < ml;i++) {
		if (i == hl) {
			if (isBig) {
				x = (160 - 11 * (ml - hl)) / 2;
				y -= 11;
			} else {
				x = (160 - 11 * (ml - hl)) / 4;
				y -= 5.5;
			}
		}
		if (isBig) {
			if (i < c.level) {
				ctx.drawImage(img, (bool) ? 1643:1632, 11, 11, 11, x, y, 11, 11);
			} else {
				ctx.drawImage(img, (bool) ? 1643:1632, 0, 11, 11, x, y, 11, 11);
			}
			x += 11;
		} else {
			if (i < c.level) {
				ctx.drawImage(img, (bool) ? 1643:1632, 11, 11, 11, x, y, 5.5, 5.5);
			} else {
				ctx.drawImage(img, (bool) ? 1643:1632, 0, 11, 11, x, y, 5.5, 5.5);
			}
			x += 5.5;
		}
	}
}
function drawArialText(ctx, str, dx, dy, maxWidth) {
	var x, postDy, lineBreakTest;
	x = 8,
	postDy = dy,
	lineBreakTest = false;
	do {
		ctx.font = 'bold ' + x + 'pt Arial';
		x--;
	} while (ctx.measureText(str).width > maxWidth && x > 4);
	postDy = dy;
	if (x == 4) {
		var y = Math.floor(str.length / 2),
		z = 0;
		ctx.font = 'bold 6pt Arial',
		lineBreakTest = true;
		for (var i = 0;i < y;i++) {
			if (str.charAt(y - i) == ' ') {
				z = y - i;
				break;
			} else if (str.charAt(y + i + 1) == ' ') {
				z = y + i + 1;
				break;
			}
		}
	} else {
		postDy += (x - 8) / 2;
	}
	if (lineBreakTest) {
		ctx.fillText(str.slice(0,z), dx, postDy - 4);
		ctx.fillText(str.slice(z+1,str.length), dx, postDy + 4);
	} else {
		ctx.fillText(str, dx, postDy);
	}
}
function drawSkill(ctx, c, isBig) {
	var i, path, l, x;
	l = Math.min(3, c.skill.length);
	for (i = 0;i < l;i++) {
		path = "/root/skillType[id='" + c.skill[i].id + "']/source[1]";
		if (isBig) {
			drawFromSources(ctx, path, 14, 148 + 16 * i, 16, 16);
			x = c.skill[i].skillText();
			drawArialText(ctx, x, 32, 160 + 16 * i, 115);
		} else {
			drawFromSources(ctx, path, 8 + 24 * i, 76, 16, 16);
		}
	}
}