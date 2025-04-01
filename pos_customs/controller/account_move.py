from odoo import http,tools
from collections import defaultdict
from odoo.http import request


class SaleReport(http.Controller):
    @http.route('/report/overallExpensesProdCateg', type='json', auth='user')
    def get_overall_expences_per_product_category(self):
        invoice_lines =  http.request.env['account.move.line'].search([('move_id.move_type', '=', 'in_invoice'),  # Only vendor bills
                  ('move_id.state', '=', 'posted')], [])
        
        category_expenses = {}
        currency = http.request.env.user.company_id.currency_id
        currency_symbol = currency.symbol
        currency_position = currency.position  # Currency position (before or after amount)

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

        formatted_expenses = []
        for category_id, data in category_expenses.items():
            formatted_amount = "{:,.2f}".format(data['expenses'])
            if currency_position == 'before':
                formatted_expenses.append({
                    'name': data['name'],
                    'expenses': f"{currency_symbol} {formatted_amount}"
                })
            else:  # Default to 'after'
                formatted_expenses.append({
                    'name': data['name'],
                    'expenses': f"{formatted_amount} {currency_symbol}"
                })
    

        # raise UserWarning(formatted_expenses)
        # Return results as a list of dictionaries
        return formatted_expenses

    @http.route('/report/posIncomeReport', type='json', auth='user')    
    def get_report_dashboard_pos_income(self):


        pos_payments = http.request.env['pos.payment'].search([])
        currency = http.request.env.user.company_id.currency_id
        currency_symbol = currency.symbol
        currency_position = currency.position  # Currency position (before or after amount)

        # Group income by payment method
        income_by_method = defaultdict(float)
        for payment in pos_payments:
            income_by_method[payment.payment_method_id.name] += payment.amount

        # Prepare the data to pass to the template
        grouped_income = [{'payment_method': method, 'income': income} for method, income in income_by_method.items()]

        formatted_income = []
        for l in grouped_income:
            formatted_amount = "{:,.2f}".format(l['income'])
            if currency_position == 'before':
                formatted_income.append({
                    'payment_method': l['payment_method'],
                    'income': f"{currency_symbol} {formatted_amount}"
                })
            else:  # Default to 'after'
                formatted_income.append({
                    'payment_method':  l['payment_method'],
                    'income': f"{formatted_amount} {currency_symbol}"
                })

        return formatted_income
    
    @http.route('/report/getBankCashJournal', type='json', auth='user')
    def get_bank_and_cash_journal(self):
        ret = []
        val = http.request.env['account.journal'].search([('type','in',('cash','bank'))])

        ttal_net_ttal = 0
        for j in val:
            #get income base on journal
            account_id = j.default_account_id
            income = http.request.env["account.move.line"].search([('journal_id','=',j.id),('account_id.account_type','=','asset_receivable'),('move_id.state','=','posted'),('reconciled','=',True)])
            income = sum(i.credit for i in income)

            expense = http.request.env["account.move.line"].search([('journal_id','=',j.id),('account_id.account_type','=','liability_payable'),('move_id.state','=','posted'),('reconciled','=',True)])
            expense= sum(e.debit for e in expense)
            total = income-expense
            ttal_net_ttal = ttal_net_ttal + total
            formatted_income = "{:,.2f}".format(income)
            formatted_expense = "{:,.2f}".format(expense)
            formatted_total = "{:,.2f}".format(total)
            formatted_ttal_net_ttal = "{:,.2f}".format(ttal_net_ttal)
            currency_id = j.currency_id if j.currency_id else  http.request.env.user.company_id.currency_id

            if currency_id.position == 'before':
                formatted_income =  f"{currency_id.symbol} {formatted_income}"
                formatted_expense =  f"{currency_id.symbol} {formatted_expense}"
                formatted_total =  f"{currency_id.symbol} {formatted_total}"
                formatted_ttal_net_ttal =  f"{currency_id.symbol} {formatted_ttal_net_ttal}"
            else:
                formatted_income =  f"{formatted_income} {currency_id.symbol}"
                formatted_expense =  f"{formatted_expense} {currency_id.symbol}"
                formatted_total =  f"{formatted_total} {currency_id.symbol}"
                formatted_ttal_net_ttal =  f"{formatted_ttal_net_ttal} {currency_id.symbol}"

            
            ret.append({
                'payment_method': j.name,
                'income': formatted_income,
                'expense':formatted_expense,
                'total':formatted_total

            })
        ret.append({
                'payment_method': 'Total: ',
                'income': False,
                'expense':False,
                'total':formatted_ttal_net_ttal

            })
        return ret
    
    @http.route('/report/getTopSessionDiscount', type='json', auth='user')
    def get_top_session_discount(self):
        # List to store the result
        ret = []
        
        # Fetch top 5 sessions ordered by total_discount in descending order
        session_ids = http.request.env['pos.session'].search([], limit=8, order="total_discount desc")


        # Prepare the result list with session details
        for session in session_ids:
            discount = session.total_discount
            formatted_discount = "{:,.2f}".format(discount)
            currency_id = http.request.env.user.company_id.currency_id
            
            if currency_id.position == 'before':
                formatted_discount =  f"{currency_id.symbol} {formatted_discount}"
            else:
                formatted_discount =  f"{formatted_discount} {currency_id.symbol}"


            ret.append({
                'session': session.name,  # Name of the session
                'total_discount':  formatted_discount # Discount amount
            })
        
        # Return the result as JSON
        return ret




    @http.route('/report/get_product_category_expenses', type='json', auth='user')
    def get_product_category_expenses(self,end_date):
        query = """
            SELECT pc.name,SUM(aml.debit) as total_expense, TO_CHAR(SUM(aml.debit),'FM999,999,999.00') AS str_total_expense,count(*) as order
            FROM account_move_line aml
            JOIN product_product pp ON pp.id = aml.product_id
            JOIN product_template pt ON pt.id = pp.product_tmpl_id
            JOIN product_category pc ON pc.id = pt.categ_id
            JOIN account_move am ON am.id = aml.move_id
            WHERE am.move_type = 'in_invoice' AND am.state = 'posted'-- Only vendor bills 
            
        """
        params=[]
        if end_date:  # If end_date exists, add the condition
            query += """
                AND am.date::DATE >= %s  -- Greater than from_date
                AND am.date::DATE <= CURRENT_DATE -- Less than or equal to to_date
            """
            params.append(end_date)
        
        query +="""
            GROUP BY pc.name
            ORDER BY total_expense DESC;
        """
        request.cr.execute(query,tuple(params))
        result = request.cr.fetchall()

        # Return data with unique IDs
        category_expenses = [{'id': index + 1, 'category': row[0], 'str_total_expense': row[2],'order':row[3]} for index, row in enumerate(result)]
        
        return category_expenses
