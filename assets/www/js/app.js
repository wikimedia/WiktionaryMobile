window.app = function() {

	var wikis = [];

	function getWikiMetadata() {
		var d = $.Deferred();
		if(wikis.length === 0) {
			$.get(ROOT_URL + 'wikis.json').done(function(data) {
				wikis = JSON.parse(data);
				d.resolve(wikis);
			});
		} else {
			d.resolve(wikis);
		}
		return d;
	}

	function loadMainPage(lang) {
		var d = $.Deferred();
		if(typeof lang === "undefined") {
			lang = preferencesDB.get("language");
		}

		app.getWikiMetadata().done(function(wikis) {
			var mainPage = wikis[lang].mainPage;
			app.navigateTo(mainPage, lang).done(function(data) {
				d.resolve(data);
			}).fail(function(err) {
				d.reject(err);
			});
		});
	}

	function loadCachedPage (url, title, lang) {
		chrome.showSpinner();
		var d = $.Deferred();
		var replaceRes = function() {

			// images
			$('#main img').each(function() {
				var em = $(this);
				var gotLinkPath = function(linkPath) {
					em.attr('src', 'file://' + linkPath.file);
				}
				var target = this.src.replace('file:', window.PROTOCOL + ':');
				window.plugins.urlCache.getCachedPathForURI(target, gotLinkPath, gotError);
			});
		};
		var gotPath = function(cachedPage) {
			
			$.get('file://' + cachedPage.file).then(function(data) {
				var page = Page.fromRawJSON(title, JSON.parse(data), lang);
				replaceRes();
				setCurrentPage(page);
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

	function setCurrentPage(page) {
		app.curPage = page;
		chrome.renderHtml(page);

		setPageActionsState(true);
		setMenuItemState('read-in', true);
		chrome.setupScrolling("#content");
		chrome.scrollTo("#content", 0);
		appHistory.addCurrentPage();
		chrome.toggleMoveActions();
		geo.addShowNearbyLinks();
		$("#page-footer").show();
		chrome.showContent();
		chrome.hideSpinner();
	}

	function setErrorPage(type) {
		if(type == 404) {
			loadLocalPage('404.html');
		} else {
			loadLocalPage('error.html');
		}
		setMenuItemState('read-in', false);
		setPageActionsState(false);
		chrome.hideSpinner();
		$("#page-footer").hide();
		app.curPage = null;
	}

	function loadPage(title, language) {
		var d = $.Deferred();

		function doRequest() {
			Page.requestFromTitle(title, language).done(function(page) {
				if(page === null) {
					setErrorPage(404);
				}
				setCurrentPage(page);
				d.resolve(page);
			}).fail(function(xhr) {
				setErrorPage(xhr.status);	
				d.reject(xhr);
			});
		}

		if(!navigator.onLine) {
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
			d.resolve();
		});
		return d;
	}

	function urlForTitle(title, lang) {
		if(typeof lang === 'undefined') {
			lang = preferencesDB.get("language");
		}
		return app.baseUrlForLanguage(lang) + "/wiki/" + encodeURIComponent(title.replace(/ /g, '_'));
	}

	function baseUrlForLanguage(lang) {
		return window.PROTOCOL + '://' + lang + '.' + PROJECTNAME + '.org';
	}

	function makeCanonicalUrl(lang, title) {
		return baseUrlForLanguage(lang) + '/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
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

	function navigateTo(title, lang, options) {
		var d = $.Deferred();
		var options = $.extend({cache: false, updateHistory: true}, options || {});
		var url = app.urlForTitle(title, lang);

		if(title === "") {
			return app.loadMainPage(lang);
		}

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
		if(title === "") {
			title = "Main_Page"; // FIXME
		}
		d = app.loadPage(title, lang);
		d.done(function() {
			console.log("Navigating to " + title);
			if(options.hideCurrent) {
				$("#content").show();
			}			
		});
		return d;
	}

	function navigateToPage(url, options) {
		var title = app.titleForUrl(url);
		var lang = app.languageForUrl(url);
		return app.navigateTo(title, lang, options);
	}

	function getCurrentUrl() {
		if(app.curPage) {
			return app.urlForTitle(app.curPage.title);
		} else {
			return null;
		}
	}

	function languageForUrl(url) {
		// Use the least significant part of the hostname as language
		// So en.wikipedia.org would be 'en', and so would en.wiktionary.org
		return url.match(/^https?:\/\/([^.]+)./)[1];	
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

	function makeAPIRequest(params, lang, method) {
		// Force JSON
		params.format = 'json';
		lang = lang || preferencesDB.get('language');
		method = method || "GET";
		var url = app.baseUrlForLanguage(lang) + '/w/api.php';
		if(method === 'POST') {
			return $.post(url, params);
		} else {
			return $.get(url, params);
		}
	}

	function track(eventId) {
		makeAPIRequest({
			eventid: eventId,
			namespacenumber: 0,
			token: '+/', // Anonymous token
			additional: 'android' // System info
		}, preferencesDB.get('language'));
	}
	var exports = {
		setFontSize: setFontSize,
		setContentLanguage: setContentLanguage,
		navigateToPage: navigateToPage,
		getCurrentUrl: getCurrentUrl,
		getCurrentTitle: getCurrentTitle,
		urlForTitle: urlForTitle,
		titleForUrl:titleForUrl,
		languageForUrl: languageForUrl,
		baseUrlForLanguage: baseUrlForLanguage,
		setCaching: setCaching,
		loadPage: loadPage,
		loadCachedPage: loadCachedPage, 
		makeCanonicalUrl: makeCanonicalUrl,
		makeAPIRequest: makeAPIRequest,
		setCurrentPage: setCurrentPage,
		track: track,
		curPage: null,
		navigateTo: navigateTo,
		getWikiMetadata: getWikiMetadata,
		loadMainPage: loadMainPage
	};

	return exports;
}();
