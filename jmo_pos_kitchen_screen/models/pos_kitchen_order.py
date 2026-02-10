from odoo import _, api, fields, models



class PosKitchenOrder(models.Model):
    _name = 'pos.kitchen.order'
    _description = 'Pos Kitchen Order'


    name = fields.Char(string='Order Reference', required=True, copy=False, readonly=True,
                       default=lambda self: _('New'))
    pos_order_id = fields.Many2one('pos.order', string='POS Order', required=True, ondelete='cascade')
    state = fields.Selection([
        ('pending', 'Pending'),
        ('done', 'Done'),
        ('cancelled', 'Cancelled')
    ], string='Status', default='pending', required=True)


   

    
    