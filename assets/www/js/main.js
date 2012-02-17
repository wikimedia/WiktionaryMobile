var currentHistoryIndex = -1;

var pageHistory = [];

window.PROJECTNAME = 'wikipedia';

function init() {
	document.addEventListener("deviceready", function() {chrome.initialize(); }, true);
}

function homePage() {
	app.navigateToPage(app.baseURL);
}

function aboutPage() {
	chrome.hideOverlays();
	$("#about-page-overlay").localize().show();
	$("#aboutclose").unbind('click');
	$("#aboutclose").bind('click', function(){
		$("#about-page-overlay").hide();
		appSettings.showSettings();
	});
	chrome.doFocusHack();
}
