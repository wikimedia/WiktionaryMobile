package org.wikipedia;

import android.content.SharedPreferences;
import android.os.Bundle;
//import android.util.Log;
//import android.webkit.WebView;

import com.phonegap.DroidGap;

public class WikipediaActivity extends DroidGap {
    /** Called when the activity is first created. */
	
//	public class WikipediaWebViewClient extends GapViewClient {
//		public WikipediaWebViewClient(DroidGap ctx) {
//			super(ctx);
//		}
//		
//		@Override
//		public void onLoadResource(WebView view, String url) {
//			Log.d("WikipediaWebViewClient", "OnLoadResource "+url);
//		}
//		
//	}
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // NearBy shit
		SharedPreferences preferences = getSharedPreferences("nearby", MODE_PRIVATE);
		SharedPreferences.Editor editor = preferences.edit();
		editor.remove("doSearchNearBy");
		editor.commit();
		
        super.loadUrl("file:///android_asset/www/index.html");
//        this.webViewClient = new WikipediaWebViewClient(this);
        this.appView.setWebViewClient(this.webViewClient);
    }
}