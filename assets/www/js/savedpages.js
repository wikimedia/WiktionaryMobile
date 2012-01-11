function savedPages() {

}

function savePage() {
	var MAX_LIMIT = 50;

	var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
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
	
	var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
		this.get(url, function(r) {	
		
			if (r == null) {
				savedPagesDB.save({key: url, title: title});

				// Cache the URL...
				console.log('saving page: ' + url);
				app.navigateToPage(url, {
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

	var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
		this.each(function(record, index) {	
			$('#savedPagesList').prepend(formatSavedPageEntry(record));
		});
	});

	hideOverlayDivs();
	$('#savedPages').toggle();
	hideContentIfNeeded();
	
	setActiveState();	
}

function formatSavedPageEntry(record) {
	var template = app.templates.getTemplate("saved-page-item-template");
	var data = {
		url: record.key,
		title: record.title
	};

	return template.render(data);
}

function onSavedPageClicked(url) {
	// Load cached page!
	app.navigateToPage(url, {cache: true});
	hideOverlays();
}

function deleteSavedPagePrompt(title, url) {
	var answer = confirm(mw.message('saved-page-remove-prompt', title).plain());

	if (answer) {
		var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
			this.remove(url, function() {
				lightweightNotification(mw.message('saved-page-removed', title ).plain());
				$(".listItemContainer[data-page-url=\'" + url + "\']").hide();
			});
		});
	}
}

