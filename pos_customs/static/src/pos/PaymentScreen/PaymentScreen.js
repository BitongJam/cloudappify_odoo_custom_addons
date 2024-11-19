/** @odoo-module */

import Registries from "point_of_sale.Registries"
import PaymentScreen from "point_of_sale.PaymentScreen"

const PaymentScreenInherit = (payment_screen) => class extends payment_screen {
    setup(){
        super.setup()
        console.log("Inherited Payment Screen")
    }

    // addNewPaymentLine({ detail: paymentMethod }) {
    //     const payment_line = super.addNewPaymentLine({ detail: paymentMethod })
    //     console.log("Inherited add new payment line")
    //     return payment_line
    // }

    async payment_ref(){
        console.log("You clicked next from payment assscreen.")
        const selectedOrderline = this.env.pos.get_order().get_selected_orderline();
            if (!selectedOrderline) return;

            const { confirmed, payload: inputNote } = await this.showPopup('TextAreaPopup', {
                startingValue: selectedOrderline.get_customer_note(),
                title: this.env._t('Payment Reference'),
            });

            if (confirmed) {
                selectedOrderline.set_customer_note(inputNote);
            }
    }
}

Registries.Component.extend(PaymentScreen, PaymentScreenInherit)