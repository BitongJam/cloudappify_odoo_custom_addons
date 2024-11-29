/** @odoo-module **/
import ProductScreen from 'point_of_sale.ProductScreen';
import Registries from 'point_of_sale.Registries';
const rpc = require('web.rpc');
const { Gui } = require('point_of_sale.Gui');
var core = require('web.core');
var _t = core._t;


export const KitchenProductScreenInherit = (ProductScreen) => class extends ProductScreen {
        setup(){
            super.setup();
        }
        async _onClickPay() {
            if (this.env.pos.get_order().orderlines.some(line => line.get_product().tracking !== 'none' && !line.has_valid_product_lot()) && (this.env.pos.picking_type.use_create_lots || this.env.pos.picking_type.use_existing_lots)) {
                const { confirmed } = await this.showPopup('ConfirmPopup', {
                    title: this.env._t('Some Serial/Lot Numbers are missing'),
                    body: this.env._t('You are trying to sell products with serial/lot numbers, but some of them are not set.\nWould you like to proceed anyway?'),
                    confirmText: this.env._t('Yes'),
                    cancelText: this.env._t('No')
                });
                if (confirmed) {
                    this.showScreen('PaymentScreen');
                }
            } else {
             var order_name=this.env.pos.selectedOrder.name
             var self=this
             rpc.query({
                    model: 'pos.order',
                    method: 'check_order',
                    args: [[],order_name]
                }).then(function(result){
                    self.showScreen('PaymentScreen');

                });

            }
        }
    };

    Registries.Component.extend(ProductScreen, KitchenProductScreenInherit);
