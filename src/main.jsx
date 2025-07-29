import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Setup crypto for the application
const crypto = window.crypto || globalThis.crypto;

// Make crypto available globally for the app
window.appCrypto = crypto;

// Example crypto utility function
const generateRandomBytes = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return array;
};

// Make utility available globally
window.generateRandomBytes = generateRandomBytes;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)