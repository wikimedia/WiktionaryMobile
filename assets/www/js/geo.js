/**
TODO:
-get current position
-find articles near position
-plot the articles' position on map
-allow user to drill down on to the article from the map
*/

function getCurrentPosition()
{
	navigator.geolocation.getCurrentPosition(onGetPositionSuccess, onGetPositionError);
}

function onGetPositionSuccess(position)
{
	console.log("onGetPositionSuccess");
	alert("onGetPositionSuccess");
/*
	var markup = "latitude: " + position.coords.latitude + "\n";
	markup += "longitude: " + position.coords.longitdue + "\n";
	markup += "altitude: " + position.coords.altitude + "\n";
	markup += "accuracy: " + position.coords.accuracy + "\n";
	markup += "heading: " + position.coords.heading + "\n";
	markup += "speed: " + position.coords.speed + "\n";
	
	alert(markup);
	*/
}

function onGetPositionError(error)
{
	alert("code: " + error.code + "\nmessage: " + error.message);
}

function getArticlesNearLocation()
{
}

function navigateToArticle()
{
}
