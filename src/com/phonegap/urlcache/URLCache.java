package com.phonegap.urlcache;

import java.io.BufferedInputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

public final class URLCache extends Plugin {

	public static String TAG = "URLCache";

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {

		PluginResult.Status status = PluginResult.Status.OK;
		JSONObject result = new JSONObject();

		String uri = null;

		try {
			uri = args.getString(0);

			if (uri != null && action.equals("getCachedPathForURI")
					&& args.length() >= 1) {
				// First check if the file exists already
				String fileName = md5(uri);
				String fileDir = ctx.getFilesDir().getAbsolutePath();
				String filePath = fileDir + "/" + fileName;

				// Log.d(TAG, "URI: " + uri + " filePath: " + filePath);

				File f = new File(filePath);
				if (f.exists()) {
					// Log.d(TAG, "EXISTS ! " + filePath);
					result.put("file", filePath);
					result.put("status", 0);
				} else {
					// Log.d(TAG, "Fetching from server " + uri);
					URL u;
					DataInputStream dis = null;
					FileOutputStream out = null;
					byte[] buffer = new byte[1024];
					int length = -1;

					try {
						u = new URL(uri);
						URLConnection urlConnection = u.openConnection();
						dis = new DataInputStream(new BufferedInputStream(
								urlConnection.getInputStream()));
						out = ctx
								.openFileOutput(fileName, Context.MODE_PRIVATE);
						while ((length = dis.read(buffer)) != -1) {
							out.write(buffer, 0, length);
						}
						out.flush();
						result.put("file", filePath);
						result.put("status", 0);
					} catch (MalformedURLException e) {
						status = PluginResult.Status.MALFORMED_URL_EXCEPTION;
						result.put("message", "MalformedURLException");
						result.put("status", status.ordinal());
					} catch (IOException e) {
						status = PluginResult.Status.IO_EXCEPTION;
						result.put("message", "IOException");
						result.put("status", status.ordinal());
					} finally {
						try {
							dis.close();
							out.close();
						} catch (IOException e) {
							status = PluginResult.Status.IO_EXCEPTION;
							result.put("message", "IOException");
							result.put("status", status.ordinal());
						}
					}
				}
			} else {
				status = PluginResult.Status.INVALID_ACTION;
				result.put("message", "InvalidAction");
				result.put("status", status.ordinal());
			}
		} catch (JSONException e1) {
			status = PluginResult.Status.JSON_EXCEPTION;
			try {
				result.put("message", "JSONException");
				result.put("status", status.ordinal());
			} catch (JSONException e2) {
				// very bad if this happens
				e2.printStackTrace();
			}
		}
		// Log.d(TAG, result.toString());
		return new PluginResult(status, result);

	}

	public String md5(String s) {
		try {
			// Create MD5 Hash
			MessageDigest digest = java.security.MessageDigest
					.getInstance("MD5");
			digest.update(s.getBytes());
			byte messageDigest[] = digest.digest();

			// Create Hex String
			StringBuffer hexString = new StringBuffer();
			for (int i = 0; i < messageDigest.length; i++)
				hexString.append(Integer.toHexString(0xFF & messageDigest[i]));
			return hexString.toString();

		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		return "";
	}
}
