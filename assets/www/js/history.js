//window.onpushstate = alert(window.history.current);

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

function getHistory()
{
	//alert(history.length);
	document.getElementById("history").innerHTML = "<ul>";
	
	if (history.length > 0)
	{
		for (var i=history.length;i>=0;i--)
		{
			document.getElementById("history").innerHTML += "<li>";
			document.getElementById("history").innerHTML += "";
			document.getElementById("history").innerHTML += "</li>";	
		}
	}
	else
	{
		document.getElementById("history").innerHTML += "<li>no items in history</li>";	
	}
	
	document.getElementById("history").innerHTML += "</ul>";
	document.getElementById("history").innerHTML += "<a href='javascript:hideHistory();'>Close</a>";
}

function showHistory()
{
	document.getElementById("bookmarks").style.display = "block";
}

function hideHistory()
{
	document.getElementById("bookmarks").style.display = "none";
}