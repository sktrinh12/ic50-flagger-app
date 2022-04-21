import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { StyledEngineProvider } from '@mui/material/styles';
import DisplayTable from "./components/DisplayTable";

ReactDOM.createRoot(document.querySelector("#root")).render(
  <StyledEngineProvider injectFirst>
    <DisplayTable className="app-container" />
  </StyledEngineProvider>
);
