package org.wiktionary;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
//import android.util.Log;
//import android.webkit.WebView;

import com.phonegap.DroidGap;

public class WiktionaryActivity extends DroidGap {
    /** Called when the activity is first created. */
	
	public class WiktionaryWebViewClient extends GapViewClient {
		public WiktionaryWebViewClient(DroidGap ctx) {
			super(ctx);
		}
		
		//@Override
		//public void onLoadResource(WebView view, String url) {
		//	Log.d("WiktionaryWebViewClient", "OnLoadResource "+url);
		//}
		
	}
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/index.html");
        this.webViewClient = new WiktionaryWebViewClient(this);
        this.appView.setWebViewClient(this.webViewClient);
    }
    
    @Override
    public void onReceivedError(final int errorCode, final String description, final String failingUrl) {
    	// no-op!
    }
}
