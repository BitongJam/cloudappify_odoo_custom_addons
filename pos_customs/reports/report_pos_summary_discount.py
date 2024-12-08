from odoo import models, api
from collections import defaultdict

class PosIncomeReport(models.AbstractModel):
    _name = 'report.pos_customs.pos_discount_tips'
    _description = 'POS Summary Discount and tips Report'

    @api.model
    def _get_report_values(self, docids, data=None):
        # Retrieve the date range from the wizard
        date_from = data.get('date_from')
        date_to = data.get('date_to')
        session_id =  data.get('session_id')

        # Prepare the domain for the search query
        domain = []
        
        if date_from:
            domain.append(('date_order', '>=', date_from))
        if date_to:
            domain.append(('date_order', '<=', date_to))
        if session_id:
            domain.append(('session_id', '=', session_id))
        # Fetch POS orders based on the domain
        pos_orders = self.env['pos.order'].search(domain)

        # Prepare the data for the report
        order_data = []
        for order in pos_orders:
            # Calculate total discount, tips, or other data as needed
            total_discount = sum(line.discount_amount for line in order.lines)  # Assuming discount_amount is computed
            order_data.append({
                'order': order,
                'total_discount': order.total_discount,
                'amount_total': order.amount_total,
            })

        return {
            'doc_ids': docids,
            'doc_model': 'pos.summary.discount.tip.report.wizard',
            'date_from': date_from,
            'date_to': date_to,
            'report_data': order_data,
        }
