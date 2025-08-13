from odoo import _, api, fields, models



class PosConfig(models.Model):
    _inherit = 'pos.config'

    income_account_id = fields.Many2one(comodel_name='account.account', string='Income Account', domain=[('deprecated', '=', False),('account_type', '=', 'income')],
                                        help='The income account used for POS transactions. This account will be used to track sales revenue from the Point of Sale system.')

    #TODO: create constrais on the income_account_id.. if there is active pos.session.. it will be not edited..