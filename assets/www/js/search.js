function search(isSuggestion) {
    if($('#search').hasClass('inProgress')) {
        window.frames[0].stop();
        $('#search').removeClass('inProgress');
        return;
    }
	if (hasNetworkConnection()) {
		var searchParam = $('#searchParam').val();
	
		if (searchParam == '') {
			hideOverlays();
			return;
		}
		
		showSpinner();
        $('#search').addClass('inProgress');

		var requestUrl = currentLocale.url + "/w/api.php?action=opensearch&";
		requestUrl += "search=" + encodeURIComponent(searchParam) + "&";
		requestUrl += "format=json";
        
		$.ajax({
			type:'Get',
			url:requestUrl,
			success:function(data) {
				displayResults(data, isSuggestion);
			}
		});
	}else{
		noConnectionMsg();
		hideOverlays();
	}
}

function displayResults(results, isSuggestion) {
    setActiveState();
	var formattedResults = "";
	
	if (results != null) {
		results = JSON.parse(results);
	
		if (results.length > 0) {
			var searchParam = results[0];
			var searchResults = results[1];
		
			for (var i=0;i<searchResults.length;i++) {
				var article = searchResults[i];

				if(!isSuggestion) {
					if (article.toLowerCase() == $('#searchParam').val().toLowerCase()) {
						goToResult(article);
						return;
					}
				}
				formattedResults += "<div class='listItemContainer' onclick=\"javascript:goToResult(\'" + article + "\');\">";
				formattedResults += "<div class='listItem'>";
				formattedResults += "<span class='iconSearchResult'></span>";
				formattedResults += "<span class='text'>" + article + "</span>";
				formattedResults += "</div>";
				formattedResults += "</div>";
			}
		}else{
		    formattedResults += "<div class='listItemContainer'>";
            formattedResults += "<div class='listItem'>";
            formattedResults += "<span class='iconSearchResult'></span>";
            formattedResults += "<span class='text'>No results found</span>";
            formattedResults += "</div>";
            formattedResults += "</div>";
		}
	}else{
        // no result from the server...
	}
	
	formattedResults += "<div class='listItemContainer' onclick='javascript:hideOverlays();'>";
	formattedResults += "<div class='listItem'>Close</div>";
	formattedResults += "</div>";
	
	$('#resultList').html(formattedResults);

    // Replace icon of bookmarks in search suggestions
    var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
        $("#resultList .listItemContainer").each(function() {
            var container = this;
            var text = $(container).find(".text").text();
            bookmarksDB.exists(text, function(exists) {
                if(exists) {
                    $(container).find(".iconSearchResult").removeClass("iconSearchResult").addClass("iconBookmark");
                }
            });
        });
    });

    $('#search').removeClass('inProgress');
    hideSpinner();
	hideOverlays();

	$('#searchresults').show();
	$('#content').hide();
	
}

function goToResult(article) {
	if (hasNetworkConnection()) {
	    showSpinner();
        $('#search').addClass('inProgress');
		var url = currentLocale.url + "/wiki/" + article;	
		$('#main').attr('src', url);
		hideOverlays();
	}else{
		noConnectionMsg();
	}
}

function showSpinner() {
	$('.titlebar .spinner').css({display:'block'});
	$('#clearSearch').css({height:0});
}

function hideSpinner() {
	$('.titlebar .spinner').css({display:'none'});	
	$('#clearSearch').css({height:30});
}
