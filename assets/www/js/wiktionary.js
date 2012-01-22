/*
Custom JS for viewing Wiktionary in mobile app.
*/

window.wiktionary = function() {

	function onPageLoad() {

		// Move the user's section up to the top, and open it up
		wm_toggle_section(1);
	}

	return {
		onPageLoad: onPageLoad
	};

}();
