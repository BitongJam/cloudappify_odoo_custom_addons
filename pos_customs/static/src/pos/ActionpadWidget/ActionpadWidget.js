/** @odoo-module **/
import Registries from 'point_of_sale.Registries';
import ActionpadWidget from 'point_of_sale.ActionpadWidget';

const ActionpadWidgetInherit = (ActionpadWidget) => class extends ActionpadWidget {
    // Override the onclick method
    onclick() {
        const order = this.env.pos.get_order();  // Get the current order
        if (!order || order.get_orderlines().length === 0) {
            // If no order or empty cart, show a warning
            this.showNotification('Your cart is empty. Please add products before proceeding to payment.');
        } else {
            // If there are items, trigger the payment action
            const actionToTrigger = this.props.actionToTrigger || 'click-pay';
            this.trigger(actionToTrigger);
        }
    }

   // Custom function to show notifications using Odoo's showPopup method
   showNotification(message) {
    this.showPopup('ErrorPopup', {
        title: 'Warning',
        body: message,
        color: 'danger',
    });
}
};

Registries.Component.extend(ActionpadWidget, ActionpadWidgetInherit);
