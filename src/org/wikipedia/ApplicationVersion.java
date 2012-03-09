package org.wikipedia;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.phonegap.api.LOG;
import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

import android.content.pm.PackageManager.NameNotFoundException;

public class ApplicationVersion extends Plugin {
	public JSONObject getVersion() {
		JSONObject info = new JSONObject();
		try {
			info.put("version", ctx.getPackageManager().getPackageInfo(ctx.getPackageName(), 0).versionName.toString());
		} catch (NameNotFoundException e) {
			LOG.d("error", e.getMessage());
		} catch (JSONException e) {
			LOG.d("error", e.getMessage());
		}

		return info;
	}

	@Override
	public PluginResult execute(String arg0, JSONArray arg1, String arg2) {
		return new PluginResult(Status.OK, getVersion());
	}
}
