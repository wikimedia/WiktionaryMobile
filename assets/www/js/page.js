(function() {
	function parseSections(data) {
		// Note: THIS CODE IS HORRIBLE and *wrong*. Need to figure out correct way to 'tree'ize the data
		var sections = [];
		var lastSection = {};
		$.each(data.mobileview.sections, function(i, section) {
			console.log(section);
			if(section.id == 0) {
				// Lead section
				sections.push(section);
				return;
			}
			if(section.level <= 2) {
				curLevel = section.level;
				if(lastSection) {
					// for the first section
					sections.push(lastSection);
				}
				lastSection = section;
			} else {
				if(lastSection.subSections) {
					lastSection.subSections.push(section);
				} else {
					lastSection.subSections = [section];
				}
			}
		});
		return sections;
	}
	window.Page = function(data) { 
		this.sections = parseSections(data);
	};

	Page.requestFromTitle = function(title) {
		var d = $.Deferred();

		var request = makeAPIRequest({
			action: 'mobileview',
			page: title,
			redirects: '1',
			prop: 'sections',
			sections: 'all',
			sectionprop: "level|line"
		});

		request.done(function(data) {
			var page = new Page(data);
			d.resolve(page);
		});

		return d;
	}

	Page.prototype.toHtml = function() {
		var template = templates.getTemplate('content-template');
		return template.render(this);
	}

	function makeAPIRequest(params) {
		// Force JSON
		params.format = 'json';
		// FIXME: Decouple page.js from app.baseURL
		return $.get(app.baseURL + '/w/api.php', params);
	}
})();
