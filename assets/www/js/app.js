app = {
	loadCachedPage: function(url) {
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
			app.loadPage('file://' + cachedPage.file, url, function() {
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
	loadPage: function(url, origUrl, callback) {
		origUrl = origUrl || url;
		console.log('hideAndLoad url ' + url);
		console.log('hideAndLoad origUrl ' + origUrl);
		app.network.makeRequest({
			url: url, 
			success: function(data) {
					app.renderHtml(data, origUrl);
					if(callback) {
						callback();
					}
					app.onPageLoaded();
				},
			error: function(xhr) {
				if(xhr.status == 404) {
					app.loadLocalPage('404.html');
				} else {
					app.loadLocalPage('error.html');
				}
				app.langs = [];
				$('#savePageCmd').attr('disabled', 'true');
				console.log('disabling language');
				$('#languageCmd').attr('disabled', 'true');
			}
		});
	},
	loadLocalPage: function(page) {
		$('base').attr('href', 'file:///android_asset/www/');
		$('#main').load(page, function() {
			$('#main').localize();
			app.onPageLoaded();
		});
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
	renderHtml: function(html, url) {
		$('base').attr('href', url);

		// Horrible hack to grab the lang & dir attributes from
		// the target page's <html> without parsing the rest
		var stub = html.match(/<html ([^>]+)>/i, '$1')[1],
			$stubdiv = $('<div ' + stub + '></div>'),
			lang = $stubdiv.attr('lang'),
			dir = $stubdiv.attr('dir');

		var trimmed = html.replace(/<body[^>]+>(.*)<\/body/i, '$1');

		var selectors = ['#content>*', '#copyright'],
			$target = $('#main'),
			$div = $('<div>').html(trimmed);

		$target
			.empty()
			.attr('lang', lang)
			.attr('dir', dir);
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
		app.adjustFontSize(preferencesDB.get('fontSize'));
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
				app.navigateToPage(url);
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
		addToHistory();
		toggleForward();
		updateMenuState();
		$('#search').removeClass('inProgress');        
		hideSpinner();  
		console.log('currentHistoryIndex '+currentHistoryIndex + ' history length '+pageHistory.length);
	},

	navigateToPage: function(url, options) {
		var options = $.extend({cache: false, updateHistory: true}, options || {});
		$('#searchParam').val('');
		$('#search').addClass('inProgress');
		showSpinner();
		
		if (options.cache) {
			app.loadCachedPage(url);
		} else {
			app.loadPage(url);
		}
		if (options.updateHistory) {
			currentHistoryIndex += 1;
			pageHistory[currentHistoryIndex] = url;
			// We're adding an entry to the 'forward/backwards' chain.
			// So disable forward.
		} 
		console.log("navigating to " + url);
		var savedPagesDB = new Lawnchair({name: "savedPagesDB"}, function() {
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
	},

	network: network(),
	templates: templates()
}

