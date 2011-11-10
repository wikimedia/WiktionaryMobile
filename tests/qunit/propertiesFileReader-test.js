test('Is module obj defined?', function() {
	expect(1);
	ok(typeof propertiesFileReader === "object");
});

function parseEqual(message, input, expected) {
	deepEqual(propertiesFileReader.parse(input), expected, message);
}

test('Can parse very simple input?', function() {
	parseEqual(
		"Single line, no newline",
		"key=value",
		{
			key: "value"
		}
	);
	parseEqual(
		"Three simple lines, no final newline",
		"key=value\nkey2=value2\nkey3=value3",
		{
			key: "value",
			key2: "value2",
			key3: "value3"
		}
	);
});

test('Can ignore blank/empty lines?', function() {
	parseEqual(
		"Single line with newline",
		"key=value\n",
		{
			key: "value"
		}
	);
	parseEqual(
		"Three simple lines, some extra newlines",
		"\n\nkey=value\nkey2=value2\n\nkey3=value3\n",
		{
			key: "value",
			key2: "value2",
			key3: "value3"
		}
	);
	parseEqual(
		"Real lines around a blank empty line",
		"key=value\n\nkey2=value2",
		{
			key: "value",
			key2: "value2",
		}
	);
	parseEqual(
		"Real lines around a line of spaces",
		"key=value\n      \nkey2=value2",
		{
			key: "value",
			key2: "value2",
		}
	);
	parseEqual(
		"Real lines around a line of tabs",
		"key=value\n\t\t\t\nkey2=value2",
		{
			key: "value",
			key2: "value2",
		}
	);
	parseEqual(
		"Real lines around a line of form feeds",
		"key=value\n\f\f\f\nkey2=value2",
		{
			key: "value",
			key2: "value2",
		}
	);
});

test('Can ignore comment lines?', function() {
	parseEqual(
		"Three simple lines, one commented out with #",
		"#key=value\nkey2=value2\nkey3=value3",
		{
			key2: "value2",
			key3: "value3"
		}
	);
	parseEqual(
		"Three simple lines, one commented out with !",
		"key=value\n!key2=value2\nkey3=value3",
		{
			key: "value",
			key3: "value3"
		}
	);
	parseEqual(
		"Three simple lines, one commented out with # after spaces",
		"  #key=value\nkey2=value2\nkey3=value3",
		{
			key2: "value2",
			key3: "value3"
		}
	);
	parseEqual(
		"Three simple lines, one commented out with ! after spaces",
		"key=value\n  !key2=value2\nkey3=value3",
		{
			key: "value",
			key3: "value3"
		}
	);
});

test('Key format', function() {
	var keyEqual = function(message, input) {
		// All these tests end the same. :)
		parseEqual(message, input, { key: "value" });
	};
	keyEqual(
		"Simple key",
		"key=value"
	);
	keyEqual(
		"Simple key with preceding whitespace",
		"   key=value"
	);
	keyEqual(
		"Simple key with preceding whitespace (tab)",
		"\tkey=value"
	);
	keyEqual(
		"Simple key with following whitespace",
		"key   =value"
	);
	keyEqual(
		"Simple key with preceding and following whitespace",
		"  key   =value"
	);
	keyEqual(
		"Key with : as sep",
		"key:value"
	);
	keyEqual(
		"Key with space as sep",
		"key value"
	);
});

test('Whitespace examples from doc', function() {
	// http://download.oracle.com/javase/7/docs/api/java/util/Properties.html#load%28java.io.Reader%29
	var keyEqual = function(input) {
		// All these tests end the same. :)
		parseEqual(input, input, { Truth: "Beauty" });
	};
	keyEqual("Truth = Beauty");
	keyEqual(" Truth:Beauty");
	keyEqual("Truth                              :Beauty");
});

test('Line extension and whitespace example from doc', function() {
	// http://download.oracle.com/javase/7/docs/api/java/util/Properties.html#load%28java.io.Reader%29
	parseEqual(
		"Line extension & ignore initial whitespace on following lines",
			"fruits                                     apple, banana, pear, \\\n" +
			"                                           cantaloupe, watermelon, \\\n" +
			"                                           kiwi, mango",
		{
			fruits: "apple, banana, pear, cantaloupe, watermelon, kiwi, mango"
		}
	);
});

test('Empty value with no separator; doc example', function() {
	parseEqual(
		"Line with no value & no separator",
		"cheeses",
		{
			cheeses: ""
		}
	);
});

test('Escapes', function() {
	parseEqual(
		"\\n",
		"key=Foo\\nbar",
		{
			key: "Foo\nbar"
		}
	);
	parseEqual(
		"\\t",
		"key=Foo\\tbar",
		{
			key: "Foo\tbar"
		}
	);
	parseEqual(
		"\\\\",
		"key=Foo\\\\bar",
		{
			key: "Foo\\bar"
		}
	);
	parseEqual(
		"\\b (b, not backspace)",
		"key=Foo\\bbar",
		{
			key: "Foobbar"
		}
	);
	parseEqual(
		"\\z (z, not ctrl+z)",
		"key=Foo\\zbar",
		{
			key: "Foozbar"
		}
	);
	parseEqual(
		"\\n (multiple)",
		"key=Foo\\nbar\\nbaz\\nbing",
		{
			key: "Foo\nbar\nbaz\nbing"
		}
	);
});

test('Small sample file', function() {
	parseEqual('Small sample file',
		"# English-language messages for Wikipedia Mobile app\n" +
			"sitename = Wikipedia\n" +
			"spinner-loading = Loading\n" +
			"spinner-retrieving = Retrieving content from $1\n" +
			"bookmarks-max-warning = You've reached the maximum number of bookmarks.\n" +
			"bookmark-added = $1 added to bookmarks.\n" +
			"bookmark-exists $1 already exists in bookmarks.\n" +
			"bookmark-remove-prompt = Remove $1 from bookmarks?\n" +
			"bookmark-removed = $1 has been removed.\n",
		{
			'sitename': 'Wikipedia',
			'spinner-loading': 'Loading',
			'spinner-retrieving': 'Retrieving content from $1',
			'bookmarks-max-warning': "You've reached the maximum number of bookmarks.",
			'bookmark-added': "$1 added to bookmarks.",
			'bookmark-exists': "$1 already exists in bookmarks.",
			'bookmark-remove-prompt': "Remove $1 from bookmarks?",
			'bookmark-removed': "$1 has been removed."
		}
	);
});


