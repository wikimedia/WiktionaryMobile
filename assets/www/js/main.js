var currentHistoryIndex = -1;

var pageHistory = [];

function init() {
	document.addEventListener("deviceready", function() {chrome.initialize(); }, true);
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
