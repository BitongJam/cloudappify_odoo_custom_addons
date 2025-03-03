from odoo import _, api, fields, models



class PosConfig(models.Model):
    _inherit = 'pos.config'

    @api.model
    def get_pos_config_total_sale(self):
        group_data = self.env['report.pos.order'].read_group(
            domain=[('state','not in',('draft','cancel'))],  # No filters
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

