from odoo import _, api, fields, models,tools
from odoo.exceptions import UserError


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
        


    # Override
    def show_cash_register(self):
        return {
            'name': _('Cash register'),
            'type': 'ir.actions.act_window',
            'res_model': 'account.bank.statement.line',
            'view_mode': 'tree,kanban',
            'view_ids': [
                (0, 0, {'view_mode': 'tree', 'view_id': self.env.ref('pos_customs.cash_register_statement_view_tree').id}),
            ],
            'domain': [('id', 'in', self.statement_line_ids.ids)],
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