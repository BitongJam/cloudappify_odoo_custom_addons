from odoo import _, api, fields, models



class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def create_from_ui(self, orders, draft=False):
        # Call the original method to handle default behavior
        # Accessing the first order in the list
        order = orders[0]

        # Now you can access the 'data' attribute
        statement = order.get('data', {}).get('statement_ids', [])[0][2]

        # Set the transaction_id to a fixed value
        #this will be the field we store the payment reference..

        #TODO: FOR NOW IT IS SET AS FIXED FIND A WAY FROM THE POS INTERFACE THAT WILL SET ITS PAYMENT REFERENCE THEN WILL BE THROW HERE
        statement['transaction_id'] = 'fixed_transaction_001'

        
        res = super(PosOrder, self).create_from_ui(orders)
        
        return res