MobileFrontend = (function() {
	return {
		init: function() {
		},
		message: function(name) {
			return mw.message(name).plain();
		},
		utils: jQuery
	}
})();
