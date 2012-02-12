window.network = function() {
	var currentXhr = null;

	function makeRequest(options) {
		// For some reason I'm unable to figure out after ~2 days of debugging
		// Using jQuery ajax instead of Zepto ajax here segfaults and force closes our app
		// So in the interest of sanity, I'll include Zepto *just for this*
		currentXhr = Zepto.ajax({
			url: options.url,
			dataType: 'text',
			success: function(data, xhr) {
				if(data == '') {
					// Sometimes we get an empty response. Why? Not sure.
					options.error(xhr);
				} else {
					options.success(data, xhr);
				}
				currentXhr = null;
			},
			error: function(xhr, data) {
				options.error(xhr);
				currentXhr = null;
			}
		});
	}

	function stopCurrentRequest() {
		if(currentXhr) {
			currentXhr.abort();
			currentXhr = null
		}
	}

	function isConnected() 
	{
		return window.navigator.onLine;
	}

	return {
		makeRequest: makeRequest,
		stopCurrentRequest: stopCurrentRequest,
		isConnected: isConnected
	};

}();
