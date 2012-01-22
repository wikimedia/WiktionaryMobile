window.appSettings = function() {
	var fontSizes = [];	

	function showSettings(callback) {
		var requestUrl = "https://en.wiktionary.org/w/api.php?action=sitematrix&format=json";

		if(fontSizes.length == 0) {
			fontSizes = [
				{value: '75%', name: mw.message('settings-font-size-smaller').plain() },
				{value: '100%', name: mw.message('settings-font-size-normal').plain() },
				{value: '125%', name: mw.message('settings-font-size-larger').plain() }
			];
		}

		languages.getLocales(renderSettings);
	}

	function renderSettings(locales) {
		var template = templates.getTemplate('settings-page-template');
		$("#settingsList").html(template.render({languages: locales, fontSizes: fontSizes, aboutPage: aboutPage}));
		$("#contentLanguageSelector").val(preferencesDB.get("language")).change(onContentLanguageChanged);
		$("#selectedLanguage").html(preferencesDB.get("language"));	
		$("#fontSizeSelector").val(preferencesDB.get("fontSize")).change(onFontSizeChanged);
        $("#aboutPageLabel").click(function () { 
                                   aboutPage();
                                   });
       
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
