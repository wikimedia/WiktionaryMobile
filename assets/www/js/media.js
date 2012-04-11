window.audioPlayer = function() {
	var currentMedia = null;
	var availableMedia = [];
	var availableUrl = [];
	var menuArray = [];
	var lastMenuStatus = false;
	
	/**
	 * Function called with URL of file to be played.
	 * Uses the phonegap Media object to prepare and play files
	 *
	 */
	function playAudio (AudioSource) {
		currentMedia = new Media (AudioSource, releaseMedia, chrome.hideListSpinner);
		currentMedia.play();	
	}
	
	/**
	 * Function releases OS audio resources
	 *
	 */
	function releaseMedia () {
		if (currentMedia != null){
			currentMedia.release();
		}
		chrome.hideListSpinner();
	}

	/**
	 * Function gets the title of the current page, and makes call to retrieve names
	 * and URLs of all .ogg files associated with that page, placing names into availableMedia.
	 * 
	 * This is currently called in chrome.renderHtml() and not on demand, as the internet could 
	 * be too slow for the request to get back by the time the menu is up, showing a blank menu.
	 */		
	function getMediaList() {
		var term = app.getCurrentTitle();
		var requestUrl = app.baseURL + "/w/api.php";
		
		if (lastMenuStatus){
			setMenuItemState('listen-sound',false, false);
			console.log("disabling listen-in menu");
			lastMenuStatus = false;
		}	
		
		var ending = ".*\.ogg";
		
		$.ajax({
			type: 'GET',
			url: requestUrl,
			data: {
				action: 'query',
				titles: term,
				prop: 'images',
				format: 'json'
			},
			success: function(data) {
				availableMedia = [];
				availableUrl = [];
				var audioIndex = 0;
				
				for(var id in data.query.pages){
					for(var im in data.query.pages[id].images){
					
						var filename = data.query.pages[id].images[im].title;
						
						if (filename.search(ending) != -1){
							availableMedia.push(filename);
							getMediaUrl(filename,audioIndex);
							audioIndex += 1;

						}
					}
				}
			}, 
			error: function(err) {
				console.log("ERROR!" + JSON.stringify(err));
			}
		});
	}
	
	
	/**
	 * Helper function that makes call to retrieve the direct URL of the file with the given filename
	 * placing direct URL into availableUrl
	 *
	 */	
	function getMediaUrl(filename, audioIndex) {
		
		//this get request using (app.baseURL + "/w/api.php") was handing back unusable "https" urls, should investigate getting a non https version of app.baseURL
		var requestUrl = "http://en.m." + PROJECTNAME + ".org/w/api.php";
		
		$.ajax({
			type: 'GET',
			url: requestUrl,
			data: {
				action: 'query',
				titles: filename,
				prop: 'imageinfo',
				iiprop: 'url',
				format: 'json'
			},
			success: function(data) {
				
				if(!lastMenuStatus){
					setMenuItemState('listen-sound', true, false);
					console.log("enabling listen-in menu");
					lastMenuStatus = true;		
				}	
		
				for(var id in data.query.pages){
					for (var im in data.query.pages[id].imageinfo){		
						
						var fileUrl = data.query.pages[id].imageinfo[im].url;
						availableUrl[audioIndex] = fileUrl;					
						break;
					}
				}
			}, 
			error: function(err) {
				console.log("ERROR!" + JSON.stringify(err));
			}
		});
	}
	
	
	/**
	 * Format the audio list menu in the same style as saved pages & history
	 * 
	 */
	function showAvailableAudio() {
		var template = templates.getTemplate("audio-list-template");
		$("#audioList").html(template.render({listen: menuArray}));
		$(".audioLink").click(onAudioLinkClick);
		chrome.hideOverlays();
		chrome.hideContent();

		$('#audiolinks').localize().show();
		
		chrome.doFocusHack();
		chrome.doScrollHack('#audiolinks .scroller');
	}
	
	/**
	 * Generates the array to be pushed into the scrolling audio list, then displays the menu
	 * 
	 */
	function createMenuArray() {
		menuArray = [];
		for (var i = 0; i < availableMedia.length; i++){
			menuArray.push({name: availableMedia[i],url: availableUrl[i], selected: false});
		}
		showAvailableAudio();
	}
	
	/**
	 * Clears audio files available. Also blanks out the 'Listen in' menu item
	 */
	function clearMenuArray() {
		menuArray = [];
	}
	
	
	/**
	 * plays file that is clicked in the menu
	 *  
	 */
	function onAudioLinkClick() {
		
		chrome.hideListSpinner();
		$(this).append("<div class=\"listSpinner\"></div>");
		chrome.showListSpinner();
		
		var parent = $(this).parents(".listItemContainer");
		var url = parent.attr("data-page-url");
		audioPlayer.playAudio(url);
	}
	
	return {
		playAudio: playAudio,
		releaseMedia: releaseMedia,
		getMediaList: getMediaList,
		createMenuArray: createMenuArray,
		clearMenuArray: clearMenuArray
	};

}();
