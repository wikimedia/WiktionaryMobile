package org.wikipedia;

import java.io.File;

import android.app.Application;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

public class WikipediaApp extends Application {

	public static final String PREFS_NAME = "WikiPreferences";
	
	// Migrate the database from Android app v1.0.x to v1.1 (version code 1 to 10)
	// Caused due to Migration from PhoneGap 1.3 to 1.4.1
	// Which changed the path Databases are stored in
	private void migrateDatabaseFromvc1() {
		Log.d("PhoneGapLog", "Migration happening");
		File v1File = new File("/data/data/org.wikipedia/databases/savedPagesDB.db");
		File v10File = new File("/data/data/org.wikipedia/app_database:savedPagesDB.db");
		if(!v1File.exists()) {
			// New install - no v1 files to be removed
			return;
		}
		if(!v10File.exists()) {
			// Upgrade from v1 to v11 - No intermediate file created
			// Just move the old database, all is well
			v1File.renameTo(v10File);
			return;
		}
		
		// v1 -> v10 -> v11. We need to 'merge' the v1 and v10 databases together
		SQLiteDatabase v1Db = SQLiteDatabase.openDatabase(v1File.getAbsolutePath(), null, SQLiteDatabase.OPEN_READONLY);
		SQLiteDatabase v10Db = SQLiteDatabase.openDatabase(v10File.getAbsolutePath(), null, SQLiteDatabase.OPEN_READWRITE);

		Cursor oldData = v1Db.rawQuery("SELECT * from savedPagesDB", null);
		oldData.moveToFirst();
		while(!oldData.isAfterLast()) {
			String[] params = { oldData.getString(0), oldData.getString(1), oldData.getString(2) };
			
			Cursor selectCursor =  v10Db.rawQuery("SELECT * FROM savedPagesDB WHERE id = ?", new String[] { params[0] });
			if(selectCursor.getCount() != 0) {
				return;
			}
			v10Db.execSQL("INSERT INTO savedPagesDB VALUES (?, ?, ?)", params);
			oldData.moveToNext();
		}
		
		v1Db.close();
		v10Db.close();
	}
	
	@Override
	public void onCreate() {
		  super.onCreate();
	      SharedPreferences settings = this.getSharedPreferences(PREFS_NAME, 0);
	      int lastVersionCode = settings.getInt("lastVersionCode", 0);
	      PackageInfo pinfo = null; 
	      try {
			pinfo = getPackageManager().getPackageInfo(getPackageName(), 0);
	      } catch (NameNotFoundException e) {
			// This means that the system is lying to us 
			// That what the system tell us is the package name of the code *currently running*
			// Does not exist.
			// Way to protect me from myself, Java! Thank you, my savior!
	      }

	      if(lastVersionCode == 0 || pinfo.versionCode > lastVersionCode) {
	    	  // We have a new install! (Or a 'clear data')
	    	  // Or on upgrade
	    	 migrateDatabaseFromvc1();
	    	  
	      }
	      
	      settings.edit().putInt("lastVersionCode", pinfo.versionCode);

	}
}
