function getSettings() {
    getLanguages();
    //showSettings();
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
    //showProgressLoader(mw.message('spinner-loading').plain(),
    //    mw.message('spinner-retrieving', mw.message('sitename').plain()).plain());
      
    //$('#settings').addClass('inProgress');  
             
    console.log("get languages");          
                           
    var requestUrl = "http://en.wikipedia.org/w/api.php?action=sitematrix&format=json";

    $.ajax({type:'Get', url:requestUrl, success:function(data) {displayLanguages(data);}});

}

function displayLanguages(results) {

    var numberOfSites = -1;
    var markup = '';
    
    if (results != null) {

        results = JSON.parse(results);
        
        markup += "<form><select id='localeSelector'>";

        if (results.sitematrix) {       
            numberOfSites = parseInt(results.sitematrix.count);

            for (var i=0;i<numberOfSites;i++) {
                var locale = results.sitematrix[i.toString()];
                
                if (locale) {
 
                    var len = parseInt(JSON.stringify(locale.site.length));
                
                    for (var j=0;j<len;j++) {
                        if (locale.site[j].code == "wiki") {
                            markup += "<option value='" + locale.site[j].url + "'>"  + locale.name + "</option>";
                            break;
                        }
                    } 
                }             
            }
        }

        markup += "</select></form>";
        $('#settings').html(markup);
    }
    
    showSettings();
    //hideProgressLoader();
    //$('#settings').removeClass('inProgress');
}

