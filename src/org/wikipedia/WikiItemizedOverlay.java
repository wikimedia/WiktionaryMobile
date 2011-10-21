package org.wikipedia;

import java.util.ArrayList;

import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ImageView;
import android.widget.TextView;

import com.google.android.maps.ItemizedOverlay;
import com.google.android.maps.OverlayItem;

public class WikiItemizedOverlay extends ItemizedOverlay<OverlayItem> {
	
	private ArrayList<OverlayItem> mOverlays = new ArrayList<OverlayItem>();
	private Context mContext;

	public WikiItemizedOverlay(Drawable defaultMarker) {
		super(boundCenterBottom(defaultMarker));
	}
	
	public WikiItemizedOverlay(Drawable defaultMarker, Context context) {
		this(defaultMarker);
		mContext = context;
	}
	
	public void addOverlay(OverlayItem overlay) {
		mOverlays.add(overlay);
		populate();
	}
	
	@Override
	protected OverlayItem createItem(int i) {
		return mOverlays.get(i);
	}
	
	@Override
	public int size() {
		return mOverlays.size();
	}
	
	
	
	@Override
	protected boolean onTap(int index) {
		final int idx = index;
		final NearMeActivity mp = (NearMeActivity) mContext;
		OverlayItem item = mOverlays.get(index);
		final Dialog dialog = new Dialog(mContext);
		dialog.setContentView(R.layout.geoname_dialog);
		dialog.setTitle(item.getTitle());
		TextView summary = (TextView) dialog.findViewById(R.id.summary);
		summary.setText(item.getSnippet());
		
		ImageView gotoicon = (ImageView) dialog.findViewById(R.id.gotoicon);
		gotoicon.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				dialog.dismiss();
				Intent i = new Intent();
				Bundle b = new Bundle();
				b.putString("wikipediaUrl", mp.getGeoName(idx).getWikipediaUrl());
				Log.d("WikiItemizedOverlay", "Overlay URL "+mp.getGeoName(idx).getWikipediaUrl());
				i.putExtras(b);
				mp.setResult(NearMePlugin.RESULT_OK, i);
				mp.finish();
			}
		});
		dialog.show();
		return true;
	}

}
