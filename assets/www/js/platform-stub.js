(function() {

/**
 * Synchronously load relevant platform PhoneGap scripts during startup.
 */

// Is there a way that PhoneGap can more reliably identify its presence and platform before deviceready?
var platform = 'unknown',
	includes = ['platform.js'],
	ua = navigator.userAgent;

if (ua.match(/; Android /)) {
	// Mozilla/5.0 (Linux; U; Android 2.3.6; en-us; Nexus One Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1
	platform = 'android';
} else if (ua.match(/\((iPhone|iPod|iPad)/)) {
	// Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Mobile/8H7
	platform = 'ios';
} else if (ua.match(/PlayBook; /)) {
    // Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.0.0; en-US) AppleWebKit/535.1+ (KHTML, like Gecko) Version/7.2.0.0 Safari/535.1+
    platform = 'playbook';
} else if (ua.match(/BlackBerry/)) {
    //Mozilla/5.0 (BlackBerry; U; BlackBerry AAAA; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/X.X.X.X Mobile Safari/534.11+
    platform = 'blackberry'
} else if (ua.match(/Windows Phone OS/)) {
	// Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; Microsoft; XDeviceEmulator)
	platform = 'winphone';
}
var detectorClasses = [];

if(platform === 'ios') {
	detectorClasses.push('iOS');
	if(ua.match(/OS 4/)) {
		detectorClasses.push('iOS-4');
	} else if(ua.match(/OS 5/)) {
		detectorClasses.push('iOS-5');
	}
}

if(platform === 'android') {
	detectorClasses.push('android');
	if(ua.match(/Android 2/)) { 
		detectorClasses.push('android-2');
	} else if(ua.match(/Android 3/)) {
		detectorClasses.push('android-3');
	} else if(ua.match(/Android 4/)) {
		detectorClasses.push('android-4');
	}
}

$('html').addClass(detectorClasses.join(' '));

if (platform == 'unknown') {
	// Assume we're a generic web browser.
	platform = 'web';
} else {
	includes.push('phonegap-1.4.1.js');
	var plugins = {
		android: [
			'menu/menu.android.js',
			'urlcache/URLCache.js',
			'softkeyboard/softkeyboard.js',
			'toast/phonegap-toast.js',
			'share/share.js',
			'cachemode/cachemode.js',
			'webintent/webintent.js',
			'globalization/globalization.js',
			'preferences/preferences.js'
		],
		ios: [
			'ActionSheet.js',
			'TwitterPlugin.js',
			'pg-plugin-fb-connect.js',
			'facebook_js_sdk.js',
			'ReadItLaterPlugin.js'
		],
	};
	if (platform in plugins) {
		$.each(plugins[platform], function(i, path) {
			includes.push('plugins/' + path);
		})
	}
}

function includePlatformFile(name) {
	var path = platform + '/' + name,
		line = '<script type="text/javascript" charset="utf-8" src="' + path + '"></script>';
	document.writeln(line);
}

$.each(includes, function(i, path) {
	includePlatformFile(path);
});

})();
