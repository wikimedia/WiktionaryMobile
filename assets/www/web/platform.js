// Web platform
//
// Works in Chrome with --disable-web-security
// But, uh, never use that mode for real huh? :)

// @todo need menus!

window.addEventListener('load', function() {
	chrome.initialize();
}, true);

function updateMenuState() {
	var items = [
		{
			id: 'menu-back',
			action: chrome.goBack
		},
		{
			id: 'menu-forward',
			action: chrome.goForward
		},
		{
			id: 'menu-language',
			action:  languageLinks.showAvailableLanguages
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
						savedPages.saveCurrentPage();
					} else if (index == 1) {
						sharePage();
					}
				}, {
					cancelButtonIndex: 2,
					origin: this
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
						geo.showNearbyArticles();
					} else if (index == 1) {
						savedPages.showSavedPages();
					} else if (index == 2) {
						appHistory.showHistory();
					}
				}, {
					cancelButtonIndex: 3,
					origin: this
				});
			}
		},
		{
			id: 'menu-settings',
			action: appSettings.showSettings
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
			.attr('title', mw.msg(item.id))
			.click(function() {
				item.action.apply(this);
			})
			.append('<span>')
			.appendTo($menu);
	});
};

// @Override
function getPhoneGapVersion(callback, error) {
	callback('n/a');
}

// @Override
function popupMenu(items, callback, options) {
	options = $.extend({destructiveButtonIndex: null, cancelButtonIndex: null}, options || {});

	var $bg = $('<div class="actionsheet-bg"></div>').appendTo('body'),
		$sheet = $('<div class="actionsheet"></div>').appendTo('body');
	$.each(items, function(index, label) {
		var $button = $('<button>')
			.text(label)
			.appendTo($sheet)
			.click(function() {
				$sheet.remove();
				$bg.remove();
				callback(label, index);
			});
		if (index === options.destructiveButtonIndex) {
			$button.addClass('destructive');
		}
		if (index === options.cancelButtonIndex) {
			$button.addClass('cancel');
		}
	});
}
