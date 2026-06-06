import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AppToaster } from '@/components/theme/AppToaster';
import { store } from '@/app/store';
import App from '@/App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <Provider store={store}>
          <BrowserRouter>
            <App />
            <AppToaster />
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
