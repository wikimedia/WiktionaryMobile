function init() 
{
    // the next line makes it impossible to see Contacts on the HTC Evo since it
    // doesn't have a scroll button
    // document.addEventListener("touchmove", preventBehavior, false);  
    document.addEventListener("deviceready", onDeviceReady, true);
}

function onDeviceReady()
{
	loadContent();
}

function loadContent() 
{
	if (hasNetworkConnection())
	{
		document.getElementById("main").src = "http://en.m.wikipedia.org";
	}
	else
	{
		noConnectionMsg();
	}
}

function toggleDiv(div)
{
	var display = document.getElementById(div).style.display;
	
	if (display == "block")
		document.getElementById(div).style.display = "none";
	else
		document.getElementById(div).style.display = "block";
}

function hideOverlayDivs()
{
	document.getElementById("bookmarks").style.display = "none";
	document.getElementById("history").style.display = "none";
	document.getElementById("searchbar").style.display = "none";
}

function noConnectionMsg()
{
	alert("Please try again when you're connected to a network.");
}

function hasNetworkConnection() 
{
    var networkState = navigator.network.connection.type;
	
	/*
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

	//alert('Connection type: ' + states[networkState]);
	*/
	
	if (networkState == Connection.NONE)
	{
		return false;
	}
	else
	{
		return true;
	}
	
}
