/** @odoo-module */

import { registry } from "@web/core/registry"
import { loadJS } from "@web/core/assets"
import { useService } from "@web/core/utils/hooks";
const { Component, onWillStart, useRef, onMounted } = owl

export class ChartRender extends Component {
  setup() {
    this.chartRef = useRef("chart")
    this.chartData = { labels: [], datasets: [] };
    this.orm = useService("orm")
    onWillStart(async () => {
      await loadJS("https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js")
      await this.fetchChartData();
    })

    onMounted(() => this.renderChart())
  }

  async fetchChartData() {
    try {
      const rec = await this.orm.call(
        "pos.config",
        "get_pos_config_total_sale", [], {}
      )

      if (rec && Array.isArray(rec)) {
        this.chartData.labels = rec.map(item => item.config_name);
        this.chartData.datasets = rec.map(item => Number(item.total_sales.replace(/,/g, '')));

        console.log("charDAta labels",this.chartData.labels);
        console.log("charDAta datasets",this.chartData.datasets);
      }
  

    } catch (error) {
      console.error("Error fetching records:", error);
    }

  }
  renderChart() {
    new Chart(this.chartRef.el,
      {
        type: this.props.type,
        data: {
          labels: 
            this.chartData.labels
          ,
          datasets: [
            {
              label: 'PoS Sale Summary Pie Chart',
              data: this.chartData.datasets,
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
        },
      }
    );
  }
}

ChartRender.template = "owl.ChartRender"