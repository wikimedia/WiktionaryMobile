function search()
{
	if (hasNetworkConnection())
	{
		var searchParam = document.getElementById("searchParam").value;
	
		if (searchParam == '')
		{
			hideOverlayDivs();
			return;
		}
		
		showProgressLoader("Loading", "Retrieving content from Wikipedia");
		
		var requestUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&";
		requestUrl += "search=" + encodeURIComponent(searchParam) + "&";
		requestUrl += "format=json";

		var xmlhttp;

		if (window.XMLHttpRequest)
  		{// code for IE7+, Firefox, Chrome, Opera, Safari
  			xmlhttp=new XMLHttpRequest();
  		}
		else
  		{// code for IE6, IE5
  			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  		}
	
		xmlhttp.onreadystatechange=function()
  		{
  			if (xmlhttp.readyState==4 && xmlhttp.status==200)
    		{
    			displayResults(xmlhttp.responseText);
    		}
  		}

		//xmlhttp.setRequestHeader("User-Agent", "WikipediaMobile");
		xmlhttp.open("GET", requestUrl, true);
		xmlhttp.send();	
	}
	else
	{
		noConnectionMsg();
		hideOverlayDivs();
	}
}

function displayResults(results)
{
	var formattedResults = "";
	
	if (results != null)
	{
		results = eval(results);
	
		if (results.length > 0)
		{
			var searchParam = results[0];
			var searchResults = results[1];
		
			for (var i=0;i<searchResults.length;i++)
			{
				var article = searchResults[i];
				
				if (article.toLowerCase() == $('#searchParam').val().toLowerCase())
				{
					goToResult(article);
					return;
				}
				
				formattedResults += "<div class='listItemContainer' onclick=\"javascript:goToResult(\'" + article + "\');\">";
				formattedResults += "<div class='listItem'>";
				formattedResults += "<span class='iconSearchResult'><img src='image/iconListItem.png'/></span>";
				formattedResults += "<span>" + article + "</span>";
				formattedResults += "</div>";
				formattedResults += "</div>";
			}
		}
	}
	else
	{
		formattedResults += "nothingness...";
	}
	
	formattedResults += "<div class='listItemContainer' onclick='javascript:hideSearchResults();'>";
	formattedResults += "<div class='listItem'>Close</div>";
	formattedResults += "</div>";
	
	document.getElementById("resultList").innerHTML=formattedResults;
	
	hideOverlayDivs();
	
	document.getElementById("searchresults").style.display = "block";
	document.getElementById("content").style.display = "none";
	
	hideProgressLoader();
}

function goToResult(article)
{
	if (hasNetworkConnection())
	{
		showProgressLoader("Loading", "Retrieving content from Wikipedia");
		var url = "http://en.wikipedia.org/wiki/" + article;	
		document.getElementById("main").src = url;
		hideOverlayDivs();
		showContent();
	}
	else
	{
		noConnectionMsg();
	}
}

function hideSearchResults()
{
	hideOverlayDivs();
	showContent();
}

