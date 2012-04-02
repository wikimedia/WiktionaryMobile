/*
Custom JS for viewing Wiktionary in mobile app.
*/

window.wiktionary = function() {

	function onPageLoad() {
	}

	function afterPageLoad() {
		// If no section is open, then toggle open the first section
		if ($('.openSection').length === 0 && $('#section_1').length > 0) {
			MobileFrontend.toggle.wm_toggle_section(1);
		}
	}

	return {
		onPageLoad: onPageLoad,
		afterPageLoad: afterPageLoad
	};

}();
