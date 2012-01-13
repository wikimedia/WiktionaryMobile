window.chrome = function() {
	var menu_handlers = {
		'read-in': function() { languageLinks.showAvailableLanguages(); },
		'near-me': function() { getCurrentPosition(); },
		'view-history': function() { getHistory(); } ,
		'save-page': function() { savedPages.saveCurrentPage() },
		'view-saved-pages': function() { savedPages.showSavedPages(); },
		'share-page': function() { sharePage(); },
		'go-forward': function() { goForward(); },
		'select-text': function() { selectText(); },
		'view-settings': function() { getSettings(); },
		'view-about': function() { aboutPage(); }
	};

	return {
		menu_handlers: menu_handlers
	};
}();
