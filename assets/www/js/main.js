function init() 
{
    document.addEventListener("deviceready", onDeviceReady, true);
}

function onDeviceReady()
{
	// some reason the android browser is not recognizing the style=block when set in the CSS
	// it only seems to recognize the style when dynamically set here or when set inline...
	// the style needs to be explicitly set for logic used in the backButton handler
	document.getElementById("content").style.display = "block";

    document.addEventListener("backbutton", onBackButton, false);
    document.addEventListener("searchbutton", onSearchButton, false);
    
	loadContent();
}

function onBackButton()
{
	if (document.getElementById("content").style.display == "block")
	{
		// this exits the app - not quite what we want...
		navigator.app.exitApp();
		// this is a phonegap 1.1.0 thing -> we need to update menu-plugin to be compatible with phonegap 1.1.0 
		//									 before using this
		//navigator.app.backHistory();
	}
	
	if (document.getElementById("bookmarks").style.display == "block" ||
		document.getElementById("history").style.display == "block" ||
		document.getElementById("searchresults").style.display == "block")
	{
		enableOptionsMenu();
		window.hideOverlayDivs();
		window.showContent();
	}
}

function onSearchButton()
{
	//hmmm...doesn't seem to set the cursor in the input field - maybe a browser bug???
	$('#searchParam').focus();
	
	plugins.SoftKeyBoard.show();
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
	var frameDoc = document.getElementById("main").contentDocument;
	frameDoc.getElementById("header").style.display = "none";
	frameDoc.getElementById("footmenu").style.display = "none";
	$('a.external, a.extiw', frameDoc).click(function(event) {
		var target = $(this).attr('href');

		// Stop the link from opening in the iframe...
		event.preventDefault();

		// And open it in parent context for reals.
		//
		// This seems to successfully launch the native browser, and works
		// both with the stock browser and Firefox as user's default browser
		document.location = target;
	});
}

function iframeOnLoaded()
{
	// scroll the page to the top after it loads
	window.scroll(0,0);
	hideMobileLinks();
	addToHistory();
	hideProgressLoader();
}

function loadContent() 
{
	if (hasNetworkConnection())
	{
		showProgressLoader(mw.message('spinner-loading').plain(),
		                   mw.message('spinner-retrieving', mw.message('sitename').plain()).plain());
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
	{
		document.getElementById(div).style.display = "none";
	}
	else
	{
		document.getElementById(div).style.display = "block";
	}
}

function hideOverlayDivs()
{
	document.getElementById("bookmarks").style.display = "none";
	document.getElementById("history").style.display = "none";
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

function disableOptionsMenu()
{	
	disableCommand('forward');
	disableCommand('add bookmark');
	
	PGMenuElement.update();
}

function disableCommand(commandToDisable)
{
	var commands = document.getElementsByTagName("command");

	for (var i=0;i<commands.length;i++)
	{
		if (commands[i].getAttribute('label').toLowerCase() == commandToDisable)
		{
			commands[i].setAttribute('disabled', 'true');
			return;
		}
	}
}

function enableOptionsMenu()
{
	var commands = document.getElementsByTagName("command");

	for (var i=0;i<commands.length;i++)
	{
		commands[i].setAttribute('disabled', 'false');
	}
	
	PGMenuElement.update();
}
