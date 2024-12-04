from odoo import _, api, fields, models



class StockMoveLine(models.Model):
    _inherit = 'stock.move.line'

    history_counted  = fields.Char(help="This field when movement create from inventory adjustment")
    