import './setupTest.js'
import { render, screen } from './setupTest.js'
import { within, fireEvent } from '@testing-library/react'
import Home from '../components/Home'
import axios from 'axios'

let getSpy
const mockData = {
  data: [
    'FT008568',
    'FT001576',
    'FT002338',
    'FT003145',
    'FT003119',
    'FT007292',
    'FT001687',
    'FT007424',
    'FT002514',
    'FT002211',
    'FT009059',
    'FT007710',
    'FT006784',
    'FT008932',
    'FT005423',
    'FT000498',
    'FT004748',
    'FT001055',
  ],
}

describe('Home check text', () => {
  beforeEach(() => {
    getSpy = jest.spyOn(axios, 'get').mockImplementation(() => {
      return Promise.resolve(mockData)
    })
    process.env = {
      REACT_APP_BACKEND_URL: 'http://geomean.backend.kinnate',
      REACT_APP_FRONTEND_URL: 'http://geomean.frontend.kinnate',
    }
  })

  afterEach(() => {
    // Reset the axios.get method back to its original implementation
    getSpy.mockReset()
    getSpy.mockRestore()
  })

  it('should render heading', () => {
    render(<Home />)
    // heading
    const textElement = screen.getByText('Kinnate Geomean Viewer')
    expect(textElement).toBeInTheDocument()
    // label
    const textField = screen.getByText('compound-id-for-testing')
    expect(textField).toBeInTheDocument()
    // button
    const button = screen.getByText('Search')
    expect(button).toBeInTheDocument()
    // radio group
    const radioGroup = screen.getByRole('radiogroup')
    const { getByLabelText } = within(radioGroup)
    const option1 = getByLabelText('Biochemical')
    const option2 = getByLabelText('Cellular')

    expect(option1).toBeInTheDocument()
    expect(option2).toBeInTheDocument()
  })

  it('should update the TextField when typed into', async () => {
    render(<Home />)

    const compoundID = mockData[Math.floor(Math.random() * mockData.lengthi)]
    const autocomplete = await screen.findByLabelText('compound-id-for-testing')
    fireEvent.click(autocomplete)

    let input = screen.getByLabelText('compound-id-for-testing', {
      selector: 'input',
    })
    fireEvent.change(input, { target: { value: compoundID } })

    expect(input).toHaveValue(compoundID)
  })
})
