package org.wikipedia;

//import android.app.SearchManager;
//import android.content.Intent;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import android.app.ProgressDialog;
import android.app.SearchManager;
import android.content.Intent;
import android.graphics.drawable.Drawable;
import android.location.Location;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import com.google.android.maps.GeoPoint;
import com.google.android.maps.MapActivity;
import com.google.android.maps.MapView;
import com.google.android.maps.Overlay;
import com.google.android.maps.OverlayItem;

public class NearMeActivity extends MapActivity {
	
	private MapView mapView;
	private ProgressDialog progressDialog;
	private List<Overlay> mapOverlays;
	private ArrayList<GeoName> geonames;
	
	private class UpdateGeonames extends AsyncTask<Double, Void, Integer>{
		protected Integer doInBackground(Double... gps) {
			geonames = RestJsonClient.getWikipediaNearbyLocations(gps[0], gps[1]);
			if(geonames != null) {
				Iterator<GeoName> it = geonames.iterator();
				while(it.hasNext()) {
					mapOverlays.add(createItemizedOverlay(it.next()));
				}
				Log.d("NearMeActivity", "Size "+geonames.size()+"Size Overlays "+mapOverlays.size());
				return geonames.size();
			}
			return 0;
		}
		protected void onPostExecute(Integer result) {
			mapView.getController().zoomIn();
			progressDialog.dismiss();
		}
	}
	
	public GeoName getGeoName(String title) {
		Iterator<GeoName> it = geonames.iterator();
		while(it.hasNext()) {
			GeoName geoname = it.next();
			Log.d("NearMeActivity", "GeoName title "+geoname.getTitle() + " OverLay title " + title);
			if(geoname.getTitle().compareTo(title) == 0) {
				return geoname;
			}
		}
		
		return null;
	}
	
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.nearme);
		
		mapView = (MapView)findViewById(R.id.mapview);
		mapView.setBuiltInZoomControls(true);
		
		mapView.getController().setZoom(13);
		
		mapOverlays = mapView.getOverlays();
		
		progressDialog = new ProgressDialog(this);
		progressDialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
		progressDialog.setTitle("Loading");
		progressDialog.setCancelable(false);
        progressDialog.setIndeterminate(true);
		progressDialog.setMessage("Searching nearby locations...");
		progressDialog.show();
		
		final double[] gps = getGPS();
		Log.d("NearMeActivity", "Latitude: "+gps[0]+" longitude: "+gps[1]);
		
		GeoPoint location = new GeoPoint((int)(gps[0] * Math.pow(10, 6)), 
				  (int)(gps[1] * Math.pow(10, 6)));
		
		mapView.getController().setCenter(location);
		
		new UpdateGeonames().execute(gps[0], gps[1]);
		
		Intent intent = getIntent();
		if(Intent.ACTION_SEARCH.equals(intent.getAction())) {
			String query = intent.getStringExtra(SearchManager.QUERY);
			doMySearch(query);
		}
	}
	
	private void doMySearch(String query) {
		
	}
	
	protected boolean isRouteDisplayed() {
		return false;
	}
	
	private WikiItemizedOverlay createItemizedOverlay(GeoName geoname) {
		Drawable drawable = this.getResources().getDrawable(R.drawable.pin);
		WikiItemizedOverlay itemizedoverlay = new WikiItemizedOverlay(drawable, this);
		
		GeoPoint point = new GeoPoint((int)(geoname.getLatitude() * Math.pow(10, 6)), 
									  (int)(geoname.getLongitude() * Math.pow(10, 6))); 
		OverlayItem overlayitem = new OverlayItem(point, geoname.getTitle(), geoname.getSummary());
//		
		itemizedoverlay.addOverlay(overlayitem);
		return itemizedoverlay;
	}
	
	private double[] getGPS() {
		LocationManager lm = (LocationManager) getSystemService(LOCATION_SERVICE);
		List<String> providers = lm.getProviders(true);

		/*
		 * Loop over the array backwards, and if you get an accurate location,
		 * then break out the loop
		 */
		Location l = null;

		for (int i = providers.size() - 1; i >= 0; i--) {
			l = lm.getLastKnownLocation(providers.get(i));
			if (l != null)
				break;
		}

		double[] gps = new double[2];
		if (l != null) {
			gps[0] = l.getLatitude();
			gps[1] = l.getLongitude();
		}
		return gps;
	}
}
