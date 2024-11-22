odoo.define('pos_customs.models', function(require) {
     'use strict';
 
     const models = require('point_of_sale.models');
     const Registries = require('point_of_sale.Registries');
 
     const CustomOrder = (Order) =>
         class extends Order {
             add_paymentline(payment_method) {
                 // Call the original add_paymentline method
                 const ret = super.add_paymentline(payment_method);
 
                 // // Add your custom logic
                 const selectedLine = this.selected_paymentline;
                 console.log('Custom add_paymentline called');
                 if (selectedLine) {
                     selectedLine.transaction_id = ''; // Initialize transaction_id
                     console.log('Transaction ID added:', selectedLine);
                 }
 
                 return ret
             }
         };
 
     // Extend the Order model using the Registry
     Registries.Model.extend(models.Order, CustomOrder);
 
     return models;
 });
 