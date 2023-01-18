import Plotly from 'plotly-mini'
import createPlotlyComponent from 'react-plotly.js/factory'
import { useLocation } from 'react-router-dom'

const Plot = createPlotlyComponent(Plotly)

const MSRPlot = () => {
  let tdata = []
  const location = useLocation()
  const { tableData, plotData } = location.state ?? {}

  let layout = {
    title: 'MSR plot',
    xaxis: {
      title: 'Created Date',
      zeroline: false,
    },
    yaxis: {
      title: 'IC50 nM',
      zeroline: false,
    },
  }

  if (plotData && tableData) {
    console.log(plotData)
    console.log(tableData)
    const xDate = []
    const yIC50 = []
    const text = []
    const msr = plotData.pop()
    for (let i = 0; i < tableData.length; i++) {
      xDate.push(tableData[i]['CREATED_DATE'])
      yIC50.push(tableData[i]['IC50_NM'])
      text.push(
        `cmpd_id: ${tableData[i]['COMPOUND_ID']}<br> exp_id: ${tableData[i]['EXPERIMENT_ID']}`
      )
    }
    const gmean = tableData[0]['GEOMEAN']
    // console.log(msr)

    const yMsrPos = Array.from(Array(xDate.length)).fill(gmean + msr['MSR'])
    const yMsrNeg = Array.from(Array(xDate.length)).fill(gmean - msr['MSR'])
    const yGmean = Array.from(Array(xDate.length)).fill(gmean)

    const trace1 = {
      x: xDate,
      y: yIC50,
      mode: 'markers',
      name: 'IC50',
      text: text,
      marker: {
        size: 12,
      },
      hovertemplate:
        '<b>%{text}</b><br><br>' +
        '%{yaxis.title.text}: %{y:.2f}<br>' +
        '%{xaxis.title.text}: %{x}<br>' +
        '<extra></extra>',
    }

    const trace2 = {
      x: xDate,
      y: yMsrPos,
      mode: 'lines',
      name: 'MSR (+)',
      line: {
        color: '#FF7F50',
        dash: 'dashdot',
        width: 2,
      },
      hovertemplate: '%{y}<extra></extra>',
    }

    const trace3 = {
      x: xDate,
      y: yMsrNeg,
      mode: 'lines',
      name: 'MSR (-)',
      line: {
        color: '#FF7F50',
        dash: 'dashdot',
        width: 2,
      },
      hovertemplate: '%{y}<extra></extra>',
    }

    const trace4 = {
      x: xDate,
      y: yGmean,
      mode: 'lines',
      name: 'GEOMEAN',
      line: {
        color: '#6495ED',
        dash: 'dashdot',
        width: 4,
      },
      hovertemplate: '%{y}<extra></extra>',
    }

    tdata = [trace1, trace2, trace3, trace4]

    layout['annotations'] = [
      {
        xref: 'paper',
        yref: 'paper',
        x: 1,
        xanchor: 'left',
        y: 0.5,
        yanchor: 'top',
        text: `<b>MSR</b>: ${
          Math.round((msr['MSR'] + Number.EPSILON) * 100) / 100
        }`,
        showarrow: false,
      },
    ]
  }
  return <Plot data={tdata} layout={layout} />
}

export default MSRPlot
