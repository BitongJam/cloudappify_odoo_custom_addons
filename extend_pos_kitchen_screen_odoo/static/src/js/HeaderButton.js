/** @odoo-module **/
import HeaderButton from 'point_of_sale.HeaderButton'
import Registries from 'point_of_sale.Registries';
const rpc = require('web.rpc');
const { Gui } = require('point_of_sale.Gui');
var core = require('web.core');
var _t = core._t;

export const KitchenPosComponentInh = (HeaderButton) =>
    class extends HeaderButton{
        setup() {
            super.setup();
        }

        async onClick() {
            const orderName = this.env.pos.selectedOrder.name;

            // Perform RPC call to check the order
            const result = await rpc.query({
                model: 'pos.order',
                method: 'check_order',
                args: [[], orderName],
            });

            // If food is not ready, show the popup
            if (result === true) {
                await Gui.showPopup('ErrorPopup', {
                    title: _t('Food is not ready'),
                    body: _t('Please complete all the food first.'),
                });
                return; // Stop execution
            }

            // If food is ready, call the original closeSession method
          
            await super.onClick()
        }
    }
    Registries.Component.extend(HeaderButton,KitchenPosComponentInh);
