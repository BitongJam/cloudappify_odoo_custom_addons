/** @odoo-module **/
import OrderReceipt from "point_of_sale.OrderReceipt"
import Registries from "point_of_sale.Registries";

const OrderReceiptInherit = (order_receipt_inherit) => class extends order_receipt_inherit {
    setup() {
        super.setup();        
        this._receiptEnv.pos_orderline_kitchen_include = this.get_product_included_for_kitchen();
        this.receipt.pos_orderline_kitchen_include = this._receiptEnv.pos_orderline_kitchen_include
        // console.log("OrderReceiptInherit: ", this.receipt)
        
    }

    get_product_included_for_kitchen() {
        const reciptEnv = this._receiptEnv;
        const allowedCategoryIds = reciptEnv.order?.pos?.config?.pos_categ_inclue_kitchen_order_receipt_ids || [];
        const pos = this.env.pos;
        const orderlines = reciptEnv.orderlines || [];  // 🛡️ Fallback to 
        const kitchenproduct = orderlines
            .filter((line) => {
                const categoryId = line.product?.pos_categ_id?.[0];
                return allowedCategoryIds.includes(categoryId);
            })
            .map((line,index) => {
                return {
                    product: line.product,
                    quantity: line.quantity,
                    pos_categ: line.product.pos_categ_id,
                    pos_categ_name: pos.db.get_category_by_id(line.product.pos_categ_id?.[0])?.name || false,
                    key: `${line.product.id}_${index}` 
                };
            })
            .sort((a, b) => a.pos_categ[0] - b.pos_categ[0]);

        // console.log("Kitchen Products:", kitchenproduct);
        return kitchenproduct
    }
}

Registries.Component.extend(OrderReceipt, OrderReceiptInherit);