import cgi
import urlparse
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer


# Handler for receiving POST-requests and saving them to disk
# NOT fail-safe at all!
class MyHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        ctype, pdict = cgi.parse_header(self.headers.getheader('content-type'))

        length = int(self.headers.getheader('content-length'))
        postvars = urlparse.parse_qs(self.rfile.read(length), keep_blank_values=1)

        self.send_response(301)
        self.end_headers()

        name = postvars['name'][0]
        shot = postvars['shot'][0]

        print "Name: ", name
        print "Shot: ", shot

        fh = open("../examples/screenshots/" + name + ".png", "wb")
        fh.write(shot[22:].decode('base64'))
        fh.close()

        # ugly hack to close window afterwards...
        self.wfile.write("<html><body><script>window.open('', '_self', ''); window.close(); </script></body></html>");


if __name__ == '__main__':
    try:
        server = HTTPServer(('', 8765), MyHandler)
        print 'Started screenshot server on port 8765...'
        server.serve_forever()
    except KeyboardInterrupt:
        print '^C received, shutting down server'
        server.socket.close()
