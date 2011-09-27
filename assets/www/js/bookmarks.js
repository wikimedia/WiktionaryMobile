function resetBookmarks()
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
	//resetBookmarks();

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
	//document.getElementById("bookmarks").innerHTML = "<br><br><div onclick='javascript:hideBookmarks();'>Close Bookmarks</div><br><br>";	

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
	hideOverlayDivs();
	toggleDiv("bookmarks");
	hideContent();
}

function hideBookmarks()
{
	hideOverlayDivs();
	showContent();
}

function listBookmarks(record, index)
{
	var markup = "<div class='listItemContainer'>";
	markup += "<span class='iconBookmark'>icon</span>";
	markup += "<span class='listItem'><a href=\"javascript:onBookmarkItemClicked(\'" + record.value + "\');\">" + record.key + "</a></span>";
	markup += "&nbsp;&nbsp;";
	markup += "<span class='deleteBookmark'><a href=\"javascript:deleteBookmarkPrompt(\'" + record.key + "\');\">del</a></span>";
	markup += "</div>";
	
	document.getElementById("bookmarksList").innerHTML += markup;	
}

function onBookmarkItemClicked(url)
{
	if (hasNetworkConnection())
		document.getElementById("main").src = url;
	else
		noConnectionMsg();
		
	hideOverlayDivs();
	showContent();
}

function deleteBookmarkPrompt(bookmarkKey)
{
	var answer = confirm("Remove " + bookmarkKey + " from bookmarks?")
	
	if (answer){
		deleteBookmark(bookmarkKey);
	}
}

function deleteBookmark(bookmarkToDelete)
{
	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.remove(bookmarkToDelete, function() {
			alert(bookmarkToDelete + " has been removed.");
			hideOverlayDivs();
			showContent();
		});
	});
}


