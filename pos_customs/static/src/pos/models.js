odoo.define('pos_customs.pos_extension', function (require) {
    "use strict";

    const { Orderline } = require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');

    const PosOrderlinesCustoms = (Orderline) =>
        class PosOrderlinesCustoms extends Orderline {
            export_for_printing() {
                // Call the parent method and get the result
                const result = super.export_for_printing();

                // Add custom logic: Add product category to the result
                const product = this.get_product();
                result.product_categ = product.categ ? product.categ.name : 'No category'; // Safeguard for undefined categories
                result.main_product_name = product ? product.product_tmpl_id.name : 'No Product'; 
                // Return the modified result
                return result;
            }
        };

    Registries.Model.extend(Orderline, PosOrderlinesCustoms);
});
