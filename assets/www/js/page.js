(function() {
	window.Page = function(title, lead, sections, lang) { 
		this.title = title;
		this.lead = lead;
		this.sections = sections;
		this.lang = lang;
	};

	Page.deserialize = function(data) {
		return new Page(data.title, data.lead, data.sections);
	}

	Page.fromRawJSON = function(title, rawJSON, lang) {
		var lead = {};
		var sections = [];
		var lastCollapsibleSection = {subSections: []};
		$.each(rawJSON.mobileview.sections, function(index, section) {
			if(section.id === 0) {
				// Lead Section
				// We should also make sure that if there is a lead followed by
				// h3, h4, etc they all fold into the lead
				// Not sure why a page would do this though
				section.subSections = [];
				lead = section;
				lastCollapsibleSection = section;
				return;
			} 
			// Only consider leve 2 sections as 'sections'
			// Group *all* subsections under them, no matter which level they are at
			if(section.level == 2) {
				section.subSections = [];
				lastCollapsibleSection = section;
				sections.push(section);
			} else {
				lastCollapsibleSection.subSections.push(section);
			}

		});
		return new Page(title, lead, sections, lang);
	}

	Page.requestFromTitle = function(title, lang) {
		var d = $.Deferred();

		var request = makeAPIRequest(lang, {
			action: 'mobileview',
			page: title,
			redirects: '1',
			prop: 'sections',
			sections: 'all',
			sectionprop: "level|line"
		});

		request.done(function(data) {
			var page = Page.fromRawJSON(title, data, lang);
			d.resolve(page);
		});

		return d;
	}

	Page.prototype.toHtml = function() {
		var contentTemplate = templates.getTemplate('content-template');
		return contentTemplate.render(this);
	}

	Page.prototype.serialize = function() {
		// Be more specific later on, but for now this does :)
		return JSON.stringify(this);
	}

	function makeAPIRequest(lang, params) {
		// Force JSON
		params.format = 'json';
		// FIXME: Decouple page.js from app.baseURL
		return $.get(app.baseUrlForLanguage(lang) + '/w/api.php', params);
	}
})();
