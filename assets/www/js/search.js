window.search = function() {
	function performSearch(term, isSuggestion) {
		if($('#search').hasClass('inProgress')) {
			network.stopCurrentRequest();
			$('#search').removeClass('inProgress');
			return;
		}
		if (network.isConnected()) {
			if (term == '') {
				chrome.showContent();
				return;
			}

			chrome.showSpinner();
			$('#search').addClass('inProgress');

			if(!isSuggestion) {
				var url = app.urlForTitle(term);
				app.navigateToPage(url);
				return;
			}

			var requestUrl = app.baseURL + "/w/api.php";
			$.ajax({
				type: 'GET',
				url: requestUrl,
				data: {
					action: 'opensearch',
					search: term,
					format: 'json'
				},
				success: function(data) {
					var results = JSON.parse( data );
					if ( results[1].length == 0 ) { 
						console.log( "Performing 'did you mean' AJAX request..." );
						getDidYouMeanResults( results );
					} else {
						renderResults(results);
					}			
				}
			});
		} else {
			chrome.showNoConnectionMessage();
			chrome.showContent();
		}
	}

	function getDidYouMeanResults(results) {
		// perform did you mean search
		var requestUrl = app.baseURL + "/w/api.php";        
		$.ajax({
   			type: 'GET',
			url: requestUrl,
			data: {
				action: 'query',
       			list: 'search',                
				srsearch: results[0],
       			srinfo: 'suggestion',
				format: 'json'
       		},
       		success: function(data) {
				var suggestion_results = JSON.parse( data );
				console.log( "Suggestion results", suggestion_results );
				if ( typeof suggestion_results.query.searchinfo != 'undefined' ) {
					console.log( "Suggestion", suggestion_results.query.searchinfo.suggestion );
					var suggestion = suggestion_results.query.searchinfo.suggestion;
					results[1] = [ suggestion ];
					renderResults( results, 'true' );
				}
			}
		});
	}

	function onSearchResultClicked() {
		var parent = $(this).parents(".listItemContainer");
		var url = parent.attr("data-page-url");
		app.navigateToPage(url);
	}

	function onCloseSearchResults() {
		chrome.hideOverlays();
	}

	function renderResults(results, didyoumean) {
		var template = templates.getTemplate('search-results-template');
		if (results.length > 0) {

			var searchParam = results[0];
			var searchResults = results[1].map(function(title) {
				return {
					key: app.urlForTitle(title),
					title: title
				};
			});
			$("#resultList").html(template.render({pages: searchResults, didyoumean: didyoumean}));
			$("#resultList .searchItem").click(onSearchResultClicked);
		}
		$(".closeSearch").click(onCloseSearchResults);
		// Replace icon of savd pages in search suggestions
		var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
			$("#resultList .listItemContainer").each(function() {
				var container = this;
				var url = $(this).attr('data-page-url');
				savedPagesDB.exists(url, function(exists) {
					if(exists) {
						$(container).find(".iconSearchResult").removeClass("iconSearchResult").addClass("iconSavedPage");
					}
				});
			});
		});

		$('#search').removeClass('inProgress');
		chrome.hideSpinner();
		chrome.hideOverlays();

		if(!chrome.isTwoColumnView()) {
			$("#content").hide(); // Not chrome.hideContent() since we want the header
		}

		chrome.doFocusHack();
		$('#searchresults').localize().show();
		chrome.doScrollHack('#searchresults .scroller');
	}

	return {
		performSearch: performSearch
	};
}();


