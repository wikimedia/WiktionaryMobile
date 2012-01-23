window.languages = function() {
	var languages = [];
	var languageCodesToNames = {};
	var requestUrl = "https://en.wiktionary.org/w/api.php?action=sitematrix&format=json";

	function loadLanguages(callback) {
		$.ajax({
			type:'Get', 
			url:requestUrl, 
			success:function(data) {
				var results = JSON.parse(data);
				var allLanguages = results.sitematrix;

				$.each(allLanguages, function(key, value) {
					// Because the JSON result from sitematrix is messed up
					if(!isNaN(key)) {
						if(value.site.some(function(site) { return site.code == "wiki"; })) {
							languages.push({
								code: value.code,
								name: value.name
							});
							languageCodesToNames[value.code] = value.name;
						}
					}
				});
				callback();
			}
		});
	}

	function areLanguagesLoaded() {
		return (languages.length != 0);
	}

	function getLanguages(callback) {
		if(areLanguagesLoaded()) {
			callback(languages);
		} else {
			loadLanguages(function() {
				callback(languages);
			});
		}
	}

	function getLanguageCodesToNames(callback) {
		if(areLanguagesLoaded()) {
			callback(languageCodesToNames);
		} else {
			loadLanguages(function() {
				callback(languageCodesToNames);
			});
		}
	}

	return {
		getLanguages: getLanguages,
		getLanguageCodesToNames: getLanguageCodesToNames
	};

}();
