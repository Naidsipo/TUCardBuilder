class Card {
	//Constructor Start
	constructor(cardObject = {}) {
		for (var i = 0; i < Card.cardElements.length; ++i) {
			var index = Card.cardElements[i];
			if (cardObject[index]) {
				this[index] = cardObject[index];
			} else {
				if (index == "base_id" || index == "maxLevel") {
					this[index] = this[Card.cardElements[i - 1]];
				} else {
					this[index] = Card.baseCard[index];
				}
			}
		}
	}
	//Constructor End
	
	//getAlt Start
	getAlt() {
		var result, sLength;
		result = this.name + ":";
		result += this.attack + "/" + this.health + "/" + this.cost + " ";
		result += Card.rarStr(this.rarity) + " " + Card.facStr(this.type);
		if (!Card.unitType(this.card_id) == "Assault") {
			result += " " + Card.unitType(this.card_id);
		}
		result += ";"
		sLength = this.skills.length;
		for (var i = 0; i < sLength; ++i) {
			if (i >= 1) {
				result += "/"
			}
			result += this.skills[i].skillText();
		}
		return result;
	}
	//getAlt End
	
	//unitType Start
	/*
		Commander:[1000,2000),[25000,30000)
		Structure:[2000,3000),[8000,10000),[17000,25000)
		Dominion:[50000,55000)
		Assault:[1,1000),[3000,8000),[10000,17000),[30000,50000)
	*/
	static unitType(id) {
		if ((1000 <= id && id < 2000) || (25000 <= id && id < 30000)) {
			return "Commander";
		} else if ((2000 <= id && id < 3000) || (8000 <= id && id < 10000) || (17000 <= id && id < 25000)) {
			return "Structure";
		} else if ((50000 <= id && id < 55000)) {
			return "Dominion";
		} else {
			return "Assault";
		}
	}
	static rarStr(rarity) {
		switch (rarity) { //is very unlikely to be changed.
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
				return "Longshot";
		}
	}
	static facStr(type) {
		switch (type) { //is very unlikely to be changed.
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
			default:
				return "Longshot";
		}
	}
}

Card.cardElements = [
	"card_id", "base_id", "name", "picture", "asset_bundle", "fusion_level",
	"attack", "health", "cost", "rarity", "skills", "type", "level", "maxLevel"
];

Card.baseCard = {
	card_id: 1, base_id: 1, name: "", picture: "", asset_bundle: 0,
	fusion_level: 0, attack: 0, health: 1, cost: 0, rarity: 1, skills: [],
	type: 1, level: 1, maxLevel: 1
};

class Skill {
	constructor(id = "") {
		this.id = id;
	}
	//id can be used as whole string.
	
	skillText(summonedName = "Doge") {
		var result = Skill.skillName(this.id);
		if (result != this.id) {
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
		}
		return result;
	}
	
	static skillName(id) {
		var path = "/root/skillType[id=\"" + id + "\"]/name[1]";
		var result = pathFinder(CARDSOURCES, path, 2).stringValue;
		//stringValue
		return (result) ? result : id;
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
				return "Longshoted";
		}
	}
}

//Legacy code, not used for current version.
//Legacy code, not used for current version.
//Legacy code, not used for current version.

class XMLUnit {
	constructor(sheet, unitNode, desiredLevel = 0) {
		this.cards = [{}]
		this.isMade = false;
		this.make(sheet, unitNode)
		this.level = desiredLevel;
	}
	
	make(sheet, unitNode) {
		//For safety.
		if(this.isMade) {
			this.unmake();
		}
		var temp = {
			card_id: 1, base_id: 1, name: "", picture: "", asset_bundle: 0,
			fusion_level: 0, attack: 0, health: 1, cost: 0, rarity: 1, skills: [],
			type: 1, level: 1, maxLevel: 1
		};
		var path = "./*";
		do {
			var skillArray = [];
			var nodes = pathFinder(sheet, path, 0, unitNode);
			var cur = nodes.iterateNext();
			while (cur) {
				if (cur.nodeType == 3 || cur.nodeType == 8) {
					continue;
				} else {
					switch (cur.nodeName) {
						case "id": {
							temp.base_id = Number(cur.textContent);
							temp.card_id = temp.base_id;
							break;
						}
						//these two are strings.
						case "name":
						case "picture": {
							temp[cur.nodeName] = cur.textContent;
							break;
						}
						case "skill": {
							skillArray.push(new XMLSkill(sheet, cur));
							break;
						}
						case "upgrade": { //no upgrade nodes in upgrade nodes, so this is fine.
							++temp.maxLevel;
							break;
						}
						default: {
							if (cur.textContent) {
								temp[cur.nodeName] = Number(cur.textContent);
							}
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
		}
		while(temp.maxLevel > temp.level);
		
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
		var attributes = pathFinder(sheet, path, 0, skillNode);
		var x = attributes.iterateNext();
		while (x) {
			if (x.nodeName == "id") {
				super(x.nodeValue);
			} else if (x.nodeName == "s" || x.nodeName == "s2") {
				this[x.nodeName] = x.nodeValue;
			} else {
				this[x.nodeName] = Number(x.nodeValue);
			}
			x = attributes.iterateNext();
		}
	}
}