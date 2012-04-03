package org.wikipedia;

import java.net.URLEncoder;
import java.util.Locale;

import org.json.JSONArray;

import android.app.SearchManager;
import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.provider.BaseColumns;
import android.util.Log;

public class SearchSuggestionsProvider extends ContentProvider {
	private static final String AUTHORITY = "org.wikipedia.searchsuggestions";
	public static final Uri CONTENT_URI = Uri.parse("content://" + AUTHORITY);

	@Override
	public String getType(Uri uri) {
		return null;
	}

	@Override
	public boolean onCreate() {
		return true;
	}

	private String getDefaultLanguage() {
		// Returns default language to be used. 
		// Takes default system language, and does minor fixes so that they match the languages wikipedia uses
		String locale = Locale.getDefault().getLanguage();
		String language = locale.split("-")[0];
		if(language == "iw") {
			// Java (and Android) think Hebrew is iw, while it actually is he
			language = "he";
		}
		return language;
	}
	@Override
	public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
		String query = uri.getLastPathSegment();
		try {
			SharedPreferences settings = this.getContext().getSharedPreferences(PreferencesPlugin.PREFS_NAME, Context.MODE_PRIVATE);
			String lang = settings.getString("language", getDefaultLanguage());

			String[] columnNames = { BaseColumns._ID, SearchManager.SUGGEST_COLUMN_TEXT_1, SearchManager.SUGGEST_COLUMN_INTENT_DATA };
			MatrixCursor cursor = new MatrixCursor(columnNames);
			String content = HttpApi.getContent("http://" + lang + ".wikipedia.org/w/api.php?action=opensearch&limit=10&namespace=0&format=json&search=" + URLEncoder.encode(query, "UTF-8"));
			JSONArray response = new JSONArray(content);
			JSONArray suggestions = response.getJSONArray(1);
			int lenght = suggestions.length();
			for (int i = 0; i < lenght; i++) {
				String suggestion = suggestions.getString(i);
				String[] row = { String.valueOf(i), suggestion, "http://" + lang + ".m.wikipedia.org/wiki/" + suggestion };
				cursor.addRow(row);
			}
			return cursor;
		} catch (Exception e) {
			Log.e("SearchSuggestionsProvider", e.getMessage());
			return null;
		}
	}

	@Override
	public Uri insert(Uri uri, ContentValues values) {
		return null;
	}

	@Override
	public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
		return 0;
	}

	@Override
	public int delete(Uri uri, String selection, String[] selectionArgs) {
		return 0;
	}
}
