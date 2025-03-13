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
            countPosOrder:0,
            strcountPosOrder:0,
            totalRevenue:0,
            strTotalRevenue:0,
            averageOrder:0,
            ttalCashOutAmount:0,
            getPosTopSalesCashier:[],
            getTopProductPosSales:[],
            getProductCategoryExpenses:[],
            getTtotalSalesPerHourPos:[],
            filterPeriodStateValue:0,
            salesSumaryLabels:[],
            salesSummaryData:[],
            salesByPaymentMethodLabels:[],
            salesByPaymentMethodData:[],
            fetchChartTotalSalesPerHourData:[]
        });

        onWillStart(async ()=>{
            await this.overallExpensePerProductCategory()
            await this.overallPosIncome()
            await this.getBankAndCashJournal();
            await this.getTopSessionDiscount()
            await this.fetchPosOrderCount(false);
            await this.getTotaRevenues(false);
            await this.getaverageOrder(this.state.totalRevenue,this.state.countPosOrder);
            await this.fetchCashOutAmount(false);
            await this.getPosTopSaleCashier(false);
            await this.getTopProductPosSales();
            await this.getProductCategoryExpenses();
            await this.fetchChartDateSalesSummary(false)
            await this.fetchChartSaleByPayment(false);
            await this.fetchChartTotalSalesPerHour(false);
            await this.getTopProductPosSales(false);
        });
        
        // sample
        this.rows = Array.from({ length: 10 }, (_, i) => i); 
    }

    onFilterChange(event){
        const selectedValue = parseInt(event.target.value, 10);
        console.log('test onFilterChange: ',event.target.value)
        this.state.filterPeriodStateValue = selectedValue
        this.fetchPosOrderCount(this.state.filterPeriodStateValue)
        this.getTotaRevenues(this.state.filterPeriodStateValue)
        this.fetchCashOutAmount(this.state.filterPeriodStateValue)    
        this.fetchChartDateSalesSummary(this.state.filterPeriodStateValue)    
        this.fetchChartSaleByPayment(this.state.filterPeriodStateValue);
        this.fetchChartTotalSalesPerHour(this.state.filterPeriodStateValue)
        this.getPosTopSaleCashier(this.state.filterPeriodStateValue)
        this.getTopProductPosSales(this.state.filterPeriodStateValue)
    }

    async fetchChartDateSalesSummary(period){
        try {
            let dateFilter = []
            if (period) {
                const today = new Date();
                let fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                }

                dateFilter = [['date', '>', fromDate.toISOString().split('T')[0]],['date','<=',today.toISOString().split('T')[0]]];
            
            }

            const rec = await this.orm.call(
              "pos.config",
              "get_pos_config_total_sale", [period], {}
            )
            // const rec = await this.or
            this.state.posTerminal = rec
            if (rec && Array.isArray(rec)) {
              this.state.salesSumaryLabels = rec.map(item => item.config_name);
              this.state.salesSummaryData = rec.map(item => Number(item.total_sales.replace(/,/g, '')));
      
              console.log("charDAta labels",this.state.salesSumaryLabels);
              console.log("charDAta datasets",this.state.salesSummaryData);
            }
        
      
          } catch (error) {
            console.error("Error fetching records:", error);
          }
    }

    async fetchChartSaleByPayment(period) {
        let dateFilter = []
            if (period) {
                const today = new Date();
                let fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                }

                dateFilter = [['payment_date', '>', fromDate.toISOString().split('T')[0]],['payment_date','<=',today.toISOString().split('T')[0]]];
            
            }

        try {
            const data = await this.orm.readGroup("pos.payment", dateFilter, ['payment_method_id.name', "amount:sum"], ['payment_method_id']);
            console.log('test getPosPayment: ',data)
            this.state.salesByPaymentMethodLabels = (data || []).map(item => 
                Array.isArray(item.payment_method_id) && item.payment_method_id.length > 1 
                    ? item.payment_method_id[1]  // ✅ Extracts the payment method name
                    : "Unknown"
            );
            
            this.state.salesByPaymentMethodData = (data || []).map(item => item["amount"] || 0);

            

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            return {};
        }
    }

    async fetchChartTotalSalesPerHour(period){
        try {
            let dateFilter = []
            let fromDate = false
            if (period) {
                const today = new Date();
                console.log('test today: ',today)
                fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                }

                dateFilter = [['date', '>', fromDate.toISOString().split('T')[0]],['date','<=',today.toISOString().split('T')[0]]];
                fromDate = fromDate.toISOString().split('T')[0]
            }

            const rpc = this.env.services.rpc
            const data = await rpc("/report/get_total_sales_per_hour_pos", {end_date: fromDate})
            
            const filter_even = data.filter(item => item.sale_hour % 2 === 0)
            this.state.fetchChartTotalSalesPerHourData = filter_even.map(item => item.total_sales)
            console.log('fetchChartTotalSalesPerHourData: ',this.state.fetchChartTotalSalesPerHourData)
        } catch (error) {
            console.error('Error fetching getTtotalSalesPerHourPos data:', error);
            return {};
        }
    }

    async fetchCashOutAmount(period){
        try{
            let dateFilter = []
            if (period) {
                const today = new Date();
                console.log('test today: ',today)
                let fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                }

                dateFilter = [['date', '>', fromDate.toISOString().split('T')[0]],['date','<=',today.toISOString().split('T')[0]]];
            
            }
            const data = await this.orm.readGroup(
                'account.bank.statement.line',
                [['payment_ref','ilike','-out-'],...dateFilter],
                ['amount:sum'],[],
            );
            console.log('test fetchCashOutAmount: ',data)
            if (data != false){
                let amount = Math.abs(data[0].amount);
                let strAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                this.state.ttalCashOutAmount = strAmount
            }

        }catch(error){
            console.error("Error Fetch Records fetchCashOutAmount Function: ",error)
        }
    }

    async fetchPosOrderCount(period) {
        try {
            // Define the date range filter
            let dateFilter = [];
            if (period) {
                const today = new Date();
                console.log('test today: ',today)
                let fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                }

                dateFilter = [['date_order', '>', fromDate.toISOString().split('T')[0]],['date_order','<=',today.toISOString().split('T')[0]]];
            }
    
            // Fetch the count with dynamic filters
            const data = await this.orm.searchCount("pos.order", [
                ['state', 'not in', ['cancel', 'draft']],
                ['lines', '!=', false],
                ...dateFilter,  // Add the date filter dynamically
            ]);
  
    
            this.state.countPosOrder = data;
            console.log('test fetchPosOrderCount: ',data)
            this.state.strcountPosOrder = data.toLocaleString('en-US', { maximumFractionDigits: 0 });
            this.getaverageOrder(this.state.totalRevenue,this.state.countPosOrder)
        } catch (error) {
            console.error("Error Fetch Records fetchPosOrderCount Function: ", error);
        }
    }

    async getTopProductPosSales(period){
        try{
            let dateFilter = []
            let fromDate = false
            if (period) {
                const today = new Date();
                console.log('test today: ',today)
                fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                }

                dateFilter = [['date', '>', fromDate.toISOString().split('T')[0]],['date','<=',today.toISOString().split('T')[0]]];
                fromDate = fromDate.toISOString().split('T')[0]
            }

            
            const rpc = this.env.services.rpc
            const data = await rpc("/report/get_top_product_pos_sales", {end_date:fromDate})

            console.log("getTopProductPosSales test: ",data)
            this.state.getTopProductPosSales = data

        }catch(error){
            console.error("Error Fetch Records getTopProductPosSales Function: ",error)

        }
    }

    async getProductCategoryExpenses(){
        try{
            const rpc = this.env.services.rpc
            const data = await rpc("/report/get_product_category_expenses", {})

            console.log("getProductCategoryExpenses test: ",data)
            this.state.getProductCategoryExpenses = data

        }catch(error){
            console.error("Error Fetch Records getProductCategoryExpenses Function: ",error)

        }
    }


    async getTotaRevenues(period){
        try{
            let domain = [['state', 'not in', ['cancel', 'draft']]]
            if (period) {
                const today = new Date();
                console.log('test today: ',today)
                let fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                }

                let date_from = ['date_order', '>', fromDate.toISOString().split('T')[0]];
                domain.push(date_from)
                let date_to = ['date_order','<=',today.toISOString().split('T')[0]]
                domain.push(date_to)
            }

            console.log('test datefilter: ',domain)

            const data = await this.orm.readGroup("pos.order",domain,["amount_total:sum"],[]);
            console.log('getTotalRevenues test: ',data)
            let amount = data[0].amount_total

            // this function toLocaleString it will format numbers has commay then decimal will be 2
            if (amount === null){
                amount = 0
            }
            this.state.totalRevenue = amount
            console.log('test amount: ',amount)
            this.state.strTotalRevenue = amount.toLocaleString("en-US",{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            })

            this.getaverageOrder(this.state.totalRevenue,this.state.countPosOrder)

        }catch (error){
            console.error("Error Fetch Records getTotaRevenues Function: ",error)
        }
    }

    async getaverageOrder(totalRevenue,countPosOrder){
        try{
            console.log("test totalRevenue: ",totalRevenue);
            console.log("test countPosOrder: ",countPosOrder);
            const averrev = totalRevenue/countPosOrder
            this.state.averageOrder  = averrev.toFixed(2)
            console.log("test getaverageOrder: ",averrev.toFixed(2))
        }catch (error){
            console.error("Error Fetch Records getaverageOrder Function: ",error)
        }

    }

    async getPosTopSaleCashier(period){

        try{
            let dateFilter = []
            let fromDate = false
            if (period) {
                const today = new Date();
                console.log('test today: ',today)
                fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                }

                dateFilter = [['date', '>', fromDate.toISOString().split('T')[0]],['date','<=',today.toISOString().split('T')[0]]];
                fromDate = fromDate.toISOString().split('T')[0]
            }

            const rpc = this.env.services.rpc
            const data = await rpc("/report/get_top_pos_sales_cashier", {end_date:fromDate})

            console.log("getPosTopSaleCashier test: ",data)
            this.state.getPosTopSalesCashier = data
        }catch(error){
            console.error('Error fetching getPosTopSaleCashier data:', error);
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
