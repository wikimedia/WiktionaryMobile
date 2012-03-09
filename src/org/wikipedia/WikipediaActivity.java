package org.wikipedia;

import android.os.Bundle;

import com.phonegap.DroidGap;

public class WikipediaActivity extends DroidGap {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		super.loadUrl("file:///android_asset/www/index.html");

		String currentUA = this.appView.getSettings().getUserAgentString();

		this.appView.getSettings().setUserAgentString("WikipediaMobile/1.1 " + currentUA);
	}
}
