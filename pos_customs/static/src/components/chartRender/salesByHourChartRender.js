/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
const { Component, onWillStart, useRef, onMounted } = owl

export class SalesByHourChartRender extends Component {
    setup() {
        this.chartRef = useRef("chart")
        this.dataSet = []
        onWillStart(async () => {
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js")
            await this.getTtotalSalesPerHourPos()
        })

        onMounted(() => this.renderChart()) // Call renderChart after mounting
    }

    async getTtotalSalesPerHourPos(){
        try {
            const rpc = this.env.services.rpc
            const data = await rpc("/report/get_total_sales_per_hour_pos", {})
            
           
            const filter_even = data.filter(item => item.sale_hour % 2 === 0)
            this.dataSet = filter_even.map(item => item.total_sales)
        } catch (error) {
            console.error('Error fetching getTtotalSalesPerHourPos data:', error);
            return {};
        }
    }


    renderChart = () => { // ✅ Convert to arrow function to keep `this` context
        const DATA_COUNT = 7;
        const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };

        const labels =  ["12am","2am", "4am", "6am", "8am", "12am", "2pm",
            "4pm", "6pm", "8pm", "10pm", "12pm"];

        const CHART_COLORS = {
                red: 'rgb(255, 99, 132)',
                blue: 'rgb(54, 162, 235)',
                green: 'rgb(75, 192, 192)',
                yellow: 'rgb(255, 205, 86)',
                purple: 'rgb(153, 102, 255)',
                orange: 'rgb(255, 159, 64)'
            };

            
        const data = {
            labels: labels,
            datasets: [
                {
                    label: 'Filled',
                    backgroundColor: CHART_COLORS.blue,
                    borderColor:CHART_COLORS.blue,
                    data: this.dataSet,
                    fill: true,
                }
            ]
        };
        new Chart(this.chartRef.el, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allows height adjustment
                plugins: {
                    title: {
                        display: false,
                        text: 'Chart.js Line Chart'
                    },
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Hour'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Value'
                        }
                    }
                }
            },
        });
    }
}

SalesByHourChartRender.template = "owl.SalesByHourChartRender"
