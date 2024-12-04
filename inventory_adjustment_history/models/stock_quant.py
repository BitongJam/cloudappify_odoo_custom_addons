from odoo import _, api, fields, models
from odoo.exceptions import UserError
from odoo.tools.float_utils import float_compare, float_is_zero


class StockQuant(models.Model):
    _inherit = 'stock.quant'

    # Overrided
    def _apply_inventory(self):
        move_vals = []
        if not self.user_has_groups('stock.group_stock_manager'):
            raise UserError(_('Only a stock manager can validate an inventory adjustment.'))
        for quant in self:
            # Create and validate a move so that the quant matches its `inventory_quantity`.
            if float_compare(quant.inventory_diff_quantity, 0, precision_rounding=quant.product_uom_id.rounding) > 0:
                move_vals.append(
                    quant._get_inventory_move_values(quant.inventory_diff_quantity,
                                                     quant.product_id.with_company(quant.company_id).property_stock_inventory,
                                                     quant.location_id))
            else:
                move_vals.append(
                    quant._get_inventory_move_values(-quant.inventory_diff_quantity,
                                                     quant.location_id,
                                                     quant.product_id.with_company(quant.company_id).property_stock_inventory,
                                                     out=True))
        moves = self.env['stock.move'].with_context(inventory_mode=False).create(move_vals)
        moves._action_done()
        self.location_id.write({'last_inventory_date': fields.Date.today()})
        date_by_location = {loc: loc._get_next_inventory_date() for loc in self.mapped('location_id')}
        for quant in self:
            quant.inventory_date = date_by_location[quant.location_id]
        self.write({'inventory_quantity': 0, 'user_id': False})
        self.write({'inventory_diff_quantity': 0})

    def _get_inventory_move_values(self, qty, location_id, location_dest_id, out=False):
        """ Override to add a new value in move_line_ids. """
        # Call the original method to get the default dictionary
        move_values = super(StockQuant, self)._get_inventory_move_values(qty, location_id, location_dest_id, out)

        # Add or modify a value in `move_line_ids`
        if move_values.get('move_line_ids'):
            # Add a custom value to each move line
            for move_line in move_values['move_line_ids']:
                if isinstance(move_line, tuple) and move_line[0] == 0:  # Check if it's a new record format
                    move_line[2]['history_counted'] = self.inventory_quantity # Add your custom field and value

        return move_values
