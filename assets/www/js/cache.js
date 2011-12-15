function Application() {}

Application.prototype.setRootPage = function(url) {
	// Hide the iframe until the stylesheets are loaded,
	// to avoid flash of unstyled text.
	$('#main').hide();
	var replaceRes = function() {

		var frameDoc = $("#main")[0].contentDocument;
		// links rel
		var linkCount = 0;
		$('link', frameDoc).each(function() {
			linkCount++;
			var em = $(this);
			var gotLinkPath = function(linkPath) {
				em.attr('href', linkPath.file);
				linkCount--;
				if (linkCount == 0) {
					setTimeout(function() {
						// We've loaded all the styles: show the frame now
						$('#main').show();
					}, 0);
				}
			}
			window.plugins.urlCache.getCachedPathForURI(this.href.replace('file:', 'http:'), gotLinkPath, gotError);
		});

		// Scripts need to be replaced as well, for section show/hide.
		$('script', frameDoc).each(function() {
			var em = $(this),
				src = em.attr('src');
			if (src) {
				if (src.substr(0, 2) == '//') {
					src = 'http:' + src;
				} else if (src.substr(0, 1) == '/') {
					src = currentLocale.url + src;
				}
				var gotScriptPath = function(scriptPath) {
					// Changing the src on the existing node doesn't seem to work.
					// Replace it with a new one!
					em.replaceWith($('<script>').attr('src', scriptPath.file));
				}
				window.plugins.urlCache.getCachedPathForURI(src, gotScriptPath, gotError);
			}
		});
		
		// Protocol-relative links: rewrite to http:
		$('a[href^="//"]', frameDoc).each(function() {
			$(this).attr('href', this.href.replace('file://', 'http://') );
		});
		// Site-relative links: rewrite to http: and local site
		$('a[href^="/"]', frameDoc).each(function() {
			$(this).attr('href', currentLocale.url + this.href.replace('file://', '') );
		});
		
		// images
		$('img', frameDoc).each(function() {
			var em = $(this);
			var gotLinkPath = function(linkPath) {
				em.attr('src', linkPath.file);
			}
			window.plugins.urlCache.getCachedPathForURI(this.src.replace('file:', 'http:'), gotLinkPath, gotError);
		});
	};
	var gotPath = function(cachedPage) {
		$('#main').one('load', function() {
			replaceRes();
		});
		$('#main').attr('src', cachedPage.file);
	}
	var gotError = function(error) {
		console.log(error);
		// noConnectionMsg();
		// navigator.app.exitApp();
	}
	window.plugins.urlCache.getCachedPathForURI(url, gotPath, gotError);
	
}

var app = new Application();
