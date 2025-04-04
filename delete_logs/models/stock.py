from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class StockPicking(models.Model):
    _inherit =  'stock.picking'


    def unlink(self):
        if self.state not in ('draft','cancel'):
            raise ValidationError("You Cannot Delete Active Stock Picking")
        name = self.name
        db = self.env.cr.dbname
        message =  "Delete by %s"%self.env.user.name
        res = super(StockPicking,self).unlink()
        
        self.env['ir.logging'].create({
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