package org.wiktionary;

import java.net.URLEncoder;

import android.app.SearchManager;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.phonegap.DroidGap;

public class WiktionaryActivity extends DroidGap {
    // Wrapper to pass Intent word to phonegap
    private static class StartingWordAccessor {
      private String wordToShow;
      public StartingWordAccessor(String word) {
        this.wordToShow = word;
      }
      public String getStartingWord() {
        return this.wordToShow;
      }
    }

    /** Called when the activity is first created. */

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Need this for addJavascriptInterface to work
        super.init();
          
        // Check if we were started by another app's Intent
        String wordToShow = null;
        
        Intent startingIntent = this.getIntent();
        if (startingIntent != null) {
    		Bundle extraParams = startingIntent.getExtras();
    		if (extraParams != null) {
    			String value = extraParams.getString(Intent.EXTRA_TEXT);
    			if (value != null && !value.trim().equals("")) {
    				wordToShow = value;
    			}
    		}
        }

        if (wordToShow != null) { // Specify the word display on startup

          // See if we came from another wiki app (and thus have to parse a url)
          String wikiUrl = "/wiki/";
    	  int position = wordToShow.indexOf(wikiUrl);
    	  if (position != -1) {
    		  wordToShow = wordToShow.substring(position + wikiUrl.length());
    	  }

          wordToShow = URLEncoder.encode(wordToShow);

          Log.d("WiktionaryActivity", "App opened with Intent. Word: " + wordToShow);
        }
        
        String startingUrl = "file:///android_asset/www/index.html";
        appView.addJavascriptInterface(new StartingWordAccessor(wordToShow),
          "startingWordAccessor");

        super.loadUrl(startingUrl);
        
        String currentUA = this.appView.getSettings().getUserAgentString();
        this.appView.getSettings().setUserAgentString("WiktionaryMobile/1.1 " + currentUA);
    }
    
}

