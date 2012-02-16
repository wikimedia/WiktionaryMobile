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
				type:'GET', 
				url:requestUrl, 
				dataType: 'json',
				success:function(results) {
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
					chrome.hideSpinner();
					renderSettings();
				}
			});
		} else {
			chrome.hideSpinner();
			renderSettings();
		}

	}

	function renderSettings() {
		var template = templates.getTemplate('settings-page-template');
		$("#settingsList").html(template.render({languages: locales, fontSizes: fontSizes, aboutPage: aboutPage}));

		var currentContentLanguage = preferencesDB.get("language");		
		$("#contentLanguageSelector").val(currentContentLanguage).change(onContentLanguageChanged);
		
		/* Look up the human readable form of the languagecode */ 
		$.each(locales, function(index, value) {
			if( value.code == currentContentLanguage) {
				currentContentLanguage = value.name;
				return;
			}
		});
		$("#selectedLanguage").html(currentContentLanguage);	
		$("#fontSizeSelector").val(preferencesDB.get("fontSize")).change(onFontSizeChanged);
        $("#aboutPageLabel").click(function () { 
                                   aboutPage();
                                   });
       
		chrome.hideOverlays();
		chrome.hideContent();
		$('#settings').localize().show();
		chrome.doFocusHack();                                   
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
