import RadioButtonsGroup from './RadioButton'
import * as React from 'react'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

const EditableRow = ({
  keyValue,
  data,
  flag,
  commentRef,
  handleEditFormChange,
  handleCancelClick,
}) => {
  const renderContent = (param, column) => {
    return (
      <>
        {[0, 1].includes(param) && column === 'FLAG' ? (
          <RadioButtonsGroup
            flag={flag}
            data={data}
            commentRef={commentRef}
            handleEditFormChange={handleEditFormChange}
          />
        ) : param ? (
          param.length > 60 ? (
            <img src={'data:image/png;base64, ' + param} alt='EMPTY' />
          ) : (
            param
          )
        ) : (
          '-'
        )}
      </>
    )
  }

  var DataFields = null
  if ('WASHOUT' in data) {
    DataFields = require('./TableColumnsCellularAll')
  } else {
    DataFields = require('./TableColumnsBiochemAll')
  }

  return (
    <TableRow hover tabIndex={-1} key={keyValue}>
      {DataFields.columns.map((column, i) => {
        const value = data[column.id]
        return (
          <TableCell align={column.align} key={`${keyValue}-${i}`} size='small'>
            {renderContent(value, column.id)}
          </TableCell>
        )
      })}
      <TableCell
        align={'center'}
        key={`ACTION-${
          parseInt(keyValue.replace(/^\D+/g, '')) + Math.random()
        }`}
      >
        <>
          <button type='submit'>Save</button>
          <button type='button' onClick={handleCancelClick}>
            Cancel
          </button>
        </>
      </TableCell>
    </TableRow>
  )
}

export default EditableRow
