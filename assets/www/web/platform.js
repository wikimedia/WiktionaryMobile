// Web platform
//
// Works in Chrome with --disable-web-security
// But, uh, never use that mode for real huh? :)

// @todo need menus!

window.addEventListener('load', function() {
	onDeviceReady();
}, true);

function updateMenuState() {
	var items = [
		{
			id: 'menu-back',
			action: goBack
		},
		{
			id: 'menu-language',
			action: selectLanguage
		},
		{
			id: 'menu-history',
			action: getHistory
		},
		{
			id: 'menu-savedPages',
			action: showSavedPages
		},
		{
			id: 'menu-settings',
			action: getSettings
		}
	];
	$('#menu').remove();
	var $menu = $('<div>');
	$menu
		.attr('id', 'menu')
		.appendTo('body');

	$.each(items, function(i, item) {
		var $button = $('<button>');
		$button
			.attr('id', item.id)
			.click(function() {
				item.action();
			})
			.append('<span>')
			.appendTo($menu);
	});
};

// @Override
function getPhoneGapVersion(callback, error) {
	callback('n/a');
}
