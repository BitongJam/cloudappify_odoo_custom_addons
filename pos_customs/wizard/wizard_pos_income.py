from odoo import models, fields

class PosIncomeReportWizard(models.TransientModel):
    _name = 'pos.income.report.wizard'
    _description = 'POS Income Report Wizard'

    date_from = fields.Date(string="Start Date", required=True)
    date_to = fields.Date(string="End Date", required=True)

    def generate_report(self):
        # Prepare data for the report (date range and payment method grouping)
        data = {
            'date_from': self.date_from,
            'date_to': self.date_to,
        }
        return self.env.ref('pos_customs.pos_income_report_action').report_action(self, data=data)
