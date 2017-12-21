function card() {
	this.unique_id = 0;
	this.name = "";
	this.fusion_level = 0;
	this.attack = 0;
	this.health = 0;
	this.cost = 0;
	this.rarity = 1;
	this.skill = [];
	this.type = 1;
	this.level = 1;
	this.maxLevel = 1;
	this.fillFromXML = function(u, l) {
		var i, x;
		x = u.getElementsByTagName("upgrade");
		this.getStatFromXMLNode(u);
		if (l == 1) {
			this.card_id = this.unique_id;
		} else {
			for (i = 0; i < l - 1; i++) {
				this.getStatFromXMLNode(x[i]);
			}
		}
		if (x.length == 0) {
			this.maxLevel = 1;
		} else {
			this.maxLevel = x.length + 1;
		}
	}
	this.getStatFromXMLNode = function(n) {
		var i, s, x, y;
		s = [];
		for (i = 0; i < n.childNodes.length; i++) {
			x = n.childNodes[i];
			if (x.nodeType == 3 || x.nodeType == 8) {
				continue;
			} else {
				switch (x.nodeName) {
					case "upgrade":
						break;
					case "id":
						this["unique_id"] = Number(x.firstChild.nodeValue);
						break; 
					case "name":
					case "picture":
						this[x.nodeName] = String(x.firstChild.nodeValue);
						break; 
					case "skill":
						y = new skill();
						y.fillFromXMLNode(x);
						s.push(y);
						break; 
					default:
						if (x.nodeType == 3) {
							continue;
						}
						this[x.nodeName] = Number(x.firstChild.nodeValue);
				}
			}
			if (s.length > 0) {
				this.skill = s;
			}
		}
	}
	this.getAlt = function() {
		var i, l, result;
		result = this.name + ":";
		result += this.attack + "/" + this.health + "/" + this.cost + " ";
		result += rarStr(this.rarity) + " " + facStr(this.type);
		if (!unitType(this.card_id) == "Assault") {
			result += " " + unitType(this.card_id);
		}
		result += ";"
		l = this.skill.length;
		for (i = 0;i < l;i++) {
			if (i >= 1) {
				result += "/"
			}
			result += this.skill[i].skillText();
		}
		return result;
	}
}
function skill() {
	this.fillFromXMLNode = function(n) {
		var i = 0, x;
		for (i = 0; i < n.attributes.length; i++) {
			x = n.attributes[i];
			this[x.nodeName] = x.nodeValue;
		}
	}
	this.skillText = function() {
		var t;
		t = skillName(this.id);
		if (this.trigger) {
			t = "On " + triggerStr(this.trigger) + ": " + t;
		}
		if (this.all) {t += " All";}
		if (this.n) {t += " " + this.n;}
		if (this.y) {
			t += " " + facStr(this.y);
		} else if (this.n && this.x) {
			t += " Assault";
		}
		if (this.s) {t += " " + skillName(this.s);}
		if (this.s2) {t += " to " + skillName(this.s2);}
		if (this.x) {t += " " + this.x;}
		if (this.card_id) {t += " " + $("#summonedName").val();}
		if (this.c) {t += " every " + this.c;}
		return t;
	}
}
function skillName(id) {
	var path = "/root/skillType[id=\"" + id + "\"]/name[1]";
	return pathfinder(path, cardSources).firstChild.nodeValue;
}
function unitType(id) {
	if ((1000 <= id && id < 2000) || (25000 <= id && id < 30000)) {
		return "Commander";
	} else if ((2000 <= id && id < 3000) || (8000 <= id && id < 10000) ||
	(17000 <= id && id < 25000)) {
		return "Structure";
	} else if ((50000 <= id && id < 55000)){
		return "Dominion";
	} else {
		return "Assault";
	}
}
function rarStr(x) {
	switch (x) {
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
		default:
			return "Common";
	}
}
function triggerStr(x) {
	switch (x) {
		case "play":
			return "Play";
		case "death":
			return "Death";
		case "attacked":
			return "Attacked";
		default:
			return "Wat";
	}
}
function facStr(x) {
	var path, f;
	path = "/root/unitType[id=" + x + "]/name[1]";
	f = pathfinder(path, cardSources).firstChild.nodeValue;
	if (!f) {
		f = "Imperial";
	}
	return f;
}