// iOS+PhoneGap-specific setup

function updateMenuState() {
	var items = [
		{
			id: 'menu-back',
			action: goBack
		},
		{
			id: 'menu-forward',
			action: goForward
		},
		{
			id: 'menu-language',
			action: selectLanguage
		},
		{
			id: 'menu-output',
			action: function() {
				popupMenu([
					mw.msg('menu-savePage'),
					mw.msg('menu-sharePage'),
					mw.msg('menu-cancel')
				], function(value, index) {
					if (index == 0) {
						savePage();
					} else if (index == 1) {
						sharePage();
					}
				}, {
					cancelButtonIndex: 2
				});
			}
		},
		{
			id: 'menu-sources',
			action: function() {
				popupMenu([
					mw.msg('menu-nearby'),
					mw.msg('menu-savedPages'),
					mw.msg('menu-history'),
					mw.msg('menu-cancel')
				], function(val, index) {
					if (index == 0) {
						getCurrentPosition();
					} else if (index == 1) {
						showSavedPages();
					} else if (index == 2) {
						getHistory();
					}
				}, {
					cancelButtonIndex: 3
				});
			}
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
function popupMenu(items, callback, options) {
	window.plugins.actionSheet.create('', items, callback, options);
}