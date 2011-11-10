/**
 * Validate and normalize a language code.
 * Doesn't guarantee we know it or it's legit, but confirms the format is safe.
 *
 * @param string lang
 * @returns string normalized to lowercase
 * @throws Error on invalid input
 */
function normalizeLanguageCode(lang) {
	if (typeof lang !== "string") {
		throw new Error("Invalid type for language name");
	}
	if (!lang.match(/^[a-z0-9]+(-[a-z0-9]+)*$/)) {
		throw new Error("Invalid language name format");
	}
	return lang.toLowerCase();
}

/**
 * Load up messages for given language, synchronously to keep things simple.
 * @param string lang
 * @param callback
 */
function loadMessages(lang, callback) {
	lang = normalizeLanguageCode(lang);
	var url = 'messages/messages-' + lang + '.properties';
	$.ajax({
		url: url,
		async: false,
		dataType: 'text',
		success: function(data) {
			try {
				var messages = propertiesFileReader.parse(data);
			} catch (e) {
				alert('Error parsing localization file for ' + lang + ': ' + e);
				callback(null);
			}
			$.each(messages, function(key, val) {
				mw.messages.set(key, val);
			});
		},
		error: function(xhr, status, err) {
			alert('Error loading localization file for ' + lang + ': ' + status);
			callback(null);
		}
	});
}

loadMessages('en', function() {
	$(document).trigger('mw-messages-ready');
});

//@todo check window.navigator.language & load necessary files
