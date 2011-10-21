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
    showProgressLoader(mw.message('spinner-loading').plain(),
        mw.message('spinner-retrieving', mw.message('sitename').plain()).plain());
                           
    var requestUrl = "http://en.wikipedia.org/w/api.php?action=sitematrix&";
    requestUrl += "format=json";

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
    
    /*
    markup += '<header>';
    markup += '<div class=\'titlebar\'>';
    markup += '<div class=\'titlebarItem\'>Settings</div>';
    markup += '<div class=\'titlebarItem closeButton\' onclick=\'javascript:hideSettings();\'></div>';
    markup += '</div>';
    markup += '</header>';
    */
    
    markup += '<form><select id=\'localeSelector\'>';
    
    if (results != null) {
        results = eval(results);

        if (results.sitematrix) {       
            for (var site in results.sitematrix) {
                numberOfSites++;
            }

            for (var i=0;i<numberOfSites;i++) {
                var locale = results.sitematrix[i.toString()];
                
                if (locale) {
 
                    var len = parseInt(JSON.stringify(locale.site.length));
                
                    for (var j=0;j<len;j++) {
                        if (locale.site[j].code == "wiki") {
                            markup += '<option value=\'' + locale.site[j].url + '\'>'  + locale.name + '</option>';
                            break;
                        }
                    } 
                }             
            }
 
            markup+="</select></form>";
            $('#settings').html(markup);

        }
    }
    
    showSettings();
    hideProgressLoader();
}
