/*
Custom JS for viewing Wiktionary in mobile app.
*/

window.wiktionary = function() {

	function onPageLoad() {
		// TODO(pfhayes): Should OPEN, not toggle
		//wm_toggle_section(1);
	}

	return {
		onPageLoad: onPageLoad
	};

}();
