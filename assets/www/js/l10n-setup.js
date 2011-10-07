// @todo check window.navigator.language & load necessary files
$.each(messages, function(key, val) {
	mw.messages.set(key, val);
});
