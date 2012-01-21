window.languageLinks = function() {
	var langs = [];
	function onLanguageLinkClick() {
		var parent = $(this).parents(".listItemContainer");
		var url = parent.attr("data-page-url");
		app.navigateToPage(url);
	}

	/**
	 * Helper function for converting protocol relative urls to https
	 */
	function processLanguageUrl(url) {
		if (url.substr(0, 2) == '//') {
			url = 'https:' + url;
		}
		return url;
	}

	/**
	 * Function called with div of current page
	 * Saves languages that page is available in for use in Read-in
	 */
	function parseAvailableLanguages(body) {
		langs = [];
		body.find('#languageselection option').each(function(i, option) {
			var $option = $(this);
			langs.push({
				name: $option.text(),
				url: processLanguageUrl($option.val()),
				selected: ($option.attr('selected') != null)
			});
		});
	}

	/**
	 * Clears languages available. Also blanks out the 'Read in' menu item
	 */
	function clearLanguages() {
		langs = [];
	}

	/**
	 * Format the language list in the same style as saved pages & history,
	 * pulling link data from the iframe.
	 */
	function showAvailableLanguages() {
		var template = templates.getTemplate("language-links-template");
		$("#langList").html(template.render({languages: langs}));
		$(".languageLink").click(onLanguageLinkClick);
		chrome.hideOverlays();
		chrome.hideContent();

		$('#langlinks').localize().show();
		
		chrome.doFocusHack();
		chrome.doScrollHack('#langlinks .scroller');
	}

	return {
		showAvailableLanguages: showAvailableLanguages,
		parseAvailableLanguages: parseAvailableLanguages,
		clearLanguages: clearLanguages
	};
}();
