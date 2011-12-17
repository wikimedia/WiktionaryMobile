function clearSavedPages() {
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() { this.nuke() });
}

function savePage() {
	var MAX_LIMIT = 50;

	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.keys(function(records) {
			if (records != null) {
				if (records.length > MAX_LIMIT) {
					// we've reached the max limit
					// @todo this is probably not great, remove this :)
					alert(mw.message("saved-pages-max-warning").plain());
				}else{
					savePagePrompt();
				}
			}
		});
	});
}

function savePagePrompt() {
	var title = currentPageTitle();
	var url = currentPageUrl();
	
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.get(title, function(r) {	
		
			if (r == null) {
				bookmarksDB.save({key: title, value: url});

				// Cache the URL...
				console.log('saving page: ' + url);
				navigateToPage(url, {
					cache: true,
					updateHistory: false
				});
				lightweightNotification(mw.message('page-saved', title).plain());
			} else {
				// @fixme this shouldn't happen; we should check first and
				// instead have an option to remove the page from saved pages!
				alert(mw.message('page-already-saved', title).plain());
			}
		});
	});	
}

function showSavedPages() {
	$('#savedPagesList').html('');

	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.each(function(record, index) {	
			$('#savedPagesList').prepend(formatSavedPageEntry(record));
		});
	});

	hideOverlayDivs();
	$('#savedPages').toggle();
	hideContent();
	
	setActiveState();	
}

function formatSavedPageEntry(record) {
	var markup = "<div class='listItemContainer' data-page-title='" + record.key + "'>";
	markup += "<a class='listItem' onclick=\"javascript:onSavedPageClicked(\'" + record.value + "\');\">";
	markup += "<span class='iconSavedPage'></span>";
	markup += "<span class='text deleteEnabled'>" + record.key + "</span>";
	markup += "</a>";
	markup += "<a class='deleteSavedPage deleteButton' href=\"javascript:deleteSavedPagePrompt(\'" + record.key + "\');\"></a>";
	markup += "</div>";
	
	return markup;
}

function onSavedPageClicked(url) {
	// Load cached page!
	$('#searchParam').val('');        
	showSpinner();  
	$('#search').addClass('inProgress');
	navigateToPage(url, {cache: true});
	hideOverlays();
}

function deleteSavedPagePrompt(key) {
	var answer = confirm(mw.message('saved-page-remove-prompt', key).plain());

	if (answer) {
		var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
			this.remove(key, function() {
				lightweightNotification(mw.message('saved-page-removed', key).plain());
				$(".listItemContainer[data-page-title='" + key + "']").hide();
			});
		});
	}
}

