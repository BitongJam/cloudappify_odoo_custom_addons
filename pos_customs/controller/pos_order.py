from odoo import http
from odoo.http import request
from datetime import datetime,timedelta

class PosDashboardController(http.Controller):
    @http.route('/report/get_top_pos_sales_cashier', type='json', auth='user')
    def get_top_pos_sales_cashier(self,end_date):
        query = '''
            SELECT 
                TO_CHAR(SUM(rpo.price_total),'FM999,999,999.00') AS amount, count(*) as order,
                rp.name AS name 
            FROM report_pos_order rpo
            JOIN res_users ru ON ru.id = rpo.user_id 
            JOIN res_partner rp ON rp.id = ru.partner_id
            WHERE rpo.state IN ('paid', 'done', 'invoiced')
        '''

        params=[]
        if end_date:  # If end_date exists, add the condition
            query += """
                AND rpo.date::DATE > %s  -- Greater than from_date
                AND rpo.date::DATE <= CURRENT_DATE -- Less than or equal to to_date
            """
            params.append(end_date)

        query+="""
                GROUP BY rp.name
            order by amount desc ;
            """
        request.cr.execute(query, tuple(params))
        result = request.cr.fetchall()
        
        return result
    
    @http.route('/report/get_top_product_pos_sales', type='json', auth='user') 
    def get_top_product_pos_sales(self):
        query = """
            select pt.name, TO_CHAR(sum(rpo.price_total),'FM999,999,999.00') as price_total,count(*) as order
            from report_pos_order rpo 
            join product_product pp on pp.id = rpo.product_id
            inner join product_template pt on pt.id = pp.product_tmpl_id
            where state in ('paid','done','invoiced') 
            group by pt.name 
            order by price_total desc
            limit 10;
        """

        request.cr.execute(query)
        result = request.cr.fetchall()

        # Ensure a unique ID is added
        # product_sales = [{'id': index + 1, 'name': row[0], 'price_total': row[1]} for index, row in enumerate(result)]

        return result  # Ensure it returns a list of dictionaries with 'id'
    
    @http.route('/report/get_total_sales_per_hour_pos', type='json', auth='user')
    def get_total_sales_per_hour_pos(self,end_date):
        query = """
                SELECT TO_CHAR(rpo.date, 'HH24') AS sale_hour, SUM(rpo.price_total) AS total_sales 
                FROM report_pos_order rpo 
                WHERE rpo.state IN ('paid', 'done', 'invoiced')
            """
            
        params = []
        if end_date:  # If end_date exists, add the condition
            query += """
                AND rpo.date::DATE > %s  -- Greater than from_date
                AND rpo.date::DATE <= CURRENT_DATE -- Less than or equal to to_date
            """
            params.append(end_date)

        query += " GROUP BY sale_hour ORDER BY sale_hour"
    
        request.cr.execute(query ,(end_date,))
        result = request.cr.fetchall()

        format = [{'id':index + 1, 'sale_hour':row[0],'total_sales':row[1]} for index,row in enumerate(result)]
        return format


    
    