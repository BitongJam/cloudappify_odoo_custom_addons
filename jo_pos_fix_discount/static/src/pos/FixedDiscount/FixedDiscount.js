odoo.define('jo_pos_fix_discount.FixedDisountButton',function(require){
    "use strict";

    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const ProductScreen = require('point_of_sale.ProductScreen');
 



    class FixedDisountButton extends PosComponent{
        setup(){
            super.setup();
            console.log("Load FixedDiscountButton")
        }

        async onClick() {
            const selectedOrderline = this.env.pos.get_order().get_selected_orderline();
            console.log("selected: ",selectedOrderline)
            if (!selectedOrderline) return;

            const { confirmed, payload: inputNumber } = await this.showPopup('NumberPopup', {
                title: this.env._t('Enter Discount Amount'),
                startingValue: 0, // Default value in the input
                isInputSelected: true, // Auto-select input for user convenience
            });

            // Process the result if the user confirmed
            if (confirmed) {
                const discount = parseFloat(inputNumber);
                if (!isNaN(discount)) {
                    console.log(`Applying Discount: ${discount}`);
                    if (discount > 0){
                        selectedOrderline.set_discount(false);
                    }

                    
                    selectedOrderline.set_discountFix(discount); // Replace with your discount logic
                } else {
                    await this.showPopup('ErrorPopup', {
                        title: this.env._t('Invalid Input'),
                        body: this.env._t('Please enter a valid number.'),
                    });
                }
            }
        }
    }

    FixedDisountButton.template = 'FixedDiscountButton'

    ProductScreen.addControlButton({
        component: FixedDisountButton,
        condition: function() {
            return true
        },
    });





    Registries.Component.add(FixedDisountButton);
    return FixedDisountButton
})