from odoo import fields, models, api

class StockPickingType(models.Model):
    _name = 'stock.picking.type'
    _inherit = ['stock.picking.type','mail.thread','mail.activity.mixin']

    name = fields.Char(tracking=True)
    code = fields.Selection(tracking=True)
    sequence_id = fields.Many2one(tracking=True)
    warehouse_id = fields.Many2one(tracking=True)
    return_picking_type_id = fields.Many2one(tracking=True)
    default_location_dest_id = fields.Many2one(tracking=True)
    default_location_src_id = fields.Many2one(tracking=True)
    company_id = fields.Many2one(tracking=True)
    sequence_code = fields.Char(tracking=True)
    create_backorder = fields.Selection(tracking=True)