window.geo = function() {

	function showNearbyArticles( args ) {
		var args = $.extend(
			{
				lat: 0,
				lon: 0,
				current: true
			},
			args
		);
		
		chrome.hideOverlays();
		chrome.hideContent();
		$("#nearby-overlay").localize().show();
		chrome.doFocusHack();
		
		if (!geo.map) {
			// Disable webkit 3d CSS transformations for tile positioning
			// Causes lots of flicker in PhoneGap for some reason...
			L.Browser.webkit3d = false;
			geo.map = new L.Map('map');
			//var tiles = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			var tiles = new L.TileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
				maxZoom: 18,
				subdomains: '1234', // for MapQuest tiles
				//attribution: 'Map data &copy; 2011 OpenStreetMap contributors'
				attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data &copy; 2012 OpenStreetMap contributors'
			});
			geo.map.addLayer(tiles);
		}

		// @fixme load last-seen coordinates
		geo.map.setView(new L.LatLng(args.lat, args.lon), 13);
		
		var findAndDisplayNearby = function( lat, lon ) {
			geoLookup( lat, lon, preferencesDB.get("language"), function( data ) {
				geoAddMarkers( data );
			}, function(err) {
				console.log(JSON.stringify(err));
			});
		};
		
		var ping = function() {
			var pos = geo.map.getCenter();
			findAndDisplayNearby( pos.lat, pos.lng );
		};
		
		if ( args.current ) {
			geo.map.on('viewreset', ping);
			geo.map.on('locationfound', ping);
			geo.map.on('moveend', ping);
			geo.map.locateAndSetView(13, {enableHighAccuracy: true});
		}
		else {
			findAndDisplayNearby( args.lat, args.lon );
		}
	}
	
	function getFloatFromDMS( dms ) {
		var multiplier = /[sw]/i.test( dms ) ? -1 : 1;
		var bits = dms.match(/[\d.]+/g);

		var coord = 0;
		
		for ( var i = 0, iLen=bits.length; i<iLen; i++ ) {
			coord += bits[i] / multiplier;
			multiplier *= 60;
		}
		
		return coord;
	}
	
	function addShowNearbyLinks() {
		$( 'span.geo-dms' ).each( function() { 
			var $coords = $( this ),
			lat = $coords.find( 'span.latitude' ).text(),
			lon = $coords.find( 'span.longitude' ).text();
			
			$coords.closest( 'a' ).attr( 'href', '#' ).click( function() {
				showNearbyArticles( {
					'lat': getFloatFromDMS( lat ),
					'lon': getFloatFromDMS( lon ),
					'current': false,
				} );				
			} );
		} );
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
				success(data);
			},
			error: error
		});
	}
	
	function geoAddMarkers( data ) {
		if (geo.markers) {
			geo.map.removeLayer(geo.markers);
		}
		geo.markers = new L.LayerGroup();
		$.each(data.geonames, function(i, item) {
			var url = item.wikipediaUrl.replace(/^([a-z0-9-]+)\.wikipedia\.org/, 'https://$1.m.wikipedia.org');
			var marker = new L.Marker(new L.LatLng(item.lat, item.lng));
			geo.markers.addLayer(marker);
			if(!item.summary) {
				item.summary = "";
			}
			marker.bindPopup('<div onclick="app.navigateToPage(&quot;' + url + '&quot;);chrome.hideOverlays();">' +
			                 '<strong>' + item.title + '</strong>' +
			                 '<p>' + item.summary + '</p>' +
			                 '</div>');
		});
		geo.map.addLayer(geo.markers);
	}
	
	return {
		showNearbyArticles: showNearbyArticles,
		addShowNearbyLinks: addShowNearbyLinks,
		markers: null,
		map: null
	};

}();
