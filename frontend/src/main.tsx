// src/main.tsx
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </AuthProvider>
);
