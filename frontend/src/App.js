import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Predict   from './pages/Predict';
import Logs      from './pages/Logs';

export default function App() {
  const [page, setPage] = useState('dashboard');

  const pages = {
    dashboard: <Dashboard />,
    predict:   <Predict />,
    logs:      <Logs />,
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h2>🧠 MLOps FYP</h2>
        {[['dashboard','📊 Dashboard'], ['predict','🔍 Predict'], ['logs','📋 Logs']].map(([key, label]) => (
          <button key={key} className={page === key ? 'active' : ''} onClick={() => setPage(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="main">{pages[page]}</div>
    </div>
  );
}