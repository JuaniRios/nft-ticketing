import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';
import ButtonAppBar from './components/ButtonAppBar';
import {Web3Context} from './context/web3';
import Home from "./pages/Home";
// import React from "React";
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import CreateEvent from './pages/CreateEvent';

function App() {
  return (<>
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <Web3Context>
        <BrowserRouter>
          <ButtonAppBar/>
            <Routes>

              <Route path="/" element={<Home/>}/>
              <Route path="/create-event" element={<CreateEvent/>}/>

            </Routes>
        </BrowserRouter>
      </Web3Context>
  </ThemeProvider>

    </>)
}

export default App;

const theme = createTheme()