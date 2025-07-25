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

const { Component,useSubEnv,useState,onWillStart,onWillUnmount } = owl;

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
            beforeCountPosOrder:0,
            countPosOrderPercGrow:0,
            totalRevenue:0,
            totalRevenuePercGrow:0,
            strTotalRevenue:0,
            beforeTotalRevenue:0,
            averageOrder:0,
            beforeAverageOrder:0,
            averageOrderPercGrow:0,
            ttalCashOutAmount:0,
            beforeTtalCashOutAmount:0,
            ttalCashOutAmountPercGrow:0,
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
            fetchChartTotalSalesPerHourData:{'sale_hour':false,'sale_amount':0},

            dataTipsDiscount:{'tips_amnt':0,'disc_amnt':0},
            dataPointOfSaleList:[],
            dataPosSession:[],
            dataResponsible:[],
            dataListProduct:[]
        });

        let isMounted = true;

        onWillUnmount(() => {
            isMounted = false
        });

        onWillStart(async ()=>{
            try {
                if (!isMounted) return;

                await this.overallExpensePerProductCategory()
                await this.overallPosIncome()
                await this.getBankAndCashJournal();
                await this.getTopSessionDiscount()
                await this.fetchPosOrderCount();
                await this.getTotaRevenues();
                await this.getaverageOrder(this.state.totalRevenue, this.state.countPosOrder, this.state.beforeTotalRevenue, this.state.beforeCountPosOrder);
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
            }catch(error){
                console.error("Error fetching POS data:", error);

            }
            
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
    }
    async getDataListPointOfSale(){
       const data =  await this.orm.searchRead("pos.config",[],['id','name'])
       this.state.dataPointOfSaleList = data
    }


    async getDataResponsible(){
        const data = await this.orm.searchRead("res.users", [['share', '=', false]], ['id', 'name']);
    
        this.state.dataResponsible = data
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
                fromDate.setHours(0,0,0,0);
                const formatted = fromDate.toISOString().slice(0,19).replace("T"," ");
                domain = [['payment_date', '>=', fromDate]];
            
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
                domain.push(['pos_order_id.lines.product_id','=',product])
            }

        try {
            const data = await this.orm.readGroup("pos.payment", domain, ['payment_method_id.name', "amount:sum"], ['payment_method_id']);
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
                fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                    fromDate.setHours(0,0,0,0);
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                    fromDate.setHours(0,0,0,0);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                    fromDate.setHours(0,0,0,0);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                    fromDate.setHours(0,0,0,0);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                    fromDate.setHours(0,0,0,0);
                }

                dateFilter = [['date', '>=', fromDate.toISOString().split('T')[0]],['date','<=',today.toISOString().split('T')[0]]];
                fromDate = fromDate
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
            
            this.state.fetchChartTotalSalesPerHourData.sale_amount = data.map(item => item.total_sales)
            this.state.fetchChartTotalSalesPerHourData.sale_hour = data.map(item => item.sale_hour)
        } catch (error) {
            console.error('Error fetching getTtotalSalesPerHourPos data:', error);
            return {};
        }
    }

    async fetchCashOutAmount(period=false,session=false,pos=false,responsible=false){
        try{
            let domain = []
            let domainBeforeDay =[]
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

                domain = [['date', '>=', fromDate.toISOString().split('T')[0]]];
                const beforeDate = new Date(fromDate)
                beforeDate.setDate(beforeDate.getDate() - 1)
                domainBeforeDay = [['date','>=',beforeDate]]
            
            }

            if (session){
                domain.push(['pos_session_id','=',session])
                domainBeforeDay.push(['pos_session_id','=',session])
            }

            if (pos){
                domain.push(['pos_session_id.config_id','=',pos])
                domainBeforeDay.push(['pos_session_id.config_id','=',pos])
            }
            if (responsible){
                domain.push(['user_id','=',responsible])
                domainBeforeDay.push(['user_id','=',responsible])
            }
            const data = await this.orm.readGroup(
                'account.bank.statement.line',
                [['payment_ref','ilike','-out-'],...domain],
                ['amount:sum'],[],
            );
            const dataBeforeDay = await this.orm.readGroup(
                'account.bank.statement.line',
                [['payment_ref','ilike','-out-'],...domainBeforeDay],
                ['amount:sum'],[],
            );
            if (data != false){
                let amount = Math.abs(data[0].amount);
                let strAmount = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                this.state.ttalCashOutAmount = strAmount
            }

            if (dataBeforeDay !=false){
                let currentAmount = Math.abs(data[0].amount)
                let beforeamount = Math.abs(dataBeforeDay[0].amount);
                const PercGrow = ((currentAmount-beforeamount)/beforeamount)*100
                this.state.ttalCashOutAmountPercGrow = Math.round(PercGrow)
            }

        }catch(error){
            console.error("Error Fetch Records fetchCashOutAmount Function: ",error)
        }
    }

    async fetchPosOrderCount(period=false,session=false,pos=false,responsible=false,product=false) {
        try {
            // Define the date range filter
            let domain = [];
            let domainBeforeDay =[]
            //period
            if (period) {
                const today = new Date();
                
                let fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                    fromDate.setHours(0, 0, 0, 0); 
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                    fromDate.setHours(0, 0, 0, 0);
                }

                domain = [['date_order', '>=', fromDate]];

                let beforeDate = new Date(fromDate);
                beforeDate.setDate(beforeDate.getDate() - 1);

                domainBeforeDay = [['date_order', '>=', beforeDate]]
            }

            if (session){
                domain.push(['session_id','=',session])
                domainBeforeDay.push(['session_id','=',session])
                //fucntion
            }

            if (pos){
                domain.push(['config_id','=',pos])
                domainBeforeDay.push(['config_id','=',pos])
            }

            if (responsible){
                domain.push(['user_id','=',responsible])
                domainBeforeDay.push(['user_id','=',responsible])
            }

            if (product){
                domain.push(['lines.product_id.id','=',product])
                domainBeforeDay.push(['lines.product_id.id','=',product])
            }
    
            // Fetch the count with dynamic filters
            const data = await this.orm.searchCount("pos.order", [
                ['state', 'not in', ['cancel', 'draft']],
                ['lines', '!=', false],
                ...domain,  // Add the date filter dynamically
            ]);

            const dataBeforeDay = await this.orm.searchCount("pos.order", [
                ['state', 'not in', ['cancel', 'draft']],
                ['lines', '!=', false],
                ...domainBeforeDay,  // Add the date filter dynamically
            ]);
   
    
            this.state.countPosOrder = data;
            this.state.strcountPosOrder = data.toLocaleString('en-US', { maximumFractionDigits: 0 });
            this.state.beforeCountPosOrder = dataBeforeDay
            // percentage before day

            // compute percentage grow from last period of average order
           
            
            if (!period){
                this.state.countPosOrderPercGrow = 0
            }else{
                let percGrow = ((this.state.countPosOrder - this.state.beforeCountPosOrder) /this.state.beforeCountPosOrder)*100
                this.state.countPosOrderPercGrow = Math.round(percGrow)

                
                // const lastAverOrder = this.getaverageOrder(this.state.beforeTotalRevenue,this.state.beforeCountPosOrder)
                // this.state.averageOrderPercGrow = ((curentAverOrder-lastAverOrder)/lastAverOrder)*100
            }
            
            this.getaverageOrder(this.state.totalRevenue,this.state.countPosOrder,this.state.beforeTotalRevenue,this.state.beforeCountPosOrder)
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
                fromDate.setHours(0, 0, 0, 0);
 
                fromDate = fromDate
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

                // dateFilter = [['date', '>', fromDate.toISOString().split('T')[0]],['date','<=',today.toISOString().split('T')[0]]];
                fromDate = fromDate.toISOString().split('T')[0]
            }


            const rpc = this.env.services.rpc
            const data = await rpc("/report/get_product_category_expenses", {end_date:fromDate})

            this.state.getProductCategoryExpenses = data

        }catch(error){
            console.error("Error Fetch Records getProductCategoryExpenses Function: ",error)

        }
    }


    async getTotaRevenues(period=false,session=false,pos=false,responsible=false,product=false){
        try{
            let domain = [['state', 'not in', ['cancel', 'draft']]]
            let domainBeforeDay = domain
            if (period) {
                const today = new Date();
                let fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                    fromDate.setHours(0, 0, 0, 0);
                }

                let date_from = ['date_order', '>=', fromDate];
                domain.push(date_from)

                let beforeDate = new Date(fromDate);
                beforeDate.setDate(beforeDate.getDate() - 1);
                domainBeforeDay = [['date_order', '>=', beforeDate]]
            }

            if (session){
                domain.push(['session_id','=',session])
                domainBeforeDay.push(['session_id','=',session])
                //fucntion
            }

            if (pos){
                domain.push(['config_id','=',pos])
                domainBeforeDay.push(['config_id','=',pos])
            }

            if (responsible){
                domain.push(['user_id','=',responsible])
                domainBeforeDay.push(['user_id','=',responsible])
            }

            if (product){
                domain.push(['lines.product_id.id','=',product])
                domainBeforeDay.push(['lines.product_id.id','=',product])
            }
    


            const data = await this.orm.readGroup("pos.order",domain,["amount_total:sum"],[]);
            const dataBeforeDay = await this.orm.readGroup("pos.order",domainBeforeDay,["amount_total:sum"],[]);
            let amount = data[0].amount_total
            let amountBeforeDay = dataBeforeDay[0].amount_total

            // this function toLocaleString it will format numbers has commay then decimal will be 2
            if (amount === null){
                amount = 0
            }
            this.state.totalRevenue = amount
            this.state.beforeTotalRevenue = amountBeforeDay
            this.state.strTotalRevenue = amount.toLocaleString("en-US",{
                minimumFractionDigits:2,
                maximumFractionDigits:2
            })


            if (!period){
                this.state.totalRevenuePercGrow = 0
            }else{
                let percGrow = ((this.state.totalRevenue - this.state.beforeTotalRevenue)/this.state.beforeTotalRevenue)*100
                this.state.totalRevenuePercGrow = Math.round(percGrow)
                // const curentAverOrder = this.getaverageOrder(this.state.totalRevenue,this.state.countPosOrder)
                // const lastAverOrder = this.getaverageOrder(this.state.beforeTotalRevenue,this.state.beforeCountPosOrder)
                // this.state.averageOrderPercGrow = ((curentAverOrder-lastAverOrder)/lastAverOrder)*100
            }
            
            this.getaverageOrder(this.state.totalRevenue,this.state.countPosOrder,this.state.beforeTotalRevenue,this.state.beforeCountPosOrder)
            

        }catch (error){
            console.error("Error Fetch Records getTotaRevenues Function: ",error)
        }
    }

    async getaverageOrder(totalRevenue,countPosOrder,beforeTotalRevenue=0,beforeCountPosOrder=0){
        try{
            const averrev = totalRevenue/countPosOrder
            this.state.averageOrder  = Math.round(averrev)
            const beforeaverrev = beforeTotalRevenue/beforeCountPosOrder
            this.state.beforeAverageOrder = Math.round(beforeaverrev)

            const averPerOrderGrow = ((this.state.averageOrder-this.state.beforeAverageOrder)/this.state.beforeAverageOrder)*100
            this.state.averageOrderPercGrow = Math.round(averPerOrderGrow)
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
                fromDate = new Date(today);
    
                if (period === 1) {
                    fromDate = today;
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 7) {
                    fromDate.setDate(today.getDate() - 7);
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 30) {
                    fromDate.setDate(today.getDate() - 30);
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 90) {
                    fromDate.setDate(today.getDate() - 90);
                    fromDate.setHours(0, 0, 0, 0);
                } else if (period === 365) {
                    fromDate.setDate(today.getDate() - 365);
                    fromDate.setHours(0, 0, 0, 0);
                }

                fromDate = fromDate
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
            const data = await rpc("/report/get_top_pos_sales_cashier", domain)

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
