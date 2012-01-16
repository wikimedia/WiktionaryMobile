window.appSettings = function() {
	// Font options configuration
	var fontSizes = [
	 {value: '75%', msg: 'settings-font-size-smaller'},
	 {value: '100%', msg: 'settings-font-size-normal'},
	 {value: '125%', msg: 'settings-font-size-larger'}
	];

	function showSettings(callback) {
		var requestUrl = "https://en.wikipedia.org/w/api.php?action=sitematrix&format=json";

		$.ajax({
			type:'Get', 
			url:requestUrl, 
			success:function(data) {
				var results = JSON.parse(data);
				var locales = results.sitematrix;

				// Needs to be fixed to handle keys/values properly
				var usableLocales = locales.filter(function(locale) {
					return locale.site.some(function(site) {
						site.code == "wiki";
					});
				});
				renderSettings(usableLocales, fontSizes);
				chrome.hideOverlays();
				chrome.hideContent();
				$('#settings').localize().show();
				chrome.doFocusHack();                                   
			}
		});

	}

	function renderSettings(locales, fontSettings) {
		var template = templates.getTemplate('settings-page-template');
		$("#settingsList").html(template.render({languages: locales, fontSizes: fontSizes}));
		$("#contentLanguageSelector").val(preferencesDB.get("language")).change(onContentLanguageChanged);
		$("#fontSizeSelector").val(preferencesDB.get("fontSize")).change(onFontSizeChanged);
	}

	function onContentLanguageChanged() {
		var selectedLanguage = $(this).val();
		app.setContentLanguage(selectedLanguage);
		homePage();
	}

	function onFontSizeChanged() {
		var selectedFontSize = $(this).val();
		app.setFontSize(size);
		chrome.showContent();
	}

	return {
		showSettings: showSettings
	};
}();
