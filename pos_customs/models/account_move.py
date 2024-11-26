from odoo import _, api, fields, models



class AccountMove(models.Model):
    _inherit = 'account.move'

    sel_pos_cash_in_out = fields.Selection(selection=[('in', 'Cash In'), ('out', 'Cash Out'),],default = False,help="Indicator if the Journal Entry for POS is a cash in or cash out")


