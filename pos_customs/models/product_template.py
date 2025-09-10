from odoo import _, api, fields, models



class ProductTemplate(models.Model):
    _inherit = 'product.template'

    display_name_w_tag = fields.Char(compute="_compute_display_name_w_tag")
    

    def _compute_display_name_w_tag(self):
        for rec in self:
            product_name = rec.name

            # Initialize prod_tags as an empty string
            prod_tags = ""
            if rec.product_tag_ids:
                for t in rec.product_tag_ids:
                    prod_tags += t.name + ' '
                    # Remove the trailing space and update product_name if prod_tags is not empty
            
                if prod_tags.strip():
                    product_name += '[%s]' % prod_tags.strip()
            else:
                product_name='no_tag'

            

            rec.display_name_w_tag = product_name

    # overrided
    def _compute_show_qty_status_button(self):
        super()._compute_show_qty_status_button()
        for template in self:
            if template.is_kits:
                template.show_on_hand_qty_status_button = template.product_variant_count < 1
                template.show_forecasted_qty_status_button = False