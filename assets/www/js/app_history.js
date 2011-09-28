function addToHistory()
{
	var title = document.getElementById("main").contentDocument.title;
	var url = document.getElementById("main").contentWindow.location.href;
	var index = title.indexOf(" - Wikipedia, the free encyclopedia");

	if (index > 0)
	{
		title = title.substring(0, index);
	}
	else
	{
		title = "Wikipedia, the free encyclopedia";
	}
	
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
	var markup = "<div class='listItemContainer'>";
	markup += "<div class='listItem'>";
	markup += "<span class='iconHistory'>icon</span>";
	markup += "<a href=\"javascript:onHistoryItemClicked(\'" + record.value + "\');\">" + record.key + "</a>"
	markup += "</div>";
	markup += "</div>";
	
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
	hideContent();
}
