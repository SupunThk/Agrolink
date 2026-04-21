import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ContextProvider } from './context/Context';
import axios from "axios";

axios.defaults.baseURL = "/api/";
// Prevent the UI from hanging indefinitely if a request stalls.
axios.defaults.timeout = 15000;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ContextProvider>
      <App />
    </ContextProvider>
  </React.StrictMode>,
);
