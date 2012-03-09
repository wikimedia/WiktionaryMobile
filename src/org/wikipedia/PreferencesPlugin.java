package org.wikipedia;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.SharedPreferences;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

public class PreferencesPlugin extends Plugin {
	public static final String PREFS_NAME = "WikipediaPrefs";

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		try {
			if (args.length() != 1) {
				return new PluginResult(PluginResult.Status.INVALID_ACTION);
			}
			JSONObject obj = args.getJSONObject(0);

			if (!obj.has("id")) {
				return new PluginResult(PluginResult.Status.INVALID_ACTION);
			}
			String id = obj.getString("id");

			SharedPreferences settings = this.ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

			if (action.equals("get")) {
				if (!settings.contains(id)) {
					return new PluginResult(PluginResult.Status.NO_RESULT);
				}
				try {
					String value = settings.getString(id, "");
					return new PluginResult(PluginResult.Status.OK, value);
				} catch (ClassCastException e) {
					e.printStackTrace();
					return new PluginResult(PluginResult.Status.ERROR);
				}

			} else if (action.equals("set")) {
				String value = obj.has("value") ? obj.getString("value") : null;
				SharedPreferences.Editor editor = settings.edit();
				editor.putString(id, value);
				editor.commit();
				return new PluginResult(PluginResult.Status.OK, value);

			}
			return new PluginResult(PluginResult.Status.INVALID_ACTION);
		} catch (JSONException e) {
			e.printStackTrace();
			return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
		}
	}

}
