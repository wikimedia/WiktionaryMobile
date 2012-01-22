window.languages = function() {
	var locales = [];
	var localeCodesToNames = {};

	function loadLocales(callback) {
		$.ajax({
			type:'Get', 
			url:requestUrl, 
			success:function(data) {
				var results = JSON.parse(data);
				var allLocales = results.sitematrix;

				$.each(allLocales, function(key, value) {
					// Because the JSON result from sitematrix is messed up
					if(!isNaN(key)) {
						if(value.site.some(function(site) { return site.code == "wiki"; })) {
							locales.push({
								code: value.code,
								name: value.name
							});
							localeCodesToNames[value.code] = value.name;
						}
					}
				});
				callback();
			}
		});
	}

	function areLocalesLoaded() {
		return (locales.length != 0);
	}

	function getLocales(callback) {
		if(areLocalesLoaded()) {
			callback(locales);
		} else {
			loadLocales(function() {
				callback(locales);
			});
		}
	}

	function getLocaleCodesToNames(callback) {
		if(areLocalesLoaded()) {
			callback(localeCodesToNames);
		} else {
			loadLocales(function() {
				callback(localeCodesToNames);
			});
		}
	}

	return {
		getLocales: getLocales,
		getLocaleCodesToNames: getLocaleCodesToNames
	};

}();
