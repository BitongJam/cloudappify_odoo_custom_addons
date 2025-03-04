/** @odoo-module **/

import { registry } from "@web/core/registry";
import { rpc } from '@web/core/network/rpc_service';
import { useService } from "@web/core/utils/hooks";
import { Layout } from "@web/search/layout"
import { getDefaultConfig } from "@web/views/view"
import { ChartRender } from "../chartRender/saleSummarychartRender";
import { PaymentMethodChartRender } from "../chartRender/paymentMethodChartRender";
import { KpiCard} from "../kpiCard/kpiCard"
import { SalesByHourChartRender } from "../chartRender/salesByHourChartRender";
import { TipsDiscountChartRender } from "../chartRender/tipDiscountChartRender";

const { Component,useSubEnv,useState,onWillStart } = owl;

export class OwlAccountingDashboard extends Component {
    setup() {
        // Your setup logic here
        this.orm = useService("orm")
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
            topSessionDiscount:[],
            posTerminal:[],
            countPosOrder:0
        });

        onWillStart(async ()=>{
            await this.overallExpensePerProductCategory()
            await this.overallPosIncome()
            await this.getBankAndCashJournal();
            await this.getTopSessionDiscount()
            await this.getPosTerminals();
            await this.fetchPosOrderCount();
        });
        
        // sample
        this.rows = Array.from({ length: 10 }, (_, i) => i); 
    }

    async fetchPosOrderCount(){
        try{
            // const rec = await this.orm.searchRead("pos.order",[['state','not in',('cancel','draft')]],{})
            // this.state.countPosOrder = rec
            const data = await this.orm.searchCount("pos.order", [['state', 'not in', ['cancel', 'draft']]]);
            this.state.countPosOrder = data
        } catch (error){
            console.error("Error Fetch Records getCountPosOrder Function: ",error)
        }
    }

    async getPosTerminals(){
        try{
            const rec = await this.orm.call(
                "pos.config",
                "get_pos_config_total_sale",[],{}
            )
            

            this.state.posTerminal = rec

        } catch (error) {
            console.error("Error fetching records:", error);
        }
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
OwlAccountingDashboard.components = { Layout,ChartRender,KpiCard,PaymentMethodChartRender,SalesByHourChartRender ,TipsDiscountChartRender}
// Register the component in the "actions" category
registry.category("actions").add("pos_customs.owlAccountingDashboard", OwlAccountingDashboard);
