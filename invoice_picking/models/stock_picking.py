# -*- coding: utf-8 -*-

from odoo import models, fields, api, _


class StockPicking(models.Model):
    _inherit = 'stock.picking'
    
    invoice_id = fields.Many2one(comodel_name='account.move', string="Invoice ID")