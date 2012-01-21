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
					renderResults(data);
				}
			});
		} else {
			chrome.showNoConnectionMessage();
			chrome.showContent();
		}
	}


	function onSearchResultClicked() {
		var parent = $(this).parents(".listItemContainer");
		var url = parent.attr("data-page-url");
		app.navigateToPage(url);
	}

	function onCloseSearchResults() {
		chrome.hideOverlays();
	}

	function renderResults(results) {

		results = JSON.parse(results);
		var template = templates.getTemplate('search-results-template');
		if (results.length > 0) {
			var searchParam = results[0];
			var searchResults = results[1].map(function(title) {
				return {
					key: app.urlForTitle(title),
					title: title
				};
			});
			$("#resultList").html(template.render({pages: searchResults}));
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
		$('#searchresults').show();
		chrome.doScrollHack('#searchresults .scroller');
	}

	return {
		performSearch: performSearch
	};
}();
