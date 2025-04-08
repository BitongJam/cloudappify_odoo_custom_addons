/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
import { useService } from "@web/core/utils/hooks";
import { useState } from "@odoo/owl";
import { ColorComponent } from "../colorComponent";
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
        // this.colorPalette = ["#D9ECF2", "#F56A79", "#1AA587", "#002D40"]; // ✅ Moved inside `this`
        // ColorComponent.getRandomColor()
        this.state = useState({
            labels:this.props.labels,
            dataValues:this.props.dataValues
        })
        onMounted(() => this.renderChart()) // Call renderChart after mounting

        onPatched(() => {
            this.updateChart();
          });
    }

    
    getRandomColor = () => {
        return this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)]; // ✅ Now it picks from the palette
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

    const backgroundColors = dataValues.map(() => ColorComponent.getRandomColor()); // ✅ Now it works!
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
