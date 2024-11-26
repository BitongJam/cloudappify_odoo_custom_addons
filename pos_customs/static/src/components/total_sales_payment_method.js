/** @odoo-module */
// import { rpc } from '@web/core/network/rpc';
import { registry } from "@web/core/registry"
import { OwlCard } from "./card/card"
import { useService } from "@web/core/utils/hooks"
import rpc from 'web.rpc';

// import { rpc } from "@web/core/network/rpc"

const {_t} = require('web.core');





const { Component, useState,onWillStart } = owl;

export class TtalSPDashboard extends Component {
    setup() {
        // Initialize state with proper structure
        this.state = useState({
            quotations: {
                name: 'Total POS Sales',
                value: 0
            },
            totalpaymentgroup:[] 


        });

        // Use the service to access ORM methods like searchRead
        this.orm = useService('orm');
        this.company = useService('company'); 
        // this.rpc = useService("rpc");


     
        
        // Call the method to get the total amount
        onWillStart(async () =>{
            await this.getPosTotalAmnt();
            await this.getPosPaymentTotalbyGroup();
            // await this.fetchPosPaymentData()
        })
       
    }


    async getPosTotalAmnt() {
        try {
            let domain = [];
            let totalAmnt = 0
            const posPayments = await this.orm.searchRead('pos.payment', domain, ['amount', 'currency_id']);
            for (const payment of posPayments){
               totalAmnt += payment.amount
            //    console.log(totalAmnt)
            }
           

            this.state.quotations.value ="string"+  totalAmnt
            
        } catch (error) {
            console.error("Error fetching POS payment data:", error);
        }
    }

    async getPosPaymentTotalbyGroup() {
        var self = this;
        try {
            // Import or use the rpc module correctly for Odoo 16+
            const result =  await rpc.query({
                model: 'pos.payment',
                method: 'group_by_payment_method',
                args: [], // Pass any necessary arguments to the method (empty here)
            });
            this.state.totalpaymentgroup = result
    
            console.log("Grouped POS Payment Data:", result);
    
            // You can process the result further and update the UI as needed
        } catch (error) {
            console.error('Error fetching grouped POS payment data:', error);
        }
    }



}

TtalSPDashboard.template = "owl.TtalSPDashboard";
TtalSPDashboard.components = { OwlCard };

registry.category("actions").add("owl.ttal_sales_payment_method", TtalSPDashboard);
