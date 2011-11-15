function getSettings() {
   $('#settingsList').html('');
    getLanguages();
    PhoneGap.exec(
        function(result){
            markup = '<div class="item"><label><msg key="settings-app-version-label"></msg></label><p>' + result.version + '</p></div>' +
                '<div class="item"><label><msg key="settings-android-version-label"></msg></label><p>' + device.version + '</p></div>' +
                '<div class="item"><label><msg key="settings-phonegap-version-label"></msg></label><p>' + device.phonegap + '</p></div>' +
				'<div class="item"><label><msg key="settings-checkbox-example-label"></msg></label><p><msg key="settings-checkbox-example-desc"></msg></p><input type="checkbox"/></div>';
	        $('#settingsList').append(markup).localize();
        },
        function(error){ $('#settingsList').append(error); },
        'ApplicationVersion', 'getVersion', []
    );
}

function showSettings() {
    hideOverlayDivs();
    hideContent();
    $('#settings').localize().show();
    setActiveState();                                   
}

function getLanguages() {
  
    //$('#settings').addClass('inProgress');  
             
    console.log("get languages");          
                           
    var requestUrl = "http://en.wikipedia.org/w/api.php?action=sitematrix&format=json";

    $.ajax({
        type:'Get', 
        url:requestUrl, 
        success:function(data) {
            displayLanguages(data);
        }
    });

}

function displayLanguages(results) {

    var numberOfSites = -1;
    var markup = '';
    markup += "<form class='item'><label><msg key='settings-language-label'></msg></label><p><msg key='settings-language-desc'></msg></p><select id='localeSelector' onchange='javascript:onLocaleChanged(this.options[this.selectedIndex].value);'>";
    
    if (results != null) {
        results = JSON.parse(results);
        if (results.sitematrix) {       
            numberOfSites = parseInt(results.sitematrix.count);
            for (var i=0;i<numberOfSites;i++) {
                var locale = results.sitematrix[i.toString()];
                if (locale) {
                    var len = parseInt(JSON.stringify(locale.site.length));
                    for (var j=0;j<len;j++) {
                        if (locale.site[j].code == "wiki") {
                            if (locale.code == currentLocale.languageCode) {
                                markup += "<option value='" + locale.code + "' selected='selected'>"  + locale.name + "</option>";
                            } else {
                                markup += "<option value='" + locale.code + "'>"  + locale.name + "</option>";
                            }
                            break;
                        }
                    } 
                }             
            }
        }         
    }
    
    markup += "</select></form>";  

    $('#settingsList').append(markup).localize();

    showSettings();
    //hideProgressLoader();
    //$('#settings').removeClass('inProgress');
}

function onLocaleChanged(selectedValue) {
    
    currentLocale.languageCode = selectedValue;
    currentLocale.url = "http://" + selectedValue + ".m.wikipedia.org";
      
    // save / update currentLocale in LocalStorage
    var settingsDB = new Lawnchair({name:"settingsDB"}, function() {
        this.save({key: "locale", value: currentLocale});
    });
}