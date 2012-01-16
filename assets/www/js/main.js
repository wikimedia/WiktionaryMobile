var currentHistoryIndex = -1;

var pageHistory = [];

function init() {
	document.addEventListener("deviceready", function() {chrome.initialize(); }, true);
}

function twoColumnView() {
	// should match the CSS media queries
	return (document.width >= 640);
}

function hideContentIfNeeded() {
	if (!twoColumnView()) {
		// Narrow screen
		hideContent();
	}
}
function homePage() {
	app.navigateToPage(app.baseURL);
}

function aboutPage() {
	chrome.hideOverlays();
	chrome.hideContent();
	$("#about-page-overlay").localize().show();
	chrome.doFocusHack();
}
