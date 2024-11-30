# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import UserError


class AccountMove(models.Model):
    _inherit = 'account.move'

    validate_picking = fields.Boolean(default=False, string="With Picking")
    warehouse_id = fields.Many2one(comodel_name='stock.warehouse', string="Warehouse")
    auto_post_picking = fields.Boolean(string="Auto Post Picking")


    @api.constrains('state')
    def _check_invoice_with_picking_canceling(self):
        if self.state in ('cancel','draft'):
            if self.validate_picking:
                done_pick = self.env['stock.picking'].search_count([('origin','=',self.name),('state','not in',('draft','cancel'))])
                if done_pick > 0:
                    raise UserError("You cannot Cancel or Set to Draft This invoice. Cancel first its Delivery or set to draft.")
    
    def action_post(self):
        res = super(AccountMove, self).action_post()
        for rec in self:
            if rec.validate_picking:
                if not rec.warehouse_id:
                    raise UserError(_('Please select warehouse.'))
                
                else:
                    stock_move_lines = []
                    stock_move = []
                    picking_obj = self.env['stock.picking']
                    picking_type_obj = rec.get_operation_type()
                    cust_loc = self.env["stock.location"].search(
                            [("usage", "=", "customer")], limit=1
                        )
                    stock_loc = self.env["stock.location"].search(
                            [("usage", "=", "internal"), ("name", "ilike", "Stock")], limit=1
                        )
                    
                    product_track = rec.invoice_line_ids.filtered(lambda p:p.tracking in ('lot','serial'))

                    if rec.auto_post_picking:
                        if len(product_track) > 0:
                            raise UserError("In Invoice Lines, there is a product track by serial/lot that needs to be manually validated. Uncheck the auto-picking post to proceed.")
        
                    for line in rec.invoice_line_ids:
                        if line.product_id.type == 'product':
                            stock_move_lines.append((0,0,
                                    {
                                        
                                        "product_id": line.product_id.id,
                                        # "name": line.name,
                                        # "product_uom_qty": line.quantity,
                                        "qty_done": line.quantity,
                                        "product_uom_id": line.product_uom_id.id,
                                        "location_id": 4,
                                        "location_dest_id": picking_type_obj.default_location_dest_id.id
                                        or cust_loc.id,
                                    },))
                            
                            stock_move.append((0,0,{
                                'product_id':line.product_id.id,
                                "name":line.product_id.name,
                                'product_uom_qty':line.quantity,
                                'product_uom':line.product_uom_id.id,
                                "location_id": 4,
                                "location_dest_id": picking_type_obj.default_location_dest_id.id
                                or cust_loc.id,
                            }))
                    
                    picking_vals = {
                            "partner_id": rec.partner_id.id,
                            "picking_type_id": picking_type_obj.id,
                            "location_id": 4,
                            "location_dest_id": picking_type_obj.default_location_dest_id.id or cust_loc.id,
                            "move_ids_without_package": stock_move,
                            "move_line_ids_without_package": stock_move_lines,
                            'origin': rec.name,
                            'move_type': 'one',
                            'invoice_id': rec.id,
                            "show_validate": True,
                        }
                    
                    
                    pick = picking_obj.create(picking_vals)

                    stock_picking_url = 'web#id=%s&view_type=form&model=stock.picking'%pick.id
                    message= "Picking is Created <a href='%s'>Stock Picking %s"%(stock_picking_url,pick.name)
                    self.create_log_message(message)

                    if rec.auto_post_picking:
                        pick.action_confirm()
                        if pick:
                            for lines in pick.move_ids_without_package:
                                lines.update({'name': lines.product_id.name})

                            
                            pick.button_validate()
        return res
    
    
    
    def get_operation_type(self):
        for rec in self:
            operation_type = rec.env['stock.picking.type']
            if rec.move_type in ['out_invoice','out_receipt']:
                operation_type = operation_type.search([('warehouse_id','=', rec.warehouse_id.id),('return_picking_type_id','!=',False),
                                                        ('code', '=', 'outgoing')])
            elif rec.move_type in ['in_invoice', 'in_receipt']:
                operation_type = operation_type.search([('warehouse_id','=', rec.warehouse_id.id),('return_picking_type_id','!=',False),
                                                        ('code', '=', 'incoming')])
        return operation_type
    
        
    def create_log_message(self, message):
        # Create an internal log message tied to the record
        self.env['mail.message'].create({
            'model': 'account.move',  # Model related to the log
            'res_id': self.id,  # The record to which the log belongs
            'body': message,  # The log message
            'message_type': 'notification',  # Message type (can also be 'email')
            'subject': 'Log Message',
        })
    



class AccountMoveLine(models.Model):
    _inherit = 'account.move.line'

    tracking = fields.Selection(related='product_id.tracking',help="Related field form product tracking field content")
    
