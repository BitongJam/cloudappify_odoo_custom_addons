from odoo import http
from odoo.http import request

class PWAController(http.Controller):
    @http.route('/setup_pwa/sw.js', type='http', auth='public', csrf=False)
    def service_worker(self):
        sw_path = '/setup_pwa/static/src/js/sw.js'
        try:
            content = request.env['ir.http'].binary_content(sw_path)
        except Exception:
            content = ''
        return request.make_response(
            content,
            [('Content-Type', 'application/javascript')]
        )
