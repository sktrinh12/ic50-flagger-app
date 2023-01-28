import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
// import '@testing-library/jest-dom'

window.URL.createObjectURL = function () {}

export { render, screen }
