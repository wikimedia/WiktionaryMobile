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

	var historyDB = new Lawnchair({name:"historyDB"},function() {
		this.keys(function(records) {
			if (records.length > MAX_LIMIT)
			{
				// TODO: we've reached the max limit; we should probably just do a FIFO here.
				console.log("MAX_LIMIT");
			}
			else
			{
				var historyDB = new Lawnchair({name:"historyDB"}, function() {
					this.save({key: title, value: url});
				});
			}
		});
	});
}

function getHistory()
{
	/*
	var markup = "<br><br>";
	markup += "<a href='javascript:purgeHistory();'>Clear History</a>";
	markup += "&nbsp;&nbsp;<a href='javascript:hideHistory();'>Close History</a>";
	markup += "<br><br>";
	
	document.getElementById("history").innerHTML = markup;
	*/
	
	document.getElementById("historyList").innerHTML = "";
	
	var historyDB = new Lawnchair({name:"historyDB"}, function() {
		this.each(function(record, index) {
			listHistory(record, index);
		});
	});

	showHistory();
}

function listHistory(record, index)
{
	var markup = "<br>";
	markup += "<a href=\"javascript:onHistoryItemClicked(\'" + record.value + "\');\">" + record.key + "</a>";
	markup += "<br>";
	
	document.getElementById("historyList").innerHTML += markup;	
}

function onHistoryItemClicked(url)
{
	if (hasNetworkConnection())
		document.getElementById("main").src = url;
	else
		noConnectionMsg();

	hideOverlayDivs();
	showContent();
}

function purgeHistory()
{
	var historyDB = new Lawnchair({name:"historyDB"}, function() { this.nuke() });
	hideOverlayDivs();
	showContent();
}

function hideHistory()
{
	hideOverlayDivs();
	showContent();
}

function showHistory()
{
	hideOverlayDivs();
	toggleDiv("history");
	document.getElementById("history").disabled = false;
	hideContent();
}
