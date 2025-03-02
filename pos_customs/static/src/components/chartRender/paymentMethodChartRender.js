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

        onMounted(() => this.renderChart())
    }

    renderChart() {
        new Chart(this.chartRef.el,
            {
                type: this.props.type,
                data: {
                    labels: [
                        'Cash',
                        'Check',
                        'GCash',
                        'Maya',
                        'Go tyme'
                    ],
                    datasets: [
                        {
                            label: 'My First Dataset',
                            data: [300, 50, 100, 500, 30],
                            hoverOffset: 4
                        }]
                },
                options: {
                    elements: {
                        bar: {
                            borderWidth: 2,
                            barThickness:10 | 'flex',
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false, // Allows height adjustment
                    indexAxis: 'y',
                    plugins: {
                        legend: {
                            display:false,
                            position: 'top',
                        },
                        title: {
                            display: false,
                            text: this.props.title,
                            position: 'bottom',
                        }
                    }
                },
            }
        );
    }
}

PaymentMethodChartRender.template = "owl.PaymentMethodChartRender"