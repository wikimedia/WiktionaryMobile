// Android stuff

// @todo migrate menu setup in here?

var origOnDeviceReady = onDeviceReady;
onDeviceReady = function() {
    document.addEventListener("backbutton", onBackButton, false);
    document.addEventListener("searchbutton", onSearchButton, false);

    // this disables the "click-through" of an image under the search bar - but hides the keyboard only on the first character typed...
    $('#searchParam').bind('touchstart', function () {     
        $('#searchParam').focus();
        plugins.SoftKeyBoard.show();
        return false; 
    } );

	if (navigator.userAgent.match(/; Android [34]/)) {
    	// The iframe doesn't stretch to fit its native size on Android 3 or 4.
    	// Ideally we'd instead fit it within the size of the screen and allow
    	// scrolling within it, but that seems to have bugs for now:
		// <http://code.google.com/p/android/issues/detail?id=20184>
    	//
    	// As a temporary hack to get things working on Honeycomb / Ice Cream Sandwich,
    	// we'll force the size of the frame after load and let the whole document scroll.
		//
		// @fixme When expanding sections, the document gets taller and may start scrolling
		// inside as well or something and the scrolling-iframe-link-bug above will hit.
		//
		// @fixme Doesn't update until after page load is complete.
		//
		// @fixme Doesn't always update appropriately; sometimes leaves extra whitespace.
		
		var pingFrameSize = function() {
	    	var $iframe = $('#main'),
	    		doc = $iframe[0].contentDocument,
	    		frameHeight = doc.body.scrollHeight;
	    	$iframe.attr('height', frameHeight);
		}
		document.getElementById('main').addEventListener('load', pingFrameSize, true);
	}
	
	origOnDeviceReady();
};

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

	$('#appMenu command').each(function() {
		var $command = $(this),
			id = $command.attr('id'),
			msg = 'menu-' + id.replace(/Cmd$/, ''),
			label = mw.message(msg).plain();
		$command.attr('label', label);
	});

    window.plugins.SimpleMenu.loadMenu($('#appMenu')[0], 
                                       function(success) {console.log(success);},
                                       function(error) {console.log(error);});
}

//@Override
function hasNetworkConnection() 
{
    return navigator.network.connection.type == Connection.NONE ? false : true;
}
