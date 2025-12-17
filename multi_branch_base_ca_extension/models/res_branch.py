from odoo import fields, models, api

class ResBranch(models.Model):
    _name = 'res.branch'
    _inherit = ['res.branch','mail.thread', 'mail.activity.mixin']

    name = fields.Char(tracking=True)
    company_id = fields.Many2one(tracking=True)