from odoo import _, api, fields, models,Command



class ProductTemplate(models.Model):
    _inherit = 'product.template'

    display_name_w_tag = fields.Char(compute="_compute_display_name_w_tag")

    list_price = fields.Float(tracking=True)
    available_in_pos = fields.Boolean(tracking=True)
    property_account_expense_id = fields.Many2one(tracking=True)
    asset_category_id = fields.Many2one(tracking=True)
    property_account_creditor_price_difference = fields.Many2one(tracking=True)
    property_account_income_id = fields.Many2one(tracking=True)
    property_stock_production = fields.Many2one(tracking=True)
    property_stock_inventory = fields.Many2one(tracking=True)
    sale_ok = fields.Boolean(tracking=True)
    purchase_ok = fields.Boolean(tracking=True)
    taxes_id = fields.Many2many(tracking=True)
    categ_id = fields.Many2one(tracking=True)

    # This will allow many2many or one2many field will be track inside the model
    def _mail_track(self, tracked_fields, initial_values):
        changes, tracking_value_ids = super()._mail_track(tracked_fields, initial_values)
        # Many2many tracking
        if len(changes) > len(tracking_value_ids):
            for changed_field in changes:
                if tracked_fields[changed_field]['type'] in ['one2many', 'many2many']:
                    field = self.env['ir.model.fields']._get(self._name, changed_field)
                    vals = {
                        'field': field.id,
                        'field_desc': field.field_description,
                        'field_type': field.ttype,
                        'tracking_sequence': field.tracking,
                        'old_value_char': ', '.join(initial_values[changed_field].mapped('name')),
                        'new_value_char': ', '.join(self[changed_field].mapped('name')),
                    }
                    tracking_value_ids.append(Command.create(vals))
        return changes, tracking_value_ids

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

    def _log_product_pricelist_in_product(self, action, item, values, old_values=None):
        """Helper to log changes on pricelist items into chatter of product"""
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