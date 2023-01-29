import React from 'react'
import { render, screen } from './setupTest.js'
import { waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DisplayTable from '../components/DisplayTable.tsx'
import axios from 'axios'
import mockData from '../__mocks__/data'

let getSpy

describe('DisplayTable component', () => {
  beforeEach(() => {
    getSpy = jest.spyOn(axios, 'get').mockImplementation(() => {
      return Promise.resolve(mockData)
    })
  })

  // afterEach(() => {
  //   // Reset the axios.get method back to its original implementation
  //   getSpy.mockReset()
  //   getSpy.mockRestore()
  // })

  // the backend fetch api url uses 'fetch-data'
  it('renders table with correct data based on query parameters', async () => {
    const dtype = 'biochem_stats'
    const stype = 'get'
    render(
      <MemoryRouter
        initialEntries={[`/get-data?type=${dtype}&sql_type=${stype}`]}
      >
        <DisplayTable />
      </MemoryRouter>
    )
    // console.info(window.location.href)
    expect(getSpy).toHaveBeenCalled()

    await waitFor(() => {
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      expect(table).toHaveTextContent('CRO')
      expect(table).toHaveTextContent('Assay Type')
      expect(table).toHaveTextContent('Compound ID')
    })

    // await waitFor(() => {
    //   const row = screen.queryAllByRole('row')
    //   expect(row).toHaveLength(mockData.data.length + 1)
    //   expect(row[1]).toHaveTextContent('AXL')
    //   expect(row[2]).toHaveTextContent('KDR')
    //   expect(row[3]).toHaveTextContent('LCK')
    // screen.debug(row)
    // })
  })
})
