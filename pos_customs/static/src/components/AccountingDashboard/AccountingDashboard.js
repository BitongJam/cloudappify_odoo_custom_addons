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
        this.rpc = useService('rpc');
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
            filterSessionStateValue:false,
            filterPosStateValue:false,
            filterResponsibleSateValue: false,
            filterProductStateValue:false,
            salesSumaryLabels:[],
            salesSummaryData:[],
            salesByPaymentMethodLabels:[],
            salesByPaymentMethodData:[],
            fetchChartTotalSalesPerHourData:[],

            dataTipsDiscount:{'tips_amnt':0,'disc_amnt':0},
            dataPointOfSaleList:[],
            dataPosSession:[],
            dataResponsible:[],
            dataListProduct:[]
        });

        onWillStart(async ()=>{
            await this.overallExpensePerProductCategory()
            await this.overallPosIncome()
            await this.getBankAndCashJournal();
            await this.getTopSessionDiscount()
            await this.fetchPosOrderCount();
            await this.getTotaRevenues();
            await this.getaverageOrder(this.state.totalRevenue,this.state.countPosOrder);
            await this.fetchCashOutAmount();
            await this.getPosTopSaleCashier();
            await this.getTopProductPosSales();
            await this.getProductCategoryExpenses(false);
            await this.fetchChartDateSalesSummary(false)
            await this.fetchChartSaleByPayment();
            await this.fetchChartTotalSalesPerHour();
            await this.getTopProductPosSales();
            await this.getDataListPointOfSale();
            await this.getDataListSession();
            await this.getDataResponsible();
            await this.getDataListProduct();
            await this.getTipsDiscountAmount();
        });
        
        // sample
        this.rows = Array.from({ length: 10 }, (_, i) => i); 
    }

    responsibleFilterChange(event){
        const selectedValue = parseInt(event.target.value);
        this.state.filterResponsibleSateValue = selectedValue;

        this.upgradeChartData();
    }

    periodFilterChange(event){
        const selectedValue = parseInt(event.target.value, 10);
        this.state.filterPeriodStateValue = selectedValue;

        this.upgradeChartData();
    }

    sessionFilterChange(event){
        const selectedValue = parseInt(event.target.value)
        this.state.filterSessionStateValue = selectedValue;
        this.upgradeChartData();
    }

    posFilterChange(event){
        const selectedValue = parseInt(event.target.value)
        this.state.filterPosStateValue = selectedValue;
        this.upgradeChartData();

    }

    productFilterChange(event){
        const selectedValue = parseInt(event.target.value)
        console.log("productFilterChange: ",selectedValue)
        this.state.filterProductStateValue = selectedValue
        this.upgradeChartData();
    }
    upgradeChartData(){      
        let period = this.state.filterPeriodStateValue
        let session = this.state.filterSessionStateValue
        let pos = this.state.filterPosStateValue
        let responsible = this.state.filterResponsibleSateValue
        let product = this.state.filterProductStateValue
        this.fetchPosOrderCount(period,session,pos,responsible,product)
        this.getTotaRevenues(period,session,pos,responsible,product)
        this.fetchCashOutAmount(period,session,pos,responsible)    
        this.fetchChartDateSalesSummary(period,session,pos,responsible,product)    
        this.fetchChartSaleByPayment(period,session,pos,responsible,product);
        this.fetchChartTotalSalesPerHour(period,session,pos,responsible,product)
        this.getPosTopSaleCashier(period,session,pos,responsible,product)
        this.getTopProductPosSales(period,session,pos,responsible,product)
        this.getProductCategoryExpenses(period);
        this.getTipsDiscountAmount(period,session,pos,responsible,product)
    }

    async getTipsDiscountAmount(period =false,session=false,pos=false,responsible=false,product=false){
        const data = await this.rpc("/report/get_discount_tips_data",{period:period,session:session,pos:pos,responsible:responsible,product:product});
        this.state.dataTipsDiscount.disc_amnt = data.disc_amount
        this.state.dataTipsDiscount.tips_amnt = data.tips_amount
        this.state.dataTipsDiscount.str_disc_amnt = data.str_disc_amount
        console.log("getTipsDiscountAmount: ",data)
    }
    async getDataListPointOfSale(){
       const data =  await this.orm.searchRead("pos.config",[],['id','name'])
       this.state.dataPointOfSaleList = data
       console.log('getDataListPointOfSale: ',data)
    }


    async getDataResponsible(){
        const data = await this.orm.searchRead("res.users", [['share', '=', false]], ['id', 'name']);
    
        this.state.dataResponsible = data
        console.log('getDataResponsible: ',data)
    }

    async getDataListSession(){
        const data =  await this.orm.searchRead("pos.session",[],['id','name'])
        this.state.dataPosSession = data
    }

    async getDataListProduct(){
        const data = await this.rpc("/report/get_pos_product_list",{})
        this.state.dataListProduct = data
    }

    async fetchChartDateSalesSummary(period=false,session=false,pos=false,responsible=false,product=false){
        try {
            // let dateFilter = []
            // if (period) {
            //     const today = new Date();
            //     let fromDate = new Date(today);
    
            //     if (period === 1) {
            //         fromDate = today;
            //     } else if (period === 7) {
            //         fromDate.setDate(today.getDate() - 7);
            //     } else if (period === 30) {
            //         fromDate.setDate(today.getDate() - 30);
            //     } else if (period === 90) {
            //         fromDate.setDate(today.getDate() - 90);
            //     } else if (period === 365) {
            //         fromDate.setDate(today.getDate() - 365);
            //     }

            //     dateFilter = [['date', '>', fromDate.toISOString().split('T')[0]],['date','<=',today.toISOString().split('T')[0]]];
            
            // }

            const rec = await this.orm.call(
              "pos.config",
              "get_pos_config_total_sale", [period,session,pos,responsible,product], {}
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

    async fetchChartSaleByPayment(period=false,session=false,pos=false,responsible=false,product=false) {
        let domain = []
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

                domain = [['payment_date', '>', fromDate.toISOString().split('T')[0]],['payment_date','<=',today.toISOString().split('T')[0]]];
            
            }

            if  (session){
                domain.push(['session_id','=',session])
            }

            if (pos){
                domain.push(['pos_order_id.config_id','=',pos])
            }

            if (responsible){
                domain.push(['pos_order_id.user_id','=',responsible])
            }

            if (product){
                console.log("getchChartSale: ",product)
                domain.push(['pos_order_id.lines.product_id','=',product])
            }

        try {
            const data = await this.orm.readGroup("pos.payment", domain, ['payment_method_id.name', "amount:sum"], ['payment_method_id']);
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

    async fetchChartTotalSalesPerHour(period=false,session=false,pos=false,responsible=false,product=false){
        try {
            let domain ={}
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
                domain.end_date = fromDate
            }

            if (session){
                domain.session = session
            }

            if (pos){
                domain.pos=pos
            }

            if (responsible){
                domain.responsible = responsible
            }

            if (product){
                domain.product = product
            }

            const rpc = this.env.services.rpc
            const data = await rpc("/report/get_total_sales_per_hour_pos", domain)
            
            const filter_even = data.filter(item => item.sale_hour % 2 === 0)
            this.state.fetchChartTotalSalesPerHourData = filter_even.map(item => item.total_sales)
            console.log('fetchChartTotalSalesPerHourData: ',this.state.fetchChartTotalSalesPerHourData)
        } catch (error) {
            console.error('Error fetching getTtotalSalesPerHourPos data:', error);
            return {};
        }
    }

    async fetchCashOutAmount(period=false,session=false,pos=false,responsible=false){
        try{
            let domain = []
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

                domain = [['date', '>', fromDate.toISOString().split('T')[0]],['date','<=',today.toISOString().split('T')[0]]];
            
            }

            if (session){
                domain.push(['pos_session_id','=',session])
            }

            if (pos){
                domain.push(['pos_session_id.config_id','=',pos])
            }
            if (responsible){
                domain.push(['user_id','=',responsible])
            }
            const data = await this.orm.readGroup(
                'account.bank.statement.line',
                [['payment_ref','ilike','-out-'],...domain],
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

    async fetchPosOrderCount(period = false, session = false, pos = false, responsible = false, product = false) {
        try {
            // Define the date range filter
            let domain = [];
    
            // Handle period filters with correct datetime
            if (period) {
                const today = new Date();  // Current date
                today.setHours(23, 59, 59, 999);  // End of the day (23:59:59)
                console.log('test today: ', today);
    
                let fromDate = new Date(today);  // Clone today's date
    
                // Adjust 'fromDate' based on selected period
                if (period === 1) {
                    console.log('test period: ', today.getDate());
                    fromDate.setHours(0, 0, 0, 0);  // Start of the same day
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);  // 7 days ago
                    fromDate.setHours(0, 0, 0, 0);  // Start of that day
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);  // 30 days ago
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);  // 90 days ago
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);  // 365 days ago
                    fromDate.setHours(0, 0, 0, 0);
                }
    
                // Add datetime range to domain for filtering
                domain = [
                    ['date_order', '>=', fromDate.toISOString()],  // From start of the day
                    ['date_order', '<=', today.toISOString()]     // Until end of today
                ];
                console.log('test domain: ', domain);
            }
    
            // Add filters dynamically based on other parameters
            if (session) {
                domain.push(['session_id', '=', session]);
            }
    
            if (pos) {
                domain.push(['config_id', '=', pos]);
            }
    
            if (responsible) {
                domain.push(['user_id', '=', responsible]);
            }
    
            if (product) {
                domain.push(['lines.product_id.id', '=', product]);
            }
    
            // Fetch the count of POS orders with the filters
            const data = await this.orm.searchCount("pos.order", [
                ['state', 'not in', ['cancel', 'draft']],  // Exclude cancelled or draft orders
                ['lines','!=',false],  // Exclude orders without any lines
                ...domain,  // Add dynamically built filters
            ]);
    
            // Update the state with the fetched count
            this.state.countPosOrder = data;
            console.log('test fetchPosOrderCount: ', data);
    
            // Format the count nicely with commas
            this.state.strcountPosOrder = data.toLocaleString('en-US', { maximumFractionDigits: 0 });
    
            // Calculate average order value (if needed)
            this.getaverageOrder(this.state.totalRevenue, this.state.countPosOrder);
    
        } catch (error) {
            console.error("Error Fetch Records fetchPosOrderCount Function: ", error);
        }
    }

    async getTopProductPosSales(period=false,session=false,pos=false,responsible=false,product=false){
        try{
            let domain = {}
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
                domain.end_date = fromDate
            }

            if (session){
                domain.session = session
            }

            if (pos){
                domain.pos = pos
            }

            if (responsible){
                domain.responsible = responsible
            }

            if (product){
                domain.product = product
            }
            
            const rpc = this.env.services.rpc
            const data = await rpc("/report/get_top_product_pos_sales", domain)

            console.log("getTopProductPosSales test: ",data)
            this.state.getTopProductPosSales = data

        }catch(error){
            console.error("Error Fetch Records getTopProductPosSales Function: ",error)

        }
    }

    async getProductCategoryExpenses(period){
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
            const data = await rpc("/report/get_product_category_expenses", {end_date:fromDate})

            console.log("getProductCategoryExpenses test: ",data)
            this.state.getProductCategoryExpenses = data

        }catch(error){
            console.error("Error Fetch Records getProductCategoryExpenses Function: ",error)

        }
    }


    async getTotaRevenues(period=false,session=false,pos=false,responsible=false,product=false){
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

            if (session){
                domain.push(['session_id','=',session])
                //fucntion
            }

            if (pos){
                domain.push(['config_id','=',pos])
            }

            if (responsible){
                domain.push(['user_id','=',responsible])
            }

            if (product){
                domain.push(['lines.product_id.id','=',product])
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

    async getPosTopSaleCashier(period = false,session=false,pos=false,responsible=false,product=false){

        try{
            let domain = {}
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
                domain.end_date = fromDate
            }
            console.log('session: ',session,' pos: ',pos,'responsible: ',responsible,' product: ',product)
            if (session){
                domain.session = session
            }

            if (pos){
                domain.pos = pos
            }

            if (responsible){
                domain.responsible = responsible
            }

            if (product){
                domain.product = product
            }
            
            const rpc = this.env.services.rpc
            const data = await rpc("/report/get_top_pos_sales_cashier", domain)

            console.log("getPosTopSaleCashier test: ",domain)
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
