from odoo import models, fields

class PosIncomeReportWizard(models.TransientModel):
    _name = 'pos.summary.discount.tip.report.wizard'
    _description = 'POS Suammary Discount and Tips Report Wizard'

    start_date = fields.Date('Start Date', required=True)
    end_date = fields.Date('End Date', required=True)
    pos_session_id = fields.Many2one('pos.session', string='POS Session')

    def action_generate_report(self):
        # Prepare the domain to filter orders
        # domain = [('date_order', '>=', self.start_date), ('date_order', '<=', self.end_date)]
        
        # if self.pos_session_id:
        #     domain.append(('session_id', '=', self.pos_session_id.id))

        # orders = self.env['pos.order'].search(domain)

        # Create the report data (calculating total discount per order)
        # report_data = []
        # for order in orders:
        #     total_discount = sum(line.discount_amount for line in order.lines)
        #     report_data.append({
        #         'order': order,
        #         'total_discount': total_discount,
        #         'amount_total': order.amount_total,
        #     })

        data = {
            'date_from': self.start_date,
            'date_to': self.end_date,
            'session_id': self.pos_session_id.id
        }

        # Pass the data to the report and generate the PDF
        return self.env.ref('pos_customs.pos_discount_tips_action').report_action(self, data=data)