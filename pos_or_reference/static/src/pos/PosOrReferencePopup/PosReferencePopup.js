odoo.define('pos_or_reference.PosReferencePopup',function(require){
    'use strict';

    const AbstractAwaitablePopup =  require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');

    const {useState } = owl;

    class PosReferencePopup extends AbstractAwaitablePopup{
        setup(){
            super.setup();
            this.state = useState({
                official_receipt:''
            }) 
        }

        getPayload(){
            return this.state.official_receipt;
        }

        validateInput(){
            if (this.state.official_receipt.trim() === ''){
                this.showPopup('ErrorPopup',{
                    title: 'Null Value',
                    body: 'Official Receipt is Required'
                });
                return false
            }
            return true
        }

        async confirm(){
            if (this.validateInput()){
                super.confirm()
            }
        }

    };
    PosReferencePopup.template = 'PosReferencePopup'
    Registries.Component.add(PosReferencePopup)
    return PosReferencePopup
})