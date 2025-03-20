from odoo import _, api, fields, models
from odoo.exceptions import ValidationError
import calendar
from odoo.exceptions import ValidationError
from dateutil.relativedelta import relativedelta
from datetime import datetime

date_selecetion = [
    ('1', 'January'),
    ('2', 'February'),
    ('3', 'March'),
    ('4', 'April'),
    ('5', 'May'),
    ('6', 'June'),
    ('7', 'July'),
    ('8', 'August'),
    ('9', 'September'),
    ('10', 'October'),
    ('11', 'November'),
    ('12', 'December')
]

class WizardBatchPosOrderArchive(models.TransientModel):
    _name = 'wizard.manual.pos.order.archive'
    _description = 'Wizard Batch Pos Order Archive'

    month = fields.Selection(string='', selection=date_selecetion,default='1',required=True)
    years = fields.Char(default=str(datetime.now().year),required=True)
    
    @api.onchange('years')
    def _onchange_years(self):
        if self.years:
            if not self.years.isdigit():
                raise ValidationError('Please enter a valid year.')
    
    
    def action_pos_order_archive(self):
        """Triggers archiving per month based on date range."""
        # from_date = self.from_date
        # to_date = self.to_date
        if not self.years:
            raise ValidationError('Please enter a year.')
        if not self.month:
            raise ValidationError('Please select a month.')
        
        param_env = self.env['ir.config_parameter'].sudo()

        # Fetch min/max archive limits from config
        max_target = float(param_env.get_param('pos_order_limit.max_amount'))
        min_target = float(param_env.get_param('pos_order_limit.min_amount'))
        month = int(self.month)
        year = int(self.years)

        get_order_ids = self.env['pos.order'].get_orders_to_archive(min_target,max_target,month,year)

        # # Archive orders
        if not get_order_ids:
            raise ValidationError('There is no orders')
    
        orders_to_archive = self.env['pos.order'].browse(get_order_ids)
        for order in orders_to_archive:
            order.action_archive()
            for p in order.payment_ids:
                p.action_archive()

        if orders_to_archive:
            self.env['pos.order']._create_archiving_log(True, orders_to_archive)

        return True
