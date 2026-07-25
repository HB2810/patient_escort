import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

const PhysioBoard = () => {
  const { user, logout } = useAuth();
  const { socket, lastNotification } = useSocket();

  const [trips, setTrips] = useState([]);
  const [modalities, setModalities] = useState([
    { id: 1, name: 'Spine Traction Unit 1', status: 'AVAILABLE', patient: null },
    { id: 2, name: 'Gait Training Track', status: 'OCCUPIED', patient: 'Priya Verma' },
    { id: 3, name: 'Electrotherapy Bay 3', status: 'AVAILABLE', patient: null },
    { id: 4, name: 'Post-Op Rehab Bed 4', status: 'AVAILABLE', patient: null }
  ]);

  const fetchTrips = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/trips');
      setTrips(res.data.data.filter(t => t.dest_dept === 'Physiotherapy'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('trip:created', fetchTrips);
    socket.on('trip:updated', fetchTrips);
    return () => {
      socket.off('trip:created', fetchTrips);
      socket.off('trip:updated', fetchTrips);
    };
  }, [socket]);

  const updateStatus = async (tripId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5001/api/trips/${tripId}/status`, { status: newStatus });
      fetchTrips();
    } catch (e) {
      alert('Failed to update trip status');
    }
  };

  return (
    <div style={{ background: '#F4F7FB', minHeight: 'calc(100vh - 60px)', padding: '2rem 0' }}>
      <div className="container">
        
        {lastNotification && (
          <div className="alert alert-info shadow-sm mb-4">
            ⚡ <strong>Notification:</strong> {lastNotification}
          </div>
        )}

        {/* Top Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold" style={{ color: '#1B6CA8' }}>🏋️ Physiotherapy Department Dashboard</h2>
            <p className="text-secondary mb-0">Manage rehab Gym modalities, receive OPD Escort handovers, & dispatch return escorts.</p>
          </div>
          <button onClick={logout} className="btn btn-outline-danger px-4">Logout</button>
        </div>

        {/* Rehab Modalities Grid */}
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
          <h5 className="fw-bold mb-3">Rehab Modalities & Therapy Bays</h5>
          <div className="row g-3">
            {modalities.map(m => (
              <div className="col-md-3" key={m.id}>
                <div className={`p-3 rounded border text-center ${m.status === 'OCCUPIED' ? 'bg-warning bg-opacity-10 border-warning' : 'bg-light'}`}>
                  <h6 className="fw-bold text-dark mb-1">{m.name}</h6>
                  <span className={`badge ${m.status === 'OCCUPIED' ? 'bg-warning text-dark' : 'bg-success'}`}>
                    {m.status}
                  </span>
                  {m.patient && <small className="d-block mt-2 text-secondary fw-semibold">Patient: {m.patient}</small>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Handover & Therapy Queue */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '12px', backgroundColor: '#FFFFFF' }}>
          <h5 className="fw-bold mb-4">Incoming OPD Handovers & Active Therapy Queue</h5>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Trip ID</th>
                  <th>Patient Name</th>
                  <th>Origin OPD</th>
                  <th>Target Modality</th>
                  <th>OPD Escort (Handover)</th>
                  <th>Status</th>
                  <th>Overdue Blocker</th>
                  <th>Handover Action</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => {
                  const elapsedMins = Math.floor((Date.now() - new Date(trip.requested_at).getTime()) / 60000);
                  const isOverdueHandover = trip.status === 'HANDOVER_PENDING' && elapsedMins > 3;

                  return (
                    <tr key={trip.id} className={isOverdueHandover ? 'table-danger' : ''}>
                      <td className="fw-bold">
                        #{trip.id}
                        {trip.is_privileged && <span className="badge bg-warning text-dark ms-2">👑 Privileged</span>}
                      </td>
                      <td>
                        <div className="fw-bold">{trip.patient_name}</div>
                        <small className="text-muted">{trip.patient_uhid}</small>
                      </td>
                      <td>Cabin {trip.origin_cabin_id} ({trip.origin_dept})</td>
                      <td>{trip.dest_room}</td>
                      <td>👤 {trip.opd_escort_name}</td>
                      <td>
                        <span className={`badge ${trip.status === 'HANDOVER_ACCEPTED' ? 'bg-success' : trip.status === 'HANDOVER_PENDING' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                          {trip.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {isOverdueHandover ? (
                          <span className="badge bg-danger text-white px-2 py-1 fw-bold">🚨 HANDOVER OVERDUE ({elapsedMins}m)</span>
                        ) : (
                          <span className="text-success small fw-semibold">⏱️ {elapsedMins}m elapsed</span>
                        )}
                      </td>
                      <td>
                        {trip.status === 'HANDOVER_PENDING' && (
                          <button 
                            onClick={() => updateStatus(trip.id, 'HANDOVER_ACCEPTED')}
                            className="btn btn-sm btn-success fw-bold px-3 shadow-sm"
                          >
                            🤝 Accept Handover from OPD Escort
                          </button>
                        )}

                        {trip.status === 'HANDOVER_ACCEPTED' && (
                          <button 
                            onClick={() => updateStatus(trip.id, 'PROCEDURE_COMPLETE')}
                            className="btn btn-sm btn-primary fw-bold px-3 shadow-sm"
                            style={{ backgroundColor: '#1B6CA8' }}
                          >
                            🔄 Therapy Complete (Return Dispatch)
                          </button>
                        )}

                        {trip.status === 'PROCEDURE_COMPLETE' && (
                          <span className="badge bg-light text-secondary border">Return Trip Dispatched</span>
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
  );
};

export default PhysioBoard;
