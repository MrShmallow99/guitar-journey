"""Local server for the presentation (used by launch.bat and `npm start`).

- Serves the source project (index.html) on 127.0.0.1 only.
- Reuses an instance that is already serving this folder instead of
  starting a duplicate; skips ports used by other programs.
- Forces correct MIME types: some Windows registries map .js to text/plain,
  which makes browsers refuse ES modules.
- Opens the default browser; stop with Ctrl+C or by closing the window.

Usage: python scripts/serve.py [--port 8000] [--no-browser]
"""

from __future__ import annotations

import argparse
import errno
import http.server
import socket
import sys
import threading
import urllib.parse
import urllib.request
import webbrowser
from functools import partial
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARKER = "X-Guitar-Journey-Root"
PORT_RANGE = 10


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".woff2": "font/woff2",
        ".svg": "image/svg+xml",
        ".html": "text/html; charset=utf-8",
    }

    def end_headers(self):
        # lets a second launch recognise this server; no caching while editing
        self.send_header(MARKER, urllib.parse.quote(str(ROOT)))
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        if args and str(args[1]).startswith(("4", "5")):  # only report errors
            sys.stderr.write(f"  {self.address_string()} {fmt % args}\n")


def existing_instance(port: int) -> bool:
    """True if this port already serves this presentation folder."""
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=0.6) as res:
            return urllib.parse.unquote(res.headers.get(MARKER, "")) == str(ROOT)
    except Exception:
        return False


class Server(http.server.ThreadingHTTPServer):
    # The stdlib default (SO_REUSEADDR) lets Windows bind a port another program
    # is already listening on, so two servers would silently share it. Ask for
    # exclusive use instead, so a busy port fails and we move to the next one.
    allow_reuse_address = sys.platform != "win32"

    def server_bind(self):
        if hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def bind(port: int) -> Server | None:
    try:
        return Server(("127.0.0.1", port), partial(Handler, directory=str(ROOT)))
    except OSError as e:
        if e.errno in (errno.EADDRINUSE, getattr(errno, "WSAEADDRINUSE", -1), 10013) or isinstance(e, PermissionError):
            return None  # busy or reserved: try the next port
        raise


def main(argv=None) -> int:
    # show messages immediately even when output is redirected, and never crash
    # on a console code page that cannot encode the (possibly Hebrew) folder path
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(line_buffering=True, errors="replace")
    parser = argparse.ArgumentParser(description="Serve the presentation locally.")
    parser.add_argument("--port", type=int, default=8000, help="first port to try (default 8000)")
    parser.add_argument("--no-browser", action="store_true", help="do not open a browser")
    args = parser.parse_args(argv)

    if not (ROOT / "index.html").exists():
        print(f"ERROR: index.html not found in {ROOT}")
        return 1

    for port in range(args.port, args.port + PORT_RANGE):
        url = f"http://127.0.0.1:{port}/"
        if existing_instance(port):
            print(f"The presentation is already running at {url} (reusing it; no second server started).")
            if not args.no_browser:
                webbrowser.open(url)
            return 0
        server = bind(port)
        if server is None:
            print(f"Port {port} is in use by another program, trying {port + 1}...")
            continue
        break
    else:
        print(f"ERROR: ports {args.port}-{args.port + PORT_RANGE - 1} are all in use.")
        print("Close the program using them, or run: python scripts/serve.py --port 9000")
        return 1

    print("Guitar Journey: local presentation server")
    print(f"  Folder : {ROOT}")
    print(f"  Address: {url}")
    print("  Stop   : press Ctrl+C, or close this window.\n")
    if not args.no_browser:
        threading.Timer(0.4, webbrowser.open, args=(url,)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping the server...")
    finally:
        server.server_close()
    print("Server stopped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
