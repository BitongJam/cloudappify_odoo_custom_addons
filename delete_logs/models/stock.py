from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class StockPicking(models.Model):
    _inherit =  'stock.picking'


    def unlink(self):
        for rec in self:
            if rec.state not in ('cancel'):
                raise ValidationError("You Cannot Delete Active Stock Picking")
            name = rec.name
            db = rec.env.cr.dbname
            message =  "Delete by %s"%rec.env.user.name
            res = super(StockPicking,rec).unlink()
            
            rec.env['ir.logging'].create({
                'name': 'Stock Picking Delete: %s'%name,
                'dbname': db,
                'type': 'client',
                'level': 'info',
                'path':'/',
                'func':'unlink()',
                'line':'N/A',
                'message':message,
            })
            return res