REVISION=113645
remotes:
	curl -o assets/www/js/toggle.js \
		"http://svn.wikimedia.org/viewvc/mediawiki/trunk/extensions/MobileFrontend/javascripts/toggle.js?view=co&revision=$(REVISION)&content-type=text%2Fplain&pathrev=$(REVISION)"
	curl -o assets/www/common.css \
		"http://svn.wikimedia.org/viewvc/mediawiki/trunk/extensions/MobileFrontend/stylesheets/common.css?view=co&revision=$(REVISION)&content-type=text%2Fplain&pathrev=$(REVISION)"

sitematrix:
	curl -o assets/www/sitematrix.json \
		"http://en.wikipedia.org/w/api.php?action=sitematrix&format=json"

clean:
	rm assets/www/js/toggle.js
	rm assets/www/common.css
