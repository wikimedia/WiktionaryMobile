// iOS+PhoneGap-specific setup

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
			id: 'settings',
			action: getSettings
		}
	];
	$('#menu').remove();
	var $menu = $('<div>');
	$menu
		.attr('id', 'menu')
		.css('position', 'fixed')
		.css('height', '52px')
		.css('bottom', 0)
		.css('left', 0)
		.css('right', 0)
		.css('background', '#888')
		.appendTo('body');

	$.each(items, function(i, item) {
		var $button = $('<button>');
		$button
			.text(mw.message(item.id).plain())
			.click(function() {
				item.action();
			})
			.appendTo($menu);
	});
};
