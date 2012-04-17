window.search = function() {
	var curReq = null; // Current search request

	function stopCurrentRequest() {
		if(curReq !== null) {
			curReq.abort();
			curReq = null;
		}
	}

	function performSearch(term, isSuggestion) {
		if(term == '') {
			chrome.showContent();
			return;
		}
		chrome.showSpinner();

		if(!isSuggestion) {
			console.log('for term: ' + term);
			getFullTextSearchResults(term);
		} else {
			getSearchResults(term);
		}
	}

	function getDidYouMeanResults(results) {
		// perform did you mean search
		console.log("Performing 'did you mean' search for", results[0]);
		stopCurrentRequest();
		curReq = app.makeAPIRequest({
			action: 'query',
			list: 'search',
			srsearch: results[0],
			srinfo: 'suggestion',
			format: 'json'
		}).done(function(data) {
			var suggestion_results = data;
			var suggestion = getSuggestionFromSuggestionResults(suggestion_results);
			if(suggestion) {
				getSearchResults(suggestion, 'true');
			}
		}).fail(function(err) {
			console.log("ERROR!" + JSON.stringify(err));
		});
	}

	function getSuggestionFromSuggestionResults(suggestion_results) {
		console.log("Suggestion results", suggestion_results);
		if(typeof suggestion_results.query.searchinfo != 'undefined') {
			var suggestion = suggestion_results.query.searchinfo.suggestion;
			console.log('Suggestion found:', suggestion);
			return suggestion;
		} else {
			return false;
		}
	}

	function getFullTextSearchResults(term) {
		stopCurrentRequest();
		curReq = app.makeAPIRequest({
			action: 'query',
			list: 'search',
			srsearch: term,
			srinfo: '',
			srprop: ''
		}).done(function(data) {
			var searchResults = [];
			for(var i = 0; i < data.query.search.length; i++) {
				var result = data.query.search[i];
				searchResults.push(result.title);
			}
			renderResults([term, searchResults], false);
		}).fail(function(err) { 
			console.log("ERROR!" + JSON.stringify(err));
		});
	}

	function getSearchResults(term, didyoumean) {
		stopCurrentRequest();
		curReq = app.makeAPIRequest({
			action: 'opensearch',
			search: term
		}).done(function(data) {
			var results = data;
			if(results[1].length === 0) { 
				console.log("No results for", term);
				getDidYouMeanResults(results);
			} else {
				if(typeof didyoumean == 'undefined') {
					didyoumean = false;
				}
				console.log('Did you mean?', didyoumean);
				renderResults(results, didyoumean);
			}
		}).fail(function(err) {
			console.log("ERROR!" + JSON.stringify(err));
		});
	}

	function onSearchResultClicked() {
		var parent = $(this).parents(".listItemContainer");
		var url = parent.data("page-url");
		$("#search").focus(); // Hides the keyboard
		app.navigateToPage(url);
	}

	function onDoFullSearch() {
		performSearch($("#searchParam").val(), false);
	}

	function renderResults(results, didyoumean) {
		var template = templates.getTemplate('search-results-template');
		if(results.length > 0) {
			var searchParam = results[0];
			console.log("searchParam", searchParam);
			var searchResults = results[1].map(function(title) {
				return {
					key: app.urlForTitle(title),
					title: title
				};
			});
			if(didyoumean) {
				var didyoumean_link = {
					key: app.urlForTitle(results[0]),
					title: results[0]
				};
				$("#resultList").html(template.render({'pages': searchResults, 'didyoumean': didyoumean_link}));
			} else {
				$("#resultList").html(template.render({'pages': searchResults}));
			}
			$("#resultList .searchItem").click(onSearchResultClicked);
		}
		$("#doFullSearch").click(onDoFullSearch);
		chrome.hideSpinner();
		chrome.hideOverlays();
		if(!chrome.isTwoColumnView()) {
			$("#content").hide(); // Not chrome.hideContent() since we want the header
		} else {
			$("html").addClass('overlay-open');
		}
		chrome.doFocusHack();
		$('#searchresults').localize().show();
		chrome.setupScrolling('#searchresults .scroller');
		chrome.scrollTo('#searchresults .scroller', 0);
	}

	return {
		performSearch: performSearch
	};
}();

