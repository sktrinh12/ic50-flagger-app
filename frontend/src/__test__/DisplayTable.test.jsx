import React from 'react'
import { render, screen } from './setupTest.js'
import { waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DisplayTable from '../components/DisplayTable.tsx'
import axios from 'axios'
import mockData from './mockBioData'

let getSpy
const titles = [
  'Assay Type',
  'Compound',
  'Target',
  'Variant',
  'Cofactors',
  'ATP Conc (uM)',
  'Geomean nM',
  'Stdev',
  'n of m',
]

let promises

describe('DisplayTable component', () => {
  beforeEach(() => {
    getSpy = jest.spyOn(axios, 'get').mockImplementation(() => {
      return Promise.resolve(mockData)
    })
    process.env = {
      REACT_APP_BACKEND_URL: 'http://geomean.backend.prod.kinnate',
    }
    const mockHref =
      'compound_id=FT006787&type=biochem_stats&sql_type=get&get_mnum_rows=false&cro=Pharmaron&assay_type=Caliper&target=CDK2&atp_conc_um=10&cofactors=null'
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { search: mockHref },
    })
  })

  afterEach(() => {
    // Reset the axios.get method back to its original implementation
    getSpy.mockReset()
    getSpy.mockRestore()
  })

  // the backend fetch api url uses 'fetch-data'
  it('renders table with correct data based on query parameters', async () => {
    render(
      <MemoryRouter initialEntries={['/get-data']}>
        <DisplayTable />
      </MemoryRouter>
    )
    // console.info(window.location.href)
    expect(getSpy).toHaveBeenCalled()

    const table = await screen.findAllByRole('table')
    expect(table[0]).toBeInTheDocument()
    promises = titles.map((title, index) =>
      waitFor(() => {
        expect(table[0]).toHaveTextContent(title)
      })
    )
    await Promise.all(promises)

    const rows = await screen.findAllByRole('row')
    // screen.debug(rows[0])
    expect(rows).toHaveLength(mockData.data.length + 1) // rows per page = 10; +1 for header
    promises = mockData.data.map((item, index) =>
      waitFor(() => {
        expect(rows[index + 1]).toHaveTextContent(item.TARGET)
      })
    )
    await Promise.all(promises)
    promises = mockData.data.map((item, index) =>
      waitFor(() => {
        expect(rows[index + 1]).toHaveTextContent(item.GEOMEAN)
      })
    )
    await Promise.all(promises)
  })
})
