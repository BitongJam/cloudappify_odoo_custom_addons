/** @odoo-module **/

import { registry } from "@web/core/registry";
import { rpc } from '@web/core/network/rpc_service';
import { Layout } from "@web/search/layout"
import { getDefaultConfig } from "@web/views/view"
import { ChartRender } from "../chartRender/chartRender";
import { PaymentMethodChartRender } from "../chartRender/paymentMethodChartRender";
import { KpiCard} from "../kpiCard/kpiCard"

const { Component,useSubEnv,useState,onWillStart } = owl;

export class OwlAccountingDashboard extends Component {
    setup() {
        // Your setup logic here
        this.display = {
            controlPanel: {"top-right": false, "bottom-right": false}
        };

        useSubEnv({
            config: {
                ...getDefaultConfig(),
                ...this.env.config,
            }
        })

        this.state = useState({
            overallExpenseProductCategory :[],
            overallPosIncome:[],
            bankCashJournal:[],
            topSessionDiscount:[]
        });

        onWillStart(async ()=>{
            await this.overallExpensePerProductCategory()
            await this.overallPosIncome()
            await this.getBankAndCashJournal();
            await this.getTopSessionDiscount()
        });
        
        // sample
        this.rows = Array.from({ length: 10 }, (_, i) => i); 
    }

    async overallExpensePerProductCategory(){
        try {
            const rpc = this.env.services.rpc
            const data = await rpc("/report/overallExpensesProdCateg", {})
            
            this.state.overallExpenseProductCategory = data 

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {};
        }
    }

    async overallPosIncome(){
        try {
            const rpc = this.env.services.rpc
            const data = await rpc("/report/posIncomeReport", {})
            
            this.state.overallPosIncome = data

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {};
        }
    }

    async getBankAndCashJournal(){
        try {
            const rpc = this.env.services.rpc
            const data = await rpc("/report/getBankCashJournal", {})
            console.log('getBankAndCashJournal: ',data)
            this.state.bankCashJournal = data
            

        } catch (error) {
            console.error('Error fetching getBankAndCashJournal data:', error);
            return {};
        }
    }

    async getTopSessionDiscount(){
        try {
            const rpc = this.env.services.rpc
            const data = await rpc("/report/getTopSessionDiscount", {})
            console.log('getBankAndCashJournal: ',data)
            this.state.topSessionDiscount = data
            

        } catch (error) {
            console.error('Error fetching getTopSessionDiscount data:', error);
            return {};
        }
    }
}

// Define the template for the component
OwlAccountingDashboard.template = "pos_customs.owl_accounting_dashboard_template";
OwlAccountingDashboard.components = { Layout,ChartRender,KpiCard,PaymentMethodChartRender }
// Register the component in the "actions" category
registry.category("actions").add("pos_customs.owlAccountingDashboard", OwlAccountingDashboard);
