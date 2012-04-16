package org.wiktionary;

import org.json.JSONArray;

import android.util.Log;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

public class AndroidVersionPlugin extends Plugin{

	@Override
	public PluginResult execute(String action, JSONArray params, String callbackId) {
		Log.d("AndroidVersionPlugin", ""+android.os.Build.VERSION.SDK_INT);
		PluginResult result = null;
		
		if (action.compareTo("getVersion") == 0) {
			int version = android.os.Build.VERSION.SDK_INT;
			result = new PluginResult(Status.OK, version); 
			
		}else {

			result = new PluginResult(Status.INVALID_ACTION);
			Log.d("AndroidVersionPlugin", "Invalid action : "+action+" passed");
		}
		return result;
	}

}
