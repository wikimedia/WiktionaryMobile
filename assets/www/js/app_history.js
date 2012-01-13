function addToHistory() {
	var title = app.getCurrentTitle();
	var url = app.getCurrentUrl();

	if (url != "about:blank") {
		// let's add stuff to the history!
		isHistoryMaxLimit(title, url);
	}
}

/**
 * @fixme has side effects of adding things into history, not obvious from the name
 */
function isHistoryMaxLimit(title, url) {
	var MAX_LIMIT = 50;

	var historyDB = new Lawnchair({name:"historyDB"},function() {
		this.keys(function(records) {
			if (records.length > MAX_LIMIT) {
				historyFIFO();
			}else{			
				if (records.length == 0 || records[records.length - 1].value !== url) {
					// Add if the last thing we saw wasn't the same URL
					var historyDB = new Lawnchair({name:"historyDB"}, function() {
						this.save({key: Date.now(), title: title, value: url});
					});
				}
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
			$('#historyList').prepend(listHistory(record, index));
		});
	});

	showHistory();
}

function listHistory(record, index) {
	var title = record.title || record.key;
	var markup = "<div class='listItemContainer'>";
	markup += "<div class='listItem' onclick=\"javascript:onHistoryItemClicked(\'" + record.value + "\');\">";
	markup += "<span class='iconHistory'></span>";
	markup += "<span class='text'>" + title + "</span>"
	markup += "</div>";
	markup += "</div>";
	
	return markup;
}

function onHistoryItemClicked(url) {
	app.navigateToPage(url);
	hideOverlays();
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
	$('#history').localize().show();
	hideContentIfNeeded();
	setActiveState();
}
