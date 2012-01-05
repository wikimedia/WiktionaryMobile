var currentHistoryIndex = 0;

// Font options configuration
var fontOptions = {
	'smaller': '75%',
	'normal': '100%',
	'larger': '125%'
};

var pageHistory = [];

function init() {
	document.addEventListener("deviceready", onDeviceReady, true);
}

function onDeviceReady() {

	// some reason the android browser is not recognizing the style=block when set in the CSS
	// it only seems to recognize the style when dynamically set here or when set inline...
	// the style needs to be explicitly set for logic used in the backButton handler
	$('#content').css('display', 'block');

	// this has to be set for the window.history API to work properly
	PhoneGap.UsePolling = true;

	preferencesDB.initializeDefaults(function() { 
        app.baseURL = 'https://' + preferencesDB.get('language') + '.m.wikipedia.org';
		initLanguages();

        $(".titlebarIcon").bind('touchstart', function() {
            homePage();
            return false;
        });
        $("#searchForm").bind('submit', function() {
            search(false);
            return false;
        });
        $("#clearSearch").bind('touchstart', function() {
            clearSearch();
            return false;
        });

        app.initLinkHandlers();
        loadContent();
        setActiveState();
	});
}

function removeCountryCode(localeCode) {
	
	if (localeCode.indexOf("-") >= 0) {
		return localeCode.substr(0, localeCode.indexOf("-"));
	}
	
	if (localeCode.indexOf("_") >= 0) {
		return localeCode.substr(0, localeCode.indexOf("_"));
	}
	
	return localeCode;
}



function loadContent() {
	enableCaching();
	window.loadWikiContent();
}

function enableCaching() {
	// do nothing by default
}

function loadWikiContent() {
	showSpinner();
	$('#search').addClass('inProgress');
   
	// restore browsing to last visited page
	var historyDB = new Lawnchair({name:"historyDB"}, function() {
		this.all(function(history){
			if(history.length==0 || window.history.length > 1) {
				navigateToPage(app.baseURL);
			} else {
				navigateToPage(history[history.length-1].value);
			}
		});
	});

}

function hideOverlays() {
	hideOverlayDivs();
	showContent();
}

function hideOverlayDivs() {
	$('#savedPages').hide();
	$('#history').hide();
	$('#searchresults').hide();
	$('#settings').hide();
	$('#about').hide();
	$('#langlinks').hide();
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
		console.log(searchTerm);
		search(true);
	} else {
		$('#clearSearch').hide();
		hideOverlays();
	}
}

function clearSearch() {
	$('#searchParam').val('');
	$('#clearSearch').hide();
}

function noConnectionMsg() {
	alert("Please try again when you're connected to a network.");
}

function navigateToPage(url, options) {
	var options = $.extend({cache: false, updateHistory: true}, options || {});
	$('#searchParam').val('');
	$('#search').addClass('inProgress');
	showSpinner();
	
	if (options.cache) {
		app.setRootPage(url);
	} else {
		app.hideAndLoad(url);
	}
	if (options.updateHistory) {
		currentHistoryIndex += 1;
		pageHistory[currentHistoryIndex] = url;
	}
	console.log("navigating to " + url);
	var bookmarksDB = new Lawnchair({name: "bookmarksDB"}, function() {
		this.exists(url, function(exists) {
			if(!exists) {
				$("#savePageCmd").attr("disabled", "false");
			} else {
				$("#savePageCmd").attr("disabled", "true");
			}
		});
	});
	// Enable change language - might've been disabled in a prior error page
	console.log('enabling language');
	$('#languageCmd').attr('disabled', 'false');  
}

function toggleForward() {
	currentHistoryIndex < pageHistory.length ?
	$('#forwardCmd').attr('disabled', 'false') :
	$('#forwardCmd').attr('disabled', 'true');
}

function goBack() {
	console.log('currentHistoryIndex '+currentHistoryIndex + ' history length '+pageHistory.length);

	if ($('#content').css('display') == "block") {
		// We're showing the main view
		currentHistoryIndex -= 1;
		$('#search').addClass('inProgress');
		// Jumping through history is unsafe with the current urlCache system
		// sometimes we get loaded without the fixups, and everything esplodes.
		//window.history.go(-1);
		if(currentHistoryIndex <= 0) {
			console.log("no more history to browse exiting...");
			navigator.app.exitApp();
		} else {
			console.log('going back to item ' + currentHistoryIndex + ': ' + pageHistory[currentHistoryIndex]);
			navigateToPage(pageHistory[currentHistoryIndex], {
				updateHistory: false
			});
		}
	} else {
		// We're showing one of the overlays; cancel out of it.
		window.hideOverlayDivs();
		window.showContent();
	}
}

function goForward() {
	$('#search').addClass('inProgress');
	//window.history.go(1);
	if (currentHistoryIndex < pageHistory.length) {
		navigateToPage(pageHistory[++currentHistoryIndex], {
			updateHistory: false
		});
	}
}

function lightweightNotification(text) {
	alert(text);
}

function hasNetworkConnection() 
{
	return window.navigator.onLine;
}

function setActiveState() {
	var applicableClasses = [
		'.deleteButton',
		'.listItem',
		'#search',
		'.closeButton',
		'.titlebarIcon'
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

function homePage() {
	navigateToPage(app.baseURL);
}

function aboutPage() {
	var aboutUrl = app.baseURL + "/w/index.php?title=Wikipedia:About&useformat=mobile";
	navigateToPage(aboutUrl);
}

function currentPageUrl() {
	return pageHistory[currentHistoryIndex];
}

function currentPageTitle() {
	var url = currentPageUrl(),
		page = url.replace(/^https?:\/\/[^\/]+\/wiki\//, ''),
		unescaped = decodeURIComponent(page),
		title = unescaped.replace(/_/g, ' ');
	return title;
}
