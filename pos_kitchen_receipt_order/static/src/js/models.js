/** @odoo-module **/
import { Order } from "point_of_sale.models";
import Registries from "point_of_sale.Registries";

const OrderInherit = (Order) => class extends Order {
    constructor(obj,option){
        super(obj,option)
        this.order_line_include_kitchen = []
        this.get_product_included_for_kitchen();
    }

    get_product_included_for_kitchen(){
        console.log("get_product_included_for_kitchen: ",this.get_orderlines())
        // console.log("get_product_included_for_kitchen: ",this.pos.config.pos_categ_inclue_kitchen_order_receipt_ids)

    }
};

Registries.Model.extend(Order, OrderInherit);
