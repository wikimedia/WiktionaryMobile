(function() {
	function parseSections(data, title) {
		var sections = data.mobileview.sections;
		sections[0].level = "1";
		sections[0].line = title;
		return sections; 
	}
	window.Page = function(data, title) { 
		this.sections = parseSections(data, title);
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
			var page = new Page(data, title);
			d.resolve(page);
		});

		return d;
	}

	Page.prototype.toHtml = function() {
		var contentTemplate = templates.getTemplate('content-template');
		return contentTemplate.render(this);
	}

	function makeAPIRequest(params) {
		// Force JSON
		params.format = 'json';
		// FIXME: Decouple page.js from app.baseURL
		return $.get(app.baseURL + '/w/api.php', params);
	}
})();
