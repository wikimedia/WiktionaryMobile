package org.wikipedia;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

import android.util.Log;

public class HttpApi {

	public static synchronized String getContent(String url) throws Exception {
		HttpClient client = new DefaultHttpClient();
		HttpGet request = new HttpGet(url);
		try {
			HttpResponse response = client.execute(request);
			StatusLine status = response.getStatusLine();
			if (status.getStatusCode() != 200) {
				throw new Exception("Invalid response from server: " + status.toString());
			}
			HttpEntity entity = response.getEntity();
			InputStream inputStream = entity.getContent();
			ByteArrayOutputStream content = new ByteArrayOutputStream();
			// Read response into a buffered stream
			int readBytes = 0;
			byte[] sBuffer = new byte[12048];
			while ((readBytes = inputStream.read(sBuffer)) != -1) {
				content.write(sBuffer, 0, readBytes);
			}
			return new String(content.toByteArray());
		} catch (IOException e) {
			Log.e("Wikipedia-api", e.getMessage());
			throw new Exception("Problem communicating with API", e);
		}
	}
}
