from odoo import _, api, fields, models

class PosOrder(models.Model):
    _inherit = 'pos.order'

    # @api.model
    # def _process_order(self, order, draft, existing_order):
    #     pos_order = super(PosOrder, self)._process_order(order, draft, existing_order)
    #     for line_data in order['data']:
    #         line_data[2]['data'] = line_data[2].get('discountFix', 0)  # Ensure the value is captured
    #     return pos_order


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'
    
    discountFix = fields.Float()

    @api.onchange('discountFix')
    def _onchange_fix_discount(self):
        for rec in self:
            if rec.discountFix > 0:
                rec.discount = 0
    
    def _compute_amount_line_all(self):
        self.ensure_one()
        fpos = self.order_id.fiscal_position_id
        tax_ids_after_fiscal_position = fpos.map_tax(self.tax_ids)
        if self.discountFix > 0:
            price = self.price_unit - self.discountFix
        else:
            price = self.price_unit * (1 - (self.discount or 0.0) / 100.0)
        taxes = tax_ids_after_fiscal_position.compute_all(price, self.order_id.pricelist_id.currency_id, self.qty, product=self.product_id, partner=self.order_id.partner_id)
        return {
            'price_subtotal_incl': taxes['total_included'],
            'price_subtotal': taxes['total_excluded'],
        }
    
    def _order_line_fields(self, line, session_id=None):
        res = super()._order_line_fields(line, session_id)

        # Ensure the third element is a dictionary before trying to set `discountFix`
        if isinstance(res[2], dict):
            res[2]['discountFix'] = line[2].get('discountFix', 0)  # Default to 0 if not present
        return res