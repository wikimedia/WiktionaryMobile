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
}

if (platform == 'unknown') {
	// Assume we're a generic web browser.
	platform = 'web';
} else {
	includes.push('phonegap-1.3.0.js');
	var plugins = {
		android: [
			'menu/menu.android.js',
			'urlcache/URLCache.js',
			'softkeyboard/softkeyboard.js',
			'toast/phonegap-toast.js',
			'share/share.js',
			'cachemode/cachemode.js',
			'globalization/globalization.js'
		]
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
