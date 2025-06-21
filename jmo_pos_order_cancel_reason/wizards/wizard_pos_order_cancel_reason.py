from odoo import _, api, fields, models
from odoo.http import request

class WizardPosOrderCancelReason(models.TransientModel):
    _name = 'wiz.pos.order.cancel.reason'
    _description = 'Wizard Pos Order Cancel Reasons'

    pos_order_id = fields.Many2one(comodel_name='pos.order')    
    reason = fields.Text(string="Reason",required=True)

    def action_cancel_order(self):
        if self.pos_order_id:
            order = self.env["pos.order"].browse(self.pos_order_id.id)
            order.action_pos_order_cancel()
            self._create_log(self.reason)

    def _create_log(self,message):
        current_url = request.httprequest.url


        log = self.env['ir.logging']
        db = self.env.cr.dbname
        path = 'moodel: pos.order; id = %s'%self.pos_order_id.id
        log.create({
            'dbname':db,
            'type':'client',
            'name': 'Pos Order Cancel: %s'%(self.pos_order_id.name),
            'level': 'info',
            'path':path,
            'func': 'action_pos_order_cancel',
            'line':'N/A',
            'message': 'Reason: %s'%message
        })

        self.pos_order_id.message_post(body="Pos Order Cancel Reason: %s" % message)


