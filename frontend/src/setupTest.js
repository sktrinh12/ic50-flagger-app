import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
// import { configure } from 'enzyme'
// import Adapter from '@cfaester/enzyme-adapter-react-18'
// configure({ adapter: new Adapter() })
window.URL.createObjectURL = function () {}
export { render, screen }
