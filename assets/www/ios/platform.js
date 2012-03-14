// iOS+PhoneGap-specific setup

function getAboutVersionString() {
	return "3.1beta2";
}

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

chrome.showNotification = function(message) {
	var d = $.Deferred();
	navigator.notification.alert(message, function() {
		d.resolve();
	}, "");
	return d;
};

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
