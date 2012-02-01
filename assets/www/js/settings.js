window.appSettings = function() {
	var fontSizes = [];	

	function showSettings(callback) {
		if(fontSizes.length == 0) {
			fontSizes = [
				{value: '75%', name: mw.message('settings-font-size-smaller').plain() },
				{value: '100%', name: mw.message('settings-font-size-normal').plain() },
				{value: '125%', name: mw.message('settings-font-size-larger').plain() }
			];
		}

		languages.getLanguages(renderSettings);
	}

	function renderSettings(locales) {
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
