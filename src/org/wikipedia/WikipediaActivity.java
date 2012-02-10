package org.wikipedia;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
//import android.util.Log;
//import android.webkit.WebView;

import com.phonegap.DroidGap;

public class WikipediaActivity extends DroidGap {
    /** Called when the activity is first created. */
	
	public class WikipediaWebViewClient extends GapViewClient {
		public WikipediaWebViewClient(DroidGap ctx) {
			super(ctx);
		}
		
		//@Override
		//public void onLoadResource(WebView view, String url) {
		//	Log.d("WikipediaWebViewClient", "OnLoadResource "+url);
		//}
		
	}
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        super.loadUrl("file:///android_asset/www/index.html");
        this.webViewClient = new WikipediaWebViewClient(this);
        this.appView.setWebViewClient(this.webViewClient);
        
        String currentUA = this.appView.getSettings().getUserAgentString();
        
        this.appView.getSettings().setUserAgentString("WikipediaMobile/1.1 " + currentUA);
    }
    
    @Override
    public void onReceivedError(final int errorCode, final String description, final String failingUrl) {
    	// no-op!
    }
}
