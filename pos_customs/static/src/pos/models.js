odoo.define('pos_customs.pos_extension', function (require) {
    "use strict";

    const { Orderline,Order,PosGlobalState } = require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');

    const PosOrderlinesCustoms = (Orderline) =>
        class PosOrderlinesCustoms extends Orderline {
            export_for_printing() {
                // Call the parent method and get the result
                const result = super.export_for_printing();

                // Add custom logic: Add product category to the result
                const product = this.get_product();
                result.product_categ_id = product.categ ? product.categ.id : false;
                result.product_categ = product.categ ? product.categ.name : 'No category'; // Safeguard for undefined categories
                result.display_name_w_tag = product.display_name_w_tag
                result.product_display_name = product.name

                // Return the modified result
                return result;
            }

            // // overrided
            // get_all_prices(qty = this.get_quantity()){
            //     var price_unit = this.get_unit_price()
            //     var taxtotal = 0;
        
            //     var product =  this.get_product();
            //     var taxes_ids = this.tax_ids || product.taxes_id;
            //     taxes_ids = _.filter(taxes_ids, t => t in this.pos.taxes_by_id);
            //     var taxdetail = {};
            //     var product_taxes = this.pos.get_taxes_after_fp(taxes_ids, this.order.fiscal_position);
        
            //     var all_taxes = this.compute_all(product_taxes, price_unit, qty, this.pos.currency.rounding);
            //     var all_taxes_before_discount = this.compute_all(product_taxes, price_unit, qty, this.pos.currency.rounding);
            //     _(all_taxes.taxes).each(function(tax) {
            //         taxtotal += tax.amount;
            //         taxdetail[tax.id] = {
            //             amount: tax.amount,
            //             base: tax.base,
            //         };
            //     });
        
            //     return {
            //         "priceWithTax": all_taxes.total_included - this.get_discount(),
            //         "priceWithoutTax": all_taxes.total_excluded - this.get_discount(),
            //         "priceWithTaxBeforeDiscount": all_taxes_before_discount.total_included,
            //         "priceWithoutTaxBeforeDiscount": all_taxes_before_discount.total_excluded,
            //         "tax": taxtotal,
            //         "taxDetails": taxdetail,
            //         "tax_percentages": product_taxes.map((tax) => tax.amount),
            //     };
            // }

            // // overrided
            // // remove the constraint on minimum 0 to max 100
            // set_discount(discount){
            //     // var parsed_discount = typeof(discount) === 'number' ? discount : isNaN(parseFloat(discount)) ? 0 : field_utils.parse.float('' + discount);
            //     var disc = discount;
            //     this.discount = disc;
            //     this.discountStr = '' + disc;
            // }
        };

    const PosOrderCustoms = (Order) => class PosOrderCustoms extends Order{
        export_for_printing() {
            // Call the parent method and get the result
            const result = super.export_for_printing();

          
            result.totat_qty = this.get_total_qty() + 'x' // Safeguard for undefined categories            // Return the modified result
            return result;
        }

        get_total_qty(){
            return this.orderlines.reduce((function(sum, orderLine){
                return sum + orderLine.get_quantity();
            }), 0)
        }
    }

    const PosGlobalStateCustoms = (PosGlobalState) => class PosGlobalStateCustoms extends PosGlobalState{
        // Override
        format_currency(amount, precision) {
            amount = this.format_currency_no_symbol(amount, precision, this.currency);
    
            if (this.currency.position === 'after') {
                return (this.currency.symbol || '')+ ' ' + amount ;
            } else {
                return (this.currency.symbol || '')+ ' ' + amount ;
            }
        }
    }

    Registries.Model.extend(Orderline, PosOrderlinesCustoms);
    Registries.Model.extend(Order, PosOrderCustoms);
    Registries.Model.extend(PosGlobalState, PosGlobalStateCustoms);
});
