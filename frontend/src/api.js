import axios from 'axios';

const BASE = 'http://localhost:8000';

export const predict = (data) => axios.post(`${BASE}/predict`, data);
export const getMetrics = ()     => axios.get(`${BASE}/metrics`);
export const getPreds   = ()     => axios.get(`${BASE}/predictions`);
export const checkDrift = ()     => axios.get(`${BASE}/check-drift`);
export const retrain    = ()     => axios.post(`${BASE}/retrain`);