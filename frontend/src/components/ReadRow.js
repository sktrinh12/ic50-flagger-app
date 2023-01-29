import * as React from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import ReactLoading from 'react-loading'
import { PurpleColour } from './Colour'

const ReadRow = ({
  keyValue,
  data,
  username,
  types,
  columnLoading,
  handleEditClick,
}) => {
  const handleDynamicValue = (columnName, value) => {
    if (columnName === 'FLAG') {
      switch (value) {
        case 0:
          value = 'include'
          break
        case 1:
          value = 'exclude'
          break
        default:
          break
      }
    }

    if (['VARIANT', 'COFACTORS', 'PASSAGE_NUMBER'].includes(columnName)) {
      if (value == null) {
        value = '-'
      }
    }

    if (columnName === 'PLOT') {
      return <img src={'data:image/png;base64, ' + value} alt='EMPTY GRAPH' />
    }
    return value
  }

  var DataFields = null
  let checkIfCellular = 'CELL_INCUBATION_HR' in data
  if (checkIfCellular) {
    if ('N_OF_M' in data) {
      DataFields = require('./TableColumnsCellularStats')
    } else {
      DataFields = require('./TableColumnsCellularAll')
    }
  } else {
    if ('N_OF_M' in data) {
      DataFields = require('./TableColumnsBiochemStats')
    } else {
      DataFields = require('./TableColumnsBiochemAll')
    }
  }

  return (
    <TableRow
      hover
      role='checkbox'
      tabIndex={-1}
      key={keyValue}
      selected={columnLoading}
    >
      {DataFields.columns.map((column, i) => {
        const value = data[column.id]
        let urlArray = [
          '/get-data?compound_id=',
          data.COMPOUND_ID,
          '&type=',
          types[0].split('_')[0] + '_agg',
          '&sql_type=',
          types[1],
          '&cro=',
          data.CRO,
          '&assay_type=',
          data.ASSAY_TYPE,
          '&get_mnum_rows=false',
          '&variant=',
          !data.VARIANT || data.VARIANT === '-' ? 'null' : data.VARIANT,
          '&user_name=',
          username,
        ]

        checkIfCellular
          ? urlArray.push(
              '&cell_line=',
              data.CELL_LINE,
              '&pct_serum=',
              data.PCT_SERUM,
              '&atp_conc_um=',
              data.ATP_CONC_UM,
              '&cell_incubation_hr=',
              data.CELL_INCUBATION_HR
            )
          : urlArray.push(
              '&target=',
              data.TARGET,
              '&atp_conc_um=',
              data.ATP_CONC_UM,
              '&cofactors=',
              !data.COFACTORS || data.COFACTORS === '-'
                ? 'null'
                : data.COFACTORS
            )

        let getURL = urlArray.join('')

        // console.log(`the nested URL: ${getURL}`)

        return (
          <TableCell align={column.align} key={`${keyValue}-${i}`}>
            {columnLoading && column.id === 'GEOMEAN' ? (
              <div style={{ margin: 'auto', padding: '0px' }}>
                <ReactLoading
                  type='spin'
                  color={PurpleColour}
                  height={30}
                  width={30}
                />
              </div>
            ) : column.id === 'GEOMEAN' && data.N_OF_M ? (
              <a href={getURL} target='_blank' rel='noopener noreferrer'>
                {value}
              </a>
            ) : (
              handleDynamicValue(column.id, value)
            )}
          </TableCell>
        )
      })}
      {data && !data.N_OF_M && (
        <TableCell
          align={'center'}
          key={`ACTION-${keyValue}-${data.COMPOUND_ID}`}
        >
          <>
            <button
              type='button'
              onClick={(event) => handleEditClick(event, data)}
            >
              Edit
            </button>
          </>
        </TableCell>
      )}
    </TableRow>
  )
}

export default ReadRow
