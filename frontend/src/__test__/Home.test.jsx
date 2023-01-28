import './setupTest.js'
import { render, screen } from './setupTest.js'
import Home from '../components/Home'

test('Check Home endpoint', () => {
  render(<Home />)
  const textElement = screen.getByText('HOME ENDPOINT')
  expect(textElement).toBeInTheDocument()
})
