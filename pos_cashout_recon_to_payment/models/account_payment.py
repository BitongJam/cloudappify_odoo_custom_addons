from odoo import _, api, fields, models
from odoo.exceptions import ValidationError


class AccountPayment(models.Model):
    _inherit = 'account.payment'

    cashout_account_bank_statement_line_id = fields.Many2one(comodel_name='account.bank.statement.line',domain="[('pos_session_id','!=',False),('amount','<',0),('is_reconciled','=',False),('payment_ref','ilike','-out-')]")
    cashout_payment_recon_journal = fields.Many2one(comodel_name='account.journal', domain="[('type','=','general')]")
    move_id_cash_out_payment_recon  = fields.Many2one(comodel_name='account.move',readonly=True)
    
    
        

    def action_post(self):  
        ret = super(AccountPayment,self).action_post()
        if self.cashout_account_bank_statement_line_id and self.payment_type == 'outbound':
            pos_cash_out_ref = self.cashout_account_bank_statement_line_id.move_id.name
            bank_suspense_account_id = self.cashout_account_bank_statement_line_id.move_id.line_ids.account_id.filtered(lambda s: s.account_type =='asset_current').id
            outstanding_ref = self.move_id
            outstanding_account_id = self.move_id.line_ids.account_id.filtered(lambda s: s.account_type =='asset_current')
            self.reconcile_cash_out_with_outstanding(pos_cash_out_ref,bank_suspense_account_id,outstanding_ref,outstanding_account_id.id)
        return ret

    def action_draft(self):
        ret = super(AccountPayment,self).action_draft()
        for rec in self:
            rec.move_id_cash_out_payment_recon.button_draft()
            rec.move_id_cash_out_payment_recon.button_cancel()
            rec.move_id_cash_out_payment_recon.with_context(force_delete=True).unlink()
        return ret
    
    @api.onchange('cashout_account_bank_statement_line_id')
    def _onchange_cashout_account_bank_statement_line_id(self):
        if self.cashout_account_bank_statement_line_id == False:
            self.cashout_payment_recon_journal = False
            return
        if self.cashout_account_bank_statement_line_id:
            self.write({'amount':self.cashout_account_bank_statement_line_id.amount_residual})

    @api.onchange('payment_type')
    def _onchange_payment_type(self):
        if self.payment_type == 'inbound':
            self.cashout_account_bank_statement_line_id = False
        pass

    @api.model
    def reconcile_cash_out_with_outstanding(
        self, pos_cash_out_ref, bank_suspense_account_id, outstanding_ref, outstanding_account_id
    ):
        """
        Reconciles the Bank Suspense Account from POS cash-out with the Outstanding Payment Account.

        :param pos_cash_out_ref: Reference of the POS cash-out transaction.
        :param outstanding_ref: Reference of the outstanding payment transaction.
        :param bank_suspense_account_id: ID of the Bank Suspense Account.
        :param outstanding_account_id: ID of the Outstanding Payment Account.
        """
        # Search for the POS cash-out move lines
        pos_cash_out_lines = self.env['account.move.line'].search([
            ('move_id.name', '=', pos_cash_out_ref),
            ('account_id', '=', bank_suspense_account_id),
            ('reconciled', '=', False),
        ])

        if not pos_cash_out_lines:
            raise ValidationError(_("No unreconciled POS cash-out found for reference: %s") % pos_cash_out_ref)

        # Search for the outstanding payment move lines
        outstanding_lines = self.env['account.move.line'].search([
            ('move_id', '=', outstanding_ref.id),
            ('account_id', '=', outstanding_account_id),
            ('reconciled', '=', False),
        ])

        if not outstanding_lines:
            raise ValidationError(_("No unreconciled outstanding payment found for reference: %s") % outstanding_ref.name)

        # Calculate total amounts to reconcile
        total_pos_cash_out = sum(line.balance for line in pos_cash_out_lines)
        total_outstanding = sum(line.balance for line in outstanding_lines)

        if abs(total_pos_cash_out) != abs(total_outstanding):
            raise ValidationError(_("The amounts for POS cash-out and outstanding payment do not match."))

        # Create a journal entry to reconcile the two accounts
        journal = self.env['account.journal'].browse(self.cashout_payment_recon_journal.id)
        if not journal:
            raise ValidationError(_("Reconciliation journal is not defined."))

        move_vals = {
            'journal_id': journal.id,
            'ref': _("Reconciliation for %s and %s") % (pos_cash_out_ref, outstanding_ref.name),
            'line_ids': [
                # Debit Outstanding Payment
                (0, 0, {
                    'account_id': outstanding_account_id,
                    'debit': abs(total_outstanding),
                    'credit': 0,
                    'name': _("Reconciliation with %s") % outstanding_ref.name,
                }),
                # Credit Bank Suspense
                (0, 0, {
                    'account_id': bank_suspense_account_id,
                    'debit': 0,
                    'credit': abs(total_pos_cash_out),
                    'name': _("Reconciliation with %s") % pos_cash_out_ref,
                }),
            ],
        }
        move = self.env['account.move'].create(move_vals)
        self.move_id_cash_out_payment_recon = move
        move.action_post()

        # Reconcile the lines
        ml_pos_credit = move.line_ids.filtered(lambda s: s.account_id.id == bank_suspense_account_id)
        (pos_cash_out_lines + ml_pos_credit).reconcile()

        ml_payment_debit = move.line_ids.filtered(lambda s: s.account_id.id == outstanding_account_id)
        (outstanding_lines + ml_payment_debit).reconcile()

        return _("Reconciliation completed for %s and %s") % (pos_cash_out_ref, outstanding_ref.name)
