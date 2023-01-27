import Button from '@mui/joy/Button'
import Download from '@mui/icons-material/Download'
import Box from '@mui/material/Box'

function convertToCSV(objArray) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
  let str = ''

  for (let i = 0; i < array.length; i++) {
    let line = ''
    for (let index in array[i]) {
      if (line !== '') line += ','

      line += array[i][index]
    }

    str += line + '\r\n'
  }
  str =
    'index,compound_id,date,row_count,ic50_1,ic50_2,diff_ic50,avg_ic50\r\n' +
    str
  return str
}

const titles = ['cro', 'assay type']

const DownloadCSVFile = ({ msrData, metadata }) => {
  const data = convertToCSV(msrData.data)
  const file = new Blob(['\ufeff', data])
  const filename = metadata.join('-') + '.csv'
  metadata.includes('cell_line')
    ? titles.push('Cell line', 'Cell incubation hr', '% Serum')
    : titles.push('Target', 'ATP Conc uM', 'Cofactors')
  titles.push('Variant')
  return (
    <>
      <Box
        sx={{
          '& > :not(style)': {
            m: 1,
          },
          marginLeft: '22px',
          padding: '2px',
        }}
      >
        {Array.from(Array(metadata.length)).map((undef, i) => {
          return (
            <p key={`metadata_${i}`}>
              <b>{titles[i]}</b>: {metadata[i]}
            </p>
          )
        })}
      </Box>
      <Box
        sx={{
          '& > :not(style)': {
            m: 1,
          },
          textAlign: 'left',
          marginLeft: '5px',
        }}
      >
        <Button
          component='a'
          href={URL.createObjectURL(file)}
          startDecorator={<Download />}
          download={filename}
        >
          {`Download CSV`}
        </Button>
      </Box>
    </>
  )
}

export default DownloadCSVFile
