import { useState } from 'react';
import { predict } from '../api';

// const VOICE_DEFAULTS = {
//   MDVP_Fo: 119.992, MDVP_Fhi: 157.302, MDVP_Flo: 74.997,
//   MDVP_Jitter: 0.00784, MDVP_Jitter1: 0.00007, MDVP_RAP: 0.00370,
//   MDVP_PPQ: 0.00554, Jitter_DDP: 0.01109, MDVP_Shimmer: 0.04374,
//   MDVP_Shimmer1: 0.426, Shimmer_APQ3: 0.02182, Shimmer_APQ5: 0.03130,
//   MDVP_APQ: 0.02971, Shimmer_DDA: 0.06545, NHR: 0.02211,
//   HNR: 21.033, RPDE: 0.414783, DFA: 0.815285,
//   spread1: -4.813031, spread2: 0.266482, D2: 2.301442, PPE: 0.284654
// };

const VOICE_DEFAULTS = {
  MDVP_Fo:       181.937771,
  MDVP_Fhi:      223.636750,
  MDVP_Flo:      145.207292,
  MDVP_Jitter:   0.003866,
  MDVP_Jitter1:  0.003866,
  MDVP_RAP:      0.001925,
  MDVP_PPQ:      0.002056,
  Jitter_DDP:    0.005776,
  MDVP_Shimmer:  0.017615,
  MDVP_Shimmer1: 0.017615,
  Shimmer_APQ3:  0.009504,
  Shimmer_APQ5:  0.010509,
  MDVP_APQ:      0.013305,
  Shimmer_DDA:   0.028511,
  NHR:           0.011483,
  HNR:           24.678750,
  RPDE:          0.442552,
  DFA:           0.695716,
  spread1:       -6.759264,
  spread2:       0.160292,
  D2:            2.154491,
  PPE:           0.123017
};
export default function Predict() {
  const [patientName, setPatientName] = useState('');
  const [patientId,   setPatientId]   = useState('');
  const [form,        setForm]        = useState(VOICE_DEFAULTS);
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);

  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: parseFloat(v) }));

  const handlePredict = async () => {
    setLoading(true);
    const payload = {
      patient_name: patientName || 'Unknown',
      patient_id:   patientId   || 'P000',
      ...form
    };
    const res = await predict(payload);
    setResult(res.data);
    setLoading(false);
  };

  return (
    <div>
      <p className="page-title">Parkinson's Detection</p>
      <div className="predict-box">
        <h4>Enter Patient Voice Measurements</h4>

        {/* Patient Info — separate from voice fields */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
          <div>
            <label style={{ fontSize:11, color:'#6b7280' }}>Patient Name</label>
            <input
              type="text"
              placeholder="e.g. Ahmed Khan"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              style={{
                width:'100%', background:'#0f1117', border:'1px solid #2a2d3e',
                borderRadius:6, color:'#e0e0e0', padding:'6px 10px', fontSize:13
              }}
            />
          </div>
          <div>
            <label style={{ fontSize:11, color:'#6b7280' }}>Patient ID</label>
            <input
              type="text"
              placeholder="e.g. P001"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              style={{
                width:'100%', background:'#0f1117', border:'1px solid #2a2d3e',
                borderRadius:6, color:'#e0e0e0', padding:'6px 10px', fontSize:13
              }}
            />
          </div>
        </div>

        {/* Voice measurement fields only */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
          {Object.entries(form).map(([key, val]) => (
            <div key={key}>
              <label style={{ fontSize:11, color:'#6b7280' }}>{key}</label>
              <input
                type="number" step="any"
                value={val}
                onChange={e => handleChange(key, e.target.value)}
                style={{
                  width:'100%', background:'#0f1117', border:'1px solid #2a2d3e',
                  borderRadius:6, color:'#e0e0e0', padding:'6px 10px', fontSize:13
                }}
              />
            </div>
          ))}
        </div>

        <button type="button" onClick={handlePredict} disabled={loading} style={{ marginTop:20 }}>
          {loading ? 'Analyzing...' : '🧠 Analyze Patient'}
        </button>

        {result && (
          <div className={`result ${result.prediction === 'healthy' ? 'positive' : 'negative'}`}>
            {result.prediction === 'healthy' ? '✅ Healthy' : "⚠️ Parkinson's Detected"}
            &nbsp;· Confidence: {(result.confidence * 100).toFixed(1)}%
            &nbsp;· {result.risk_level}
          </div>
        )}
      </div>
    </div>
  );
}