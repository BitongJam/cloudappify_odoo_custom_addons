# -*- coding: utf-8 -*-
from odoo import fields,models

class PosOrder(models.Model):
    _inherit = 'pos.order'

    kitchen_order_id = fields.Many2one('pos.kitchen.order', string='Kitchen Order')
