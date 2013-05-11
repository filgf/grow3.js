import urllib, sys

class MyURLopener(urllib.FancyURLopener):
    def http_error_default(self, url, fp, errcode, errmsg, headers):
        urllib.URLopener.http_error_default(self, url, fp, errcode, errmsg, headers)

def grabFile(baseurl, file, targetdir):
    print 'Download: ' + baseurl + file + ' to ' + targetdir
    try:
        MyURLopener().retrieve(baseurl + file, targetdir + file)
    except IOError as e:
        print 'Failed: ', e


libsDir = '../src/lib/'
#libsDir = 'test/'

threeBaseUrl = 'https://raw.github.com/mrdoob/three.js/master/'

grabFile(threeBaseUrl + 'build/', 'three.js', libsDir)
grabFile(threeBaseUrl + 'build/', 'three.min.js', libsDir)
grabFile(threeBaseUrl + 'examples/js/', 'Detector.js', libsDir)
grabFile(threeBaseUrl + 'examples/js/controls/', 'TrackballControls.js', libsDir)
grabFile(threeBaseUrl + 'examples/fonts/', 'helvetiker_regular.typeface.js', libsDir)

threeXBaseUrl = 'https://raw.github.com/jeromeetienne/threex/master/'
grabFile(threeXBaseUrl, 'THREEx.FullScreen.js', libsDir)
grabFile(threeXBaseUrl, 'THREEx.WindowResize.js', libsDir)

datGuiBaseUrl = 'https://dat-gui.googlecode.com/git/build/'
grabFile(datGuiBaseUrl, 'dat.gui.js', libsDir)
