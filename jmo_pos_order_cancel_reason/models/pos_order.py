from odoo import _, api, fields, models

class PosOrder(models.Model):
    _name = 'pos.order'
    _inherit = ['pos.order', 'mail.thread']  # ✅ Only one _inherit

    note = fields.Text(string="Note", tracking=True)

    def action_pos_order_cancel(self):
        pick = self.env['stock.picking'].search([('pos_order_id', '=', self.id)])
        if pick:
            for p in pick:
                p.action_cancel()

        for pay_line in self.payment_ids:
            pay_line.unlink()
        
        res = super(PosOrder, self).action_pos_order_cancel()
        return res

    def action_post_order_cancel_reasons(self):
        action = self.env.ref("jmo_pos_order_cancel_reason.wizard_pos_order_cancel_action").read()[0]
        action['context'] = {
            'default_pos_order_id': self.id
        }
        return action
