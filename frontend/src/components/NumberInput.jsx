import * as React from 'react'
import { NumericFormat } from 'react-number-format'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import Button from '@mui/joy/Button'

export default function NumberInput({
  nLimit,
  handleChangeNLimit,
  handleNLimitButtonClick,
}) {
  return (
    <Box
      sx={{
        '& > :not(style)': {
          m: 1,
        },
        textAlign: 'left',
        marginLeft: '25px',
      }}
    >
      <NumericFormat
        label='N Number'
        value={nLimit}
        onChange={handleChangeNLimit}
        customInput={TextField}
        id='formatted-numberformat-input'
        variant='standard'
      />
      <Button
        size={'lg'}
        startDecorator={<AnalyticsIcon />}
        onClick={handleNLimitButtonClick}
      >
        Re-calc
      </Button>
    </Box>
  )
}
