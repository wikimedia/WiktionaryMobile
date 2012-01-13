window.network = function() {
	var currentXhr = null;

	function makeRequest(options) {
		currentXhr = $.ajax({
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
