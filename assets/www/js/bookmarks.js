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
					alert("You've reached the maximum number of bookmarks.");
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
	var index = titleToBookmark.indexOf(" - Wikipedia, the free encyclopedia");

	if (index > 0) {
		titleToBookmark = titleToBookmark.substring(0, index);
	}
	
	var answer = confirm("Add " + titleToBookmark + " to bookmarks?")
	
	if (answer) {		
		var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
			this.get(titleToBookmark, function(r) {	
			
				if (r == null) {
					addBookmark(titleToBookmark, urlToBookmark);
				}else{
					alert(titleToBookmark + " already exists in bookmarks.");
				}
			});
		});	
	}
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

function hideBookmarks() {
	hideOverlayDivs();
	showContent();
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
	//$('#bookmarksList').append(markup);	
}

function onBookmarkItemClicked(url, index) {
	if (hasNetworkConnection()) {
    $('#searchParam').val('');
    $('#search').addClass('inProgress');
//		showProgressLoader(mw.message('spinner-loading').plain(),
//		                   mw.message('spinner-retrieving', mw.message('sitename').plain()).plain());
		$('#main').attr('src', url);
		hideOverlayDivs();
		showContent();
	}else{
		noConnectionMsg();
	}
}

function deleteBookmarkPrompt(bookmarkKey) {
	var answer = confirm("Remove " + bookmarkKey + " from bookmarks?")
	
	if (answer) {
		deleteBookmark(bookmarkKey);
	}
}

function deleteBookmark(bookmarkToDelete, index) {
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.remove(bookmarkToDelete, function() {
			alert(bookmarkToDelete + " has been removed.");
			hideOverlayDivs();
			showContent();
		});
	});
}
