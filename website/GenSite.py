from distutils.dir_util import remove_tree, mkpath, copy_tree
from shutil import copytree, copy2, ignore_patterns
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

# (re)create out dir
remove_tree("out", verbose=1)
mkpath("out", verbose=1)

# copy static assets
copy_tree("assets", "out", verbose=1)

# copy grow3 and libs
copy2('../build/grow3.min.js', 'out/js')
copytree('../src/lib', 'out/js/lib', ignore=ignore_patterns('*.txt', 'dat.gui.js'))

# copy screenshots
copytree('../examples/screenshots', 'out/screenshots')

navbarEntries = [{"name": "About", "url": "index.html"},
                 {"name": "Gallery", "url": "gallery.html"},
                 {"name": "Learn", "url": "learn.html"},
                 {"name": "Source@Github", "url": "https://github.com/filgf/grow3.js"}]

# build home page
content = md_to_html('home.md')
render_template_to_out('home.html', 'index.html', {'content': content, 'nentries': navbarEntries, 'nactive': 0})


# build gallery pages
examplesDir = "../examples/js/"
gentries = []

for jsfile in os.listdir(examplesDir):
    if jsfile.endswith(".js"):
        nameBase = os.path.splitext(jsfile)[0]
        gentries.append(nameBase)

        jsContent = open(examplesDir + jsfile).read()
        render_template_to_out('gallery_entry.html', 'g_' + nameBase + '.html',
                               {'example': nameBase, 'jsContent': jsContent, 'title': nameBase})

print gentries

# build gallery overview
render_template_to_out('gallery.html', 'gallery.html',
                       {'gentries': gentries, 'nentries': navbarEntries, 'nactive': 1, 'title': 'Gallery'})


# build docs
content = md_to_html('learn.md')
outstr = render_template('learn.html',
                         {'content': content, 'nentries': navbarEntries, 'nactive': 2, 'title': 'Learn'})

outstr = outstr.replace('<pre>', '<pre class="prettyprint lang-js">')
write_html('learn.html', outstr)

ende = time.time()
print "Finished (" + str(ende - start) + "s)!"
