var CARDSOURCES, DEFAULT150, FORM, CARD;

$(document).ready(function() {
	$.get("xml/cardSources.xml", function(data) {
		CARDSOURCES = data;
	}, "xml");
	DEFAULT150 = $("#default150")[0];
	FORM = document.forms["inputs"];
	CARD = new Card;
	
	var cardPictureManager = new imageManager("#cardPicture");
	
	$($(FORM["cardID"])).change(function() {
		CARD.card_id = parseInt(this.value);
		CARD.base_id = parseInt(this.value);
	});
	$(FORM["name"]).change(function() {
		CARD["name"] = this.value;
	});
	$("#pictureBtn").click(function() {
		$("#picture").click();
	});
	$(FORM["fusion_level"]).change(function() {
		CARD["fusion_level"] = parseInt(this.value);;
	});
	$(FORM["attack"]).change(function() {
		CARD["attack"] = parseInt(this.value);;
	});
	$(FORM["health"]).change(function() {
		CARD["health"] = parseInt(this.value);;
	});
	$(FORM["cost"]).change(function() {
		CARD["cost"] = parseInt(this.value);;
	});
	$(FORM["rarity"]).change(function() {
		CARD["rarity"] = parseInt(this.value);;
	});
	$(FORM["type"]).change(function() {
		CARD["type"] = parseInt(this.value);;
	});
	$(FORM["level"]).change(function() {
		CARD["level"] = parseInt(this.value);;
	});
	$(FORM["maxLevel"]).change(function() {
		$(FORM["level"]).attr("max", this.value);
		$(FORM["level"]).val(this.value);
		CARD["maxLevel"] = parseInt(this.value);
	});
	
	$("#inputs").change(function() {
		console.log(CARD);
		cardCanvas = $("<canvas width='160' height='220'></canvas>");
		cardCtx = cardCanvas[0].getContext("2d");
		cardCtx.clearRect(0, 0, 160, 220);
		
		cardCtx.drawImage(cardPictureManager.picture[0], 0, 0, 150, 125, 5, 20, 150, 125);
		drawUnit(cardCtx, CARD);
		$("#card160").attr("src", cardCanvas[0].toDataURL());
	});
	
	
});

function pathFinder(sheet, path, type = 0, node = sheet) {
	var nodes = sheet.evaluate(path, node, null, type, null);
	return nodes;
}

class imageManager {
	constructor(id) {
		//input with file type.
		this.pictureFile = $(id);
		//Picture that will be used for the card.
		this.picture = $("<img src='resources/cogs.png' />");
		
		//uploading file.
		var _this = this;
		
		this.pictureFile.change(function(){
			if (this.files.length > 0) {
				var file = this.files[0];
				var reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = function() {
					_this.picture.attr("src", reader.result);
				};
			}
		});
	}
}