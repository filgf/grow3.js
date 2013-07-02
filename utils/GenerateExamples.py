import os
import sys
import time
import subprocess
from subprocess import call
from xml.dom import minidom

from jinja2 import Environment, FileSystemLoader

RENDER_SCREENSHOTS = True

#Jinja2 Helpers
jinja2_env = Environment(loader=FileSystemLoader('templates/'))

def template(name, ctx):
    t = jinja2_env.get_template(name)
    return t.render(**ctx)

def render(templ, args, out):
        rendered = template(templ, args)
        ofile = open(out, "w")
        ofile.write(rendered)
        ofile.close()

# Helper to locally open page in chrome/ium
def openChrome(url):
    if sys.platform.startswith('darwin'):
        call(["open", "/Applications/Google Chrome.app", url])

    elif sys.platform.startswith('linux2'):
        call(["chromium-browser", url])

    else:
        # TODO: win32
        print "Chrome open not implemented!"
        sys.exit(1)


exampleList = [];
# Generate HTML-Files for examples
examplesDir = "../examples/js/"

for file in os.listdir(examplesDir):
    if file.endswith(".js"):
        jsContent = open(examplesDir + file).read()


        nameBase = os.path.splitext(file)[0]
        exampleList.append(nameBase)
        print "Generate " + nameBase + ".html..."
        render('example_template.html', { 'example' : nameBase, 'file' : file }, '../examples/js/' + nameBase + '.html')
        render('example_inline_template.html', { 'example' : nameBase, 'jsContent' : jsContent }, '../examples/html/' + nameBase + '.html')


# SCREENSHOTS
WIDTH = 600
HEIGHT = int(WIDTH / 1.618)

# Generate Gallery
print "Generate gallery..."
render ('gallery_template.html', { 'entries' : exampleList, 'width' : WIDTH, 'height' : HEIGHT }, '../examples/index.html')


# Generate Screenshots (using generate HTML-Files opened in chrome and a minimal server receiving POST-messages)
if (RENDER_SCREENSHOTS):

    #server process should terminate with end of script
    serverproc = subprocess.Popen([sys.executable, "GenerateExamplesServer.py"])

    # On OS X antialiasing currently is disabled in WebGL
    # -> fake antialias by rendering to 4* Canvas and bicubic resampling
    aaFactor = 1;
    if sys.platform.startswith('darwin'):
        aaFactor = 4;

    for file in os.listdir(examplesDir):
        if file.endswith(".js"):
            nameBase = os.path.splitext(file)[0]
            print "Screenshot " + nameBase + ".html..."
            filename = 'screenshot'+ nameBase + '.html'
            render('screenshot_template.html', { 'example' : nameBase, 'file' : file, 'width' : WIDTH, 'height' : HEIGHT, 'aaFactor' : aaFactor }, filename)

            print "Open in browser " + filename
            openChrome(filename)
            time.sleep(5)



