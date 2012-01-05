
/**
 * Protocol-relative data will break against our 'file://' pages :)
 * @param url string
 * @returns string
 */
function processLanguageUrl(url) {
	if (url.substr(0, 2) == '//') {
		url = 'https:' + url;
	}
	return url;
}

/**
 * Format the language list in the same style as bookmarks & history,
 * pulling link data from the iframe.
 */
function langLinkSelector(languages) {
	var $list = $('#langList').empty();

	$.each(languages, function(i, lang) {
		$("<div class='listItemContainer'>" +
			"<a class='listItem'>" +
			"<span class='text'></span>" +
			"</a>" +
			"</div>")
		.find('.text')
			.text(lang.name)
			.end()
		.find('a')
			.click(function() {
				navigateToPage(lang.url);
				hideOverlays();
			})
			.end()
		.appendTo($list);
	});
}

function selectLanguage() {
	langLinkSelector(app.getLangLinks());

	hideOverlayDivs();
	$('#langlinks').localize().show();
	hideContent();
	
	setActiveState();	
}
