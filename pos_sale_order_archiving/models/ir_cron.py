from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class IrCron(models.Model):
    _inherit = 'ir.cron'


    @api.onchange('active')
    def _onchange_active_pos_sale_order_archiving(self):
        if self.active:
            param_env = self.env['ir.config_parameter'].sudo()
            max_amount = float(param_env.get_param('pos_order_limit.max_amount', default=0))
            min_amount = float(param_env.get_param('pos_order_limit.min_amount', default=0))

            # Validation: Prevent activation if max/min are not set
            if max_amount == 0 or min_amount == 0:
                self.active = False  # Revert the change
                raise ValidationError("Cannot activate this cron job. Please configure the POS Max and Min Amount in Settings.")
