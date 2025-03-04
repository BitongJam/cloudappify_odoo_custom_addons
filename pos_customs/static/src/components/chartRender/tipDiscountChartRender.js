/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
const { Component, onWillStart, useRef, onMounted } = owl

export class TipsDiscountChartRender extends Component {
    setup() {
        this.chartRef = useRef("chart")
        onWillStart(async () => {
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js")
        })

        onMounted(() => this.renderChart()) // Call renderChart after mounting
    }


    renderChart = () => { // ✅ Convert to arrow function to keep `this` context
    
        const CHART_COLORS = {
            red: 'rgb(255, 99, 132)',
            blue: 'rgb(54, 162, 235)',
            green: 'rgb(75, 192, 192)',
            yellow: 'rgb(255, 205, 86)',
            purple: 'rgb(153, 102, 255)',
            orange: 'rgb(255, 159, 64)'
        };


        const data = {
            labels: ['Discount', 'Tips'],
            datasets: [
              {
                label: 'Dataset 1',
                data: [1000,500],
              }
            ]
          };
        new Chart(this.chartRef.el, {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                }
            },
        });
    }
}

TipsDiscountChartRender.template = "owl.TipsDiscountChartRender"
