from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class PosPayment(models.Model):
    _inherit = 'pos.payment'

    active = fields.Boolean(default=True)
    
    def action_archive(self):
        if self.pos_order_id:
            if self.pos_order_id.active == True:
             raise ValidationError('You cannot archive this payment. Its order is still active.')
        return super(PosPayment,self).action_archive()