/*
Custom JS for viewing Wiktionary in mobile app.
*/

window.wiktionary = function() {

	function onPageLoad() {
		wm_toggle_section(1);
	}

	return {
		onPageLoad: onPageLoad
	};

}();
