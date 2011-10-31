// Android stuff

// @todo migrate menu setup in here?

$(document).bind('deviceready', function() {
    document.addEventListener("backbutton", onBackButton, false);
    document.addEventListener("searchbutton", onSearchButton, false);
});

function onBackButton() {
	goBack();
}

function onSearchButton() {
    //hmmm...doesn't seem to set the cursor in the input field - maybe a browser bug???
    $('#searchParam').focus();
    plugins.SoftKeyBoard.show();
}

function selectText() {
    PhoneGap.exec(null, null, 'SelectTextPlugin', 'selectText', []);
}

function sharePage() {
	// @fixme consolidate these with addBookmarkPrompt etc
	// @fixme if we don't have a page loaded, this menu item should be disabled...
	var frame = document.getElementById("main"),
		title = frame.contentDocument.title.replace(/ - .*?$/, ' - ' + mw.message('sitename').plain()),
		url = frame.contentWindow.location.href;
	window.plugins.share.show(
		{
			subject: title,
			text: url
		}
	);
}

//@Override
function lightweightNotification(text) {
	// Using PhoneGap-Toast plugin for Android's lightweight "Toast" style notifications.
	// https://github.com/m00sey/PhoneGap-Toast
	// http://developer.android.com/guide/topics/ui/notifiers/toasts.html
	window.plugins.ToastPlugin.show_short(text);
}

//@Override
function toggleForward() {
    currentHistoryIndex < window.history.length ?
    $('#forwardCmd').attr('disabled', 'false') :
    $('#forwardCmd').attr('disabled', 'true');

    console.log('Forward command disabled '+$('#forwardCmd').attr('disabled')); 
    window.plugins.SimpleMenu.loadMenu($('#appMenu')[0], 
                                       function(success) {console.log(success);},
                                       function(error) {console.log(error);});
}

//@Override
function hasNetworkConnection() 
{
    return navigator.network.connection.type == Connection.NONE ? false : true;
}

