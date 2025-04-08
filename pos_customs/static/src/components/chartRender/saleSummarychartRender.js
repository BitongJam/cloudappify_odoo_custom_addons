/** @odoo-module */
import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
import { useService } from "@web/core/utils/hooks";
const { Component, onWillStart, useRef, onMounted, onPatched } = owl;
import { ColorComponent } from "../colorComponent";

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
      this.updateChart();
    });
  }
  renderChart() {
    if (!this.props.labels || !this.props.values) {
        console.error("Missing labels or values in props:", this.props);
        return;
    }

    // 🔥 Destroy the previous chart before creating a new one
    if (this.chartInstance) {
        this.chartInstance.destroy();
    }

    const labels = Object.values(this.props.labels);
    const values = Object.values(this.props.values);

    // const backgroundColors = ["#FF6384", "#36A2EB", "#FFCE56"]; // Example colors, replace with your own
    const dataValues = this.props.values || [];

    const backgroundColors = dataValues.map(() => ColorComponent.getRandomColor());

    // Merge label with corresponding value
    let new_label = labels.map((label, index) => 
        `${label} - ${values[index].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    );


    this.chartInstance = new Chart(this.chartRef.el, {
      type: this.props.type,
      data: {
          labels: new_label,
          datasets: [{
              label: 'PoS Sale Summary Pie Chart',
              data:dataValues,
              backgroundColor: backgroundColors,
              hoverOffset: 4,
              hidden: false // 🔹 Ensure dataset is visible
          }]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
              legend: {
                  display: false,
                  position: 'right',
                  labels: {
                      generateLabels: (chart) => {
                          return chart.data.labels.map((label, i) => ({
                              text: label,
                              fillStyle: chart.data.datasets[0].backgroundColor[i],
                              fontColor: chart.data.datasets[0].backgroundColor[i],
                              hidden: false, // 🔹 Ensure legend labels are always visible,
                              pointStyle: false,
                          }));
                      },
                      usePointStyle: false,
                      boxWidth: 0, 
                      font: {
                          size: 14,
                          family: 'Arial',
                          weight: 'bold'
                      }
                  }
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
