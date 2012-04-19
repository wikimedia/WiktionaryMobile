window.savedPages = function() {

	function doSave() {
		var page = app.curPage;
		var d = $.Deferred();
		var replaceRes = function() {
			// images
			$('#main img').each(function() {
				var em = $(this);
				var gotLinkPath = function(linkPath) {
					em.attr('src', 'file://' + linkPath.file);
				}
				var target = this.src.replace('file:', 'https:');
				window.plugins.urlCache.getCachedPathForURI(target, gotLinkPath, gotError);
			});
		};
		var gotPath = function(cachedPage) {
				replaceRes();
				d.resolve();
		}
		var gotError = function(error) {
			console.log('Error: ' + error);
			chrome.hideSpinner();
		}
		app.track('mobile.app.wikipedia.save-page');
		window.plugins.urlCache.getCachedPathForURI(page.getAPIUrl(), gotPath, gotError);
		return d;
	}

	function saveCurrentPage() {
		var MAX_LIMIT = 50;

		var title = app.getCurrentTitle();
		var url = app.getCurrentUrl();

		console.log("url is " + url);
		var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
			this.keys(function(records) {
				if (records != null) {
					if (records.length > MAX_LIMIT) {
						// we've reached the max limit
						// @todo this is probably not great, remove this :)
						alert(mw.message("saved-pages-max-warning").plain());
					}else{
						savedPagesDB.save({key: app.curPage.getAPIUrl(), title: title, lang: app.curPage.lang});
						savedPages.doSave(app.curPage.getAPIUrl(), title);
					}
				}
			});
		});
	}

	function onSavedPageClick() {
		var parent = $(this).parents(".listItemContainer");
		var url = parent.data("page-url");
		var lang = parent.data("page-lang");
		var title = parent.data("page-title");
		chrome.showContent();
		app.loadCachedPage(url, title, lang);
	}

	function onSavedPageDelete() {
		var parent = $(this).parents(".listItemContainer");
		var url = parent.data("page-url");
		var title = parent.data("page-title");
		deleteSavedPage(title, url);
	}

	function deleteSavedPage(title, url) {
		chrome.confirm(mw.message('saved-page-remove-prompt', title).plain()).done(function(answer) {
			if (answer) {
				var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
					this.remove(url, function() {
						chrome.showNotification(mw.message('saved-page-removed', title ).plain());
						$(".listItemContainer[data-page-url=\'" + url + "\']").hide();
					});
				});
			}
		});
	}

	// Removes all the elements from saved pages
	function onClearSavedPages() {
		chrome.confirm(mw.message('clear-all-saved-pages-prompt').plain()).done(function(answer) {
			if (answer) {
				var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
					this.nuke();
					chrome.showContent();
				});
			}
		});
	}


	function showSavedPages() {
		var template = templates.getTemplate('saved-pages-template');
		var savedPagesDB = new Lawnchair({name:"savedPagesDB"}, function() {
			this.all(function(savedpages) {	
				$('#savedPagesList').html(template.render({'pages': savedpages}));
				$(".savedPage").click(onSavedPageClick);
				$("#savedPages .cleanButton").unbind('click', onClearSavedPages).bind('click', onClearSavedPages);
				$(".deleteSavedPage").click(onSavedPageDelete);
				chrome.hideOverlays();
				$('#savedPages').localize().show();
				chrome.hideContent();
				chrome.doFocusHack();
				chrome.setupScrolling('#savedPages .scroller');
				chrome.scrollTo('#savedPages .scroller', 0);
			});
		});

	}

	return {
		showSavedPages: showSavedPages,
		saveCurrentPage: saveCurrentPage,
		doSave: doSave
	};
}();
