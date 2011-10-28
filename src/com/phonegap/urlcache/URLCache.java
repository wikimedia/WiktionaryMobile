package com.phonegap.urlcache;

import java.io.BufferedInputStream;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;
import android.webkit.WebView;
import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

public final class URLCache extends Plugin {

	@Override
	public void setView(WebView arg0) {
		// Auto-generated method stub
	}
	
	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {

		PluginResult.Status status = PluginResult.Status.OK;
		String result = "";

		String uri = null;
		String fileName = "";
		
		try {
			uri = args.getString(0);
			fileName = md5(uri);
		} catch (JSONException e1) {
			status = PluginResult.Status.JSON_EXCEPTION;
			result = "{ message: 'JSONException', status: "+status.ordinal()+" }";
		}

		if (uri != null && action.equals("getCachedPathForURI") && args.length() >=1)
		{
			// First check if the file exists already
			String fileDir = ctx.getFilesDir().getAbsolutePath();
			String filePath = fileDir + "/" + fileName;
			
			File f = new File(filePath);
			if (f.exists()) {
				result = "{\"file\":\""+filePath+"\",\"status\":\"0\"}";
			} else {

				URL u;
				InputStream is = null;
				DataInputStream dis;
				FileOutputStream out = null;
				byte[] buffer = new byte[1024];
				int length = -1;
				
				try {
					u = new URL(uri);
					is = u.openStream();         // throws an IOException
					dis = new DataInputStream(new BufferedInputStream(is));
					out = ctx.openFileOutput(fileName, Context.MODE_PRIVATE);
					while ((length = dis.read(buffer)) != -1) {
						out.write(buffer, 0, length);
					}
					out.flush();
					result = "{\"file\":\""+filePath+"\",\"status\":\"0\"}";
				} catch (MalformedURLException e) {
					status = PluginResult.Status.MALFORMED_URL_EXCEPTION;
					result = "{ message: 'MalformedURLException', status: "+status.ordinal()+" }";
				} catch (IOException e) {
					status = PluginResult.Status.IO_EXCEPTION;
					result = "{ message: 'IOException', status: "+status.ordinal()+" }";
				} finally {
					try {
						is.close();
						out.close();
					} catch (IOException e) {
						status = PluginResult.Status.IO_EXCEPTION;
						result = "{ message: 'IOException', status: "+status.ordinal()+" }";
					}
				}
			}
		} else {
			status = PluginResult.Status.INVALID_ACTION;
			result = "{ message: 'InvalidAction', status: "+status.ordinal()+" }";
		}
		
		if (status==PluginResult.Status.OK) {
			this.success(new PluginResult(status, result), callbackId);
		}
		else {
			this.error(new PluginResult(status, result), callbackId);
		}
		
		return new PluginResult(status, result);
		
	}
	
	public String md5(String s) {  
	    try {  
	        // Create MD5 Hash  
	        MessageDigest digest = java.security.MessageDigest.getInstance("MD5");  
	        digest.update(s.getBytes());  
	        byte messageDigest[] = digest.digest();  

	        // Create Hex String  
	        StringBuffer hexString = new StringBuffer();  
	        for (int i=0; i<messageDigest.length; i++)  
	            hexString.append(Integer.toHexString(0xFF & messageDigest[i]));  
	        return hexString.toString();  
	          
	    } catch (NoSuchAlgorithmException e) {  
	        e.printStackTrace();  
	    }  
	    return "";  
	}
}
