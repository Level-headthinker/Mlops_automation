import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getMetrics, checkDrift, retrain } from '../api';

export default function Dashboard() {
  const [runs, setRuns]   = useState([]);
  const [drift, setDrift] = useState(null);
  const [msg, setMsg]     = useState('');

  useEffect(() => {
    getMetrics().then(r => setRuns(r.data.runs.reverse()));
    checkDrift().then(r => setDrift(r.data));
  }, []);

  const handleRetrain = () => {
    retrain().then(() => setMsg('✅ Retraining started!'));
    setTimeout(() => setMsg(''), 4000);
  };

  const latest = runs[runs.length - 1];

  return (
    <div>
      <p className="page-title">Dashboard</p>

      {/* Status Bar */}
      <div className="status-bar">
        <div className={`dot ${drift?.drift_detected ? 'red' : 'green'}`} />
        <span>{drift?.drift_detected ? '⚠️ Drift Detected' : '✅ Model Healthy'}</span>
        {drift?.recent_confidence && (
          <span style={{color:'#6b7280'}}>· Avg Confidence: {(drift.recent_confidence * 100).toFixed(1)}%</span>
        )}
        <button className="retrain-btn" onClick={handleRetrain}>🔄 Manual Retrain</button>
      </div>
      {msg && <p style={{color:'#4ade80', marginBottom:16}}>{msg}</p>}

      {/* Stat Cards */}
      <div className="cards">
        <div className="card">
          <label>Latest Accuracy</label>
          <h3>{latest ? (latest.accuracy * 100).toFixed(2) + '%' : '—'}</h3>
          <p>Random Forest</p>
        </div>
        <div className="card">
          <label>Latest F1 Score</label>
          <h3>{latest ? (latest.f1 * 100).toFixed(2) + '%' : '—'}</h3>
          <p>Weighted average</p>
        </div>
        <div className="card">
          <label>Total Runs</label>
          <h3>{runs.length}</h3>
          <p>Training experiments</p>
        </div>
        <div className="card">
          <label>Status</label>
          <h3 style={{fontSize:18, paddingTop:6}}>{drift?.drift_detected ? '🔴 Drift' : '🟢 Healthy'}</h3>
          <p>Live system status</p>
        </div>
      </div>

      {/* Accuracy Chart */}
      <div className="chart-box">
        <h4>Accuracy Over Training Runs</h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={runs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
            <XAxis dataKey="trained_at" tick={{fontSize:10, fill:'#6b7280'}}
              tickFormatter={v => v.slice(5,16)} />
            <YAxis domain={[0.8, 1]} tick={{fontSize:11, fill:'#6b7280'}} />
            <Tooltip contentStyle={{background:'#1a1d27', border:'1px solid #2a2d3e'}}
              formatter={v => (v * 100).toFixed(2) + '%'} />
            <Line type="monotone" dataKey="accuracy" stroke="#7c6af7" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Runs Table */}
      <div className="table-box">
        <h4>Training Run History</h4>
        <table>
          <thead>
            <tr><th>Run ID</th><th>Accuracy</th><th>F1 Score</th><th>Trained At</th></tr>
          </thead>
          <tbody>
            {runs.slice().reverse().map((r, i) => (
              <tr key={i}>
                <td style={{fontFamily:'monospace', fontSize:11}}>{r.run_id.slice(0,8)}...</td>
                <td>{(r.accuracy * 100).toFixed(2)}%</td>
                <td>{(r.f1 * 100).toFixed(2)}%</td>
                <td>{r.trained_at.slice(0,16)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}