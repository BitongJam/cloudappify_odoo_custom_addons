from odoo import _, api, fields, models
from odoo.exceptions import UserError


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'


    pos_max_amount = fields.Float(string='POS Maximum Amount', config_parameter='pos_order_limit.max_amount')
    pos_min_amount = fields.Float(string='POS Minimum Amount', config_parameter='pos_order_limit.min_amount')


    @api.onchange('pos_max_amount')
    def _onchange_pos_max_amount(self):
        if self.pos_max_amount != 0:
            if self.pos_max_amount < self.pos_min_amount:
                raise UserError('You cannot set Field Maximum Amount less thant the Minimum Amount')
            
    @api.onchange('pos_min_amount')
    def _onchange_pos_min_amount(self):
        if self.pos_min_amount != 0:
            if self.pos_min_amount > self.pos_max_amount:
                raise UserError("You Cannot Set Minimum Amount Greater than the fields MAximum Amount")