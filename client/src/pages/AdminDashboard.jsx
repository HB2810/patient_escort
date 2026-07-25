import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { socket, lastNotification } = useSocket();
  
  const [trips, setTrips] = useState([]);
  const [cabins, setCabins] = useState([]);
  const [escorts, setEscorts] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const fetchData = async () => {
    try {
      const [tripsRes, cabinsRes, escortsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/trips'),
        axios.get('http://localhost:5001/api/cabins'),
        axios.get('http://localhost:5001/api/users/escorts')
      ]);
      setTrips(tripsRes.data.data);
      setCabins(cabinsRes.data.data);
      setEscorts(escortsRes.data.data);
    } catch (e) {
      console.error('Error fetching admin data', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('trip:created', fetchData);
    socket.on('trip:updated', fetchData);
    socket.on('escort:status_changed', fetchData);
    return () => {
      socket.off('trip:created', fetchData);
      socket.off('trip:updated', fetchData);
      socket.off('escort:status_changed', fetchData);
    };
  }, [socket]);

  const handleEscortStatusChange = async (escortId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5001/api/users/escorts/${escortId}/status`, { status: newStatus });
      fetchData();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const filteredTrips = trips.filter(t => filter === 'ALL' || t.status === filter);

  // Calculate Overdue Blockers
  const overdueTrips = trips.filter(t => {
    const elapsedMins = Math.floor((Date.now() - new Date(t.requested_at).getTime()) / 60000);
    return (t.status === 'ASSIGNED' && elapsedMins > 5) || (t.status === 'HANDOVER_PENDING' && elapsedMins > 3);
  });

  return (
    <div style={{ background: '#F4F7FB', minHeight: 'calc(100vh - 60px)', padding: '2rem 0' }}>
      <div className="container-fluid px-4">
        
        {lastNotification && (
          <div className="alert alert-info shadow-sm mb-4">
            ⚡ <strong>Realtime Alert:</strong> {lastNotification}
          </div>
        )}

        {/* Top Command Bar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold" style={{ color: '#1B6CA8' }}>Hospital Admin Command Center</h2>
            <p className="text-secondary mb-0">Real-time Patient Flow, Fleet Monitoring, & Overdue Delay Blockers</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-white text-dark border px-3 py-2">Logged as: <strong>{user?.name}</strong></span>
            <button onClick={logout} className="btn btn-outline-danger btn-sm px-3">Logout</button>
          </div>
        </div>

        {/* KPI Cards & Delay Blockers */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3" style={{ borderLeft: '4px solid #1B6CA8' }}>
              <small className="text-muted fw-bold">TOTAL TRIPS TODAY</small>
              <h2 className="fw-bold mt-1 text-dark">{trips.length}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3" style={{ borderLeft: '4px solid #198754' }}>
              <small className="text-muted fw-bold">AVAILABLE ESCORTS</small>
              <h2 className="fw-bold mt-1 text-success">{escorts.filter(e => e.status === 'AVAILABLE').length} / {escorts.length}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3" style={{ borderLeft: '4px solid #ffc107' }}>
              <small className="text-muted fw-bold">AVG PICKUP TAT</small>
              <h2 className="fw-bold mt-1 text-warning">4.2 min</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3" style={{ borderLeft: '4px solid #dc3545', backgroundColor: overdueTrips.length > 0 ? '#FFF5F5' : '#FFF' }}>
              <small className="text-danger fw-bold">🚨 OVERDUE DELAY BLOCKERS</small>
              <h2 className="fw-bold mt-1 text-danger">{overdueTrips.length} Alerts</h2>
            </div>
          </div>
        </div>

        {/* Main Trip Table */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
              <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold text-dark mb-0">Live Patient Movement & Handover Board</h5>
                <div className="btn-group btn-group-sm">
                  {['ALL', 'ASSIGNED', 'HANDOVER_PENDING', 'HANDOVER_ACCEPTED', 'PROCEDURE_COMPLETE'].map(st => (
                    <button key={st} onClick={() => setFilter(st)} className={`btn ${filter === st ? 'btn-primary' : 'btn-outline-secondary'}`}>
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-body p-4">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Trip ID</th>
                        <th>Patient Name</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Assigned OPD Escort</th>
                        <th>Status</th>
                        <th>Overdue Alert</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrips.map(trip => {
                        const elapsedMins = Math.floor((Date.now() - new Date(trip.requested_at).getTime()) / 60000);
                        const isOverdue = (trip.status === 'ASSIGNED' && elapsedMins > 5) || (trip.status === 'HANDOVER_PENDING' && elapsedMins > 3);

                        return (
                          <tr key={trip.id} className={isOverdue ? 'table-danger' : ''}>
                            <td className="fw-bold">
                              #{trip.id}
                              {trip.is_privileged && <span className="badge bg-warning text-dark ms-1">👑</span>}
                            </td>
                            <td>
                              <div className="fw-bold text-dark">{trip.patient_name}</div>
                              <small className="text-muted">{trip.patient_uhid}</small>
                            </td>
                            <td>Cabin {trip.origin_cabin_id}</td>
                            <td>{trip.dest_dept} ({trip.dest_room})</td>
                            <td>
                              <span className="badge bg-light text-dark border">👤 {trip.opd_escort_name}</span>
                            </td>
                            <td>
                              <span className={`badge ${trip.status === 'HANDOVER_ACCEPTED' ? 'bg-success' : trip.status === 'HANDOVER_PENDING' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                                {trip.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              {isOverdue ? (
                                <span className="badge bg-danger text-white px-2 py-1 fw-bold">🚨 BLOCKER DELAY ({elapsedMins}m)</span>
                              ) : (
                                <span className="text-muted small">⏱️ {elapsedMins}m elapsed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Roster & Cabin Matrix */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5 className="fw-bold text-dark mb-0">Escort Fleet Roster (by Team)</h5>
              </div>
              <div className="card-body p-4">
                <div className="list-group list-group-flush">
                  {escorts.map(escort => (
                    <div key={escort.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <div>
                        <div className="fw-bold">{escort.name}</div>
                        <small className="text-muted">Team: <strong>{escort.department}</strong></small>
                      </div>
                      <select 
                        value={escort.status} 
                        onChange={(e) => handleEscortStatusChange(escort.id, e.target.value)}
                        className={`form-select form-select-sm w-auto ${escort.status === 'AVAILABLE' ? 'border-success text-success' : 'border-warning'}`}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="ON_BREAK">ON BREAK</option>
                        <option value="BUSY">BUSY</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cabins Status Summary */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
              <div className="card-header bg-white border-0 pt-4 px-4">
                <h5 className="fw-bold text-dark mb-0">OPD Cabins (13 Normal + 2 Privileged)</h5>
              </div>
              <div className="card-body p-4">
                <div className="row g-2">
                  {cabins.map(cabin => (
                    <div className="col-4" key={cabin.id}>
                      <div className={`p-2 text-center border rounded ${cabin.is_privileged ? 'border-warning bg-warning bg-opacity-10' : cabin.status === 'BUSY' ? 'bg-danger text-white' : 'bg-light text-dark'}`}>
                        <small className="d-block fw-bold">{cabin.is_privileged ? `👑 C${cabin.id}` : `C${cabin.id}`}</small>
                        <small style={{ fontSize: '0.65rem' }}>{cabin.status}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
