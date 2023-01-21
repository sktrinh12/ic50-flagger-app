import Plotly from 'plotly-mini'
import createPlotlyComponent from 'react-plotly.js/factory'
import NotFound from './NotFound'

const Plot = createPlotlyComponent(Plotly)

const MSRPlot = ({ msrData }) => {
  if (msrData.data.length) {
    let tdata = []
    const green = 'rgb(52, 235, 61)'
    const red = 'rgb(255, 0, 0)'
    const blue = 'rgb(36, 86, 224)'
    let layout = {
      title: 'MSR plot',
      xaxis: {
        title: 'Geomean (nM)',
        zeroline: false,
        type: 'log',
      },
      yaxis: {
        title: 'Ratios',
        zeroline: false,
        type: 'log',
      },
    }

    // console.log('msrData')
    // console.log(msrData)
    const xs = []
    const ys = []
    const text = []
    const stats = msrData['stats']
    const msr = stats['MSR']
    const mr = stats['MR']
    const min = stats['MIN']
    const max = stats['MAX']
    const rl = stats['RL'] // array
    const lsa = stats['LSA'] // array
    for (let i = 0; i < msrData['data'].length; i++) {
      ys.push(msrData['data'][i]['DIFF_IC50'])
      xs.push(msrData['data'][i]['AVG_IC50'])
      text.push(
        `cmpd_id: ${msrData['data'][i]['COMPOUND_ID']}<br>date: ${msrData['data'][i]['CREATED_DATE']}`
      )
    }
    const gmean = xs.map((e) => Math.pow(10, +e))
    const ratios = ys.map((e) => Math.pow(10, +e))
    // console.log('gmean')
    // console.log(gmean)
    // console.log('ratios')
    // console.log(ratios)

    const trace1 = {
      x: gmean,
      y: ratios,
      mode: 'markers',
      name: 'ratios',
      text: text,
      marker: {
        size: 12,
      },
      hovertemplate:
        '<b>%{text}</b><br><br>' +
        '%{yaxis.title.text}: %{y:.2f}<br>' +
        '%{xaxis.title.text}: %{x}<br>' +
        '',
    }
    const trace2 = {
      x: [min, max],
      y: [rl[0], rl[0]],
      mode: 'lines',
      name: 'RL',
      line: {
        color: green,
        dash: 'dashdot',
        width: 2,
      },
      hovertemplate: '%{y:.2f}',
    }

    const trace3 = {
      x: [min, max],
      y: [rl[1], rl[1]],
      mode: 'lines',
      name: 'RL',
      showlegend: false,
      line: {
        color: green,
        dash: 'dashdot',
        width: 2,
      },
      hovertemplate: '%{y:.2f}',
    }

    const trace4 = {
      x: [min, max],
      y: [lsa[0], lsa[0]],
      mode: 'lines',
      name: 'LsA',
      line: {
        color: red,
        dash: 'dot',
        width: 2,
      },
      hovertemplate: '%{y:.2f}',
    }

    const trace5 = {
      x: [min, max],
      y: [lsa[1], lsa[1]],
      mode: 'lines',
      name: 'LsA',
      showlegend: false,
      line: {
        color: red,
        dash: 'dot',
        width: 2,
      },
      hovertemplate: '%{y:.2f}',
    }

    const trace6 = {
      x: [min, max],
      y: [mr, mr],
      mode: 'lines',
      name: 'MR',
      line: {
        color: blue,
        width: 2,
      },
      hovertemplate: '%{y:.2f}',
    }

    const trace7 = {
      x: [min, max],
      y: [1, 1],
      mode: 'lines',
      name: 'Ref',
      line: {
        color: 'rgb(0,0,0)',
        width: 1,
      },
      hovertemplate: '%{y:.2f}',
    }
    tdata = [trace1, trace2, trace3, trace4, trace5, trace6, trace7]

    layout['annotations'] = [
      {
        xref: 'paper',
        yref: 'paper',
        x: 1,
        xanchor: 'left',
        y: 0.5,
        yanchor: 'top',
        text: `<b>MSR</b>: ${Math.round((msr + Number.EPSILON) * 100) / 100}`,
        showarrow: false,
      },
    ]
    return <Plot data={tdata} layout={layout} config={{ displaylogo: false }} />
  } else {
    return <NotFound />
  }
}

export default MSRPlot
