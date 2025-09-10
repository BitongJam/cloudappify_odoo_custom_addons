from odoo import fields, models, api


class ProductPricelist(models.Model):
    _name = "product.pricelist"
    _inherit = ['product.pricelist', 'mail.thread', 'mail.activity.mixin']

    def _log_item_change(self, action, item, values, old_values=None):
        """Helper to log changes on pricelist items into chatter of pricelist"""
        product_name = item.product_id.display_name or item.product_tmpl_id.display_name or "N/A"

        if action == "create":
            msg = (
                f"➕ Added pricelist item for <b>{product_name}</b> "
                f"(Min Qty: {item.min_quantity}, Price: {item.fixed_price})"
            )

        elif action == "write":
            changes = []
            old_values = old_values or {}
            for field, new_val in values.items():
                old_val = old_values.get(field)
                if old_val != new_val:
                    changes.append(f"{field}: <b>{old_val}</b> → <b>{new_val}</b>")

            if changes:
                msg = f"✏️ Updated pricelist item for <b>{product_name}</b><br/>{'<br/>'.join(changes)}"
            else:
                msg = f"✏️ Pricelist item for <b>{product_name}</b> was updated (no tracked fields)."

        elif action == "unlink":
            msg = f"❌ Removed pricelist item for <b>{product_name}</b>"

        else:
            msg = "Unknown action on pricelist item."

        self.message_post(body=msg)


class ProductPricelistItem(models.Model):
    _inherit = 'product.pricelist.item'

    @api.model
    def create(self, vals):
        record = super().create(vals)
        if record.pricelist_id:
            record.pricelist_id._log_item_change(
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
            if record.pricelist_id:
                record.pricelist_id._log_item_change(
                    action="write",
                    item=record,
                    values={field: record[field] for field in vals.keys()},
                    old_values=old_values_map.get(record.id, {}),
                )
        return res

    def unlink(self):
        for record in self:
            if record.pricelist_id:
                record.pricelist_id._log_item_change(
                    action="unlink",
                    item=record,
                    values={},
                )
        return super().unlink()
