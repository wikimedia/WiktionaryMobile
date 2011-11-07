function clearBookmarks() {
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() { this.nuke() });
}

function isBookmarksMaxLimit() {
	console.log("isBookmarksMaxLimit");
	var MAX_LIMIT = 50;

	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.keys(function(records) {
			if (records != null) {
				if (records.length > MAX_LIMIT) {
					// we've reached the max limit
					// @todo this is probably not great, remove this :)
					alert(mw.message("bookmarks-max-warning").plain());
				}else{
					addBookmarkPrompt();
				}
			}
		});
	});
}

function addBookmarkPrompt() {
	var titleToBookmark = document.getElementById("main").contentDocument.title;
	var urlToBookmark = document.getElementById("main").contentWindow.location.href;
	var index = titleToBookmark.indexOf(" - Wikipedia, the free encyclopedia"); // @fixme -- horribly wrong!

	if (index > 0) {
		titleToBookmark = titleToBookmark.substring(0, index);
	}
	
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.get(titleToBookmark, function(r) {	
		
			if (r == null) {
				addBookmark(titleToBookmark, urlToBookmark);
				lightweightNotification(mw.message('bookmark-added', titleToBookmark).plain());
			} else {
				// @fixme this shouldn't happen; we should check first and
				// instead have an option to remove the page from bookmarks!
				alert(mw.message('bookmark-exists', titleToBookmark).plain());
			}
		});
	});	
}

function addBookmark(title, url) {
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.save({key: title, value: url});
	});
}


function getBookmarks() {

	$('#bookmarksList').html('');

	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.each(function(record, index) {	
			$('#bookmarksList').append(listBookmarks(record, index));
		});
	});

	showBookmarks();
}

function showBookmarks() {
	hideOverlayDivs();
	$('#bookmarks').toggle();
	hideContent();
	
	setActiveState();	
}

function listBookmarks(record, index) {
	var markup = "<div class='listItemContainer'>";
	markup += "<a class='listItem' onclick=\"javascript:onBookmarkItemClicked(\'" + record.value + "\');\">";
	markup += "<span class='iconBookmark'></span>";
	markup += "<span class='text deleteEnabled'>" + record.key + "</span>";
	markup += "</a>";
	markup += "<a class='deleteBookmark deleteButton' href=\"javascript:deleteBookmarkPrompt(\'" + record.key + "\');\"></a>";
	markup += "</div>";
	
	return markup;
}

function onBookmarkItemClicked(url, index) {
	if (hasNetworkConnection()) {
        $('#searchParam').val('');        
        showSpinner();  
        $('#search').addClass('inProgress');
		$('#main').attr('src', url);
		hideOverlays();
	}else{
		noConnectionMsg();
	}
}

function deleteBookmarkPrompt(bookmarkKey) {
	var answer = confirm(mw.message('bookmark-remove-prompt', bookmarkKey).plain());
	
	if (answer) {
		deleteBookmark(bookmarkKey);
	}
}

function deleteBookmark(bookmarkToDelete, index) {
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.remove(bookmarkToDelete, function() {
			lightweightNotification(mw.message('bookmark-removed', bookmarkToDelete).plain());
			hideOverlays();
		});
	});
}
