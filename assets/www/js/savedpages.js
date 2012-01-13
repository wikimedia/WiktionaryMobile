window.savedPages = function() {

	function saveCurrentPage() {
		var MAX_LIMIT = 50;

		var title = currentPageTitle();
		var url = currentPageUrl();

		var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
			this.keys(function(records) {
				if (records != null) {
					if (records.length > MAX_LIMIT) {
						// we've reached the max limit
						// @todo this is probably not great, remove this :)
						alert(mw.message("saved-pages-max-warning").plain());
					}else{
						savedPagesDB.save({key: url, title: title});
						app.navigateToPage(url, {
							cache: true,
							updateHistory: false
						});
						chrome.lightweightNotification(mw.message('page-saved', title).plain());
					}
				}
			});
		});
	}

	function onSavedPageClick() {
		var parent = $(this).parents(".listItemContainer");
		var url = parent.attr("data-page-url");
		app.navigateToPage(url, {cache: true});
		hideOverlays();
	}

	function onSavedPageDelete() {
		var parent = $(this).parents(".listItemContainer");
		var url = parent.attr("data-page-url");
		var title = parent.attr("data-page-title");
		deleteSavedPage(title, url);
	}

	function deleteSavedPage(title, url) {
		var answer = confirm(mw.message('saved-page-remove-prompt', title).plain());

		if (answer) {
			var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
				this.remove(url, function() {
					chrome.lightweightNotification(mw.message('saved-page-removed', title ).plain());
					$(".listItemContainer[data-page-url=\'" + url + "\']").hide();
				});
			});
		}
	}

	function showSavedPages() {
		var template = templates.getTemplate('saved-pages-template');
		var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
			this.all(function(savedpages) {	
				$('#savedPagesList').html(template.render({'pages': savedpages}));
				$(".savedPage").click(onSavedPageClick);
				$(".deleteSavedPage").click(onSavedPageDelete);
			});
		});

		hideOverlayDivs();
		$('#savedPages').toggle();
		hideContentIfNeeded();
		
		setActiveState();	
	}

	return {
		showSavedPages: showSavedPages,
		saveCurrentPage: saveCurrentPage
	};
}();
