from odoo import _,http,tools
from odoo.http import request

class WebClientController(http.Controller):

    @http.route('/webclient/company/name', type='json', auth='user')
    def _get_company_name(self):
        # Get the company name from the current user's company
        company_name = request.env.user.company_id.name
        return company_name or "Company Name Not Found"