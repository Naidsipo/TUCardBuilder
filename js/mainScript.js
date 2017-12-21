var cardSources, xmlUnit, strictCard;

$(document).ready(function() {
	$.get("xml/cardSources.xml", function(data) {
		cardSources = data;
	}, "xml");
});

function pathfinder(p, x) {
	var result = x.evaluate(p, x, null, 0, null).iterateNext();
	return result;
}
function pathFinder(p, x, y) {
	var nodes = x.evaluate(p, x, null, 0, null),
	result = nodes.iterateNext();
	if (y) {
		var arr = [];
		while (result) {
			arr.push(result);
			result = nodes.iterateNext();
		}
		result = arr;
	}
	return result;
}
function test(x) {
	console.log(x);
}