package org.wiktionary;

import java.net.URLEncoder;

import android.app.SearchManager;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.phonegap.DroidGap;

public class WiktionaryActivity extends DroidGap {
    /** Called when the activity is first created. */

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
          
        // Check if we were started by another app's Intent
        boolean startedFromAnotherApp = false;
        String wordToShow = null;
        
        Intent startingIntent = this.getIntent();
        if (startingIntent != null) {
    		Bundle extraParams = startingIntent.getExtras();
    		if (extraParams != null) {
    			String value = extraParams.getString(Intent.EXTRA_TEXT);
    			if (value != null && !value.trim().equals("")) {
    				startedFromAnotherApp = true;
    				wordToShow = value;
    			}
    		}
        }

        String startingUrl = "file:///android_asset/www/index.html";
        
        if (startedFromAnotherApp) { // Specify the word display on startup

          // See if we came from another wiki app (and thus have to parse a url)
          String wikiUrl = "/wiki/";
    	  int position = wordToShow.indexOf(wikiUrl);
    	  if (position != -1) {
    		  wordToShow = wordToShow.substring(position + wikiUrl.length());
    	  }

          wordToShow = URLEncoder.encode(wordToShow);
          startingUrl += "?define=" + wordToShow;

          Log.d("WiktionaryActivity", "App opened with Intent. Word: " + wordToShow);
        }

        super.loadUrl(startingUrl);
        
        String currentUA = this.appView.getSettings().getUserAgentString();
        
        this.appView.getSettings().setUserAgentString("WiktionaryMobile/1.1 " + currentUA);
    }
    
}