import {timeParse} from 'd3-time-format'
import config from './internals/config/private'

function parseData(parse) {
  return function (d) {
    d.date = parse(d.date)
    d.open = +d.open
    d.high = +d.high
    d.low = +d.low
    d.close = +d.close
    d.volume = +d.volume
    return d
  }
}

function convertData(data) {
  var keys = ['date', 'open', 'close', 'hight', 'low', 'volume'],
    i = 0, k = 0,
    obj = null,
    output = []

  for (i = 0; i < data.length; i++) {
    obj = {}
    obj[keys[0]] = new Date(data[i][0])
    for (k = 1; k < keys.length; k++) {
      obj[keys[k]] = parseInt(data[i][k])
    }
    output.push(obj)
  }
  return output
}

const parseDate = timeParse('%Y-%m-%d')

export function getTickerHistory(symbol, interval) {

  const promiseMSFT = fetch(`${config.apiURL}/red/chart?symbol=${symbol ? symbol : 'ETHUSDT'}&interval=1w`)
    .then(response => response.json())
    .then(dataResp => {
      return dataResp.chart
    })
    .catch((e) => console.log(e))

  return promiseMSFT
}
