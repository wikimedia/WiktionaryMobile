/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010, IBM Corporation
 */
package com.phonegap.progress;

import org.json.JSONArray;
import org.json.JSONException;
import com.phonegap.api.Plugin;
import com.phonegap.api.PhonegapActivity;
import com.phonegap.api.PluginResult;
import android.app.ProgressDialog;

/**
 * This class provides access to notifications on the device.
 */
public class IndeterminateProgress extends Plugin {
	
	public int confirmResult = -1;
	public ProgressDialog spinnerDialog = null;
	public ProgressDialog progressDialog = null;	
	
	/**
	 * Constructor.
	 */
	public IndeterminateProgress() {
	}

	/**
	 * Executes the request and returns PluginResult.
	 * 
	 * @param action 		The action to execute.
	 * @param args 			JSONArry of arguments for the plugin.
	 * @param callbackId	The callback id used when calling back into JavaScript.
	 * @return 				A PluginResult object with a status and message.
	 */
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		PluginResult.Status status = PluginResult.Status.OK;
		String result = "";		
		
		try {
			if (action.equals("progressStart")) {
				this.progressStart(args.getString(0),args.getString(1));
			}
			else if (action.equals("progressStop")) {
				this.progressStop();
			}
			return new PluginResult(status, result);
		} catch (JSONException e) {
			return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
		}
	}

	/**
	 * Identifies if action to be executed returns a value and should be run synchronously.
	 * 
	 * @param action	The action to execute
	 * @return			T=returns value
	 */
	public boolean isSynch(String action) {
		if (action.equals("progressStart")) {
			return true;
		}
		else if (action.equals("progressStop")) {
			return true;
		}
		else {
			return false;
		}
	}

    //--------------------------------------------------------------------------
    // LOCAL METHODS
    //--------------------------------------------------------------------------
	
	/**
	 * Show the progress dialog.
	 * 
	 * @param title			Title of the dialog
	 * @param message		The message of the dialog
	 */
	public synchronized void progressStart(final String title, final String message) {
		if (this.progressDialog != null) {
			this.progressDialog.dismiss();
			this.progressDialog = null;
		}
		final IndeterminateProgress notification = this;
		final PhonegapActivity ctx = this.ctx;
		Runnable runnable = new Runnable() {
			public void run() {
				notification.progressDialog = new ProgressDialog(ctx);
                notification.progressDialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
                notification.progressDialog.setCancelable(false);
                notification.progressDialog.setIndeterminate(true);
				notification.progressDialog.setTitle(title);
				notification.progressDialog.setMessage(message);
				notification.progressDialog.show();
			}
		};
		this.ctx.runOnUiThread(runnable);
	}
	
	/**
	 * Stop progress dialog.
	 */
	public synchronized void progressStop() {
		if (this.progressDialog != null) {
			this.progressDialog.dismiss();
			this.progressDialog = null;
		}
	}

}