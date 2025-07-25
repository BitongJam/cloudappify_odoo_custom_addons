from odoo import _, api, fields, models
from num2words import num2words



class AccountPayment(models.Model):
    _inherit = 'account.payment'

    amount_words = fields.Char(computed = "_compute_amount_words")

    @api.depends("amount")
    def _compute_amount_words(self):
        # This will compute to convert amount field to amount in words for check 
        for rec in self:
            if rec.amount:
                rec.amount_words = num2words(rec.amount, lang='en')
            else:
                rec.amount_words = ''
    
