var CARDSOURCES, TESTCARDS;

$(document).ready(function() {
	$.get("xml/cardSources.xml", function(data) {
		CARDSOURCES = data;
	}, "xml");
	//test start
	$.get("xml/testSheet.xml", function(data) {
		TESTCARDS = data;
		testBuilder = new XMLCardBuilder;
		//works fine now.
	}, "xml");
	//test end
});

function test(x) {
	console.log(x);
}

function pathFinderPlus(sheet, path, type = 0, node = sheet) {
	var nodes = sheet.evaluate(path, node, null, type, null);
	return nodes;
}

class Card {
	//Base constructor initializing the card to minimum values
	constructor(cardObject = {
			card_id:base_id, name:"", picture:"", asset_bundle:0,
			fusion_level:0, attack:0, health:1, cost:0, rarity:0, skills:[],
			type:1, level:1, maxLevel:level
		}) {
		this.card_id = cardObject.card_id;
		this.name = cardObject.name;
		this.picture = cardObject.picture;
		this.asset_bundle = cardObject.asset_bundle;
		this.fusion_level = cardObject.fusion_level;
		this.attack = cardObject.attack;
		this.health = cardObject.health;
		this.cost = cardObject.cost;
		this.rarity = cardObject.rarity;
		this.skills = cardObject.skills; //Skills have to be pushed from outside.
		this.type = cardObject.type;
		this.level = cardObject.level;
		this.maxLevel = cardObject.maxLevel;
	}
	getAlt() {
		var sLength, result;
		result = this.name + ":";
		result += this.attack + "/" + this.health + "/" + this.cost + " ";
		result += rarStr(this.rarity) + " " + facStr(this.type);
		if (!unitType(this.card_id) == "Assault") {
			result += " " + unitType(this.card_id);
		}
		result += ";"
		sLength = this.skill.length;
		for (var i = 0;i < sLength;++i) {
			if (i >= 1) {
				result += "/"
			}
			result += this.skill[i].skillText();
		}
		return result;
	}
	static unitType(id) {
		if ((1000 <= id && id < 2000) || (25000 <= id && id < 30000))
			return "Commander";
		else if ((2000 <= id && id < 3000) || (8000 <= id && id < 10000) || (17000 <= id && id < 25000))
			return "Structure";
		else if ((50000 <= id && id < 55000))
			return "Dominion";
		else
			return "Assault";
	}
	static rarStr(rarity) {
		switch (rarity) {
			case 1:
				return "Common";
			case 2:
				return "Rare";
			case 3:
				return "Epic";
			case 4:
				return "Legendary";
			case 5:
				return "Vindicator";
			case 6:
				return "Mythic";
			default://easier to notice something not good.
				return "Longshot";
		}
	}
	static facStr(type) {
		switch (type) {
			case 1:
				return "Imperial";
			case 2:
				return "Raider";
			case 3:
				return "Bloodthirsty";
			case 4:
				return "Xeno";
			case 5:
				return "Righteous";
			case 6:
				return "Progenitor";
			default://easier to notice something not good.
				return "Longshot";
		}
	}
}

class Skill {
	constructor(id = ""){
		this.id = id;
	}
	skillText(summonedName = "A Card") {
		var result = Skill.skillName(this.id);
		if (this.trigger) {
			result = "On " + Skill.triggerStr(this.trigger) + ": " + result;
		}
		if (this.all) {
			result += " All";
		}
		if (this.n) {
			result += " " + this.n;
		}
		if (this.y) {
			result += " " + Card.facStr(this.y);
		} else if (this.n && this.x) {
			result += " Assault";
		}
		if (this.s) {
			result += " " + Skill.skillName(this.s);
		}
		if (this.s2) {
			result += " to " + Skill.skillName(this.s2);
		}
		if (this.x) {
			result += " " + this.x;
		}
		if (this.card_id == "summon") {
			result += " " + summonedName;
		}
		if (this.c) {
			result += " every " + this.c;
		}
		return result;
	}
	static skillName(id) {
		var path = "/root/skillType[id=\"" + id + "\"]/name[1]";
		return pathFinderPlus(CARDSOURCES, path, 2).stringValue;
		//stringValue
	}
	static triggerStr(trigger) {
		switch (trigger) {
			case "play":
				return "Play";
			case "death":
				return "Death";
			case "attacked":
				return "Attacked";
			default:
				return "Longshot";
		}
	}
}

class XMLUnit {
	constructor(sheet, unitNode, desiredLevel = 0) {
		this.cards = [{}]
		this.isMade = false;
		this.make(sheet, unitNode)
		this.level = desiredLevel;
	}
	make(sheet, unitNode) {
		//For safety.
		if(this.isMade){
			this.unmake();
		}
		var temp = {
			card_id:0, name:"", picture:"", asset_bundle:0,
			fusion_level:0, attack:0, health:1, cost:0, rarity:0, skills:[],
			type:1, level:1, maxLevel:1
		};
		var path = "./*";
		do {
			var skillArray = [];
			var nodes = pathFinderPlus(sheet, path, 0, unitNode);
			var cur = nodes.iterateNext();
			while (cur) {
				if (cur.nodeType == 3 || cur.nodeType == 8) {
					continue;
				} else {
					switch (cur.nodeName) {
						case "id":
							this.base_id = Number(cur.textContent);
							temp.card_id = this.base_id;
							break;
						//these two are strings.
						case "name":
						case "picture":
							temp[cur.nodeName] = cur.textContent;
							break; 
						case "skill":
							skillArray.push(new XMLSkill(sheet, cur));
							break;
						case "upgrade":
							//no upgrade nodes in upgrade nodes, so this is fine.
							++temp.maxLevel;
							break;
						default:
							if (cur.textContent) {
								temp[cur.nodeName] = Number(cur.textContent);
							}
					}
				}
				cur = nodes.iterateNext();
			}
			if (skillArray.length > 0) {
				temp.skills = skillArray;
			}
			this.cards.push(new Card(temp));
			path = "./upgrade[level = " + (temp.level + 1) + "]/*";
		} while(temp.maxLevel > temp.level);
		this.isMade = true;
	}
	unmake() {
		delete this.cards;
		this.cards = [{}]
		this.isMade = false;
	}
	//Use this.card to get actual Card object. 
	get card() {
		return this.cards[this.cLevel];
	}//No setter for card, yet.
	//Use this.level for upgrade/downgrade.
	set level(value) {
		if (value < 0) {
			this.cLevel = 1;
		} else if (value == 0 || value > this.cards[1].maxLevel) {
			this.cLevel = this.cards[1].maxLevel;
		} else {
			this.cLevel = value;
		}
	}
	get level() {
		return this.cLevel;
	}
}

class XMLSkill extends Skill {
	constructor(sheet, skillNode) {
		var path = "@*";
		var attributes = pathFinderPlus(sheet, path, 0, skillNode);
		var x = attributes.iterateNext();
		while (x) {
			if (x.nodeName == "id") {
				super(x.nodeValue);
			} else {
				this[x.nodeName] = x.nodeValue;
			}
			x = attributes.iterateNext();
		}
	}
}

class XMLCardBuilder {
	constructor() {
		this.units = [];
		this.containers = [];
		if ($("div:empty").length) {
			$("div:empty")[0].attr("id", "CBIO");
		} else {
			$( "body" ).append("<div id='CBIO'></div>");
		} //Card Builder Input and Output.
		$("div#CBIO").append("<div id='CBO'></div>");
		$("div#CBIO").append("<div id='CBI'></div>");
		$("div#CBI").append("<textarea id='CBXSI' name='Input'></textarea>");
		//Card Builder XML String Input.
		//cannot use a method as onclick attribute :P
		var _this = this;
		//maybe a button is better? Not sure.
		//$("div#CBI").append("<input id='CBXRB' type='button' value='Read XML' />");
		$("#CBI #CBXSI")[0].addEventListener("focusout", function() {
			_this.units = [];
			//replace with $("#CBXSI").val() just in case using buttons.
			var data = this.value;
			if (data.search("<root>") == -1) {
				data = "<root>" + data;
			}
			if (data.search("</root>") == -1) {
				data = data + "</root>";
			}
			data = data.replace(/\n|\t/g, "");
			_this.sheet = $.parseXML(data);
			var path = "/root/unit[id]";
			var nodes = pathFinderPlus(_this.sheet, path, 0);
			var cur = nodes.iterateNext();
			var i = 0;
			while(cur) {
				_this.units.push(new XMLUnit(_this.sheet, cur));
				if(i < _this.containers.legnth) {
					_this.containers.push(new XMLBuilderBox);
				}
				cur = nodes.iterateNext();
				++i;
			}
		});
		//Print card with a button dedicated for it.
		$("div#CBI").append("<input id='CBXCP' type='button' value='Draw from XML' />");
		$("#CBI #CBXCP")[0].addEventListener("click", function() {
			for(var i = 0; i < _this.units.length; ++i) {
				_this.containers[i].draw(_this, _this.units[i].card);
			}
		});
	}
	drawUnit(ctx, xCard) {
		var path;
		ctx.font = "16pt Optimus";
		ctx.fillStyle = "white";
		
		path = "/root/style[type=" + xCard.type + " and rarity=" + xCard.rarity + "]/source[1]";
		this.drawFromSources(ctx, path, 0, 0, 160, 220);
		
		if (xCard.fusion_level) {
			path = "/root/frame[fusion_level='" + xCard.fusion_level + "']/source[1]"
			this.drawFromSources(ctx, path, 0, 0, 160, 220);
		}
		
		this.drawLevel(xCard, ctx);
		
		path = "/root/icon[name='icon_" + Card.unitType(xCard.card_id).toLowerCase() + "_common']/source[1]"
		this.drawFromSources(ctx, path, 2, 2, 24, 24);
		
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
		this.drawArialText(ctx, xCard.name, 35, 18, 120);
		this.drawArialText(ctx, Card.facStr(xCard.type), 10, 140, 140);
		this.drawSkill(ctx, xCard);
	}
	drawFromSources(ctx, path, dx, dy, dw, dh) {
		var obj, i, img, x, y;
		test(path);
		x = pathFinderPlus(CARDSOURCES, path).iterateNext();
		obj = {};
		for (i = 0; i < x.attributes.length; i++) {
			y = x.attributes[i];
			obj[y.nodeName] = y.nodeValue;
		}
		img = $("#" + obj.id)[0];
		ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height, dx, dy, dw, dh);
	}
	drawLevel(xCard, ctx, isSmall = false) {
		var fused, ml, hl, x, y, dxy;
		fused = (xCard.fusion_level > 0) ? 1 : 0;
		//max level
		ml = xCard.maxLevel;
		//half level
		hl = (ml > 6) ? Math.ceil(ml / 2):ml;
		x = (160 - 11 * hl) / 2;
		y = 205;
		dxy = 11;
		if (isSmall) {
			x /= 2;
			y /= 2;
			dxy /= 2;
		}
		var i = 0;
		for (i = 0; i < ml;i++) {
			//sort of linebreak at level hl + 1.
			if (i == hl) {
				x = (160 - 11 * (ml - hl)) / 2;
				y -= dxy;
				if (isSmall) {
					x /= 2;
				}
			}
			var filled = (i<xCard.level)?1:0;
			var path = "/root/icon[fused=" + fused + " and filled=" + filled + "]/source[1]"
			this.drawFromSources(ctx, path, x, y, dxy, dxy)
			x += dxy;
		}
	}
	drawArialText(ctx, str, dx, dy, maxWidth) {
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
	drawSkill(ctx, c, isSmall = false) {
		var i, path, l, x;
		l = Math.min(3, c.skills.length);
		for (i = 0;i < l;i++) {
			path = "/root/skillType[id='" + c.skills[i].id + "']/source[1]";
			if (isSmall) {
				this.drawFromSources(ctx, path, 8 + 24 * i, 76, 16, 16);
			} else {
				this.drawFromSources(ctx, path, 14, 148 + 16 * i, 16, 16);
				x = c.skills[i].skillText();
				this.drawArialText(ctx, x, 32, 160 + 16 * i, 115);
			}
		}
	}
}

class XMLBuilderBox {
	constructor() {
		//Basic container
		this.container = $("<div class='cardImage'></div>");
		$("div#CBO").append(this.container);
		//Actual image
		this.image_160 = $("<img src='' alt='Doge' class='card160' />");
		this.container.append(this.image_160);
		//Canvas
		this.canvas = $("<canvas width='160' height='220>'</canvas>");
		this.ctx = this.canvas[0].getContext("2d");
		this.ctx.clearRect(0, 0, this.canvas.attr("width"), this.canvas.attr("height"));
		var reader, file;
		//Picture
		this.fInput = $("<input type='file' class='imageFile' accept='image/*' />");
		this.container.append(this.fInput);
	}
	draw(parantBuilder, card) {
		var _this = this;
		var file;
		if (fileArray.length > 0) {
			file = this.fInput[0].files[0];
		} else {
			file = new File([], "resources\cogs.png");
		}
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function() {
			var temp = new Image();
			temp.src = reader.result;
			temp.onload = function() {
				_this.ctx.drawImage(this, 0, 0, 150, 125, 5, 20, 150, 125);
				parantBuilder.drawUnit(_this.ctx, card);
				_this.image_160[0].src = _this.canvas[0].toDataURL();
			};
		};
	}
}
