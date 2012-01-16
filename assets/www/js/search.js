window.search = function() {
	function performSearch(term, isSuggestion) {
		if($('#search').hasClass('inProgress')) {
			app.network.stopCurrentRequest();
			$('#search').removeClass('inProgress');
			return;
		}
		if (network.isConnected()) {
			if (term == '') {
				chrome.chrome.showContent();
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

	function renderResults(results) {
		chrome.doFocusHack();

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
<<<<<<< HEAD
<<<<<<< HEAD
	});

	$('#search').removeClass('inProgress');
	chrome.hideSpinner();
	hideOverlays();

	$('#searchresults').show();
	if (!twoColumnView()) {
		// Narrow screen
		$('#content').hide();
		// leave header intact
	}

	
}

function goToResult(url) {
	if (network.isConnected()) {
		app.navigateToPage(url);
		if (!twoColumnView()) {
			hideOverlays();
		}
	} else {
		noConnectionMsg();
=======
=======
>>>>>>> Moved most UI things out of main into chrome.js

		$('#search').removeClass('inProgress');
		chrome.hideSpinner();
		chrome.hideOverlays();

		$('#searchresults').show();
	}

	return {
		performSearch: performSearch
	};
}();
