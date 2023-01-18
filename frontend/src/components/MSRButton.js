import InsertChartIcon from '@mui/icons-material/InsertChart'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/joy/IconButton'

const MSRButton = ({ handleNavToPlot }) => {
  // dtype, stype, cro, assay,
  // param1(cell_line|target),
  // param2(cell_incubation_hr|atp_conc_um),
  // param3(pct_serum|cofactors)
  // const rx = new RegExp(/type=\w+_agg&/)
  // let newUrl = paramStr.replace(rx, 'type=msr_data&')
  // newUrl = `${newUrl.replace('8000', '3000').replace('v1/fetch-data', 'plot')}`
  // console.log(newUrl)
  return (
    <>
      <Divider />

      <IconButton
        aria-label='MSR Plot'
        onClick={() => {
          handleNavToPlot()
        }}
      >
        <InsertChartIcon />
        {'MSR Plot'}
      </IconButton>
      <Divider />
    </>
  )
}

export default MSRButton
