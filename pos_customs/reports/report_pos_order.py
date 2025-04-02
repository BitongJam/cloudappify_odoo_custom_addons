from odoo import _, api, fields, models



class PosOrderReport(models.Model):
    _inherit = 'report.pos.order'

    discount_amount = fields.Float(string='Discount Amount')
    
    
    def _select(self):
        res = super(PosOrderReport,self)._select()
        res +=",l.discount_amount as discount_amount"

        return res
    
    def _group_by(self):
        res = super(PosOrderReport,self)._group_by()
        res +=",l.discount_amount"
        return res