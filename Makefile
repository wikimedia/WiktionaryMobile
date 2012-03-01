remotes:
	curl -o assets/www/js/application.js \
		http://svn.wikimedia.org/svnroot/mediawiki/trunk/extensions/MobileFrontend/javascripts/application.js 

clean:
	rm assets/www/js/application.js
