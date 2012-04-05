window.app = function() {

	function loadCachedPage (url, noScroll) {
		var d = $.Deferred();
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
			loadPage('file://' + cachedPage.file, url, noScroll).then(function() {
				replaceRes();
				d.resolve();
			});
		}
		var gotError = function(error) {
			console.log('Error: ' + error);
			chrome.hideSpinner();
		}
		window.plugins.urlCache.getCachedPathForURI(url, gotPath, gotError);
		return d;
	}

	function loadPage(url, origUrl, noScroll) {
		var d = $.Deferred();
		origUrl = origUrl || url;

		var title = app.titleForUrl(url);
		if(title === "") {
			title = "Main_Page";
		}
		function doRequest() {
			Page.requestFromTitle(title).done(function(page) {
				app.curPage = page;
				chrome.renderHtml(page.toHtml(), origUrl);
				chrome.onPageLoaded();
				d.resolve(page);
			}).fail(function(xhr) {
				if(xhr.status == 404) {
					loadLocalPage('404.html');
				} else {
					loadLocalPage('error.html');
				}
				languageLinks.clearLanguages();
				setMenuItemState('read-in', false);
				setPageActionsState(false);
				app.curPage = null;
			});
		}

		if(!network.isConnected()) {
			app.setCaching(true, function() {
				console.log("HEYA!");
				doRequest();
				app.setCaching(false);
			});
		} else {
			doRequest();
		}
		return d;
	}

	function loadLocalPage(page) {
		var d = $.Deferred();
		$('base').attr('href', ROOT_URL);
		$('#main').load(page, function() {
			$('#main').localize();
			chrome.onPageLoaded();
			d.resolve();
		});
		return d;
	}

	function urlForTitle(title) {
		return app.baseURL + "/wiki/" + encodeURIComponent(title.replace(/ /g, '_'));
	}

	function baseUrlForLanguage(lang) {
		return 'https://' + lang + '.' + PROJECTNAME + '.org';
	}

	function setContentLanguage(language) {
		preferencesDB.set('language', language);
		app.baseURL = app.baseUrlForLanguage(language);
	}

	function setFontSize(size) {
		preferencesDB.set('fontSize', size);
		$('#main').css('font-size', size);
	}


	function setCaching(enabled, success) {
		// Do nothing by default
		success();
	}


	function navigateToPage(url, options) {
		var d = $.Deferred();
		var options = $.extend({cache: false, updateHistory: true, noScroll: false}, options || {});
		$('#searchParam').val('');
		chrome.showContent();
		if(options.hideCurrent) {
			$("#content").hide();
		}
		chrome.showSpinner();

		if (options.updateHistory) {
			currentHistoryIndex += 1;
			pageHistory[currentHistoryIndex] = url;
		}
		if (options.cache) {
			d = app.loadCachedPage(url, options.noScroll);
		} else {
			d = app.loadPage(url, "", options.noScroll);
		}
		d.done(function() {
			console.log("navigating to " + url);
			// Enable change language - might've been disabled in a prior error page
			console.log('enabling language');
			setPageActionsState(true);;
			setMenuItemState('read-in', true);
			if(options.hideCurrent) {
				$("#content").show();
			}			
		});
		return d;
	}

	function getCurrentUrl() {
		if(app.curPage) {
			return app.urlForTitle(app.curPage.title);
		} else {
			return null;
		}
	}

	function titleForUrl(url) {
		var page = url.replace(/^https?:\/\/[^\/]+(\/wiki\/)?/, ''),
			unescaped = decodeURIComponent(page),
			title = unescaped.replace(/_/g, ' ');
		return title;
	}
	function getCurrentTitle() {
		if(app.curPage) {
			return app.curPage.title;
		} else {
			return null;
		}
	}

	var exports = {
		setFontSize: setFontSize,
		setContentLanguage: setContentLanguage,
		navigateToPage: navigateToPage,
		getCurrentUrl: getCurrentUrl,
		getCurrentTitle: getCurrentTitle,
		urlForTitle: urlForTitle,
		titleForUrl:titleForUrl,
		baseUrlForLanguage: baseUrlForLanguage,
		setCaching: setCaching,
		loadPage: loadPage,
		loadCachedPage: loadCachedPage, 
		curPage: null
	};

	return exports;
}();
