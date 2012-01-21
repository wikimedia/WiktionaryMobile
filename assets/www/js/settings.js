window.appSettings = function() {
	var fontSizes = [];	
	var locales = [];

	function showSettings(callback) {
		var requestUrl = "https://en.wikipedia.org/w/api.php?action=sitematrix&format=json";

		if(fontSizes.length == 0) {
			fontSizes = [
				{value: '75%', name: mw.message('settings-font-size-smaller').plain() },
				{value: '100%', name: mw.message('settings-font-size-normal').plain() },
				{value: '125%', name: mw.message('settings-font-size-larger').plain() }
			];
		}

		if(locales.length == 0) {
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
							}
						}
					});
					renderSettings();
				}
			});
		} else {
			renderSettings();
		}

	}

	function renderSettings() {
		var template = templates.getTemplate('settings-page-template');
		$("#settingsList").html(template.render({languages: locales, fontSizes: fontSizes}));
		$("#contentLanguageSelector").val(preferencesDB.get("language")).change(onContentLanguageChanged);
		$("#selectedLanguage").html(preferencesDB.get("language"));	
		$("#fontSizeSelector").val(preferencesDB.get("fontSize")).change(onFontSizeChanged);
		chrome.hideOverlays();
		chrome.hideContent();
		$('#settings').localize().show();
		chrome.doFocusHack();                                   
		chrome.doScrollHack('#settings .scroller');
	}

	function onContentLanguageChanged() {
		var selectedLanguage = $(this).val();
		app.setContentLanguage(selectedLanguage);
		homePage();
	}

	function onFontSizeChanged() {
		var selectedFontSize = $(this).val();
		app.setFontSize(selectedFontSize);
		chrome.showContent();
	}

	return {
		showSettings: showSettings
	};
}();
