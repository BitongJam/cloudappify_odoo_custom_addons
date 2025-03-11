/** @odoo-module */
import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
import { useService } from "@web/core/utils/hooks";
const { Component, onWillStart, useRef, onMounted, onPatched } = owl;

export class ChartRender extends Component {
  setup() {
    this.chartRef = useRef("chart");
    this.chartInstance = null; // 🔹 Store the chart instance
    this.orm = useService("orm");

    onWillStart(async () => {
      await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js");
    });

    onMounted(() => this.renderChart());

    // onPatched will be trigger if there is change on DOM so that it will replicate if there is changes on the props
    onPatched(() => {
      console.log("Props updated! Updating chart...");
      this.updateChart();
    });
  }

  renderChart() {
    if (!this.props.labels || !this.props.values) {
      console.error("Missing labels or values in props:", this.props);
      return;
    }

    // 🔥 Properly destroy the previous chart before creating a new one
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(this.chartRef.el, {
      type: this.props.type,
      data: {
        labels: this.props.labels,
        datasets: [{
          label: 'PoS Sale Summary Pie Chart',
          data: this.props.values,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: this.props.title,
            position: 'bottom',
          }
        }
      }
    });
  }

  updateChart() {
    if (this.chartInstance) {
      // 🔄 Update chart data dynamically
      this.chartInstance.data.labels = this.props.labels;
      this.chartInstance.data.datasets[0].data = this.props.values;
      this.chartInstance.update();  
    } else {
      this.renderChart();  // If chart is not initialized, render it
    }
  }
}

ChartRender.template = "owl.ChartRender";
