# -*- coding: utf-8 -*-
from odoo import fields,models

class PosKitchenOrderLine(models.Model):
    _name = 'pos.kitchen.order.line'
    _description = 'Pos Kitchen Order Line'
    
    product_id = fields.Many2one('product.product', string='Product', required=True)
    qty = fields.Float(string='Quantity', required=True, default=1.0)
    note = fields.Text(string='Note')