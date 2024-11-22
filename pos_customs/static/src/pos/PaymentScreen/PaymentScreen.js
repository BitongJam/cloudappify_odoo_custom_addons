/** @odoo-module */

import Registries from "point_of_sale.Registries";
import PaymentScreen from "point_of_sale.PaymentScreen";

const PaymentScreenInherit = (payment_screen) =>
    class extends payment_screen {
        setup() {
            super.setup();
            console.log("Inherited Payment Screen");
        }

        async payment_ref() {
            console.log("You clicked to add a payment reference.");
            
            const selectedPaymentline = this.currentOrder.selected_paymentline;
            if (!selectedPaymentline) {
                console.warn("No selected payment line found.");
                return;
            }

            // Show a popup to collect transaction_id
            const { confirmed, payload: transactionId } = await this.showPopup('TextInputPopup', {
                title: this.env._t('Payment Reference'),
                startingValue: selectedPaymentline.transaction_id || '',
            });

            if (confirmed) {
                // Set the transaction_id on the selected payment line
                selectedPaymentline.transaction_id = transactionId;
                console.log("Transaction ID updated:", transactionId);
            }
        }
    };

// Extend the PaymentScreen component
Registries.Component.extend(PaymentScreen, PaymentScreenInherit);
