/**
 * Phonegap cachemode plugin for Android
 * Brion Vibber 2011
 */

var CacheMode = function(mode, success, fail) {
	this.setCacheMode = function() {
		return PhoneGap.exec(success, fail, 'CacheModePlugin', 'setCacheMode', [mode]);
	}
};
			
PhoneGap.addConstructor(function() {
	PhoneGap.addPlugin('CacheMode', new CacheMode());
});
