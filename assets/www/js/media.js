//Audio Player
//
//uses phonegap Media object

var my_media = null

function playAudio (AudioSource) {
	my_media = new Media (AudioSource);
	my_media.play();
	
}