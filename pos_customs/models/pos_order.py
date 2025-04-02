from odoo import _, api, fields, models



class PosOrder(models.Model):
    _inherit = 'pos.order'

    def action_pos_order_cancel(self):
        pick = self.env['stock.picking'].search([('pos_order_id','=',self.id)])
        for p in pick:
            #cancel picking
            p.action_cancel()

        for pay_line in self.payment_ids:
            #remove payments
            pay_line.unlink()
        
        res = super(PosOrder,self).action_pos_order_cancel()
        return res
    
    # Computed field for total discount
    total_discount = fields.Float(string='Total Discount', compute='_compute_total_discount', store=True,readonly=True)

    @api.depends('lines.discount_amount')
    def _compute_total_discount(self):
        for order in self:
            total_discount = sum(line.discount_amount for line in order.lines)
            order.total_discount = total_discount
    
class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    discount_amount  = fields.Float(compute="_compute_discount_amount",store=True)

    @api.depends('price_unit', 'qty', 'discount', 'tax_ids')
    def _compute_discount_amount(self):
        for line in self:
            # Check if any of the taxes are price-included
            is_tax_included = any(tax.price_include for tax in line.tax_ids)

            if is_tax_included:
                tax_id = False
                # included tax
                for tax in line.tax_ids:
                    tax_id = tax

                tax_amount = tax_id.amount/100 
                no_tax_amount = line.price_unit/(1+tax_amount)

                discounted_amount = no_tax_amount * (line.discount/100)
                line.discount_amount = discounted_amount*line.qty
            else:
                tax_id = False
                # included tax
                for tax in line.tax_ids:
                    tax_id = tax


                discounted_amount = line.price_unit * (line.discount/100)
                line.discount_amount = discounted_amount*line.qty
            #excluded tax

