from odoo import fields, models, api
from odoo.exceptions import UserError

class AccountMove(models.Model):
    _inherit = 'account.move'

    def _create_picking(self):
        self.ensure_one()  # ✅ safety: method always works on 1 invoice

        if not self.validate_picking:
            return

        if not self.warehouse_id:
            raise UserError(_('Please select warehouse.'))

        picking_obj = self.env['stock.picking']
        picking_type_obj = self.get_operation_type().ensure_one()  # ✅ make sure single record

        cust_loc = self.env["stock.location"].search(
            [("usage", "=", "customer")], limit=1
        )
        #stock_loc = self.env["stock.location"].search(
        #     [("usage", "=", "internal"), ("name", "ilike", "Stock")], limit=1
        # )

        stock_loc = self.env["stock.location"].browse(self.partner_id.property_stock_supplier.id) or False

        product_track = self.invoice_line_ids.filtered(
            lambda p: p.tracking in ('lot', 'serial')
        )

        if self.auto_post_picking and product_track:
            raise UserError(
                "In Invoice Lines, there is a product tracked by serial/lot that "
                "needs to be manually validated. Uncheck the auto-picking post to proceed."
            )

        stock_moves = []
        for line in self.invoice_line_ids:
            if line.product_id.type == 'product':
                stock_moves.append((0, 0, {
                    'product_id': line.product_id.id,
                    'name': line.product_id.name,
                    'product_uom_qty': line.quantity,
                    'product_uom': line.product_uom_id.id,
                    'location_id': stock_loc.id or 4,
                    'location_dest_id': picking_type_obj.default_location_dest_id.id or cust_loc.id,
                }))

        picking_vals = {
            "partner_id": self.partner_id.id,
            "picking_type_id": picking_type_obj.id,
            "location_id": stock_loc.id or 4,
            "location_dest_id": picking_type_obj.default_location_dest_id.id or cust_loc.id,
            "move_ids_without_package": stock_moves,
            'origin': self.name,
            'move_type': 'one',
            'invoice_id': self.id,
            "show_validate": True,
            "branch_id": self.branch_id.id or False
        }

        pick = picking_obj.create(picking_vals)

        stock_picking_url = 'web#id=%s&view_type=form&model=stock.picking' % pick.id
        message = "Picking is Created <a href='%s'>Stock Picking %s" % (stock_picking_url, pick.name)
        self.create_log_message(message)  # ✅ safe (self is single)

        if self.auto_post_picking:
            pick.action_confirm()
            pick.action_assign()
            for move_line in pick.move_line_ids:
                move_line.qty_done = move_line.move_id.product_uom_qty
            pick.button_validate()

