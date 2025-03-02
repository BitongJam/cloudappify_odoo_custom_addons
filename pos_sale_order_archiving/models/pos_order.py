from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
from datetime import datetime
import calendar

class PosOrder(models.Model):
    _inherit = 'pos.order'

    active = fields.Boolean(default=True)
    official_receipt = fields.Char()


    def _check_if_last_day_of_month(self):
        pass

    def _create_archiving_log(self,log,ids):
        if log:
            self.env['ir.logging'].create({
            'name': 'PoS Order Archive',
            'type': 'server',
            'dbname': self.env.cr.dbname,
            'level': 'info',
            'path':'pos_sale_order_archiving/models/pos_order.py',
            'func':'_create_archiving_log',
            'line': '',
            'message': "Pos Order Archive ids %s"%ids,
        })
    
    def action_unarchive(self):
        for rec in self:
            payments = rec.env['pos.payment'].search([('pos_order_id','=',rec.id),('active','=',False)])
            for p in payments:
                    p.write({'active':True})
        return super(PosOrder,self).action_unarchive()


    def action_archive(self):
        if self.official_receipt:
            raise ValidationError('You cannot archive an order with OR unless it is a cancelled transaction.')
        return super(PosOrder,self).action_archive()
    
    def _auto_archive_order(self):
        # min_target = 3000
        # max_target = 35000

        param_env = self.env['ir.config_parameter'].sudo()
        max_target = float(param_env.get_param('pos_order_limit.max_amount'))
        min_target = float(param_env.get_param('pos_order_limit.min_amount'))

        if max_target == 0:
            raise ValidationError("Max Amount for Pos Sale Auto Archive must greater than 0.")
        
        if min_target == 0:
            raise ValidationError("Min Amount for Pos Sale Auto Archive must greater than 0.")
        

        # Get current month and year
        current_month = datetime.now().month
        current_year = datetime.now().year


        get_order_ids = self.get_orders_to_archive(min_target,max_target,current_month,current_year)

        if not get_order_ids:
            raise ValidationError('There is no orders')
    
        orders_to_archive = self.env['pos.order'].browse(get_order_ids)
        for order in orders_to_archive:
            order.action_archive()
            for p in order.payment_ids:
                p.action_archive()
        if orders_to_archive:
            log=True
            self._create_archiving_log(log,get_order_ids)
        

    def get_orders_to_archive(self,min_target,max_target,month,year):

        # get the first date and last date of the month and year
        first_date = datetime(year,month,1)
        last_date = datetime(year,month,calendar.monthrange(year, month)[1])

        PosOrder = self.env['pos.order']
        
        # Get the total sum of active, posted, and paid orders
        domain = [
            ('active', '=', True),
            ('state', 'in', ('done', 'paid')),('date_order','>=',first_date),('date_order','<=',last_date),('official_receipt','=',False)
        ]

        total = sum(PosOrder.search(domain).mapped('amount_total'))


        batch_size = 10
        offset = 0
        order_ids = []


        # Archive orders until total is within the target range
        while total > max_target:
            # Fetch a batch of orders, oldest first
            orders = PosOrder.search(
                domain,
                order="id ASC",
                limit=batch_size,
                offset=offset
            )

            if not orders:
                break  # No more orders to process

            for order in orders:
                if total <= min_target:
                    break  # Stop if within range after deduction

                total -= order.amount_total
                order_ids.append(order.id)

            offset += batch_size  # Move to the next batch

        return order_ids


