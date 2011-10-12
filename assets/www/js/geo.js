/**
TODO:
-get current position
-find articles near position
-plot the articles' position on map
-allow user to drill down on to the article from the map
*/
function getCurrentPosition()
{
  PhoneGap.exec(null, null, "NearMePlugin", "startNearMeActivity", []);
//	if (hasNetworkConnection())
//	{
//		showProgressLoader("Loading", "Retrieving content from Wikipedia");
//		navigator.geolocation.getCurrentPosition(onGetPositionSuccess, onGetPositionError);
//	}
//	else
//	{
//		noConnectionMsg();
//	}
}

function onGetPositionSuccess(position)
{
	getArticlesNearLocation(position.coords.latitude, position.coords.longitude);
}

function onGetPositionError(error)
{
	alert("code: " + error.code + "\nmessage: " + error.message);
}

function getArticlesNearLocation(lat, lng)
{
	if (hasNetworkConnection())
	{
		//getCurrentPosition();
	
		// TODO: call the service with the given position to get articles near current location
		var requestUrl = "http://ws.geonames.org/findNearbyWikipediaJSON?formatted=true&";
		requestUrl += "username=wikimedia&";
		requestUrl += "lat=" + lat + "&";
		requestUrl += "lng=" + lng + "&";
		requestUrl += "style=full";

		var xmlhttp;

		if (window.XMLHttpRequest)
  		{// code for IE7+, Firefox, Chrome, Opera, Safari
  			xmlhttp=new XMLHttpRequest();
  		}
		else
  		{// code for IE6, IE5
  			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  		}
	
		xmlhttp.onreadystatechange=function()
  		{
  			if (xmlhttp.readyState==4 && xmlhttp.status==200)
    		{
    			displayArticlesNearLocation(xmlhttp.responseText);
    		}
  		}

		//xmlhttp.setRequestHeader("User-Agent", "WikipediaMobile");
		xmlhttp.open("GET", requestUrl, true);
		xmlhttp.send();	
	}
	else
	{
		noConnectioinMsg();
	}
}

function displayArticlesNearLocation(results)
{
	hideProgressLoader();
	alert(JSON.stringify(results));
	console.log(JSON.stringify(results));
}

/*example code from iOS app

(void)fetchWikiPagesAtLocation:(NSString *)location {
	SBJSON *parser = [[SBJSON alloc] init];

	NSString *urlString = [NSString stringWithFormat:@"http://ws.geonames.org/wikipediaSearchJSON?formatted=true&q=%@&maxRows=10&style=full", location];
	NSLog(@"Loading: %@", urlString);

	NSURL *url = [NSURL URLWithString:urlString];
	NSURLRequest *request = [[NSURLRequest alloc] initWithURL:url];

	NSData *response = [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:nil];
	NSString *jsonString = [[NSString alloc] initWithData:response encoding:NSUTF8StringEncoding];

	NSMutableArray *items = [[parser objectWithString:jsonString error:nil] objectForKey:@"geonames"];

	NSLog(@"Got back %i items from geo service", [items count]);

	annotations = [[NSMutableArray alloc] init];

	CLLocationCoordinate2D newCenter = CLLocationCoordinate2DMake(0,0);

	for (NSDictionary *item in items) {
		AddressAnnotation *annotation;

		CLLocationCoordinate2D pointLocation;
		pointLocation.latitude = [[item valueForKey:@"lat"] floatValue];
		pointLocation.longitude = [[item valueForKey:@"lng"] floatValue];

		newCenter.latitude = [[item valueForKey:@"lat"] floatValue];
		newCenter.longitude = [[item valueForKey:@"lng"] floatValue];

		NSString *title = [item valueForKey:@"title"];
		NSString *subtitle = [item valueForKey:@"summary"];
		NSString *url = [item valueForKey:@"wikipediaUrl"];

		annotation = [[AddressAnnotation alloc] initWithCoordinate:pointLocation];
		annotation.title = title;
		annotation.subtitle = subtitle;
		annotation.mURL = url;
		[annotations addObject:annotation];
		[annotation release];
	}

	[mapView addAnnotations:annotations];
 	[mapView setCenterCoordinate:newCenter animated:NO];

	[jsonString release];
	[request release];
	[parser release];
	[tableView reloadData];
}

*/

function navigateToArticle()
{
	// TODO: load the article of the data point clicked
}
