function toggleSearchBar()
{
	var display = document.getElementById("searchbar").style.display;
	
	if (display == "block")
		document.getElementById("searchbar").style.display = "none";
	else
		document.getElementById("searchbar").style.display = "block";
}


function search()
{

	var searchParam = document.getElementById("searchParam").value;
	var requestUrl = "http://en.wikipedia.org/w/api.php?action=opensearch&";
	requestUrl += "search=" + searchParam + "&";

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

	xmlhttp.open("GET", requestUrl, true);
	xmlhttp.send();	
}

function displayResults(results)
{
	var formattedResults = "";
	
	if (results != null)
	{
		results = eval(results);
	
		var searchParam = results[0];
		var searchResults = results[1];
	
		//alert(searchResults.length);
	
		formattedResults += "Searched for: " + searchParam + "<br/><br/>";
		
		for (var i=0;i<searchResults.length;i++)
		{
			var article = searchResults[i];
			formattedResults += "<a href=\"javascript:goToResult(\'" + article + "\');\">" + article + "</a><br/>";
		}
	}
	else
	{
		formattedResults += "nothingness...";
	}
	
	document.getElementById("searchresults").innerHTML=formattedResults;
}

function goToResult(article)
{
	var url = "http://en.wikipedia.org/wiki/" + article;
	toggleSearchBar();
	document.getElementById("main").src = url;
}
