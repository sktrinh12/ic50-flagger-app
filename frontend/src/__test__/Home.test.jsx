import './setupTest.js'
import { render, screen } from './setupTest.js'
import { within, fireEvent } from '@testing-library/react'
import Home from '../components/Home'

describe('Home check text', () => {
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

    const compoundID = 'FT003421'
    const autocomplete = await screen.findByLabelText('compound-id-for-testing')
    fireEvent.click(autocomplete)

    let input = screen.getByLabelText('compound-id-for-testing', {
      selector: 'input',
    })
    fireEvent.change(input, { target: { value: compoundID } })

    expect(input).toHaveValue(compoundID)
  })
})
