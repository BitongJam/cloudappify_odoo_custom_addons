from odoo import models, api,fields
from collections import defaultdict
from datetime import datetime, time
import pytz


class PosIncomeReport(models.AbstractModel):
    _name = 'report.pos_customs.pos_income_report_template'
    _description = 'POS Income Report'

    @api.model
    def _get_report_values(self, docids, data=None):
        # Retrieve the date range from the wizard
        date_from = data.get('date_from')
        date_to = data.get('date_to')

        user_tz = pytz.timezone(self.env.context.get('tz') or self.env.user.tz or 'UTC')

        # convert date_from → start of day in user tz → UTC
        date_from_dt = user_tz.localize(
            fields.Datetime.from_string(date_from + " 00:00:00")
        ).astimezone(pytz.UTC).replace(tzinfo=None)

        # convert date_to → end of day in user tz → UTC
        date_to_dt = user_tz.localize(
            fields.Datetime.from_string(date_to + " 23:59:59")
        ).astimezone(pytz.UTC).replace(tzinfo=None)

        orders = self.env['pos.order'].search([
            ('date_order', '>=', fields.Datetime.to_string(date_from_dt)),
            ('date_order', '<=', fields.Datetime.to_string(date_to_dt)),
            ('state', 'in', ['paid', 'invoiced', 'done'])
        ])
        # Fetch POS payments based on the date range
        pos_payments = self.env['pos.payment'].search([('pos_order_id','in',orders.ids)])

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
