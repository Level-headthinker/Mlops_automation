import { useEffect, useState } from 'react';
import { getPreds } from '../api';

export default function Logs() {
  const [preds, setPreds] = useState([]);

  useEffect(() => { getPreds().then(r => setPreds(r.data.predictions)); }, []);

  return (
    <div>
      <p className="page-title">Prediction Logs</p>
      <div className="table-box">
        <h4>Last 20 Predictions</h4>
        <table>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Prediction</th>
              <th>Confidence</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {preds.map((p, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'monospace' }}>{p.id}</td>
                <td>{p.name}</td>
                <td><span className={`badge ${p.prediction}`}>{p.prediction}</span></td>
                <td>{(p.confidence * 100).toFixed(1)}%</td>
                <td>{p.time.slice(0, 16)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}