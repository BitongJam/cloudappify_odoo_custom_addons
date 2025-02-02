/** @odoo-module **/

import Registries from 'point_of_sale.Registries';
import PaymentScreen from 'point_of_sale.PaymentScreen';

const PosOrRefernceButton = (paymentScreen) => class extends paymentScreen{
    setup(){
        super.setup();
        console.log('Pos Official Receipt Reference');
    }

    async posOrReferenceButton(){
        const { confirmed, payload } = await this.showPopup('PosReferencePopup');
        if (confirmed){
            this.currentOrder.setOfficialReceiptRef(payload); 
        }
    
        
        console.log('test: ',this.env.pos.orders);
    }
}

Registries.Component.extend(PaymentScreen,PosOrRefernceButton);