/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
const { Component, onWillStart, useRef, onMounted, onPatched } = owl
import { ColorComponent } from "../colorComponent"

export class TipsDiscountChartRender extends Component {
    setup() {
        this.chartRef = useRef("chart")
        onWillStart(async () => {
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js")
        })

        onMounted(() => this.renderChart()) // Call renderChart after mounting
        onPatched(() => {
            this.updateChart();
        })
    }

    
    updateChart() {
        if (this.chartInstance) {
            // 🔄 Update chart data dynamically
            let data_vals =  this.props.values
            this.chartInstance.data.datasets[0].data =  [data_vals.disc_amnt, data_vals.tips_amnt];
            this.chartInstance.update();
        } else {
            this.renderChart();  // If chart is not initialized, render it
        }
    }

    renderChart = () => { // ✅ Convert to arrow function to keep `this` context
        console.log("tips and discount: ", this.props.values)
        if (!this.props.values) {
            console.error("Missing labels or values in props:", this.props);
            return;
        }

        let data_vals = this.props.values
        console.log('tips_amnt: ', data_vals.tips_amnt, ' discount: ', data_vals.disc_amnt)
        // const CHART_COLORS = {
        //     red: 'rgb(255, 99, 132)',
        //     blue: 'rgb(54, 162, 235)',
        //     green: 'rgb(75, 192, 192)',
        //     yellow: 'rgb(255, 205, 86)',
        //     purple: 'rgb(153, 102, 255)',
        //     orange: 'rgb(255, 159, 64)'
        // };

        const backgroundColors =  ColorComponent.getRandomColor();
        const data = {
            labels: ['Discount', 'Tips'],
            datasets: [
                {
                    label: 'Dataset 1',
                    data: [data_vals.disc_amnt, data_vals.tips_amnt],
                    backgroundColor: [backgroundColors, backgroundColors],
                }
            ]
        };

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(this.chartRef.el, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                        position: 'top',
                    },
                }
            },
        });
    }
}

TipsDiscountChartRender.template = "owl.TipsDiscountChartRender"
