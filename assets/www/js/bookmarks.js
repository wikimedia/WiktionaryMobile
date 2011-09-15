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
	document.getElementById("bookmarks").innerHTML = "<a href='javascript:hideBookmarks();'>Close Bookmarks</a>";	

	var bookmarksDB = new Lawnchair({name:"bookmarksDB"}, function() {
		this.each(function(record, index) {	
			listBookmarks(record, index);
		});
	});
	
	showBookmarks();
}

function showBookmarks()
{
	hideHistory();
	document.getElementById("bookmarks").style.display = "block";
}

function hideBookmarks()
{
	document.getElementById("bookmarks").style.display = "none";
}

function listBookmarks(record, index)
{
	var markup = "<li>";
	markup += "<a href=\"javascript:deleteBookmarkPrompt(\'" + record.key + "\');\">del</a>";
	markup += "&nbsp;&nbsp;";
	markup += "<a href=\"javascript:onBookmarkItemClicked(\'" + record.value + "\');\">" + record.key + "</a>";
	markup += "</li>";
	
	document.getElementById("bookmarks").innerHTML += markup;	
	
	//return markup;
}

function onBookmarkItemClicked(url)
{
	document.getElementById("main").src = url;
	hideBookmarks();
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
			hideBookmarks();
		});
	});
}


