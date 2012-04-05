(function() {
	window.Page = function(title, sections) { 
        var lastCollapsibleSection = {subSections: []};
        this.sections = [];
        var that = this;
        $.each(sections, function(index, section) {
            console.log(section);
            if(section.id === 0) {
                // Lead Section
                // We should also make sure that if there is a lead followed by
                // h3, h4, etc they all fold into the lead
                // Not sure why a page would do this though
                section.subSections = [];
                that.lead = section;
                lastCollapsibleSection = section;
                return;
            } 
            // Only consider leve 2 sections as 'sections'
            // Group *all* subsections under them, no matter which level they are at
            if(section.level == 2) {
                section.subSections = [];
                lastCollapsibleSection = section;
                that.sections.push(section);
            } else {
                lastCollapsibleSection.subSections.push(section);
            }

        });
		this.title = title;
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
			var page = new Page(title, data.mobileview.sections);
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
