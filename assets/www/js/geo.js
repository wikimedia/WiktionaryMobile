var geomap = false,
	geomarkers = false;

function getCurrentPosition() {
	chrome.hideOverlays();
	chrome.hideContent();
	$("#nearby-overlay").localize().show();
	chrome.doFocusHack();

	if (!geomap) {
		geomap = new L.Map('map');
		var tiles = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 18,
			attribution: 'Map data &copy; 2011 OpenStreetMap contributors'
		});
		geomap.addLayer(tiles);

		// @fixme load last-seen coordinates
		var lat = 0, lon = 0;
		geomap.setView(new L.LatLng(lat, lon), 13);
		var ping = function() {
			var pos = geomap.getCenter();
			geoLookup(pos.lat, pos.lng, preferencesDB.get("language"), function(data) {
				geoAddMarkers(data);
			}, function(err) {
				alert(err);
			});
		};
		
		geomap.on('viewreset', ping);
		geomap.on('locationfound', ping);
		geomap.on('moveend', ping);
	}

	geomap.locateAndSetView(13);
}

function geoLookup(latitude, longitude, lang, success, error) {
	var requestUrl = "http://ws.geonames.net/findNearbyWikipediaJSON?formatted=true&";
	requestUrl += "lat=" + latitude + "&";
	requestUrl += "lng=" + longitude + "&";
	requestUrl += "username=wikimedia&";
	requestUrl += "lang=" + lang;
	$.ajax({
		url: requestUrl,
		success: function(data) {
			success(JSON.parse(data));
		},
		error: error
	});
}

function geoAddMarkers(data) {
	if (geomarkers) {
		geomap.removeLayer(geomarkers);
		geomarkers = false;
	}
	geomarkers = new L.LayerGroup();
	$.each(data.geonames, function(i, item) {
		var url = item.wikipediaUrl.replace(/^([a-z0-9-]+)\.wikipedia\.org/, 'https://$1.m.wikipedia.org');
		var marker = new L.Marker(new L.LatLng(item.lat, item.lng));
		geomarkers.addLayer(marker);
		marker.bindPopup('<div onclick="app.navigateToPage(&quot;' + url + '&quot;);hideOverlays();">' +
		                 '<strong>' + item.title + '</strong>' +
		                 '<p>' + item.summary + '</p>' +
		                 '</div>');
	});
	geomap.addLayer(geomarkers);
}

