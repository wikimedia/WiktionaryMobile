package com.chariotsolutions.toast.plugin;

import org.json.JSONArray;
import org.json.JSONException;

import android.util.Log;
import android.widget.Toast;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

public class ToastPlugin extends Plugin {

	private static final String TAG = "ToastPlugin";
	private static final String LONG_TOAST_ACTION = "show_long";
	private static final int TOAST_MESSAGE_INDEX = 0;

	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		String toastMessage;
		try {
			toastMessage = data.getString(TOAST_MESSAGE_INDEX);
		} catch (JSONException e) {
			Log.e(TAG, "Required parameter 'Toast Message' missing");
			return new PluginResult(Status.ERROR);
		}

		if (action.equals(LONG_TOAST_ACTION)) {
			ctx.runOnUiThread(new RunnableToast(toastMessage, Toast.LENGTH_LONG));
		} else {
			ctx.runOnUiThread(new RunnableToast(toastMessage, Toast.LENGTH_SHORT));
		}

		return new PluginResult(Status.OK);
	}

	class RunnableToast implements Runnable {
		private String message;
		private int length;

		public RunnableToast(String message, int length) {
			this.message = message;
			this.length = length;
		}

		@Override
		public void run() {
			Toast.makeText(ctx, message, length).show();
		}

	}

}