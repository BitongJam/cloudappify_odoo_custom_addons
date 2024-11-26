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
                result.product_categ = product.categ ? product.categ.name : 'No category'; // Safeguard for undefined categories
                // Return the modified result
                return result;
            }
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
