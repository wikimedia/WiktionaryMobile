function addToHistory()
{
	var title = document.getElementById("main").contentDocument.title;
	var url = document.getElementById("main").contentWindow.location.href;
	
	if (url != "about:blank")
	{
		// let's add stuff to the history!
		isHistoryMaxLimit(title, url);
	}
}

function isHistoryMaxLimit(title, url)
{
	var MAX_LIMIT = 50;

	var historyDB = new Lawnchair(function() {
		this.keys(function(records) {
			if (records.length > MAX_LIMIT)
			{
				// TODO: we've reached the max limit; we should probably just do a FIFO here.
				console.log("MAX_LIMIT");
			}
			else
			{
				var historyDB = new Lawnchair(function() {
					this.save({key: title, value: url});
				});
			}
		});
	});
}

function getHistory()
{
	document.getElementById("history").innerHTML = "<a href='javascript:purgeHistory();'>Clear History</a>";
	document.getElementById("history").innerHTML += "<ul>";

	var historyDB = new Lawnchair(function() {
		this.each(function(record, index) {
			listHistory(record, index);
		});
	});
			
	document.getElementById("history").innerHTML += "</ul>";
	document.getElementById("history").innerHTML += "<a href='javascript:hideHistory();'>Close</a>";
	
	showHistory();
}

function listHistory(record, index)
{
	var markup = "<li>";
	markup += "<a href=\"javascript:onHistoryItemClicked(\'" + record.value + "\');\">" + record.key + "</a>";
	markup += "</li>";
	
	document.getElementById("history").innerHTML += markup;	
}

function onHistoryItemClicked(url)
{
	document.getElementById("main").src = url;
	hideHistory();
}

function purgeHistory()
{
	var historyDB = new Lawnchair(function() { this.nuke() });
	hideHistory();
}

function showHistory()
{
	document.getElementById("history").style.display = "block";
}

function hideHistory()
{
	document.getElementById("history").style.display = "none";
}