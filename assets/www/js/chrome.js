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
	
	function showListSpinner(){
		$('.listSpinner').css({display:'block'});
	}
	
	function hideListSpinner() {
		$(".listSpinner").remove();
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
		audioPlayer.getMediaList();
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
			app.baseURL = app.baseUrlForLanguage(preferencesDB.get('language'));
			/* Split language string about '-' */
			var lan_arr = (preferencesDB.get('locale')).split('-');
			var lan_arr_nor = l10n.normalizeLanguageCode(lan_arr[0]);
			var spe_arr = new Array("arc","ar","ckb","dv","fa","he","khw","ks","mzn","pnb","ps","sd","ug","ur","yi");
			for(a=0;a < spe_arr.length;a++){
				if(lan_arr_nor==spe_arr[a]){
					$("body").attr('dir','rtl');
				}
			}

			// Do localization of the initial interface
			$(document).bind("mw-messages-ready", function() {
				$('#mainHeader, #menu').localize();
			});
			l10n.initLanguages();

			toggleMoveActions();

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
			loadFirstPage();
			doFocusHack();
		});

	}

    function loadWordoftheDay() {
        loadFirstPage(true);
    }

	function loadFirstPage(disableReloadHist) {
		chrome.showSpinner();
		
		// Check if the 'define' parameter is set
		// 'define' indicates the word to display on startup
		var word = '';
		var getParams = window.location.search.substring(1);
		var vars = getParams.split('&');
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			if (pair[0] === 'define') {
				word = pair[1];
				
				if (word !== undefined && word !== null && word !== '') {
					word = unescape(word);
					word = word.replace(/\+/g, ' ');

					var url = app.urlForTitle(word);
					app.navigateToPage(url);
					return;
				}
			}
		}
	   
		// restore browsing to last visited page
		var historyDB = new Lawnchair({name:"historyDB"}, function() {
			this.all(function(history){
				if(history.length==0 || window.history.length > 1 || disableReloadHist) {
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
		$('#audiolinks').hide();
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

	function toggleMoveActions() {
		var canGoForward = currentHistoryIndex < (pageHistory.length -1);
		var canGoBackward = currentHistoryIndex > 0;

		setMenuItemState('go-forward', canGoForward, true);
		setMenuItemState('go-back', canGoBackward, true);
		updateMenuState();
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

	// Hack to make sure that things in focus actually look like things in focus
	function doFocusHack() {
		var scrollEnd = false;
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

		function onTouchMove() {
			scrollEnd = true;
		}

		function onTouchEnd() {
			if(!scrollEnd) {
				$(this).addClass('active');
				setTimeout(function() {
					$('.active').removeClass('active');
				} , 150 );
			}
			$('body').unbind('touchend', onTouchEnd);
			$('body').unbind('touchmove', onTouchMove);
		}

		function onTouchStart() {
			$('body').bind('touchend', onTouchEnd);
			$('body').bind('touchmove', onTouchMove);
			scrollEnd = false;
		}			

		setTimeout(function() {
			$(applicableClasses.join(',')).each(function(i) {
				$(this).bind('touchstart', onTouchStart);
				$(this).bind('touchmove', onTouchMove);
				$(this).bind('touchend', onTouchEnd);
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

			if (url.match(new RegExp("^http?://([^/]+)\." + PROJECTNAME + "\.org/wiki/"))) {
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
		// TODO: next two lines temporary to deal with legacy mediawiki instances
		$('.section_heading').removeAttr('onclick');
		$('.section_heading button').remove();
		// setup default MobileFrontend behaviour (including toggle)
		MobileFrontend.init();
		window.scroll(0,0);
		appHistory.addCurrentPage();
		chrome.hideSpinner();   
		console.log('currentHistoryIndex '+currentHistoryIndex + ' history length '+pageHistory.length);

		if (window.wiktionary) {
			window.wiktionary.onPageLoad();
			// Hacky use of setTimeout. We have to do this so that we don't get
			// JS errors. Changing this might break the use of Show/Hide buttons
			setTimeout(window.wiktionary.afterPageLoad, 5);
		}
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
		showListSpinner: showListSpinner,
		hideListSpinner: hideListSpinner,
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
		doScrollHack: doScrollHack,
        loadWordoftheDay: loadWordoftheDay
	};
}();
