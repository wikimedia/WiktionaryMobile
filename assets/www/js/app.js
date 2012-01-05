app = {
	setRootPage: function(url) {
		// Hide the iframe until the stylesheets are loaded,
		// to avoid flash of unstyled text.
		// Instead we're hidden, which also sucks.
		var replaceRes = function() {

			// images
			$('#main img').each(function() {
				var em = $(this);
				var gotLinkPath = function(linkPath) {
					em.attr('src', 'file://' + linkPath.file);
				}
				var target = this.src.replace('file:', 'https:');
				window.plugins.urlCache.getCachedPathForURI(target, gotLinkPath, gotError);
			});
		};
		var gotPath = function(cachedPage) {
			app.hideAndLoad('file://' + cachedPage.file, url, function() {
				replaceRes();
			});
		}
		var gotError = function(error) {
			console.log('Error: ' + error);
			hideSpinner();
			// noConnectionMsg();
			// navigator.app.exitApp();
		}
		window.plugins.urlCache.getCachedPathForURI(url, gotPath, gotError);
		
	}, 
	hideAndLoad: function(url, origUrl, callback) {
		origUrl = origUrl || url;
		console.log('hideAndLoad url ' + url);
		console.log('hideAndLoad origUrl ' + origUrl);
		app.loadingXhr = $.ajax({
			url: url,
			dataType: 'text',
			headers: {
				"Application_Version": "Wikipedia Mobile (Android)/1.0.0"
			},
			success: function(data) {
				console.log('received!!!!');
				app.loadingXhr = null;

				if (data === '') {
					// this ain't right. shouldn't this call error?
					app.loadErrorPage('error.html');
					return;
				}

				app.importPage(data, origUrl);
				if (callback) {
					callback();
				}
				app.onPageLoaded();
			},
			error: function(xhr) {
				console.log('errored!!!!');
				app.loadingXhr = null;
				if(xhr.status == 404) {
					app.loadErrorPage('404.html');
				} else {
					app.loadErrorPage('error.html');
				}
			}
		})
	},
	rewriteHtmlLightweight: function(html, url) {
		// Make URLs absolute
		var base = '<base href="' + url.replace(/&/g, '&amp;') + '">',
			style = '<style type="text/css">#header,#footmenu{display:none}</style>';
		var html = html.replace(/(<head[^>]*>)/i, '$1' + base + style);
		return html;
	},
	loadErrorPage: function(page) {
		$('base').attr('href', 'file:///android_asset/www/');
		$('#main').load(page, function() {
			$('#main').localize();
			app.onPageLoaded();
		});
		//Save page and Change Language don't make sense for error page
		app.langs = [];
		$('#savePageCmd').attr('disabled', 'true');
		console.log('disabling language');
		$('#languageCmd').attr('disabled', 'true');
	},

	/**
	 * Fetch language links from the iframe.
	 *
	 * @return array of {name: string, url: string, selected: bool} objects
	 */
	getLangLinks: function() {
		return app.langs;
	},

	adjustFontSize: function(size) {
		var frameDoc = $("#main");
		$('#main').css('font-size', fontOptions[size]);
	},
	
	/**
	 * Import page components from HTML string and display them in #main
	 *
	 * @param string html
	 * @param string url - base URL
	 */
	importPage: function(html, url) {
		$('base').attr('href', url);
		var trimmed = html.replace(/<body[^>]+>(.*)<\/body/i, '$1');

		var selectors = ['#content>*', '#copyright'],
			$target = $('#main'),
			$div = $('<div>').html(trimmed);

		$target.empty();
		$.each(selectors, function(i, sel) {
			$div.find(sel).remove().appendTo($target);
		});

		// Also import the language selections, we'll need them later.
		var langs = [];
		$div.find('#languageselection option').each(function(i, option) {
			var $option = $(this);
			langs.push({
				name: $option.text(),
				url: processLanguageUrl($option.val()),
				selected: ($option.attr('selected') != null)
			});
		});

		app.langs = langs;
	},
	
	initLinkHandlers: function() {
		$('#main').delegate('a', 'click', function(event) {
			var target = this,
				url = target.href,             // expanded from relative links for us
				href = $(target).attr('href'); // unexpanded, may be relative

			// Stop the link from opening in the iframe directly...
			event.preventDefault();
			
			if (href.substr(0, 1) == '#') {
				// A local hashlink; simulate?
				var off = $(href).offset(),
					y = off ? off.top : 52;
				window.scrollTo(0, y - 52);
				return;
			}

			if (url.match(/^https?:\/\/([^\/]+)\.wikipedia\.org\/wiki\//)) {
				// ...and load it through our intermediate cache layer.
				navigateToPage(url);
			} else {
				// ...and open it in parent context for reals.
				//
				// This seems to successfully launch the native browser, and works
				// both with the stock browser and Firefox as user's default browser
				document.location = url;
			}
		});
	},
	
	onPageLoaded: function() {
		window.scroll(0,0);
		toggleForward();
		addToHistory();
		$('#search').removeClass('inProgress');        
		hideSpinner();  
		console.log('currentHistoryIndex '+currentHistoryIndex + ' history length '+pageHistory.length);
	},
	
	stopLoading: function() {
		// 		window.frames[0].stop();
		if (app.loadingXhr) {
			app.loadingXhr.abort();
			app.loadingXhr = null;
		}

	}
}
