function addToHistory() {	
	var title = document.getElementById("main").contentDocument.title;
	var url = document.getElementById("main").contentWindow.location.href;
	var index = title.indexOf(" - Wikipedia, the free encyclopedia");

	if (index > 0) {
		title = title.substring(0, index);
	}else{
		title = "Wikipedia, the free encyclopedia";
	}
	
	if (url != "about:blank") {
		// let's add stuff to the history!
		isHistoryMaxLimit(title, url);
	}
}

function isHistoryMaxLimit(title, url) {
	var MAX_LIMIT = 50;

	var historyDB = new Lawnchair({name:"historyDB"},function() {
		this.keys(function(records) {
			if (records.length > MAX_LIMIT) {
				historyFIFO();	
			}else{			
				var historyDB = new Lawnchair({name:"historyDB"}, function() {
					this.save({key: title, value: url});
				});
			}
		});
	});
}

function historyFIFO() {
	var historyDB = new Lawnchair({name:"historyDB"}, function() {
		this.each(function(record, index) {
			if (index == 0) {
				// remove the first item, then add the latest item
				this.remove(record.key, window.addToHistory);
			}
		});
	});
}

function getHistory() {	

    $('#historyList').html('');
    
	var historyDB = new Lawnchair({name:"historyDB"}, function() {
		this.each(function(record, index) {
			$('#historyList').append(listHistory(record, index));
		});
	});

	showHistory();
}

function listHistory(record, index) {
	var markup = "<div class='listItemContainer'>";
	markup += "<div class='listItem' onclick=\"javascript:onHistoryItemClicked(\'" + record.value + "\');\">";
	markup += "<span class='iconHistory'></span>";
	markup += "<span class='text'>" + record.key + "</span>"
	markup += "</div>";
	markup += "</div>";
	
	return markup;
}

function onHistoryItemClicked(url) {
	if (hasNetworkConnection()) {
        $('#searchParam').val('');            
        showSpinner();  
        $('#search').addClass('inProgress');
		$('#main').attr('src', url);
		hideOverlays();
	}else{
		noConnectionMsg();
	}
}

function purgeHistory() {
	var answer = confirm("Remove all of your browsing history?")
	
	if (answer) {
		var historyDB = new Lawnchair({name:"historyDB"}, function() { this.nuke() });
	}
	
	hideOverlays();
}

function showHistory() {
	hideOverlayDivs();
	$('#history').toggle();
	hideContent();
	setActiveState();
}
