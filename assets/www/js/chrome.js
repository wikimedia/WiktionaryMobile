window.chrome = function() {
	var menu_handlers = {
		'read-in': function() { languageLinks.showAvailableLanguages(); },
		'near-me': function() { geo.showNearbyArticles(); },
		'view-history': function() { appHistory.showHistory(); } ,
		'save-page': function() { savedPages.saveCurrentPage() },
		'view-saved-pages': function() { savedPages.showSavedPages(); },
		'share-page': function() { sharePage(); },
		'go-forward': function() { goForward(); },
		'select-text': function() { selectText(); },
		'view-settings': function() { appSettings.showSettings(); },
	};

	// List of functions to be called on a per-platform basis before initialize
	var platform_initializers = [];
	function addPlatformInitializer(fun) {
		platform_initializers.push(fun);
	}

	function showSpinner() {
		$('.titlebar .spinner').css({display:'block'});
		$('#search').addClass('inProgress');
		$('#clearSearch').css({height:0});
	}

	function hideSpinner() {
		$('#search').removeClass('inProgress');
		$('.titlebar .spinner').css({display:'none'});	
		$('#clearSearch').css({height:30});
	}
	
	function isSpinning() {
		$('#search').hasClass('inProgress');
	}
	
	/**
	 * Import page components from HTML string and display them in #main
	 *
	 * @param string html
	 * @param string url - base URL
	 */
	function renderHtml(html, url) {
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
			$div = $(trimmed);

		$target
			.empty()
			.attr('lang', lang)
			.attr('dir', dir);
		$.each(selectors, function(i, sel) {
			var con = $div.find(sel).remove();
			con.appendTo($target);
		});

		languageLinks.parseAvailableLanguages($div);
		
		chrome.doScrollHack('#content');
	}

	function showNotification(text) {
		alert(text);
	}

	function initialize() {
		$.each(platform_initializers, function(index, fun) {
			fun();
		});
		// some reason the android browser is not recognizing the style=block when set in the CSS
		// it only seems to recognize the style when dynamically set here or when set inline...
		// the style needs to be explicitly set for logic used in the backButton handler
		$('#content').css('display', 'block');

		// this has to be set for the window.history API to work properly
		//PhoneGap.UsePolling = true;

		preferencesDB.initializeDefaults(function() { 
			app.baseURL = 'https://' + preferencesDB.get('language') + '.m.wikipedia.org';
			
			// Do localization of the initial interface
			$(document).bind("mw-messages-ready", function() {
				$('#mainHeader, #menu').localize();
			});
			l10n.initLanguages();

			$(".titlebarIcon").bind('touchstart', function() {
				homePage();
				return false;
			});
			$("#searchForm").bind('submit', function() {
				window.search.performSearch($("#searchParam").val(), false);
				return false;
			}).bind('keypress', function(event) {
				if(event.keyCode == 13)
				{
					$("#searchParam").blur();
				}else{
					// Needed because .val doesn't seem to update instantly
					setTimeout(function() { 
						window.search.performSearch($("#searchParam").val(), true); 
					}, 5);
				}
			});
			$("#clearSearch").bind('touchstart', function() {
				clearSearch();
				return false;
			});

			$(".closeButton").bind('click', showContent);

			initContentLinkHandlers();
			chrome.loadFirstPage();
			doFocusHack();
		});
		
	}

	function loadFirstPage() {
		chrome.showSpinner();

		// restore browsing to last visited page
		var historyDB = new Lawnchair({name:"historyDB"}, function() {
			this.all(function(history){
				if(history.length==0 || window.history.length > 1) {
					app.navigateToPage(app.baseURL);
				} else {
					app.navigateToPage(history[history.length-1].value);
				}
			});
		});

	}

	function isTwoColumnView() {
		// should match the CSS media queries
		// check for goodscroll is so we don't use it on Android 2.x tablets
		return (document.width >= 640) && $('html').hasClass('goodscroll');
	}

	function hideOverlays() {
		$('#savedPages').hide();
		$('#history').hide();
		$('#searchresults').hide();
		$('#settings').hide();
		$('#about-page-overlay').hide();
		$('#langlinks').hide();
		$('#nearby-overlay').hide();
		$('html').removeClass('overlay-open');
	}

	function showContent() {
		hideOverlays();
		$('#mainHeader').show();
		$('#content').show();
	}

	function hideContent() {  
		$('#mainHeader').hide();
		if(!isTwoColumnView()) {
			$('#content').hide();
		} else {
			$('html').addClass('overlay-open');
		}
	}

	function showNoConnectionMessage() {
		alert(mw.message('error-offline-prompt'));
	}

	function toggleForward() {
		// Length starts from 1, indexes don't.
		if (currentHistoryIndex < (pageHistory.length - 1)) {
			$('#forwardCmd').removeAttr('disabled'); 
		} else {
			$('#forwardCmd').attr('disabled', 'disabled');
		}
	}

	function goBack() {
		console.log('currentHistoryIndex '+currentHistoryIndex + ' history length '+pageHistory.length);

		if ($('#content').css('display') == "block") {
			// We're showing the main view
			currentHistoryIndex -= 1;
			chrome.showSpinner();
			// Jumping through history is unsafe with the current urlCache system
			// sometimes we get loaded without the fixups, and everything esplodes.
			//window.history.go(-1);
			if(currentHistoryIndex < 0) {
				console.log("no more history to browse exiting...");
				navigator.app.exitApp();
			} else {
				console.log('going back to item ' + currentHistoryIndex + ': ' + pageHistory[currentHistoryIndex]);
				app.navigateToPage(pageHistory[currentHistoryIndex], {
					updateHistory: false
				});
			}
		} else {
			// We're showing one of the overlays; cancel out of it.
			showContent();
		}
	}

	function goForward() {
		chrome.showSpinner();
		console.log(pageHistory.length);
		console.log(currentHistoryIndex);
		if (currentHistoryIndex < pageHistory.length - 1) {
			app.navigateToPage(pageHistory[++currentHistoryIndex], {
				updateHistory: false
			});
		} else {
			chrome.hideSpinner();
			toggleForward();
			updateMenuState(menu_handlers);
		}
	}

	// Hack to make sure that things in focus actually look like things in focus
	function doFocusHack() {
		var applicableClasses = [
			'.deleteButton',
			'.listItem',
			'#search',
			'.closeButton',
			'.cleanButton',
			'.titlebarIcon'
		];
	  
		for (var key in applicableClasses) {
			applicableClasses[key] += ':not(.activeEnabled)';
		}
		console.log(applicableClasses);
		function onTouchEnd() {
			$('.active').removeClass('active');
			$('body').unbind('touchend', onTouchEnd);
			$('body').unbind('touchmove', onTouchEnd);
		}
	  
		function onTouchStart() {   
			$(this).addClass('active');
			$('body').bind('touchend', onTouchEnd);
			$('body').bind('touchmove', onTouchEnd);
		}
	  
		setTimeout(function() {
			$(applicableClasses.join(',')).each(function(i) {
				$(this).bind('touchstart', onTouchStart);
				$(this).addClass('activeEnabled');
			});
		}, 500);
	}

	function initContentLinkHandlers() {
		app.setFontSize(preferencesDB.get('fontSize'));
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
				//document.location = url;
				window.open(url);
			}
		});
	}
	
	function onPageLoaded() {
		window.scroll(0,0);
		appHistory.addCurrentPage();
		toggleForward();
		updateMenuState(menu_handlers);
		geo.addShowNearbyLinks();
		chrome.hideSpinner();  
		console.log('currentHistoryIndex '+currentHistoryIndex + ' history length '+pageHistory.length);
	}
	
	function doScrollHack(element, leaveInPlace) {
		// placeholder for iScroll etc where needed
		
		// Reset scroll unless asked otherwise
		if (!leaveInPlace) {
			$(element)[0].scrollTop = 0;
		}
	}

	return {
		initialize: initialize,
		renderHtml: renderHtml,
		loadFirstPage: loadFirstPage,
		showSpinner: showSpinner,
		hideSpinner: hideSpinner,
		isSpinning: isSpinning,
		showNotification: showNotification,
		goBack: goBack,
		goForward: goForward,
		onPageLoaded: onPageLoaded,
		hideOverlays: hideOverlays,
		showContent: showContent,
		hideContent: hideContent,
		addPlatformInitializer: addPlatformInitializer,
		showNoConnectionMessage: showNoConnectionMessage,
		doFocusHack: doFocusHack,
		isTwoColumnView: isTwoColumnView,
		doScrollHack: doScrollHack
	};
}();
