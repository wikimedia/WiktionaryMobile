## PhoneGap Toast Plugin

### Usage:

Add the phonegap-toast.jar to your project in Eclipse. Right click on libs and select Build Path > Configure Build Path. Choose Java Build Path and select the Libraries tab. Click add Jars and select phonegap-toast.jar. If you are building an Android project from the command line jar files found in libs are automatically compiled in.

Add the PhoneGap Toast Plugin JS file along side your other assets and import.
<pre>
	&lt;script type="text/javascript" charset="utf-8" src="phonegap-toast.js"&gt;&lt;/script&gt;
</pre>

Then you can use the plugin like so:
<pre>
	window.plugins.ToastPlugin.show_long('Epic!');
</pre>

or

<pre>
	window.plugins.ToastPlugin.show_short('Epic!');
</pre>

The long vs short correspond to the Android options: (http://developer.android.com/reference/android/widget/Toast.html#LENGTH_LONG)
(http://developer.android.com/reference/android/widget/Toast.html#LENGTH_SHORT)

## Licence ##

The MIT License

Copyright (c) 2011 Kevin Griffin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.