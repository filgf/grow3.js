# From: https://github.com/sole/tween.js/blob/master/utils/builder.py
import os

source = '../src/grow3.js ../src/grow3.Runner.js'
output = '../build/grow3.min.js'

os.system( 'java -jar compiler/compiler.jar --language_in=ECMASCRIPT5_STRICT --js ' + source + ' --js_output_file ' + output )

# header

with open(output,'r') as f: text = f.read()
with open(output,'w') as f: f.write('// grow3.js\n' + text)