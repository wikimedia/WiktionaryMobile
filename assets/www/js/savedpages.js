function savedPages() {

}

function savePage() {
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
					lightweightNotification(mw.message('page-saved', title).plain());
				}
			}
		});
	});
}

function showSavedPages() {
	var template = app.templates.getTemplate('saved-pages-template');
	var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
		this.all(function(savedpages) {	
			$('#savedPagesList').html(template.render({'pages': savedpages}));
		});
	});

	hideOverlayDivs();
	$('#savedPages').toggle();
	hideContentIfNeeded();
	
	setActiveState();	
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

