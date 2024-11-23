/** @odoo-module **/

import  ClosePosPopup  from 'point_of_sale.ClosePosPopup';
import  Registries  from 'point_of_sale.Registries';

const ClosePosPopupExtend = (ClosePosPopup) =>
    class extends ClosePosPopup {
        setup() {
            super.setup(); // Call the parent setup
            this.rpc({
                model :
            });
            this.defaultCashDetails['closing_amount'] = '#######'
        }
    };

// Register the extended popup in the POS Registry
Registries.Component.extend(ClosePosPopup, ClosePosPopupExtend);
