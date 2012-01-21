// Android stuff

// @todo migrate menu setup in here?

// @Override
// navigator.lang always returns 'en' on Android
// use the Globalization plugin to request the proper value
l10n.navigatorLang = function(success) {
	var lang = navigator.language;

	var glob = new Globalization;
	glob.getLocaleName(function(result) {
		lang = result.value.toLowerCase().replace('_', '-');
		//console.log('globalization gave: ' + lang);
		success(lang);
	}, function(err) {
		//console.log('globalization error: ' + err);
		success(null);
	});
}


chrome.addPlatformInitializer(function() {
	$('html').addClass('android');
	if (navigator.userAgent.match(/Android 2\./)) {
		// Android 2.2/2.3 doesn't do overflow:scroll
		// so we need to engage alternate styles for phone view.
		$('html').removeClass('goodscroll').addClass('badscroll');
	}

    document.addEventListener("backbutton", onBackButton, false);
    document.addEventListener("searchbutton", onSearchButton, false);

	function onBackButton() {
		chrome.goBack();
	}

	function onSearchButton() {
		//hmmm...doesn't seem to set the cursor in the input field - maybe a browser bug???
		$('#searchParam').focus().addClass('active');
		plugins.SoftKeyBoard.show();
	}

});


function selectText() {
    PhoneGap.exec(null, null, 'SelectTextPlugin', 'selectText', []);
}

function sharePage() {
	// @fixme if we don't have a page loaded, this menu item should be disabled...
	var title = app.getCurrentTitle(),
		url = app.getCurrentUrl().replace(/\.m\.wikipedia/, '.wikipedia');
	window.plugins.share.show(
		{
			subject: title,
			text: url
		}
	);
}

chrome.showNotification = function(text) {
	// Using PhoneGap-Toast plugin for Android's lightweight "Toast" style notifications.
	// https://github.com/m00sey/PhoneGap-Toast
	// http://developer.android.com/guide/topics/ui/notifiers/toasts.html
	window.plugins.ToastPlugin.show_short(text);
}

function updateMenuState(menu_handlers) {
	$('#appMenu command').each(function() {
		var $command = $(this),
			id = $command.attr('id'),
			msg = 'menu-' + id.replace(/Cmd$/, ''),
			label = mw.message(msg).plain();
		$command.attr('label', label);
	});

	window.plugins.SimpleMenu.loadMenu($('#appMenu')[0],
									   menu_handlers,
									   function(success) {console.log(success);},
									   function(error) {console.log(error);});
};

network.isConnected = function()  {
	return navigator.network.connection.type == Connection.NONE ? false : true;
}

//@Override
app.setCaching = function(enabled) {
	console.log('inside the caching thing');
	if(enabled) {
		window.plugins.CacheMode.setCacheMode('LOAD_CACHE_ELSE_NETWORK');
	} else {
		window.plugins.CacheMode.setCacheMode('LOAD_DEFAULT');
	}
}

//@Override
function getCurrentPosition() {
	PhoneGap.exec(geoNameSuccess, geoNameFailure, "NearMePlugin", "startNearMeActivity", [preferencesDB.get('language')]);
}

function geoNameSuccess(wikipediaUrl) {
	if(wikipediaUrl) {
		$('#search').addClass('inProgress');
		$.ajax({url: "https://en.m.wikipedia.org",
			success: function(data) {
				if(data) {
					app.navigateToPage('https://'+wikipediaUrl)
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
}

function geoNameFailure(error) {
	console.log(error);
	alert('Google Maps service is not available on this device.');
}
