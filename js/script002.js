function drawUnit(ctx, xCard) {
	if(xCard) {
		var path;
		ctx.font = "16pt Optimus";
		ctx.fillStyle = "white";

		path = "/root/style[type=" + xCard.type + " and rarity=" + xCard.rarity + "]/source[1]";
		drawFromSources(ctx, path, 0, 0, 160, 220);

		if (xCard.fusion_level) {
			path = "/root/frame[fusion_level='" + xCard.fusion_level + "']/source[1]"
			this.drawFromSources(ctx, path, 0, 0, 160, 220);
		}

		drawLevel(xCard, ctx);

		path = "/root/icon[name='icon_" + Card.unitType(xCard.card_id).toLowerCase() + "_common']/source[1]"
		drawFromSources(ctx, path, 2, 2, 24, 24);

		if (xCard.cost) {
			path = "/root/icon[name='cost_container']/source[1]"
			this.drawFromSources(ctx, path, 120, 26, 32, 32);
			ctx.textAlign = "center";
			ctx.fillText(xCard.cost, 136, 49);
		}

		ctx.font="14pt Optimus";

		if (Card.unitType(xCard.card_id) == "Assault") {
			if (xCard.attack == undefined) {
				xCard.attack = 0;
			}
			ctx.textAlign = "left";
			ctx.fillText(xCard.attack, 24, 215);
		} 

		if (xCard.health != undefined) {
			ctx.textAlign = "right";
			ctx.fillText(xCard.health, 136, 215);
		}

		ctx.font = "bold 8pt Arial"
		ctx.textAlign = "left"
		drawArialText(ctx, xCard.name, 35, 18, 120);
		drawArialText(ctx, Card.facStr(xCard.type), 10, 140, 140);
		drawSkill(ctx, xCard);
	}
}
function drawFromSources(ctx, path, dx, dy, dw, dh) {
	var obj, i, img, x, y;
	//use this for maulal debugging with console.
	console.log(path);
	x = pathFinder(CARDSOURCES, path).iterateNext();
	obj = {};
	for (i = 0; i < x.attributes.length; i++) {
		y = x.attributes[i];
		obj[y.nodeName] = y.nodeValue;
	}
	img = $("#" + obj.id)[0];
	ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height, dx, dy, dw, dh);
}
function drawLevel(xCard, ctx, isSmall = false) {
	var fused, ml, hl, x, y, dxy;
	fused = (xCard.fusion_level > 0) ? 1 : 0;
	//max level
	ml = xCard.maxLevel;
	//half level
	hl = (ml > 6) ? Math.ceil(ml / 2) : ml;
	x = Math.floor((160 - 11 * hl) / 2);
	y = 205;
	dxy = 11;
	if (isSmall) {
		x = Math.floor(x / 2);
		y = Math.floor(y / 2);
		dxy = Math.floor(dxy / 2);
	}
	var i = 0;
	for (i = 0; i < ml;i++) {
		//sort of linebreak at level hl + 1.
		if (i == hl) {
			x = Math.floor((160 - 11 * (ml - hl)) / 2);
			y -= dxy;
			if (isSmall) {
				x = Math.floor(x / 2);
			}
		}
		var filled = (i<xCard.level) ? 1 : 0;
		var path = "/root/icon[fused=" + fused + " and filled=" + filled + "]/source[1]"
		this.drawFromSources(ctx, path, x, y, dxy, dxy)
		x += dxy;
	}
}
function drawArialText(ctx, str, dx, dy, maxWidth) {
	var x, wsIdX, postDy, isLong;
	x = 8,
	postDy = dy,
	isLong = false;
	do {
		ctx.font = 'bold ' + x + 'pt Arial';
		x--;
	} while (ctx.measureText(str).width > maxWidth && x > 4);
	postDy = dy;
	if (x == 4) {
		//whitespace index.
		wsIdX = 0;
		isLong = true;
		var sl = Math.floor(str.length / 2);
		for (var i = 0;i < sl;i++) {
			//start searching from middle.
			if (str.charAt(sl - i) == ' ') {
				wsIdX = sl - i;
				break;
			} else if (str.charAt(sl + i + 1) == ' ') {
				wsIdX = sl + i + 1;
				break;
			}
		}
	} else {
		postDy += (x - 8) / 2;
	}
	if (isLong) {
		ctx.font = 'bold 6pt Arial',
		ctx.fillText(str.slice(0, wsIdX), dx, postDy - 4);
		ctx.fillText(str.slice(wsIdX+1, str.length), dx, postDy + 4);
	} else {
		ctx.fillText(str, dx, postDy);
	}
}
function drawSkill(ctx, c, isSmall = false) {
	var i, path, l, x;
	l = Math.min(3, c.skills.length);
	for (i = 0;i < l;i++) {
		path = "/root/skillType[id='" + c.skills[i].id + "']/source[1]";
		if (isSmall) {
			drawFromSources(ctx, path, 8 + 24 * i, 76, 16, 16);
		} else {
			drawFromSources(ctx, path, 14, 148 + 16 * i, 16, 16);
			x = c.skills[i].skillText();
			drawArialText(ctx, x, 32, 160 + 16 * i, 115);
		}
	}
}
