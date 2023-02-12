import { useEffect, useState, useRef, createRef } from 'react'
import ReadRow from './ReadRow'
import EditableRow from './EditableRow'
import EnchancedTableHead from './EnhancedTableHead'
import * as React from 'react'
import axios from 'axios'
import ReactLoading from 'react-loading'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import Box from '@mui/material/Box'
import { sortedRowInformation, getComparator } from './TableSortFunctions'
import { PurpleColour } from './Colour'
import FilterTab from './FilterTab'
import MSRPlot from './MSRPlot'

interface TableDataType {
  ID: number
  PID: string
  EXPERIMENT_ID: string
  BATCH_ID: string
  CRO?: string
  ASSAY_TYPE?: string
  COMPOUND_ID?: string
  TARGET?: string
  CELL_LINE?: string
  CELL_INCUBATION_HR?: number
  PCT_SERUM?: number
  WASHOUT?: string
  ATP_CONC_UM?: number
  COFACTORS?: string
  VARIANT?: string
  FLAG: number
  GEOMEAN?: number
  COMMENT_TEXT?: string
  CHANGE_DATE?: Date
  USER_NAME?: string
  PLOT?: string
}

interface PostDataType {
  PID: string
  FLAG: number
  COMMENT_TEXT: string
  CHANGE_DATE: Date
  USER_NAME: string
  GEOMEAN?: number
  PLOT?: string
  COMPOUND_ID?: string
  CRO?: string
  ASSAY_TYPE?: string
  VARIANT?: string
  BATCH_ID?: string
}

export default function DisplayTable() {
  const { REACT_APP_BACKEND_URL } = process.env || 'http://localhost:8000'
  const [tableData, setTableData] = useState<TableDataType[]>([
    {
      ID: 0,
      PID: 'pid',
      EXPERIMENT_ID: 'expid123',
      BATCH_ID: 'batch123',
      FLAG: 0,
    },
  ])
  const [msrData, setMsrData] = useState([])
  const [nLimit, setNLimit] = useState(0)
  const [msrPlotLoading, setMsrPlotLoading] = useState(false)

  // for comment and username references
  const commentRefs = useRef<Array<React.RefObject<HTMLInputElement>>>([])

  // PARAMETERS
  const [flag, setFlag] = useState<number>(0)
  const [editFlag, setEditFlag] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [columnLoading, setColumnLoading] = useState<(string | null)[]>([])
  // MUI TABLE
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [filterFn, setFilterFn] = useState({
    fn: (items: TableDataType[]) => {
      return items
    },
  })
  // PAGE CONTROLS
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('ID')
  const rootURL = `${REACT_APP_BACKEND_URL}/v1/fetch-data?compound_id=`
  const [open, setOpen] = useState(false)

  const axiosConfig = {
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const urlParams = new URLSearchParams(window.location.search)
  const urlParamsObj = Object.fromEntries(urlParams)
  // console.log(urlParamsObj)
  // console.log(urlParams.toString())
  let newURL = `${rootURL.replace('compound_id=', '')}${urlParams.toString()}`

  if (urlParamsObj.type === 'msr_data') {
    newURL = `${newURL}&n_limit=${nLimit !== 0 ? nLimit : 20}`
  }

  let dtype = urlParamsObj['type']
  let stype = urlParamsObj['sql_type']
  let username = urlParamsObj['username'] ?? 'TESTADMIN'
  let variant =
    urlParamsObj['variant'] === '-' ? 'null' : urlParamsObj['variant']
  let param1 = 'cell_line' in urlParamsObj ? 'cell' : 'bio'

  // console.log(newURL)
  // plotting data
  const fetchPlotData = async () => {
    const url = `${newURL.replace('3000', '8000')}`
    console.log(url)
    await axios
      .get(url, axiosConfig)
      .then(async (res) => {
        const json = res.data
        if (res.status === 200) {
          setMsrData(json)
          // console.log(msrData)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.log('AXIOS ERROR: ', err)
      })
  }

  // fetch the rows of data from db
  const fetchData = async (getMRows = false) => {
    if ('get_mnum_rows' in urlParamsObj) {
      const getMRowsStr = getMRows.toString().replace(/[\n\r]+/g, '')
      urlParamsObj.get_mnum_rows = getMRowsStr
    }
    await axios
      .get(newURL, axiosConfig)
      .then(async (res) => {
        const json = res.data
        if (
          typeof REACT_APP_BACKEND_URL !== 'undefined' &&
          REACT_APP_BACKEND_URL.match(/localhost/g)
        ) {
          // console.log(`url: ${newURL}`)
          // console.log(json)
        }
        if (res.status === 200) {
          getMRows ? setMrowsData(json) : setTableData(json)
          // create dynamic refs for comments
          const tableLength = tableData.length
          // console.log(`table length: ${tableLength}`)
          if (commentRefs.current.length !== tableLength) {
            commentRefs.current = Array(tableLength)
              .fill(undefined)
              .map((_, i) => commentRefs.current[i] || createRef())
          }
        }
        setLoading(false)
      })
      .catch((err) => {
        console.log('AXIOS ERROR: ', err)
      })
  }

  useEffect(() => {
    if (dtype === 'msr_data') {
      fetchPlotData()
      setMsrPlotLoading(true)
    } else {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // change only affected rows and values
  const setMrowsData = (postDataRows: PostDataType) => {
    console.log('ROWS')
    console.log(postDataRows)
    console.log('------------')
    console.log('TABLEDATA')

    const newTableData = tableData.map((a: TableDataType) => {
      // avoid TS forEach does not exist for PostDataType error
      ;(postDataRows as any).forEach((e: PostDataType) => {
        if (a.PID === e.PID) {
          a.GEOMEAN = e.GEOMEAN
          a.COMMENT_TEXT = e.COMMENT_TEXT
          a.CHANGE_DATE = e.CHANGE_DATE
          a.USER_NAME = e.USER_NAME
        }
      })
      return a
    })
    console.log(newTableData)
    setTableData(newTableData)
    setColumnLoading([])
  }

  const handleNLimitButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    fetchPlotData()
  }

  const handleChangeNLimit = (event: React.ChangeEvent<HTMLButtonElement>) => {
    setNLimit(parseInt(event.target.value))
    // console.log(nLimit)
  }

  const handleFilterIconClick = () => {
    setOpen(!open)
  }

  // set the flag value when click on radio button
  const handleEditFormChange = (
    event: React.ChangeEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    // console.log(event.target.value)
    const flagValue = parseInt(event.target.value)
    setFlag(flagValue)
  }

  // post data to db
  const handleEditFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const url = [
      REACT_APP_BACKEND_URL,
      '/v1/change-data?sql_type=update&type=',
      dtype.split('_')[0],
      '&user_name=',
      username,
    ].join('')
    console.log(`url: ${url}`)

    const newTableData = [...tableData]
    const index = tableData.findIndex((tdata) => tdata.ID === editFlag)

    // console.log(`flag: ${flag}`)
    newTableData[index]['FLAG'] = flag
    setEditFlag(null)
    let tmpPostDataObj = Object.assign({}, newTableData[index])

    /* use Babel you can use the following syntax to copy property 
				PLOT from tmpPostData into variable PLOT and then copy 
				rest of properties into variable postDataObj; to exclude in payload
		*/
    let { PLOT, ...postDataObj } = tmpPostDataObj

    let pids = newTableData
      .map((td: TableDataType) =>
        td.COMPOUND_ID === postDataObj.COMPOUND_ID &&
        td.CRO === postDataObj.CRO &&
        td.ASSAY_TYPE === postDataObj.ASSAY_TYPE &&
        td.VARIANT === postDataObj.VARIANT &&
        ('CELL_LINE' in td
          ? td.CELL_LINE === postDataObj.CELL_LINE &&
            td.PCT_SERUM === postDataObj.PCT_SERUM &&
            td.WASHOUT === postDataObj.WASHOUT &&
            td.CELL_INCUBATION_HR === postDataObj.CELL_INCUBATION_HR
          : td.TARGET === postDataObj.TARGET &&
            td.COFACTORS === postDataObj.COFACTORS &&
            td.ATP_CONC_UM === postDataObj.ATP_CONC_UM)
          ? td.PID
          : null
      )
      .filter((e) => e !== null)
    console.log(`pids: ${pids}`)
    setColumnLoading(pids)

    tmpPostDataObj['COMMENT_TEXT'] = handleElmChangeFromRef(index)
    tmpPostDataObj['USER_NAME'] = username // over-write the username
    // Using Object Destructuring and Property Shorthand to select certain keys
    tmpPostDataObj = (({
      ID,
      BATCH_ID,
      EXPERIMENT_ID,
      FLAG,
      PID,
      COMMENT_TEXT,
      USER_NAME,
    }) => ({
      ID,
      BATCH_ID,
      EXPERIMENT_ID,
      FLAG,
      PID,
      COMMENT_TEXT,
      USER_NAME,
    }))(tmpPostDataObj)
    console.log(tmpPostDataObj)

    axios
      .post(url, tmpPostDataObj, axiosConfig)
      .then((res) => {
        if (res.status === 200) {
          fetchData(true)
        }
        console.log('RESPONSE RECEIVED: ', res)
      })
      .catch((err) => {
        console.log('AXIOS ERROR: ', err)
      })
  }

  // grab the comment using vanilla js and indexing the elm ref
  const handleElmChangeFromRef = (idx: number) => {
    const inputEl = commentRefs.current[idx]
    if (inputEl && inputEl.current) {
      const parentElm = inputEl.current as HTMLElement
      const textValue = parentElm.getElementsByTagName('textarea')[0].value
      return textValue
    }
    return ''
  }

  // trigger change to edit mode for <ReadRow>
  const handleEditClick = (
    event: React.ChangeEvent<HTMLButtonElement>,
    tdata: TableDataType
  ) => {
    event.preventDefault()
    setEditFlag(tdata.ID)
    // console.log(tdata.ID)

    // console.log(tdata.FLAG)
    setFlag(tdata.FLAG)
  }

  // cancel from edit mode
  const handleCancelClick = () => {
    setEditFlag(null)
  }

  // for pagination
  const handleChangePage = (
    event: MouseEvent<HTMLButtonElement, MouseEvent>,
    newPage: number
  ) => {
    setPage(newPage)
  }

  // for number of pages
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  // sort the columns based on a key (field name)
  const handleRequestSort = (property: keyof TableDataType): void => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  // filter rows based on input text
  const handleSearchFilter =
    (field: keyof TableDataType) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let target = e.target
      setFilterFn({
        fn: (items) => {
          if (target.value === '') return items
          else
            return items.filter((x: TableDataType) =>
              new RegExp(target.value.toLowerCase(), 'i').test(
                (x[field] as string).toLowerCase()
              )
            )
        },
      })
    }

  return (
    <>
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <div style={{ margin: 'auto', padding: '10px' }}>
            <ReactLoading
              type='spin'
              color={PurpleColour}
              height={667}
              width={375}
            />
          </div>
        </Box>
      ) : msrPlotLoading ? (
        <MSRPlot
          msrData={msrData}
          nLimit={nLimit !== 0 ? nLimit : 20}
          handleChangeNLimit={handleChangeNLimit}
          handleNLimitButtonClick={handleNLimitButtonClick}
          metadata={
            param1 === 'cell'
              ? {
                  cell: [
                    urlParamsObj.cro,
                    urlParamsObj.assay_type,
                    urlParamsObj.cell_line,
                    urlParamsObj.cell_incubation_hr,
                    urlParamsObj.pct_serum,
                    variant,
                  ],
                }
              : {
                  bio: [
                    urlParamsObj.cro,
                    urlParamsObj.assay_type,
                    urlParamsObj.target,
                    urlParamsObj.atp_conc_um,
                    urlParamsObj.cofactors,
                    variant,
                  ],
                }
          }
        />
      ) : (
        <Box sx={{ width: '100%' }}>
          <form onSubmit={handleEditFormSubmit}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 1000 }}>
                <FilterTab
                  dtype={dtype}
                  open={open}
                  handleSearchFilter={handleSearchFilter}
                />
                <Table stickyHeader aria-label='sticky table'>
                  <EnchancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    type={dtype}
                    handleFilterIconClick={handleFilterIconClick}
                  />
                  <TableBody>
                    {sortedRowInformation(
                      filterFn.fn(tableData),
                      getComparator(order, orderBy)
                    )
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((tdata: TableDataType, i: number) => (
                        <React.Fragment key={i}>
                          {editFlag === tdata.ID ? (
                            <EditableRow
                              keyValue={`row-edit-${i}`}
                              data={tdata}
                              handleEditFormChange={handleEditFormChange}
                              flag={flag}
                              commentRef={(
                                el: React.RefObject<HTMLInputElement>
                              ) => (commentRefs.current[i] = el)}
                              handleCancelClick={handleCancelClick}
                            />
                          ) : (
                            <ReadRow
                              keyValue={`row-read-${i}`}
                              data={tdata}
                              username={username}
                              types={[dtype, stype]}
                              columnLoading={
                                columnLoading.includes(tdata?.PID)
                                  ? true
                                  : false
                              }
                              handleEditClick={handleEditClick}
                            />
                          )}
                        </React.Fragment>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component='div'
                count={tableData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </form>
        </Box>
      )}
    </>
  )
}
