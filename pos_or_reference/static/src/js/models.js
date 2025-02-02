odoo.define('pos_or_reference.models',function(require){
    'use strict';

    var {Order} = require('point_of_sale.models');
    const Registries = require('point_of_sale.Registries');

    const PosOrderOrReference = (Order) => class PosOrderOrReference extends Order{
        constructor(obj, options) {
            super(...arguments);
            this.official_receipt_reference = ''
        }

        //@override
        export_as_JSON() {
            const json = super.export_as_JSON(...arguments);
            json.official_receipt_reference = this.official_receipt_reference;
            return json;
        }
        //@override
        init_from_JSON(json) {
            super.init_from_JSON(...arguments);
            this.official_receipt_reference = json.official_receipt_reference;
        }

        setOfficialReceiptRef(reference){
            this.official_receipt_reference = reference;
        }

        getOfficialReceiptRef(){
            return this.official_receipt_reference
        }
    }
    Registries.Model.extend(Order,PosOrderOrReference);
    
});