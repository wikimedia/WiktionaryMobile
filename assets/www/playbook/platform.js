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

function sharePage() {
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
		cancelButtonIndex: 1
	});
}
