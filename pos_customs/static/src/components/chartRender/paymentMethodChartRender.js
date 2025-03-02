/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
const { Component, onWillStart, useRef, onMounted } = owl

export class PaymentMethodChartRender extends Component {
    setup() {
        this.chartRef = useRef("chart")
        onWillStart(async () => {
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js")
        })

        onMounted(() => this.renderChart()) // Call renderChart after mounting
    }

    getRandomColor = () => {
        const r = Math.floor(Math.random() * 50);  // Keep red low (0-50)
        const g = Math.floor(Math.random() * 200) + 55; // Green is dominant (55-255)
        const b = Math.floor(Math.random() * 50);  // Keep blue low (0-50)
        return `rgba(${r}, ${g}, ${b}, 0.7)`;
    };
    

    renderChart = () => { // ✅ Convert to arrow function to keep `this` context
        const labels = ['Cash', 'Check', 'GCash', 'Maya', 'Go Tyme'];
        const dataValues = [300, 50, 100, 500, 30];

        const backgroundColors = dataValues.map(() => this.getRandomColor()); // ✅ Now it works!
        const borderColors = backgroundColors.map(color => color.replace('0.7', '1')); // Adjust opacity

        new Chart(this.chartRef.el, {
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
