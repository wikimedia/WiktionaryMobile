from urllib2 import urlopen, HTTPError
try:
    import json
except:
    import simplejson as json

SITEMATRIX_URL = "http://en.wikipedia.org/w/api.php?action=sitematrix&format=json"

sitematrix = json.loads(urlopen(SITEMATRIX_URL).read())

wikis = {}

for k in sitematrix['sitematrix']:
    # exclude the 'count' key
    if k.isdigit():
        lang = sitematrix['sitematrix'][k]
        for site in lang['site']:
            if site['code'] == 'wiki' and 'closed' not in site:
                curWiki = {
                        'name': lang['name'],
                        'localName': lang['localname'],
                        }
                wikis[lang['code']] = curWiki

print "Obtained wiki list"

mainPageCounter = 0
for lang in wikis:
    wiki = wikis[lang]
    url = 'http://' + lang + '.wikipedia.org/wiki/MediaWiki:Mainpage?action=raw'
    # 404 returned if MediaWiki:Mainpage is not overriden
    # At which point we ask specifically for the message
    try:
        wiki['mainPage'] = urlopen(url).read()
    except HTTPError, err:
        if err.code == 404:
            url = url + "&usemsgcache=true"
            wiki['mainPage'] = urlopen(url).read()
        else:
            raise
    mainPageCounter += 1
    print "Obtained Main Page for " + lang + " (" + str(mainPageCounter) + "/" + str(len(wikis)) + ")"

open("wikis.json", "w").write(json.dumps(wikis))
