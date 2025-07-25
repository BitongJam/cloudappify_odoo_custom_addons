from odoo import http
from odoo.http import request
from datetime import datetime,timedelta

class PosDashboardController(http.Controller):
    @http.route('/report/get_discount_tips_data', type='json', auth='user')
    def get_discount_tips_data(self,period=False,session=False,pos=False,responsible=False,product=False):
        domain = []
        if period:

            today = datetime.now()
            print('test today: ', today)
            from_date = today

            if period == 1:
                from_date = today
                
            elif period == 7:
                from_date = today - timedelta(days=7)
            elif period == 30:
                from_date = today - timedelta(days=30)
            elif period == 90:
                from_date = today - timedelta(days=90)
            elif period == 365:
                from_date = today - timedelta(days=365)
            
            
            from_date = from_date.replace(hour=0, minute=0, second=0, microsecond=0)
            # from_date = from_date - timedelta(hours=8)
            # from_date = from_date.replace(hour=0, minute=0, second=0, microsecond=0)
            from_date_str = from_date.strftime('%Y-%m-%d %H:%M:%S')
            today_str = today.strftime('%Y-%m-%d %H:%M:%S')

            domain.append(('date', '>=', from_date_str))
            # domain.append(('order_id.date_order', '<=', today_str))

        if session:
            domain.append(('order_id.session_id','=',session))

        if pos:
            domain.append(('order_id.config_id','=',pos))

        if responsible:
            domain.append(('order_id.user_id','=',responsible))

        if product:
            domain.append(('product_id','=',product))

        # disc = request.env['pos.order.line'].read_group(domain,['discount_amount'],[])
        disc = request.env['report.pos.order'].read_group(domain, ['total_discount:sum'],['total_discount'])
        tips = 0
        discount_amount = sum(rec.get('total_discount', 0) for rec in disc)        # discount_amount = disc[0].get('total_discount', 0) or 0
        discount_amount_str = f"{discount_amount:,.2f}"
        val = {'disc_amount':discount_amount,'str_disc_amount':discount_amount_str,'tips_amount':tips}
        return val

    @http.route('/report/get_top_pos_sales_cashier', type='json', auth='user')
    def get_top_pos_sales_cashier(self,end_date = False,session=False,pos=False,responsible=False,product=False):
        query = '''
            SELECT 
                TO_CHAR(SUM(rpo.price_total),'FM999,999,999.00') AS amount, COUNT(DISTINCT rpo.order_id) AS order,
                rp.name AS name,SUM(rpo.price_total) AS actual_amount
            FROM report_pos_order rpo
            JOIN res_users ru ON ru.id = rpo.user_id 
            JOIN res_partner rp ON rp.id = ru.partner_id
            WHERE rpo.state IN ('paid', 'done', 'invoiced')
        '''

        params=[]
        if end_date:  # If end_date exists, add the condition
            query += """
                AND rpo.date >= %s  -- Greater than from_date
            """
            params.append(end_date)

        if session:
            query +="""
                AND rpo.session_id = %s
            """
            params.append(session)

        if pos:
            query +="""
                AND rpo.config_id = %s
            """
            params.append(pos)

        if responsible:
            query +="""
                AND rpo.user_id = %s
            """
            params.append(responsible)

        if product:
            query +="""
                AND rpo.product_id = %s
            """
            params.append(product)

        query+="""
                GROUP BY rp.name
            order by actual_amount desc ;
            """
        request.cr.execute(query, params)
        result = request.cr.fetchall()
        
        return result
    
    @http.route('/report/get_top_product_pos_sales', type='json', auth='user') 
    def get_top_product_pos_sales(self,end_date = False,session=False,pos=False,responsible=False,product=False):
        query = """
            SELECT 
                ROW_NUMBER() OVER () AS id,
                pt.name AS product_name,
                STRING_AGG(DISTINCT ptg.name->>'en_US', ', ') AS product_tags,  -- Extract 'en_US' value and remove duplicates
                SUM(rpo.price_total) AS price_total,
                TO_CHAR(SUM(rpo.price_total), 'FM999,999,999.00') AS str_price_total,
                COUNT(*) AS order_count,
                SUM(rpo.product_qty) AS qty
            FROM report_pos_order rpo
            JOIN product_product pp ON pp.id = rpo.product_id
            JOIN product_template pt ON pt.id = pp.product_tmpl_id
            JOIN product_tag_product_template_rel ptptr ON ptptr.product_template_id = pt.id
            JOIN product_tag ptg ON ptg.id = ptptr.product_tag_id
            WHERE rpo.state IN ('paid', 'done', 'invoiced') 

        """

        params = []
        if end_date:  # If end_date exists, add the condition
            query += """
                AND rpo.date >= %s
            """
            params.append(end_date)

        if session:
            query +="""
                AND rpo.session_id = %s
            """
            params.append(session)

        if pos:
            query +="""
                AND rpo.config_id = %s
            """
            params.append(pos)

        if responsible:
            query +="""
                AND rpo.user_id = %s
            """
            params.append(responsible)

        if product:
            query +="""
                AND rpo.product_id = %s
            """
            params.append(product)

        query += """
            group by pt.name,pp.id
            order by price_total desc
            limit 10;
        """
        request.cr.execute(query,params)
        result = request.cr.fetchall()

        format = [{'id': row[0], 'product': row[1].get('en_US','Unkwn Product')+" (%s)"%row[2], 'qty': row[6],'revenue':row[4]} for index,row in enumerate(result)]
        return format
        # Ensure a unique ID is added
        # product_sales = [{'id': index + 1, 'name': row[0], 'price_total': row[1]} for index, row in enumerate(result)]
    
    @http.route('/report/get_total_sales_per_hour_pos', type='json', auth='user')
    def get_total_sales_per_hour_pos(self, end_date = False,session=False,pos=False,responsible=False,product=False):
        # Get the logged-in user's timezone
        user_tz = request.env.user.tz or 'UTC'  # Default to UTC if not set

        query = """
            SELECT TO_CHAR(
                (rpo.date AT TIME ZONE 'UTC' AT TIME ZONE %s), 'HH24'
            ) AS sale_hour, 
            SUM(rpo.price_total) AS total_sales
            FROM report_pos_order rpo
            WHERE rpo.state IN ('paid', 'done', 'invoiced')
        """

        params = [user_tz]  # Store the user's timezone as a query parameter

        if end_date:  # If end_date exists, add the condition
            query += """
                AND rpo.date >= %s  -- Greater than from_date
               -- AND rpo.date::DATE <= CURRENT_DATE -- Less than or equal to to_date
            """
            params.append(end_date)

        if session:
            query +="""
                AND rpo.session_id = %s
            """
            params.append(session)

        if pos:
            query +="""
                AND rpo.config_id = %s
            """
            params.append(pos)

        if responsible:
            query +="""
                AND rpo.user_id = %s
            """
            params.append(responsible)

        if product:
            query +="""
                AND rpo.product_id = %s
            """
            params.append(product)


        query += " GROUP BY sale_hour ORDER BY sale_hour"

        request.env.cr.execute(query, params)  # Execute query with parameters
        result = request.env.cr.fetchall()

        format = [{'id': index + 1, 'sale_hour': row[0], 'total_sales': row[1]} for index, row in enumerate(result)]
        return format

    @http.route('/report/get_pos_product_list', type='json', auth='user')
    def get_pos_product_list(self):
        query = """
            select pp.id as product_id,pt.name as product_name from product_product pp 
            join product_template pt on pt.id = pp.product_tmpl_id 
            where pt.available_in_pos = true 
        """

        request.env.cr.execute(query)
        result = request.env.cr.fetchall()
        format = [{'id':row[0],'name':row[1]} for row in result]
        return format


    
    