// playbook + webworks

window.addEventListener('load', function() {
	chrome.initialize();
}, true);

function getAboutVersionString() {
	return "1.1.WebWorks";
}

chrome.openExternalLink = function(url) {
	blackberry.invoke.invoke(blackberry.invoke.APP_BROWSER,
		new blackberry.invoke.BrowserArguments(url));
}

// removes the 'save' button since saving is broken on Playbook
// @Override
function showPageActions(origin) {
	var title = app.getCurrentTitle(),
	url = app.getCurrentUrl().replace(/\.m\.wikipedia/, '.wikipedia');
	
	// @fixme add more items?
	popupMenu([
		mw.msg('share-open-browser'),
		mw.msg('menu-cancel')
	], function(val, index) {
		if (index == 0) {
			chrome.openExternalLink(url);
		}
	}, {
		cancelButtonIndex: 1,
		origin: origin
	});
}

// removes the "saved pages" button since saving is broken on Playbook
// @Override
function showListActions(origin) {
	popupMenu([
		mw.msg('menu-nearby'),
		mw.msg('menu-history'),
		mw.msg('menu-cancel')
	], function(val, index) {
		if (index == 0) {
			geo.showNearbyArticles();
		} else if (index == 1) {
			appHistory.showHistory();
		}
	}, {
		cancelButtonIndex: 2,
		origin: origin
	});
}
