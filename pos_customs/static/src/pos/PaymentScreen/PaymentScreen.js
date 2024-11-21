/** @odoo-module */

import Registries from "point_of_sale.Registries"
import PaymentScreen from "point_of_sale.PaymentScreen"

const PaymentScreenInherit = (payment_screen) => class extends payment_screen {
    setup(){
        super.setup()
        console.log("Inherited Payment Screen")
    }

    addNewPaymentLine({ detail: paymentMethod }) {
       
        const payment_line = super.addNewPaymentLine({ detail: paymentMethod })
        this.currentOrder.paymentlines[0].transaction_id = "This will be the Payment Reference"
        console.log('current: ',this.currentOrder.paymentlines[0].transaction_id )
        return payment_line
    }

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