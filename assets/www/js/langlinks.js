/**
 * Fetch language links from the iframe.
 *
 * @return array of {name: string, url: string, selected: bool} objects
 */
function getLangLinks() {
	var langs = [],
		win = $('#main')[0].contentWindow,
		doc = win.document;

	$('#languageselection option', doc).each(function(i, option) {
		var $option = $(this);
		langs.push({
			name: $option.text(),
			url: processLanguageUrl($option.val()),
			selected: ($option.attr('selected') != null)
		});
	});
	
	return langs;
}

/**
 * Protocol-relative data will break against our 'file://' pages :)
 * @param url string
 * @returns string
 */
function processLanguageUrl(url) {
	if (url.substr(0, 2) == '//') {
		url = 'http:' + url;
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
		        showSpinner();
		        $('#search').addClass('inProgress');
				$('#main').attr('src', lang.url);
		        currentHistoryIndex += 1;
				hideOverlays();
			})
			.end()
		.appendTo($list);
	});
}

function selectLanguage() {
	langLinkSelector(getLangLinks());
	$($('#langlinks .titlebarItem')[0]).text(mw.message('langlinks-title').plain());

	hideOverlayDivs();
	$('#langlinks').toggle();
	hideContent();
	
	setActiveState();	
}