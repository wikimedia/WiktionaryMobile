remotes:
	curl -o assets/www/js/application.js \
		http://svn.wikimedia.org/svnroot/mediawiki/trunk/extensions/MobileFrontend/javascripts/application.js 
	curl -o assets/www/common.css \
		http://svn.wikimedia.org/svnroot/mediawiki/trunk/extensions/MobileFrontend/stylesheets/common.css

clean:
	rm assets/www/js/application.js
	rm assets/www/common.js
