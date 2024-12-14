from odoo import _, api, fields, models



class ResPartner(models.Model):
    _inherit = 'res.partner'

    @api.model
    def default_get(self, fields):
        defaults = super(ResPartner, self).default_get(fields)
        defaults['email'] = "@"
        return defaults
    
