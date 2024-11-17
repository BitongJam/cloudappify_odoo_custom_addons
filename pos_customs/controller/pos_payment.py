from odoo import http
from odoo.http import request


class POSPaymentController(http.Controller):
    @http.route('/pos_payment/get_data', type='json', auth='user')
    def get_payment_data(self):
        # Execute the SQL query
        query = """
            SELECT sum(pp.amount), ppm.id, ppm.name
            FROM pos_payment pp
            JOIN pos_payment_method ppm ON ppm.id = pp.payment_method_id
            GROUP BY ppm.id, ppm.name
        """
        request.env.cr.execute(query)
        results = request.env.cr.fetchall()

        # Transform results into a list of dictionaries
        data = [{'amount_sum': row[0], 'method_id': row[1], 'method_name': row[2]} for row in results]

        return data