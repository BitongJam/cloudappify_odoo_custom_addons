
from odoo import models, fields, api

class POSExpensesWizard(models.TransientModel):
    _name = 'pos.expenses.wizard'
    _description = 'Wizard to Generate POS Expenses Report'

    start_date = fields.Date(string="Start Date", required=True)
    end_date = fields.Date(string="End Date", required=True)

    def action_generate_report(self):
        """Generate the report based on the selected date range."""
        data = {
            'start_date': self.start_date,
            'end_date': self.end_date,
        }
        return self.env.ref('pos_customs.action_report_pos_expenses_by_category').report_action(None, data=data)
