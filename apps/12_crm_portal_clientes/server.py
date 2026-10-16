import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SAPFioriHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers for OpenUI5 development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        super().end_headers()

    def guess_type(self, path):
        if path.endswith('.properties'):
            return 'text/plain; charset=utf-8'
        if path.endswith('.json'):
            return 'application/json; charset=utf-8'
        if path.endswith('.xml'):
            return 'application/xml; charset=utf-8'
        return super().guess_type(path)

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), SAPFioriHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("==================================================================")
        print("  SAP Fiori Customer Portal (SAP C4C & SAP S/4HANA)")
        print(f"  Servidor iniciado en: {url}")
        print("  Presiona CTRL+C para detener el servidor.")
        print("==================================================================")
        
        # Optionally auto-open browser
        try:
            webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")
            httpd.server_close()

if __name__ == "__main__":
    run()
