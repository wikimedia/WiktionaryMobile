window.chrome = function() {

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

	function renderHtml(page) {

		$('base').attr('href', page.getCanonicalUrl());

		if(l10n.isLangRTL(page.lang)) {
			$("#main").attr('dir', 'rtl');
		}
		$("#main").html(page.toHtml());

		handleSectionExpansion();
	}

	function handleSectionExpansion() {
		$(".section_heading").click(function() {
			var sectionID = $(this).data('section-id');
			var $contentBlock = $("#content_" + sectionID);
			var $btn = $("button", this); 
			if(!$contentBlock.data('populated')) {
				var sectionHtml = app.curPage.getSectionHtml(sectionID);
				$contentBlock.append($(sectionHtml)).data('populated', true);
			} 

			MobileFrontend.toggle.wm_toggle_section(sectionID);
			chrome.setupScrolling("#content");
		});
	}

	function showNotification(text) {
		alert(text);
	}

	function confirm(text) {
		var d = $.Deferred();

		navigator.notification.confirm(text, function(button) {
			d.resolve(button === 1); //Assumes first button is OK
		}, "");

		return d;
	}
	function initialize() {
		$.each(platform_initializers, function(index, fun) {
			fun();
		});
		// some reason the android browser is not recognizing the style=block when set in the CSS
		// it only seems to recognize the style when dynamically set here or when set inline...
		// the style needs to be explicitly set for logic used in the backButton handler
		$('#content').css('display', 'block');

		var lastSearchTimeout = null; // Handle for timeout last time a key was pressed

		preferencesDB.initializeDefaults(function() {
			app.baseURL = app.baseUrlForLanguage(preferencesDB.get('language'));
			/* Split language string about '-' */
			console.log('language is ' + preferencesDB.get('uiLanguage'));
			if(l10n.isLangRTL(preferencesDB.get('uiLanguage'))) {
				$("body").attr('dir', 'rtl');
			}

			// Do localization of the initial interface
			$(document).bind("mw-messages-ready", function() {
				$('#mainHeader, #menu').localize();
				$("#page-footer-contributors").html(mw.message('page-contributors').plain());
				$("#page-footer-license").html(mw.message('page-license').plain());
				$("#show-page-history").click(function() {
					if(app.curPage) {
						chrome.openExternalLink(app.curPage.getHistoryUrl());
					}
					return false;
				});
				$("#show-license-page").click(function() {
					app.navigateTo(window.LICENSEPAGE, "en");
					return false;
				});
			});
			l10n.initLanguages();

			updateMenuState();
			toggleMoveActions();

			$(".titlebarIcon").bind('click', function() {
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
					// Wait 300ms with no keypress before starting request
					window.clearTimeout(lastSearchTimeout);
					lastSearchTimeout = setTimeout(function() {
						window.search.performSearch($("#searchParam").val(), true);
					}, 300);
				}
			});
			$("#searchParam").click(function() {
				$(this).focus(); // Seems to be needed to actually focus on the search bar
				// Caused by the FastClick implementation
			});
			$("#clearSearch").bind('touchstart', function() {
				clearSearch();
				return false;
			});

			$(".closeButton").bind('click', showContent);

			initContentLinkHandlers();
			chrome.loadFirstPage();
			chrome.setupFastClick("header, .titlebar");
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
		$("#menu").show();
	}

	function hideContent() {
		$('#mainHeader').hide();
		if(!isTwoColumnView()) {
			$('#content').hide();
			$("#menu").hide();
		} else {
			$('html').addClass('overlay-open');
		}
	}

	function showNoConnectionMessage() {
		alert(mw.message('error-offline-prompt'));
	}

	function toggleMoveActions() {
		var canGoForward = currentHistoryIndex < (pageHistory.length -1);
		var canGoBackward = currentHistoryIndex > 0;

		setMenuItemState('go-forward', canGoForward, true);
		setMenuItemState('go-back', canGoBackward, true);
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
			toggleMoveActions();
		}
	}

	function setupFastClick(selector) {
		$(selector).each(function(i, el) {
			var $el = $(el);
			if($el.data('fastclick')) {
				return;
			} else {
				$el.data('fastclick', new NoClickDelay($el[0]));
			}
		});
	}

	function initContentLinkHandlers() {
		app.setFontSize(preferencesDB.get('fontSize'));
		$('#main').delegate('a', 'click', function(event) {
			var target = this,
				url = target.href,             // expanded from relative links for us
				href = $(target).attr('href'); // unexpanded, may be relative

			event.preventDefault();

			if (href.substr(0, 1) == '#') {
				// FIXME: Replace with Reference reveal
			}

			if (url.match(new RegExp("^https?://([^/]+)\." + PROJECTNAME + "\.org/wiki/"))) {
				// ...and load it through our intermediate cache layer.
				app.navigateToPage(url);
			} else {
				// ...and open it in parent context for reals.
				chrome.openExternalLink(url);
			}
		});
	}
	
	function setupScrolling(selector) {
		// Setup iScroll4 in iOS 4.x. 
		// NOOP otherwise
	}

	function scrollTo(selector, posY) {
		$(selector).scrollTop(posY);
	}

	function openExternalLink(url) {
		// This seems to successfully launch the native browser, and works
		// both with the stock browser and Firefox as user's default browser
		//document.location = url;
		window.open(url);
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
		hideOverlays: hideOverlays,
		showContent: showContent,
		hideContent: hideContent,
		addPlatformInitializer: addPlatformInitializer,
		showNoConnectionMessage: showNoConnectionMessage,
		setupFastClick: setupFastClick,
		isTwoColumnView: isTwoColumnView,
		openExternalLink: openExternalLink,
		toggleMoveActions: toggleMoveActions,
		confirm: confirm,
		setupScrolling: setupScrolling,
		scrollTo: scrollTo
	};
}();
