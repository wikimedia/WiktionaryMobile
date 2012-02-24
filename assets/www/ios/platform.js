// iOS+PhoneGap-specific setup

function setMenuItemState(action, state) {
	// Stupid iterator
	$.each(menu_items, function(i, item) {
		if(item.id == action) {
			item.disabled = !state;
		}
	});
	updateMenuState();
}

function setPageActionsState(state) {
	setMenuItemState("page-actions", state);
}

var menu_items = [
	{
		id: 'go-back',
		action: chrome.goBack
	},
	{
		id: 'go-forward',
		action: chrome.goForward,
		disabled: true
	},
	{
		id: 'read-in',
		action:  languageLinks.showAvailableLanguages
	},
	{
		id: 'page-actions',
		action: function() {
			popupMenu([
				mw.msg('menu-savePage'),
				mw.msg('menu-sharePage'),
				mw.msg('menu-cancel')
			], function(value, index) {
				if (index == 0) {
					savedPages.saveCurrentPage();
				} else if (index == 1) {
					sharePage();
				}
			}, {
				cancelButtonIndex: 2,
				origin: this
			});
		}
	},
	{
		id: 'list-actions',
		action: function() {
			popupMenu([
				mw.msg('menu-nearby'),
				mw.msg('menu-savedPages'),
				mw.msg('menu-history'),
				mw.msg('menu-cancel')
			], function(val, index) {
				if (index == 0) {
					geo.showNearbyArticles();
				} else if (index == 1) {
					savedPages.showSavedPages();
				} else if (index == 2) {
					appHistory.showHistory();
				}
			}, {
				cancelButtonIndex: 3,
				origin: this
			});
		}
	},
	{
		id: 'view-settings',
		action: appSettings.showSettings
	}
];

function updateMenuState() {
	$('#menu').remove();
	var $menu = $('<div>');
	$menu
		.attr('id', 'menu')
		.appendTo('body');

	$.each(menu_items, function(i, item) {
		var $button = $('<button>');
		$button
			.attr('id', item.id)
			.attr('title', mw.msg(item.id));
		if(item.disabled) {
			$button.addClass("disabled");
		} else {
			$button.click(function() {
				item.action.apply(this);
			});
		}
		$button.append('<span>')
			.appendTo($menu);
	});
};

// Save page supporting code
app.loadCachedPage = function (url) {
	return urlCache.getCachedData(url).then(function(data) {
		chrome.renderHtml(data, url);
		chrome.onPageLoaded();
	}).fail(function(error) {
		console.log('Error: ' + error);
		chrome.hideSpinner();
	});
}

savedPages.doSave = function(url, title) {

	// Get the entire HTML again
	// Hopefully this is in cache
	// What we *really* should be doing is putting all this in an SQLite DataBase. FIXME
	$.get(url,
			function(data) {
				urlCache.saveCompleteHtml(url, data).then(function() {;
					chrome.showNotification(mw.message('page-saved', title).plain());
				});
			}
		 );
}

// @Override
function popupMenu(items, callback, options) {
	if (options.origin) {
		var $origin = $(options.origin),
			pos = $origin.offset();
		options.left = pos.left;
		options.top = 0; // hack pos.top;
		options.width = $origin.width();
		options.height = $origin.height();
	}
	window.plugins.actionSheet.create('', items, callback, options);
}

function sharePage() {
	// @fixme if we don't have a page loaded, this menu item should be disabled...
	var title = app.getCurrentTitle(),
	url = app.getCurrentUrl().replace(/\.m\.wikipedia/, '.wikipedia');
	window.plugins.shareKit.share(
							  {
								  message: title,
								  url: url
							  }
							  );
}

origDoScrollHack = chrome.doScrollHack;
// @Override
chrome.doScrollHack = function(element, leaveInPlace) {
	// @fixme only use on iOS 4.2?
	if (navigator.userAgent.match(/iPhone OS [34]/)) {
		var $el = $(element),
			scroller = $el[0].scroller;
		if (scroller) {
			window.setTimeout(function() {
				scroller.refresh();
			}, 0);
		} else {
			scroller = new iScroll($el[0]);
			$el[0].scroller = scroller;
		}
		if (!leaveInPlace) {
			scroller.scrollTo(0, 0);
		}
	} else {
		origDoScrollHack(element, leaveInPlace);
	}
}
