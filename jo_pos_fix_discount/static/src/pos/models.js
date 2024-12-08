odoo.define("jo_pos_fix_discount.models", function (require) {
    "use strict";

    const { Orderline } = require("point_of_sale.models");
    const Registries = require("point_of_sale.Registries");

    const PosOrderLineFixDiscount = (Orderline) =>
        class extends Orderline {
            initialize(attributes, options) {
                super.initialize(attributes, options);
                this.discountFix = this.discountFix || 0; // Initialize the discountFix field
            }

            //@override
            init_from_JSON(json) {
                super.init_from_JSON(json); // Correctly call the parent method
                this.discountFix = json.discountFix || 0; // Load the discountFix value from JSON
            }

            export_as_JSON() {
                const data = super.export_as_JSON(); // Correctly call the parent method
                data.discountFix = this.discountFix; // Add the custom field
                return data;
            }

            set_discountFix(discount) {
                this.discountFix = discount; // Update the discountFix field
            }
            get_discountFix() {
                return this.discountFix; // Update the discountFix field
            }

            // overrided
            set_discount(discount) {
                super.set_discount(discount); // Call the original set_discount logic
                if (discount > 0) {
                    this.discountFix = 0; // Reset discountFix to 0 if discount is set
                }
                console.log(
                    `Discount set to ${discount}. DiscountFix reset to ${this.discountFix}`
                );
            }

            // overrided
            get_all_prices(qty = this.get_quantity()){
                var fixDiscount = this.get_discountFix()
                var price_unit = this.get_unit_price() * (1.0 - (this.get_discount() / 100.0));
                var taxtotal = 0;
                
                // override price_unit if field discountFix is greater than 0
                if(fixDiscount > 0){
                    price_unit = this.get_unit_price() - fixDiscount
                }

                var product =  this.get_product();
                var taxes_ids = this.tax_ids || product.taxes_id;
                taxes_ids = _.filter(taxes_ids, t => t in this.pos.taxes_by_id);
                var taxdetail = {};
                var product_taxes = this.pos.get_taxes_after_fp(taxes_ids, this.order.fiscal_position);
        
                var all_taxes = this.compute_all(product_taxes, price_unit, qty, this.pos.currency.rounding);
                var all_taxes_before_discount = this.compute_all(product_taxes, this.get_unit_price(), qty, this.pos.currency.rounding);
                _(all_taxes.taxes).each(function(tax) {
                    taxtotal += tax.amount;
                    taxdetail[tax.id] = {
                        amount: tax.amount,
                        base: tax.base,
                    };
                });
        
                return {
                    "priceWithTax": all_taxes.total_included,
                    "priceWithoutTax": all_taxes.total_excluded,
                    "priceWithTaxBeforeDiscount": all_taxes_before_discount.total_included,
                    "priceWithoutTaxBeforeDiscount": all_taxes_before_discount.total_excluded,
                    "tax": taxtotal,
                    "taxDetails": taxdetail,
                    "tax_percentages": product_taxes.map((tax) => tax.amount),
                };
            }
        };

    Registries.Model.extend(Orderline, PosOrderLineFixDiscount);
});
