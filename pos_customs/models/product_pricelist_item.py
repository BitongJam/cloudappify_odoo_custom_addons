from odoo import fields, models, api

class ProductPricelistItem(models.Model):
    _inherit = 'product.pricelist.item'

    @api.model
    def create(self, vals):
        record = super().create(vals)
        if record.product_tmpl_id:
            record.product_tmpl_id._log_product_pricelist_in_product(
                action="create",
                item=record,
                values=vals,
            )
        return record

    def write(self, vals):
        # capture old values BEFORE updating
        old_values_map = {
            rec.id: {field: rec[field] for field in vals.keys()}
            for rec in self
        }

        res = super().write(vals)

        for record in self:
            if record.product_tmpl_id:
                record.product_tmpl_id._log_product_pricelist_in_product(
                    action="write",
                    item=record,
                    values={field: record[field] for field in vals.keys()},
                    old_values=old_values_map.get(record.id, {}),
                )
        return res

    def unlink(self):
        for record in self:
            if record.product_tmpl_id:
                record.product_tmpl_id._log_product_pricelist_in_product(
                    action="unlink",
                    item=record,
                    values={},
                )
        return super().unlink()
