from odoo import _, api, fields, models



class ProductTemplate(models.Model):
    _inherit = 'product.template'

    # overrided
    def _compute_show_qty_status_button(self):
        super()._compute_show_qty_status_button()
        for template in self:
            if template.is_kits:
                template.show_on_hand_qty_status_button = template.product_variant_count < 1
                template.show_forecasted_qty_status_button = False