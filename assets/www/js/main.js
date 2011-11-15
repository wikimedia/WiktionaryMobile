var currentHistoryIndex = 0;
var currentLocale = new Object();
var defaultLocale = new Object();
// default locale info
defaultLocale.languageCode = removeCountryCode(navigator.language.toLowerCase());
defaultLocale.url = "http://" + defaultLocale.languageCode + ".m.wikipedia.org";

currentLocale.languageCode = defaultLocale.languageCode;
currentLocale.url = defaultLocale.url;

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
    
    loadContent();
    setActiveState();
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

function hideMobileLinks() {
    var frameDoc = $("#main")[0].contentDocument;
    $('#header', frameDoc).css('display', 'none');
    $('#footmenu', frameDoc).css('display', 'none');

    // Internal links
    $('a[href^="/wiki/"]', frameDoc).click(function(e) {
        showSpinner();
        $('#search').addClass('inProgress');
        currentHistoryIndex += 1;
    });

    // External links
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

function iframeOnLoaded(iframe) {
    if(iframe.src) {
        window.scroll(0,0);
        hideMobileLinks();
        toggleForward();
        addToHistory();
        $('#search').removeClass('inProgress');        
        hideSpinner();  
        console.log('currentHistoryIndex '+currentHistoryIndex + ' history length '+history.length);
    }
}

function loadContent() {
    // retrieve locale settings from LocalStorage - if it doesn't exist use the defaults!
    var settingsDB = new Lawnchair({name:"settingsDB"}, function() {
        this.get("locale", function(config) {
        
            if (config) {
                (config.value.url) ? currentLocale.url = config.value.url : currentLocale.url = defaultLocale.url;
                (config.value.languageCode) ? currentLocale.languageCode = config.value.languageCode : currentLocale.languageCode = defaultLocale.languageCode;
            }
            
            window.loadWikiContent();
        });
    });
}


function loadWikiContent() {
    showSpinner();
    $('#search').addClass('inProgress');
   
    // restore browsing to last visited page
    var historyDB = new Lawnchair({name:"historyDB"}, function() {
      this.all(function(history){
        if(history.length==0 || window.history.length > 1) {
            app.setRootPage(currentLocale.url);
        } else {
            app.setRootPage(history[history.length-1].value);
        }
      });
    });

}

function hideOverlays() {
    hideOverlayDivs();
    showContent();
}

function hideOverlayDivs() {
    $('#bookmarks').hide();
    $('#history').hide();
    $('#searchresults').hide();
    $('#settings').hide();
    $('#about').hide();
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
    }else{
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

function toggleForward() {
    currentHistoryIndex < window.history.length ?
    $('#forwardCmd').attr('disabled', 'false') :
    $('#forwardCmd').attr('disabled', 'true');
}

function goBack() {
    console.log('currentHistoryIndex '+currentHistoryIndex + ' history length '+history.length);

    if ($('#content').css('display') == "block") {
        currentHistoryIndex -= 1;
        $('#search').addClass('inProgress');
        window.history.go(-1);
        if(currentHistoryIndex <= 0) {
            console.log("no more history to browse exiting...");
            navigator.app.exitApp();
        }
    }

    if ($('#bookmarks').css('display') == "block" || $('#history').css('display') == "block" || 
        $('#searchresults').css('display') == "block" || $('#settings').css('display') == "block") {
        window.hideOverlayDivs();
        window.showContent();
    }
}

function goForward() {
    $('#search').addClass('inProgress');
    window.history.go(1);
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

function homePage() {
    showSpinner();
    var homeUrl = "http://" + currentLocale.languageCode + ".m.wikipedia.org";
    $('#main').attr('src', homeUrl); 
    currentHistoryIndex += 1;
}

function aboutPage() {
    showSpinner();
    var aboutUrl = "http://" + currentLocale.languageCode + ".wikipedia.org/w/index.php?title=Wikipedia:About&useformat=mobile";
    $('#main').attr('src', aboutUrl); 
    currentHistoryIndex += 1;
}
