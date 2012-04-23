// ...
console.log('WinPhone platform.js');

$('html').addClass('winphone');

//$('<script>').attr('src', 'winphone/cordova-1.6.1.js').appendTo('html');
document.write('<script src="winphone/cordova-1.6.1.js"></script>');

// http://bugs.jquery.com/ticket/10660
$.support.cors = true;

$(document).bind('touchstart', function(event) {
	event.preventDefault();
});
