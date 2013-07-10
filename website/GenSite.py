from distutils.dir_util import remove_tree, mkpath, copy_tree
from shutil import copytree, copy2, rmtree, ignore_patterns
import markdown
from jinja2 import Environment, FileSystemLoader
import time
import codecs
import os


jinja2_env = Environment(loader=FileSystemLoader('templates/'), cache_size=0)


def render_template(tname, ctx):
    t = jinja2_env.get_template(tname)
    outstr = t.render(**ctx)
    return outstr


def write_html(oname, outstr):
    with open("out/" + oname, "wb") as fh:
        fh.write(outstr)


def render_template_to_out(tname, oname, ctx):
    outstr = render_template(tname, ctx)
#    print outstr
    write_html(oname, outstr)


def md_to_html(mdFile):
    input_file = codecs.open(mdFile, mode="r", encoding="utf-8")
    text = input_file.read()
    content = markdown.markdown(text, extensions=['extra'])
#    print content
    return content



start = time.time()

# create out dir
remove_tree("out", verbose=1)
mkpath("out", verbose=1)

# copy static assets
copy_tree("assets", "out", verbose=1)

# copy grow3 and libs
copy2('../build/grow3.min.js', 'out/js')
copytree('../src/lib', 'out/js/lib', ignore=ignore_patterns('*.txt', 'dat.gui.js'))

# copy screenshots
copytree('../examples/screenshots', 'out/screenshots')

navbarEntries = [{ "name" : "About",            "url" : "home.html"},
                 { "name" : "Gallery",          "url" : "gallery.html"},
                 { "name" : "Learn",            "url" : "learn.html"},
                 { "name" : "Source@Github",    "url" : "https://github.com/filgf/grow3.js"}]

def generate_navbar(index):
    s = ""
    i = 0
    for entry in navbarEntries:
        s = s + '<li'
        if i == index:
            s = s + ' class="active"'
        s = s + '><a href="' + entry['url'] + '">' + entry['name'] + '</a></li>'
        i += 1
    return s



# build home page
content = md_to_html('home.md')
navbar = generate_navbar(0)
render_template_to_out('home.html', 'home.html', { 'content' : content, 'navbar' : navbar } )


# build gallery page

examplesDir = "../examples/js/"
gentries = []

for file in os.listdir(examplesDir):
    if file.endswith(".js"):
        nameBase = os.path.splitext(file)[0]
        gentries.append(nameBase)

        jsContent = open(examplesDir + file).read()
        render_template_to_out('gallery_entry.html', 'g_' + nameBase + '.html', { 'example' : nameBase, 'jsContent' : jsContent })



print gentries

navbar = generate_navbar(1)
render_template_to_out('gallery.html', 'gallery.html', { 'gentries' : gentries, 'navbar' : navbar } )





# build docs
content = md_to_html('learn.md')
navbar = generate_navbar(2)
outstr = render_template('learn.html', { 'content' : content, 'navbar' : navbar } )
outstr = outstr.replace('<pre>', '<pre class="prettyprint lang-js">')
write_html('learn.html', outstr)



# build gallery
# build gallery-elements






ende = time.time()
print "Finished (" + str(ende-start) + "s)!"
