package org.wikipedia;

import org.json.JSONArray;
import org.json.JSONException;

import android.util.Log;
import android.webkit.WebSettings;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

public class CacheModePlugin extends Plugin {

	@Override
	public PluginResult execute(String action, JSONArray params, String callbackId) {
		PluginResult result = null;
		Log.d("PhoneGap", "Cache Mode entered!");

		if (action.compareTo("setCacheMode") == 0) {
			try {
				setCacheMode(params.getString(0));
				Log.d("PhoneGap", "Cache Mode Set!");
				result = new PluginResult(Status.OK);
			} catch (JSONException e) {
				Log.d("CacheMode plugin", "JSON exception");
				result = new PluginResult(Status.JSON_EXCEPTION);
			}
			return result;
		}
		return result;
	}

	@Override
	public boolean isSynch(String action) {
		return true;
	}

	public void setCacheMode(String mode) {
		// Don't trigger this until after the PhoneGap app is all loaded!
		//
		// Note that this mode seems to sometimes break initialization; our
		// deviceready
		// event never gets called on some app initializations, very weird!
		int n = getModeValue(mode);
		webView.getSettings().setCacheMode(n);
	}

	private int getModeValue(String str) {
		if (str.equals("LOAD_CACHE_ELSE_NETWORK"))
			return WebSettings.LOAD_CACHE_ELSE_NETWORK;
		else if (str.equals("LOAD_CACHE_ONLY"))
			return WebSettings.LOAD_CACHE_ONLY;
		else if (str.equals("LOAD_DEFAULT"))
			return WebSettings.LOAD_DEFAULT;
		else if (str.equals("LOAD_NORMAL"))
			return WebSettings.LOAD_NORMAL;
		else if (str.equals("LOAD_NO_CACHE"))
			return WebSettings.LOAD_NO_CACHE;
		else
			return -1;
	}

}
