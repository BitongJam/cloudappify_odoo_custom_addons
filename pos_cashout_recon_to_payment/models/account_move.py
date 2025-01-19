from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class AccountMove(models.Model):
    _inherit = 'account.move'

    def button_draft(self):
        # check_entry
        payment_recon_move = self.env['account.payment'].search([('move_id_cash_out_payment_recon','=',self.id),('state','=','posted')])
        if payment_recon_move:
            raise ValidationError("You Cannot Set to Draft this entry. You must set it to draft/cancel payment related to this entry.")
        ret = super(AccountMove,self).button_draft()
        return ret
