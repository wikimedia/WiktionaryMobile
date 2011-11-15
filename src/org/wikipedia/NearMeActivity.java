package org.wikipedia;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import android.app.ProgressDialog;
import android.content.SharedPreferences;
import android.graphics.drawable.Drawable;
import android.location.Location;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

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
		
		SharedPreferences preferences = getSharedPreferences("nearby", MODE_PRIVATE);
		
		if(preferences.getBoolean("doSearchNearBy", true)) {
			searchNearBy();
		}
		
		Button redo = (Button)findViewById(R.id.redo);
		final MapView mapv = mapView;
		redo.setOnClickListener(new OnClickListener() {			
			@Override
			public void onClick(View v) {
				GeoPoint p = mapv.getMapCenter();
				Log.d("NearMeActivity", "Map Center Latitude "+( p.getLatitudeE6() /Math.pow(10, 6)) +" Longitude "+ (p.getLongitudeE6() / Math.pow(10, 6)));
				mapv.getOverlays().clear();
				searchNearLocation(p);
			}
		});
	}
	
	@Override
	protected void onPause() {
		super.onPause();
		SharedPreferences preferences = getSharedPreferences("nearby", MODE_PRIVATE);
		SharedPreferences.Editor editor = preferences.edit();
		editor.putBoolean("doSearchNearBy", false);
		editor.commit();
	}
	
	private  void showDialog() {
		progressDialog = new ProgressDialog(this);
		progressDialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
		progressDialog.setTitle("Loading");
		progressDialog.setCancelable(false);
        progressDialog.setIndeterminate(true);
		progressDialog.setMessage("Searching nearby locations...");
		progressDialog.show();
	}
	
	private void searchNearBy() {
		showDialog();
		final double[] gps = getGPS();
		Log.d("NearMeActivity", "Latitude: "+gps[0]+" longitude: "+gps[1]);
		
		GeoPoint location = new GeoPoint((int)(gps[0] * Math.pow(10, 6)), 
				  (int)(gps[1] * Math.pow(10, 6)));
		
		mapView.getController().setCenter(location);
		
		new UpdateGeonames().execute(gps[0], gps[1]);
	}
	
	private void searchNearLocation(GeoPoint p) {
		showDialog();
		mapView.getController().setCenter(p);
		double latitude = p.getLatitudeE6() / Math.pow(10, 6);
		double longitude = p.getLongitudeE6() / Math.pow(10, 6);
		new UpdateGeonames().execute(latitude, longitude);
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
