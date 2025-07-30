from odoo import _, api, fields, models
from odoo.exceptions import ValidationError, UserError



class CheckVoucherReport(models.AbstractModel):
    _name = 'report.invoice_payment_reports.check_voucher_report'
    _description = 'Check Voucher Report'


    def _get_report_values(self, docids, data=None):
        docs = self.env['account.payment'].browse(docids)     

        total_debit = 0
        total_credit = 0
        for rec in docs:
            if rec.journal_id.type != 'bank':
                raise UserError(_('This report is only for bank payments.'))
            
            for line in rec.move_id.line_ids:
                total_debit = total_debit + line.debit
                total_credit = total_credit + line.credit

        payment_dict = {'total_debit': total_debit, 'total_credit': total_credit}

    
        return {
            'doc_ids': docids,
            'doc_model': 'account.payment',
            'docs': docs,
            'payment_dict': payment_dict,
        }
    
class CashVoucerhReport(models.AbstractModel):
    _name = 'report.invoice_payment_reports.cash_voucher'
    _description = 'Cash Voucher Report'

    def _get_report_values(self, docids, data=None):
        docs = self.env['account.payment'].browse(docids)     

        total_debit = 0
        total_credit = 0
        for rec in docs:
            if rec.journal_id.type != 'cash':
                raise UserError(_('This report is only for cash payments.'))
            
            for line in rec.move_id.line_ids:
                total_debit = total_debit + line.debit
                total_credit = total_credit + line.credit

        payment_dict = {'total_debit': total_debit, 'total_credit': total_credit}

    
        return {
            'doc_ids': docids,
            'doc_model': 'account.payment',
            'docs': docs,
            'payment_dict': payment_dict,
        }