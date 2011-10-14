package org.wikipedia;

public class GeoName {
	
	public GeoName(String wikipediaUrl, String title, String summary,
			double latitude, double longitude) {
		super();
		this.wikipediaUrl = wikipediaUrl;
		this.title = title;
		this.summary = summary;
		this.latitude = latitude;
		this.longitude = longitude;
	}

	private String wikipediaUrl;
	private String title;
	private String summary;
	private double latitude;
	private double longitude;
	
	public GeoName(double latitude, double longitude) {
		this.latitude = latitude;
		this.longitude = longitude;
	}

	public double getLatitude() {
		return latitude;
	}

	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}

	public double getLongitude() {
		return longitude;
	}

	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}

	public String getWikipediaUrl() {
		return wikipediaUrl;
	}

	public void setWikipediaUrl(String wikipediaUrl) {
		this.wikipediaUrl = wikipediaUrl;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getSummary() {
		return summary;
	}

	public void setSummary(String summary) {
		this.summary = summary;
	}

}
