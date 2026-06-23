import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store } from './store';
import './index.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><Provider store={store}><HelmetProvider><App /><Toaster position="top-center" /></HelmetProvider></Provider></React.StrictMode>);
