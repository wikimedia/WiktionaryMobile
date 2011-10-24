function getSettings() {
    getLanguages();
}

function showSettings() {
    hideOverlayDivs();
    hideContent();
    $('#settings').show();
    setActiveState();                                   
}

function hideSettings() {
    hideOverlayDivs();
    showContent();
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
    markup += "<form><select id='localeSelector' onchange='javascript:onLocaleChanged(this.options[this.selectedIndex]);'>";
    
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
                            markup += "<option value='" + locale.code + "|" + locale.site[j].url + "'>"  + locale.name + "</option>";
                            break;
                        }
                    } 
                }             
            }
        }         
    }
    
    markup += "</select></form>";  
    $('#settings').html(markup);
    
    showSettings();
    //hideProgressLoader();
    //$('#settings').removeClass('inProgress');
}

function onLocaleChanged(selectedItem) {
    alert(selectedItem.value);
    
    var locale = selectedItem.value.split("|");
    
    if (locale.length > 0) {
        currentLocale.languageCode = locale[0];
        currentLocale.url = locale[1];
        
        // save / update currentLocale in LocalStorage
        var settingsDB = new Lawnchair({name:"settingsDB"}, function() {
            this.save({key: "locale", value: currentLocale});
        });
    }
    
}