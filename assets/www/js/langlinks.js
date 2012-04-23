window.languageLinks = function() {
	var langs = [];
	function onLanguageLinkClick() {
		var parent = $(this).parents(".listItemContainer");
		var title = parent.data("title");
		var lang = parent.data("lang");
		chrome.hideContent();
		chrome.showSpinner();
		Page.requestFromTitle(title, lang).done(function(page) {
			app.setCurrentPage(page);
		});
	}

	function showLangLinks(page) {
		chrome.showSpinner();
		page.requestLangLinks().done(function(langLinks) {
			var template = templates.getTemplate("language-links-template");
			$("#langList").html(template.render({langLinks: langLinks}));
			$(".languageLink").click(onLanguageLinkClick);
			chrome.hideOverlays();
			chrome.hideContent();
			chrome.hideSpinner();
			$('#langlinks').localize().show();

			chrome.setupScrolling('#langList');
		});
	}

	return {
		showLangLinks: showLangLinks
	};
}();
