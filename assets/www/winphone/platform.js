// Web platform
//
// Works in Chrome with --disable-web-security
// But, uh, never use that mode for real huh? :)

// @todo need menus!

window.addEventListener('load', function() {
	$(window).resize(fixFrameSize);
	$('body').css('overflow', 'hidden');
	fixFrameSize();

    loadContent();
    chrome.doFocusHack();
}, true);

// Hack for sizing the iframe...
function fixFrameSize() {
	var $iframe = $('#main'),
		pos = $iframe.offset(),
		h = window.innerHeight - pos.top;
	
	console.log('h', h);
	$iframe.height(h);
}
