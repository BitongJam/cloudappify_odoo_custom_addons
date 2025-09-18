/** @odoo-module **/
import ProductScreen from 'point_of_sale.ProductScreen';
import Registries from 'point_of_sale.Registries';
const rpc = require('web.rpc');
const { Gui } = require('point_of_sale.Gui');
var core = require('web.core');
var _t = core._t;


export const PosCustomProductScreen = (ProductScreen) => class extends ProductScreen {
    setup() {
        super.setup();
    }
    async _onClickPay() {
        const order = this.env.pos.get_order();  // Get the current order
        if (!order || order.get_orderlines().length === 0) {
            // If no order or empty cart, show a warning
            this.showNotification('Your cart is empty. Please add products before proceeding to payment.');
        } else {

            return super._onClickPay(...arguments);
        }

        // 🔁 Call original function

    }
    showNotification(message) {
        this.showPopup('ErrorPopup', {
            title: 'Warning',
            body: message,
            color: 'danger',
        });
    }
};



Registries.Component.extend(ProductScreen, PosCustomProductScreen);
