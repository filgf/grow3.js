from jinja2 import Environment, FileSystemLoader
import os, sys
from subprocess import call
from bottle import *

jinja2_env = Environment(loader=FileSystemLoader('templates/'))

def template(name, ctx):
    t = jinja2_env.get_template(name)
    return t.render(**ctx)

def render(templ, args, out):
        rendered = template(templ, args)
        ofile = open(out, "w")
        ofile.write(rendered)
        ofile.close()

def openChrome(url):
    if sys.platform.startswith('darwin'):
        call(["open", "/Applications/Google Chrome.app", "screenshot.html"])
    else:
        # TODO: win32/linux
        print "Chrome open not implemented!"
        sys.exit(1)


for file in os.listdir("../examples/js"):
    if file.endswith(".js"):
        nameBase = os.path.splitext(file)[0]
        print "Generate " + nameBase + ".html..."
        render('example_template.html', { 'example' : nameBase, 'file' : file }, '../examples/html/' + nameBase + '.html')




# SCREENSHOTS
WIDTH = 200
HEIGHT = 200

for file in os.listdir("../examples/js"):
    if file.endswith(".js"):
        nameBase = os.path.splitext(file)[0]
        print "Screenshot " + nameBase + ".html..."
        render('screenshot_template.html', { 'example' : nameBase, 'file' : file, 'width' : WIDTH, 'height' : HEIGHT }, 'screenshot.html')

        openChrome("screenshot.html")
#        call(["open", "/Applications/Google Chrome.app", "screenshot.html"])
        break   #TODO: remove
