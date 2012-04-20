package org.wiktionary;

import java.net.URLEncoder;

import android.content.Intent;
import android.os.Bundle;

import com.phonegap.DroidGap;

public class WiktionaryActivity extends DroidGap {
    /** Called when the activity is first created. */

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
          
        String startingUrl = "file:///android_asset/www/index.html";

        super.loadUrl(startingUrl);
        
        String currentUA = this.appView.getSettings().getUserAgentString();
        
        this.appView.getSettings().setUserAgentString("WiktionaryMobile/1.1 " + currentUA);
    }
    
}
