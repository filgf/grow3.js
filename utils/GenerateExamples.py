from jinja2 import Environment, FileSystemLoader
import os

jinja2_env = Environment(loader=FileSystemLoader('templates/'))

def template(name, ctx):
    t = jinja2_env.get_template(name)
    return t.render(**ctx)

for file in os.listdir("../examples/js"):
    if file.endswith(".js"):
        nameBase = os.path.splitext(file)[0]
        print "Generate " + nameBase + ".html..."
        rendered = template('example_template.html', { 'example' : nameBase, 'file' : file })
        ofile = open("../examples/html/" + nameBase + ".html", "w")
        ofile.write(rendered)
        ofile.close()