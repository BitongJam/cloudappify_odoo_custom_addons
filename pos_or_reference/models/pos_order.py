from odoo import _, api, fields, models




class PosOrder(models.Model):
    _inherit = 'pos.order'

    official_receipt_reference = fields.Char(tracking=True,help="This is Official Receipt Reference")
    order_has_official_receipt = fields.Boolean()

    @api.model
    def _order_fields(self,ui_order):
        ret = super(PosOrder,self)._order_fields(ui_order)
        ret['official_receipt_reference'] = ui_order.get('official_receipt_reference')
        return ret

    