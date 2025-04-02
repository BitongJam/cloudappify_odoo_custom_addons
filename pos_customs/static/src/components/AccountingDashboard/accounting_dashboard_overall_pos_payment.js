/** @odoo-module **/

import { loadJS } from "@web/core/assets"
const {Component, onWillStart,useRef,onMounted} = owl

export class AccountDashboardOverallPosPaymentChart extends Component{
    setup(){
        this.chartRef = useRef("chart")
        onWillStart(async ()=>{
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js")
        })

        onMounted(()=>this.renderChart())
    }

    renderChart(){
        const getRandomColor = () => {
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return `rgba(${r}, ${g}, ${b}, 0.5)`; // 0.5 for transparency
        };
    
        // Generate random colors for each bar
        const colors = Array(4).fill().map(() => getRandomColor());

        new Chart(this.chartRef.el, {
            type: "bar",
            data: {
                labels: ["bar1", "bar2", "bar3", "bar4"],
                datasets: [{
                    backgroundColor:colors,
                    data: [0, 10, 20, 30]
                }]
            },
            options: {},
        }
      );
    }
}

AccountDashboardOverallPosPaymentChart.template = "owl.AccountDashboardOverallPosPaymentChart"