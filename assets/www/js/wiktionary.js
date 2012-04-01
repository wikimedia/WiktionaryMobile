/*
Custom JS for viewing Wiktionary in mobile app.
*/

window.wiktionary = function() {

	function onPageLoad() {
	}

	function afterPageLoad() {
		// TODO(pfhayes): Should OPEN, not toggle
		MobileFrontend.toggle.wm_toggle_section(1);
	}

	return {
		onPageLoad: onPageLoad,
		afterPageLoad: afterPageLoad
	};

}();
