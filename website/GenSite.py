from distutils.dir_util import remove_tree, mkpath, copy_tree
from shutil import copytree, copy2, rmtree, ignore_patterns
import markdown
from jinja2 import Environment, FileSystemLoader
import time
import codecs


jinja2_env = Environment(loader=FileSystemLoader('templates/'), cache_size=0)

def render_template_to_out(name, ctx):
    t = jinja2_env.get_template(name)
    outstr =  t.render(**ctx)
#    print outstr
    with open("out/"+name, "wb") as fh:
        fh.write(outstr)


def md_to_html(mdFile):
    input_file = codecs.open(mdFile, mode="r", encoding="utf-8")
    text = input_file.read()
    content = markdown.markdown(text)
    print content
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


#build home page
content = md_to_html('home.md')
render_template_to_out('home.html', { 'content' : content } )

# build front, docs
# build gallery
# build gallery-elements






ende = time.time()
print "Finished (" + str(ende-start) + "s)!"
