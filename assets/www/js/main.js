function init() 
{
    document.addEventListener("deviceready", onDeviceReady, true);
    document.addEventListener("backbutton", function() {
      // insert code here
    }, false);
    document.addEventListener("searchbutton", function() {
      search();
    }, false);
}

function onDeviceReady()
{
	//hideOverlayDivs();
	//var currentDoc = document.location.href;
	//if (currentDoc.indexOf("index.html") > 0)
		loadContent();
}

function showProgressLoader(title, message)
{
	PhoneGap.exec(null, null, "IndeterminateProgress", "progressStart", [title, message]);
}

function hideProgressLoader()
{
	PhoneGap.exec(null, null, "IndeterminateProgress", "progressStop", []);
}

function hideMobileLinks()
{
	document.getElementById("main").contentDocument.getElementById("searchbox").style.display = "none";
	document.getElementById("main").contentDocument.getElementById("footmenu").style.display = "none";
}

function iframeOnLoaded()
{
	hideMobileLinks();
	addToHistory();
	hideProgressLoader();
	
	var docWidth = document.getElementById("main").contentDocument.width;
	
	if (docWidth < 330)
	{
		document.getElementById("main").horizontalscrolling = "no";
	}
	else
	{
		document.getElementById("main").horizontalscrolling = "yes";
	}
}

function loadContent() 
{
	if (hasNetworkConnection())
	{
		showProgressLoader("Loading", "Retrieving content from Wikipedia");
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
	//document.getElementById("searchbar").style.display = "none";
	document.getElementById("searchresults").style.display = "none";
}

function showContent()
{
	document.getElementById("mainHeader").style.display = "block";
	document.getElementById("content").style.display = "block";
}

function hideContent()
{
	document.getElementById("mainHeader").style.display = "none";
	document.getElementById("content").style.display = "none";
}

function checkLength()
{
	var searchTerm = document.getElementById("searchParam").value;
	console.log(searchTerm + " :: " + searchTerm.length);
	if (searchTerm.length > 0)
	{
		document.getElementById("clearSearch").style.display = "block";
	}
	else
	{
		document.getElementById("clearSearch").style.display = "none";
	}
}

function clearSearch()
{
	document.getElementById("searchParam").value = "";
	document.getElementById("clearSearch").style.display = "none";
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
