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
        
        $('a', frameDoc).each(function() {
            $(this).attr('href').replace('//', 'http://');
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
        $('#main').bind('load', function() {
            replaceRes();
        });
        $('#main').attr('src', cachedPage.file);
        currentHistoryIndex += 1;
//        if(!cachedPage) {
//            console.log('Fetching page from server');
//            $.ajax({url: url,
//                    success: function(data) {
//                    if(data) {
//                       $('#main').attr('src', currentLocale.url);
//                       currentHistoryIndex += 1;
//                    } else {
//                      noConnectionMsg();
//                      navigator.app.exitApp();
//                    }
//                  },
//                  error: function(xhr) {
//                    noConnectionMsg();
//                  },
//                  timeout: 3000
//            });
//        } else {
//            console.log('Fetching '+url+' from cache');
//            $('#main').attr('src', cachedPage);
//            currentHistoryIndex += 1;
//        }
    }
    var gotError = function(error) {
        console.log(error);
//        noConnectionMsg();
//        navigator.app.exitApp();
    }
    window.plugins.urlCache.getCachedPathForURI(url, gotPath, gotError);
    
}

var app = new Application();
