/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
import { useService } from "@web/core/utils/hooks";
import { useState } from "@odoo/owl";

const { Component, onWillStart, useRef, onMounted, onPatched } = owl

export class PaymentMethodChartRender extends Component {
    setup() {
        this.orm = useService("orm")
        this.chartRef = useRef("chart")
        this.chartInstance = null;
        onWillStart(async () => {
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js")
            // await this.getPosPayment();
        })
        this.state = useState({
            labels:this.props.dataValues,
            dataValues:this.props.dataValues
        })
        onMounted(() => this.renderChart()) // Call renderChart after mounting

        onPatched(() => {
            console.log("Props updated! Updating chart...");
            this.updateChart();
          });
    }

    

    getRandomColor = () => {
        const r = Math.floor(Math.random() * 50);  // Keep red low (0-50)
        const g = Math.floor(Math.random() * 200) + 55; // Green is dominant (55-255)
        const b = Math.floor(Math.random() * 50);  // Keep blue low (0-50)
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
    };


    updateChart() {
        if (this.chartInstance) {
          // 🔄 Update chart data dynamically
          this.chartInstance.data.labels = this.props.labels;
          this.chartInstance.data.datasets[0].data = this.props.dataValues;
          this.chartInstance.update();  
        } else {
          this.renderChart();  // If chart is not initialized, render it
        }
      }

     renderChart = () => { // ✅ Convert to arrow function to keep `this` context
     // Fetch data dynamically

    // Transform fetched data into labels and values
    const labels = this.state.labels || [];
    const dataValues = this.state.dataValues || [];

    const backgroundColors = dataValues.map(() => this.getRandomColor()); // ✅ Now it works!
    const borderColors = backgroundColors.map(color => color.replace('0.7', '1')); // Adjust opacity

    if (this.chartInstance) {
        this.chartInstance.destroy();
      }

    this.chartInstance = new Chart(this.chartRef.el, {
        type: this.props.type,
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Payment Methods',
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    hoverOffset: 4
                }
            ]
        },
        options: {
            elements: {
                bar: {
                    borderWidth: 2,
                    barThickness: 10 | 'flex',
                }
            },
            responsive: true,
            maintainAspectRatio: false, // Allows height adjustment
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false,
                    position: 'top',
                },
                title: {
                    display: false,
                    text: this.props.title,
                    position: 'bottom',
                }
            }
        },
    });
}
}

PaymentMethodChartRender.template = "owl.PaymentMethodChartRender"
