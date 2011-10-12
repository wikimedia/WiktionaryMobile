package org.wikipedia;

//import android.app.SearchManager;
//import android.content.Intent;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import android.graphics.drawable.Drawable;
import android.location.Location;
import android.location.LocationManager;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageButton;

import com.google.android.maps.GeoPoint;
import com.google.android.maps.MapActivity;
import com.google.android.maps.MapView;
import com.google.android.maps.Overlay;
import com.google.android.maps.OverlayItem;

public class NearMeActivity extends MapActivity {
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.test);
		
		MapView mapView = (MapView)findViewById(R.id.mapview);
		mapView.setBuiltInZoomControls(true);
		
		final List<Overlay> mapOverlays = mapView.getOverlays();
		Drawable drawable = this.getResources().getDrawable(R.drawable.pin);
		WikiItemizedOverlay itemizedoverlay = new WikiItemizedOverlay(drawable, this);
		final double[] gps = getGPS();
		Log.d("NearMeActivity", "Latitude: "+gps[0]+" longitude: "+gps[1]);
		GeoPoint point = new GeoPoint(49281314,-123099768); 
		OverlayItem overlayitem = new OverlayItem(point, "Heya!", "I am in racoon city eh!");
//		
		itemizedoverlay.addOverlay(overlayitem);
		mapOverlays.add(itemizedoverlay);
		
		final ImageButton button = (ImageButton) findViewById(R.id.searchButton);
		button.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				ArrayList<GeoName> geonames = RestJsonClient.getWikipediaNearbyLocations(49.281314d, -123.099768d);
				Iterator<GeoName> it = geonames.iterator();
				while(it.hasNext()) {
					mapOverlays.add(createItemizedOverlay(it.next()));
				}
			}
		});
//		Intent intent = getIntent();
//		if(Intent.ACTION_SEARCH.equals(intent.getAction())) {
//			String query = intent.getStringExtra(SearchManager.QUERY);
//			doMySearch(query);
//		}
	}
	
//	private void doMySearch(String query) {
//		
//	}
	
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
