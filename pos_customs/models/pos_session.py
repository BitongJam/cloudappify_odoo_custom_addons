from odoo import _, api, fields, models,tools
from odoo.exceptions import AccessError, UserError
from odoo.osv.expression import AND, OR

class PosSession(models.Model):
    _inherit = 'pos.session'

    account_entry_ids = fields.One2many(comodel_name='account.move', inverse_name='id')
    payment_lines_grouped = fields.One2many(
        comodel_name='pos.session.payments.group',
        inverse_name='session_id',
        string='Grouped Payments',
        compute='_compute_payment_lines_grouped',
        store=False  # This makes it non-stored
    )
    
    total_discount = fields.Float(help="Computed of total discount from orders.",compute="_compute_total_discount",store=True,readonly=True)
    
    def open_frontend_cb(self):
        if self.user_id != self.env.user.id and self.user_id == True:
            raise UserError("You cannot open this Session. This Session Belong to %s"%self.user_id.name)
        res = super(PosSessionPaymentLines,self).open_frontend_cb()
        return res
    
    @api.depends('order_ids.total_discount')
    def _compute_total_discount(self):
        ttal = 0
        for sesison in self:
            ttal = ttal + sum(order.total_discount for order in sesison.order_ids)
        
            sesison.total_discount = ttal
    
    def unlink(self):
        if self.state !='closed':
            raise UserError("You can only delete a session that has been closed.")
        res = super(PosSession, self).unlink()
        return res
    
    # @api.depends('state', 'pos_payment_ids')  # Use relevant fields for dependencies
    def _compute_payment_lines_grouped(self):
        for session in self:
            session.payment_lines_grouped = self.env['pos.session.payments.group'].search([
                ('session_id', '=', session.id)
            ])

    def _compute_ttal_non_cash_payment(self):
        ttal = 0
        for t in self.env['pos.payment'].search([('session_id','=',self.id)]):
            if t.payment_method_id.journal_id.type == 'bank':

                ttal = ttal + t.amount

        self.ttal_non_cash_payment = ttal
        
    # Extended function from point_of_sale
    def _loader_params_product_product(self):
        ret = super(PosSession,self)._loader_params_product_product()
        ret['search_params']['fields'].append('name')
        ret['search_params']['fields'].append('display_name_w_tag')
        return ret

    # Override
    def show_cash_register(self):
        EXCLUDED_REFS = [
                    'Cash difference observed during the counting (Loss) - opening',
                    'Cash difference observed during the counting (Profit) - opening'
                ]
        return {
            'name': _('Cash register'),
            'type': 'ir.actions.act_window',
            'res_model': 'account.bank.statement.line',
            'view_mode': 'tree,kanban',
            'view_ids': [
                (0, 0, {'view_mode': 'tree', 'view_id': self.env.ref('pos_customs.cash_register_statement_view_tree').id}),
            ],
            'domain': [('id', 'in', self.statement_line_ids.ids),('payment_ref','not in',EXCLUDED_REFS)],
        }


    #Override
    def get_closing_control_data(self):
        if not self.env.user.has_group('point_of_sale.group_pos_user'):
            raise AccessError(_("You don't have the access rights to get the point of sale closing control data."))
        self.ensure_one()
        orders = self.order_ids.filtered(lambda o: o.state == 'paid' or o.state == 'invoiced')
        payments = orders.payment_ids.filtered(lambda p: p.payment_method_id.type != "pay_later")
        pay_later_payments = orders.payment_ids - payments
        cash_payment_method_ids = self.payment_method_ids.filtered(lambda pm: pm.type == 'cash')
        default_cash_payment_method_id = cash_payment_method_ids[0] if cash_payment_method_ids else None
        total_default_cash_payment_amount = sum(payments.filtered(lambda p: p.payment_method_id == default_cash_payment_method_id).mapped('amount')) if default_cash_payment_method_id else 0
        other_payment_method_ids = self.payment_method_ids - default_cash_payment_method_id if default_cash_payment_method_id else self.payment_method_ids
        cash_in_count = 0
        cash_out_count = 0
        cash_in_out_list = []
        last_session = self.search([('config_id', '=', self.config_id.id), ('id', '!=', self.id)], limit=1)
        for cash_move in self.sudo().statement_line_ids.sorted('create_date'):
            if cash_move.amount > 0:
                cash_in_count += 1
                name = f'Cash in {cash_in_count}'
            else:
                cash_out_count += 1
                name = f'Cash out {cash_out_count}'
            EXCLUDED_REFS = [
                    'Cash difference observed during the counting (Loss) - opening',
                    'Cash difference observed during the counting (Profit) - opening'
                ]

            if cash_move.payment_ref not in EXCLUDED_REFS:
                cash_in_out_list.append({
                    'name': cash_move.payment_ref if cash_move.payment_ref else name,
                    'amount': cash_move.amount
                })
        # raise UserWarning(cas)

        return {
            'orders_details': {
                'quantity': len(orders),
                'amount': sum(orders.mapped('amount_total'))
            },
            'payments_amount': sum(payments.mapped('amount')),
            'pay_later_amount': sum(pay_later_payments.mapped('amount')),
            'opening_notes': self.opening_notes,
            'default_cash_details': {
                'name': default_cash_payment_method_id.name,
                'amount': last_session.cash_register_balance_end_real
                          + total_default_cash_payment_amount
                          + sum(self.sudo().statement_line_ids.mapped('amount')),
                'opening': self.cash_register_balance_start,
                'payment_amount': total_default_cash_payment_amount,
                'moves': cash_in_out_list,
                'id': default_cash_payment_method_id.id
            } if default_cash_payment_method_id else None,
            'other_payment_methods': [{
                'name': pm.name,
                'amount': sum(orders.payment_ids.filtered(lambda p: p.payment_method_id == pm).mapped('amount')),
                'number': len(orders.payment_ids.filtered(lambda p: p.payment_method_id == pm)),
                'id': pm.id,
                'type': pm.type,
            } for pm in other_payment_method_ids],
            'is_manager': self.user_has_groups("point_of_sale.group_pos_manager"),
            'amount_authorized_diff': self.config_id.amount_authorized_diff if self.config_id.set_maximum_difference else None
        }




class PosSessionPaymentLines(models.Model):
    _name = 'pos.session.payments.group'
    _description = 'POS Session Payment Lines Grouped by Payment Method'
    _auto = False

    id = fields.Integer(string='ID', required=True)
    session_id = fields.Many2one(comodel_name='pos.session', string="POS Session")
    name = fields.Char(string="Payment Name")
    payment_method_id = fields.Many2one(comodel_name='pos.payment.method', string="Payment Method")
    amount = fields.Monetary()
    currency_id = fields.Many2one(comodel_name='res.company', string='')
    
    pos_order_id = fields.Many2one(comodel_name='pos.order', string='')
    

    def init(self):
        tools.drop_view_if_exists(self.env.cr, self._table)
        self.env.cr.execute(f"""
            CREATE OR REPLACE VIEW {self._table} AS (
                SELECT 
                    pp.session_id AS session_id,
                    pp.name AS name,
                    pp.payment_method_id AS payment_method_id,
                    SUM(pp.amount) AS amount,
                    rc.currency_id  AS currency_id,
                    pp.pos_order_id as pos_order_id
                FROM 
                    pos_payment pp
                JOIN res_company rc on rc.id = pp.company_id
                GROUP BY 
                    pp.session_id, pp.name, pp.payment_method_id,pp.pos_order_id,rc.currency_id
            )
        """)