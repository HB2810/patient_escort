import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const OPDBoard = () => {
  const { user, logout } = useAuth();
  const { socket, lastNotification } = useSocket();

  const [cabins, setCabins] = useState([]);
  const [activeTrips, setActiveTrips] = useState([]);
  const [selectedCabin, setSelectedCabin] = useState(null);
  
  // Form State
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('');
  const [destDept, setDestDept] = useState('Radiology');
  const [destRoom, setDestRoom] = useState('MRI Room 1');
  const [mode, setMode] = useState('WHEELCHAIR');
  const [priority, setPriority] = useState('NORMAL');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [cabinsRes, tripsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/cabins'),
        axios.get('http://localhost:5001/api/trips')
      ]);
      setCabins(cabinsRes.data.data);
      setActiveTrips(tripsRes.data.data.filter(t => t.status !== 'PROCEDURE_COMPLETE'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('trip:created', fetchData);
    socket.on('trip:updated', fetchData);
    return () => {
      socket.off('trip:created', fetchData);
      socket.off('trip:updated', fetchData);
    };
  }, [socket]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedCabin) return alert('Select an OPD cabin first!');
    
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5001/api/trips', {
        patient_name: patientName || 'OPD Patient',
        patient_uhid: uhid || `STV-2026-${Math.floor(1000 + Math.random()*9000)}`,
        origin_dept: 'OPD',
        origin_cabin_id: selectedCabin,
        dest_dept: destDept,
        dest_room: destRoom,
        mode: mode,
        priority: selectedCabin >= 14 ? 'HIGH_PRIVILEGED' : priority
      });
      
      setSelectedCabin(null);
      setPatientName('');
      setUhid('');
      fetchData();
      alert(`OPD Escort Dispatched for Cabin ${selectedCabin}!`);
    } catch (err) {
      alert('Failed to dispatch escort');
    } finally {
      setSubmitting(false);
    }
  };

  const normalCabins = Array.from({ length: 13 }, (_, i) => i + 1);
  const privilegedCabins = [14, 15];

  return (
    <div style={{ background: '#F4F7FB', minHeight: 'calc(100vh - 60px)', padding: '2rem 0' }}>
      <div className="container">
        
        {lastNotification && (
          <div className="alert alert-info shadow-sm mb-4">
            ⚡ <strong>Live Notification:</strong> {lastNotification}
          </div>
        )}

        {/* Top Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold" style={{ color: '#1B6CA8' }}>🩺 Spine Consultant Interactive Panel</h2>
            <p className="text-secondary mb-0">Assign OPD Escort from OPD Rooms to Radiology, Physiotherapy, or Admission.</p>
          </div>
          <button onClick={logout} className="btn btn-outline-danger px-4">Logout</button>
        </div>

        <div className="row g-4">
          {/* Cabins Selection (13 Normal + 2 Privileged) */}
          <div className="col-lg-7">
            
            {/* 👑 2 Privileged OPD Cabins */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px', borderLeft: '5px solid #FFD700', backgroundColor: '#FFFDF0' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark">👑 Privileged OPD Cabins (Cabins 14 & 15)</h5>
                <span className="badge bg-warning text-dark px-3 py-2 fw-bold">HIGH PRIORITY ROUTING</span>
              </div>
              <div className="row g-3">
                {privilegedCabins.map(num => {
                  const activeTrip = activeTrips.find(t => t.origin_cabin_id === num);
                  const isSelected = selectedCabin === num;
                  
                  return (
                    <div className="col-6" key={num}>
                      <button
                        onClick={() => setSelectedCabin(num)}
                        className={`btn w-100 py-3 text-center border ${isSelected ? 'btn-warning text-dark fw-bold shadow' : activeTrip ? 'btn-danger text-white' : 'btn-white border-warning'}`}
                        style={{ borderRadius: '12px' }}
                      >
                        <h4 className="fw-bold mb-0">👑 Cabin {num}</h4>
                        <small className="d-block text-uppercase fw-semibold mt-1" style={{ fontSize: '0.7rem' }}>
                          {activeTrip ? activeTrip.status.replace('_', ' ') : 'AVAILABLE'}
                        </small>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 📋 13 Normal OPD Cabins */}
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px' }}>
              <h5 className="fw-bold mb-3">📋 Normal OPD Cabins (Cabins 1 to 13)</h5>
              <div className="row g-3">
                {normalCabins.map(num => {
                  const activeTrip = activeTrips.find(t => t.origin_cabin_id === num);
                  const isSelected = selectedCabin === num;
                  
                  return (
                    <div className="col-4 col-md-3" key={num}>
                      <button
                        onClick={() => setSelectedCabin(num)}
                        className={`btn w-100 py-3 text-center border ${isSelected ? 'btn-primary shadow' : activeTrip ? 'btn-warning text-dark' : 'btn-light'}`}
                        style={{ borderRadius: '12px' }}
                      >
                        <h4 className="fw-bold mb-0">{num}</h4>
                        <small className="d-block text-uppercase" style={{ fontSize: '0.65rem' }}>
                          {activeTrip ? activeTrip.status.replace('_', ' ') : 'AVAILABLE'}
                        </small>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Consultant Dispatch Form */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
              <h5 className="fw-bold mb-3">
                {selectedCabin ? `Assign Escort from ${selectedCabin >= 14 ? '👑 Privileged' : ''} Cabin ${selectedCabin}` : 'Select a Cabin'}
              </h5>

              {selectedCabin ? (
                <form onSubmit={handleCreateRequest}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Patient Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Ramesh Bhai" 
                      value={patientName} 
                      onChange={e => setPatientName(e.target.value)} 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">UHID / Reg No.</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. STV-2026-991" 
                      value={uhid} 
                      onChange={e => setUhid(e.target.value)} 
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-secondary">Target Department</label>
                      <select className="form-select" value={destDept} onChange={e => {
                        setDestDept(e.target.value);
                        if (e.target.value === 'Radiology') setDestRoom('MRI Room 1');
                        if (e.target.value === 'Physiotherapy') setDestRoom('Rehab Gym 2');
                        if (e.target.value === 'Admission') setDestRoom('Ward Desk');
                      }}>
                        <option value="Radiology">Radiology</option>
                        <option value="Physiotherapy">Physiotherapy</option>
                        <option value="Admission">Admission</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-secondary">Target Room</label>
                      <input type="text" className="form-control" value={destRoom} onChange={e => setDestRoom(e.target.value)} />
                    </div>
                  </div>

                  <div className="row g-2 mb-4">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-secondary">Transfer Mode</label>
                      <select className="form-select" value={mode} onChange={e => setMode(e.target.value)}>
                        <option value="WHEELCHAIR">Wheelchair</option>
                        <option value="STRETCHER">Stretcher</option>
                        <option value="WALKING">Walking Escort</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-secondary">Priority</label>
                      <select 
                        className="form-select" 
                        value={selectedCabin >= 14 ? 'HIGH_PRIVILEGED' : priority} 
                        disabled={selectedCabin >= 14} 
                        onChange={e => setPriority(e.target.value)}
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="URGENT">Urgent (STAT)</option>
                        <option value="HIGH_PRIVILEGED">👑 Privileged STAT</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className="btn btn-primary w-100 py-3 fw-bold shadow-sm" style={{ backgroundColor: '#1B6CA8' }}>
                    {submitting ? 'Dispatching...' : '🚀 Assign OPD Escort Now'}
                  </button>
                </form>
              ) : (
                <div className="text-center text-muted py-5">
                  <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>👈</div>
                  <p className="mt-2">Click any Cabin card on the left<br/>to start a transfer request.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OPDBoard;
