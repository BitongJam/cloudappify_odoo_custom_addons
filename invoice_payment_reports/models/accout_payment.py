from odoo import _, api, fields, models
from num2words import num2words



class AccountPayment(models.Model):
    _inherit = 'account.payment'

    amount_words = fields.Char(compute = "_compute_amount_words")

    @api.depends("amount","currency_id")
    def _compute_amount_words(self):
        for rec in self:
            if rec.amount:
                # Convert amount to words
                words = num2words(rec.amount, lang='en').capitalize()
                # Append currency name
                if rec.currency_id:
                    words = f"{words} {rec.currency_id.name}"
                rec.amount_words = words
            else:
                rec.amount_words = ''


