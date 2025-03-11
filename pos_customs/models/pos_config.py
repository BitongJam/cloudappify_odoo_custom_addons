from odoo import _, api, fields, models



class PosConfig(models.Model):
    _inherit = 'pos.config'

    @api.model
    def get_pos_config_total_sale(self,period):
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
                'total_sales': "{:,.2f}".format(rec['price_total'])
            }
            for rec in group_data
        ]

        return formatted_data

