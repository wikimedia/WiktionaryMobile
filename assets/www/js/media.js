//Audio Player
//
//uses phonegap Media object

window.mediaPlayer = function() {
	var currentMedia = null;
	var availableMedia = [];
	var availableUrl = [];
	
	function playAudio (AudioSource) {
		currentMedia = new Media (AudioSource);
		currentMedia.play();	
	}
	
	//call this when closing program to release OS audio resources
	function releaseMedia () {
		if (currentMedia != null){
			currentMedia.release();
		}
	}
	
	function findMedia () {
		var title = app.getCurrentTitle();
		getMediaList(title);
		
	}
	
	function getMediaList(term) {

		var requestUrl = app.baseURL + "/w/api.php";
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
				for(var id in data.query.pages){
					for(var im in data.query.pages[id].images){
					
						var filename = data.query.pages[id].images[im].title;
						
						if (filename.search(ending) != -1){
							availableMedia.push(filename);
							getMediaUrl(filename);
							console.log(filename);
						}
					}
				}
			}, 
			error: function(err) {
				console.log("ERROR!" + JSON.stringify(err));
			}
		});
	}
	
	function getMediaUrl(filename) {

		var requestUrl = app.baseURL + "/w/api.php";
		
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
				availableUrl = [];
				for(var id in data.query.pages){
					for (var im in data.query.pages[id].imageinfo){		
						var fileUrl = data.query.pages[id].imageinfo[im].url;
						availableUrl.push(fileUrl);					
						break;
					}
				}
			}, 
			error: function(err) {
				console.log("ERROR!" + JSON.stringify(err));
			}
		});
	}
	
	
	return {
		playAudio: playAudio,
		releaseMedia: releaseMedia,
		findMedia: findMedia

	};

}();