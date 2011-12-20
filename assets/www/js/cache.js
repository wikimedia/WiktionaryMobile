function Application() {}

Application.prototype.setRootPage = function(url) {
	// Hide the iframe until the stylesheets are loaded,
	// to avoid flash of unstyled text.
	// Instead we're hidden, which also sucks.
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
			var target = this.href.replace('file:', 'http:');
			window.plugins.urlCache.getCachedPathForURI(target, gotLinkPath, gotError);
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
			var target = this.src.replace('file:', 'http:');
			window.plugins.urlCache.getCachedPathForURI(target, gotLinkPath, gotError);
		});
	};
	var gotPath = function(cachedPage) {
		$('#main').one('load', function() {
			replaceRes();
		});
		$('#main').attr('src', cachedPage.file);
	}
	var gotError = function(error) {
		console.log('Error: ' + error);
		$('#main').show(); // in case we left it hidden
		hideSpinner();
		// noConnectionMsg();
		// navigator.app.exitApp();
	}
	window.plugins.urlCache.getCachedPathForURI(url, gotPath, gotError);
	
}

Application.prototype.hideAndLoad = function(url) {
	var app = this;
	$.ajax({
		url: url,
		dataType: 'text',
		headers: {
			"Application_Version": "Wikipedia Mobile (Android)/1.0.0"
		},
		success: function(data) {
			if (data === '') {
				// this ain't right. shouldn't this call error?
				app.loadErrorPage();
				return;
			}
			html = app.rewriteHtmlLightweight(data, url);
			$('#main')
				.attr('src', 'about:blank')
				.one('load', function() {
					var doc = $('#main')[0].contentDocument;
					doc.writeln(html);
					hideMobileLinks();
				});
		},
		error: function() {
			app.loadErrorPage();
		}
	})
}

/**
 * Lightweight rewrite: absolutize the URLs
 */
Application.prototype.rewriteHtmlLightweight = function(html, url) {
	var base = '<base href="' + url.replace(/&/g, '&amp;') + '">',
		style = '<style type="text/css">#header,#footmenu{display:none}</style>';
	var html = html.replace(/(<head[^>]*>)/i, '$1' + base + style);
	return html;
}

Application.prototype.loadErrorPage = function() {
	$('#main')
		.attr('src', 'error.html')
		.one('load', function() {
			$('#error', $('#main')[0].contentDocument).localize();
		});
		//Save page and Change Language don't make sense for error page
		$('#savePageCmd').attr('disabled', 'true');
		console.log('disabling language');
		$('#languageCmd').attr('disabled', 'true');
}

var app = new Application();
