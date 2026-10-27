import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// In AI Studio iFrame and Cloud Run preview, HMR WebSocket is disabled.
// Ignore benign Vite client WebSocket closed notifications.
window.addEventListener('error', (event) => {
  const str = `${event.message || ''} ${event.filename || ''} ${event.error?.message || ''} ${event.error?.stack || ''}`;
  if (
    str.includes('WebSocket') ||
    str.includes('ws') ||
    str.includes('@vite/client') ||
    str.includes('closed without opened')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = `${event.reason?.message || ''} ${event.reason?.stack || ''} ${String(event.reason || '')}`;
  if (
    reasonStr.includes('WebSocket') ||
    reasonStr.includes('ws') ||
    reasonStr.includes('@vite/client') ||
    reasonStr.includes('closed without opened')
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
