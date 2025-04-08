odoo.define('pos_customs.OrderLineDetailsJarlwing', function (require) {
    "use strict";

    const OrderlineDetails = require('point_of_sale.OrderlineDetails');
    const Registries = require('point_of_sale.Registries');

    const OrderLineDetailsJarlwing = (OrderlineDetails) => class extends OrderlineDetails {
        get line() {
            // Access the original line getter using `super.line`
            const result = super.line;
            const line = this.props.line;
            // Add a new property to the result
            result.productNameWTag = line.get_product().display_name_w_tag;

            return result;
        }

        get productNameWTag() {
            return this.line.productNameWTag;
        }
    };

    // Register the extended component
    Registries.Component.extend(OrderlineDetails, OrderLineDetailsJarlwing);

    return OrderLineDetailsJarlwing;
});
