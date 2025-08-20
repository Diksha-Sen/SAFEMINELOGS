import React from 'react';
import { BrowserRouter, Route, Routes, NavLink } from 'react-router-dom';
import Workers from './Workers';
import Supervisors from './Supervisors';
import CurrentWorkers from './currentworkers';
import './App.css';
import Production from './Production';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Animated floating background */}
        <div className="animated-bg">
          <div className="floating-shape floating-shape1"></div>
          <div className="floating-shape floating-shape2"></div>
          <div className="floating-shape floating-shape3"></div>
        </div>
        <nav>
           <img
            src="src/LOGO.png"
            alt="SupaCoal Logo"
            className="nav-logo"
            style={{ height: '60px', width: '60px', objectFit: 'contain', marginRight: '16px', verticalAlign: 'middle' }}
          />
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/workers" className={({ isActive }) => isActive ? 'active' : ''}>
                Workers
              </NavLink>
            </li>
            <li>
              <NavLink to="/Supervisors" className={({ isActive }) => isActive ? 'active' : ''}>
                Supervisors
              </NavLink>
            </li>
            <li>
              <NavLink to="/currentworkers" className={({ isActive }) => isActive ? 'active' : ''}>
                Current Workers
              </NavLink>
            </li>
            <li>
              <NavLink to="/Production" className={({ isActive }) => isActive ? 'active' : ''}>
                Production
              </NavLink>
            </li>
          </ul>
        </nav>
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <div style={{ width: '100%' }}>
                  <div className="home-card">
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                      <img
                        src="src/LOGO.png"
                        alt="Main Page Image"
                      />
                    </div>
                    <div className="home-divider"></div>
                    <div className="home-welcome">
                      <h1>Welcome to the main page!</h1>
                    </div>
                  </div>
                </div>
              }
            />
            <Route
              path="/workers"
              element={
                <div className="page-bg-workers" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Workers />
                </div>
              }
            />
            <Route
              path="/Supervisors"
              element={
                <div className="page-bg-supervisors" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Supervisors />
                </div>
              }
            />
            <Route
              path="/currentworkers"
              element={
                <div className="page-bg-currentworkers" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CurrentWorkers />
                </div>
              }
            />
            <Route
              path="/Production"
              element={
                <div className="page-bg-production" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Production />
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
