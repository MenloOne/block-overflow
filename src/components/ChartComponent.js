import React from 'react'
import {Line} from 'react-chartjs-2'
import {getTickerHistory} from './utils'


const options = {
  responsive: true,
  maintainAspectRatio: false,
  title: {
    display: false
  },
  tooltips: {
    mode: 'label'
  },
  hover: {
    mode: 'dataset'
  },
  scales: {
    xAxes: [{
      gridLines: {
        // You can change the color, the dash effect, the main axe color, etc.
        borderDash: [8, 4],
        color: '#348632'
      }
    }],
    yAxes: [
      {
        display: false
      }
    ]
  }
}

function convertData(data) {
  var obj = {}
  return obj
}

class ChartComponent extends React.Component {

  state = {
    cd: {
      labels: ['-', '-'],
      datasets: [
        {
          label: 'Loading...',
          data: [0, 0]
        }
      ]
    }
  }

  getLabels(data) {
    var i = 0
    return data.map(d => {

      if (i++ % 2 == 0) {
        return ''
      }

      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit'
      }).format(d[0])
    })
  }

  getClose(data) {
    return data.map(d => d[4])
  }

  componentDidMount() {
    getTickerHistory().then(chart => {
      console.log(chart)
      this.setState({
        cd: {
          labels: this.getLabels(chart.data),
          datasets: [
            {
              label: chart.symbol,
              data: this.getClose(chart.data)
            }
          ]
        }
      })
    })
  }

  render() {
    return (
      <div className="charohlc">
        <Line data={this.state.cd} height={200} options={options}/>
      </div>
    )
  }
}

export default ChartComponent
