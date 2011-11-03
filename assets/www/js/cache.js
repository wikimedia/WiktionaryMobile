function Application() {}

Application.prototype.setRootPage = function(url) {
    var replaceRes = function() {
        var frameDoc = $("#main")[0].contentDocument;
        // links rel
        $('link', frameDoc).each(function() {
            var em = $(this);
            var gotLinkPath = function(linkPath) {
                em.attr('href', linkPath.file);
            }
            window.plugins.urlCache.getCachedPathForURI(this.href.replace('file:', 'http:'), gotLinkPath, gotError);
        });
        
        $('a[href^="/wiki/"]', frameDoc).each(function() {
            $(this).attr('href', currentLocale.url + this.href.replace('file://', '') );
        });

        // images
        $('img', frameDoc).each(function() {
            var em = $(this);
            var gotLinkPath = function(linkPath) {
                em.attr('src', linkPath.file);
            }
            window.plugins.urlCache.getCachedPathForURI(this.src.replace('file:', 'http:'), gotLinkPath, gotError);
        });
    };
    var gotPath = function(cachedPage) {
        $('#main').one('load', function() {
            replaceRes();
        });
        $('#main').attr('src', cachedPage.file);
        currentHistoryIndex += 1;
    }
    var gotError = function(error) {
        console.log(error);
//        noConnectionMsg();
//        navigator.app.exitApp();
    }
    //window.plugins.urlCache.getCachedPathForURI(url, gotPath, gotError);
    $('#main').attr('src', url);
    currentHistoryIndex += 1;
    
}

var app = new Application();
