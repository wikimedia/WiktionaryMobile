/*
 * Core MediaWiki JavaScript Library
 * Stripped down to just Map, Message, log, message, msg
 */

$.makeArray = function(args) {
  return Array.prototype.slice.call(args, 0);
}

// Attach to window and globally alias
window.mw = window.mediaWiki = new ( function( $ ) {

	/* Private Members */

	/**
	 * @var object List of messages that have been requested to be loaded.
	 */
	var messageQueue = {};

	/* Object constructors */

	/**
	 * Map
	 *
	 * Creates an object that can be read from or written to from prototype functions
	 * that allow both single and multiple variables at once.
	 *
	 * @param global boolean Whether to store the values in the global window
	 *  object or a exclusively in the object property 'values'.
	 * @return Map
	 */
	function Map( global ) {
		this.values = ( global === true ) ? window : {};
		return this;
	}

	Map.prototype = {
		/**
		 * Get the value of one or multiple a keys.
		 *
		 * If called with no arguments, all values will be returned.
		 *
		 * @param selection mixed String key or array of keys to get values for.
		 * @param fallback mixed Value to use in case key(s) do not exist (optional).
		 * @return mixed If selection was a string returns the value or null,
		 *  If selection was an array, returns an object of key/values (value is null if not found),
		 *  If selection was not passed or invalid, will return the 'values' object member (be careful as
		 *  objects are always passed by reference in JavaScript!).
		 * @return Values as a string or object, null if invalid/inexistant.
		 */
		get: function( selection, fallback ) {
			if ( $.isArray( selection ) ) {
				selection = $.makeArray( selection );
				var results = {};
				for ( var i = 0; i < selection.length; i++ ) {
					results[selection[i]] = this.get( selection[i], fallback );
				}
				return results;
			} else if ( typeof selection === 'string' ) {
				if ( this.values[selection] === undefined ) {
					if ( fallback !== undefined ) {
						return fallback;
					}
					return null;
				}
				return this.values[selection];
			}
			if ( selection === undefined ) {
				return this.values;
			} else {
				return null; // invalid selection key
			}
		},

		/**
		 * Sets one or multiple key/value pairs.
		 *
		 * @param selection mixed String key or array of keys to set values for.
		 * @param value mixed Value to set (optional, only in use when key is a string)
		 * @return bool This returns true on success, false on failure.
		 */
		set: function( selection, value ) {
      // XXX 10/14/2011 MODIFIED to fit zepto
			if ( $.isObject( selection ) ) {
				for ( var s in selection ) {
					this.values[s] = selection[s];
				}
				return true;
			} else if ( typeof selection === 'string' && value !== undefined ) {
				this.values[selection] = value;
				return true;
			}
			return false;
		},

		/**
		 * Checks if one or multiple keys exist.
		 *
		 * @param selection mixed String key or array of keys to check
		 * @return boolean Existence of key(s)
		 */
		exists: function( selection ) {
			if ( typeof selection === 'object' ) {
				for ( var s = 0; s < selection.length; s++ ) {
					if ( !( selection[s] in this.values ) ) {
						return false;
					}
				}
				return true;
			} else {
				return selection in this.values;
			}
		}
	};

	/**
	 * Message
	 *
	 * Object constructor for messages,
	 * similar to the Message class in MediaWiki PHP.
	 *
	 * @param map Map Instance of mw.Map
	 * @param key String
	 * @param parameters Array
	 * @return Message
	 */
	function Message( map, key, parameters ) {
		this.format = 'plain';
		this.map = map;
		this.key = key;
		this.parameters = parameters === undefined ? [] : $.makeArray( parameters );
		return this;
	}

	Message.prototype = {
		/**
		 * Appends (does not replace) parameters for replacement to the .parameters property.
		 *
		 * @param parameters Array
		 * @return Message
		 */
		params: function( parameters ) {
			for ( var i = 0; i < parameters.length; i++ ) {
				this.parameters.push( parameters[i] );
			}
			return this;
		},

		/**
		 * Converts message object to it's string form based on the state of format.
		 *
		 * @return string Message as a string in the current form or <key> if key does not exist.
		 */
		toString: function() {

			if ( !this.map.exists( this.key ) ) {
				// Use <key> as text if key does not exist
				if ( this.format !== 'plain' ) {
					// format 'escape' and 'parse' need to have the brackets and key html escaped
					return mw.html.escape( '<' + this.key + '>' );
				}
				return '<' + this.key + '>';
			}
			var	text = this.map.get( this.key ),
				parameters = this.parameters;

			text = text.replace( /\$(\d+)/g, function( string, match ) {
				var index = parseInt( match, 10 ) - 1;
				return index in parameters ? parameters[index] : '$' + match;
			} );

			if ( this.format === 'plain' ) {
				return text;
			}
			if ( this.format === 'escaped' ) {
				// According to Message.php this needs {{-transformation, which is
				// still todo
				return mw.html.escape( text );
			}

			/* This should be fixed up when we have a parser
			if ( this.format === 'parse' && 'language' in mw ) {
				text = mw.language.parse( text );
			}
			*/
			return text;
		},

		/**
		 * Changes format to parse and converts message to string
		 *
		 * @return {string} String form of parsed message
		 */
		parse: function() {
			this.format = 'parse';
			return this.toString();
		},

		/**
		 * Changes format to plain and converts message to string
		 *
		 * @return {string} String form of plain message
		 */
		plain: function() {
			this.format = 'plain';
			return this.toString();
		},

		/**
		 * Changes the format to html escaped and converts message to string
		 *
		 * @return {string} String form of html escaped message
		 */
		escaped: function() {
			this.format = 'escaped';
			return this.toString();
		},

		/**
		 * Checks if message exists
		 *
		 * @return {string} String form of parsed message
		 */
		exists: function() {
			return this.map.exists( this.key );
		}
	};

	/* Public Members */

	/*
	 * Dummy function which in debug mode can be replaced with a function that
	 * emulates console.log in console-less environments.
	 */
	this.log = function() { };

	/**
	 * @var constructor Make the Map constructor publicly available.
	 */
	this.Map = Map;

	/**
	 * List of configuration values
	 *
	 * Dummy placeholder. Initiated in startUp module as a new instance of mw.Map().
	 * If $wgLegacyJavaScriptGlobals is true, this Map will have its values
	 * in the global window object.
	 */
	this.config = null;

	/**
	 * @var object
	 *
	 * Empty object that plugins can be installed in.
	 */
	this.libs = {};

	/*
	 * Localization system
	 */
	this.messages = new this.Map();

	/* Public Methods */

	/**
	 * Gets a message object, similar to wfMessage()
	 *
	 * @param key string Key of message to get
	 * @param parameter_1 mixed First argument in a list of variadic arguments,
	 *  each a parameter for $N replacement in messages.
	 * @return Message
	 */
	this.message = function( key, parameter_1 /* [, parameter_2] */ ) {
		var parameters;
		// Support variadic arguments
		if ( parameter_1 !== undefined ) {
			parameters = $.makeArray( arguments );
			parameters.shift();
		} else {
			parameters = [];
		}
		return new Message( mw.messages, key, parameters );
	};

	/**
	 * Gets a message string, similar to wfMsg()
	 *
	 * @param key string Key of message to get
	 * @param parameters mixed First argument in a list of variadic arguments,
	 *  each a parameter for $N replacement in messages.
	 * @return String.
	 */
	this.msg = function( key, parameters ) {
		return mw.message.apply( mw.message, arguments ).toString();
	};

	/** HTML construction helper functions */
	this.html = new ( function () {
		var escapeCallback = function( s ) {
			switch ( s ) {
				case "'":
					return '&#039;';
				case '"':
					return '&quot;';
				case '<':
					return '&lt;';
				case '>':
					return '&gt;';
				case '&':
					return '&amp;';
			}
		};

		/**
		 * Escape a string for HTML. Converts special characters to HTML entities.
		 * @param s The string to escape
		 */
		this.escape = function( s ) {
			return s.replace( /['"<>&]/g, escapeCallback );
		};

		/**
		 * Wrapper object for raw HTML passed to mw.html.element().
		 */
		this.Raw = function( value ) {
			this.value = value;
		};

		/**
		 * Wrapper object for CDATA element contents passed to mw.html.element()
		 */
		this.Cdata = function( value ) {
			this.value = value;
		};

		/**
		 * Create an HTML element string, with safe escaping.
		 *
		 * @param name The tag name.
		 * @param attrs An object with members mapping element names to values
		 * @param contents The contents of the element. May be either:
		 *  - string: The string is escaped.
		 *  - null or undefined: The short closing form is used, e.g. <br/>.
		 *  - this.Raw: The value attribute is included without escaping.
		 *  - this.Cdata: The value attribute is included, and an exception is
		 *   thrown if it contains an illegal ETAGO delimiter.
		 *   See http://www.w3.org/TR/1999/REC-html401-19991224/appendix/notes.html#h-B.3.2
		 *
		 * Example:
		 *	var h = mw.html;
		 *	return h.element( 'div', {},
		 *		new h.Raw( h.element( 'img', {src: '<'} ) ) );
		 * Returns <div><img src="&lt;"/></div>
		 */
		this.element = function( name, attrs, contents ) {
			var v, s = '<' + name;
			for ( var attrName in attrs ) {
				v = attrs[attrName];
				// Convert name=true, to name=name
				if ( v === true ) {
					v = attrName;
				// Skip name=false
				} else if ( v === false ) {
					continue;
				}
				s += ' ' + attrName + '="' + this.escape( '' + v ) + '"';
			}
			if ( contents === undefined || contents === null ) {
				// Self close tag
				s += '/>';
				return s;
			}
			// Regular open tag
			s += '>';
			switch ( typeof contents ) {
				case 'string':
					// Escaped
					s += this.escape( contents );
					break;
				case 'number':
				case 'boolean':
					// Convert to string
					s += '' + contents;
					break;
				default:
					if ( contents instanceof this.Raw ) {
						// Raw HTML inclusion
						s += contents.value;
					} else if ( contents instanceof this.Cdata ) {
						// CDATA
						if ( /<\/[a-zA-z]/.test( contents.value ) ) {
							throw new Error( 'mw.html.element: Illegal end tag found in CDATA' );
						}
						s += contents.value;
					} else {
						throw new Error( 'mw.html.element: Invalid type of contents' );
					}
			}
			s += '</' + name + '>';
			return s;
		};
	} )();

} )( Zepto );
