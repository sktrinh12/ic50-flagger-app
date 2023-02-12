import './setupTest.js'
import { render, screen } from './setupTest.js'
import MSRPlot from '../components/MSRPlot'
import DownloadCSVFile from '../components/DownloadCSV'
import PlotlyComponent from 'react-plotly.js'
import NumberInput from '../components/NumberInput'
import { fireEvent } from '@testing-library/react'
import { shallow } from 'enzyme'
import Enzyme from 'enzyme'
import Adapter from '@cfaester/enzyme-adapter-react-18'

Enzyme.configure({ adapter: new Adapter() })

const mockData = {
  data: [
    {
      ID: 0,
      COMPOUND_ID: 'FT003977',
      CREATED_DATE: '2022-11-11T17:53:32',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -6,
    },
    {
      ID: 1,
      COMPOUND_ID: 'FT007578',
      CREATED_DATE: '2022-11-11T17:53:32',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 2,
      COMPOUND_ID: 'FT009070',
      CREATED_DATE: '2022-11-11T17:53:32',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 3,
      COMPOUND_ID: 'FT009067',
      CREATED_DATE: '2022-11-11T17:53:32',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 4,
      COMPOUND_ID: 'FT008741',
      CREATED_DATE: '2022-11-11T17:53:32',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 5,
      COMPOUND_ID: 'FT009069',
      CREATED_DATE: '2022-11-11T17:53:32',
      ROW_COUNT: 2,
      DIFF_IC50: -0.08165297061013899,
      AVG_IC50: -5.04082648530507,
    },
    {
      ID: 6,
      COMPOUND_ID: 'FT008821',
      CREATED_DATE: '2022-11-04T15:34:14',
      ROW_COUNT: 2,
      DIFF_IC50: 0.01943312270286054,
      AVG_IC50: -4.99028343864857,
    },
    {
      ID: 7,
      COMPOUND_ID: 'FT008894',
      CREATED_DATE: '2022-11-04T15:34:14',
      ROW_COUNT: 2,
      DIFF_IC50: -0.015673113631283597,
      AVG_IC50: -5.007836556815642,
    },
    {
      ID: 8,
      COMPOUND_ID: 'FT009007',
      CREATED_DATE: '2022-11-04T15:34:14',
      ROW_COUNT: 2,
      DIFF_IC50: -0.10602739477891537,
      AVG_IC50: -5.053013697389457,
    },
    {
      ID: 9,
      COMPOUND_ID: 'FT008945',
      CREATED_DATE: '2022-11-04T15:34:14',
      ROW_COUNT: 2,
      DIFF_IC50: -0.09062521260930813,
      AVG_IC50: -5.207833432950564,
    },
    {
      ID: 10,
      COMPOUND_ID: 'FT008980',
      CREATED_DATE: '2022-10-21T16:30:53',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 11,
      COMPOUND_ID: 'FT008944',
      CREATED_DATE: '2022-11-04T15:34:14',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 12,
      COMPOUND_ID: 'FT008947',
      CREATED_DATE: '2022-10-21T16:30:53',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 13,
      COMPOUND_ID: 'FT007615',
      CREATED_DATE: '2022-11-04T15:34:14',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 14,
      COMPOUND_ID: 'FT008798',
      CREATED_DATE: '2022-10-28T15:33:22',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 15,
      COMPOUND_ID: 'FT008923',
      CREATED_DATE: '2022-10-13T17:50:37',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 16,
      COMPOUND_ID: 'FT008869',
      CREATED_DATE: '2022-09-30T17:09:29',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 17,
      COMPOUND_ID: 'FT008893',
      CREATED_DATE: '2022-09-23T18:13:12',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 18,
      COMPOUND_ID: 'FT008740',
      CREATED_DATE: '2022-09-30T17:09:29',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
    {
      ID: 19,
      COMPOUND_ID: 'FT008868',
      CREATED_DATE: '2022-09-19T16:37:47',
      ROW_COUNT: 2,
      DIFF_IC50: 0,
      AVG_IC50: -5,
    },
  ],
  stats: {
    MSR: 1.168930268514263,
    STDEV: 0.03389430224356554,
    STDERR: 0.007578996386653617,
    N: 20,
    RL: [0.9400860976592211, 0.9985683869592029],
    LSA: [0.8288656026069092, 1.1325602790004294],
    MR: 0.9688860914175309,
    MIN: -0.10602739477891537,
    MAX: 0.01943312270286054,
  },
}
const metadata = {
  cell: ['Pharmaron', 'CellTiter-Glo', 'Ba/F3', 72, 10, 'null'],
}
const titles = [
  'CRO',
  'Assay type',
  'Cell line',
  'Cell incubation hr',
  '% Serum',
]
let wrapper
const mockNumber = 30

describe('MSR plot components', () => {
  test('Check if plotly, download button and number input components render', () => {
    jest.mock('plotly.js', () => {
      return {
        default: jest.fn(),
      }
    })
    wrapper = shallow(
      <MSRPlot
        msrData={mockData}
        nLimit={mockNumber}
        handleChangeNLimit={null}
        handleNLimitButtonClick={null}
        metadata={metadata}
      />
    )
    // console.log(wrapper.debug())
    expect(wrapper.find(DownloadCSVFile).exists()).toBe(true)
    expect(wrapper.find(PlotlyComponent).exists()).toBe(true)
    expect(wrapper.find(NumberInput).exists()).toBe(true)
  })
  test('check if Download button & metadata renders', () => {
    render(<DownloadCSVFile msrData={mockData} metadata={metadata} />)
    titles.forEach((d, i) => {
      let regexStr = new RegExp(d)
      let pTag = screen.getByText(regexStr)
      expect(pTag).toBeInTheDocument()
      expect(pTag).toHaveTextContent(d)
      regexStr = new RegExp(metadata.cell[i])
      pTag = screen.getByText(regexStr)
      expect(pTag).toBeInTheDocument()
      expect(pTag).toHaveTextContent(metadata.cell[i])
    })
  })
  test('check if Number input renders', () => {
    render(
      <NumberInput
        nLimit={mockNumber}
        handleChangeNLimit={jest.fn()}
        handleNLimitButtonClick={jest.fn()}
      />
    )
    let input = screen.getByLabelText('N Number', { selector: 'input' })
    expect(parseInt(input.value)).toEqual(mockNumber)
    fireEvent.change(input, { target: { value: mockNumber + 1 } })
    // console.log(input)
    expect(parseInt(input.value)).toEqual(mockNumber + 1)
  })
})
