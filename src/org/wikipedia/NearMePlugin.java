package org.wikipedia;

import org.json.JSONArray;

import android.content.Intent;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

public class NearMePlugin extends Plugin {

	@Override
	public PluginResult execute(String arg0, JSONArray arg1, String arg2) {
		if(arg0.compareTo("startNearMeActivity") == 0) {
			Intent intent = new Intent(ctx, NearMeActivity.class);
			ctx.startActivity(intent);
		}
		return null;
	}

}
