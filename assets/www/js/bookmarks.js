function resetBookmarks()
{
	var bookmarksDB = new Lawnchair(function() { this.nuke() });
}

function addBookmark()
{

	resetBookmarks();

	var bookmarksDB = new Lawnchair(function() {
		this.save({key:"http://www.google.com"}, getBookmark);
	});
}

function getBookmark()
{
	var bookmarksDB = new Lawnchair(function() {
		this.get("http://www.google.com", myCallback);
	});
}

function myCallback(r)
{
	alert(r.key);
	console.log(r.key);
	
	getLength();
}

function getLength()
{
	var bookmarksDB = new Lawnchair(function() {
		this.keys(getLen);
	});
}

function getLen(r)
{
	alert(r.length);
	console.log(r.length);
}
