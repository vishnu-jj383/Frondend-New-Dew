import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import { Provider } from 'jotai';
const root = ReactDOM.createRoot(document.getElementById('root'));
// window.url = "https://yjw3rixw15.execute-api.ap-south-1.amazonaws.com/prod/api/v1/";
// window.url = "http://127.0.0.1:8000/api/auth";
    window.url = "http://localhost:5000/api/v1/";
  // window.url ="http://3.110.189.2:5000/api/v1/"
    // window.url = '/api/';
    
   
root.render(
  <React.StrictMode>
      {/* <Provider> */}
    <App />
    {/* </Provider> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
