// Web platform
//
// Works in Chrome with --disable-web-security
// But, uh, never use that mode for real huh? :)

// @todo need menus!

window.addEventListener('load', function() {
	chrome.initialize();
}, true);

var menu_items = [
	{
		id: 'go-back',
		action: chrome.goBack,
		disabled: true
	},
	{
		id: 'go-forward',
		action: chrome.goForward,
		disabled: true
	},
	{
		id: 'read-in',
		action:  languageLinks.showAvailableLanguages
	},
	{
		id: 'page-actions',
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
		id: 'list-actions',
		action: function() {
			popupMenu([
				mw.msg('menu-savedPages'),
				mw.msg('menu-history'),
				mw.msg('menu-cancel')
			], function(val, index) {
				if (index == 0) {
					savedPages.showSavedPages();
				} else if (index == 1) {
					appHistory.showHistory();
				}
			}, {
				cancelButtonIndex: 2,
				origin: this
			});
		}
	},
	{
		id: 'view-settings',
		action: appSettings.showSettings
	}
];

function updateMenuState() {
	$('#menu').remove();
	var $menu = $('<div>');
	$menu
		.attr('id', 'menu')
		.appendTo('body');

	$.each(menu_items, function(i, item) {
		var $button = $('<button>');
		$button
			.attr('id', item.id)
			.attr('title', mw.msg(item.id));
		if(item.disabled) {
			$button.addClass("disabled");
		} else {
			$button.click(function() {
				item.action.apply(this);
			});
		}
		$button.append('<span>')
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

function setMenuItemState(action, state, noUpdate) {
	if(state) {
		$("command[action='" + action + "']").removeAttr("disabled");
	} else {
		$("command[action='" + action + "']").attr("disabled", "disabled");
	}
	if(!noUpdate) { 
		updateMenuState();
	}
}

function setPageActionsState(state) {
	setMenuItemState("read-in", state, true);
	setMenuItemState("save-page", state, true);
	setMenuItemState("share-page", state, true);
}

function getAboutVersionString() {
	return "1.1.web";
}

