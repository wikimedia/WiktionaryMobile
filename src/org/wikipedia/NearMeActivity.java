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
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

import com.google.android.maps.GeoPoint;
import com.google.android.maps.MapActivity;
import com.google.android.maps.MapView;
import com.google.android.maps.MyLocationOverlay;
import com.google.android.maps.Overlay;
import com.google.android.maps.OverlayItem;

public class NearMeActivity extends MapActivity {
	
	private MapView mapView;
	private ProgressDialog progressDialog;
	private List<Overlay> mapOverlays;
	private MyLocationOverlay myLocationOverlay;
	private String lang;
	
	private class UpdateGeonames extends AsyncTask<Double, Void, Integer>{
		protected void onPreExecute() {
			showDialog();
			mapView.getOverlays().clear();
		}
		protected Integer doInBackground(Double... gps) {
			WikipediaApp app = (WikipediaApp)getApplicationContext();
			app.geonames = RestJsonClient.getWikipediaNearbyLocations(gps[0], gps[1], lang);
			if(app.geonames != null) {
				for(GeoName g: app.geonames) {
					mapOverlays.add(createItemizedOverlay(g));
				}
				Log.d("NearMeActivity", "Size "+ app.geonames.size()+ "Size Overlays "+mapOverlays.size());
				return app.geonames.size();
			}
			return 0;
		}
		protected void onPostExecute(Integer result) {
			myLocationOverlay.enableMyLocation();
			mapView.getOverlays().add(myLocationOverlay);
			mapView.invalidate();
			progressDialog.dismiss();
		}
	}
	
	public GeoName getGeoName(String title) {
		WikipediaApp app = (WikipediaApp)getApplicationContext();
		Iterator<GeoName> it = app.geonames.iterator();
		while(it.hasNext()) {
			GeoName geoname = it.next();
			Log.d("NearMeActivity", "GeoName title "+geoname.getTitle() + " OverLay title " + title);
			if(geoname.getTitle().compareTo(title) == 0) {
				return geoname;
			}
		}
		
		return null;
	}
	
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
	    MenuInflater inflater = getMenuInflater();
	    inflater.inflate(R.menu.nearme_menu, menu);
	    return true;
	}
	
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
	    // Handle item selection
	    switch (item.getItemId()) {
	    case R.id.my_location:
	        searchNearBy();
	        return true;
	    default:
	        return super.onOptionsItemSelected(item);
	    }
	}
	
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.nearme);
		
		WikipediaApp app = (WikipediaApp)getApplicationContext();
		
		mapView = (MapView)findViewById(R.id.mapview);
		mapView.setBuiltInZoomControls(true);
		
		mapView.getController().setZoom(13);
		
		mapOverlays = mapView.getOverlays();
		
		myLocationOverlay = new MyLocationOverlay(this, mapView);
		
		lang = getIntent().getExtras().getString("language");
		
		if(app.geonames != null) {
			myLocationOverlay.enableMyLocation();
			for(GeoName g: app.geonames) {
				mapOverlays.add(createItemizedOverlay(g));
			}
			mapOverlays.add(myLocationOverlay);
		} else {
			searchNearBy();
		}
		
		
		Button redo = (Button)findViewById(R.id.redo);
		final MapView mapv = mapView;
		redo.setOnClickListener(new OnClickListener() {			
			@Override
			public void onClick(View v) {
				GeoPoint p = mapv.getMapCenter();
				Log.d("NearMeActivity", "Map Center Latitude "+( p.getLatitudeE6() /Math.pow(10, 6)) +" Longitude "+ (p.getLongitudeE6() / Math.pow(10, 6)));
				searchNearLocation(p);
			}
		});
	}
	
	@Override
	public void onStop() {
		super.onStop();
		myLocationOverlay.disableMyLocation();
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
		final double[] gps = getGPS();
		Log.d("NearMeActivity", "Latitude: "+gps[0]+" longitude: "+gps[1]);

		GeoPoint location = new GeoPoint((int)(gps[0] * Math.pow(10, 6)), 
				  (int)(gps[1] * Math.pow(10, 6)));
		
		searchNearLocation(location);
	}
	
	private void searchNearLocation(GeoPoint p) {
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
