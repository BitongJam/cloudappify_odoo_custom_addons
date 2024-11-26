from odoo import _, api, fields, models



class PosOrder(models.Model):
    _inherit = 'pos.order'

    def action_pos_order_cancel(self):
        pick = self.env['stock.picking'].search([('pos_order_id','=',self.id)])
        for p in pick:
            #cancel picking
            p.action_cancel()

        for pay_line in self.payment_ids:
            #remove payments
            pay_line.unlink()
        
        res = super(PosOrder,self).action_pos_order_cancel()
        return res