import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from './CreateClient';
import './App.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ScatterChart, Scatter, CartesianGrid, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

const COLORS = ['#1976d2', '#64b5f6', '#ff7043', '#43a047', '#fbc02d', '#8e24aa'];

function parseShift(shift_id) {
  const match = shift_id.match(/^(\d{4}-\d{2}-\d{2})([A-Z])$/);
  if (match) {
    return { date: match[1], shift: match[2] };
  }
  return { date: shift_id, shift: '' };
}

function Production() {
  const [allData, setAllData] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchProduction();
    const subscription = supabase
      .channel('public:Production')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Production' }, fetchProduction)
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchProduction() {
    const { data, error } = await supabase.from('Production').select('*');
    if (!error) setAllData(data);
  }

  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return allData;
    return allData.filter(row => {
      const { date } = parseShift(row.shift_id);
      return date >= startDate && date <= endDate;
    });
  }, [allData, startDate, endDate]);

  const chartData = filteredData.map(row => {
    const { date, shift } = parseShift(row.shift_id);
    return { ...row, date, shift };
  });

  const pieData = ['A', 'B', 'C'].map(shift => ({
    name: shift,
    value: chartData.filter(d => d.shift === shift).reduce((sum, d) => sum + Number(d.amount), 0)
  })).filter(d => d.value > 0);

  return (
    <div className="production-container">
      <header className="production-header">
        <h1>Production Dashboard</h1>
        <div className="date-filter-container">
          <div className="date-input-group">
            <label htmlFor="start-date">From</label>
            <input
              type="date"
              id="start-date"
              className="date-input"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="end-date">To</label>
            <input
              type="date"
              id="end-date"
              className="date-input"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </header>
      <div className="charts-grid">
        <div className="chart-card large-chart chart-animate">
          <h5 className="chart-title">Production Amount (Histogram)</h5>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shift_id" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card chart-animate">
          <h5 className="chart-title">Total by Shift (Pie)</h5>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%" label>
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card chart-animate">
          <h5 className="chart-title">Production Trend (Line)</h5>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" type="category" name="Date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card chart-animate">
          <h5 className="chart-title">Production Trend (Scatter)</h5>
          <ResponsiveContainer width="100%" height="90%">
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="date" type="category" name="Date" tick={{ fontSize: 12 }} />
              <YAxis dataKey="amount" type="number" name="Amount" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Production" data={chartData} fill="#ff7043" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Production;
