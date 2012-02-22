var currentHistoryIndex = -1;

var pageHistory = [];

window.PROJECTNAME = 'wikipedia';
(function() {
	var url_parts = location.href.split('/');
	delete url_parts[url_parts.length - 1];
	window.ROOT_URL = url_parts.join('/');
})()
window.CREDITS = [
	"<a href='http://jquery.com'>jQuery</a>, MIT License",
	"<a href='http://leaflet.cloudmade.com/'>Leaflet.js</a>, 2-Clause BSD License",
	"<a href='http://zeptojs.com'>Zepto</a>, MIT License",
	"<a href='http://cubiq.org/iscroll-4'>iScroll</a>, MIT License",
	"<a href='http://twitter.github.com/hogan.js/'>Hogan.js</a>, Apache License 2.0"
	];

function init() {
	document.addEventListener("deviceready", function() {chrome.initialize(); }, true);
}

function homePage() {
	app.navigateToPage(app.baseURL);
}

function aboutPage() {
	chrome.hideOverlays();
	$.get(ROOT_URL + 'AUTHORS').then(function(authors) { 
		$("#about-contributors").text($.trim(authors).split('\n').join(', '));
		$("#about-credits").html(window.CREDITS.join('<br />'));
		chrome.hideOverlays();
		chrome.hideContent();
		$("#about-page-overlay").localize().show();
		$("#aboutclose").unbind('click');
		$("#aboutclose").bind('click', function(){
			$("#about-page-overlay").hide();
			appSettings.showSettings();
		});
		chrome.doFocusHack();
	});
}
