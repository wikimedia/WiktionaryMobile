function clearBookmarks()
{
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() { this.nuke() });
}

function isBookmarksMaxLimit()
{
	var MAX_LIMIT = 50;

	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.keys(function(records) {
			if (records != null)
			{
				if (records.length > MAX_LIMIT)
				{
					// we've reached the max limit
					alert("You've reached the maximum number of bookmarks.");
				}
				else
				{
					addBookmarkPrompt();
				}
			}
		});
	});
}

function addBookmarkPrompt()
{
	var titleToBookmark = document.getElementById("main").contentDocument.title;
	var urlToBookmark = document.getElementById("main").contentWindow.location.href;
	var index = titleToBookmark.indexOf(" - Wikipedia, the free encyclopedia");

	if (index > 0)
	{
		titleToBookmark = titleToBookmark.substring(0, index);
	}
	
	var answer = confirm("Add " + titleToBookmark + " to bookmarks?")
	
	if (answer)
	{		
		var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
			this.get(titleToBookmark, function(r) {	
			
				if (r == null)
				{
					addBookmark(titleToBookmark, urlToBookmark);
				}
				else
				{
					alert(titleToBookmark + " already exists in bookmarks.");
				}
				
			});
		});	
	}
}

function addBookmark(title, url)
{
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.save({key: title, value: url});
	});
}


function getBookmarks()
{
	document.getElementById("bookmarksList").innerHTML = "";

	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.each(function(record, index) {	
			listBookmarks(record, index);
		});
	});
	
	showBookmarks();
}

function showBookmarks()
{
	disableOptionsMenu();

	hideOverlayDivs();
	toggleDiv("bookmarks");
	hideContent();
}

function hideBookmarks()
{
	enableOptionsMenu();

	hideOverlayDivs();
	showContent();
}

function listBookmarks(record, index)
{
	var markup = "<div class='listItemContainer'>";
	markup += "<div class='listItem' onclick=\"javascript:onBookmarkItemClicked(\'" + record.value + "\');\">";
	markup += "<span class='iconBookmark'><img src='image/iconBookmark.png'/></span>";
	markup += "<span>" + record.key + "</span>";
	markup += "</div>";
	markup += "<div>";
	markup += "<span class='deleteBookmark'><a href=\"javascript:deleteBookmarkPrompt(\'" + record.key + "\');\"><img src='image/iconDelete.png'/></a></span>";
	markup += "</div>";
	markup += "</div>";
	
	document.getElementById("bookmarksList").innerHTML += markup;	
}

function onBookmarkItemClicked(url, index)
{
	if (hasNetworkConnection())
	{
		showProgressLoader("Loading", "Retrieving content from Wikipedia");	
		document.getElementById("main").src = url;
		hideOverlayDivs();
		showContent();
	}
	else
	{
		noConnectionMsg();
	}
}

function deleteBookmarkPrompt(bookmarkKey)
{
	var answer = confirm("Remove " + bookmarkKey + " from bookmarks?")
	
	if (answer){
		deleteBookmark(bookmarkKey);
	}
}

function deleteBookmark(bookmarkToDelete, index)
{
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.remove(bookmarkToDelete, function() {
			alert(bookmarkToDelete + " has been removed.");
			hideOverlayDivs();
			showContent();
		});
	});
}


