"""Local dev server that disables browser caching.

The plain `python3 -m http.server` lets browsers reuse stale JS/CSS modules
after edits, which silently runs old code against new HTML.
"""
import http.server
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    print(f'Serving on http://localhost:{PORT}')
    http.server.ThreadingHTTPServer(('', PORT), NoCacheHandler).serve_forever()
