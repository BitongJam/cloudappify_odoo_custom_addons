from odoo import models, api
from collections import defaultdict

class PosIncomeReport(models.AbstractModel):
    _name = 'report.pos_customs.pos_income_report_template'
    _description = 'POS Income Report'

    @api.model
    def _get_report_values(self, docids, data=None):
        # Retrieve the date range from the wizard
        date_from = data.get('date_from')
        date_to = data.get('date_to')

        # Fetch POS payments based on the date range
        pos_payments = self.env['pos.payment'].search([
            ('pos_order_id.date_order', '>=', date_from),
            ('pos_order_id.date_order', '<=', date_to),
        ])

        # Group income by payment method
        income_by_method = defaultdict(float)
        for payment in pos_payments:
            income_by_method[payment.payment_method_id.name] += payment.amount

        # Prepare the data to pass to the template
        grouped_income = [{'payment_method': method, 'income': income} for method, income in income_by_method.items()]

        return {
            'doc_ids': docids,
            'doc_model': 'pos.income.report.wizard',
            'date_from': date_from,
            'date_to': date_to,
            'grouped_income': grouped_income,
        }
