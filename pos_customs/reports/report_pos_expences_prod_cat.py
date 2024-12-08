from odoo import models, api
import logging


_logger = logging.getLogger(__name__)



class ReportProductCategoryExpenses(models.AbstractModel):
    _name = 'report.pos_customs.report_pos_expenses_by_category'
    _description = 'POS Expenses by Product Category Report'

    @api.model
    def _compute_category_expenses(self, start_date=None, end_date=None):
        """Compute overall expenses per product category based on vendor bills."""
        # Log start of method
        _logger.debug("Entering _get_report_values")
        # Define the domain to filter invoice lines
        domain = [('move_id.move_type', '=', 'in_invoice'),  # Only vendor bills
                  ('move_id.state', '=', 'posted')]  # Consider only posted bills
        if start_date:
            domain.append(('move_id.invoice_date', '>=', start_date))
        if end_date:
            domain.append(('move_id.invoice_date', '<=', end_date))

        # Search for invoice lines
        invoice_lines = self.env['account.move.line'].search(domain)

        # Aggregate expenses by product category
        category_expenses = {}

        for line in invoice_lines:
            category = line.product_id.categ_id
            if not category:
                continue
            if category.id not in category_expenses:
                category_expenses[category.id] = {
                    'name': category.name or "Uncategorized",
                    'expenses': 0.0
                }
            category_expenses[category.id]['expenses'] += line.price_subtotal

        # Return results as a list of dictionaries
        return list(category_expenses.values())


    @api.model
    def _get_report_values(self, docids, data=None):
        """Provide data for the QWeb report."""
        # Ensure `data` is not None and contains start_date and end_date
        if not data or 'start_date' not in data or 'end_date' not in data:
            data = {'start_date': '2000-01-01', 'end_date': '2100-12-31'}  # Default range

        categories = self._compute_category_expenses(data['start_date'], data['end_date'])
        return {
            'doc_ids': docids,
            'doc_model': 'pos.expenses.wizard',
            'data_categories': categories or [],  # Ensure `categories` is always a list
        }
