import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App';
import { ClockProvider, StoreProvider } from './store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <ClockProvider>
        <App />
      </ClockProvider>
    </StoreProvider>
  </StrictMode>,
);
