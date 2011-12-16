package org.wikipedia;

import org.json.JSONArray;

import android.util.Log;
import android.webkit.WebSettings;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

public class CacheModePlugin extends Plugin {

	@Override
	public PluginResult execute(String action, JSONArray params,
			String callbackId) {
		Log.d("CacheMode plugin", action);
		PluginResult result = null;
		if (action.compareTo("setCacheMode") == 0) {
			setCacheMode();
			result = new PluginResult(Status.NO_RESULT);
			return result;
		}
		return result;
	}

	@Override
	public boolean isSynch(String action) {
		return true;
	}

	public void setCacheMode() {
		// Don't trigger this until after the PhoneGap app is all loaded!
		//
        // Note that this mode seems to sometimes break initialization; our deviceready
        // event never gets called on some app initializations, very weird!
        webView.getSettings().setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
	}

}
