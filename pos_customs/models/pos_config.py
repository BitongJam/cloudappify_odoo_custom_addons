from odoo import _, api, fields, models
from datetime import datetime,timedelta


class PosConfig(models.Model):
    _inherit = 'pos.config'

    @api.model
    def get_pos_config_total_sale(self,period=False,session=False,pos=False,responsible=False,product=False):
        domain = [('state','not in',('draft','cancel'))]
        if period:
            today = datetime.now().date()
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

            domain.append(('date', '>', from_date))
            domain.append( ('date', '<=', today))
    
        if session:
           domain.append(('session_id','=',session))

        if pos:
           domain.append(('config_id','=',pos))

        if responsible:
            domain.append(('user_id','=',responsible))

        if product:
            domain.append(('product_id','=',product))

        group_data = self.env['report.pos.order'].read_group(
            domain=domain,  # No filters
            fields=['config_id', 'price_total:sum'],  # Correct field names
            groupby=['config_id'],  # ✅ Corrected from `group_by` to `groupby`
            lazy=False  # To return all groups at once
        )

        # Extracting both config_id.id and config_id.name
        formatted_data = [
            {
                'config_id': rec['config_id'][0],  # ID
                'config_name': rec['config_id'][1].split('(')[0].strip(),  # Extract clean name no extended
                'total_sales': "{:,.2f}".format(rec['price_total']),
                'do_not_display': False if rec['price_total'] != 0 else True
            }
            for rec in group_data
        ]

        return formatted_data

