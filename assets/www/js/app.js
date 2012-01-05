app = {
	setRootPage: function(url) {
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
				var target = this.href.replace('file:', 'https:');
				window.plugins.urlCache.getCachedPathForURI(target, gotLinkPath, gotError);
			});

			// Scripts need to be replaced as well, for section show/hide.
			$('script', frameDoc).each(function() {
				var em = $(this),
					src = em.attr('src');
				if (src) {
					if (src.substr(0, 2) == '//') {
						src = 'https:' + src;
					} else if (src.substr(0, 1) == '/') {
						src = app.baseURL + src;
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
				$(this).attr('href', this.href.replace('file://', 'https://') );
			});
			// Site-relative links: rewrite to http: and local site
			$('a[href^="/"]', frameDoc).each(function() {
				$(this).attr('href', app.baseURL + this.href.replace('file://', '') );
			});
			
			// images
			$('img', frameDoc).each(function() {
				var em = $(this);
				var gotLinkPath = function(linkPath) {
					em.attr('src', linkPath.file);
				}
				var target = this.src.replace('file:', 'https:');
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
		
	}, 
	hideAndLoad: function(url) {
		$.ajax({
			url: url,
			dataType: 'text',
			headers: {
				"Application_Version": "Wikipedia Mobile (Android)/1.0.0"
			},
			success: function(data) {
				if (data === '') {
					// this ain't right. shouldn't this call error?
					app.loadErrorPage('error.html');
					return;
				}
				/*
				html = app.rewriteHtmlLightweight(data, url);
				$('#main')
					.attr('src', 'about:blank')
					.one('load', function() {
						var doc = $('#main')[0].contentDocument;
						doc.writeln(html);
						app.hideMobileLinks(preferencesDB.get('fontSize'));
				});
				*/
				app.importPage(data, url);
				app.onPageLoaded();
			},
			error: function(xhr) {
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
		$('#main')
			.attr('src', page)
			.one('load', function() {
				$('#error', $('#main')[0].contentDocument).localize();
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
		var frameDoc = $("#main")[0].contentDocument;
		var head = $('head', frameDoc);
		var styleTag = '<style type=\"text/css\">#content { font-size: ' + fontOptions[size] + ' !important;} </style>';
		head.append(styleTag);
	},

	hideMobileLinks: function(size) {
		var frameDoc = $("#main")[0].contentDocument;
		this.adjustFontSize(size);
		frameDoc.addEventListener('click', function(event) {
			var target = event.target;
			if (target.tagName == "A") {
				var url = target.href,             // expanded from relative links for us
					href = $(target).attr('href'); // unexpanded, may be relative
				
				if (href.substr(0, 1) == '#') {
					// A local hashlink; let it through.
					return;
				}

				// Stop the link from opening in the iframe directly...
				event.preventDefault();

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
			}
		}, true);
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
			var target = event.target,
				url = target.href,             // expanded from relative links for us
				href = $(target).attr('href'); // unexpanded, may be relative
			
			if (href.substr(0, 1) == '#') {
				// A local hashlink; let it through.
				return;
			}

			// Stop the link from opening in the iframe directly...
			event.preventDefault();

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
	}
}
