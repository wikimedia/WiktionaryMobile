function isHistoryMaxLimit()
{
	var MAX_LIMIT = 50;

	var historyDB = new Lawnchair(function() {
		this.keys(function(records) {
			if (records.length > MAX_LIMIT)
			{
				// we've reached the max limit; we should probably just do a FIFO here.
			}
			else
			{
				// haven't reached the max limit
				// just push the item into the history
			}
		});
	});
}

showHistory()
{
	document.getElementById("bookmarks").style.display = "block";
}

hideHistory()
{
	document.getElementById("bookmarks").style.display = "none";
}