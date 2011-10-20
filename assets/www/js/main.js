var currentHistoryIndex = 0;

function init() {
    document.addEventListener("deviceready", onDeviceReady, true);
}

function onDeviceReady() {
	// some reason the android browser is not recognizing the style=block when set in the CSS
	// it only seems to recognize the style when dynamically set here or when set inline...
	// the style needs to be explicitly set for logic used in the backButton handler
	document.getElementById("content").style.display = "block";

    document.addEventListener("backbutton", onBackButton, false);
    document.addEventListener("searchbutton", onSearchButton, false); 
    
    // this has to be set for the window.history API to work properly
    PhoneGap.UsePolling = true;
    
	loadContent();
	setActiveState();
}

function onBackButton()
{
	if ($('#content').css('display') == "block") {
	   // decrement by 2 since the onLoad of the content in the iframe always increments
	   currentHistoryIndex -= 2;
		window.history.go(-1);
	}

	if ($('#bookmarks').css('display') == "block" || $('#history').css('display') == "block" || $('#searchresults').css('display') == "block") {
		window.hideOverlayDivs();
		window.showContent();
	}
}

function onSearchButton() {
	//hmmm...doesn't seem to set the cursor in the input field - maybe a browser bug???
	$('#searchParam').focus();
	plugins.SoftKeyBoard.show();
}

function showProgressLoader(title, message) {
	PhoneGap.exec(null, null, "IndeterminateProgress", "progressStart", [title, message]);
}

function hideProgressLoader() {
	PhoneGap.exec(null, null, "IndeterminateProgress", "progressStop", []);
}

function hideMobileLinks() {
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

function iframeOnLoaded() {
	// scroll the page to the top after it loads
	window.scroll(0,0);
	hideMobileLinks();
	currentHistoryIndex += 1;
	toggleForward();
	addToHistory();
  $('#search').removeClass('inProgress');
	//hideProgressLoader();
}

function loadContent() 
{
	if (hasNetworkConnection())
	{
//		showProgressLoader(mw.message('spinner-loading').plain(),
//		                   mw.message('spinner-retrieving', mw.message('sitename').plain()).plain());
    $('#search').addClass('inProgress');
    $.ajax({url: "http://en.m.wikipedia.org",
            success: function(data) {
              if(data) {
                $('#main').attr('src', 'http://en.m.wikipedia.org');
              } else {
                noConnectionMsg();
                navigator.app.exitApp();
              }
            },
            error: function(xhr) {
              noConnectionMsg();
            },
            timeout: 3000
         });
	}
	else
	{
		noConnectionMsg();
	}
}

function hideOverlayDivs() {
	$('#bookmarks').hide();
	$('#history').hide();
	$('#searchresults').hide();
	$('#settings').hide();
}

function showContent() {
	$('#mainHeader').show();
	$('#content').show();
}

function hideContent() {	
	$('#mainHeader').hide();
	$('#content').hide();
}

function checkLength() {
	var searchTerm = $('#searchParam').val();
	
	if (searchTerm.length > 0) {
		$('#clearSearch').show();
	}else{
		$('#clearSearch').hide();
	}
}

function clearSearch() {
	$('#searchParam').val('');
	$('#clearSearch').hide();
}

function noConnectionMsg() {
	alert("Please try again when you're connected to a network.");
}

function toggleForward() {
    if (currentHistoryIndex < window.history.length) {
        enableCommand('forward');
    }else{
        disableCommand('forward'); 
    }
    PGMenuElement.update();
}

function goForward() {
    window.history.go(1);
}

function disableCommand(commandToDisable) {
    var commands = document.getElementsByTagName("command");

    for (var i=0;i<commands.length;i++) {
        if (commands[i].getAttribute('label').toLowerCase() == commandToDisable) {
            commands[i].setAttribute('disabled', 'true');
            return;
        }
    }
}

function enableCommand(commandToEnable) {
    var commands = document.getElementsByTagName("command");

    for (var i=0;i<commands.length;i++) {
        if (commands[i].getAttribute('label').toLowerCase() == commandToEnable) {
            commands[i].setAttribute('disabled', 'false');
            return;
        }
    }
}

function hasNetworkConnection() 
{
    return navigator.network.connection.type == Connection.NONE ? false : true;
}

function setActiveState() {
	var applicableClasses = [
		'.deleteButton',
		'.listItem',
		'#search',
		'.closeButton'
	];
	
	for (var key in applicableClasses) {
		applicableClasses[key] += ':not(.activeEnabled)';
	}
	console.log(applicableClasses);
	function onTouchEnd() {
		$('.active').removeClass('active');
		$('body').unbind('touchend', onTouchEnd);
		$('body').unbind('touchmove', onTouchEnd);
	}
	
	function onTouchStart() {		
		$(this).addClass('active');
		$('body').bind('touchend', onTouchEnd);
		$('body').bind('touchmove', onTouchEnd);
	}
	
	setTimeout(function() {
		$(applicableClasses.join(',')).each(function(i) {
			$(this).bind('touchstart', onTouchStart);
			$(this).addClass('activeEnabled');
		});
	}, 500);
}
