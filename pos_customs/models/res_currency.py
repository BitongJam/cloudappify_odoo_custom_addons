from odoo import _, api, fields, models



class ResCurrency(models.Model):
    _inherit = 'res.curency'


    from odoo import models, fields, api
from odoo.exceptions import UserError

class CurrencyConverter(models.Model):
    _inherit = 'res.currency'

    @api.model
    def convert_to_company_currency(self, amount, from_currency_id):
        """
        Convert an amount from one currency to the currency of the current company.

        :param amount: The amount to be converted.
        :param from_currency_id: The source currency ID.
        :return: Converted amount in the company's currency.
        """
        
        # Get the current user's company
        company = self.env.company

        # Get the source and target currencies
        from_currency = self.browse(from_currency_id)
        to_currency = company.currency_id
        
        if not from_currency or not to_currency:
            raise UserError("Invalid currency IDs provided.")

        # If both currencies are the same, return the amount without conversion
        if from_currency == to_currency:
            return amount
        
        try:
            # Perform the conversion using Odoo's built-in `convert` method
            converted_amount = self.convert(amount, from_currency, to_currency)
            return converted_amount
        except Exception as e:
            raise UserError(f"Error during currency conversion: {str(e)}")
