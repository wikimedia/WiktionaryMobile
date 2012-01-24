#! /bin/sh

echo "Wikipedia Mobile is a collaborative project released under the 
GNU General Public License v2. We would like to recognize the 
following names for their contribution to the product. 

== Developers == " > CREDITS

git log | grep ^Author: | sed 's/ <.*//; s/^Author: //' | sort | uniq | sort -df 1>> CREDITS

echo "

== Included external works ==
Wikipedia Mobile builds upon many Open Source works including:
* PhoneGap, Apache License 2.0, http://phonegap.com
* ShareKit, MIT License, https://github.com/shareKit/ShareKit
** ShareKit includes pre-compiled work from:
*** Jon Crosby (OAuthConsumer http://code.google.com/p/oauthconsumer/) MIT License
*** Facebook (FBConnect https://github.com/ShareKit/facebook-ios-sdk) Apache License v2
*** John Engelhart (JSONKit https://github.com/johnezang/JSONKit) BSD License or Apache License v2
*** Lukhnos D. Liu (Objective Flickr https://github.com/lukhnos/objectiveflickr) MIT License
*** Sam Soffes (SSKeychain https://github.com/samsoffes/sskeychain) MIT License
" >> CREDITS
