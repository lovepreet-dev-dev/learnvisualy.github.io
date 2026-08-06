#!/usr/bin/env python3
"""Local preview server for the site.

    python3 serve.py            # http://localhost:4173
    python3 serve.py 8000       # pick another port

Serves the folder this file sits in and sends no-store, so a plain
reload always picks up your latest edit. Nothing to install — this uses
only the Python standard library.
"""
import http.server
import os
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # Without this the browser serves stale JS/CSS from cache and you
        # spend ten minutes debugging a file you already fixed.
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # quiet: only errors matter here


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Serving {ROOT}")
            print(f"  →  http://localhost:{PORT}")
            print("Press Ctrl+C to stop.")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    except OSError as error:
        print(f"Could not bind port {PORT}: {error}")
        print(f"Something else may be using it. Try: python3 serve.py {PORT + 1}")
        sys.exit(1)
