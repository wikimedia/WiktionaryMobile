/*
Custom JS for viewing Wiktionary in mobile app.
*/

window.wiktionary = function() {

	function openSection(idx) {
		// TODO(pfhayes): Should OPEN, not toggle
		wm_toggle_section(idx);
	}

	function onPageLoad() {
		languages.getLanguageCodesToNames(function(languageCodesToNames) {
			var langCode = preferencesDB.get('language');
			var langName = languageCodesToNames[langCode];

			var relevantSections = $();
			if (langName) {
				// Find the relevant sections
				relevantSections = $('#content h2').not(function(index) {
					return !($(this).children('span').attr('id') == langName);
				});
			}

			if (relevantSections.length > 0) {
				relevantSections.each(function() {
					var sectionId = Number($(this).attr('id').replace('section_', ''));
					openSection(sectionId);
				});
			} else {
				// We do not have language information for this user
				// Open up the first section
				openSection(1);
			}
		});
	}

	return {
		onPageLoad: onPageLoad
	};

}();
