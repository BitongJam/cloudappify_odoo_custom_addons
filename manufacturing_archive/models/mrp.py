from odoo import _, api, fields, models



class MrpProduction(models.Model):
    _inherit = 'mrp.production'

    active = fields.Boolean(default=True)