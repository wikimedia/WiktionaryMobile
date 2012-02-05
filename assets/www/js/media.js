//Audio Player
//
//uses phonegap Media object

var my_media = null

function playAudio (AudioSource) {
	my_media = new Media (AudioSource);
	my_media.play();
	
}

//call this when closing program to release OS audio resources
function releaseMedia () {

	if (my_media != null){
		my_media.release();
	}

}