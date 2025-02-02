from odoo import _, api, fields, models



class AccountPaymentRegister(models.TransientModel):
    _inherit = 'account.payment.register'

    cashout_account_bank_statement_line_id = fields.Many2one(comodel_name='account.bank.statement.line',domain="[('pos_session_id','!=',False),('amount','<',0),('is_reconciled','=',False),('payment_ref','ilike','-out-')]")
    cashout_payment_recon_journal = fields.Many2one(comodel_name='account.journal', domain="[('type','=','general')]")
    

    def _create_payment_vals_from_wizard(self,batch_result):
        ret = super(AccountPaymentRegister,self)._create_payment_vals_from_wizard(batch_result)
        ret['cashout_account_bank_statement_line_id'] = self.cashout_account_bank_statement_line_id.id
        ret['cashout_payment_recon_journal'] = self.cashout_payment_recon_journal.id
        return ret


    @api.onchange('cashout_account_bank_statement_line_id')
    def _onchange_cashout_account_bank_statement_line_id(self):
        if self.cashout_account_bank_statement_line_id == False:
            self.cashout_payment_recon_journal = False
            return
        if self.cashout_account_bank_statement_line_id:
            self.amount = self.cashout_account_bank_statement_line_id.amount_residual