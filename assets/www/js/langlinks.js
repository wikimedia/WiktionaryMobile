window.languageLinks = function() {
	var langs = [];
	function onLanguageLinkClick() {
		var parent = $(this).parents(".listItemContainer");
		var title = parent.data("title");
		var lang = parent.data("lang");
		chrome.hideContent();
		chrome.showSpinner();
		app.navigateTo(title, lang);
	}

	function showLangLinks(page) {
		chrome.showSpinner();
		page.requestLangLinks().done(function(langLinks) {
			var template = templates.getTemplate("language-links-template");
			app.getWikiMetadata().done(function(wikis) {
				$.each(langLinks, function(i, link) {
					link.dir = l10n.isLangRTL(link.lang) ? "rtl" : "ltr";
					link.langName = wikis[link.lang].name;
				});
				langLinks.sort(function(l1, l2) {
					return l1.langName.localeCompare(l2.langName);
				});
				$("#langList").html(template.render({langLinks: langLinks}));
				$(".languageLink").click(onLanguageLinkClick);
				chrome.hideOverlays();
				chrome.hideContent();
				chrome.hideSpinner();
				$('#langlinks').localize().show();

				chrome.setupScrolling('#langlinks .scroller');
			});
		}).fail(function(err, xhr) {
			chrome.hideSpinner();
			chrome.popupErrorMessage(xhr);
		});
	}

	return {
		showLangLinks: showLangLinks
	};
}();
