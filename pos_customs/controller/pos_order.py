from odoo import http
from odoo.http import request

class PosDashboardController(http.Controller):
    @http.route('/report/get_top_pos_sales_cashier', type='json', auth='user')
    def get_top_pos_sales_cashier(self):
        query = '''
            SELECT 
                SUM(rpo.price_total) AS amount, count(*) as order,
                rp.name AS name 
            FROM report_pos_order rpo
            JOIN res_users ru ON ru.id = rpo.user_id 
            JOIN res_partner rp ON rp.id = ru.partner_id
            WHERE rpo.state IN ('paid', 'done', 'invoiced')
            GROUP BY rp.name
            order by amount desc ;

        '''

        request.cr.execute(query)
        result = request.cr.fetchall()
        
        return result