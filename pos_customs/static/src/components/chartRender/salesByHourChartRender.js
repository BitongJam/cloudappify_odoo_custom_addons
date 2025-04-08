/** @odoo-module */

import { registry } from "@web/core/registry";
import { loadJS } from "@web/core/assets";
const { Component, onWillStart, useRef, onMounted, onPatched } = owl;
import { ColorComponent } from "../colorComponent";

export class SalesByHourChartRender extends Component {
    setup() {
        this.chartRef = useRef("chart");
        this.dataSet = [];
        onWillStart(async () => {
            await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js");
        });

        onMounted(() => this.renderChart()); // Call renderChart after mounting
        onPatched(() => {
            this.updateChart();
        });
    }

    convertToAmPm(hour) {
        let h = parseInt(hour, 10);
        let suffix = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12; // Convert 0 -> 12, 13 -> 1, etc.
        return `${h} ${suffix}`;
    }

    updateChart() {

        if (this.chartInstance) {
            // Generate full 24-hour range (00–23)
            const fullHourLabels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

            // Convert to AM/PM format
            const amPmLabels = fullHourLabels.map(hour => this.convertToAmPm(hour));

            // Create a map of existing values
            const dataMap = new Map(this.props.labelValues.map((label, index) => [label, this.props.dataValues[index]]));

            // Fill in missing hours with 0
            const fixedDataValues = fullHourLabels.map(hour => dataMap.get(hour) || 0);

            // Update chart data
            this.chartInstance.data.labels = amPmLabels;
            this.chartInstance.data.datasets[0].data = fixedDataValues;
            this.chartInstance.update();
        } else {
            this.renderChart(); // If chart is not initialized, render it
        }
    }

    renderChart = () => { // ✅ Convert to arrow function to keep `this` context

        const fullHourLabels = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
        const amPmLabels = fullHourLabels.map(hour => this.convertToAmPm(hour));

        // Create a map of existing values
        const dataMap = new Map(this.props.labelValues.map((label, index) => [label, this.props.dataValues[index]]));

        // Fill in missing hours with 0
        const fixedDataValues = fullHourLabels.map(hour => dataMap.get(hour) || 0);

        const backgroundColors = ColorComponent.getRandomColor();
        const color = backgroundColors;

        const data = {
            labels: amPmLabels,
            datasets: [
                {
                    label: 'Sales',
                    backgroundColor: color,
                    borderColor: color,
                    data: fixedDataValues,
                    fill: true,
                }
            ]
        };

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(this.chartRef.el, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allows height adjustment
                plugins: {
                    title: {
                        display: false,
                        text: 'Sales by Hour'
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
                            text: 'Hour (AM/PM)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Total Sales'
                        }
                    }
                }
            },
        });
    }
}

SalesByHourChartRender.template = "owl.SalesByHourChartRender";
