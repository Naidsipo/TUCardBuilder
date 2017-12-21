function loadXMLUnit() {
	var level, x, y, z, n;
	level = $("#xmlLevel")[0];
	x = "<root>" + $("#xmlStr").val() + "</root>";
	xmlUnit = str2XML(x);
	y = pathFinder("/root/unit[id][1]/upgrade", xmlUnit, true);
	z = y.length + 1;
	level.max = z;
	level.value = z;
	n = $("#unitNum")[0]
	y = pathFinder("/root/unit[id]", xmlUnit, true);
	z = y.length;
	n.max = z;
	n.value = 1;
}
function drawXML() {
	var l, c, canvas, ctx, reader, fileArray;
	l = $("#xmlLevel").val();
	n = $("#unitNum").val();
	c = new card();
	c.fillFromXML(pathFinder("/root/unit[id][" + n + "]", xmlUnit, false), l);
	//Canvas
	canvas = document.createElement("canvas");
	canvas.width = 160;
	canvas.height = 220;
	scanvas = document.createElement("canvas");
	scanvas.width = 80;
	scanvas.height = 110;
    ctx = canvas.getContext("2d");
	sctx = scanvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	sctx.clearRect(0, 0, canvas.width, canvas.height);
	//Picture
	fileArray = $("#getImageX")[0].files;
	if (fileArray.length > 0) {
		reader = new FileReader();
		reader.readAsDataURL(fileArray[0]);
		reader.onload = function() {
			var temp = new Image();
			temp.src = reader.result;
			temp.onload = function() {
				ctx.drawImage(this, 0, 0, 150, 125, 5, 20, 150, 125);
				drawCard(ctx, c);
				$("#bigCard")[0].src = canvas.toDataURL();
				sctx.drawImage(this, 0, 0, 150, 125, 2.5, 10, 75, 62.5);
				drawSmallCard(sctx, c);
				$("#smallCard")[0].src = scanvas.toDataURL();
				$("#idDisplay").html(c.card_id);
				$("#assetDisplay").html(c.asset_bundle);
				$("#picDisplay").html(c.picture);
				$("#statInLine").html(c.getAlt());
			};
		};
	} else {
		drawCard(ctx, c);
		$("#bigCard")[0].src = canvas.toDataURL();
		drawSmallCard(sctx, c);
		$("#smallCard")[0].src = scanvas.toDataURL();
		$("#idDisplay").html(c.card_id);
		$("#assetDisplay").html(c.asset_bundle);
		$("#picDisplay").html(c.picture);
		$("#statInLine").html(c.getAlt());
	}
}
function str2XML(s) {
	s = s.replace(/\n/g, "");
	s = s.replace(/\t/g, "");
	return $.parseXML(s);
}