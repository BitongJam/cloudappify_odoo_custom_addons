from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
import calendar
from odoo.exceptions import ValidationError
from dateutil.relativedelta import relativedelta
from datetime import datetime


class WizardBatchPosOrderArchive(models.TransientModel):
    _name = 'wizard.batch.pos.order.archive'
    _description = 'Wizard Batch Pos Order Archive'

    from_date = fields.Date(string='From')
    to_date = fields.Date(string='To')
    
    def action_pos_order_archive(self):
        """Triggers archiving per month based on date range."""
        from_date = self.from_date
        to_date = self.to_date
        
        param_env = self.env['ir.config_parameter'].sudo()

        # Fetch min/max archive limits from config
        max_target = float(param_env.get_param('pos_order_limit.max_amount'))
        min_target = float(param_env.get_param('pos_order_limit.min_amount'))

        self.env['pos.order'].get_orders_to_archive(min_target,max_target,from_date.month,from_date.year)
        # # Start from the first day of the month
        # current_date = from_date.replace(day=1)

        # orders_to_archive = []  # Collect all orders across months

        # while current_date <= to_date:
        #     # Get the first and last day of the current month
        #     first_date = current_date
        #     last_day = calendar.monthrange(current_date.year, current_date.month)[1]
        #     last_date = datetime(current_date.year, current_date.month, last_day).date()

        #     # If last_date exceeds to_date, set it to to_date
        #     if last_date > to_date:
        #         last_date = to_date

        #     # Call the function for this specific month
        #     month_orders = self.env['pos.order'].get_orders_to_archive(
        #         min_target, max_target, current_date.month, current_date.year
        #     )

        #     if month_orders:
        #         orders_to_archive.extend(month_orders)

        #     print(f"📅 Processing {current_date.strftime('%Y-%m')} ({first_date} to {last_date}) → Orders: {month_orders}")

        #     # Move to the next month
        #     current_date = current_date + relativedelta(months=1)

        # if not orders_to_archive:
        #     raise ValidationError('There are no orders to archive.')

        # # Archive orders
        # orders = self.env['pos.order'].browse(orders_to_archive)
        # for order in orders:
        #     order.action_archive()
        #     for p in order.payment_ids:
        #         p.action_archive()

        # # if orders_to_archive:
        # #     self._create_archiving_log(True, orders_to_archive)

        # return True
