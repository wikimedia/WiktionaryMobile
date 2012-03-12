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
