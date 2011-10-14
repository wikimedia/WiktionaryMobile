package org.wikipedia;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

public class RestJsonClient {

	public static ArrayList<GeoName> getWikipediaNearbyLocations(
			double latitude, double longitude) {
		HttpURLConnection urlConnection = null;
		ArrayList<GeoName> geoList = new ArrayList<GeoName>();
		try {
			String requestUrl = "http://ws.geonames.org/findNearbyWikipediaJSON?formatted=true&";
			requestUrl += "lat=" + latitude + "&";
			requestUrl += "lng=" + longitude + "&";
			requestUrl += "username=wikimedia";
			Log.d("RestJsonClient", requestUrl);
			URL url = new URL(requestUrl);
			urlConnection = (HttpURLConnection) url.openConnection();
			String jsonStr = convertStreamToString(urlConnection
					.getInputStream());
			Log.d("RestJsonClient", jsonStr);

			// getting data and if we don't we just get out of here!
			JSONArray geonames = null;
			try {
				JSONObject json = new JSONObject(jsonStr);
				geonames = json.getJSONArray("geonames");
			} catch (JSONException e) {
				e.printStackTrace();
				return null;
			} 

			for (int i = 0; i < geonames.length(); i++) {
				try {
					JSONObject geonameObj = geonames.getJSONObject(i);
					geoList.add(new GeoName(
							geonameObj.getString("wikipediaUrl"), geonameObj
									.getString("title"), geonameObj
									.getString("summary"), geonameObj
									.getDouble("lat"), geonameObj
									.getDouble("lng")));
				} catch(JSONException e) {
					// ignore exception and keep going!
					e.printStackTrace();
				}
			}
			return geoList;
		} catch (MalformedURLException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			urlConnection.disconnect();
		}

		return geoList;
	}

	public static String convertStreamToString(InputStream is) {
		BufferedReader reader = new BufferedReader(new InputStreamReader(is));
		StringBuilder sb = new StringBuilder();
		String line = null;

		try {
			while ((line = reader.readLine()) != null) {
				sb.append(line + "\n");
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				is.close();
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		return sb.toString();
	}
}
