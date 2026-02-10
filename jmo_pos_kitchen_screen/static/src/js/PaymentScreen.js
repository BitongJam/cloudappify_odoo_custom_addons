/** @odoo-module **/
import PaymentScreen from 'point_of_sale.PaymentScreen';
import Registries from 'point_of_sale.Registries';

const JmoPosKitchenScreenPaymentScreen = (PaymentScreen) =>
    class extends PaymentScreen {

        //@override
        async validateOrder(isForceValidate) {
            // console.log("Inherit from  jmr_pos_kitchen_screen");
            return super.validateOrder(...arguments);
            
        }
    };
Registries.Component.extend(PaymentScreen, JmoPosKitchenScreenPaymentScreen);